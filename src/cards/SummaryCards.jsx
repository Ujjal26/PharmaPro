import { getDaysUntilExpiry, getInventoryStatus } from '../dashboard/inventoryMetrics'
import './SummaryCards.css'

const CARD_CONFIGS = [
  {
    key: 'total-stock',
    title: 'Total Stock',
    tone: 'primary',
    icon: '◫',
    description: 'Total units in inventory',
  },
  {
    key: 'nearing-expiry',
    title: 'Nearing Expiry',
    tone: 'warning',
    icon: '⏱',
    description: 'Expiring within 30 days',
  },
  {
    key: 'low-stock',
    title: 'Low Stock',
    tone: 'critical',
    icon: '↓',
    description: 'Below minimum threshold',
  },
  {
    key: 'total-value',
    title: 'Total Value',
    tone: 'success',
    icon: '₹',
    description: 'Estimated inventory value',
  },
]

function SummaryCards({ items }) {
  const nearExpiry = items.filter((item) => {
    const days = getDaysUntilExpiry(item.expiryDate)
    return days >= 0 && days <= 30
  }).length

  const lowStock = items.filter((item) => getInventoryStatus(item) === 'Low Stock').length
  const totalValue = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const totalStock = items.reduce((acc, item) => acc + item.quantity, 0)

  const values = {
    'total-stock': totalStock.toLocaleString(),
    'nearing-expiry': nearExpiry,
    'low-stock': lowStock,
    'total-value': `₹${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
  }

  return (
    <section className="summary-cards-grid" aria-label="Inventory KPI Summary">
      {CARD_CONFIGS.map((card) => (
        <article key={card.key} className={`summary-card tone-${card.tone}`}>
          <div className="summary-card-indicator" />
          <div className="summary-card-body">
            <div className="summary-card-top">
              <p className="summary-card-title">{card.title}</p>
              <div className={`summary-card-icon tone-icon-${card.tone}`} aria-hidden="true">
                {card.icon}
              </div>
            </div>
            <div className="summary-card-value">{values[card.key]}</div>
            <p className="summary-card-desc">{card.description}</p>
          </div>
        </article>
      ))}
    </section>
  )
}

export default SummaryCards
