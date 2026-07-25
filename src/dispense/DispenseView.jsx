import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./DispenseView.css";
import { getInventoryStatus } from "../dashboard/inventoryMetrics";
import {
  addToCart,
  removeFromCart,
  updateCartQty,
  clearCart,
  submitDispense,
  setMarkup,
} from "../slices/dispenseSlice";
import { useAuth } from "../user auth/AuthContext";

function DispenseView() {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const inventory = useSelector((state) => state.inventory.items);
  const cart = useSelector((state) => state.dispense.cart);
  const submitting = useSelector((state) => state.dispense.submitting);
  const submitError = useSelector((state) => state.dispense.submitError);
  const markupPercent = useSelector((state) => state.dispense.markupPercent);

  // Table state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Selection state
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [inputQty, setInputQty] = useState(1);

  const categories = useMemo(
    () => ["all", ...new Set(inventory.map((i) => i.category))],
    [inventory],
  );

  const filteredInventory = useMemo(() => {
    let list = inventory;
    if (category !== "all") list = list.filter((i) => i.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.medicineName.toLowerCase().includes(q) ||
          i.batchId.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [inventory, category, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInventory.length / rowsPerPage),
  );
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredInventory.slice(start, start + Number(rowsPerPage));
  }, [filteredInventory, currentPage, rowsPerPage]);

  const handlePageChange = (p) => setCurrentPage(p);

  const handleSelectRow = (item) => {
    setSelectedItemId(item.id);
    setInputQty(1);
  };

  const handleAddToCart = () => {
    const item = inventory.find((i) => i.id === selectedItemId);
    if (!item) return;
    if (inputQty > item.quantity) {
      alert(`Cannot dispense more than available stock (${item.quantity}).`);
      return;
    }
    dispatch(addToCart({ ...item, dispenseQty: Number(inputQty) }));
    setSelectedItemId(null);
    setInputQty(1);
  };

  const handleCartQtyChange = (id, newQty) => {
    dispatch(updateCartQty({ id, qty: Number(newQty) }));
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleSubmit = () => {
    if (currentUser?.uid) {
      dispatch(submitDispense(currentUser.uid));
    }
  };

  // Cart Calculations
  const totalCost = cart.reduce((s, i) => s + i.dispenseQty * i.unitPrice, 0);
  const totalUnits = cart.reduce((s, i) => s + i.dispenseQty, 0);
  const totalRevenue = totalCost * (1 + markupPercent / 100);
  const totalProfit = totalRevenue - totalCost;

  return (
    <section className="dispense-view view-enter">
      {/* Left Panel: Inventory Selector */}
      <div className="dispense-left">
        <header className="dispense-header">
          <div>
            <h2>New Dispense</h2>
            <p>Select medicines from inventory to dispense.</p>
          </div>
        </header>

        <div className="surface-card dispense-table-card">
          <div className="dispense-filters">
            <div className="dispense-filter-group">
              <label htmlFor="d-search">Search</label>
              <input
                id="d-search"
                type="search"
                className="form-control"
                placeholder="Name or Batch ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="dispense-filter-group">
              <label htmlFor="d-cat">Category</label>
              <select
                id="d-cat"
                className="form-control"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="dispense-filter-group"
              style={{ marginLeft: "auto" }}
            >
              <label htmlFor="d-rows">Rows per page</label>
              <select
                id="d-rows"
                className="form-control"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="dispense-table-wrap">
            <table className="dispense-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>Select</th>
                  <th>Medicine Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Avail. Qty</th>
                  <th style={{ width: "100px" }}>Dispense Qty</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => {
                  const status = getInventoryStatus(item);
                  const isSelected = selectedItemId === item.id;
                  const isExpired = status === "Expired";

                  return (
                    <tr
                      key={item.id}
                      className={`${isSelected ? "selected-row" : ""} ${isExpired ? "expired-row" : ""}`}
                      onClick={() => !isExpired && handleSelectRow(item)}
                    >
                      <td>
                        <input
                          type="radio"
                          name="dispenseSelect"
                          checked={isSelected}
                          disabled={isExpired}
                          readOnly
                          className="dispense-radio"
                        />
                      </td>
                      <td>
                        <div className="dt-medicine">
                          <p className="dt-name">{item.medicineName}</p>
                          <p className="dt-batch">Batch: {item.batchId}</p>
                        </div>
                      </td>
                      <td>
                        <span className="dt-cell-text">{item.category}</span>
                      </td>
                      <td>
                        <span
                          className={`chip ${
                            status === "In Stock"
                              ? "chip-success"
                              : status === "Low Stock"
                                ? "chip-warning"
                                : status === "Near Expiry"
                                  ? "chip-warning"
                                  : "chip-critical"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <span className="dt-cell-mono">{item.quantity}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            className="form-control dt-qty-input"
                            value={isSelected ? inputQty : ""}
                            onChange={(e) =>
                              setInputQty(
                                Math.min(
                                  item.quantity,
                                  Math.max(1, Number(e.target.value)),
                                ),
                              )
                            }
                            disabled={!isSelected}
                          />
                          {isSelected && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm dt-add-btn"
                              onClick={handleAddToCart}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="dispense-pagination">
            <p className="pagination-info">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredInventory.length)} of{" "}
              {filteredInventory.length} entries
            </p>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn-page"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn-page"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Cart Summary */}
      <div className="dispense-right">
        <div className="dispense-cart surface-card">
          <div className="cart-header">
            <h3>Dispense Summary</h3>
            <span className="cart-count">{cart.length} items</span>
          </div>

          {submitError && (
            <div className="auth-error-notice" style={{ margin: "12px 16px" }}>
              ⚠ {submitError}
            </div>
          )}

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty-icon">⊕</span>
                <p>No items selected.</p>
                <p style={{ fontSize: "12px", marginTop: 4 }}>
                  Select medicines from the table to build a dispense order.
                </p>
              </div>
            ) : (
              cart.map((c) => (
                <div key={c.id} className="cart-item">
                  <div className="cart-item-info">
                    <p className="cart-item-name">{c.medicineName}</p>
                    <p className="cart-item-batch">
                      Batch: {c.batchId} — Unit: ₹{c.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="cart-item-actions">
                    <input
                      type="number"
                      className="form-control cart-qty"
                      min="1"
                      max={c.maxQty}
                      value={c.dispenseQty}
                      onChange={(e) =>
                        handleCartQtyChange(c.id, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => handleRemove(c.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-markup">
              <label>Profit Margin (%)</label>
              <input
                type="number"
                className="form-control"
                min="0"
                max="200"
                value={markupPercent}
                onChange={(e) => dispatch(setMarkup(e.target.value))}
              />
            </div>
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Total Units:</span>
                <span>{totalUnits}</span>
              </div>
              <div className="cart-total-row">
                <span>Wholesale Cost:</span>
                <span>₹{totalCost.toFixed(2)}</span>
              </div>
              <div className="cart-total-row profit">
                <span>Total Profit:</span>
                <span>+₹{totalProfit.toFixed(2)}</span>
              </div>
              <div className="cart-total-row final">
                <span>Charge Amount:</span>
                <span>₹{totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => dispatch(clearCart())}
                disabled={cart.length === 0 || submitting}
              >
                Clear All
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2, background: "var(--success)" }}
                onClick={handleSubmit}
                disabled={cart.length === 0 || submitting}
              >
                {submitting ? (
                  <span className="btn-spinner" />
                ) : (
                  "Confirm Dispense"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DispenseView;
