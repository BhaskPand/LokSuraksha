import { Link } from 'react-router-dom';
import { Issue } from '@citizen-safety/shared';
import './IssueCard.css';

interface IssueCardProps {
  issue: Issue;
  style?: React.CSSProperties;
}

const statusColors: Record<string, string> = {
  open: 'var(--color-blue-600)',
  in_progress: 'var(--color-yellow-600)',
  resolved: 'var(--color-green-600)',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

export default function IssueCard({ issue, style }: IssueCardProps) {
  const statusColor = statusColors[issue.status] || 'var(--color-slate-500)';

  return (
    <Link to={`/issues/${issue.id}`} className="issue-card" style={style}>
      <div className="issue-card-header">
        <h3 className="issue-card-title">{issue.title}</h3>
        <span className="issue-card-status" style={{ backgroundColor: statusColor }}>
          {issue.status.replace('_', ' ')}
        </span>
      </div>
      <p className="issue-card-description">{issue.description}</p>
      <div className="issue-card-meta">
        <span className="issue-card-category">{issue.category}</span>
        <span className="issue-card-date" title={new Date(issue.created_at).toLocaleString()}>
          {formatTimeAgo(new Date(issue.created_at))}
        </span>
      </div>
      {issue.images && issue.images.length > 0 && (
        <div className="issue-card-images">
          <span>{issue.images.length} image{issue.images.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </Link>
  );
}


