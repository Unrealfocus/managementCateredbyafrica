import React, { useState, useEffect, useRef } from 'react';
import './CustomerList.css';
import Loader from './Loader';
import ErrorMessage from './errorMessages/errorMessage';
import {
  useInfiniteCustomerList,
  useInfiniteOrderPlaced,
  useInfiniteOrderNotPlaced,
} from '../hook/useCustomerQuery';
import SkeletonRow from './skeletonLoader/CustomerListLoader';

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'ordered', 'not-ordered'
  const queryHook = {
    all: useInfiniteCustomerList,
    ordered: useInfiniteOrderPlaced,
    'not-ordered': useInfiniteOrderNotPlaced,
  }[activeTab];

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
  } = queryHook(searchTerm);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, searchTerm]);


  // Intersection Observer for auto-load on scroll
  const observerRef = useRef();
  const loadMoreRef = useRef();

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && data === undefined && searchTerm.length === 0) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  const allPages = data?.pages || [];
  const allCustomers = allPages.flatMap((page) => page.data || []);


  console.log(allCustomers)
  // const total = allPages[0]?.data?.total || 0; // Total from first page

  const transformedCustomers = allCustomers.map((c) => ({
    id: c.id,
    name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'No Name',
    email: c.email || '-',
    phone: c.mobile || '-',
    dateAdded: new Date(c.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    hasOrdered: c.order_placed === 1,
    status: c.status === 1 ? 'active' : 'inactive',
  }));

  // Stats calculation
  const stats = {
    totalCustomers: 0,
    withOrders: transformedCustomers.filter((c) => c.hasOrdered).length,
    withoutOrders: transformedCustomers.filter((c) => !c.hasOrdered).length,
    // New today: based on created_at matching today
    newToday: transformedCustomers.filter((c) =>
      c.dateAdded === new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    ).length,
  };

  return (
    <div className="customer-list-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Customer Management</h2>
          <p className="section-description">View and manage all your customers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-value">{stats.totalCustomers}</p>
            <p className="stat-label">Total Customers</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <p className="stat-value">{stats.newToday}</p>
            <p className="stat-label">New Today</p>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <p className="stat-value">{stats.withOrders}</p>
            <p className="stat-label">With Orders</p>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <p className="stat-value">{stats.withoutOrders}</p>
            <p className="stat-label">No Orders Yet</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="customer-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Customers ({stats.totalCustomers})
          </button>
          <button
            className={`filter-btn ${activeTab === 'ordered' ? 'active' : ''}`}
            onClick={() => setActiveTab('ordered')}
          >
            With Orders ({stats.withOrders})
          </button>
          <button
            className={`filter-btn ${activeTab === 'not-ordered' ? 'active' : ''}`}
            onClick={() => setActiveTab('not-ordered')}
          >
            No Orders Yet ({stats.withoutOrders})
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="customer-table-card">
        <div className="table-header">
          <h3>Customers</h3>
          <span className="results-count">
            Showing {transformedCustomers.length} of {stats.totalCustomers}
          </span>
        </div>

        <div className="table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Date Added</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>

              {isFetching && !isFetchingNextPage && transformedCustomers.length === 0 && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}
              {transformedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                transformedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="customer-name">{customer.name || 'No Name'}</p>
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
                      <span className={`order-badge ${customer.hasOrdered ? 'has-order' : 'no-order'}`}>
                        {customer.hasOrdered ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${customer.status}`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" title="View Details">👁️</button>
                        <button className="action-btn" title="Send Email">✉️</button>
                        <button className="action-btn" title="Send Message">💬</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {isFetchingNextPage && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}
            </tbody>
          </table>
        </div>
        <div ref={loadMoreRef} style={{ height: '20px' }} />



        {/* Optional: Pagination Info */}
        {/* {pagination.last_page > 1 && (
          <div className="pagination-info">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CustomerList;