import './FilterBar.css';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
}

export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onRefresh,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-search">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-input"
        />
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
      <button className="filter-refresh" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}

