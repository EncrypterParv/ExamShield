import { useState } from "react";
import { Link } from "react-router-dom";
import { SUBJECTS } from "../data/dummyData";

// ─── SVG Donut Chart ───────────────────────────────────────────────────────────
function DonutChart({ segments, size = 150, thickness = 26, label, sublabel }) {
  const r    = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const cx   = size / 2;
  const cy   = size / 2;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset} strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="donut-label">
        <div className="donut-label-main">{label}</div>
        {sublabel && <div className="donut-label-sub">{sublabel}</div>}
      </div>
    </div>
  );
}

// ─── Horizontal bar ────────────────────────────────────────────────────────────
function HBar({ label, count, max, color, icon }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="mini-bar-row">
      <div className="mini-bar-label">{icon} {label}</div>
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="mini-bar-val">{count}</div>
    </div>
  );
}

// ─── Subject bar chart ─────────────────────────────────────────────────────────
function SubjectBar({ subject, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 60, fontSize: "0.78rem", fontWeight: 600, color: subject.color }}>
        <span>{subject.icon}</span>
        <span>{subject.short}</span>
      </div>
      <div style={{ flex: 1, height: 10, background: "var(--gray-200)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: subject.color, borderRadius: 999, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--gray-700)", minWidth: 24, textAlign: "right" }}>{count}</span>
    </div>
  );
}

