/* eslint-disable react-hooks/static-components */
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInventoryCategoryFilter,
  setInventoryStatusFilter,
  setInventoryDensity,
} from "../slices/uiSlice";
import {
  getDaysUntilExpiry,
  getInventoryStatus,
  getStockPercent,
} from "../dashboard/inventoryMetrics";
import "./InventoryTable.css";

const PAGE_SIZES = [10, 20, 50];
const SORT_KEYS = {
  medicineName: (a, b) => a.medicineName.localeCompare(b.medicineName),
  category: (a, b) => a.category.localeCompare(b.category),
  quantity: (a, b) => a.quantity - b.quantity,
  unitPrice: (a, b) => a.unitPrice - b.unitPrice,
  expiryDate: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
};

function InventoryTable({ items }) {
  const dispatch = useDispatch();
  const categoryFilter = useSelector(
    (state) => state.ui.inventoryCategoryFilter,
  );
  const statusFilter = useSelector((state) => state.ui.inventoryStatusFilter);
  const density = useSelector((state) => state.ui.inventoryDensity);

  const [sortKey, setSortKey] = useState("medicineName");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const categories = useMemo(
    () => ["all", ...new Set(items.map((i) => i.category))],
    [items],
  );

  const processedItems = useMemo(() => {
    let result = items.map((item) => ({
      ...item,
      daysLeft: getDaysUntilExpiry(item.expiryDate),
      status: getInventoryStatus(item),
      stockPct: getStockPercent(item),
    }));

    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }

    const comparator = SORT_KEYS[sortKey];
    if (comparator) {
      result.sort((a, b) =>
        sortDir === "asc" ? comparator(a, b) : comparator(b, a),
      );
    }

    return result;
  }, [items, categoryFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processedItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageSlice = processedItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <span className="sort-icon neutral">⇅</span>;
    return (
      <span className="sort-icon active">{sortDir === "asc" ? "↑" : "↓"}</span>
    );
  };

  const getStatusChipClass = (status) => {
    if (status === "Expired") return "chip chip-critical";
    if (status === "Near Expiry") return "chip chip-warning";
    if (status === "Low Stock") return "chip chip-warning";
    return "chip chip-success";
  };

  const getStockBarClass = (pct) => {
    if (pct <= 35) return "stock-bar-fill critical";
    if (pct <= 60) return "stock-bar-fill warning";
    return "stock-bar-fill healthy";
  };

  return (
    <section className="inventory-section view-enter">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p>Active pharmaceutical stock across all categories.</p>
        </div>
        <div className="inv-controls">
          <div className="density-toggle">
            {["compact", "comfortable"].map((mode) => (
              <button
                key={mode}
                type="button"
                className={density === mode ? "active" : ""}
                onClick={() => dispatch(setInventoryDensity(mode))}
              >
                {mode === "compact" ? "≡" : "☰"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="inv-filters surface-card">
        <div className="inv-filter-group">
          <label htmlFor="cat-filter" className="filter-label">
            Category
          </label>
          <select
            id="cat-filter"
            className="form-control"
            value={categoryFilter}
            onChange={(e) => {
              dispatch(setInventoryCategoryFilter(e.target.value));
              setPage(1);
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>

        <div className="inv-filter-group">
          <label htmlFor="status-filter" className="filter-label">
            Status
          </label>
          <select
            id="status-filter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => {
              dispatch(setInventoryStatusFilter(e.target.value));
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Near Expiry">Near Expiry</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="inv-filter-group">
          <label htmlFor="page-size" className="filter-label">
            Rows per page
          </label>
          <select
            id="page-size"
            className="form-control"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} rows
              </option>
            ))}
          </select>
        </div>

        <div className="inv-results-count">
          {processedItems.length} result{processedItems.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="inv-table-wrap surface-card">
        <table className={`inv-table density-${density}`}>
          <thead>
            <tr>
              <th
                onClick={() => handleSort("medicineName")}
                className="sortable"
              >
                Medicine Name <SortIcon column="medicineName" />
              </th>
              <th onClick={() => handleSort("category")} className="sortable">
                Category <SortIcon column="category" />
              </th>
              <th>Batch ID</th>
              <th onClick={() => handleSort("quantity")} className="sortable">
                Stock Level <SortIcon column="quantity" />
              </th>
              <th onClick={() => handleSort("unitPrice")} className="sortable">
                Unit Price <SortIcon column="unitPrice" />
              </th>
              <th onClick={() => handleSort("expiryDate")} className="sortable">
                Expiry Date <SortIcon column="expiryDate" />
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.length > 0 ? (
              pageSlice.map((item) => (
                <tr key={item.id} className="inv-row">
                  <td className="medicine-name-cell">
                    <div className="medicine-name">{item.medicineName}</div>
                    <div className="medicine-id">{item.id}</div>
                  </td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td>
                    <span className="batch-id mono">{item.batchId}</span>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <div className="stock-bar-track">
                        <div
                          className={getStockBarClass(item.stockPct)}
                          style={{ width: `${item.stockPct}%` }}
                        />
                      </div>
                      <span className="stock-qty mono">
                        {item.quantity.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="price-cell mono">
                    ₹{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="expiry-cell">
                    <span className={item.daysLeft <= 30 ? "expiry-near" : ""}>
                      {item.expiryDate}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusChipClass(item.status)}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-table-row">
                  No inventory items match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="inv-pagination">
        <span className="pagination-info">
          Showing{" "}
          {Math.min((safePage - 1) * pageSize + 1, processedItems.length)}–
          {Math.min(safePage * pageSize, processedItems.length)} of{" "}
          {processedItems.length}
        </span>
        <div className="pagination-controls">
          <button
            type="button"
            className="pg-btn"
            disabled={safePage <= 1}
            onClick={() => setPage(1)}
            aria-label="First page"
          >
            «
          </button>
          <button
            type="button"
            className="pg-btn"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
            )
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) {
                acc.push("…");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="pg-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`pg-btn pg-num ${safePage === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ),
            )}
          <button
            type="button"
            className="pg-btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            ›
          </button>
          <button
            type="button"
            className="pg-btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage(totalPages)}
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </section>
  );
}

export default InventoryTable;
