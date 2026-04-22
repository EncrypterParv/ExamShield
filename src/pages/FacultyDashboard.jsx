import { useNavigate, Link } from "react-router-dom";

const RISK_CONFIG = {
  High:   { badge: "badge-high",   dot: "#ef4444", label: "High Risk" },
  Medium: { badge: "badge-medium", dot: "#eab308", label: "Medium Risk" },
  Low:    { badge: "badge-low",    dot: "#22c55e", label: "Low Risk" },
};

export default function FacultyDashboard({ students }) {
  const navigate = useNavigate();

  const total    = students.length;
  const flagged  = students.filter((s) => s.flags.some((f) => f.status === "Pending")).length;
  const high     = students.filter((s) => s.risk === "High").length;
  const medium   = students.filter((s) => s.risk === "Medium").length;
  const low      = students.filter((s) => s.risk === "Low").length;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="shield-icon">🛡️</div>
          ExamShield
        </div>
        <div className="navbar-actions">
          <Link to="/faculty/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/faculty/report" className="nav-link">Reports</Link>
          <Link to="/login" className="btn btn-outline btn-sm">Logout</Link>
        </div>
      </nav>

      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <h1>Faculty Dashboard</h1>
          <p>Monitor student activity and review flagged incidents in real time.</p>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Students</div>
            <div className="stat-value blue">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Flagged Cases</div>
            <div className="stat-value red">{flagged}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High Risk</div>
            <div className="stat-value red">{high}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Medium Risk</div>
            <div className="stat-value yellow">{medium}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Low Risk</div>
            <div className="stat-value green">{low}</div>
          </div>
        </div>

        {/* Student Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Student Activity Monitor</span>
            <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
              {students.length} students enrolled
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Roll No.</th>
                  <th>Risk Profile</th>
                  <th>Latest Activity</th>
                  <th>Review Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const cfg = RISK_CONFIG[s.risk];
                  const pendingFlags = s.flags.filter((f) => f.status === "Pending").length;
                  const latestFlag = s.flags[s.flags.length - 1];
                  const tabSwitches = s.flags.filter((f) => f.reason === "Tab switch detected").length;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--gray-800)" }}>{s.name}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{s.email}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.875rem", background: "var(--gray-100)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          {s.rollNo}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${cfg.badge}`}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                          {s.risk}
                        </span>
                        {tabSwitches > 0 && (
                          <span className="badge" style={{ background: "var(--red-100)", color: "var(--red-700)", marginLeft: "0.5rem" }}>
                            {tabSwitches} Violations
                          </span>
                        )}
                      </td>
                      <td>
                        {latestFlag ? (
                          <>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--gray-800)" }}>
                              {latestFlag.reason}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                              @ {latestFlag.timestamp}
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>No activity</span>
                        )}
                      </td>
                      <td>
                        {pendingFlags > 0 ? (
                          <span className="badge badge-pending">⚑ {pendingFlags} pending</span>
                        ) : (
                          <span style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>None</span>
                        )}
                      </td>
                      <td>
                        <button
                          id={`review-btn-${s.id}`}
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/faculty/review/${s.id}`)}
                          disabled={s.flags.length === 0}
                        >
                          {s.flags.length === 0 ? "No Flags" : "Review →"}
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
    </>
  );
}
