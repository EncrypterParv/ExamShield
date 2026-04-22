import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function FlagReviewPage({ students, updateFlag }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const student = students.find((s) => s.id === parseInt(studentId));
  const [confirmed, setConfirmed] = useState({});

  if (!student) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p>Student not found.</p>
        <Link to="/faculty/dashboard" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleAction = (flagId, action) => {
    updateFlag(student.id, flagId, action === "approve" ? "Approved" : "Flagged");
    setConfirmed((prev) => ({ ...prev, [flagId]: action }));
  };

  const RISK_CONFIG = {
    High:   { badge: "badge-high",   label: "High Risk" },
    Medium: { badge: "badge-medium", label: "Medium Risk" },
    Low:    { badge: "badge-low",    label: "Low Risk" },
  };
  const cfg = RISK_CONFIG[student.risk];

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
          <Link to="/faculty/report" className="nav-link">Reports</Link>
          <Link to="/login" className="btn btn-outline btn-sm">Logout</Link>
        </div>
      </nav>

      <div className="page">
        <button className="back-btn" onClick={() => navigate("/faculty/dashboard")}>
          ← Back to Dashboard
        </button>

        <div className="page-header">
          <h1>Flag Review</h1>
          <p>Review and act on suspicious activity flagged during the exam session.</p>
        </div>

        <div className="review-grid">
          {/* Left: Student Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">👤 Student Profile</span>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      width: 56, height: 56,
                      background: "linear-gradient(135deg, var(--blue-500), var(--blue-700))",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", color: "white", fontWeight: 700, flexShrink: 0
                    }}>
                      {student.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--gray-800)" }}>{student.name}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{student.email}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                      <span style={{ color: "var(--gray-500)" }}>Roll No.</span>
                      <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{student.rollNo}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                      <span style={{ color: "var(--gray-500)" }}>Risk Level</span>
                      <span className={`badge ${cfg.badge}`}>{student.risk}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                      <span style={{ color: "var(--gray-500)" }}>Total Flags</span>
                      <span style={{ fontWeight: 600 }}>{student.flags.length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                      <span style={{ color: "var(--gray-500)" }}>Tab Switches</span>
                      <span style={{ fontWeight: 600, color: "var(--red-600)" }}>
                        {student.flags.filter(f => f.reason === "Tab switch detected").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary counts */}
            <div className="card">
              <div className="card-body" style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--red-500)" }}>
                    {student.flags.filter((f) => f.status === "Pending").length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>Pending</div>
                </div>
                <div style={{ width: "1px", background: "var(--gray-200)" }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--green-500)" }}>
                    {student.flags.filter((f) => f.status === "Approved").length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>Approved</div>
                </div>
                <div style={{ width: "1px", background: "var(--gray-200)" }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--red-600)" }}>
                    {student.flags.filter((f) => f.status === "Flagged").length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>Flagged</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Flags List */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚑ Flagged Incidents</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{student.flags.length} incident(s)</span>
            </div>
            <div className="card-body">
              {student.flags.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--gray-400)", padding: "2rem 0" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
                  No suspicious activity recorded.
                </div>
              ) : (
                student.flags.map((flag) => {
                  const action = confirmed[flag.id];
                  const currentStatus = action
                    ? action === "approve" ? "Approved" : "Flagged"
                    : flag.status;
                  return (
                    <div key={flag.id} className="flag-item" style={{
                      borderColor: currentStatus === "Approved" ? "var(--green-200)" :
                                   currentStatus === "Flagged"  ? "var(--red-200)"   : "var(--gray-200)",
                      background:  currentStatus === "Approved" ? "var(--green-50)"  :
                                   currentStatus === "Flagged"  ? "var(--red-50)"    : "var(--white)",
                    }}>
                      <div className="flag-icon">
                        {currentStatus === "Approved" ? "✅" : currentStatus === "Flagged" ? "🚨" : "⚠️"}
                      </div>
                      <div className="flag-content">
                        <div className="flag-reason">{flag.reason}</div>
                        <div className="flag-meta">
                          🕐 {flag.timestamp} &nbsp;·&nbsp;
                          Confidence: <strong style={{ color: "var(--red-500)" }}>{flag.confidence}%</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span className={`badge ${
                            currentStatus === "Pending"  ? "badge-pending"  :
                            currentStatus === "Approved" ? "badge-low"      : "badge-high"
                          }`}>
                            {currentStatus}
                          </span>
                        </div>

                        {currentStatus === "Pending" && (
                          <div className="flag-actions">
                            <button
                              id={`approve-btn-${flag.id}`}
                              className="btn btn-success btn-sm"
                              onClick={() => handleAction(flag.id, "approve")}
                            >
                              ✓ Approve
                            </button>
                            <button
                              id={`flag-btn-${flag.id}`}
                              className="btn btn-danger btn-sm"
                              onClick={() => handleAction(flag.id, "flag")}
                            >
                              🚨 Flag
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
