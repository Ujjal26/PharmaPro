import { useMemo } from 'react'
import { getStockPercent } from '../dashboard/inventoryMetrics'
import './ChartComponents.css'

function StockLevelOverview({ items }) {
  const categoryLevels = useMemo(() => {
    const categoryMap = new Map()

    items.forEach((item) => {
      const current = categoryMap.get(item.category) || { total: 0, count: 0 }
      current.total += getStockPercent(item)
      current.count += 1
      categoryMap.set(item.category, current)
    })

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        stockLevel: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.stockLevel - a.stockLevel)
  }, [items])

  const getBarClass = (level) => {
    if (level <= 35) return 'bar-critical'
    if (level <= 60) return 'bar-warning'
    return ''
  }

  return (
    <article className="surface-card chart-card">
      <header>
        <div>
          <h3>Stock Level Overview</h3>
          <p>Average stock health by medicine category.</p>
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
          {items.length} SKUs
        </span>
      </header>
      <div className="bar-chart">
        {categoryLevels.map((row) => (
          <div key={row.category} className="bar-row">
            <p title={row.category}>{row.category}</p>
            <div className="bar-track">
              <div
                className={`bar-fill ${getBarClass(row.stockLevel)}`}
                style={{ width: `${row.stockLevel}%` }}
              />
            </div>
            <span>{row.stockLevel}%</span>
          </div>
        ))}
        {categoryLevels.length === 0 && (
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>
            No inventory data available.
          </p>
        )}
      </div>
    </article>
  )
}

export default StockLevelOverview
