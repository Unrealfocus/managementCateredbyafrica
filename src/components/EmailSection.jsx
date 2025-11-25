import React, { useState } from 'react'
import './EmailSection.css'

const EmailSection = () => {
  const [emailData, setEmailData] = useState({
    recipient: 'all',
    subject: '',
    body: '',
    template: 'blank'
  })

  const [sentEmails, setSentEmails] = useState([
    {
      id: 1,
      subject: 'Welcome to Catered by Africa!',
      recipients: 15,
      sentDate: '2025-11-25 10:30',
      openRate: '68%',
      clickRate: '24%',
      status: 'sent'
    },
    {
      id: 2,
      subject: 'Special Offer: 20% Off Your First Order',
      recipients: 8,
      sentDate: '2025-11-24 14:15',
      openRate: '85%',
      clickRate: '42%',
      status: 'sent'
    },
    {
      id: 3,
      subject: 'New Menu Items Available',
      recipients: 24,
      sentDate: '2025-11-23 09:00',
      openRate: '72%',
      clickRate: '31%',
      status: 'sent'
    }
  ])

  const templates = [
    { id: 'blank', name: 'Blank Email', icon: '📄' },
    { id: 'welcome', name: 'Welcome Email', icon: '👋' },
    { id: 'promotion', name: 'Promotional Offer', icon: '🎁' },
    { id: 'reminder', name: 'Order Reminder', icon: '🔔' },
    { id: 'newsletter', name: 'Newsletter', icon: '📰' }
  ]

  const recipientOptions = [
    { value: 'all', label: 'All Customers', count: 24 },
    { value: 'ordered', label: 'Customers with Orders', count: 10 },
    { value: 'not-ordered', label: 'Customers without Orders', count: 14 },
    { value: 'vip', label: 'VIP Customers', count: 3 },
    { value: 'custom', label: 'Custom Selection', count: 0 }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEmailData(prev => ({ ...prev, [name]: value }))
  }

  const handleTemplateSelect = (templateId) => {
    setEmailData(prev => ({ ...prev, template: templateId }))

    // Pre-fill content based on template
    if (templateId === 'welcome') {
      setEmailData(prev => ({
        ...prev,
        subject: 'Welcome to Catered by Africa!',
        body: 'Dear Customer,\n\nWelcome to Catered by Africa! We\'re thrilled to have you join our community.\n\nAs a special welcome gift, enjoy 15% off your first order with code: WELCOME15\n\nExplore our menu and discover authentic African cuisine delivered to your door.\n\nBest regards,\nThe Catered by Africa Team'
      }))
    } else if (templateId === 'promotion') {
      setEmailData(prev => ({
        ...prev,
        subject: 'Special Offer Just for You!',
        body: 'Dear Customer,\n\nWe have an exclusive offer for you!\n\nGet 20% OFF on all orders this week. Use code: SAVE20\n\nDon\'t miss out on this amazing deal. Order now!\n\nBest regards,\nThe Catered by Africa Team'
      }))
    }
  }

  const handleSendEmail = () => {
    // Simulate sending email
    alert(`Email will be sent to: ${emailData.recipient}\nSubject: ${emailData.subject}`)
    // Reset form
    setEmailData({
      recipient: 'all',
      subject: '',
      body: '',
      template: 'blank'
    })
  }

  return (
    <div className="email-section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Email Communication</h2>
          <p className="section-description">Send emails to your customers</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="email-layout">
        {/* Email Composer */}
        <div className="email-composer-card">
          <div className="composer-header">
            <h3>Compose Email</h3>
            <span className="composer-subtitle">Create and send emails to your customers</span>
          </div>

          {/* Template Selector */}
          <div className="form-group">
            <label className="form-label">Email Template</label>
            <div className="template-grid">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className={`template-btn ${emailData.template === template.id ? 'active' : ''}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Selector */}
          <div className="form-group">
            <label className="form-label">Recipients</label>
            <select
              name="recipient"
              value={emailData.recipient}
              onChange={handleInputChange}
              className="form-select"
            >
              {recipientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              name="subject"
              value={emailData.subject}
              onChange={handleInputChange}
              placeholder="Enter email subject..."
              className="form-input"
            />
          </div>

          {/* Email Body */}
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="body"
              value={emailData.body}
              onChange={handleInputChange}
              placeholder="Write your email message here..."
              className="form-textarea"
              rows="10"
            />
          </div>

          {/* Actions */}
          <div className="composer-actions">
            <button className="btn-secondary" onClick={() => setEmailData({ recipient: 'all', subject: '', body: '', template: 'blank' })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Clear
            </button>
            <button className="btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Draft
            </button>
            <button className="btn-primary" onClick={handleSendEmail}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send Email
            </button>
          </div>
        </div>

        {/* Email History & Stats */}
        <div className="email-sidebar">
          {/* Stats */}
          <div className="email-stats-card">
            <h4 className="stats-title">Email Statistics</h4>
            <div className="email-stats-grid">
              <div className="email-stat">
                <div className="email-stat-icon sent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
                <div>
                  <p className="email-stat-value">47</p>
                  <p className="email-stat-label">Sent This Month</p>
                </div>
              </div>

              <div className="email-stat">
                <div className="email-stat-icon open">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 12.5c0 1-.5 2-1.5 2.5" />
                    <path d="M2.5 12.5c0 1 .5 2 1.5 2.5" />
                    <path d="M4 18c0-1 1-2 2-2" />
                    <path d="M20 18c0-1-1-2-2-2" />
                    <rect x="6" y="4" width="12" height="12" rx="2" />
                  </svg>
                </div>
                <div>
                  <p className="email-stat-value">75%</p>
                  <p className="email-stat-label">Avg Open Rate</p>
                </div>
              </div>

              <div className="email-stat">
                <div className="email-stat-icon click">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <p className="email-stat-value">32%</p>
                  <p className="email-stat-label">Avg Click Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Emails */}
          <div className="email-history-card">
            <h4 className="history-title">Recent Emails</h4>
            <div className="email-history-list">
              {sentEmails.map((email) => (
                <div key={email.id} className="email-history-item">
                  <div className="email-history-header">
                    <h5 className="email-history-subject">{email.subject}</h5>
                    <span className="email-status-badge">{email.status}</span>
                  </div>
                  <div className="email-history-meta">
                    <span className="email-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {email.recipients} recipients
                    </span>
                    <span className="email-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {email.sentDate}
                    </span>
                  </div>
                  <div className="email-history-stats">
                    <div className="email-mini-stat">
                      <span className="mini-stat-label">Opened:</span>
                      <span className="mini-stat-value">{email.openRate}</span>
                    </div>
                    <div className="email-mini-stat">
                      <span className="mini-stat-label">Clicked:</span>
                      <span className="mini-stat-value">{email.clickRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailSection
