import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeDModel = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Geometry - Torus Knot (Very premium abstract shape)
    const geometry = new THREE.TorusKnotGeometry(1.4, 0.45, 120, 16);

    // Material - Liquid Gold Metallic Look
    const material = new THREE.MeshStandardMaterial({
      color: 0xc5a862, // Gold
      metalness: 0.95,
      roughness: 0.12,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Key Light (White, bright)
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    // Fill Light (Warm golden/orange glow from other side)
    const pointLight1 = new THREE.PointLight(0xffa500, 2, 50);
    pointLight1.position.set(-5, -3, 3);
    scene.add(pointLight1);

    // Rim Light (Neon violet highlight to add modern depth)
    const pointLight2 = new THREE.PointLight(0xaa3bff, 3, 50);
    pointLight2.position.set(0, 5, -2);
    scene.add(pointLight2);

    // Mouse interaction tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 2.5;
      targetY = y * 2.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate torus knot slowly
      mesh.rotation.y = elapsedTime * 0.25;
      mesh.rotation.x = elapsedTime * 0.15;

      // Smooth mouse interpolation (lerp)
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      mesh.rotation.y += currentX;
      mesh.rotation.x += currentY;

      // Animate lights to create glistening metallic reflections
      pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 6;
      pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 6;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'grab'
      }} 
    />
  );
};

export default ThreeDModel;
