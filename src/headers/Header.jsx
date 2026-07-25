import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Header.css";
import {
  setGlobalSearch,
  markAlertRead,
  markAllAlertsRead,
} from "../slices/uiSlice";
import UserAuthPanel from "../user auth/UserAuthPanel";

function Header() {
  const dispatch = useDispatch();
  const globalSearch = useSelector((state) => state.ui.globalSearch);
  const inventory = useSelector((state) => state.inventory.items);
  const readAlertIds = useSelector((state) => state.ui.readAlertIds);
  const inputRef = useRef(null);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (
        event.key === "Escape" &&
        document.activeElement === inputRef.current
      ) {
        dispatch(setGlobalSearch(""));
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const onOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    if (showNotif) document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [showNotif]);

  // Build alert items (items expiring within 14 days)
  const alertItems = inventory
    .map((item) => {
      const today = new Date();
      const expiry = new Date(item.expiryDate);
      const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return { ...item, daysLeft: days };
    })
    .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const unreadAlerts = alertItems.filter(
    (item) => !readAlertIds.includes(item.id),
  );
  const unreadCount = unreadAlerts.length;

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().includes("MAC");

  const handleMarkRead = (id) => {
    dispatch(markAlertRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAlertsRead(alertItems.map((i) => i.id)));
  };

  return (
    <header className="top-header">
      {/* Search */}
      <div className="search-shell" role="search">
        <span className="search-icon" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id="global-search"
          type="search"
          placeholder="Search medicines, SKUs, batches…"
          value={globalSearch}
          onChange={(e) => dispatch(setGlobalSearch(e.target.value))}
          aria-label="Global search"
          autoComplete="off"
        />
        {globalSearch && (
          <button
            type="button"
            className="search-clear"
            onClick={() => dispatch(setGlobalSearch(""))}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        <span
          className="shortcut-pill"
          aria-label={`${isMac ? "Cmd" : "Ctrl"} + K`}
        >
          {isMac ? "⌘" : "Ctrl"} K
        </span>
      </div>

      {/* Right actions */}
      <div className="header-actions">
        {/* Notification bell */}
        <div className="notif-wrap" ref={notifRef}>
          <button
            type="button"
            id="notification-bell"
            className="icon-btn"
            aria-label={`${unreadCount} unread alerts`}
            onClick={() => setShowNotif((s) => !s)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notif-badge" aria-hidden="true">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="notif-dropdown" role="dialog" aria-label="Alerts">
              <div className="notif-header">
                <p className="notif-title">
                  Expiry Alerts
                  {unreadCount > 0 && (
                    <span className="notif-unread-count">
                      {unreadCount} unread
                    </span>
                  )}
                </p>
                {alertItems.length > 0 && unreadCount > 0 && (
                  <button
                    type="button"
                    className="mark-all-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  className="notif-close"
                  onClick={() => setShowNotif(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {alertItems.length > 0 ? (
                <ul className="notif-list">
                  {alertItems.map((item) => {
                    const isRead = readAlertIds.includes(item.id);
                    return (
                      <li
                        key={item.id}
                        className={`notif-item ${isRead ? "notif-read" : "notif-unread"}`}
                      >
                        <div className="notif-item-icon">
                          {item.daysLeft <= 7 ? "🔴" : "🟡"}
                        </div>
                        <div className="notif-item-body">
                          <p className="notif-item-title">
                            {item.medicineName}
                          </p>
                          <p className="notif-item-sub">
                            Batch {item.batchId} — expires in{" "}
                            <strong
                              style={{
                                color:
                                  item.daysLeft <= 7
                                    ? "var(--critical)"
                                    : "var(--warning)",
                              }}
                            >
                              {item.daysLeft}d
                            </strong>
                          </p>
                        </div>
                        {!isRead && (
                          <button
                            type="button"
                            className="mark-read-btn"
                            onClick={() => handleMarkRead(item.id)}
                            aria-label={`Mark ${item.medicineName} alert as read`}
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        {isRead && <span className="read-badge">Read</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="notif-empty">
                  <p>✓ No critical near-expiry alerts</p>
                </div>
              )}
            </div>
          )}
        </div>

        <UserAuthPanel />
      </div>
    </header>
  );
}

export default Header;
