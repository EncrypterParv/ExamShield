import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SUBJECTS } from "../data/dummyData";

const VIOLATION_TYPES = [
  "Tab switch detected",
  "Face not visible in camera",
  "Multiple faces detected",
  "Suspicious audio detected",
  "Copy-paste attempt detected",
  "Unauthorized extension activity",
  "Long screen absence detected",
  "Fullscreen exited",
];

function SubjectTabs({ activeId, onSelect, students }) {
  return (
    <div className="report-subject-tabs">
      <button
        className={`report-tab ${activeId === "all" ? "active" : ""}`}
        onClick={() => onSelect("all")}
      >
        🗂️ All Subjects
      </button>
      {SUBJECTS.map((s) => {
        const count = students.flatMap((st) =>
          st.flags.filter((f) => f.subjectId === s.id)
        ).length;
        return (
          <button
            key={s.id}
            className={`report-tab ${activeId === s.id ? "active" : ""}`}
            style={{ "--tab-color": s.color }}
            onClick={() => onSelect(s.id)}
          >
            {s.icon} {s.short}
            {count > 0 && (
              <span className="report-tab-badge">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ReportPage({ students, selectedSubjectId, onSelectSubject }) {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState(selectedSubjectId || "all");

  const handleSubjectSelect = (id) => {
    setActiveSubject(id);
    if (onSelectSubject) onSelectSubject(id === "all" ? null : id);
  };

  const subject = SUBJECTS.find((s) => s.id === activeSubject);

  // Filter flags by subject
  const filteredStudents = students.map((s) => ({
    ...s,
    flags: activeSubject === "all"
      ? s.flags
      : s.flags.filter((f) => f.subjectId === activeSubject),
  }));

  const total     = students.length;
  const flagged   = filteredStudents.filter((s) => s.flags.length > 0).length;
  const reviewed  = filteredStudents.filter((s) =>
    s.flags.some((f) => f.status === "Approved" || f.status === "Flagged")
  ).length;
  const high      = filteredStudents.filter((s) => s.risk === "High").length;
  const medium    = filteredStudents.filter((s) => s.risk === "Medium").length;
  const low       = filteredStudents.filter((s) => s.risk === "Low").length;
  const terminated = filteredStudents.filter((s) =>
    activeSubject === "all"
      ? s.terminated
      : (s.terminatedSubjects || []).includes(activeSubject)
  ).length;

  const allFlags  = filteredStudents.flatMap((s) => s.flags);
  const pending   = allFlags.filter((f) => f.status === "Pending").length;
  const approved  = allFlags.filter((f) => f.status === "Approved").length;
  const hardFlag  = allFlags.filter((f) => f.status === "Flagged").length;

  // Most common violation
  const violationCounts = {};
  allFlags.forEach((f) => {
    violationCounts[f.reason] = (violationCounts[f.reason] || 0) + 1;
  });
  const sortedViolations = Object.entries(violationCounts).sort((a, b) => b[1] - a[1]);
  const mostCommonViolation = sortedViolations[0]?.[0] ?? "—";
  const mostCommonCount     = sortedViolations[0]?.[1] ?? 0;

  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);

  const reportDate = subject
    ? subject.date
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="shield-icon">🛡️</div>
          ExamShield
        </div>
        <div className="navbar-actions">
          <Link to="/faculty/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/faculty/report"    className="nav-link active">Reports</Link>
          <Link to="/faculty/analytics" className="nav-link">Analytics</Link>
          <Link to="/login"             className="btn btn-outline btn-sm">Logout</Link>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <div>
            <h1>
              {subject ? `${subject.icon} ${subject.name} — Report` : "Exam Session Report"}
            </h1>
            <p>
              Session summary{subject ? ` for <strong>${subject.name}</strong>` : " across all subjects"} —{" "}
              {reportDate}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              id="download-report-btn"
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              📥 Download Report
            </button>
            <button
              className="btn btn-outline"
              onClick={() => window.print()}
            >
              🖨️ Print to PDF
            </button>
          </div>
        </div>

        {/* Subject Tabs */}
        <SubjectTabs
          activeId={activeSubject}
          onSelect={handleSubjectSelect}
          students={students}
        />

        {/* Top Stats */}
        <div className="stat-grid" style={{ marginTop: "1.25rem" }}>
          <div className="stat-card">
            <div className="stat-label">Total Students</div>
            <div className="stat-value blue">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Students Flagged</div>
            <div className="stat-value red">{flagged}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cases Reviewed</div>
            <div className="stat-value green">{reviewed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Incidents</div>
            <div className="stat-value yellow">{allFlags.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Terminated Exams</div>
            <div className="stat-value" style={{ color: "var(--red-700)" }}>{terminated}</div>
          </div>
        </div>

        {/* Most Common Violation highlight */}
        {mostCommonViolation !== "—" && (
          <div className="card report-highlight-card" style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "2rem" }}>
                {mostCommonViolation.includes("Tab")       ? "🔀" :
                 mostCommonViolation.includes("face")      ? "👤" :
                 mostCommonViolation.includes("audio")     ? "🔊" :
                 mostCommonViolation.includes("extension") ? "🧩" :
                 mostCommonViolation.includes("paste")     ? "📋" :
                 mostCommonViolation.includes("absence")   ? "🕐" : "⚠️"}
              </span>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Most Common Violation
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)" }}>
                  {mostCommonViolation}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                  Occurred {mostCommonCount} time{mostCommonCount !== 1 ? "s" : ""} in this session
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
          {/* Risk Distribution */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📊 Risk Distribution</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { label: "🔴 High Risk",   value: high,   color: "linear-gradient(90deg, var(--red-500), var(--red-600))",       textColor: "var(--red-600)"    },
                { label: "🟡 Medium Risk", value: medium, color: "linear-gradient(90deg, var(--yellow-500), var(--yellow-600))", textColor: "var(--yellow-600)" },
                { label: "🟢 Low Risk",    value: low,    color: "linear-gradient(90deg, var(--green-500), var(--green-600))",   textColor: "var(--green-600)"  },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.875rem" }}>
                    <span style={{ fontWeight: 600, color: item.textColor }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.value} students</span>
                  </div>
                  <div className="progress-bar" style={{ height: "10px" }}>
                    <div className="progress-fill" style={{ width: `${pct(item.value)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flag Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚑ Flag Status Summary</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Pending Review", value: pending,  color: "#3b82f6" },
                { label: "Approved",       value: approved, color: "#22c55e" },
                { label: "Hard Flagged",   value: hardFlag, color: "#ef4444" },
              ].map((item) => (
                <div key={item.label} className="report-bar">
                  <div className="report-bar-label">{item.label}</div>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: allFlags.length > 0
                          ? `${Math.round((item.value / allFlags.length) * 100)}%`
                          : "0%",
                        background: item.color,
                      }}
                    />
                  </div>
                  <div className="report-bar-value">{item.value}</div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", fontWeight: 600 }}>
                  Total incidents logged:{" "}
                  <strong style={{ color: "var(--gray-700)" }}>{allFlags.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Violation Breakdown */}
        {sortedViolations.length > 0 && (
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div className="card-header">
              <span className="card-title">🔍 Violation Type Breakdown</span>
            </div>
            <div className="card-body">
              <div className="css-bar-chart">
                {sortedViolations.map(([label, count]) => (
                  <div key={label} className="css-bar-row">
                    <div className="css-bar-label" style={{ minWidth: "220px" }}>{label}</div>
                    <div className="css-bar-track">
                      <div
                        className="css-bar-fill"
                        style={{
                          width: `${Math.round((count / sortedViolations[0][1]) * 100)}%`,
                          background: count >= 3 ? "var(--red-500)" :
                                      count === 2 ? "var(--yellow-500)" : "var(--blue-500)",
                        }}
                      />
                    </div>
                    <div className="css-bar-value">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Per-Student Summary Table */}
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <span className="card-title">🧑‍🎓 Student-wise Summary</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Risk</th>
                  <th>Total Incidents</th>
                  <th>Pending</th>
                  <th>Reviewed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const sBadge    = { High: "badge-high", Medium: "badge-medium", Low: "badge-low" }[s.risk];
                  const sPending  = s.flags.filter((f) => f.status === "Pending").length;
                  const sReviewed = s.flags.filter((f) => f.status !== "Pending").length;
                  const isTerminated = activeSubject === "all"
                    ? s.terminated
                    : (s.terminatedSubjects || []).includes(activeSubject);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{s.email}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.875rem", background: "var(--gray-100)", padding: "0.2rem 0.5rem", borderRadius: 4 }}>
                          {s.rollNo}
                        </span>
                      </td>
                      <td><span className={`badge ${sBadge}`}>{s.risk}</span></td>
                      <td><span style={{ fontWeight: 700 }}>{s.flags.length}</span></td>
                      <td>
                        {sPending > 0
                          ? <span className="badge badge-pending">{sPending}</span>
                          : <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>—</span>}
                      </td>
                      <td>
                        {sReviewed > 0
                          ? <span className="badge badge-reviewed">{sReviewed}</span>
                          : <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>—</span>}
                      </td>
                      <td>
                        {isTerminated
                          ? <span className="badge badge-high">⛔ Terminated</span>
                          : s.flags.length === 0
                          ? <span style={{ color: "var(--green-600)", fontSize: "0.875rem", fontWeight: 600 }}>✅ Clean</span>
                          : <span style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>In Review</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingBottom: "2rem" }}>
          <Link to="/faculty/dashboard" className="btn btn-outline">← Back to Dashboard</Link>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/faculty/analytics")}
          >
            📊 View Analytics
          </button>
          <button
            id="print-report-btn"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            📥 Download Report
          </button>
        </div>
      </div>
    </>
  );
}
