import React from 'react';
import './VolumeServiceLevel.css';

const VolumeServiceLevel = () => {
  const data = [
    { label: 'Mon', volume: 85, service: 75 },
    { label: 'Tue', volume: 90, service: 80 },
    { label: 'Wed', volume: 75, service: 85 },
    { label: 'Thu', volume: 95, service: 78 },
    { label: 'Fri', volume: 80, service: 88 },
    { label: 'Sat', volume: 70, service: 72 },
    { label: 'Sun', volume: 65, service: 68 },
  ];

  const maxValue = 100;

  return (
    <div className="volume-service">
      <div className="chart-header">
        <h3>Volume vs Service Level</h3>
      </div>

      <div className="vs-stats">
        <div className="vs-stat-card volume">
          <div className="vs-stat-value">1,135</div>
          <div className="vs-stat-label">Volume</div>
        </div>
        <div className="vs-stat-card service">
          <div className="vs-stat-value">635</div>
          <div className="vs-stat-label">Services</div>
        </div>
      </div>

      <div className="vs-bar-chart">
        {data.map((item, index) => (
          <div key={index} className="vs-bar-group">
            <div className="vs-bars">
              <div
                className="vs-bar volume-bar"
                style={{ height: `${(item.volume / maxValue) * 100}%` }}
                title={`Volume: ${item.volume}`}
              ></div>
              <div
                className="vs-bar service-bar"
                style={{ height: `${(item.service / maxValue) * 100}%` }}
                title={`Service: ${item.service}`}
              ></div>
            </div>
            <div className="vs-bar-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="vs-legend">
        <div className="vs-legend-item">
          <span className="vs-legend-dot volume"></span>
          Volume
        </div>
        <div className="vs-legend-item">
          <span className="vs-legend-dot service"></span>
          Services
        </div>
      </div>
    </div>
  );
};

export default VolumeServiceLevel;