export default function AnalyticsPage({ students }) {
  const [activeSubject, setActiveSubject] = useState("all");

  const subject = SUBJECTS.find((s) => s.id === activeSubject);

  const filteredStudents = students.map((s) => ({
    ...s,
    flags: activeSubject === "all" ? s.flags : s.flags.filter((f) => f.subjectId === activeSubject),
  }));

  const allFlags   = filteredStudents.flatMap((s) => s.flags);
  const total      = filteredStudents.length;
  const high       = filteredStudents.filter((s) => s.risk === "High").length;
  const medium     = filteredStudents.filter((s) => s.risk === "Medium").length;
  const low        = filteredStudents.filter((s) => s.risk === "Low").length;
  const terminated = filteredStudents.filter((s) =>
    activeSubject === "all" ? s.terminated : (s.terminatedSubjects || []).includes(activeSubject)
  ).length;

  // Violation type breakdown
  const violCounts = {};
  allFlags.forEach((f) => { violCounts[f.reason] = (violCounts[f.reason] || 0) + 1; });
  const sortedViol = Object.entries(violCounts).sort((a, b) => b[1] - a[1]);
  const maxViol    = sortedViol[0]?.[1] || 1;

  const mostCommon = sortedViol[0]?.[0] ?? null;

  // Flags per subject
  const flagsPerSubject = SUBJECTS.map((s) => ({
    subject: s,
    count: students.flatMap((st) => st.flags).filter((f) => f.subjectId === s.id).length,
  }));
  const maxSubjFlags = Math.max(...flagsPerSubject.map((x) => x.count), 1);

  // Average AI confidence per subject
  const avgConfPerSubject = SUBJECTS.map((s) => {
    const sFlags = students.flatMap((st) => st.flags).filter((f) => f.subjectId === s.id);
    return {
      subject: s,
      avg: sFlags.length ? Math.round(sFlags.reduce((a, f) => a + f.confidence, 0) / sFlags.length) : 0,
    };
  });

  const violIcons = (r) => r.includes("Tab") ? "🔀" : r.includes("face") ? "👤" : r.includes("audio") ? "🔊" : r.includes("extension") ? "🧩" : r.includes("paste") ? "📋" : r.includes("absence") ? "🕐" : "⚠️";

  return (
    <div className="analytics-layout">
      {/* Sidebar */}
      <div className="analytics-sidebar">
        <div className="analytics-sidebar-title">🔭 Filter</div>
        <button className={`analytics-sidebar-item ${activeSubject === "all" ? "active" : ""}`} onClick={() => setActiveSubject("all")}>
          <span className="analytics-sidebar-icon">🗂️</span> All Subjects
        </button>
        {SUBJECTS.map((s) => (
          <button key={s.id} className={`analytics-sidebar-item ${activeSubject === s.id ? "active" : ""}`} onClick={() => setActiveSubject(s.id)}>
            <span className="analytics-sidebar-icon">{s.icon}</span> {s.short}
          </button>
        ))}
      </div>

      <div className="analytics-main">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-brand"><div className="shield-icon">🛡️</div> ExamShield</div>
          <div className="navbar-actions">
            <Link to="/faculty/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/faculty/report"    className="nav-link">Reports</Link>
            <Link to="/faculty/analytics" className="nav-link active">Analytics</Link>
            <Link to="/login" className="btn btn-outline btn-sm">Logout</Link>
          </div>
        </nav>

        <div className="page">
          <div className="page-header">
            <div>
              <h1>{subject ? `${subject.icon} ${subject.name} — Analytics` : "📊 Exam Analytics"}</h1>
              <p>Visual overview of proctoring data{subject ? ` for ${subject.name}` : " across all subjects"}.</p>
            </div>
          </div>

          {/* Most Common Violation highlight */}
          {mostCommon && (
            <div className="card analytics-alert-card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div className="analytics-alert-icon">{violIcons(mostCommon)}</div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gray-400)" }}>Most Frequent Violation</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--gray-800)", marginTop: "0.1rem" }}>{mostCommon}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>
                    Occurred <strong>{sortedViol[0]?.[1]}</strong> time{sortedViol[0]?.[1] !== 1 ? "s" : ""} · {Math.round((sortedViol[0]?.[1] / (allFlags.length || 1)) * 100)}% of all incidents
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="analytics-stat-grid" style={{ marginBottom: "1.5rem" }}>
            {[
              { label: "Total Students",    value: total,            color: "var(--blue-400)"   },
              { label: "Total Incidents",   value: allFlags.length,  color: "var(--yellow-500)" },
              { label: "High Risk",         value: high,             color: "var(--red-500)"    },
              { label: "Medium Risk",       value: medium,           color: "var(--yellow-500)" },
              { label: "Low Risk",          value: low,              color: "var(--green-500)"  },
              { label: "Terminated Exams",  value: terminated,       color: "var(--red-700)"    },
            ].map((s) => (
              <div key={s.label} className="analytics-stat-card">
                <div className="analytics-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="analytics-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Main chart row */}
          <div className="analytics-two-col" style={{ marginBottom: "1.5rem" }}>
            {/* Donut: Risk */}
            <div className="card">
              <div className="card-header"><span className="card-title">🎯 Risk Distribution</span></div>
              <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
                <DonutChart
                  size={160} thickness={30}
                  label={total} sublabel="students"
                  segments={[
                    { value: high,   color: "#ef4444" },
                    { value: medium, color: "#eab308" },
                    { value: low,    color: "#22c55e" },
                  ]}
                />
                <div className="donut-legend" style={{ gap: "0.875rem" }}>
                  {[
                    { label: "High Risk",  value: high,   color: "#ef4444", pct: total ? Math.round(high/total*100) : 0 },
                    { label: "Medium Risk",value: medium, color: "#eab308", pct: total ? Math.round(medium/total*100) : 0 },
                    { label: "Low Risk",   value: low,    color: "#22c55e", pct: total ? Math.round(low/total*100) : 0 },
                  ].map((item) => (
                    <div key={item.label} className="donut-legend-item">
                      <span className="donut-legend-dot" style={{ background: item.color }} />
                      <span className="donut-legend-label">{item.label}</span>
                      <span className="donut-legend-val">{item.value}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginLeft: "0.25rem" }}>({item.pct}%)</span>
                    </div>
                  ))}
                  {terminated > 0 && (
                    <div className="donut-legend-item" style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--gray-200)", marginTop: "0.25rem" }}>
                      <span className="donut-legend-dot" style={{ background: "#7f1d1d" }} />
                      <span className="donut-legend-label">Terminated</span>
                      <span className="donut-legend-val">{terminated}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Donut: Flag Status */}
            <div className="card">
              <div className="card-header"><span className="card-title">⚑ Incident Outcomes</span></div>
              <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
                <DonutChart
                  size={160} thickness={30}
                  label={allFlags.length} sublabel="total flags"
                  segments={[
                    { value: allFlags.filter((f) => f.status === "Pending").length,   color: "#3b82f6" },
                    { value: allFlags.filter((f) => f.status === "Flagged").length,   color: "#ef4444" },
                    { value: allFlags.filter((f) => f.status === "Approved").length,  color: "#22c55e" },
                    { value: allFlags.filter((f) => f.status === "Technical").length, color: "#eab308" },
                  ]}
                />
                <div className="donut-legend" style={{ gap: "0.875rem" }}>
                  {[
                    { label: "Pending Review", color: "#3b82f6", value: allFlags.filter((f) => f.status === "Pending").length   },
                    { label: "Hard Flagged",   color: "#ef4444", value: allFlags.filter((f) => f.status === "Flagged").length   },
                    { label: "Approved",       color: "#22c55e", value: allFlags.filter((f) => f.status === "Approved").length  },
                    { label: "Technical",      color: "#eab308", value: allFlags.filter((f) => f.status === "Technical").length },
                  ].map((item) => (
                    <div key={item.label} className="donut-legend-item">
                      <span className="donut-legend-dot" style={{ background: item.color }} />
                      <span className="donut-legend-label">{item.label}</span>
                      <span className="donut-legend-val">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Second row: Violation breakdown + Subject heatmap */}
          <div className="analytics-two-col" style={{ marginBottom: "1.5rem" }}>
            {/* Violations */}
            <div className="card">
              <div className="card-header"><span className="card-title">🔍 Violation Breakdown</span></div>
              <div className="card-body">
                {sortedViol.length === 0 ? (
                  <div style={{ color: "var(--gray-400)", textAlign: "center", padding: "2rem 0" }}>No violations recorded</div>
                ) : sortedViol.map(([label, count]) => (
                  <HBar
                    key={label} label={label} count={count} max={maxViol}
                    color={count >= 3 ? "#ef4444" : count === 2 ? "#eab308" : "#3b82f6"}
                    icon={violIcons(label)}
                  />
                ))}
              </div>
            </div>

            {/* Incidents by Subject */}
            <div className="card">
              <div className="card-header"><span className="card-title">📚 Incidents by Subject</span></div>
              <div className="card-body">
                {flagsPerSubject.map(({ subject: s, count }) => (
                  <SubjectBar key={s.id} subject={s} count={count} max={maxSubjFlags} />
                ))}

                <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--gray-200)", paddingTop: "1rem" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                    Avg AI Confidence per Subject
                  </div>
                  {avgConfPerSubject.map(({ subject: s, avg }) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: s.color, minWidth: 50 }}>{s.icon} {s.short}</span>
                      <div style={{ flex: 1, height: 8, background: "var(--gray-200)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${avg}%`, height: "100%", background: avg >= 80 ? "#ef4444" : avg >= 60 ? "#eab308" : "#22c55e", borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, minWidth: 36, color: avg >= 80 ? "#ef4444" : avg >= 60 ? "#eab308" : "var(--gray-500)" }}>
                        {avg > 0 ? `${avg}%` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
