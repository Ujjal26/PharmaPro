/**
 * File: Sidenavbar.jsx
 * Description: The primary side navigation bar for the application. 
 * Allows users to switch between different views (Dashboard, Inventory, etc.) 
 * and provides a quick action for "New Dispense".
 */
import "./SideNavbar.css";

const navItems = [
  { label: "Dashboard", value: "dashboard", icon: "⊞" },
  { label: "Inventory", value: "inventory", icon: "◫" },
  { label: "Expiry Monitor", value: "expiry", icon: "⏱" },
  { label: "Stock Entry", value: "stock-entry", icon: "➕" },
];

/**
 * SideNavbar Component
 * 
 * @param {Object} props - The component props.
 * @param {string} props.currentView - The currently active view/page.
 * @param {Function} props.onNavigate - Callback to change the active view.
 * @returns {JSX.Element} The rendered side navigation bar.
 */
function SideNavbar({ currentView, onNavigate }) {
  return (
    <aside className="side-navbar">
      {/* Brand */}
      <div className="brand-section">
        <div className="brand-logo" style={{ background: 'transparent', border: 'none' }}>
          <img src="/logo.png" alt="PharmaPro Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <p className="brand-tag">PharmaPro CIS</p>
          <h1 className="brand-title">Clinical Inventory</h1>
        </div>
      </div>

      {/* New Dispense CTA */}
      <button
        className="new-dispense-btn"
        type="button"
        onClick={() => onNavigate("dispense")}
        id="new-dispense-cta"
      >
        <span className="new-dispense-icon">⊕</span>
        New Dispense
      </button>

      {/* Divider */}
      <div className="nav-divider">
        <span>Navigation</span>
      </div>

      {/* Nav Links */}
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            key={item.value}
            type="button"
            id={`nav-${item.value}`}
            className={`nav-link ${currentView === item.value ? "active" : ""}`}
            onClick={() => onNavigate(item.value)}
            aria-current={currentView === item.value ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
            {currentView === item.value && <span className="nav-active-bar" />}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="nav-bottom">
        <div className="nav-divider">
          <span>Help</span>
        </div>
        <button
          type="button"
          className="nav-link support-link"
          id="nav-support"
          onClick={() => onNavigate("support")}
        >
          <span className="nav-icon" aria-hidden="true">
            ⊛
          </span>
          <span className="nav-label">Support</span>
        </button>

        <div className="sidebar-version">
          <span>PharmaPro CIS</span>
          <span className="version-badge">v2.1.0</span>
        </div>
      </div>
    </aside>
  );
}

export default SideNavbar;
