import React from 'react';
import './MetricsCards.css';

const MetricsCards = () => {
  const metrics = [
    {
      id: 1,
      title: 'Total Sales',
      value: '$1k',
      change: '+8% from yesterday',
      icon: 'sales',
      color: '#fee2e2',
      iconColor: '#ef4444',
    },
    {
      id: 2,
      title: 'Total Order',
      value: '300',
      change: '+5% from yesterday',
      icon: 'order',
      color: '#fef3c7',
      iconColor: '#f59e0b',
    },
    {
      id: 3,
      title: 'Product Sold',
      value: '5',
      change: '+1.2% from yesterday',
      icon: 'product',
      color: '#d1fae5',
      iconColor: '#10b981',
    },
    {
      id: 4,
      title: 'New Customers',
      value: '8',
      change: '+0.5% from yesterday',
      icon: 'customers',
      color: '#e0e7ff',
      iconColor: '#6366f1',
    },
  ];

  const renderIcon = (iconType, iconColor) => {
    const icons = {
      sales: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      ),
      order: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      ),
      product: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
      ),
      customers: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    };
    return icons[iconType] || icons.sales;
  };

  return (
    <div className="metrics-section">
      <div className="section-header">
        <h2>Today's Sales</h2>
        <p className="section-subtitle">Sales Summary</p>
      </div>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.id} className="metric-card" style={{ backgroundColor: metric.color }}>
            <div className="metric-icon">{renderIcon(metric.icon, metric.iconColor)}</div>
            <div className="metric-content">
              <div className="metric-value">{metric.value}</div>
              <div className="metric-title">{metric.title}</div>
              <div className="metric-change">{metric.change}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsCards;
