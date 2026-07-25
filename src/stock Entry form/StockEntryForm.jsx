/**
 * File: StockEntryForm.jsx
 * Description: Form for clinical staff to add new medicine batches to the 
 * inventory. Handles input validation, formatting, and submission to Firestore.
 */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitStockEntry } from "../slices/stockEntrySlice";
import { addItemToFirestore, fetchInventory } from "../slices/inventorySlice";
import "./StockEntryForm.css";

import { useAuth } from "../user auth/AuthContext";

const CATEGORIES = [
  "Analgesic",
  "Antacid",
  "Antibiotic",
  "Antidiabetic",
  "Antihistamine",
  "Antihypertensive",
  "Antiviral",
  "Corticosteroid",
  "NSAID",
  "Statin",
  "Other",
];

const EMPTY_FORM = {
  medicineName: "",
  category: "",
  batchId: "",
  manufacturer: "",
  quantity: "",
  minStockLevel: "",
  unitPrice: "",
  expiryDate: "",
  storageCondition: "",
  notes: "",
};

/**
 * StockEntryForm Component
 * 
 * @returns {JSX.Element} The rendered stock entry form.
 */
function StockEntryForm() {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const recentEntries = useSelector((state) => state.stockEntry.recentEntries);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      dispatch(fetchInventory(currentUser.uid));
    }
  }, [dispatch, currentUser]);

  const validate = () => {
    const errs = {};
    if (!form.medicineName.trim())
      errs.medicineName = "Medicine name is required.";
    if (!form.category) errs.category = "Please select a category.";
    if (!form.batchId.trim()) errs.batchId = "Batch ID is required.";
    if (
      !form.quantity ||
      isNaN(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    )
      errs.quantity = "Quantity must be a positive number.";
    if (
      !form.minStockLevel ||
      isNaN(Number(form.minStockLevel)) ||
      Number(form.minStockLevel) <= 0
    )
      errs.minStockLevel = "Minimum stock level required.";
    if (
      !form.unitPrice ||
      isNaN(Number(form.unitPrice)) ||
      Number(form.unitPrice) <= 0
    )
      errs.unitPrice = "Unit price must be a positive number.";
    if (!form.expiryDate) errs.expiryDate = "Expiry date is required.";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const capitalize = (str) => str.replace(/\b\w/g, (l) => l.toUpperCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const id = `INV-${String(Date.now()).slice(-5)}`;
    const entryId = `REC-${String(Date.now()).slice(-3)}`;
    const now = new Date().toISOString();

    const formattedName = capitalize((form.medicineName || "").trim());
    const formattedManufacturer = capitalize((form.manufacturer || "").trim());
    const formattedBatch = (form.batchId || "").trim().toUpperCase();

    const item = {
      id,
      medicineName: formattedName,
      category: form.category,
      batchId: formattedBatch,
      manufacturer: formattedManufacturer,
      quantity: Number(form.quantity),
      minStockLevel: Number(form.minStockLevel),
      unitPrice: Number(form.unitPrice),
      expiryDate: form.expiryDate,
      storageCondition: form.storageCondition || "",
      notes: form.notes || "",
    };

    dispatch(addItemToFirestore({ item, userId: currentUser?.uid }));

    dispatch(
      submitStockEntry({
        id: entryId,
        medicineName: formattedName,
        quantity: Number(form.quantity),
        batchId: formattedBatch,
        submittedAt: now,
      }),
    );

    setSubmitted(true);
    setForm(EMPTY_FORM);
    setTimeout(() => setSubmitted(false), 3500);
  };

  const formatTime = (iso) => {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="stock-entry-layout view-enter">
      {/* ─── Form Panel ─── */}
      <div className="stock-entry-panel">
        <div className="stock-entry-panel-header">
          <h2>New Stock Entry</h2>
          <p>Add a new medicine batch to the clinical inventory.</p>
        </div>

        {submitted && (
          <div className="success-banner" role="alert">
            ✓ Stock entry submitted successfully and inventory updated.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="stock-entry-form">
          {/* ─── Section: Product Details ─── */}
          <fieldset className="form-section">
            <legend className="form-section-legend">
              <span className="legend-dot primary-dot" />
              Product Details
            </legend>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="medicineName" className="form-label">
                  Medicine Name <span className="required">*</span>
                </label>
                <input
                  id="medicineName"
                  name="medicineName"
                  type="text"
                  className={`form-control ${errors.medicineName ? "form-control-error" : ""}`}
                  placeholder="e.g. Amoxicillin 500mg"
                  value={form.medicineName}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.medicineName && (
                  <span className="field-error">{errors.medicineName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  className={`form-control ${errors.category ? "form-control-error" : ""}`}
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="field-error">{errors.category}</span>
                )}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="batchId" className="form-label">
                  Batch ID <span className="required">*</span>
                </label>
                <input
                  id="batchId"
                  name="batchId"
                  type="text"
                  className={`form-control mono-input ${errors.batchId ? "form-control-error" : ""}`}
                  placeholder="e.g. AMX-A1023"
                  value={form.batchId}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.batchId && (
                  <span className="field-error">{errors.batchId}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="manufacturer" className="form-label">
                  Manufacturer
                </label>
                <input
                  id="manufacturer"
                  name="manufacturer"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Abbott Laboratories"
                  value={form.manufacturer}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="storageCondition" className="form-label">
                Storage Condition
              </label>
              <select
                id="storageCondition"
                name="storageCondition"
                className="form-control"
                value={form.storageCondition}
                onChange={handleChange}
              >
                <option value="">Select condition…</option>
                <option value="Room Temperature (15–25°C)">
                  Room Temperature (15–25°C)
                </option>
                <option value="Refrigerated (2–8°C)">
                  Refrigerated (2–8°C)
                </option>
                <option value="Frozen (-20°C)">Frozen (-20°C)</option>
                <option value="Protected from Light">
                  Protected from Light
                </option>
              </select>
            </div>
          </fieldset>

          {/* ─── Section: Stock & Pricing ─── */}
          <fieldset className="form-section">
            <legend className="form-section-legend">
              <span className="legend-dot secondary-dot" />
              Stock & Pricing
            </legend>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  Quantity (units) <span className="required">*</span>
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  className={`form-control mono-input ${errors.quantity ? "form-control-error" : ""}`}
                  placeholder="e.g. 500"
                  value={form.quantity}
                  onChange={handleChange}
                />
                {errors.quantity && (
                  <span className="field-error">{errors.quantity}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="minStockLevel" className="form-label">
                  Min Stock Level <span className="required">*</span>
                </label>
                <input
                  id="minStockLevel"
                  name="minStockLevel"
                  type="number"
                  min="1"
                  className={`form-control mono-input ${errors.minStockLevel ? "form-control-error" : ""}`}
                  placeholder="e.g. 150"
                  value={form.minStockLevel}
                  onChange={handleChange}
                />
                {errors.minStockLevel && (
                  <span className="field-error">{errors.minStockLevel}</span>
                )}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="unitPrice" className="form-label">
                  Unit Price (INR) <span className="required">*</span>
                </label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">₹</span>
                  <input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={`form-control mono-input with-prefix ${errors.unitPrice ? "form-control-error" : ""}`}
                    placeholder="0.00"
                    value={form.unitPrice}
                    onChange={handleChange}
                  />
                </div>
                {errors.unitPrice && (
                  <span className="field-error">{errors.unitPrice}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate" className="form-label">
                  Expiry Date <span className="required">*</span>
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  className={`form-control ${errors.expiryDate ? "form-control-error" : ""}`}
                  value={form.expiryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.expiryDate && (
                  <span className="field-error">{errors.expiryDate}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Notes / Remarks
              </label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                rows={3}
                placeholder="Any additional notes about this batch…"
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* ─── Form Actions ─── */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setForm(EMPTY_FORM);
                setErrors({});
              }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="submit-stock-entry"
            >
              ✦ Submit Stock Entry
            </button>
          </div>
        </form>
      </div>

      {/* ─── Recent Entries Side Panel ─── */}
      <aside className="recent-entries-panel">
        <div className="recent-entries-header">
          <h3>Recent Entries</h3>
          <span className="recent-count">{recentEntries.length}</span>
        </div>
        <ul className="recent-entries-list">
          {recentEntries.map((entry) => (
            <li key={entry.id} className="recent-entry-item">
              <div className="recent-entry-icon">⊕</div>
              <div className="recent-entry-body">
                <p className="recent-entry-name">{entry.medicineName}</p>
                <p className="recent-entry-meta">
                  <span className="mono">{entry.batchId}</span> · +
                  {entry.quantity} units
                </p>
                <time className="recent-entry-time">
                  {formatTime(entry.submittedAt)}
                </time>
              </div>
            </li>
          ))}
          {recentEntries.length === 0 && (
            <li className="recent-empty">No recent entries yet.</li>
          )}
        </ul>
      </aside>
    </div>
  );
}

export default StockEntryForm;
