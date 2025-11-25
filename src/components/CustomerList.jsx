import React, { useState } from 'react'
import './CustomerList.css'

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for newly added customers
  const customers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+27 82 345 6789',
      dateAdded: '2025-11-25',
      hasOrdered: true,
      totalOrders: 3,
      totalSpent: 'R 4,250.00',
      lastOrder: '2025-11-23',
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Okonkwo',
      email: 'm.okonkwo@company.com',
      phone: '+234 803 456 7890',
      dateAdded: '2025-11-25',
      hasOrdered: false,
      totalOrders: 0,
      totalSpent: 'R 0.00',
      lastOrder: null,
      status: 'new'
    },
    {
      id: 3,
      name: 'Amara Mbeki',
      email: 'amara.mbeki@gmail.com',
      phone: '+27 71 234 5678',
      dateAdded: '2025-11-24',
      hasOrdered: true,
      totalOrders: 1,
      totalSpent: 'R 1,800.00',
      lastOrder: '2025-11-24',
      status: 'active'
    },
    {
      id: 4,
      name: 'David Chen',
      email: 'david.chen@business.co.za',
      phone: '+27 83 456 7890',
      dateAdded: '2025-11-24',
      hasOrdered: false,
      totalOrders: 0,
      totalSpent: 'R 0.00',
      lastOrder: null,
      status: 'new'
    },
    {
      id: 5,
      name: 'Grace Ndlovu',
      email: 'grace.ndlovu@events.com',
      phone: '+27 74 567 8901',
      dateAdded: '2025-11-23',
      hasOrdered: true,
      totalOrders: 5,
      totalSpent: 'R 12,500.00',
      lastOrder: '2025-11-22',
      status: 'vip'
    },
    {
      id: 6,
      name: 'James Williams',
      email: 'j.williams@corp.com',
      phone: '+27 82 678 9012',
      dateAdded: '2025-11-23',
      hasOrdered: false,
      totalOrders: 0,
      totalSpent: 'R 0.00',
      lastOrder: null,
      status: 'new'
    },
    {
      id: 7,
      name: 'Fatima Hassan',
      email: 'fatima.h@email.com',
      phone: '+27 71 789 0123',
      dateAdded: '2025-11-22',
      hasOrdered: true,
      totalOrders: 2,
      totalSpent: 'R 3,100.00',
      lastOrder: '2025-11-20',
      status: 'active'
    },
    {
      id: 8,
      name: 'Peter van der Merwe',
      email: 'peter.vdm@company.za',
      phone: '+27 83 890 1234',
      dateAdded: '2025-11-22',
      hasOrdered: false,
      totalOrders: 0,
      totalSpent: 'R 0.00',
      lastOrder: null,
      status: 'new'
    }
  ]

  // Summary stats
  const stats = {
    totalCustomers: customers.length,
    newToday: customers.filter(c => c.dateAdded === '2025-11-25').length,
    withOrders: customers.filter(c => c.hasOrdered).length,
    withoutOrders: customers.filter(c => !c.hasOrdered).length
  }

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'ordered' && customer.hasOrdered) ||
                         (filterStatus === 'not-ordered' && !customer.hasOrdered)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="customer-list-container">
      {/* Header Section */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Customer Management</h2>
          <p className="section-description">View and manage all your customers</p>
        </div>
        <button className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.totalCustomers}</p>
            <p className="stat-label">Total Customers</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="16 11 18 13 22 9" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.newToday}</p>
            <p className="stat-label">New Today</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.withOrders}</p>
            <p className="stat-label">With Orders</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="17" y1="11" x2="23" y2="11" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.withoutOrders}</p>
            <p className="stat-label">Without Orders</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="customer-controls">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Customers
          </button>
          <button
            className={`filter-btn ${filterStatus === 'ordered' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ordered')}
          >
            With Orders
          </button>
          <button
            className={`filter-btn ${filterStatus === 'not-ordered' ? 'active' : ''}`}
            onClick={() => setFilterStatus('not-ordered')}
          >
            No Orders Yet
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="customer-table-card">
        <div className="table-header">
          <h3>Recent Customers</h3>
          <span className="results-count">{filteredCustomers.length} results</span>
        </div>

        <div className="table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Date Added</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="customer-name">{customer.name}</p>
                        <p className="customer-email">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="customer-phone">{customer.phone}</p>
                  </td>
                  <td>
                    <p className="date-text">{customer.dateAdded}</p>
                  </td>
                  <td>
                    <div className="order-info">
                      <span className={`order-badge ${customer.hasOrdered ? 'has-order' : 'no-order'}`}>
                        {customer.totalOrders}
                      </span>
                      {customer.lastOrder && (
                        <span className="last-order">Last: {customer.lastOrder}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <p className="amount-text">{customer.totalSpent}</p>
                  </td>
                  <td>
                    <span className={`status-badge ${customer.status}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn" title="View Details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button className="action-btn" title="Send Email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </button>
                      <button className="action-btn" title="Send Message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CustomerList
