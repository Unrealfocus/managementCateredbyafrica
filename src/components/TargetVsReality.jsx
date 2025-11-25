import React from 'react';
import './TargetVsReality.css';

const TargetVsReality = () => {
  const data = [
    { label: 'Jan', reality: 70, target: 50 },
    { label: 'Feb', reality: 85, target: 75 },
    { label: 'Mar', reality: 65, target: 80 },
    { label: 'Apr', reality: 90, target: 70 },
    { label: 'May', reality: 75, target: 85 },
    { label: 'Jun', reality: 95, target: 80 },
    { label: 'Jul', reality: 80, target: 90 },
    { label: 'Aug', reality: 70, target: 75 },
  ];

  const maxValue = Math.max(...data.flatMap(d => [d.reality, d.target]));

  return (
    <div className="target-reality">
      <div className="chart-header">
        <h3>Target vs Reality</h3>
      </div>

      <div className="reality-stats">
        <div className="stat-row">
          <div className="stat-item">
            <span className="stat-dot reality"></span>
            <span className="stat-label">Reality Sales</span>
          </div>
          <span className="stat-value green">8,823</span>
        </div>
        <div className="stat-row">
          <div className="stat-item">
            <span className="stat-dot target"></span>
            <span className="stat-label">Target Sales</span>
          </div>
          <span className="stat-value yellow">12,122</span>
        </div>
      </div>

      <div className="grouped-bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-group-vertical">
            <div className="bars-vertical">
              <div
                className="bar-vertical reality-bar"
                style={{ height: `${(item.reality / maxValue) * 100}%` }}
                title={`Reality: ${item.reality}`}
              ></div>
              <div
                className="bar-vertical target-bar"
                style={{ height: `${(item.target / maxValue) * 100}%` }}
                title={`Target: ${item.target}`}
              ></div>
            </div>
            <div className="bar-label-vertical">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetVsReality;
