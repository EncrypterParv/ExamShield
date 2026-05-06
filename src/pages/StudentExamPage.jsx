import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { examQuestions } from "../data/dummyData";
import useProctoring from "../hooks/useProctoring";

const EXAM_DURATION = 45 * 60;

// ─── Corner toast notification ─────────────────────────────────────────────────
function FlagToast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`flag-toast flag-toast-${toast.type}`} key={toast.id}>
      <div className="flag-toast-icon">{toast.type === "critical" ? "⛔" : "⚠️"}</div>
      <div className="flag-toast-body">
        <div className="flag-toast-title">{toast.title}</div>
        <div className="flag-toast-reason">{toast.reason}</div>
      </div>
      <div className="flag-toast-badge">{toast.warning}</div>
    </div>
  );
}

// ─── Warning history strip ─────────────────────────────────────────────────────
function WarningStrip({ log }) {
  if (!log.length) return null;
  return (
    <div className="warning-strip">
      <span className="warning-strip-label">⚠️ Flagged Incidents This Session:</span>
      <div className="warning-strip-items">
        {log.map((entry, i) => (
          <span key={i} className={`warning-strip-item ws-${entry.type}`}>
            {entry.icon} {entry.reason}
            <span className="ws-time">@ {entry.time}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Pre-exam permission gate ──────────────────────────────────────────────────
function PreflightGate({ onStart, startProctoring, screenReady, permissionDenied }) {
  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [fullscreenError,   setFullscreenError]   = useState(false);
  const [requestingScreen,  setRequestingScreen]  = useState(false);

  // Track fullscreen changes
  useEffect(() => {
    const onChange = () => {
      setFullscreenGranted(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      setFullscreenGranted(true);
      setFullscreenError(false);
    } catch {
      setFullscreenError(true);
    }
  };

  const handleScreenShare = async () => {
    setRequestingScreen(true);
    await startProctoring();
    setRequestingScreen(false);
  };

  const allGranted = fullscreenGranted && screenReady;

  const CheckRow = ({ done, denied, label, sub, action, actionLabel, loading }) => (
    <div className={`preflight-row ${done ? "done" : denied ? "denied" : ""}`}>
      <div className={`preflight-check ${done ? "check-ok" : denied ? "check-no" : "check-pending"}`}>
        {done ? "✓" : denied ? "✕" : "○"}
      </div>
      <div className="preflight-row-body">
        <div className="preflight-row-label">{label}</div>
        <div className="preflight-row-sub">{sub}</div>
      </div>
      {!done && (
        <button
          className={`btn btn-sm ${denied ? "btn-danger" : "btn-primary"}`}
          onClick={action}
          disabled={loading}
        >
          {loading ? "Requesting…" : actionLabel}
        </button>
      )}
      {done && (
        <span className="preflight-granted-badge">Granted ✓</span>
      )}
    </div>
  );

  return (
    <div className="preflight-overlay">
      <div className="preflight-card">
        {/* Header */}
        <div className="preflight-header">
          <div className="shield-icon" style={{ width: 48, height: 48, fontSize: "1.5rem" }}>🛡️</div>
          <div>
            <h1 className="preflight-title">ExamShield Security Check</h1>
            <p className="preflight-subtitle">
              Complete the steps below before your exam begins.
              Both permissions are <strong>required</strong> to ensure exam integrity.
            </p>
          </div>
        </div>

        {/* Permission checklist */}
        <div className="preflight-checklist">
          <CheckRow
            done={fullscreenGranted}
            denied={fullscreenError}
            label="🖥️ Fullscreen Mode"
            sub="Your exam must run in fullscreen. Exiting fullscreen during the exam will be flagged."
            action={handleFullscreen}
            actionLabel="Enable Fullscreen"
          />
          <CheckRow
            done={screenReady}
            denied={permissionDenied}
            label="📹 Screen Recording"
            sub="Share your entire screen so suspicious activity can be recorded as evidence for faculty review."
            action={handleScreenShare}
            actionLabel="Share My Screen"
            loading={requestingScreen}
          />
        </div>

        {/* Status message */}
        {!allGranted && (
          <div className="preflight-info">
            <span>🔒</span>
            <span>
              {!fullscreenGranted && !screenReady
                ? "Enable fullscreen and share your screen to continue."
                : !fullscreenGranted
                ? "Enable fullscreen to continue."
                : "Share your screen to continue."}
            </span>
          </div>
        )}

        {permissionDenied && (
          <div className="preflight-info preflight-info-error">
            <span>⛔</span>
            <span>
              Screen sharing was denied. Please click "Share My Screen" and select your
              <strong> Entire Screen</strong> (not a window or tab) to proceed.
            </span>
          </div>
        )}

        {/* Start button — only enabled when all granted */}
        <button
          id="start-exam-btn"
          className={`btn btn-lg ${allGranted ? "btn-primary" : "btn-disabled-locked"}`}
          onClick={allGranted ? onStart : undefined}
          disabled={!allGranted}
          style={{ marginTop: "1.5rem" }}
        >
          {allGranted ? "🚀 Start Exam" : "🔒 Complete security checks to begin"}
        </button>

        <p className="preflight-footnote">
          Your session is monitored for academic integrity. All evidence is reviewed
          by faculty only in the event of a flag.
        </p>
      </div>
    </div>
  );
}

// ─── Main exam page ────────────────────────────────────────────────────────────
export default function StudentExamPage({ currentUserId, addFlag }) {
  const navigate = useNavigate();
  const [phase,      setPhase]      = useState("preflight"); // "preflight" | "exam"
  const [answers,    setAnswers]    = useState({});
  const [timeLeft,   setTimeLeft]   = useState(EXAM_DURATION);
  const [autoSaved,  setAutoSaved]  = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [modal,      setModal]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const [warningLog, setWarningLog] = useState([]);
  const [warnings,   setWarnings]   = useState(0);
  const autoSaveTimer  = useRef(null);
  const isBlurred      = useRef(false);
  const toastTimer     = useRef(null);
  const examActiveRef  = useRef(false); // only true after "Start Exam" is clicked

  const {
    screenReady,
    permissionDenied,
    screenEnded,
    startProctoring,
    captureEvidence,
    stopProctoring,
  } = useProctoring();

  // Cleanup on unmount
  useEffect(() => () => stopProctoring(), [stopProctoring]);

  // ── Exit fullscreen detection — only active after exam starts ──────────
  useEffect(() => {
    if (phase !== "exam") return;

    const handleFsChange = () => {
      // Guard: ignore any fullscreen changes before exam is armed
      if (!examActiveRef.current) return;
      if (!document.fullscreenElement && !submitted) {
        handleSuspiciousActivity("Fullscreen exited", 75);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, [phase, submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam" || submitted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); doSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save ─────────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    setAutoSaved(true);
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => setAutoSaved(false), 2500);
  }, []);

  const handleAnswer = (qId, oi) => {
    setAnswers((prev) => ({ ...prev, [qId]: oi }));
    triggerAutoSave();
  };

  // ── Show corner toast ─────────────────────────────────────────────────
  const showToast = useCallback((data) => {
    setToast({ ...data, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  // ── Core suspicious-activity handler ─────────────────────────────────
  const handleSuspiciousActivity = useCallback(async (reason, confidence) => {
    const evidence = await captureEvidence();

    // Calculate new count outside the state updater to avoid Strict Mode double-invoke
    setWarnings((prev) => {
      const newCount = prev + 1;
      const time     = new Date().toLocaleTimeString();
      const isFinal  = newCount >= 3;

      if (isFinal) {
        setModal({
          type: "critical",
          title: "Exam Terminated",
          reason: `${reason} — maximum warnings exceeded`,
          subtitle: "You have exceeded 3 violations. Your exam has been auto-submitted and reported to faculty.",
          time,
        });
        setWarningLog((l) => [...l, { type: "critical", icon: "⛔", reason: "Exam Terminated", time }]);
        setSubmitted(true);
        stopProctoring();
        setTimeout(() => navigate("/login"), 5000);
      } else {
        const icon = reason.includes("Tab") ? "🔀" : reason.includes("Fullscreen") ? "🖥️" : "⚠️";
        setModal({
          type: "warning",
          title: "⚠️ Suspicious Activity Detected",
          reason,
          subtitle: `Warning ${newCount} of 3 — Evidence captured. ${3 - newCount} warning(s) remaining before exam termination.`,
          time,
          confidence,
          warning: `${newCount}/3`,
        });
        showToast({
          type: "warning",
          title: reason,
          reason: `Warning ${newCount}/3 — Evidence captured`,
          warning: `${newCount}/3`,
        });
        setWarningLog((l) => [...l, { type: "warning", icon, reason, time }]);
      }

      return newCount;
    });

    // addFlag is called OUTSIDE setWarnings so Strict Mode double-invoke doesn't duplicate flags
    if (currentUserId && addFlag) {
      addFlag(currentUserId, reason, confidence, evidence);
    }
  }, [captureEvidence, currentUserId, addFlag, stopProctoring, navigate, showToast]);

  // ── Tab-switch / blur detection ───────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;

    const handleBlur = async () => {
      // Guard: never flag anything until exam is explicitly started
      if (!examActiveRef.current) return;
      if (submitted || isBlurred.current) return;
      isBlurred.current = true;
      await handleSuspiciousActivity("Tab switch detected", 85);
    };

    const handleFocus = () => { isBlurred.current = false; };

    window.addEventListener("blur",  handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur",  handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [phase, submitted, handleSuspiciousActivity]);

  const doSubmit = () => {
    setSubmitted(true);
    stopProctoring();
    // Exit fullscreen on submit
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setTimeout(() => navigate("/login"), 3000);
  };

  const handleStart = () => {
    // Arm monitoring ONLY from this point forward
    examActiveRef.current = true;
    isBlurred.current     = false; // reset any stale blur from preflight
    setPhase("exam");
  };

  const formatTime = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const answered = Object.keys(answers).length;
  const total    = examQuestions.length;
  const progress = Math.round((answered / total) * 100);
  const isUrgent = timeLeft < 5 * 60;

  // ── PRE-FLIGHT GATE ───────────────────────────────────────────────────
  if (phase === "preflight") {
    return (
      <PreflightGate
        onStart={handleStart}
        startProctoring={startProctoring}
        screenReady={screenReady}
        permissionDenied={permissionDenied}
      />
    );
  }

  // ── EXAM PHASE ────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Exam Header ──────────────────────────────────────────────── */}
      <div className="exam-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div className="navbar-brand">
            <div className="shield-icon">🛡️</div>
            ExamShield
          </div>
          <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginLeft: "0.5rem" }}>
            | Data Structures &amp; Algorithms
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className={`screen-rec-pill ${screenReady ? "live" : permissionDenied ? "denied" : "waiting"}`}>
            <span className="screen-rec-dot" />
            {screenReady ? "Screen Recording Active" : permissionDenied ? "Recording Denied" : screenEnded ? "Sharing Stopped" : "Connecting…"}
          </div>

          {warnings > 0 && (
            <div style={{ color: "var(--red-600)", fontWeight: 700, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              ⚠️ {warnings}/3 Warnings
            </div>
          )}
          {autoSaved && <div className="autosave"><span>✅</span> Auto-saved</div>}

          <div className="exam-timer">
            <span className="timer-label">Time Left</span>
            <span className={`timer-value ${isUrgent ? "urgent" : ""}`}>{formatTime(timeLeft)}</span>
          </div>
          <button
            id="exam-submit-btn"
            className="btn btn-primary"
            onClick={doSubmit}
            disabled={submitted}
          >
            {submitted ? "Submitting…" : "Submit Exam"}
          </button>
        </div>
      </div>

      {/* ── Banners ───────────────────────────────────────────────────── */}
      {screenEnded && !permissionDenied && !submitted && (
        <div className="cam-denied-banner" style={{ background: "var(--red-50)", borderColor: "var(--red-500)", color: "var(--red-600)" }}>
          🔴 You stopped screen sharing — this has been flagged. Faculty has been notified.
        </div>
      )}

      {/* ── Warning history strip ─────────────────────────────────────── */}
      <WarningStrip log={warningLog} />

      {/* ── Exam Body ─────────────────────────────────────────────────── */}
      <div className="exam-body">
        {submitted ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Exam Submitted!</h2>
            <p style={{ color: "var(--gray-500)" }}>Thank you. Redirecting to login…</p>
          </div>
        ) : (
          <>
            <div className="exam-progress">
              <div className="exam-progress-label">{answered} of {total} questions answered</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {examQuestions.map((q, qi) => (
              <div className="card question-card" key={q.id}>
                <div className="card-body">
                  <div className="question-number">Question {qi + 1} of {total}</div>
                  <div className="question-text">{q.question}</div>
                  <div className="options-grid">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        id={`q${q.id}-opt${oi}`}
                        className={`option-btn ${answers[q.id] === oi ? "selected" : ""}`}
                        onClick={() => handleAnswer(q.id, oi)}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ textAlign: "center", marginTop: "1rem", paddingBottom: "2rem" }}>
              <button
                id="exam-submit-bottom"
                className="btn btn-primary"
                style={{ minWidth: "200px" }}
                onClick={doSubmit}
              >
                Submit Exam
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Corner toast ──────────────────────────────────────────────── */}
      <FlagToast toast={toast} />

      {/* ── Blocking modal ────────────────────────────────────────────── */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={() => { if (modal.type !== "critical") setModal(null); }}
        >
          <div className={`modal modal-flag modal-flag-${modal.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-flag-header">
              <div className="modal-flag-icon">{modal.type === "critical" ? "⛔" : "⚠️"}</div>
              <div>
                <div className="modal-title">{modal.title}</div>
                <div className="modal-subtitle">{modal.subtitle}</div>
              </div>
            </div>

            <div className="modal-detail">
              <div className="modal-row">
                <span className="modal-key">Reason</span>
                <span className="modal-val">{modal.reason}</span>
              </div>
              <div className="modal-row">
                <span className="modal-key">Time</span>
                <span className="modal-val">{modal.time}</span>
              </div>
              {modal.confidence && (
                <>
                  <div className="modal-row">
                    <span className="modal-key">AI Confidence</span>
                    <span className="modal-val" style={{ color: "var(--red-500)" }}>{modal.confidence}%</span>
                  </div>
                  <div className="confidence-bar-wrap">
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${modal.confidence}%` }} />
                    </div>
                  </div>
                </>
              )}
              <div className="modal-row" style={{ marginTop: "0.25rem" }}>
                <span className="modal-key">Evidence</span>
                <span className="modal-val" style={{ color: "var(--blue-600)", fontSize: "0.8rem" }}>
                  📹 Screen recording captured · 📸 Screenshot saved
                </span>
              </div>
            </div>

            {modal.type !== "critical" ? (
              <button
                id="alert-dismiss-btn"
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => setModal(null)}
              >
                I Understand — Continue Exam
              </button>
            ) : (
              <button className="btn btn-danger" style={{ width: "100%" }} disabled>
                Auto-submitting in 5 seconds…
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
