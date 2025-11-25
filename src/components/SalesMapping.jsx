import React from 'react';
import './SalesMapping.css';

const SalesMapping = () => {
  const regions = [
    { name: 'North America', color: '#f59e0b', position: { top: '30%', left: '20%' } },
    { name: 'South America', color: '#ef4444', position: { top: '55%', left: '30%' } },
    { name: 'Europe', color: '#a855f7', position: { top: '25%', left: '50%' } },
    { name: 'Africa', color: '#10b981', position: { top: '45%', left: '52%' } },
    { name: 'Asia', color: '#06b6d4', position: { top: '35%', left: '70%' } },
  ];

  return (
    <div className="sales-mapping">
      <div className="chart-header">
        <h3>Sales Mapping by Country</h3>
      </div>

      <div className="world-map">
        <svg viewBox="0 0 100 50" className="map-svg">
          {/* Simplified world map representation */}
          <ellipse cx="20" cy="20" rx="8" ry="6" fill="#fef3c7" opacity="0.6" />
          <ellipse cx="30" cy="35" rx="6" ry="9" fill="#fee2e2" opacity="0.6" />
          <ellipse cx="50" cy="18" rx="7" ry="5" fill="#f3e8ff" opacity="0.6" />
          <ellipse cx="52" cy="30" rx="6" ry="7" fill="#d1fae5" opacity="0.6" />
          <ellipse cx="70" cy="22" rx="10" ry="8" fill="#cffafe" opacity="0.6" />
          <ellipse cx="85" cy="32" rx="5" ry="6" fill="#e0e7ff" opacity="0.6" />
        </svg>

        {regions.map((region, index) => (
          <div
            key={index}
            className="region-marker"
            style={{
              top: region.position.top,
              left: region.position.left,
              backgroundColor: region.color,
            }}
          >
            <div className="marker-pulse" style={{ backgroundColor: region.color }}></div>
          </div>
        ))}
      </div>

      <div className="regions-legend">
        {regions.map((region, index) => (
          <div key={index} className="region-item">
            <span className="region-dot" style={{ backgroundColor: region.color }}></span>
            <span className="region-name">{region.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesMapping;
