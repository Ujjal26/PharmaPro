/**
 * File: StockTrendGraph.jsx
 * Description: SVG-based line chart component displaying the historical trend 
 * of inventory stock (either by units or by financial value) over time.
 */
import { useMemo, useState, useRef } from "react";
import { MONTHLY_HISTORY } from "../slices/stockEntrySlice";
import "./ChartComponents.css";

/* ─── SVG layout constants ─── */
const W = 560;
const H = 180;
const PAD_L = 56;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 40;
const CHART_W = W - PAD_L - PAD_R; // 484
const CHART_H = H - PAD_T - PAD_B; // 120

function computePoints(data) {
  const n = data.length;
  const xStep = n > 1 ? CHART_W / (n - 1) : 0;
  const yMin = Math.min(...data);
  const yMax = Math.max(...data);
  const yRange = yMax - yMin || 1;

  return data.map((val, i) => ({
    x: PAD_L + (n > 1 ? i * xStep : CHART_W / 2),
    y: PAD_T + CHART_H - ((val - yMin) / yRange) * CHART_H,
    val,
  }));
}

function buildLinePath(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp = (pts[i + 1].x - pts[i].x) / 2.5;
    d += ` C ${pts[i].x + cp} ${pts[i].y} ${pts[i + 1].x - cp} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

function buildAreaPath(pts) {
  const line = buildLinePath(pts);
  if (!line) return "";
  const bottom = PAD_T + CHART_H;
  return `${line} L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
}

/* ─── Y-axis labels ─── */
function yLabels(data) {
  const yMin = Math.min(...data);
  const yMax = Math.max(...data);
  const step = (yMax - yMin) / 4;
  return Array.from({ length: 5 }, (_, i) => {
    const val = yMin + step * i;
    const y = PAD_T + CHART_H - (i / 4) * CHART_H;
    return { val, y };
  });
}

function formatVal(val, metric) {
  if (metric === "value") {
    return val >= 1000
      ? `₹${Math.round(val / 100) / 10}k`
      : `₹${Math.round(val)}`;
  }
  return val >= 1000
    ? `${Math.round(val / 100) / 10}k`
    : String(Math.round(val));
}

function StockTrendGraph({ items }) {
  const [metric, setMetric] = useState("units");
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const svgRef = useRef(null);

  const now = new Date();
  const currentMonthLabel = now.toLocaleString("default", { month: "short" });

  const currentUnits = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  );
  const currentValue = useMemo(
    () => Math.round(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)),
    [items],
  );

  const monthlyData = useMemo(
    () => [
      ...MONTHLY_HISTORY,
      { month: currentMonthLabel, units: currentUnits, value: currentValue },
    ],
    [currentMonthLabel, currentUnits, currentValue],
  );

  const rawData = monthlyData.map((d) =>
    metric === "units" ? d.units : d.value,
  );
  const pts = computePoints(rawData);
  const linePath = buildLinePath(pts);
  const areaPath = buildAreaPath(pts);
  const yAxisLabels = yLabels(rawData);

  const trend = rawData[rawData.length - 1] - rawData[0];
  const trendPct = rawData[0] ? ((trend / rawData[0]) * 100).toFixed(1) : 0;
  const trendUp = trend >= 0;

  return (
    <article className="surface-card chart-card stock-trend-card">
      <header>
        <div>
          <h3>Stock Trend</h3>
          <p>Inventory performance over the past 4 months.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className={`trend-badge ${trendUp ? "trend-up" : "trend-down"}`}
            title="Change since 3 months ago"
          >
            {trendUp ? "↑" : "↓"} {Math.abs(trendPct)}%
          </span>
          <div className="metric-toggle">
            <button
              type="button"
              className={metric === "units" ? "active" : ""}
              onClick={() => setMetric("units")}
            >
              Units
            </button>
            <button
              type="button"
              className={metric === "value" ? "active" : ""}
              onClick={() => setMetric("value")}
            >
              Value
            </button>
          </div>
        </div>
      </header>

      <div className="trend-svg-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="trend-svg"
          aria-label={`Stock ${metric} trend chart`}
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {yAxisLabels.map((lbl, i) => (
            <g key={i}>
              <line
                x1={PAD_L}
                y1={lbl.y}
                x2={W - PAD_R}
                y2={lbl.y}
                stroke="var(--outline-variant)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={PAD_L - 6}
                y={lbl.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--on-surface-variant)"
              >
                {formatVal(lbl.val, metric)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#trendGradient)" />

          {/* Line */}
          <path
            d={linePath}
            stroke="var(--primary)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="trend-line"
          />

          {/* Data points + hover targets */}
          {pts.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill={
                  hoveredIdx === i ? "var(--primary-deep)" : "var(--primary)"
                }
                stroke="white"
                strokeWidth="2"
                style={{
                  filter:
                    hoveredIdx === i
                      ? "drop-shadow(0 0 4px var(--primary))"
                      : "none",
                }}
              />
              {/* Invisible larger hit target */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="18"
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: "crosshair" }}
              />

              {/* Tooltip */}
              {hoveredIdx === i && (
                <g>
                  <rect
                    x={pt.x - 44}
                    y={pt.y - 42}
                    width="88"
                    height="34"
                    rx="6"
                    fill="var(--inverse-surface)"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 27}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--inverse-on-surface)"
                    fontWeight="600"
                  >
                    {monthlyData[i].month}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y - 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--inverse-on-surface)"
                  >
                    {formatVal(pt.val, metric)}
                  </text>
                </g>
              )}

              {/* X-axis label */}
              <text
                x={pt.x}
                y={H - 4}
                textAnchor="middle"
                fontSize="11"
                fill={
                  i === pts.length - 1
                    ? "var(--primary)"
                    : "var(--on-surface-variant)"
                }
                fontWeight={i === pts.length - 1 ? "600" : "400"}
              >
                {monthlyData[i].month}
                {i === pts.length - 1 ? " ●" : ""}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Mini summary row */}
      <div className="trend-summary-row">
        {monthlyData.map((d, i) => (
          <div
            key={i}
            className={`trend-summary-item ${i === monthlyData.length - 1 ? "current" : ""}`}
          >
            <span className="trend-summary-month">{d.month}</span>
            <span className="trend-summary-val">
              {metric === "units"
                ? d.units.toLocaleString()
                : `₹${d.value.toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default StockTrendGraph;
