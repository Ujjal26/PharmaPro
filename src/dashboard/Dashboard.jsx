import './Dashboard.css'
import SummaryCards from '../cards/SummaryCards'
import StockLevelOverview from '../chart components/StockLevelOverview'
import RecentActivityFeed from '../chart components/RecentActivityFeed'
import NearExpiryTable from '../chart components/NearExpiryTable'
import StockTrendGraph from '../chart components/StockTrendGraph'
import CsvImportExport from './CsvImportExport'

function Dashboard({ items, activities }) {
  const now = new Date()
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const todayStr = now.toLocaleDateString(undefined, dateOptions)

  return (
    <section className="dashboard-view view-enter">
      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of clinical inventory, alerts, and recent activities.</p>
        </div>
        <div className="dashboard-date-badge">
          <span className="calendar-icon">📅</span>
          <span>{todayStr}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <SummaryCards items={items} />

      {/* CSV Import/Export */}
      <CsvImportExport items={items} />

      {/* Middle Grid: Stock Levels & Activity */}
      <div className="dashboard-grid">
        <StockLevelOverview items={items} />
        <RecentActivityFeed activities={activities} />
      </div>

      {/* Bottom section: Line Graph and Near Expiry */}
      <div className="dashboard-grid-bottom">
        <StockTrendGraph items={items} />
        <NearExpiryTable items={items} />
      </div>
    </section>
  )
}

export default Dashboard
