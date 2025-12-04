import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Issue, IssueStatus } from '@citizen-safety/shared';
import { apiClient, getAdminToken } from '../api/api';
import './IssueView.css';

const statusOptions: IssueStatus[] = ['open', 'in_progress', 'resolved'];

export default function IssueView() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<IssueStatus>('open');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, []);

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getIssue(parseInt(id, 10));
        setIssue(data);
        setNotes(data.notes || '');
        setStatus(data.status);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch issue');
        console.error('Error fetching issue:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !isAdmin) return;

    try {
      setUpdating(true);
      const updated = await apiClient.updateIssue(parseInt(id, 10), {
        status,
        notes: notes || undefined,
      });
      setIssue(updated);
      alert('Issue updated successfully!');
    } catch (err: any) {
      alert('Failed to update issue: ' + (err.message || 'Unknown error'));
      console.error('Error updating issue:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getMapUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  if (loading) {
    return (
      <div className="issue-view-loading">
        <p>Loading issue...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="issue-view-error">
        <p>Error: {error || 'Issue not found'}</p>
        <Link to="/">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="issue-view">
      <Link to="/" className="issue-view-back">
        ← Back to Dashboard
      </Link>

      <div className="issue-view-header">
        <h1>{issue.title}</h1>
        <span
          className="issue-view-status"
          style={{
            backgroundColor:
              issue.status === 'open'
                ? 'var(--color-blue-600)'
                : issue.status === 'in_progress'
                ? 'var(--color-yellow-600)'
                : 'var(--color-green-600)',
          }}
        >
          {issue.status.replace('_', ' ')}
        </span>
      </div>

      <div className="issue-view-content">
        <div className="issue-view-main">
          <div className="issue-view-section">
            <h2>Description</h2>
            <p>{issue.description}</p>
          </div>

          <div className="issue-view-section">
            <h2>Category</h2>
            <p>{issue.category}</p>
          </div>

          <div className="issue-view-section">
            <h2>Location</h2>
            <p>
              {issue.location_lat.toFixed(6)}, {issue.location_lng.toFixed(6)}
            </p>
            <a
              href={getMapUrl(issue.location_lat, issue.location_lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="issue-view-map-link"
            >
              View on Google Maps →
            </a>
          </div>

          {issue.images && issue.images.length > 0 && (
            <div className="issue-view-section">
              <h2>Images ({issue.images.length})</h2>
              <div className="issue-view-images">
                {issue.images.map((image, index) => (
                  <div key={index} className="issue-view-image-container">
                    <img
                      src={image}
                      alt={`Issue image ${index + 1}`}
                      className="issue-view-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.contact_name || issue.contact_phone ? (
            <div className="issue-view-section">
              <h2>Contact Information</h2>
              {issue.contact_name && <p>Name: {issue.contact_name}</p>}
              {issue.contact_phone && <p>Phone: {issue.contact_phone}</p>}
            </div>
          ) : null}

          <div className="issue-view-section">
            <h2>Submitted</h2>
            <p>{new Date(issue.created_at).toLocaleString()}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="issue-view-admin">
            <h2>Admin Controls</h2>
            <div className="issue-view-admin-field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="issue-view-admin-field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Add admin notes..."
              />
            </div>
            <button
              className="issue-view-update-btn"
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Issue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

