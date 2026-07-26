/**
 * File: SupportForm.jsx
 * Description: Form for users to submit IT or clinical support requests.
 * Includes validation for required fields, issue types, and priority levels.
 */
/* eslint-disable react-hooks/purity */
import { useState } from "react";
import "./SupportForm.css";

const ISSUE_TYPES = [
  "Stock Discrepancy",
  "Expiry Date Error",
  "Pricing Issue",
  "Batch ID Mismatch",
  "System Bug / Error",
  "Feature Request",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const EMPTY_FORM = {
  name: "",
  email: "",
  department: "",
  issueType: "",
  priority: "Medium",
  subject: "",
  description: "",
  attachmentNote: "",
};

/**
 * SupportForm Component
 *
 * @returns {JSX.Element} The rendered support form.
 */
function SupportForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "A valid email address is required.";
    if (!form.issueType) errs.issueType = "Please select an issue type.";
    if (!form.subject.trim()) errs.subject = "Subject is required.";
    if (!form.description.trim() || form.description.trim().length < 20)
      errs.description =
        "Please provide at least 20 characters describing the issue.";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const mailtoSubject = encodeURIComponent(
      `Support Request: ${form.subject}`,
    );
    const mailtoBody = encodeURIComponent(`Name: ${form.name}
Email: ${form.email}
Department: ${form.department || "N/A"}
Issue Type: ${form.issueType}
Priority: ${form.priority}

Description:
${form.description}

Attachment Notes: ${form.attachmentNote || "None"}
`);

    window.location.href = `mailto:ujjal700204@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    setSubmitted(true);
    setForm(EMPTY_FORM);
  };

  const priorityColor = (p) => {
    if (p === "Critical") return "var(--critical)";
    if (p === "High") return "var(--warning)";
    if (p === "Medium") return "var(--primary)";
    return "var(--on-surface-variant)";
  };

  if (submitted) {
    return (
      <div className="support-success view-enter">
        <div className="support-success-icon">✓</div>
        <h2>Support Request Submitted</h2>
        <p>
          Your request has been received and assigned to the clinical IT support
          team. You will receive a response within 24 hours at your registered
          email address.
        </p>
        <div className="support-ticket-id">
          Ticket ID:{" "}
          <span className="mono">SPT-{String(Date.now()).slice(-6)}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setSubmitted(false)}
          id="new-support-ticket"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="support-layout view-enter">
      {/* ─── Form panel ─── */}
      <div className="support-form-panel">
        <div className="support-form-header">
          <h2>Support Request</h2>
          <p>
            Report an issue or send a message to the clinical IT support team.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="support-form">
          {/* Contact Info */}
          <fieldset className="form-section">
            <legend className="form-section-legend">
              <span className="legend-dot primary-dot" />
              Contact Information
            </legend>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="sup-name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="sup-name"
                  name="name"
                  type="text"
                  className={`form-control ${errors.name ? "form-control-error" : ""}`}
                  placeholder="Dr. Sarah Kim"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="sup-email" className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="sup-email"
                  name="email"
                  type="email"
                  className={`form-control ${errors.email ? "form-control-error" : ""}`}
                  placeholder="s.kim@hospital.org"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sup-dept" className="form-label">
                Department / Ward
              </label>
              <input
                id="sup-dept"
                name="department"
                type="text"
                className="form-control"
                placeholder="e.g. Oncology Ward, Central Pharmacy"
                value={form.department}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* Issue Details */}
          <fieldset className="form-section">
            <legend className="form-section-legend">
              <span className="legend-dot secondary-dot" />
              Issue Details
            </legend>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="sup-issue-type" className="form-label">
                  Issue Type <span className="required">*</span>
                </label>
                <select
                  id="sup-issue-type"
                  name="issueType"
                  className={`form-control ${errors.issueType ? "form-control-error" : ""}`}
                  value={form.issueType}
                  onChange={handleChange}
                >
                  <option value="">Select issue type…</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.issueType && (
                  <span className="field-error">{errors.issueType}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="sup-priority" className="form-label">
                  Priority
                </label>
                <select
                  id="sup-priority"
                  name="priority"
                  className="form-control"
                  value={form.priority}
                  onChange={handleChange}
                  style={{ color: priorityColor(form.priority) }}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sup-subject" className="form-label">
                Subject <span className="required">*</span>
              </label>
              <input
                id="sup-subject"
                name="subject"
                type="text"
                className={`form-control ${errors.subject ? "form-control-error" : ""}`}
                placeholder="Brief summary of the issue"
                value={form.subject}
                onChange={handleChange}
              />
              {errors.subject && (
                <span className="field-error">{errors.subject}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sup-description" className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="sup-description"
                name="description"
                className={`form-control ${errors.description ? "form-control-error" : ""}`}
                rows={5}
                placeholder="Describe the issue in detail, including steps to reproduce if applicable…"
                value={form.description}
                onChange={handleChange}
              />
              <span
                className="char-count"
                style={{
                  color:
                    form.description.length < 20
                      ? "var(--on-surface-variant)"
                      : "var(--success)",
                }}
              >
                {form.description.length} characters{" "}
                {form.description.length < 20
                  ? `(${20 - form.description.length} more needed)`
                  : "✓"}
              </span>
              {errors.description && (
                <span className="field-error">{errors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sup-attach" className="form-label">
                Attachment Notes
              </label>
              <input
                id="sup-attach"
                name="attachmentNote"
                type="text"
                className="form-control"
                placeholder="Screenshot location, log reference, etc."
                value={form.attachmentNote}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setForm(EMPTY_FORM);
                setErrors({});
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="submit-support"
            >
              ✦ Submit Support Request
            </button>
          </div>
        </form>
      </div>

      {/* ─── Info sidebar ─── */}
      <aside className="support-info-sidebar">
        <div className="support-info-card">
          <h3>Support Hours</h3>
          <p>Clinical IT Support is available:</p>
          <div className="support-hours-grid">
            <span>Mon – Fri</span>
            <span>08:00 – 20:00</span>
            <span>Saturday</span>
            <span>09:00 – 14:00</span>
            <span>Sunday</span>
            <span>Emergency only</span>
          </div>
        </div>

        <div className="support-info-card urgent-card">
          <h3>🚨 Critical Issues</h3>
          <p>
            For patient-safety-critical stock errors, contact the emergency
            clinical pharmacist directly:
          </p>
          <a href="tel:+18005550199" className="support-phone">
            +1 (800) 555-0199
          </a>
        </div>

        <div className="support-info-card">
          <h3>Response Times</h3>
          <div className="response-times">
            {[
              {
                label: "Critical",
                time: "&lt; 2 hours",
                color: "var(--critical)",
              },
              { label: "High", time: "&lt; 8 hours", color: "var(--warning)" },
              {
                label: "Medium",
                time: "&lt; 24 hours",
                color: "var(--primary)",
              },
              {
                label: "Low",
                time: "2–3 business days",
                color: "var(--on-surface-variant)",
              },
            ].map((rt) => (
              <div key={rt.label} className="response-time-row">
                <span className="rt-dot" style={{ background: rt.color }} />
                <span className="rt-label">{rt.label}</span>
                <span
                  className="rt-time"
                  dangerouslySetInnerHTML={{ __html: rt.time }}
                />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SupportForm;
