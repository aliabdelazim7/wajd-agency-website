import React, { useEffect, useRef, useState } from 'react';

const TRAIL_COUNT = 4;
const INTERACTIVE_SELECTORS = '.action-btn, .nav-link, .portfolio-card, a, button';
const IMAGE_SELECTORS = '[data-cursor-view]';

function CustomCursor() {
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return true;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    const isMobileSize = window.innerWidth < 1024;
    return hasTouch || isMobileSize;
  });

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);
  const trailRefs = useRef([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);

  // Check for touch device
  useEffect(() => {
    if (isTouchDevice) return;

    // Add cursor-none class to body
    document.body.classList.add('custom-cursor-active');

    return () => {
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isTouchDevice]);

  // Main cursor logic
  useEffect(() => {
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const text = textRef.current;
    if (!dot || !ring) return;

    let isHovering = false;
    let isImageHover = false;

    let ringX = mousePos.current.x;
    let ringY = mousePos.current.y;
    let ringScale = 1;
    let targetRingScale = 1;
    let dotScale = 1;
    let targetDotScale = 1;

    // On-demand rendering parameters
    let lastActiveTime = Date.now() + 3000;
    let isLoopRunning = true;

    const triggerRender = (extraTime = 0) => {
      lastActiveTime = Math.max(lastActiveTime, Date.now() + extraTime);
      if (!isLoopRunning) {
        isLoopRunning = true;
        rafId.current = requestAnimationFrame(animate);
      }
    };

    // Mouse move handler
    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      triggerRender(100);
    };

    const trailPositions = Array.from({ length: TRAIL_COUNT }, () => ({ x: mousePos.current.x, y: mousePos.current.y }));

    // Animate loop with requestAnimationFrame
    const animate = () => {
      // Pause loop if mouse has been inactive for more than 1.5 seconds
      if (Date.now() - lastActiveTime > 1500) {
        isLoopRunning = false;
        rafId.current = null;
        return;
      }

      const { x: targetX, y: targetY } = mousePos.current;

      // Lerp scales
      ringScale += (targetRingScale - ringScale) * 0.15;
      dotScale += (targetDotScale - dotScale) * 0.15;

      // Dot follows instantly
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%) scale(${dotScale})`;

      // Ring follows with smooth delay
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;

      // Trail particles follow with increasing delay
      let prevX = ringX;
      let prevY = ringY;
      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        const pos = trailPositions[i];
        pos.x += (prevX - pos.x) * 0.22;
        pos.y += (prevY - pos.y) * 0.22;
        trail.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
        prevX = pos.x;
        prevY = pos.y;
      });

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    // Hover effects for interactive elements
    const onElementEnter = () => {
      isHovering = true;
      targetRingScale = 2.0;
      targetDotScale = 0.4;
      ring.style.borderColor = 'rgba(197, 168, 98, 0.7)';
      ring.style.backgroundColor = 'rgba(197, 168, 98, 0.05)';
      triggerRender(800);
    };

    const onElementLeave = () => {
      isHovering = false;
      isImageHover = false;
      targetRingScale = 1;
      targetDotScale = 1;
      ring.style.borderColor = 'rgba(197, 168, 98, 0.5)';
      ring.style.backgroundColor = 'transparent';
      if (text) {
        text.style.opacity = '0';
        text.style.transform = 'scale(0.5)';
      }
      triggerRender(800);
    };

    // Image hover — show "عرض" text
    const onImageEnter = () => {
      isImageHover = true;
      targetRingScale = 2.8;
      targetDotScale = 0;
      ring.style.borderColor = 'rgba(197, 168, 98, 0.9)';
      ring.style.backgroundColor = 'rgba(197, 168, 98, 0.1)';
      if (text) {
        text.style.opacity = '1';
        text.style.transform = 'scale(1)';
      }
      triggerRender(800);
    };

    const onImageLeave = () => {
      isImageHover = false;
      targetRingScale = 1;
      targetDotScale = 1;
      ring.style.borderColor = 'rgba(197, 168, 98, 0.5)';
      ring.style.backgroundColor = 'transparent';
      if (text) {
        text.style.opacity = '0';
        text.style.transform = 'scale(0.5)';
      }
      triggerRender(800);
    };

    // Click effect
    const onMouseDown = () => {
      targetDotScale = 2.0;
      targetRingScale = isHovering ? 1.6 : 0.7;
      triggerRender(500);
    };

    const onMouseUp = () => {
      targetDotScale = isHovering ? 0.4 : 1;
      targetRingScale = isHovering ? 2.0 : 1;
      triggerRender(800);
    };

    // Mouse enter/leave viewport
    const onMouseEnterViewport = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      trailRefs.current.forEach((trail) => {
        if (trail) trail.style.opacity = trail.dataset.opacity;
      });
      triggerRender(1500);
    };

    const onMouseLeaveViewport = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      trailRefs.current.forEach((trail) => {
        if (trail) trail.style.opacity = '0';
      });
      triggerRender(1500);
    };

    // Event Delegation: single listeners on window
    let currentHoveredInteractive = null;
    let currentHoveredImage = null;

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Interactive hover check
      const interactiveEl = target.closest(INTERACTIVE_SELECTORS);
      if (interactiveEl && interactiveEl !== currentHoveredInteractive) {
        currentHoveredInteractive = interactiveEl;
        onElementEnter();
      }

      // Image hover check
      const imageEl = target.closest(IMAGE_SELECTORS);
      if (imageEl && imageEl !== currentHoveredImage) {
        currentHoveredImage = imageEl;
        onImageEnter();
      }
    };

    const onMouseOut = (e) => {
      const target = e.target;
      const related = e.relatedTarget;

      if (currentHoveredInteractive && (!related || !related.closest(INTERACTIVE_SELECTORS) || related.closest(INTERACTIVE_SELECTORS) !== currentHoveredInteractive)) {
        currentHoveredInteractive = null;
        onElementLeave();
      }

      if (currentHoveredImage && (!related || !related.closest(IMAGE_SELECTORS) || related.closest(IMAGE_SELECTORS) !== currentHoveredImage)) {
        currentHoveredImage = null;
        onImageLeave();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);
    document.addEventListener('mouseenter', onMouseEnterViewport);
    document.addEventListener('mouseleave', onMouseLeaveViewport);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mouseenter', onMouseEnterViewport);
      document.removeEventListener('mouseleave', onMouseLeaveViewport);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div className="custom-cursor-wrapper" aria-hidden="true">
      {/* Trail dots */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
        const opacity = 0.25 - i * 0.06;
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
              filter: `blur(${i * 0.4}px)`,
              transition: 'opacity 0.2s ease',
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
          transition: 'opacity 0.2s ease',
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
          transition: 'border-color 0.25s ease, background-color 0.25s ease, opacity 0.2s ease',
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
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          عرض
        </span>
      </div>
    </div>
  );
}

export default CustomCursor;
