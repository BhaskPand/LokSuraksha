import './LoadingSkeleton.css';

export default function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-badge"></div>
      </div>
      <div className="skeleton-line skeleton-description"></div>
      <div className="skeleton-line skeleton-description short"></div>
      <div className="skeleton-footer">
        <div className="skeleton-badge small"></div>
        <div className="skeleton-line skeleton-date"></div>
      </div>
    </div>
  );
}



