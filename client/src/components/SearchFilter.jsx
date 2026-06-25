import React from 'react';

export default function SearchFilter({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus 
}) {
  return (
    <div className="controls-container">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search dishes by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterStatus === 'published' ? 'active' : ''}`}
          onClick={() => setFilterStatus('published')}
        >
          Published
        </button>
        <button
          className={`filter-btn ${filterStatus === 'hidden' ? 'active' : ''}`}
          onClick={() => setFilterStatus('hidden')}
        >
          Hidden
        </button>
      </div>
    </div>
  );
}
