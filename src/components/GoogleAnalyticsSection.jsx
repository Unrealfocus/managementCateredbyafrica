import React from 'react'
import './GoogleAnalyticsSection.css'

const GoogleAnalyticsSection = () => {
  // Mock data for demonstration
  const analyticsOverview = {
    users: { value: '24,567', change: '+15.3%', trend: 'up' },
    sessions: { value: '38,924', change: '+12.8%', trend: 'up' },
    bounceRate: { value: '42.3%', change: '-5.2%', trend: 'down' },
    avgSessionDuration: { value: '3m 45s', change: '+18s', trend: 'up' },
  }

  const trafficSources = [
    { source: 'Organic Search', sessions: 15234, percentage: 39, color: '#667eea' },
    { source: 'Direct', sessions: 10123, percentage: 26, color: '#4facfe' },
    { source: 'Social Media', sessions: 8456, percentage: 22, color: '#f093fb' },
    { source: 'Referral', sessions: 3211, percentage: 8, color: '#43e97b' },
    { source: 'Email', sessions: 1900, percentage: 5, color: '#f59e0b' },
  ]

  const topPages = [
    { page: '/home', views: 12456, avgTime: '4:23', bounceRate: '38%' },
    { page: '/services', views: 8234, avgTime: '3:15', bounceRate: '42%' },
    { page: '/about', views: 6789, avgTime: '2:48', bounceRate: '45%' },
    { page: '/contact', views: 4567, avgTime: '2:12', bounceRate: '52%' },
    { page: '/blog/catering-tips', views: 3421, avgTime: '5:34', bounceRate: '28%' },
  ]

  const deviceBreakdown = {
    desktop: 58,
    mobile: 35,
    tablet: 7,
  }

  const realtimeData = {
    activeUsers: 342,
    topPages: [
      { page: '/home', users: 89 },
      { page: '/services', users: 67 },
      { page: '/contact', users: 45 },
    ],
  }

  const goals = [
    { name: 'Contact Form Submission', completions: 234, conversionRate: '6.2%', value: '$12,340' },
    { name: 'Newsletter Signup', completions: 567, conversionRate: '8.5%', value: '$5,670' },
    { name: 'Service Inquiry', completions: 189, conversionRate: '4.8%', value: '$18,900' },
  ]

  const demographics = {
    topCountries: [
      { country: 'South Africa', users: 12345, flag: '🇿🇦' },
      { country: 'Nigeria', users: 6789, flag: '🇳🇬' },
      { country: 'Kenya', users: 4567, flag: '🇰🇪' },
      { country: 'Ghana', users: 2345, flag: '🇬🇭' },
    ],
  }

  return (
    <div className="analytics-section">
      <div className="section-header">
        <h2 className="section-title">Google Analytics</h2>
        <p className="section-description">Track and analyze your website traffic and user behavior</p>
      </div>

      {/* Overview Metrics */}
      <div className="analytics-metrics-grid">
        <div className="analytics-metric-card">
          <div className="analytics-metric-icon users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="analytics-metric-content">
            <h3 className="analytics-metric-label">Total Users</h3>
            <p className="analytics-metric-value">{analyticsOverview.users.value}</p>
            <span className={`analytics-metric-change ${analyticsOverview.users.trend}`}>
              {analyticsOverview.users.change}
            </span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon sessions">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className="analytics-metric-content">
            <h3 className="analytics-metric-label">Sessions</h3>
            <p className="analytics-metric-value">{analyticsOverview.sessions.value}</p>
            <span className={`analytics-metric-change ${analyticsOverview.sessions.trend}`}>
              {analyticsOverview.sessions.change}
            </span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div className="analytics-metric-content">
            <h3 className="analytics-metric-label">Bounce Rate</h3>
            <p className="analytics-metric-value">{analyticsOverview.bounceRate.value}</p>
            <span className={`analytics-metric-change ${analyticsOverview.bounceRate.trend}`}>
              {analyticsOverview.bounceRate.change}
            </span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon duration">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="analytics-metric-content">
            <h3 className="analytics-metric-label">Avg Session Duration</h3>
            <p className="analytics-metric-value">{analyticsOverview.avgSessionDuration.value}</p>
            <span className={`analytics-metric-change ${analyticsOverview.avgSessionDuration.trend}`}>
              {analyticsOverview.avgSessionDuration.change}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time and Traffic Sources */}
      <div className="analytics-two-column">
        {/* Real-time Users */}
        <div className="analytics-card realtime-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Real-time Users</h3>
              <p className="card-subtitle">Active users right now</p>
            </div>
            <div className="realtime-badge">
              <span className="realtime-dot"></span>
              Live
            </div>
          </div>
          <div className="realtime-count">{realtimeData.activeUsers}</div>
          <div className="realtime-pages">
            <p className="realtime-pages-title">Top Active Pages</p>
            {realtimeData.topPages.map((page, index) => (
              <div key={index} className="realtime-page-item">
                <span className="realtime-page-name">{page.page}</span>
                <span className="realtime-page-users">{page.users} users</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="analytics-card">
          <div className="card-header">
            <h3 className="card-title">Traffic Sources</h3>
          </div>
          <div className="traffic-sources-list">
            {trafficSources.map((source, index) => (
              <div key={index} className="traffic-source-item">
                <div className="traffic-source-info">
                  <div className="traffic-source-header">
                    <span className="traffic-source-name">{source.source}</span>
                    <span className="traffic-source-sessions">{source.sessions.toLocaleString()}</span>
                  </div>
                  <div className="traffic-source-bar-container">
                    <div
                      className="traffic-source-bar"
                      style={{
                        width: `${source.percentage}%`,
                        backgroundColor: source.color,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="traffic-source-percentage">{source.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages and Device Breakdown */}
      <div className="analytics-two-column">
        {/* Top Pages */}
        <div className="analytics-card">
          <div className="card-header">
            <h3 className="card-title">Top Pages</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="top-pages-table">
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Views</th>
                  <th>Avg Time</th>
                  <th>Bounce</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr key={index}>
                    <td className="page-url">{page.page}</td>
                    <td className="page-views">{page.views.toLocaleString()}</td>
                    <td className="page-time">{page.avgTime}</td>
                    <td className="page-bounce">{page.bounceRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="analytics-card">
          <div className="card-header">
            <h3 className="card-title">Device Breakdown</h3>
          </div>
          <div className="device-breakdown">
            <div className="device-chart">
              <svg viewBox="0 0 200 200" className="device-donut">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="40"
                  strokeDasharray={`${deviceBreakdown.desktop * 5.03} 502.4`}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#4facfe"
                  strokeWidth="40"
                  strokeDasharray={`${deviceBreakdown.mobile * 5.03} 502.4`}
                  strokeDashoffset={`-${deviceBreakdown.desktop * 5.03}`}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#43e97b"
                  strokeWidth="40"
                  strokeDasharray={`${deviceBreakdown.tablet * 5.03} 502.4`}
                  strokeDashoffset={`-${(deviceBreakdown.desktop + deviceBreakdown.mobile) * 5.03}`}
                  transform="rotate(-90 100 100)"
                />
              </svg>
            </div>
            <div className="device-legend">
              <div className="device-legend-item">
                <span className="device-legend-color desktop"></span>
                <span className="device-legend-label">Desktop</span>
                <span className="device-legend-value">{deviceBreakdown.desktop}%</span>
              </div>
              <div className="device-legend-item">
                <span className="device-legend-color mobile"></span>
                <span className="device-legend-label">Mobile</span>
                <span className="device-legend-value">{deviceBreakdown.mobile}%</span>
              </div>
              <div className="device-legend-item">
                <span className="device-legend-color tablet"></span>
                <span className="device-legend-label">Tablet</span>
                <span className="device-legend-value">{deviceBreakdown.tablet}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals and Demographics */}
      <div className="analytics-two-column">
        {/* Goals */}
        <div className="analytics-card">
          <div className="card-header">
            <h3 className="card-title">Goal Completions</h3>
          </div>
          <div className="goals-list">
            {goals.map((goal, index) => (
              <div key={index} className="goal-item">
                <div className="goal-header">
                  <span className="goal-name">{goal.name}</span>
                  <span className="goal-value">{goal.value}</span>
                </div>
                <div className="goal-metrics">
                  <div className="goal-metric">
                    <span className="goal-metric-label">Completions</span>
                    <span className="goal-metric-value">{goal.completions}</span>
                  </div>
                  <div className="goal-metric">
                    <span className="goal-metric-label">Conversion Rate</span>
                    <span className="goal-metric-value">{goal.conversionRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics */}
        <div className="analytics-card">
          <div className="card-header">
            <h3 className="card-title">Top Countries</h3>
          </div>
          <div className="countries-list">
            {demographics.topCountries.map((country, index) => (
              <div key={index} className="country-item">
                <span className="country-flag">{country.flag}</span>
                <span className="country-name">{country.country}</span>
                <span className="country-users">{country.users.toLocaleString()} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleAnalyticsSection
