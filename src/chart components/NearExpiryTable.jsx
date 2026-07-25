/**
 * File: NearExpiryTable.jsx
 * Description: Component that displays a table of inventory items that are 
 * nearing their expiration date (within 45 days) or have already expired.
 */
import { useMemo } from 'react'
import { getDaysUntilExpiry, getInventoryStatus } from '../dashboard/inventoryMetrics'
import './ChartComponents.css'

/**
 * NearExpiryTable Component
 * 
 * @param {Object} props - The component props.
 * @param {Array} props.items - The list of inventory items.
 * @returns {JSX.Element} The rendered table card.
 */
function NearExpiryTable({ items }) {
  const alertItems = useMemo(() => {
    return items
      .map((item) => ({ ...item, daysLeft: getDaysUntilExpiry(item.expiryDate) }))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 45)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 6)
  }, [items])

  return (
    <article className="surface-card near-expiry-section">
      <header>
        <div>
          <h3>Critical Near-Expiry Alerts</h3>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
            Batches expiring within the next 45 days
          </p>
        </div>
        <span className="alert-count-badge">
          ⚠ {alertItems.length} Alert{alertItems.length !== 1 ? 's' : ''}
        </span>
      </header>
      <div className="near-expiry-table-wrap">
        <table className="near-expiry-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Batch ID</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Expires</th>
              <th>Days Left</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alertItems.length > 0 ? (
              alertItems.map((item) => {
                const status = getInventoryStatus(item)
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.medicineName}</td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          background: 'var(--surface-container)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        {item.batchId}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {item.quantity.toLocaleString()}
                    </td>
                    <td>{item.expiryDate}</td>
                    <td>
                      <span
                        className={`days-badge ${item.daysLeft <= 14 ? 'days-urgent' : 'days-warning'}`}
                      >
                        {item.daysLeft}d
                      </span>
                    </td>
                    <td>
                      <span
                        className={`chip ${
                          status === 'Expired'
                            ? 'chip-critical'
                            : status === 'Near Expiry'
                              ? 'chip-warning'
                              : 'chip-primary'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr className="no-alerts-row">
                <td colSpan={7}>✓ No critical near-expiry items within 45 days.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default NearExpiryTable
