import React, { useState } from 'react'
import './MessagingSection.css'

const MessagingSection = () => {
  const [messageData, setMessageData] = useState({
    recipient: 'all',
    messageType: 'sms',
    message: ''
  })

  const [sentMessages, setSentMessages] = useState([
    {
      id: 1,
      type: 'sms',
      message: 'Your order #1234 has been confirmed and will be delivered today!',
      recipients: 3,
      sentDate: '2025-11-25 11:45',
      deliveryRate: '100%',
      status: 'delivered'
    },
    {
      id: 2,
      type: 'whatsapp',
      message: 'Thank you for your order! Track your delivery here: https://track.link',
      recipients: 5,
      sentDate: '2025-11-24 16:30',
      deliveryRate: '100%',
      status: 'delivered'
    },
    {
      id: 3,
      type: 'sms',
      message: 'Special offer: 15% off on your next order. Use code: SAVE15',
      recipients: 12,
      sentDate: '2025-11-23 10:00',
      deliveryRate: '98%',
      status: 'delivered'
    }
  ])

  const recipientOptions = [
    { value: 'all', label: 'All Customers', count: 24 },
    { value: 'ordered', label: 'Customers with Orders', count: 10 },
    { value: 'not-ordered', label: 'Customers without Orders', count: 14 },
    { value: 'custom', label: 'Custom Selection', count: 0 }
  ]

  const quickTemplates = [
    {
      id: 1,
      name: 'Order Confirmation',
      message: 'Your order has been confirmed! We\'ll notify you when it\'s on the way.',
      category: 'order'
    },
    {
      id: 2,
      name: 'Delivery Update',
      message: 'Your order is out for delivery and will arrive within 30 minutes.',
      category: 'delivery'
    },
    {
      id: 3,
      name: 'Thank You',
      message: 'Thank you for choosing Catered by Africa! We hope you enjoyed your meal.',
      category: 'followup'
    },
    {
      id: 4,
      name: 'Special Offer',
      message: 'Exclusive offer just for you! Get 20% off your next order with code: SPECIAL20',
      category: 'promotion'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMessageData(prev => ({ ...prev, [name]: value }))
  }

  const handleTemplateSelect = (template) => {
    setMessageData(prev => ({ ...prev, message: template.message }))
  }

  const handleSendMessage = () => {
    if (!messageData.message.trim()) {
      alert('Please enter a message')
      return
    }
    alert(`Message will be sent via ${messageData.messageType.toUpperCase()} to: ${messageData.recipient}`)
    setMessageData({
      recipient: 'all',
      messageType: 'sms',
      message: ''
    })
  }

  const characterCount = messageData.message.length
  const smsCount = Math.ceil(characterCount / 160)

  return (
    <div className="messaging-section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Messaging Center</h2>
          <p className="section-description">Send SMS and WhatsApp messages to your customers</p>
        </div>
      </div>

      {/* Messaging Stats */}
      <div className="messaging-stats">
        <div className="msg-stat-card sms">
          <div className="msg-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="msg-stat-value">156</p>
            <p className="msg-stat-label">SMS Sent This Month</p>
          </div>
        </div>

        <div className="msg-stat-card whatsapp">
          <div className="msg-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <p className="msg-stat-value">89</p>
            <p className="msg-stat-label">WhatsApp Sent This Month</p>
          </div>
        </div>

        <div className="msg-stat-card delivery">
          <div className="msg-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="msg-stat-value">99.2%</p>
            <p className="msg-stat-label">Delivery Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="messaging-layout">
        {/* Message Composer */}
        <div className="message-composer-card">
          <div className="composer-header">
            <h3>Compose Message</h3>
            <span className="composer-subtitle">Send SMS or WhatsApp messages to your customers</span>
          </div>

          {/* Message Type Selector */}
          <div className="form-group">
            <label className="form-label">Message Type</label>
            <div className="message-type-selector">
              <button
                className={`type-btn ${messageData.messageType === 'sms' ? 'active' : ''}`}
                onClick={() => setMessageData(prev => ({ ...prev, messageType: 'sms' }))}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                SMS
              </button>
              <button
                className={`type-btn ${messageData.messageType === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setMessageData(prev => ({ ...prev, messageType: 'whatsapp' }))}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Recipient Selector */}
          <div className="form-group">
            <label className="form-label">Recipients</label>
            <select
              name="recipient"
              value={messageData.recipient}
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

          {/* Message Input */}
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="message"
              value={messageData.message}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="form-textarea"
              rows="6"
            />
            <div className="message-meta">
              <span className="character-count">
                {characterCount} characters
                {messageData.messageType === 'sms' && ` • ${smsCount} SMS`}
              </span>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="form-group">
            <label className="form-label">Quick Templates</label>
            <div className="templates-list">
              {quickTemplates.map((template) => (
                <button
                  key={template.id}
                  className="template-item"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <span className="template-item-name">{template.name}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="composer-actions">
            <button
              className="btn-secondary"
              onClick={() => setMessageData({ recipient: 'all', messageType: 'sms', message: '' })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Clear
            </button>
            <button className="btn-primary" onClick={handleSendMessage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send Message
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="message-history-card">
          <h3 className="history-title">Recent Messages</h3>
          <div className="message-history-list">
            {sentMessages.map((msg) => (
              <div key={msg.id} className="message-history-item">
                <div className="message-history-header">
                  <span className={`message-type-badge ${msg.type}`}>
                    {msg.type === 'sms' ? '💬 SMS' : '📱 WhatsApp'}
                  </span>
                  <span className={`message-status-badge ${msg.status}`}>{msg.status}</span>
                </div>
                <p className="message-history-text">{msg.message}</p>
                <div className="message-history-meta">
                  <span className="message-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {msg.recipients} recipients
                  </span>
                  <span className="message-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {msg.sentDate}
                  </span>
                </div>
                <div className="message-delivery">
                  <span className="delivery-label">Delivery Rate:</span>
                  <span className="delivery-value">{msg.deliveryRate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagingSection
