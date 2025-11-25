import React from 'react';
import './VisitorInsights.css';

const VisitorInsights = () => {
  const data = {
    labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Loyal Customers',
        color: '#ec4899',
        points: [30, 45, 35, 55, 45, 65, 55],
      },
      {
        label: 'New Customers',
        color: '#ef4444',
        points: [20, 35, 40, 30, 50, 45, 60],
      },
      {
        label: 'Unique Customers',
        color: '#f59e0b',
        points: [40, 30, 45, 40, 35, 50, 45],
      },
    ],
  };

  const createPath = (points) => {
    const width = 100;
    const height = 60;
    const step = width / (points.length - 1);
    const max = 70;

    let path = `M 0 ${height - (points[0] / max) * height}`;

    points.forEach((point, i) => {
      if (i > 0) {
        const x = i * step;
        const y = height - (point / max) * height;
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  };

  return (
    <div className="visitor-insights">
      <div className="chart-header">
        <h3>Visitor Insights</h3>
      </div>

      <div className="insights-stats">
        <div className="stat-item">
          <span className="stat-label">Loyal Customers</span>
          <span className="stat-value">78%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">New Customers</span>
          <span className="stat-value">15%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unique Customers</span>
          <span className="stat-value">7%</span>
        </div>
      </div>

      <div className="line-chart">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none">
          {data.datasets.map((dataset, index) => (
            <path
              key={index}
              d={createPath(dataset.points)}
              fill="none"
              stroke={dataset.color}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="chart-x-axis">
          {data.labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        {data.datasets.map((dataset, index) => (
          <div key={index} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: dataset.color }}></span>
            {dataset.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitorInsights;
