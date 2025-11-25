import React from 'react';
import './TopProducts.css';

const TopProducts = () => {
  const products = [
    { rank: 1, name: 'Home Decor Range', popularity: 85, sales: 45, color: '#ef4444' },
    { rank: 2, name: 'Disney Princess Pink Bag 18', popularity: 75, sales: 29, color: '#10b981' },
    { rank: 3, name: 'Bathroom Essentials', popularity: 60, sales: 18, color: '#a855f7' },
    { rank: 4, name: 'Apple Smartwatches', popularity: 50, sales: 25, color: '#f59e0b' },
  ];

  return (
    <div className="top-products">
      <div className="chart-header">
        <h3>Top Products</h3>
      </div>

      <div className="products-list">
        <div className="products-header">
          <span className="col-rank">#</span>
          <span className="col-name">Name</span>
          <span className="col-popularity">Popularity</span>
          <span className="col-sales">Sales</span>
        </div>

        {products.map((product) => (
          <div key={product.rank} className="product-row">
            <span className="col-rank">{`0${product.rank}`}</span>
            <span className="col-name">{product.name}</span>
            <div className="col-popularity">
              <div className="popularity-bar">
                <div
                  className="popularity-fill"
                  style={{
                    width: `${product.popularity}%`,
                    backgroundColor: product.color,
                  }}
                ></div>
              </div>
            </div>
            <span className="col-sales">
              <span className="sales-badge" style={{ backgroundColor: product.color }}>
                {product.sales}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
