import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { SUBJECTS } from "../data/dummyData";

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

function VideoPlayer({ src, incidentStartSec, incidentStart, incidentEnd, incidentDuration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const intervalRef  = useRef(null);
  const progressRef  = useRef(0);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const startPlay = () => {
    progressRef.current = 0;
    setProgress(0);
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      progressRef.current += 1.2;
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
      }
    }, 180);
  };

  const stopPlay = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
  };

  const handleClick = () => (isPlaying ? stopPlay() : startPlay());

  /* ── Real recording (base64 data URL) ── */
  if (src) {
    const seekTo = incidentStartSec > 0 ? incidentStartSec : 12;
    return (
      <div>
        <video className="evidence-video" src={src} controls playsInline />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          <button
            className="btn btn-sm btn-outline"
            onClick={(e) => {
              const v = e.currentTarget.closest("div").previousSibling;
              if (v) { v.currentTime = seekTo; v.play(); }
            }}
          >
            ⏩ Jump to Incident ({incidentStart || `~${seekTo}s`})
          </button>
          <span style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
            Incident window: {incidentStart} → {incidentEnd} ({incidentDuration}s)
          </span>
        </div>
      </div>
    );
  }

  /* ── Simulated recording ── */
  const elapsed = Math.round((progress / 100) * (incidentDuration || 12));

  return (
    <div className="sim-recording-wrap">
      {/* Main screen — fully clickable */}
      <div className="sim-recording-screen" onClick={handleClick} title={isPlaying ? "Click to pause" : "Click to play"}>
        {/* Background grid */}
        <div className="sim-screen-grid" />

        {/* Frozen screen content */}
        <div className="sim-screen-content">
          <div className="sim-screen-browser-bar">
            <div className="sim-browser-dots"><span /><span /><span /></div>
            <div className="sim-browser-url">🔒 exam.university.edu/student/exam</div>
          </div>
          <div className="sim-screen-body">
            <div className="sim-text-line w-60" />
            <div className="sim-text-line w-80" />
            <div className="sim-text-line w-45" />
            <div className="sim-text-line w-70" style={{ marginTop: "0.75rem" }} />
            <div className="sim-text-line w-55" />
            <div className="sim-text-line w-35" style={{ marginTop: "0.75rem" }} />
          </div>
        </div>

        {/* REC badge top-left */}
        <div className="sim-rec-badge">
          <span className="sim-rec-dot" />
          {isPlaying ? "PLAYING" : "REC"}
        </div>

        {/* Duration top-right */}
        <div className="sim-duration-badge">
          {elapsed}s / {incidentDuration || 12}s
        </div>

        {/* Incident alert box — non-blocking */}
        <div className="sim-alert-overlay">
          <div className="sim-alert-icon">⚠️</div>
          <div className="sim-alert-text">Suspicious Activity Detected</div>
          {incidentStart && (
            <div className="sim-alert-sub">{incidentStart} → {incidentEnd}</div>
          )}
        </div>

        {/* LARGE centered play / pause button */}
        <div className={`sim-center-play ${isPlaying ? "playing" : ""}`}>
          <div className="sim-center-play-ring" />
          <span className="sim-center-play-icon">{isPlaying ? "⏸" : "▶"}</span>
        </div>

        {/* Bottom gradient overlay for controls */}
        <div className="sim-bottom-gradient" />

        {/* Incident timestamp at very bottom of screen */}
        {incidentStart && (
          <div className="sim-timestamp-overlay">
            ⏱ {incidentStart} → {incidentEnd}
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="sim-controls-bar">
        <button className="sim-ctrl-btn" onClick={handleClick}>
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <div className="sim-scrubber-bar" style={{ flex: 1, cursor: "pointer" }} onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct  = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          progressRef.current = pct;
          setProgress(pct);
        }}>
          <div className="sim-scrubber-fill" style={{ width: `${progress}%` }} />
          {incidentDuration && <div className="sim-incident-marker" style={{ left: "35%" }} title="Incident" />}
        </div>
        <span className="sim-ctrl-time">{elapsed}s</span>
      </div>

      <div style={{ fontSize: "0.7rem", color: "var(--yellow-600)", marginTop: "0.375rem", fontWeight: 600 }}>
        ⚠️ Simulated recording preview — actual clip captured during live session
      </div>
    </div>
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
  return <img className="evidence-screenshot" src={src} alt="Screenshot at moment of incident" />;
}

function IncidentTimeline({ flags }) {
  if (!flags.length) return null;
  const sorted = [...flags].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const typeIcon = (reason) => {
    if (reason.toLowerCase().includes("tab"))       return "🔀";
    if (reason.toLowerCase().includes("face"))      return "👤";
    if (reason.toLowerCase().includes("audio"))     return "🔊";
    if (reason.toLowerCase().includes("voices"))    return "🗣️";
    if (reason.toLowerCase().includes("paste"))     return "📋";
    if (reason.toLowerCase().includes("multiple"))  return "👥";
    if (reason.toLowerCase().includes("extension")) return "🧩";
    if (reason.toLowerCase().includes("absence"))   return "🕐";
    return "⚠️";
  };

  return (
    <div className="timeline-wrap">
      <div className="timeline-header">📅 Incident Timeline</div>
      <div className="timeline-track">
        {sorted.map((flag, i) => {
          const sc = STATUS_CONFIG[flag.status] || STATUS_CONFIG.Pending;
          const subj = SUBJECTS.find((s) => s.id === flag.subjectId);
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
                  {flag.incidentStart && (
                    <span className="incident-time-tag">
                      ⏱ {flag.incidentStart} → {flag.incidentEnd} ({flag.incidentDuration}s)
                    </span>
                  )}
                  {subj && (
                    <span style={{ color: subj.color, fontWeight: 600, fontSize: "0.72rem" }}>
                      {subj.icon} {subj.short}
                    </span>
                  )}
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

export default function FlagReviewPage({ students, updateFlag, selectedSubjectId }) {
  const { studentId } = useParams();
  const navigate      = useNavigate();
  const student       = students.find((s) => s.id === parseInt(studentId));
  const [localStatus, setLocalStatus] = useState({});
  const [subjectFilter, setSubjectFilter] = useState(selectedSubjectId || "all");

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

  // Filter flags by subject
  const displayedFlags = subjectFilter === "all"
    ? student.flags
    : student.flags.filter((f) => f.subjectId === subjectFilter);

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
          <Link to="/faculty/report"    className="nav-link">Reports</Link>
          <Link to="/faculty/analytics" className="nav-link">Analytics</Link>
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

        {/* Student Summary */}
        <div className="student-summary-bar card">
          <div className="student-summary-avatar">{student.name[0]}</div>
          <div className="student-summary-info">
            <div className="student-summary-name">{student.name}</div>
            <div className="student-summary-sub">{student.email} · {student.rollNo}</div>
          </div>
          <div className="student-summary-stats">
            <div className="summary-stat">
              <div className="summary-stat-val" style={{ color: cfg.color }}>{student.risk}</div>
              <div className="summary-stat-label">Risk Level</div>
            </div>
            <div className="summary-stat-divider" />
            <div className="summary-stat">
              <div className="summary-stat-val" style={{ color: "var(--red-500)" }}>{student.flags.length}</div>
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

        {/* Subject filter */}
        <div className="subject-filter-bar" style={{ marginTop: "1rem" }}>
          <span className="subject-filter-label">Filter by Subject:</span>
          <div className="subject-filter-tabs">
            <button
              className={`subject-filter-tab ${subjectFilter === "all" ? "active" : ""}`}
              onClick={() => setSubjectFilter("all")}
            >
              All ({student.flags.length})
            </button>
            {SUBJECTS.filter((s) => student.flags.some((f) => f.subjectId === s.id)).map((s) => {
              const count = student.flags.filter((f) => f.subjectId === s.id).length;
              return (
                <button
                  key={s.id}
                  className={`subject-filter-tab ${subjectFilter === s.id ? "active" : ""}`}
                  style={{ "--tab-color": s.color }}
                  onClick={() => setSubjectFilter(s.id)}
                >
                  {s.icon} {s.short} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        {student.flags.length > 0 && (
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div className="card-body" style={{ paddingBottom: "0.5rem" }}>
              <IncidentTimeline flags={displayedFlags} />
            </div>
          </div>
        )}

        {/* Incident Evidence Cards */}
        <div style={{ marginTop: "1.5rem" }}>
          {displayedFlags.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gray-700)" }}>
                No suspicious activity recorded
              </div>
              <div style={{ color: "var(--gray-400)", marginTop: "0.375rem" }}>
                {subjectFilter !== "all" ? "No incidents for this subject." : "This student has a clean exam session."}
              </div>
            </div>
          ) : (
            displayedFlags.map((flag, idx) => {
              const status    = getStatus(flag);
              const sc        = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
              const audioCls  = AUDIO_CHIP_CLASS[flag.audioSeverity || "low"];
              const isPending = status === "Pending";
              const subj      = SUBJECTS.find((s) => s.id === flag.subjectId);

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
                        <div style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: "0.1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span>Incident #{idx + 1} · 🕐 {flag.timestamp}</span>
                          {subj && (
                            <span style={{ color: subj.color, fontWeight: 600 }}>
                              {subj.icon} {subj.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span className={`badge ${sc.badge}`}>{sc.icon} {sc.label}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    {/* ── Incident Timestamp Box ── */}
                    {flag.incidentStart && (
                      <div className="incident-timestamp-box">
                        <span className="incident-ts-icon">⏱️</span>
                        <div>
                          <div className="incident-ts-main">
                            Incident recorded from{" "}
                            <strong>{flag.incidentStart}</strong> to{" "}
                            <strong>{flag.incidentEnd}</strong>
                          </div>
                          <div className="incident-ts-duration">
                            Duration: {flag.incidentDuration}s · Click "Jump to Incident" on the recording to navigate directly.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Evidence Grid: Recording + Screenshot ── */}
                    <div className="evidence-grid">
                      <div className="evidence-panel">
                        <div className="evidence-panel-title">📹 Recording Clip</div>
                        <VideoPlayer
                          src={flag.recordingBlobUrl}
                          incidentStartSec={flag.incidentStartSec}
                          incidentStart={flag.incidentStart}
                          incidentEnd={flag.incidentEnd}
                          incidentDuration={flag.incidentDuration}
                        />
                        <div className="evidence-panel-caption">
                          {flag.incidentStart
                            ? `Clip: ${flag.incidentStart} → ${flag.incidentEnd} (${flag.incidentDuration}s)`
                            : "~12 second clip captured at incident"}
                        </div>
                      </div>

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
                            <div className="confidence-fill" style={{ width: `${flag.confidence}%` }} />
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
