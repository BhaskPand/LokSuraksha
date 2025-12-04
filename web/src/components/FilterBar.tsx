import { useState } from 'react';
import './FilterBar.css';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  sortBy = 'newest',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
}: FilterBarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar-top">
        <div className="filter-bar-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, description, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="filter-bar-actions">
          {onSortChange && (
            <select
              className="filter-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="status">Status</option>
            </select>
          )}
          {onViewModeChange && (
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                aria-label="Grid view"
              >
                ⬜
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => onViewModeChange('list')}
                aria-label="List view"
              >
                ☰
              </button>
            </div>
          )}
          <button
            className={`filter-refresh ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>
      <div className="filter-bar-categories">
        <button
          className={`filter-category ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onCategoryChange(null)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-category ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

