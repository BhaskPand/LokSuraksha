import { useState, useEffect, useMemo } from 'react';
import { Issue } from '@citizen-safety/shared';
import { apiClient } from '../api/api';
import IssueCard from '../components/IssueCard';
import FilterBar from '../components/FilterBar';
import AnalyticsWidget from '../components/AnalyticsWidget';
import './Dashboard.css';

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getIssues({ limit: 100 });
      setIssues(response.issues);
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
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(issues.map((issue) => issue.category));
    return Array.from(cats).sort();
  }, [issues]);

  const filteredIssues = useMemo(() => {
    let filtered = issues;

    if (selectedCategory) {
      filtered = filtered.filter((issue) => issue.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [issues, selectedCategory, searchQuery]);

  if (loading && issues.length === 0) {
    return (
      <div className="dashboard-loading">
        <p>Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchIssues}
      />

      {issues.length > 0 && <AnalyticsWidget issues={issues} />}

      {error && (
        <div className="dashboard-error">
          <p>Error: {error}</p>
          <button onClick={fetchIssues}>Retry</button>
        </div>
      )}

      <div className="dashboard-header">
        <h2>
          Issues ({filteredIssues.length} of {issues.length})
        </h2>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="dashboard-empty">
          <p>No issues found.</p>
        </div>
      ) : (
        <div className="dashboard-issues">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

