import React, { useState } from 'react';
import './SalesDashboard.css';
import MetricsCards from './MetricsCards';
import VisitorInsights from './VisitorInsights';
import RevenueChart from './RevenueChart';
import CustomerSatisfaction from './CustomerSatisfaction';
import TargetVsReality from './TargetVsReality';
import TopProducts from './TopProducts';
import SalesMapping from './SalesMapping';
import VolumeServiceLevel from './VolumeServiceLevel';
import CustomerList from './CustomerList';
import CustomerSegmentation from './CustomerSegmentation';
import EmailSection from './EmailSection';
import MessagingSection from './MessagingSection';
import AutomationSection from './AutomationSection';

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'customers', label: 'Customers', icon: 'customers' },
    { id: 'segmentation', label: 'Segmentation', icon: 'segmentation' },
    { id: 'email', label: 'Email', icon: 'email' },
    { id: 'messages', label: 'Messages', icon: 'messages' },
    { id: 'automation', label: 'Automation', icon: 'automation' },
    { id: 'sales-report', label: 'Sales Report', icon: 'report' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const renderIcon = (iconType) => {
    const icons = {
      dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      customers: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      segmentation: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="2" x2="12" y2="22"></line>
          <path d="M12 2a10 10 0 0 0 0 20"></path>
        </svg>
      ),
      email: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      ),
      messages: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      automation: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      ),
      report: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
      settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m8.66-13.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m13.66 0l-4.24-4.24m-4.24-4.24L3.34 3.34"></path>
        </svg>
      ),
    };
    return icons[iconType] || icons.dashboard;
  };

  return (
    <div className="sales-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span className="logo-text">Dabang</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="promo-card">
            <div className="promo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <h3>Dabang Pro</h3>
            <p>Get access to all features of Dabang</p>
            <button className="promo-button">Get Pro</button>
          </div>

          <button className="nav-item sign-out">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'customers' && 'Customers'}
            {activeTab === 'segmentation' && 'Customer Segmentation'}
            {activeTab === 'email' && 'Email Marketing'}
            {activeTab === 'messages' && 'Messages'}
            {activeTab === 'automation' && 'Automation'}
            {activeTab === 'sales-report' && 'Sales Report'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          <div className="header-actions">
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" placeholder="Search here..." />
            </div>
            <div className="language-selector">
              <span className="flag">🇺🇸</span>
              <span>Eng (US)</span>
            </div>
            <div className="notification-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="notification-badge">3</span>
            </div>
            <div className="user-profile">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" />
              <div>
                <div className="user-name">Musfiq</div>
                <div className="user-role">Admin</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <>
              <MetricsCards />
              <div className="dashboard-grid">
                <div className="chart-container large">
                  <RevenueChart />
                </div>
                <div className="chart-container">
                  <VisitorInsights />
                </div>
                <div className="chart-container">
                  <CustomerSatisfaction />
                </div>
                <div className="chart-container">
                  <TargetVsReality />
                </div>
                <div className="chart-container">
                  <TopProducts />
                </div>
                <div className="chart-container">
                  <SalesMapping />
                </div>
                <div className="chart-container">
                  <VolumeServiceLevel />
                </div>
              </div>
            </>
          )}

          {activeTab === 'customers' && <CustomerList />}
          {activeTab === 'segmentation' && <CustomerSegmentation />}
          {activeTab === 'email' && <EmailSection />}
          {activeTab === 'messages' && <MessagingSection />}
          {activeTab === 'automation' && <AutomationSection />}

          {activeTab === 'sales-report' && (
            <div className="coming-soon">
              <h2>Sales Report</h2>
              <p>Detailed sales reports and analytics coming soon!</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="coming-soon">
              <h2>Settings</h2>
              <p>Application settings coming soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;
