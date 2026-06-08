import React, { useState, useEffect } from 'react';

function GrainOverlay() {
  const [isLowPower, setIsLowPower] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobileSize = window.innerWidth < 1024;
    const isLowCPU = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    return isMobileSize || isLowCPU;
  });

  useEffect(() => {
    const checkSpecs = () => {
      const isMobileSize = window.innerWidth < 1024;
      const isLowCPU = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      setIsLowPower(isMobileSize || isLowCPU);
    };
    window.addEventListener('resize', checkSpecs);
    return () => window.removeEventListener('resize', checkSpecs);
  }, []);

  if (isLowPower) return null;

  return (
    <div className="grain-overlay" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="grain-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              seed="1"
            >
              <animate
                attributeName="seed"
                from="0"
                to="100"
                dur="1s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <style>{`
        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .grain-overlay::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          filter: url(#grain-filter);
          opacity: 0.04;
          animation: grain-shift 0.8s steps(8) infinite;
        }

        @keyframes grain-shift {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, -1%); }
          30% { transform: translate(-1%, 2%); }
          40% { transform: translate(1%, -2%); }
          50% { transform: translate(-3%, 1%); }
          60% { transform: translate(2%, 3%); }
          70% { transform: translate(-2%, -1%); }
          80% { transform: translate(1%, 2%); }
          90% { transform: translate(-1%, -3%); }
        }
      `}</style>
    </div>
  );
}

export default GrainOverlay;
