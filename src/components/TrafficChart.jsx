import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

/**
 * TrafficChart renders the daily traffic views trend chart.
 * Props: trendData (array of {date, count})
 */
const TrafficChart = React.memo(({ trendData }) => {
  const [hoveredTrafficPoint, setHoveredTrafficPoint] = useState(null);

  const handleHover = () => audioManager.playHover();

  if (!trendData || trendData.length === 0) {
    return (
      <div className="contact-container" style={{ padding: '30px', borderRadius: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        لا توجد بيانات حركة مرور متاحة.
      </div>
    );
  }

  const maxTrafficTrendVal = Math.max(...trendData.map(d => d.count), 4);
  const trafficPoints = trendData.map((d, i) => {
    const x = 40 + i * (420 / 14);
    const y = 165 - (d.count / maxTrafficTrendVal) * 125;
    return { x, y, ...d, index: i };
  });

  const trafficLineD = trafficPoints.reduce((acc, p, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const trafficFillD = trafficLineD ? `${trafficLineD} L ${trafficPoints[trafficPoints.length - 1].x} 165 L ${trafficPoints[0].x} 165 Z` : '';

  return (
    <div className="contact-container" style={{ padding: '30px', borderRadius: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TrendingUp size={20} color="var(--gold)" />
        <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
          معدل تصفح الصفحات اليومي (آخر 15 يوماً)
        </h3>
      </div>
      <div style={{ position: 'relative', height: '200px' }}>
        <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="traffic-chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1="40" y1="165" x2="460" y2="165" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="123" x2="460" y2="123" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="40" y1="81" x2="460" y2="81" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="40" y1="40" x2="460" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Line & Area */}
          {trafficFillD && <path d={trafficFillD} fill="url(#traffic-chart-gradient)" />}
          {trafficLineD && <path d={trafficLineD} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />}

          {/* Data Points */}
          {trafficPoints.map((p, i) => (
            <circle 
              key={i}
              cx={p.x} 
              cy={p.y} 
              r={hoveredTrafficPoint?.index === i ? 6 : 4} 
              fill="var(--bg-dark)" 
              stroke="#22c55e" 
              strokeWidth={2}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => { handleHover(); setHoveredTrafficPoint(p); }}
              onMouseLeave={() => setHoveredTrafficPoint(null)}
            />
          ))}

          {/* X Axis Labels */}
          <text x="40" y="188" fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontFamily="var(--font-ar)">
            {trendData[0]?.date}
          </text>
          <text x="250" y="188" fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontFamily="var(--font-ar)">
            {trendData[7]?.date}
          </text>
          <text x="460" y="188" fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontFamily="var(--font-ar)">
            {trendData[14]?.date}
          </text>
        </svg>

        {/* Simple HTML Tooltip */}
        {hoveredTrafficPoint && (
          <div style={{
            position: 'absolute',
            top: `${hoveredTrafficPoint.y - 45}px`,
            left: `calc(${(hoveredTrafficPoint.x - 40) / 4.2}% + 10px)`,
            background: 'var(--bg-card)',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '11px',
            color: 'var(--text-light)',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
            direction: 'rtl'
          }}>
            <strong>{hoveredTrafficPoint.date}:</strong> {hoveredTrafficPoint.count} زيارة
          </div>
        )}
      </div>
    </div>
  );
});

export default TrafficChart;
