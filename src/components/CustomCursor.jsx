import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

const TRAIL_COUNT = 4;
const INTERACTIVE_SELECTORS = '.action-btn, .nav-link, .portfolio-card, a, button';
const IMAGE_SELECTORS = '[data-cursor-view]';

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);
  const trailRefs = useRef([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const isTouch = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const rafId = useRef(null);
  const trailPositions = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 })));

  // Check for touch device
  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      isTouch.current = true;
      return;
    }

    setIsVisible(true);
    // Add cursor-none class to body
    document.body.classList.add('custom-cursor-active');

    return () => {
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  // Main cursor logic
  useEffect(() => {
    if (isTouch.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const text = textRef.current;
    if (!dot || !ring) return;

    let isHovering = false;
    let isImageHover = false;

    // Mouse move handler
    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Animate loop with requestAnimationFrame
    const animate = () => {
      const { x, y } = mousePos.current;

      // Dot follows instantly
      gsap.set(dot, { x, y });

      // Ring follows with elastic delay
      gsap.to(ring, {
        x,
        y,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });

      // Trail particles follow with increasing delay
      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        const delay = (i + 1) * 0.06;
        gsap.to(trail, {
          x,
          y,
          duration: 0.3 + delay,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    // Hover effects for interactive elements
    const onElementEnter = (e) => {
      isHovering = true;
      gsap.to(ring, {
        scale: 2.5,
        borderColor: 'rgba(197, 168, 98, 0.6)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(dot, {
        scale: 0.5,
        duration: 0.3,
        ease: 'power3.out',
      });
    };

    const onElementLeave = (e) => {
      isHovering = false;
      isImageHover = false;
      gsap.to(ring, {
        scale: 1,
        borderColor: 'rgba(197, 168, 98, 0.5)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(dot, {
        scale: 1,
        duration: 0.3,
        ease: 'power3.out',
      });
      if (text) {
        gsap.to(text, { opacity: 0, scale: 0.5, duration: 0.2 });
      }
    };

    // Image hover — show "عرض" text
    const onImageEnter = (e) => {
      isImageHover = true;
      gsap.to(ring, {
        scale: 3,
        borderColor: 'rgba(197, 168, 98, 0.8)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(dot, {
        scale: 0,
        duration: 0.2,
      });
      if (text) {
        gsap.to(text, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' });
      }
    };

    const onImageLeave = (e) => {
      isImageHover = false;
      gsap.to(ring, {
        scale: 1,
        borderColor: 'rgba(197, 168, 98, 0.5)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(dot, {
        scale: 1,
        duration: 0.3,
      });
      if (text) {
        gsap.to(text, { opacity: 0, scale: 0.5, duration: 0.2 });
      }
    };

    // Click effect
    const onMouseDown = () => {
      gsap.to(dot, {
        scale: 2.5,
        duration: 0.1,
        ease: 'power4.out',
      });
      gsap.to(ring, {
        scale: isHovering ? 2 : 0.8,
        duration: 0.15,
        ease: 'power4.out',
      });
    };

    const onMouseUp = () => {
      gsap.to(dot, {
        scale: isHovering ? 0.5 : 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.3)',
      });
      gsap.to(ring, {
        scale: isHovering ? 2.5 : 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    // Mouse enter/leave viewport
    const onMouseEnterViewport = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      trailRefs.current.forEach((trail) => {
        if (trail) gsap.to(trail, { opacity: parseFloat(trail.dataset.opacity), duration: 0.3 });
      });
    };

    const onMouseLeaveViewport = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
      trailRefs.current.forEach((trail) => {
        if (trail) gsap.to(trail, { opacity: 0, duration: 0.3 });
      });
    };

    // Bind events
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseenter', onMouseEnterViewport);
    document.addEventListener('mouseleave', onMouseLeaveViewport);

    // Delegate hover events via MutationObserver-friendly approach
    const bindHoverListeners = () => {
      document.querySelectorAll(INTERACTIVE_SELECTORS).forEach((el) => {
        el.addEventListener('mouseenter', onElementEnter);
        el.addEventListener('mouseleave', onElementLeave);
      });
      document.querySelectorAll(IMAGE_SELECTORS).forEach((el) => {
        el.addEventListener('mouseenter', onImageEnter);
        el.addEventListener('mouseleave', onImageLeave);
      });
    };

    // Initial bind + rebind on DOM changes
    bindHoverListeners();

    const observer = new MutationObserver(() => {
      bindHoverListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseenter', onMouseEnterViewport);
      document.removeEventListener('mouseleave', onMouseLeaveViewport);
      observer.disconnect();

      document.querySelectorAll(INTERACTIVE_SELECTORS).forEach((el) => {
        el.removeEventListener('mouseenter', onElementEnter);
        el.removeEventListener('mouseleave', onElementLeave);
      });
      document.querySelectorAll(IMAGE_SELECTORS).forEach((el) => {
        el.removeEventListener('mouseenter', onImageEnter);
        el.removeEventListener('mouseleave', onImageLeave);
      });
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="custom-cursor-wrapper" aria-hidden="true">
      {/* Trail dots */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
        const opacity = 0.3 - i * 0.07;
        const size = 6 - i * 1;
        return (
          <div
            key={`trail-${i}`}
            ref={(el) => (trailRefs.current[i] = el)}
            className="cursor-trail"
            data-opacity={opacity}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              background: '#c5a862',
              borderRadius: '50%',
              position: 'fixed',
              top: 0,
              left: 0,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 99997,
              filter: `blur(${i * 0.5}px)`,
            }}
          />
        );
      })}

      {/* Cursor dot */}
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          width: '8px',
          height: '8px',
          background: '#c5a862',
          borderRadius: '50%',
          position: 'fixed',
          top: 0,
          left: 0,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 99999,
          boxShadow: '0 0 10px rgba(197, 168, 98, 0.6), 0 0 20px rgba(197, 168, 98, 0.3)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Cursor ring */}
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          width: '40px',
          height: '40px',
          border: '1.5px solid rgba(197, 168, 98, 0.5)',
          borderRadius: '50%',
          position: 'fixed',
          top: 0,
          left: 0,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(1px)',
        }}
      >
        {/* View text for images */}
        <span
          ref={textRef}
          className="cursor-text"
          style={{
            fontFamily: 'var(--font-ar, "Tajawal", sans-serif)',
            fontSize: '10px',
            color: '#c5a862',
            fontWeight: 700,
            opacity: 0,
            transform: 'scale(0.5)',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          عرض
        </span>
      </div>
    </div>
  );
}

export default CustomCursor;
