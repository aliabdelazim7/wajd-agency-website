import React, { useEffect, useRef, useState } from 'react';

const ParticleCanvas = ({ activeSection }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, radius: 130 });
  const animationFrameRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // On-demand rendering states
    let lastActiveTime = Date.now() + 4500; // Keep active for 4.5 seconds on mount/transition
    let isLoopRunning = true;

    const triggerRender = (extraTime = 0) => {
      lastActiveTime = Math.max(lastActiveTime, Date.now() + extraTime);
      if (!isLoopRunning) {
        isLoopRunning = true;
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      triggerRender(2000); // Render for 2 seconds after resize
    };

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // 1px to 3px
        
        this.baseX = x;
        this.baseY = y;
        this.targetX = x;
        this.targetY = y;

        this.vx = 0;
        this.vy = 0;
        this.speed = 0.075; // Smooth morphing speed
        this.friction = 0.83;
        this.density = (Math.random() * 25) + 15; // Mouse push-back force
      }

      update(mouseX, mouseY, mouseRadius) {
        // Morphing force: pull towards target position
        const dxTarget = this.targetX - this.x;
        const dyTarget = this.targetY - this.y;
        
        this.vx += dxTarget * this.speed;
        this.vy += dyTarget * this.speed;

        // Mouse interaction (flee force)
        if (mouseX !== null && mouseY !== null) {
          const dxMouse = mouseX - this.x;
          const dyMouse = mouseY - this.y;
          const distance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distance < mouseRadius) {
            const force = (mouseRadius - distance) / mouseRadius;
            const directionX = dxMouse / distance;
            const directionY = dyMouse / distance;

            // Flee physics
            this.vx -= directionX * force * this.density;
            this.vy -= directionY * force * this.density;
          }
        }

        // Apply velocities
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        ctx.fillStyle = 'rgba(197, 168, 98, 0.75)'; // Wajd Gold
        // Draw square rects instead of circular paths for up to 15x faster browser rendering
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      }
    }

    // Generate shapes points
    const getShapePoints = (section, count, width, height) => {
      const points = [];
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < count; i++) {
        let x, y;

        if (section === 0) {
          // SECTION 0: Galaxy / Spiral (Home)
          const angle = i * 0.16;
          const radius = 6 + (i * 0.75);
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
          x += (Math.random() - 0.5) * 8;
          y += (Math.random() - 0.5) * 8;

        } else if (section === 1) {
          // SECTION 1: Soothing Target / Concentric Rings (Philosophy)
          const ringIndex = i % 3;
          const ringRadius = 70 + ringIndex * 50;
          const angle = (i / (count / 3)) * Math.PI * 2;
          x = centerX + Math.cos(angle) * ringRadius;
          y = centerY + Math.sin(angle) * ringRadius;

        } else if (section === 2) {
          // SECTION 2: Connected grid / Neural Network (Services)
          const clusters = [
            { cx: centerX - 220, cy: centerY - 100 },
            { cx: centerX + 220, cy: centerY - 100 },
            { cx: centerX - 180, cy: centerY + 130 },
            { cx: centerX + 180, cy: centerY + 130 },
          ];
          const cluster = clusters[i % clusters.length];
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 55;
          x = cluster.cx + Math.cos(angle) * dist;
          y = cluster.cy + Math.sin(angle) * dist;

        } else if (section === 3) {
          // SECTION 3: 3D Fibonacci Sphere (Portfolio/Case Studies)
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          const sphereRadius = 150;
          
          x = centerX + Math.cos(theta) * Math.sin(phi) * sphereRadius;
          y = centerY + Math.sin(theta) * Math.sin(phi) * sphereRadius;

        } else if (section === 4) {
          // SECTION 4: Exponential Growth Chart (ROI Simulator)
          const px = (i / count) * (width * 0.6) - (width * 0.3);
          const pct = (px + (width * 0.3)) / (width * 0.6);
          const py = -Math.pow(pct, 3.2) * 230 + 90;
          
          x = centerX + px;
          y = centerY + py;
          y += (Math.random() - 0.5) * 35;

        } else if (section === 5) {
          // SECTION 5: Contact (Pulsing Target / Inward Focus)
          const angle = (i / count) * Math.PI * 2;
          const radius = 180 * (0.3 + 0.7 * Math.sin(i * 0.15));
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        } else {
          x = Math.random() * width;
          y = Math.random() * height;
        }

        points.push({ x, y });
      }

      return points;
    };

    const initParticles = () => {
      const width = canvas.width;
      const height = canvas.height;
      const isMobile = width < 768;
      const particleCount = isMobile ? 80 : 250;
      const targetPoints = getShapePoints(activeSection, particleCount, width, height);

      if (particlesRef.current.length === 0) {
        const list = [];
        for (let i = 0; i < particleCount; i++) {
          const pt = targetPoints[i] || { x: Math.random() * width, y: Math.random() * height };
          list.push(new Particle(pt.x, pt.y));
        }
        particlesRef.current = list;
      } else if (particlesRef.current.length !== particleCount) {
        if (particlesRef.current.length < particleCount) {
          const list = [...particlesRef.current];
          for (let i = list.length; i < particleCount; i++) {
            const pt = targetPoints[i] || { x: Math.random() * width, y: Math.random() * height };
            list.push(new Particle(pt.x, pt.y));
          }
          particlesRef.current = list;
        } else {
          particlesRef.current = particlesRef.current.slice(0, particleCount);
        }
        
        particlesRef.current.forEach((p, idx) => {
          if (targetPoints[idx]) {
            p.targetX = targetPoints[idx].x;
            p.targetY = targetPoints[idx].y;
          }
        });
      } else {
        particlesRef.current.forEach((p, idx) => {
          if (targetPoints[idx]) {
            p.targetX = targetPoints[idx].x;
            p.targetY = targetPoints[idx].y;
          }
        });
      }
    };

    // Animation Loop
    const animate = () => {
      // Pause loop if no interaction has happened for over 1.5 seconds
      if (Date.now() - lastActiveTime > 1500) {
        isLoopRunning = false;
        animationFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      // Draw neural lines in Services section (2) - desktop only for performance
      if (activeSection === 2 && window.innerWidth >= 768) {
        ctx.strokeStyle = 'rgba(197, 168, 98, 0.08)';
        ctx.lineWidth = 0.5;
        const limitSq = 6400; // 80 * 80 (avoid Math.sqrt)
        for (let a = 0; a < particles.length; a++) {
          for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distSq = dx * dx + dy * dy;

            if (distSq < limitSq) {
              ctx.beginPath();
              ctx.moveTo(particles[a].x, particles[a].y);
              ctx.lineTo(particles[b].x, particles[b].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw faint wireframe rings in Portfolio section (3)
      if (activeSection === 3) {
        ctx.strokeStyle = 'rgba(197, 168, 98, 0.05)';
        ctx.lineWidth = 0.5;
        for (let a = 0; a < particles.length; a += 4) {
          const b = (a + 1) % particles.length;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }

      // Update and draw
      particles.forEach((p) => {
        p.update(mouse.x, mouse.y, mouse.radius);
        p.draw();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      triggerRender(100);
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
      triggerRender(500);
    };

    const handleScroll = () => {
      triggerRender(500); // keep animating during scroll
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    resizeCanvas();
    triggerRender(3500); // initial render window

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeSection, isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticleCanvas;
