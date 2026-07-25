/**
 * File: ExpiryMonitorCards.jsx
 * Description: Component providing a detailed view of inventory items grouped 
 * by their expiry status. Includes filtering by expiry window and category,
 * and allows users to clear expired batches from the system.
 */
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./ExpiryMonitorCards.css";
import { setExpiryCategory, setExpiryWindow } from "../slices/uiSlice";
import {
  getDaysUntilExpiry,
  getInventoryStatus,
} from "../dashboard/inventoryMetrics";
import { removeItemFromFirestore } from "../slices/inventorySlice";
import { useAuth } from "../user auth/AuthContext";

/**
 * ExpiryMonitorCards Component
 * 
 * @param {Object} props - The component props.
 * @param {Array} props.items - The list of inventory items.
 * @returns {JSX.Element} The rendered expiry monitor view.
 */
function ExpiryMonitorCards({ items }) {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const expiryWindow = useSelector((state) => state.ui.expiryWindow);
  const expiryCategory = useSelector((state) => state.ui.expiryCategory);
  const [confirmId, setConfirmId] = useState(null); // id of item pending confirmation
  const [clearing, setClearing] = useState(null); // id currently being cleared

  const categories = useMemo(
    () => ["all", ...new Set(items.map((item) => item.category))],
    [items],
  );

  const filteredItems = useMemo(() => {
    const daysLimit =
      expiryWindow === "all" ? Number.POSITIVE_INFINITY : Number(expiryWindow);
    return items
      .map((item) => ({
        ...item,
        daysUntilExpiry: getDaysUntilExpiry(item.expiryDate),
      }))
      .filter(
        (item) => item.daysUntilExpiry <= daysLimit,
      )
      .filter(
        (item) => expiryCategory === "all" || item.category === expiryCategory,
      )
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [items, expiryWindow, expiryCategory]);

  const urgentCount = filteredItems.filter(
    (i) => i.daysUntilExpiry <= 14,
  ).length;
  const warningCount = filteredItems.filter(
    (i) => i.daysUntilExpiry > 14 && i.daysUntilExpiry <= 30,
  ).length;

  const getUrgencyClass = (days) => {
    if (days < 0) return "urgent expired";
    if (days <= 14) return "urgent";
    if (days <= 30) return "warning";
    return "caution";
  };
  const getUrgencyLabel = (days) => {
    if (days < 0) return "EXPIRED";
    if (days <= 7) return "CRITICAL";
    if (days <= 14) return "URGENT";
    if (days <= 30) return "WARNING";
    return "MONITOR";
  };

  const handleClearItem = async (item) => {
    if (!currentUser?.uid) return;
    setClearing(item.id);
    setConfirmId(null);
    await dispatch(
      removeItemFromFirestore({ id: item.id, userId: currentUser.uid }),
    );
    setClearing(null);
  };

  return (
    <section className="expiry-monitor view-enter">
      {/* Page Header */}
      <div className="expiry-page-header">
        <div>
          <h2>Expiry Monitor</h2>
          <p>Watchlist for upcoming batch expiries and at-risk stock.</p>
        </div>
        <div className="expiry-header-badges">
          {urgentCount > 0 && (
            <span className="expiry-badge badge-urgent">
              ⚠ {urgentCount} Urgent
            </span>
          )}
          {warningCount > 0 && (
            <span className="expiry-badge badge-warning">
              ◕ {warningCount} Warning
            </span>
          )}
          <span className="expiry-badge badge-neutral">
            {filteredItems.length} Total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="expiry-filters-bar surface-card">
        <div className="expiry-filter-group">
          <label htmlFor="expiry-window" className="filter-label">
            Expiry Window
          </label>
          <select
            id="expiry-window"
            className="form-control"
            value={expiryWindow}
            onChange={(e) => dispatch(setExpiryWindow(e.target.value))}
          >
            <option value="14">Next 14 Days</option>
            <option value="30">Next 30 Days</option>
            <option value="60">Next 60 Days</option>
            <option value="90">Next 90 Days</option>
            <option value="all">All Upcoming</option>
          </select>
        </div>
        <div className="expiry-filter-group">
          <label htmlFor="expiry-cat" className="filter-label">
            Category
          </label>
          <select
            id="expiry-cat"
            className="form-control"
            value={expiryCategory}
            onChange={(e) => dispatch(setExpiryCategory(e.target.value))}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="expiry-grid">
        {filteredItems.map((item) => {
          const urgencyClass = getUrgencyClass(item.daysUntilExpiry);
          const urgencyLabel = getUrgencyLabel(item.daysUntilExpiry);
          const status = getInventoryStatus(item);
          const isPendingConfirm = confirmId === item.id;
          const isClearing = clearing === item.id;

          return (
            <article
              key={item.id}
              className={`expiry-card ${urgencyClass} ${isClearing ? "clearing" : ""}`}
            >
              <div className="expiry-card-header">
                <span className={`urgency-chip urgency-${urgencyClass}`}>
                  {urgencyLabel}
                </span>
                <span
                  className={`chip ${
                    status === "Expired"
                      ? "chip-critical"
                      : status === "Near Expiry"
                        ? "chip-warning"
                        : "chip-success"
                  }`}
                >
                  {status}
                </span>
              </div>

              <h3 className="expiry-card-name">{item.medicineName}</h3>

              <div className="expiry-card-details">
                <div className="detail-row">
                  <span className="detail-label">Batch</span>
                  <span className="detail-value mono">{item.batchId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{item.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity</span>
                  <span className="detail-value mono">
                    {item.quantity.toLocaleString()} units
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expiry Date</span>
                  <span className="detail-value">{item.expiryDate}</span>
                </div>
              </div>

              <div className="expiry-countdown">
                <div className={`countdown-days ${urgencyClass}`}>
                  {item.daysUntilExpiry}
                </div>
                <div className="countdown-label">
                  day{item.daysUntilExpiry !== 1 ? "s" : ""} remaining
                </div>
              </div>

              {/* Clear button section */}
              {isPendingConfirm ? (
                <div className="clear-confirm">
                  <p className="clear-confirm-msg">
                    Remove this batch from inventory?
                  </p>
                  <div className="clear-confirm-btns">
                    <button
                      type="button"
                      className="btn-clear-yes"
                      onClick={() => handleClearItem(item)}
                    >
                      ✓ Yes, Clear Batch
                    </button>
                    <button
                      type="button"
                      className="btn-clear-no"
                      onClick={() => setConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`clear-item-btn ${urgencyClass}`}
                  onClick={() => setConfirmId(item.id)}
                  disabled={isClearing}
                  id={`clear-expiry-${item.id}`}
                >
                  {isClearing ? (
                    <span
                      className="btn-spinner"
                      style={{
                        width: "12px",
                        height: "12px",
                        borderWidth: "1.5px",
                      }}
                    />
                  ) : (
                    "✕ Clear Expired Batch"
                  )}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="expiry-empty-state">
          <div className="empty-icon">✓</div>
          <h3>All Clear</h3>
          <p>No items match the selected expiry window and category filters.</p>
        </div>
      )}
    </section>
  );
}

export default ExpiryMonitorCards;
