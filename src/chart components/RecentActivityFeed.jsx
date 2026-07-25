/**
 * File: RecentActivityFeed.jsx
 * Description: Component that displays a timeline of recent stock entry 
 * activities, showing medicine names, batches, quantities, and timestamps.
 */
import './ChartComponents.css'

/**
 * RecentActivityFeed Component
 * 
 * @param {Object} props - The component props.
 * @param {Array} props.activities - The list of recent activity records.
 * @returns {JSX.Element} The rendered activity feed card.
 */
function RecentActivityFeed({ activities }) {
  const formatTime = (iso) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHrs < 24) return `${diffHrs}h ago`
    return `${diffDays}d ago`
  }

  return (
    <article className="surface-card chart-card">
      <header>
        <div>
          <h3>Recent Activities</h3>
          <p>Latest stock operations from clinical staff.</p>
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--on-surface-variant)',
            background: 'var(--surface-container)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--outline-variant)',
            fontWeight: 500,
          }}
        >
          {activities.length} entries
        </span>
      </header>
      <ul className="activity-feed">
        {activities.map((activity) => (
          <li key={activity.id}>
            <div className="activity-icon" aria-hidden="true">
              ⊕
            </div>
            <div className="activity-body">
              <p className="activity-title">{activity.medicineName}</p>
              <p className="activity-meta">
                Batch <span>{activity.batchId}</span> &middot; Qty +{activity.quantity}
              </p>
            </div>
            <time className="activity-time" dateTime={activity.submittedAt}>
              {formatTime(activity.submittedAt)}
            </time>
          </li>
        ))}
        {activities.length === 0 && (
          <li
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '24px',
              color: 'var(--on-surface-variant)',
              fontSize: '13px',
            }}
          >
            No recent activity.
          </li>
        )}
      </ul>
    </article>
  )
}

export default RecentActivityFeed
