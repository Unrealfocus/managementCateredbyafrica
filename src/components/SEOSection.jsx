import React from 'react'
import './SEOSection.css'

const SEOSection = () => {
  // Mock data for demonstration
  const seoMetrics = {
    organicTraffic: { value: '12,845', change: '+12.5%', trend: 'up' },
    keywordRankings: { value: '234', change: '+18', trend: 'up' },
    backlinks: { value: '1,456', change: '+89', trend: 'up' },
    domainAuthority: { value: '67', change: '+3', trend: 'up' },
  }

  const topKeywords = [
    { keyword: 'catered events africa', position: 3, volume: '2.4K', difficulty: 'Medium' },
    { keyword: 'african catering services', position: 5, volume: '1.8K', difficulty: 'High' },
    { keyword: 'event catering management', position: 8, volume: '3.2K', difficulty: 'High' },
    { keyword: 'corporate catering africa', position: 12, volume: '980', difficulty: 'Low' },
    { keyword: 'wedding catering services', position: 15, volume: '5.1K', difficulty: 'High' },
  ]

  const technicalSEO = {
    pageSpeed: { score: 87, status: 'good' },
    mobileFriendly: { score: 95, status: 'excellent' },
    coreWebVitals: { score: 78, status: 'good' },
    indexedPages: { count: 156, status: 'good' },
    crawlErrors: { count: 3, status: 'warning' },
  }

  const contentMetrics = {
    totalPages: 156,
    blogPosts: 42,
    avgWordCount: 1250,
    contentScore: 82,
  }

  return (
    <div className="seo-section">
      <div className="section-header">
        <h2 className="section-title">SEO Performance</h2>
        <p className="section-description">Monitor your search engine optimization metrics and rankings</p>
      </div>

      {/* SEO Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon organic">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 17l-3-3-4 4-5-5" />
            </svg>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Organic Traffic</h3>
            <p className="metric-value">{seoMetrics.organicTraffic.value}</p>
            <span className={`metric-change ${seoMetrics.organicTraffic.trend}`}>
              {seoMetrics.organicTraffic.change}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon keywords">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Keyword Rankings</h3>
            <p className="metric-value">{seoMetrics.keywordRankings.value}</p>
            <span className={`metric-change ${seoMetrics.keywordRankings.trend}`}>
              {seoMetrics.keywordRankings.change} new
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon backlinks">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Backlinks</h3>
            <p className="metric-value">{seoMetrics.backlinks.value}</p>
            <span className={`metric-change ${seoMetrics.backlinks.trend}`}>
              {seoMetrics.backlinks.change} this month
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon authority">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Domain Authority</h3>
            <p className="metric-value">{seoMetrics.domainAuthority.value}</p>
            <span className={`metric-change ${seoMetrics.domainAuthority.trend}`}>
              {seoMetrics.domainAuthority.change} points
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="seo-two-column">
        {/* Top Keywords Table */}
        <div className="seo-card">
          <div className="card-header">
            <h3 className="card-title">Top Keywords</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="keywords-table">
            <table>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Position</th>
                  <th>Volume</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {topKeywords.map((keyword, index) => (
                  <tr key={index}>
                    <td className="keyword-name">{keyword.keyword}</td>
                    <td>
                      <span className="position-badge">#{keyword.position}</span>
                    </td>
                    <td className="volume">{keyword.volume}</td>
                    <td>
                      <span className={`difficulty-badge ${keyword.difficulty.toLowerCase()}`}>
                        {keyword.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical SEO */}
        <div className="seo-card">
          <div className="card-header">
            <h3 className="card-title">Technical SEO</h3>
          </div>
          <div className="technical-seo-list">
            <div className="technical-item">
              <div className="technical-info">
                <span className="technical-label">Page Speed</span>
                <span className="technical-value">{technicalSEO.pageSpeed.score}/100</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill good"
                  style={{ width: `${technicalSEO.pageSpeed.score}%` }}
                ></div>
              </div>
            </div>

            <div className="technical-item">
              <div className="technical-info">
                <span className="technical-label">Mobile Friendly</span>
                <span className="technical-value">{technicalSEO.mobileFriendly.score}/100</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill excellent"
                  style={{ width: `${technicalSEO.mobileFriendly.score}%` }}
                ></div>
              </div>
            </div>

            <div className="technical-item">
              <div className="technical-info">
                <span className="technical-label">Core Web Vitals</span>
                <span className="technical-value">{technicalSEO.coreWebVitals.score}/100</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill good"
                  style={{ width: `${technicalSEO.coreWebVitals.score}%` }}
                ></div>
              </div>
            </div>

            <div className="technical-item">
              <div className="technical-info">
                <span className="technical-label">Indexed Pages</span>
                <span className="technical-value">{technicalSEO.indexedPages.count}</span>
              </div>
              <span className={`status-badge ${technicalSEO.indexedPages.status}`}>
                {technicalSEO.indexedPages.status}
              </span>
            </div>

            <div className="technical-item">
              <div className="technical-info">
                <span className="technical-label">Crawl Errors</span>
                <span className="technical-value">{technicalSEO.crawlErrors.count}</span>
              </div>
              <span className={`status-badge ${technicalSEO.crawlErrors.status}`}>
                Needs attention
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="seo-card">
        <div className="card-header">
          <h3 className="card-title">Content Performance</h3>
        </div>
        <div className="content-metrics-grid">
          <div className="content-metric">
            <div className="content-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="content-metric-value">{contentMetrics.totalPages}</p>
              <p className="content-metric-label">Total Pages</p>
            </div>
          </div>

          <div className="content-metric">
            <div className="content-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
              </svg>
            </div>
            <div>
              <p className="content-metric-value">{contentMetrics.blogPosts}</p>
              <p className="content-metric-label">Blog Posts</p>
            </div>
          </div>

          <div className="content-metric">
            <div className="content-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="14" y2="21" />
              </svg>
            </div>
            <div>
              <p className="content-metric-value">{contentMetrics.avgWordCount}</p>
              <p className="content-metric-label">Avg Word Count</p>
            </div>
          </div>

          <div className="content-metric">
            <div className="content-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <p className="content-metric-value">{contentMetrics.contentScore}%</p>
              <p className="content-metric-label">Content Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SEOSection
