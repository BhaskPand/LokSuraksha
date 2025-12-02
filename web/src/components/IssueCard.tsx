import { Link } from 'react-router-dom';
import { Issue } from '@citizen-safety/shared';
import './IssueCard.css';

interface IssueCardProps {
  issue: Issue;
}

const statusColors: Record<string, string> = {
  open: 'var(--color-blue-600)',
  in_progress: 'var(--color-yellow-600)',
  resolved: 'var(--color-green-600)',
};

export default function IssueCard({ issue }: IssueCardProps) {
  const statusColor = statusColors[issue.status] || 'var(--color-slate-500)';

  return (
    <Link to={`/issues/${issue.id}`} className="issue-card">
      <div className="issue-card-header">
        <h3 className="issue-card-title">{issue.title}</h3>
        <span className="issue-card-status" style={{ backgroundColor: statusColor }}>
          {issue.status.replace('_', ' ')}
        </span>
      </div>
      <p className="issue-card-description">{issue.description}</p>
      <div className="issue-card-meta">
        <span className="issue-card-category">{issue.category}</span>
        <span className="issue-card-date">
          {new Date(issue.created_at).toLocaleDateString()}
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

