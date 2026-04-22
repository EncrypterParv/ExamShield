import { Link } from "react-router-dom";

export default function ReportPage({ students }) {
  const total    = students.length;
  const flagged  = students.filter((s) => s.flags.length > 0).length;
  const reviewed = students.filter((s) =>
    s.flags.some((f) => f.status === "Approved" || f.status === "Flagged")
  ).length;
  const high     = students.filter((s) => s.risk === "High").length;
  const medium   = students.filter((s) => s.risk === "Medium").length;
  const low      = students.filter((s) => s.risk === "Low").length;

  const allFlags  = students.flatMap((s) => s.flags);
  const pending   = allFlags.filter((f) => f.status === "Pending").length;
  const approved  = allFlags.filter((f) => f.status === "Approved").length;
  const hardFlag  = allFlags.filter((f) => f.status === "Flagged").length;

  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);

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
          <Link to="/faculty/report" className="nav-link active">Reports</Link>
          <Link to="/login" className="btn btn-outline btn-sm">Logout</Link>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <h1>Exam Report</h1>
          <p>Session summary for <strong>Data Structures &amp; Algorithms</strong> — April 22, 2026</p>
        </div>

        {/* Top Stats */}
        <div className="stat-grid">
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
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Risk Distribution */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📊 Risk Distribution</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--red-600)" }}>🔴 High Risk</span>
                  <span style={{ fontWeight: 700 }}>{high} students</span>
                </div>
                <div className="progress-bar" style={{ height: "10px" }}>
                  <div className="progress-fill" style={{ width: `${pct(high)}%`, background: "linear-gradient(90deg, var(--red-500), var(--red-600))" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--yellow-600)" }}>🟡 Medium Risk</span>
                  <span style={{ fontWeight: 700 }}>{medium} students</span>
                </div>
                <div className="progress-bar" style={{ height: "10px" }}>
                  <div className="progress-fill" style={{ width: `${pct(medium)}%`, background: "linear-gradient(90deg, var(--yellow-500), var(--yellow-600))" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--green-600)" }}>🟢 Low Risk</span>
                  <span style={{ fontWeight: 700 }}>{low} students</span>
                </div>
                <div className="progress-bar" style={{ height: "10px" }}>
                  <div className="progress-fill" style={{ width: `${pct(low)}%`, background: "linear-gradient(90deg, var(--green-500), var(--green-600))" }} />
                </div>
              </div>
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
                        width: allFlags.length > 0 ? `${Math.round((item.value / allFlags.length) * 100)}%` : "0%",
                        background: item.color,
                      }}
                    />
                  </div>
                  <div className="report-bar-value">{item.value}</div>
                </div>
              ))}

              <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", fontWeight: 600 }}>
                  Total incidents logged: <strong style={{ color: "var(--gray-700)" }}>{allFlags.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const sBadge = { High: "badge-high", Medium: "badge-medium", Low: "badge-low" }[s.risk];
                  const sPending  = s.flags.filter((f) => f.status === "Pending").length;
                  const sReviewed = s.flags.filter((f) => f.status !== "Pending").length;
                  return (
                    <tr key={s.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer action */}
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <Link to="/faculty/dashboard" className="btn btn-outline">← Back to Dashboard</Link>
          <button
            id="download-report-btn"
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
