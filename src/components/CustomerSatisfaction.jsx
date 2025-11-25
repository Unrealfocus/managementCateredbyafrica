import React from 'react';
import './CustomerSatisfaction.css';

const CustomerSatisfaction = () => {
  const data = {
    labels: ['', '', '', '', '', '', '', '', '', ''],
    lastMonth: [30, 40, 35, 45, 40, 50, 45, 55, 50, 52],
    thisMonth: [25, 35, 45, 40, 50, 45, 55, 50, 60, 58],
  };

  const createPath = (points) => {
    const width = 100;
    const height = 50;
    const step = width / (points.length - 1);
    const max = 70;

    let path = `M 0 ${height - (points[0] / max) * height}`;

    points.forEach((point, i) => {
      if (i > 0) {
        const x = i * step;
        const y = height - (point / max) * height;
        const prevX = (i - 1) * step;
        const prevY = height - (points[i - 1] / max) * height;

        const cpX1 = prevX + step / 3;
        const cpY1 = prevY;
        const cpX2 = x - step / 3;
        const cpY2 = y;

        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
      }
    });

    return path;
  };

  return (
    <div className="customer-satisfaction">
      <div className="chart-header">
        <h3>Customer Satisfaction</h3>
      </div>

      <div className="satisfaction-stats">
        <div className="stat-card">
          <span className="stat-icon last">📊</span>
          <div>
            <div className="stat-value">$3,004</div>
            <div className="stat-label">Last Month</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon this">📈</span>
          <div>
            <div className="stat-value">$4,504</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
      </div>

      <div className="area-chart">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient-last" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="gradient-this" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path
            d={createPath(data.lastMonth) + ' L 100 50 L 0 50 Z'}
            fill="url(#gradient-last)"
          />
          <path
            d={createPath(data.lastMonth)}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          <path
            d={createPath(data.thisMonth) + ' L 100 50 L 0 50 Z'}
            fill="url(#gradient-this)"
          />
          <path
            d={createPath(data.thisMonth)}
            fill="none"
            stroke="#10b981"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-line last"></span>
          Last Month
        </div>
        <div className="legend-item">
          <span className="legend-line this"></span>
          This Month
        </div>
      </div>
    </div>
  );
};

export default CustomerSatisfaction;
