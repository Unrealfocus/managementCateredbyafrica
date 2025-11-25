import React, { useState } from 'react'
import './CustomerSegmentation.css'

const CustomerSegmentation = () => {
  const [selectedSegment, setSelectedSegment] = useState('ordered')

  // Mock customer data
  const customersWithOrders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+27 82 345 6789',
      totalOrders: 3,
      totalSpent: 'R 4,250.00',
      lastOrderDate: '2025-11-23',
      avgOrderValue: 'R 1,416.67',
      firstOrderDate: '2025-10-15'
    },
    {
      id: 3,
      name: 'Amara Mbeki',
      email: 'amara.mbeki@gmail.com',
      phone: '+27 71 234 5678',
      totalOrders: 1,
      totalSpent: 'R 1,800.00',
      lastOrderDate: '2025-11-24',
      avgOrderValue: 'R 1,800.00',
      firstOrderDate: '2025-11-24'
    },
    {
      id: 5,
      name: 'Grace Ndlovu',
      email: 'grace.ndlovu@events.com',
      phone: '+27 74 567 8901',
      totalOrders: 5,
      totalSpent: 'R 12,500.00',
      lastOrderDate: '2025-11-22',
      avgOrderValue: 'R 2,500.00',
      firstOrderDate: '2025-09-10'
    },
    {
      id: 7,
      name: 'Fatima Hassan',
      email: 'fatima.h@email.com',
      phone: '+27 71 789 0123',
      totalOrders: 2,
      totalSpent: 'R 3,100.00',
      lastOrderDate: '2025-11-20',
      avgOrderValue: 'R 1,550.00',
      firstOrderDate: '2025-11-05'
    }
  ]

  const customersWithoutOrders = [
    {
      id: 2,
      name: 'Michael Okonkwo',
      email: 'm.okonkwo@company.com',
      phone: '+234 803 456 7890',
      dateAdded: '2025-11-25',
      daysSinceAdded: 0,
      source: 'Website Signup',
      lastActivity: 'Browsed menu page'
    },
    {
      id: 4,
      name: 'David Chen',
      email: 'david.chen@business.co.za',
      phone: '+27 83 456 7890',
      dateAdded: '2025-11-24',
      daysSinceAdded: 1,
      source: 'Referral',
      lastActivity: 'Added items to cart'
    },
    {
      id: 6,
      name: 'James Williams',
      email: 'j.williams@corp.com',
      phone: '+27 82 678 9012',
      dateAdded: '2025-11-23',
      daysSinceAdded: 2,
      source: 'Social Media',
      lastActivity: 'Viewed pricing page'
    },
    {
      id: 8,
      name: 'Peter van der Merwe',
      email: 'peter.vdm@company.za',
      phone: '+27 83 890 1234',
      dateAdded: '2025-11-22',
      daysSinceAdded: 3,
      source: 'Website Signup',
      lastActivity: 'Created account'
    },
    {
      id: 9,
      name: 'Thabo Mokoena',
      email: 'thabo.m@business.com',
      phone: '+27 72 345 6789',
      dateAdded: '2025-11-21',
      daysSinceAdded: 4,
      source: 'Google Ads',
      lastActivity: 'Downloaded menu PDF'
    },
    {
      id: 10,
      name: 'Linda Dlamini',
      email: 'linda.dlamini@email.com',
      phone: '+27 73 456 7890',
      dateAdded: '2025-11-20',
      daysSinceAdded: 5,
      source: 'Email Campaign',
      lastActivity: 'Opened welcome email'
    }
  ]

  // Calculate stats
  const stats = {
    withOrders: customersWithOrders.length,
    withoutOrders: customersWithoutOrders.length,
    conversionRate: ((customersWithOrders.length / (customersWithOrders.length + customersWithoutOrders.length)) * 100).toFixed(1),
    totalRevenue: customersWithOrders.reduce((sum, c) => sum + parseFloat(c.totalSpent.replace(/[^\d.]/g, '')), 0)
  }

  return (
    <div className="segmentation-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Customer Segmentation</h2>
          <p className="section-description">View customers by order status and engagement</p>
        </div>
      </div>

      {/* Segmentation Stats */}
      <div className="segmentation-stats">
        <div className="seg-stat-card primary">
          <div className="seg-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="seg-stat-info">
            <p className="seg-stat-value">{stats.withOrders}</p>
            <p className="seg-stat-label">Customers with Orders</p>
            <p className="seg-stat-detail">Total Revenue: R {stats.totalRevenue.toLocaleString('en-ZA', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="seg-stat-card warning">
          <div className="seg-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="17" y1="11" x2="23" y2="11" />
            </svg>
          </div>
          <div className="seg-stat-info">
            <p className="seg-stat-value">{stats.withoutOrders}</p>
            <p className="seg-stat-label">Customers without Orders</p>
            <p className="seg-stat-detail">Potential customers to convert</p>
          </div>
        </div>

        <div className="seg-stat-card success">
          <div className="seg-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="seg-stat-info">
            <p className="seg-stat-value">{stats.conversionRate}%</p>
            <p className="seg-stat-label">Conversion Rate</p>
            <p className="seg-stat-detail">Registered to paying customers</p>
          </div>
        </div>
      </div>

      {/* Segment Selector */}
      <div className="segment-selector">
        <button
          className={`segment-btn ordered ${selectedSegment === 'ordered' ? 'active' : ''}`}
          onClick={() => setSelectedSegment('ordered')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div>
            <p className="segment-btn-title">With Orders</p>
            <p className="segment-btn-count">{stats.withOrders} customers</p>
          </div>
        </button>

        <button
          className={`segment-btn not-ordered ${selectedSegment === 'not-ordered' ? 'active' : ''}`}
          onClick={() => setSelectedSegment('not-ordered')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <div>
            <p className="segment-btn-title">Without Orders</p>
            <p className="segment-btn-count">{stats.withoutOrders} customers</p>
          </div>
        </button>
      </div>

      {/* Customers with Orders */}
      {selectedSegment === 'ordered' && (
        <div className="segment-content">
          <div className="segment-header">
            <h3>Customers with Orders</h3>
            <div className="segment-actions">
              <button className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export List
              </button>
              <button className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email All
              </button>
            </div>
          </div>

          <div className="customers-grid">
            {customersWithOrders.map((customer) => (
              <div key={customer.id} className="customer-card ordered">
                <div className="customer-card-header">
                  <div className="customer-avatar-large">
                    {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="customer-card-info">
                    <h4 className="customer-card-name">{customer.name}</h4>
                    <p className="customer-card-email">{customer.email}</p>
                    <p className="customer-card-phone">{customer.phone}</p>
                  </div>
                </div>

                <div className="customer-card-stats">
                  <div className="card-stat">
                    <p className="card-stat-label">Total Orders</p>
                    <p className="card-stat-value">{customer.totalOrders}</p>
                  </div>
                  <div className="card-stat">
                    <p className="card-stat-label">Total Spent</p>
                    <p className="card-stat-value">{customer.totalSpent}</p>
                  </div>
                  <div className="card-stat">
                    <p className="card-stat-label">Avg Order Value</p>
                    <p className="card-stat-value">{customer.avgOrderValue}</p>
                  </div>
                  <div className="card-stat">
                    <p className="card-stat-label">Last Order</p>
                    <p className="card-stat-value small">{customer.lastOrderDate}</p>
                  </div>
                </div>

                <div className="customer-card-footer">
                  <span className="badge success">Active Customer</span>
                  <button className="card-action-btn">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers without Orders */}
      {selectedSegment === 'not-ordered' && (
        <div className="segment-content">
          <div className="segment-header">
            <h3>Customers without Orders</h3>
            <div className="segment-actions">
              <button className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export List
              </button>
              <button className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Send Follow-up
              </button>
            </div>
          </div>

          <div className="customers-grid">
            {customersWithoutOrders.map((customer) => (
              <div key={customer.id} className="customer-card not-ordered">
                <div className="customer-card-header">
                  <div className="customer-avatar-large">
                    {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="customer-card-info">
                    <h4 className="customer-card-name">{customer.name}</h4>
                    <p className="customer-card-email">{customer.email}</p>
                    <p className="customer-card-phone">{customer.phone}</p>
                  </div>
                </div>

                <div className="customer-card-details">
                  <div className="detail-row">
                    <span className="detail-label">Date Added:</span>
                    <span className="detail-value">{customer.dateAdded}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Days Since Added:</span>
                    <span className="detail-value">{customer.daysSinceAdded} days</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Source:</span>
                    <span className="detail-value">{customer.source}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Last Activity:</span>
                    <span className="detail-value">{customer.lastActivity}</span>
                  </div>
                </div>

                <div className="customer-card-footer">
                  <span className="badge warning">No Orders Yet</span>
                  <button className="card-action-btn">Send Offer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerSegmentation
