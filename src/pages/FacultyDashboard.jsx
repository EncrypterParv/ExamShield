import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { SUBJECTS } from "../data/dummyData";

// ─── SVG Donut Chart ───────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120, thickness = 22, label, sublabel }) {
  const r    = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const cx   = size / 2;
  const cy   = size / 2;

  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset  = 0;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        {/* Background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const gap  = circ - dash;
          const el   = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
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

// ─── Mini bar chart (horizontal) ──────────────────────────────────────────────
function MiniBar({ label, value, max, color, icon }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mini-bar-row">
      <div className="mini-bar-label">{icon && <span>{icon}</span>} {label}</div>
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="mini-bar-val">{value}</div>
    </div>
  );
}

// ─── Subject Sidebar ───────────────────────────────────────────────────────────
function SubjectSidebar({ subjects, activeId, onSelect }) {
  return (
    <div className="faculty-sidebar">
      <div className="faculty-sidebar-title">📚 Subjects</div>
      <button
        className={`faculty-sidebar-item ${activeId === "all" ? "active" : ""}`}
        onClick={() => onSelect("all")}
      >
        <span className="faculty-sidebar-icon">🗂️</span>
        <span>All Subjects</span>
      </button>
      {subjects.map((s) => (
        <button
          key={s.id}
          id={`faculty-subject-${s.id}`}
          className={`faculty-sidebar-item ${activeId === s.id ? "active" : ""}`}
          onClick={() => onSelect(s.id)}
        >
          <span className="faculty-sidebar-icon">{s.icon}</span>
          <span style={{ textAlign: "left", lineHeight: 1.3 }}>
            <span style={{ display: "block", fontWeight: 700, fontSize: "0.8rem" }}>{s.short}</span>
            <span style={{ display: "block", fontSize: "0.7rem", color: "var(--gray-400)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }}>{s.name}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

const RISK_CONFIG = {
  High:   { badge: "badge-high",   dot: "#ef4444", label: "High Risk",   color: "var(--red-500)"    },
  Medium: { badge: "badge-medium", dot: "#eab308", label: "Medium Risk", color: "var(--yellow-500)" },
  Low:    { badge: "badge-low",    dot: "#22c55e", label: "Low Risk",    color: "var(--green-500)"  },
};

export default function FacultyDashboard({ students, selectedSubjectId, onSelectSubject }) {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSubject, setActiveSubject] = useState(
    searchParams.get("subject") || selectedSubjectId || "all"
  );

  const handleSubjectSelect = (id) => {
    setActiveSubject(id);
    if (onSelectSubject) onSelectSubject(id === "all" ? null : id);
  };

  const subject = SUBJECTS.find((s) => s.id === activeSubject);

  // filteredStudents is used for STATS only — flags are filtered to active subject
  // For the student TABLE, we still show all students but use original flags for
  // the Review button so it's never incorrectly disabled.
  const filteredStudents = students.map((s) => ({
    ...s,
    flags: activeSubject === "all" ? s.flags : s.flags.filter((f) => f.subjectId === activeSubject),
  }));

  // Map of original student data (unfiltered) for the table Review button
  const studentsMap = Object.fromEntries(students.map((s) => [s.id, s]));


  const total      = filteredStudents.length;
  const high       = filteredStudents.filter((s) => s.risk === "High").length;
  const medium     = filteredStudents.filter((s) => s.risk === "Medium").length;
  const low        = filteredStudents.filter((s) => s.risk === "Low").length;
  const terminated = filteredStudents.filter((s) =>
    activeSubject === "all" ? s.terminated : (s.terminatedSubjects || []).includes(activeSubject)
  ).length;
  const flagged    = filteredStudents.filter((s) => s.flags.some((f) => f.status === "Pending")).length;
  const allFlags   = filteredStudents.flatMap((s) => s.flags);

  // Violation type counts
  const violCounts = {};
  allFlags.forEach((f) => { violCounts[f.reason] = (violCounts[f.reason] || 0) + 1; });
  const sortedViol = Object.entries(violCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const avgConfidence = (flags) =>
    flags.length ? Math.round(flags.reduce((a, f) => a + f.confidence, 0) / flags.length) : null;

  return (
    <div className="faculty-layout">
      <SubjectSidebar subjects={SUBJECTS} activeId={activeSubject} onSelect={handleSubjectSelect} />

      <div className="faculty-main">
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="shield-icon">🛡️</div>
            ExamShield
          </div>
          <div className="navbar-actions">
            <Link to="/faculty/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/faculty/report"    className="nav-link">Reports</Link>
            <Link to="/faculty/analytics" className="nav-link">Analytics</Link>
            <Link to="/login"             className="btn btn-outline btn-sm">Logout</Link>
          </div>
        </nav>

        <div className="page">
          <div className="page-header">
            <div>
              <h1>{subject ? <>{subject.icon} {subject.name}</> : "Faculty Dashboard"}</h1>
              <p>{subject ? `Monitoring ${total} students · ${subject.date}` : "Real-time overview across all subjects."}</p>
            </div>
          </div>

          {/* ── Visual Overview Row ───────────────────────────────────── */}
          <div className="dashboard-overview-row">
            {/* Donut: Risk Distribution */}
            <div className="card dashboard-chart-card">
              <div className="card-header"><span className="card-title">🎯 Risk Distribution</span></div>
              <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <DonutChart
                  size={130} thickness={24}
                  label={total} sublabel="students"
                  segments={[
                    { value: high,   color: "#ef4444" },
                    { value: medium, color: "#eab308" },
                    { value: low,    color: "#22c55e" },
                  ]}
                />
                <div className="donut-legend">
                  {[
                    { label: "High Risk",   value: high,   color: "#ef4444" },
                    { label: "Medium Risk", value: medium, color: "#eab308" },
                    { label: "Low Risk",    value: low,    color: "#22c55e" },
                    { label: "Terminated",  value: terminated, color: "#7f1d1d" },
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

            {/* Donut: Flag Status */}
            <div className="card dashboard-chart-card">
              <div className="card-header"><span className="card-title">⚑ Flag Status</span></div>
              <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <DonutChart
                  size={130} thickness={24}
                  label={allFlags.length} sublabel="incidents"
                  segments={[
                    { value: allFlags.filter((f) => f.status === "Pending").length,   color: "#3b82f6" },
                    { value: allFlags.filter((f) => f.status === "Flagged").length,   color: "#ef4444" },
                    { value: allFlags.filter((f) => f.status === "Approved").length,  color: "#22c55e" },
                    { value: allFlags.filter((f) => f.status === "Technical").length, color: "#eab308" },
                  ]}
                />
                <div className="donut-legend">
                  {[
                    { label: "Pending",   value: allFlags.filter((f) => f.status === "Pending").length,   color: "#3b82f6" },
                    { label: "Flagged",   value: allFlags.filter((f) => f.status === "Flagged").length,   color: "#ef4444" },
                    { label: "Approved",  value: allFlags.filter((f) => f.status === "Approved").length,  color: "#22c55e" },
                    { label: "Technical", value: allFlags.filter((f) => f.status === "Technical").length, color: "#eab308" },
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

            {/* Top Violations Bar Chart */}
            <div className="card dashboard-chart-card" style={{ flex: "1 1 280px" }}>
              <div className="card-header"><span className="card-title">🔍 Top Violations</span></div>
              <div className="card-body">
                {sortedViol.length === 0 ? (
                  <div style={{ color: "var(--gray-400)", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>
                    No violations recorded
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {sortedViol.map(([label, count]) => (
                      <MiniBar
                        key={label}
                        label={label}
                        value={count}
                        max={sortedViol[0][1]}
                        color={count >= 3 ? "#ef4444" : count === 2 ? "#eab308" : "#3b82f6"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Stat Pills ────────────────────────────────────────────── */}
          <div className="stat-grid" style={{ marginTop: "1.25rem" }}>
            {[
              { label: "Total Students", value: total,      cls: "blue"  },
              { label: "Flagged",        value: flagged,    cls: "red"   },
              { label: "High Risk",      value: high,       cls: "red"   },
              { label: "Medium Risk",    value: medium,     cls: "yellow"},
              { label: "Low Risk",       value: low,        cls: "green" },
              { label: "Terminated",     value: terminated, cls: ""      },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.cls}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── Student Table ─────────────────────────────────────────── */}
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div className="card-header">
              <span className="card-title">📋 Student Activity Monitor</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{total} students</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No.</th>
                    <th>Risk</th>
                    <th>Violations</th>
                    <th>AI Confidence</th>
                    <th>Latest Activity</th>
                    <th>Pending</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => {
                    const cfg       = RISK_CONFIG[s.risk] || RISK_CONFIG.Low;
                    const pending   = s.flags.filter((f) => f.status === "Pending").length;
                    const latest    = s.flags[s.flags.length - 1];
                    const viols     = s.flags.length;
                    const aiConf    = avgConfidence(s.flags);
                    const isTerm    = activeSubject === "all"
                      ? s.terminated
                      : (s.terminatedSubjects || []).includes(activeSubject);
                    return (
                      <tr key={s.id} className={isTerm ? "row-terminated" : ""}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--blue-600),var(--blue-800))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.875rem", fontWeight: 700, flexShrink: 0 }}>
                              {s.name[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--gray-800)" }}>{s.name}</div>
                              <div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><code style={{ fontSize: "0.8rem", background: "var(--gray-100)", padding: "0.2rem 0.5rem", borderRadius: 4 }}>{s.rollNo}</code></td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            <span className={`badge ${cfg.badge}`}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                              {s.risk}
                            </span>
                            {isTerm && <span className="badge badge-high" style={{ fontSize: "0.68rem" }}>⛔ Terminated</span>}
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const orig = studentsMap[s.id];
                            const totalViols = orig ? orig.flags.length : 0;
                            const subjViols  = s.flags.length;
                            const display = activeSubject === "all"
                              ? totalViols
                              : `${totalViols}${subjViols > 0 ? ` (${subjViols} here)` : ""}`;
                            return (
                              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: totalViols >= 3 ? "var(--red-700)" : totalViols === 2 ? "var(--red-500)" : totalViols === 1 ? "var(--yellow-600)" : "var(--gray-400)" }}>
                                {totalViols > 0 ? `${display} violation${totalViols > 1 ? "s" : ""}` : "—"}
                              </span>
                            );
                          })()}
                        </td>
                        <td>
                          {aiConf !== null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontWeight: 700, color: aiConf >= 80 ? "var(--red-500)" : aiConf >= 60 ? "var(--yellow-500)" : "var(--green-500)" }}>
                                {aiConf}%
                              </span>
                              <div style={{ width: 50, height: 6, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}>
                                <div style={{ width: `${aiConf}%`, height: "100%", background: aiConf >= 80 ? "var(--red-500)" : aiConf >= 60 ? "var(--yellow-500)" : "var(--green-500)" }} />
                              </div>
                            </div>
                          ) : <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>—</span>}
                        </td>
                        <td>
                          {latest ? (
                            <>
                              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--gray-800)" }}>{latest.reason}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>@ {latest.timestamp}</div>
                            </>
                          ) : <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>No activity</span>}
                        </td>
                        <td>
                          {pending > 0
                            ? <span className="badge badge-pending">⚑ {pending}</span>
                            : <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>None</span>}
                        </td>
                        <td>
                          <button
                            id={`review-btn-${s.id}`}
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/faculty/review/${s.id}`)}
                            disabled={(studentsMap[s.id]?.flags.length ?? 0) === 0}
                          >
                            {(studentsMap[s.id]?.flags.length ?? 0) === 0 ? "Clean" : "Review →"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
