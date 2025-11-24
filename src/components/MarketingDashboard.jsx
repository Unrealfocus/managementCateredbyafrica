import React, { useState } from 'react'
import SEOSection from './SEOSection'
import GoogleAnalyticsSection from './GoogleAnalyticsSection'
import './MarketingDashboard.css'

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Marketing Dashboard</h1>
          <p className="dashboard-subtitle">Monitor your marketing performance and SEO metrics</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          SEO
        </button>
        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Google Analytics
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Quick Stats</h3>
                <p className="overview-description">
                  Get a comprehensive view of your marketing performance across all channels.
                </p>
              </div>
            </div>

            {/* Show both sections in overview */}
            <div className="sections-container">
              <SEOSection />
              <GoogleAnalyticsSection />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="tab-content">
            <SEOSection />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <GoogleAnalyticsSection />
          </div>
        )}
      </main>
    </div>
  )
}

export default MarketingDashboard
