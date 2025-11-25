import React, { useState } from 'react'
import './AutomationSection.css'

const AutomationSection = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: '',
    channel: 'email',
    message: '',
    delay: '0'
  })

  const automations = [
    {
      id: 1,
      name: 'Welcome New Customers',
      trigger: 'customer_registered',
      channel: 'email',
      status: 'active',
      totalSent: 47,
      successRate: '94%',
      delay: '0 minutes',
      message: 'Welcome to Catered by Africa! Enjoy 15% off your first order.'
    },
    {
      id: 2,
      name: 'Order Confirmation',
      trigger: 'order_placed',
      channel: 'sms',
      status: 'active',
      totalSent: 156,
      successRate: '100%',
      delay: '0 minutes',
      message: 'Your order has been confirmed and will be delivered soon!'
    },
    {
      id: 3,
      name: 'Abandoned Cart Reminder',
      trigger: 'cart_abandoned',
      channel: 'email',
      status: 'active',
      totalSent: 23,
      successRate: '76%',
      delay: '2 hours',
      message: 'You left items in your cart! Complete your order now and get 10% off.'
    },
    {
      id: 4,
      name: 'Follow-up After Delivery',
      trigger: 'order_delivered',
      channel: 'whatsapp',
      status: 'active',
      totalSent: 134,
      successRate: '98%',
      delay: '1 day',
      message: 'How was your meal? We\'d love to hear your feedback!'
    },
    {
      id: 5,
      name: 'Re-engagement Campaign',
      trigger: 'customer_inactive_30_days',
      channel: 'email',
      status: 'paused',
      totalSent: 8,
      successRate: '62%',
      delay: '0 minutes',
      message: 'We miss you! Come back and enjoy 20% off your next order.'
    }
  ]

  const triggers = [
    { value: 'customer_registered', label: 'Customer Registered', icon: '👤' },
    { value: 'order_placed', label: 'Order Placed', icon: '🛒' },
    { value: 'order_delivered', label: 'Order Delivered', icon: '✅' },
    { value: 'cart_abandoned', label: 'Cart Abandoned', icon: '🛒' },
    { value: 'customer_inactive_30_days', label: 'Customer Inactive (30 days)', icon: '💤' },
    { value: 'first_order', label: 'First Order Completed', icon: '🎉' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAutomation(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateAutomation = () => {
    if (!newAutomation.name || !newAutomation.trigger || !newAutomation.message) {
      alert('Please fill in all required fields')
      return
    }
    alert('Automation created successfully!')
    setShowCreateModal(false)
    setNewAutomation({
      name: '',
      trigger: '',
      channel: 'email',
      message: '',
      delay: '0'
    })
  }

  const toggleAutomationStatus = (id) => {
    alert(`Automation ${id} status toggled`)
  }

  return (
    <div className="automation-section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Message Automation</h2>
          <p className="section-description">Automate your communications based on customer actions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Automation
        </button>
      </div>

      {/* Automation Stats */}
      <div className="automation-stats">
        <div className="auto-stat-card">
          <div className="auto-stat-icon active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <p className="auto-stat-value">{automations.filter(a => a.status === 'active').length}</p>
            <p className="auto-stat-label">Active Automations</p>
          </div>
        </div>

        <div className="auto-stat-card">
          <div className="auto-stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <p className="auto-stat-value">{automations.reduce((sum, a) => sum + a.totalSent, 0)}</p>
            <p className="auto-stat-label">Total Messages Sent</p>
          </div>
        </div>

        <div className="auto-stat-card">
          <div className="auto-stat-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="auto-stat-value">91%</p>
            <p className="auto-stat-label">Avg Success Rate</p>
          </div>
        </div>
      </div>

      {/* Automations List */}
      <div className="automations-grid">
        {automations.map((automation) => (
          <div key={automation.id} className={`automation-card ${automation.status}`}>
            <div className="automation-card-header">
              <div>
                <h3 className="automation-card-title">{automation.name}</h3>
                <p className="automation-card-trigger">
                  {triggers.find(t => t.value === automation.trigger)?.icon}{' '}
                  {triggers.find(t => t.value === automation.trigger)?.label}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={automation.status === 'active'}
                  onChange={() => toggleAutomationStatus(automation.id)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="automation-card-content">
              <div className="automation-detail">
                <span className="detail-icon">📱</span>
                <div>
                  <p className="detail-label">Channel</p>
                  <p className="detail-value">{automation.channel.toUpperCase()}</p>
                </div>
              </div>

              <div className="automation-detail">
                <span className="detail-icon">⏱️</span>
                <div>
                  <p className="detail-label">Delay</p>
                  <p className="detail-value">{automation.delay}</p>
                </div>
              </div>

              <div className="automation-detail">
                <span className="detail-icon">📊</span>
                <div>
                  <p className="detail-label">Success Rate</p>
                  <p className="detail-value">{automation.successRate}</p>
                </div>
              </div>

              <div className="automation-detail">
                <span className="detail-icon">📬</span>
                <div>
                  <p className="detail-label">Total Sent</p>
                  <p className="detail-value">{automation.totalSent}</p>
                </div>
              </div>
            </div>

            <div className="automation-card-message">
              <p className="message-label">Message Preview:</p>
              <p className="message-preview">{automation.message}</p>
            </div>

            <div className="automation-card-footer">
              <button className="card-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button className="card-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Automation</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Automation Name</label>
                <input
                  type="text"
                  name="name"
                  value={newAutomation.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Welcome New Customers"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trigger Event</label>
                <select
                  name="trigger"
                  value={newAutomation.trigger}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select a trigger...</option>
                  {triggers.map((trigger) => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.icon} {trigger.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Communication Channel</label>
                <select
                  name="channel"
                  value={newAutomation.channel}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Delay (minutes)</label>
                <input
                  type="number"
                  name="delay"
                  value={newAutomation.delay}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  value={newAutomation.message}
                  onChange={handleInputChange}
                  placeholder="Write your automated message here..."
                  className="form-textarea"
                  rows="5"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateAutomation}>
                Create Automation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutomationSection
