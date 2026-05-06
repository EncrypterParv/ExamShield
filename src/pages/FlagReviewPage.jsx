import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const RISK_CONFIG = {
  High:   { badge: "badge-high",   label: "High Risk",   color: "var(--red-500)"    },
  Medium: { badge: "badge-medium", label: "Medium Risk", color: "var(--yellow-500)" },
  Low:    { badge: "badge-low",    label: "Low Risk",    color: "var(--green-500)"  },
};

const AUDIO_CHIP_CLASS = {
  high:   "audio-chip audio-chip-high",
  medium: "audio-chip audio-chip-medium",
  low:    "audio-chip audio-chip-low",
};

const STATUS_CONFIG = {
  Pending:   { badge: "badge-pending",   icon: "⏳", label: "Pending"         },
  Approved:  { badge: "badge-low",       icon: "✅", label: "Approved"        },
  Flagged:   { badge: "badge-high",      icon: "🚨", label: "Flagged"         },
  Technical: { badge: "badge-technical", icon: "🔧", label: "Technical Issue" },
  Reviewed:  { badge: "badge-reviewed",  icon: "📋", label: "Reviewed"        },
};

function VideoPlayer({ src }) {
  if (!src) {
    return (
      <div className="evidence-media-placeholder">
        <span>📹</span>
        <span>Recording not available</span>
        <span className="evidence-placeholder-sub">Incident occurred outside live session</span>
      </div>
    );
  }
  return (
    <video
      className="evidence-video"
      src={src}
      controls
      playsInline
    />
  );
}

function Screenshot({ src }) {
  if (!src) {
    return (
      <div className="evidence-media-placeholder">
        <span>📸</span>
        <span>Screenshot not available</span>
        <span className="evidence-placeholder-sub">Incident occurred outside live session</span>
      </div>
    );
  }
  return (
    <img
      className="evidence-screenshot"
      src={src}
      alt="Screenshot at moment of incident"
    />
  );
}

function IncidentTimeline({ flags }) {
  if (!flags.length) return null;

  const sorted = [...flags].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const typeIcon = (reason) => {
    if (reason.toLowerCase().includes("tab"))     return "🔀";
    if (reason.toLowerCase().includes("face"))    return "👤";
    if (reason.toLowerCase().includes("audio"))   return "🔊";
    if (reason.toLowerCase().includes("voices"))  return "🗣️";
    if (reason.toLowerCase().includes("paste"))   return "📋";
    if (reason.toLowerCase().includes("multiple")) return "👥";
    return "⚠️";
  };

  return (
    <div className="timeline-wrap">
      <div className="timeline-header">📅 Incident Timeline</div>
      <div className="timeline-track">
        {sorted.map((flag, i) => {
          const sc = STATUS_CONFIG[flag.status] || STATUS_CONFIG.Pending;
          return (
            <div key={flag.id} className="timeline-item">
              <div className="timeline-dot-col">
                <div className={`timeline-dot timeline-dot-${flag.status?.toLowerCase() || "pending"}`}>
                  {typeIcon(flag.reason)}
                </div>
                {i < sorted.length - 1 && <div className="timeline-line" />}
              </div>
              <div className="timeline-body">
                <div className="timeline-reason">{flag.reason}</div>
                <div className="timeline-meta">
                  <span>🕐 {flag.timestamp}</span>
                  <span className={`badge ${sc.badge}`} style={{ fontSize: "0.7rem" }}>
                    {sc.icon} {sc.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FlagReviewPage({ students, updateFlag }) {
  const { studentId } = useParams();
  const navigate      = useNavigate();
  const student       = students.find((s) => s.id === parseInt(studentId));
  const [localStatus, setLocalStatus] = useState({});

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

  const cfg = RISK_CONFIG[student.risk] || RISK_CONFIG.Low;

  const handleAction = (flagId, newStatus) => {
    updateFlag(student.id, flagId, newStatus);
    setLocalStatus((prev) => ({ ...prev, [flagId]: newStatus }));
  };

  const getStatus = (flag) => localStatus[flag.id] || flag.status;

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="shield-icon">🛡️</div>
          ExamShield
        </div>
        <div className="navbar-actions">
          <Link to="/faculty/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/faculty/report"    className="nav-link">Reports</Link>
          <Link to="/login"             className="btn btn-outline btn-sm">Logout</Link>
        </div>
      </nav>

      <div className="page">
        <button className="back-btn" onClick={() => navigate("/faculty/dashboard")}>
          ← Back to Dashboard
        </button>

        <div className="page-header">
          <h1>Evidence Review Panel</h1>
          <p>Review recorded evidence and take action on each flagged incident.</p>
        </div>

        {/* ── Top: Student Summary ── */}
        <div className="student-summary-bar card">
          <div className="student-summary-avatar">
            {student.name[0]}
          </div>
          <div className="student-summary-info">
            <div className="student-summary-name">{student.name}</div>
            <div className="student-summary-sub">{student.email} · {student.rollNo}</div>
          </div>
          <div className="student-summary-stats">
            <div className="summary-stat">
              <div className="summary-stat-val" style={{ color: cfg.color }}>
                {student.risk}
              </div>
              <div className="summary-stat-label">Risk Level</div>
            </div>
            <div className="summary-stat-divider" />
            <div className="summary-stat">
              <div className="summary-stat-val" style={{ color: "var(--red-500)" }}>
                {student.flags.length}
              </div>
              <div className="summary-stat-label">Total Flags</div>
            </div>
            <div className="summary-stat-divider" />
            <div className="summary-stat">
              <div className="summary-stat-val" style={{ color: "var(--yellow-500)" }}>
                {student.flags.filter((f) => getStatus(f) === "Pending").length}
              </div>
              <div className="summary-stat-label">Pending</div>
            </div>
            <div className="summary-stat-divider" />
            <div className="summary-stat">
              <div className="summary-stat-val" style={{ color: "var(--red-500)" }}>
                {student.flags.filter((f) => f.reason === "Tab switch detected").length}
              </div>
              <div className="summary-stat-label">Tab Switches</div>
            </div>
          </div>
          <span className={`badge ${cfg.badge}`} style={{ alignSelf: "center", fontSize: "0.8rem" }}>
            {cfg.label}
          </span>
        </div>

        {/* ── Timeline ── */}
        {student.flags.length > 0 && (
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div className="card-body" style={{ paddingBottom: "0.5rem" }}>
              <IncidentTimeline flags={student.flags} />
            </div>
          </div>
        )}

        {/* ── Incident Evidence Cards ── */}
        <div style={{ marginTop: "1.5rem" }}>
          {student.flags.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gray-700)" }}>
                No suspicious activity recorded
              </div>
              <div style={{ color: "var(--gray-400)", marginTop: "0.375rem" }}>
                This student has a clean exam session.
              </div>
            </div>
          ) : (
            student.flags.map((flag, idx) => {
              const status     = getStatus(flag);
              const sc         = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
              const audioCls   = AUDIO_CHIP_CLASS[flag.audioSeverity || "low"];
              const isPending  = status === "Pending";

              const cardBorder =
                status === "Approved"  ? "var(--green-200)"  :
                status === "Flagged"   ? "var(--red-200)"    :
                status === "Technical" ? "var(--yellow-200)" : "var(--gray-200)";

              const cardBg =
                status === "Approved"  ? "var(--green-50)"  :
                status === "Flagged"   ? "var(--red-50)"    :
                status === "Technical" ? "var(--yellow-50)" : "var(--white)";

              return (
                <div
                  key={flag.id}
                  className="card incident-card"
                  style={{ borderColor: cardBorder, background: cardBg, marginBottom: "1.5rem" }}
                >
                  {/* Card Header */}
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>
                        {status === "Approved" ? "✅" : status === "Flagged" ? "🚨" : status === "Technical" ? "🔧" : "⚠️"}
                      </span>
                      <div>
                        <div className="card-title">{flag.reason}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: "0.1rem" }}>
                          Incident #{idx + 1} · 🕐 {flag.timestamp}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span className={`badge ${sc.badge}`}>{sc.icon} {sc.label}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    {/* ── Evidence Grid: Recording + Screenshot ── */}
                    <div className="evidence-grid">
                      {/* Recording Clip */}
                      <div className="evidence-panel">
                        <div className="evidence-panel-title">📹 Recording Clip</div>
                        <VideoPlayer src={flag.recordingBlobUrl} />
                        <div className="evidence-panel-caption">
                          ~12 second clip captured at incident
                        </div>
                      </div>

                      {/* Screenshot */}
                      <div className="evidence-panel">
                        <div className="evidence-panel-title">📸 Screenshot Evidence</div>
                        <Screenshot src={flag.screenshotDataUrl} />
                        <div className="evidence-panel-caption">
                          Frame captured at exact moment of flag
                        </div>
                      </div>
                    </div>

                    {/* ── Audio + Confidence Row ── */}
                    <div className="evidence-meta-row">
                      {/* Audio Observation */}
                      <div className="evidence-meta-item">
                        <div className="evidence-meta-label">🔊 Audio Observation</div>
                        <span className={audioCls}>
                          {flag.audioIcon} {flag.audioObservation}
                        </span>
                        {flag.audioLevel > 0 && (
                          <div className="audio-level-wrap">
                            <div className="audio-level-track">
                              <div
                                className="audio-level-fill"
                                style={{
                                  width: `${flag.audioLevel}%`,
                                  background:
                                    flag.audioSeverity === "high"   ? "var(--red-500)"    :
                                    flag.audioSeverity === "medium" ? "var(--yellow-500)" : "var(--green-500)",
                                }}
                              />
                            </div>
                            <span className="audio-level-val">{flag.audioLevel}%</span>
                          </div>
                        )}
                      </div>

                      {/* AI Confidence Score */}
                      <div className="evidence-meta-item">
                        <div className="evidence-meta-label">🤖 AI Confidence Score</div>
                        <div className="confidence-score-display">
                          <span
                            className="confidence-score-num"
                            style={{
                              color:
                                flag.confidence >= 80 ? "var(--red-500)"    :
                                flag.confidence >= 60 ? "var(--yellow-500)" : "var(--green-500)",
                            }}
                          >
                            {flag.confidence}%
                          </span>
                          <div className="confidence-bar" style={{ flex: 1 }}>
                            <div
                              className="confidence-fill"
                              style={{ width: `${flag.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Decision Buttons ── */}
                    {isPending ? (
                      <div className="decision-row">
                        <div className="decision-label">Faculty Decision:</div>
                        <div className="decision-buttons">
                          <button
                            id={`approve-btn-${flag.id}`}
                            className="btn btn-success"
                            onClick={() => handleAction(flag.id, "Approved")}
                          >
                            ✅ Approve Incident
                          </button>
                          <button
                            id={`flag-btn-${flag.id}`}
                            className="btn btn-danger"
                            onClick={() => handleAction(flag.id, "Flagged")}
                          >
                            🚨 Flag Incident
                          </button>
                          <button
                            id={`technical-btn-${flag.id}`}
                            className="btn btn-warning"
                            onClick={() => handleAction(flag.id, "Technical")}
                          >
                            🔧 Mark as Technical Issue
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="decision-row resolved">
                        <span style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
                          Decision recorded: <strong>{sc.icon} {sc.label}</strong>
                        </span>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleAction(flag.id, "Pending")}
                        >
                          ↩ Revert to Pending
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
    </>
  );
}
