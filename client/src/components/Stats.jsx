import React from 'react';

export default function Stats({ total, published, hidden }) {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon-wrapper total">
          <span>🍽️</span>
        </div>
        <div className="stat-info">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Dishes</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper published">
          <span>🟢</span>
        </div>
        <div className="stat-info">
          <span className="stat-value">{published}</span>
          <span className="stat-label">Published</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper hidden">
          <span>🔴</span>
        </div>
        <div className="stat-info">
          <span className="stat-value">{hidden}</span>
          <span className="stat-label">Hidden</span>
        </div>
      </div>
    </div>
  );
}
