import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

/**
 * TrafficChart renders the traffic duration chart.
 * Props: trendData (array of {date, duration})
 */
const TrafficChart = React.memo(({ trendData }) => {
  const [hovered, setHovered] = useState(null);

  const handleHover = () => audioManager.playHover();
  const handleClick = () => audioManager.playClick();

  const maxDur = Math.max(...trendData.map(d => d.duration), 10);
  const points = trendData.map((d, i) => {
    const x = 40 + i * (420 / 14);
    const y = 165 - (d.duration / maxDur) * 125;
    return { x, y, ...d, index: i };
  });

  const lineD = points.reduce((a, p, i) => a + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const fillD = lineD ? `${lineD} L ${points[points.length - 1].x} 165 L ${points[0].x} 165 Z` : '';

  return (
    <div className="traffic-container" style={{padding:'30px',borderRadius:'24px',position:'relative'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
        <ArrowUpRight size={20} color="var(--gold)" />
        <h3 style={{fontSize:'18px',color:'var(--text-light)',margin:0,fontWeight:700}}>
          مدة تصفح الصفحات (آخر 15 يوماً)
        </h3>
      </div>
      <div style={{position:'relative',height:'200px'}}>
        <svg viewBox="0 0 500 200" style={{width:'100%',height:'100%',overflow:'visible'}}>
          <defs>
            <linearGradient id="traffic-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <line x1="40" y1="165" x2="460" y2="165" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="123" x2="460" y2="123" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="40" y1="81" x2="460" y2="81" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="40" y1="40" x2="460" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          {fillD && <path d={fillD} fill="url(#traffic-gradient)" />}
          {lineD && <path d={lineD} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />}
          {points.map((p,i)=> (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered?.index===i?"6":"4"}
                fill="var(--bg-dark)"
                stroke="var(--gold)"
                strokeWidth="2"
                style={{cursor:'pointer',transition:'all 0.2s'}}
                onMouseEnter={()=>{handleHover();setHovered(p);}}
                onMouseLeave={()=>setHovered(null)}
              />
            </g>
          ))}
        </svg>
        {hovered && (
          <div style={{
            position:'absolute',
            top:`${hovered.y-45}px`,
            left:`calc(${(hovered.x-40)/4.2}% + 10px)`,
            background:'var(--bg-card)',
            border:'1px solid var(--gold)',
            borderRadius:'8px',
            padding:'4px 10px',
            fontSize:'11px',
            color:'var(--text-light)',
            pointerEvents:'none',
            zIndex:10,
            boxShadow:'0 4px 15px rgba(0,0,0,0.5)',
            whiteSpace:'nowrap',
            direction:'rtl'
          }}>
            <strong>{hovered.date}:</strong> {hovered.duration}s
          </div>
        )}
      </div>
    </div>
  );
});

export default TrafficChart;
