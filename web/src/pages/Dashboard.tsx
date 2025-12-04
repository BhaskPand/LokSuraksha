import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue, Statistics } from '@citizen-safety/shared';
import { apiClient } from '../api/api';
import IssueCard from '../components/IssueCard';
import FilterBar from '../components/FilterBar';
import AnalyticsWidget from '../components/AnalyticsWidget';
import StatsCard from '../components/StatsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const stats = await apiClient.getStatistics();
      setStatistics(stats);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      // Don't show error for stats, just log it
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchStatistics();
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchIssues();
      fetchStatistics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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
      // Handle special filter prefixes
      if (searchQuery.startsWith('status:')) {
        const status = searchQuery.substring(7).toLowerCase();
        filtered = filtered.filter((issue) => issue.status === status);
      } else if (searchQuery.startsWith('since:')) {
        const sinceDate = new Date(searchQuery.substring(6));
        filtered = filtered.filter((issue) => new Date(issue.created_at) >= sinceDate);
      } else {
        // Regular text search
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (issue) =>
            issue.title.toLowerCase().includes(query) ||
            issue.description.toLowerCase().includes(query) ||
            issue.category.toLowerCase().includes(query)
        );
      }
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

  // Calculate statistics from issues (fallback if API stats not available)
  const fallbackStats = useMemo(() => {
    const total = issues.length;
    const open = issues.filter((i) => i.status === 'open').length;
    const inProgress = issues.filter((i) => i.status === 'in_progress').length;
    const resolved = issues.filter((i) => i.status === 'resolved').length;
    const categories = new Set(issues.map((i) => i.category)).size;

    return { total, open, inProgress, resolved, categories };
  }, [issues]);

  // Use API statistics if available, otherwise use fallback
  const displayStats = statistics || {
    total: { value: fallbackStats.total, previous: 0, trend: 0 },
    open: { value: fallbackStats.open, previous: 0, trend: 0 },
    inProgress: { value: fallbackStats.inProgress, previous: 0, trend: 0 },
    resolved: { value: fallbackStats.resolved, previous: 0, trend: 0 },
    today: { value: 0, previous: 0, trend: 0 },
    thisWeek: { value: 0, previous: 0, trend: 0 },
    thisMonth: { value: 0, previous: 0, trend: 0 },
    averageResolutionTime: { value: 0, previous: 0, trend: 0 },
    resolutionRate: { value: 0, previous: 0, trend: 0 },
    byCategory: {},
    byStatus: {},
    recentActivity: { last24Hours: 0, last7Days: 0, last30Days: 0 },
  };

  const handleCardClick = (filterType: 'all' | 'open' | 'inProgress' | 'resolved' | 'today' | 'week' | 'month') => {
    // Navigate to dedicated pages for main filters
    if (filterType === 'all') {
      navigate('/issues');
    } else if (filterType === 'inProgress') {
      navigate('/issues/in-progress');
    } else if (filterType === 'resolved') {
      navigate('/issues/resolved');
    } else if (filterType === 'open') {
      navigate('/issues/open');
    } else if (filterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setSelectedCategory(null);
      setSearchQuery(`since:${today.toISOString()}`);
    } else if (filterType === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      setSelectedCategory(null);
      setSearchQuery(`since:${weekAgo.toISOString()}`);
    } else if (filterType === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setSelectedCategory(null);
      setSearchQuery(`since:${monthAgo.toISOString()}`);
    }
  };

  if (loading && issues.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading-header">
          <h2>Loading issues...</h2>
        </div>
        <div className="dashboard-issues">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const formatTime = (hours: number): string => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  return (
    <div className="dashboard">
      {/* Statistics Cards */}
      <div className="dashboard-stats">
        {statsLoading && !statistics && (
          <>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="stats-card-loading">
                <div className="stats-card-skeleton"></div>
              </div>
            ))}
          </>
        )}
        {(!statsLoading || statistics) && (
          <>
        <StatsCard
          title="Total Issues"
          value={displayStats.total.value}
          icon="📊"
          color="var(--color-purple-600)"
          trend={{
            value: displayStats.total.trend,
            isPositive: displayStats.total.trend >= 0,
          }}
          onClick={() => handleCardClick('all')}
        />
        <StatsCard
          title="Open"
          value={displayStats.open.value}
          icon="🔵"
          color="var(--color-blue-600)"
          trend={{
            value: displayStats.open.trend,
            isPositive: displayStats.open.trend <= 0, // Negative trend is positive for open issues
          }}
          onClick={() => handleCardClick('open')}
        />
        <StatsCard
          title="In Progress"
          value={displayStats.inProgress.value}
          icon="🟡"
          color="var(--color-yellow-600)"
          trend={{
            value: displayStats.inProgress.trend,
            isPositive: displayStats.inProgress.trend >= 0,
          }}
          onClick={() => handleCardClick('inProgress')}
        />
        <StatsCard
          title="Resolved"
          value={displayStats.resolved.value}
          icon="✅"
          color="var(--color-green-600)"
          trend={{
            value: displayStats.resolved.trend,
            isPositive: displayStats.resolved.trend >= 0,
          }}
          onClick={() => handleCardClick('resolved')}
        />
        <StatsCard
          title="Today"
          value={displayStats.today.value}
          icon="📅"
          color="var(--color-indigo-600)"
          trend={{
            value: displayStats.today.trend,
            isPositive: displayStats.today.trend >= 0,
          }}
          onClick={() => handleCardClick('today')}
        />
        <StatsCard
          title="This Week"
          value={displayStats.thisWeek.value}
          icon="📆"
          color="var(--color-teal-600)"
          trend={{
            value: displayStats.thisWeek.trend,
            isPositive: displayStats.thisWeek.trend >= 0,
          }}
          onClick={() => handleCardClick('week')}
        />
        <StatsCard
          title="Resolution Rate"
          value={`${displayStats.resolutionRate.value.toFixed(1)}%`}
          icon="📈"
          color="var(--color-emerald-600)"
          trend={{
            value: displayStats.resolutionRate.trend,
            isPositive: displayStats.resolutionRate.trend >= 0,
          }}
        />
        <StatsCard
          title="Avg Resolution"
          value={displayStats.averageResolutionTime.value > 0 ? formatTime(displayStats.averageResolutionTime.value) : 'N/A'}
          icon="⏱️"
          color="var(--color-amber-600)"
          trend={{
            value: displayStats.averageResolutionTime.trend,
            isPositive: displayStats.averageResolutionTime.trend <= 0, // Negative trend is positive (faster resolution)
          }}
        />
          </>
        )}
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

      {issues.length > 0 && <AnalyticsWidget issues={issues} />}

      {error && (
        <div className="dashboard-error">
          <p>Error: {error}</p>
          <button onClick={fetchIssues}>Retry</button>
        </div>
      )}

      <div className="dashboard-header">
        <h2>
          Issues ({filteredAndSortedIssues.length} of {issues.length})
        </h2>
      </div>

      {filteredAndSortedIssues.length === 0 ? (
        <div className="dashboard-empty">
          <div className="empty-icon">🔍</div>
          <p>No issues found.</p>
          {searchQuery || selectedCategory ? (
            <p className="empty-hint">Try adjusting your filters or search query.</p>
          ) : null}
        </div>
      ) : (
        <div className={`dashboard-issues ${viewMode === 'list' ? 'list-view' : ''}`}>
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


