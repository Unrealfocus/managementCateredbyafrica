import React from 'react';
import './RevenueChart.css';

const RevenueChart = () => {
  const data = [
    { month: 'Monday', online: 15, offline: 22 },
    { month: 'Tuesday', online: 28, offline: 18 },
    { month: 'Wednesday', online: 20, offline: 25 },
    { month: 'Thursday', online: 32, offline: 15 },
    { month: 'Wednesday', online: 18, offline: 28 },
    { month: 'Thursday', online: 25, offline: 20 },
    { month: 'Friday', online: 30, offline: 23 },
    { month: 'Saturday', online: 35, offline: 18 },
  ];

  const maxValue = Math.max(...data.flatMap(d => [d.online, d.offline]));

  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <div>
          <h3>Total Revenue</h3>
        </div>
        <button className="export-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export
        </button>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot online"></span>
          Online Sales
        </div>
        <div className="legend-item">
          <span className="legend-dot offline"></span>
          Offline Sales
        </div>
      </div>

      <div className="bar-chart">
        <div className="y-axis">
          <span>40k</span>
          <span>30k</span>
          <span>20k</span>
          <span>10k</span>
          <span>0k</span>
        </div>
        <div className="chart-bars">
          {data.map((item, index) => (
            <div key={index} className="bar-group">
              <div className="bars">
                <div
                  className="bar online-bar"
                  style={{ height: `${(item.online / maxValue) * 100}%` }}
                  title={`Online: ${item.online}k`}
                ></div>
                <div
                  className="bar offline-bar"
                  style={{ height: `${(item.offline / maxValue) * 100}%` }}
                  title={`Offline: ${item.offline}k`}
                ></div>
              </div>
              <div className="bar-label">{item.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
