import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '@citizen-safety/shared';
import { apiClient } from '../api/api';
import IssueCard from '../components/IssueCard';
import FilterBar from '../components/FilterBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './IssuesListPage.css';

interface IssuesListPageProps {
  title: string;
  statusFilter?: 'open' | 'in_progress' | 'resolved';
  showBackButton?: boolean;
}

export default function IssuesListPage({ title, statusFilter, showBackButton = true }: IssuesListPageProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getIssues({ limit: 1000 });
      let fetchedIssues = response.issues;

      // Apply status filter if specified
      if (statusFilter) {
        fetchedIssues = fetchedIssues.filter((issue) => issue.status === statusFilter);
      }

      setIssues(fetchedIssues);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    // Poll every 30 seconds
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const categories = useMemo(() => {
    const cats = new Set(issues.map((issue) => issue.category));
    return Array.from(cats).sort();
  }, [issues]);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues;

    if (selectedCategory) {
      filtered = filtered.filter((issue) => issue.category === selectedCategory);
    }

    if (searchQuery) {
      // Regular text search
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.category.toLowerCase().includes(query)
      );
    }

    // Sort issues
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [issues, selectedCategory, searchQuery, sortBy]);

  if (loading && issues.length === 0) {
    return (
      <div className="issues-list-page">
        {showBackButton && (
          <Link to="/" className="issues-list-back">
            ← Back to Dashboard
          </Link>
        )}
        <div className="issues-list-loading-header">
          <h2>Loading {title.toLowerCase()}...</h2>
        </div>
        <div className="issues-list-issues">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="issues-list-page">
      {showBackButton && (
        <Link to="/" className="issues-list-back">
          ← Back to Dashboard
        </Link>
      )}

      <div className="issues-list-header">
        <h1>{title}</h1>
        <p className="issues-list-subtitle">
          {filteredAndSortedIssues.length} {filteredAndSortedIssues.length === 1 ? 'issue' : 'issues'}
          {statusFilter && ` (${statusFilter.replace('_', ' ')})`}
        </p>
      </div>

      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchIssues}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {error && (
        <div className="issues-list-error">
          <p>Error: {error}</p>
          <button onClick={fetchIssues}>Retry</button>
        </div>
      )}

      {filteredAndSortedIssues.length === 0 ? (
        <div className="issues-list-empty">
          <div className="empty-icon">🔍</div>
          <p>No issues found.</p>
          {searchQuery || selectedCategory ? (
            <p className="empty-hint">Try adjusting your filters or search query.</p>
          ) : (
            <p className="empty-hint">No {statusFilter ? statusFilter.replace('_', ' ') : ''} issues at this time.</p>
          )}
        </div>
      ) : (
        <div className={`issues-list-issues ${viewMode === 'list' ? 'list-view' : ''}`}>
          {filteredAndSortedIssues.map((issue, index) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

