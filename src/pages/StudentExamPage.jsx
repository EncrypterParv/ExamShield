import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SUBJECTS, examQuestions, codingQuestions, mcqQuestions } from "../data/dummyData";
import useProctoring from "../hooks/useProctoring";
import CodeEditor from "../components/CodeEditor";
import { saveExamProgress, clearExamProgress } from "../utils/examProgress";

const EXAM_DURATION = 45 * 60;

// ─── Corner toast ──────────────────────────────────────────────────────────────
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
function PreflightGate({ onStart, startProctoring, screenReady, permissionDenied, subject }) {
  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [fullscreenError,   setFullscreenError]   = useState(false);
  const [requestingScreen,  setRequestingScreen]  = useState(false);
  const [extensionsConfirmed, setExtensionsConfirmed] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreenGranted(!!document.fullscreenElement);
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

  const allGranted = fullscreenGranted && screenReady && extensionsConfirmed;

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
      {done && <span className="preflight-granted-badge">Granted ✓</span>}
    </div>
  );

  return (
    <div className="preflight-overlay">
      <div className="preflight-card">
        <div className="preflight-header">
          <div className="shield-icon" style={{ width: 48, height: 48, fontSize: "1.5rem" }}>🛡️</div>
          <div>
            <h1 className="preflight-title">ExamShield Security Check</h1>
            {subject && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <span style={{ fontSize: "1.25rem" }}>{subject.icon}</span>
                <span style={{ fontWeight: 600, color: subject.color }}>{subject.name}</span>
                {subject.examType === "coding" && (
                  <span className="subject-type-badge subject-type-coding" style={{ fontSize: "0.7rem" }}>
                    💻 Coding Exam
                  </span>
                )}
              </div>
            )}
            <p className="preflight-subtitle">
              Complete the steps below before your exam begins.
              Both permissions are <strong>required</strong> to ensure exam integrity.
            </p>
          </div>
        </div>

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

          {/* Step 3: Extension Blocker */}
          <div className={`preflight-row ${extensionsConfirmed ? "done" : ""}`}>
            <div className={`preflight-check ${extensionsConfirmed ? "check-ok" : "check-pending"}`}>
              {extensionsConfirmed ? "✓" : "○"}
            </div>
            <div className="preflight-row-body" style={{ flex: 1 }}>
              <div className="preflight-row-label">🧩 Browser Extension Check</div>
              <div className="preflight-row-sub">
                ExamShield will <strong>block all extension activity</strong> during your exam.
                Please disable any extensions before proceeding (e.g., Grammarly, Google Translate, etc.).
              </div>
              {!extensionsConfirmed && (
                <div className="extension-disable-warning">
                  <span className="ext-warn-icon">⚠️</span>
                  <span>Extensions detected can trigger an automatic integrity violation. Disable them now via <code>chrome://extensions</code>.</span>
                </div>
              )}
              <label className="ext-confirm-label">
                <input
                  type="checkbox"
                  checked={extensionsConfirmed}
                  onChange={(e) => setExtensionsConfirmed(e.target.checked)}
                  id="ext-confirm-checkbox"
                />
                <span>I confirm I have disabled all browser extensions</span>
              </label>
            </div>
            {extensionsConfirmed && <span className="preflight-granted-badge">Confirmed ✓</span>}
          </div>
        </div>

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

// ─── Exam status bar pills ─────────────────────────────────────────────────────
function ExamStatusBar({ screenReady }) {
  const [netStatus, setNetStatus] = useState(navigator.onLine ? "stable" : "offline");

  useEffect(() => {
    const handleOnline  = () => setNetStatus("stable");
    const handleOffline = () => setNetStatus("offline");
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="exam-status-bar">
      <span className="exam-status-pill status-active">
        <span className="status-dot" /> 🎥 Camera active
      </span>
      <span className={`exam-status-pill ${screenReady ? "status-active" : "status-warn"}`}>
        <span className="status-dot" /> 🛡️ Proctoring {screenReady ? "enabled" : "limited"}
      </span>
      <span className={`exam-status-pill ${netStatus === "stable" ? "status-active" : "status-error"}`}>
        <span className="status-dot" /> 🌐 Internet {netStatus}
      </span>
      <span className="exam-status-pill status-info">
        <span className="status-dot" /> 🔒 Secure Exam Mode
      </span>
    </div>
  );
}

// ─── Main exam page ────────────────────────────────────────────────────────────
export default function StudentExamPage({ currentUserId, selectedSubjectId, addFlag, markExamSubmitted, isExamSubmitted }) {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  // Resolve subject from URL param or prop
  const subjectId = searchParams.get("subject") || selectedSubjectId || "dsa";
  const subject   = SUBJECTS.find((s) => s.id === subjectId) ?? SUBJECTS[3];

  // Guard: already submitted → show locked screen
  const alreadySubmitted = isExamSubmitted?.(currentUserId, subjectId);

  // Resolve question banks based on examType
  const isMixed   = subject.examType === "mixed";
  const isCoding  = subject.examType === "coding";
  const isMcqOnly = !isCoding && !isMixed;

  // For mixed: both MCQ + coding sections
  const mixedMcqQuestions    = isMixed ? (mcqQuestions[subjectId]    ?? []) : [];
  const mixedCodingQuestions = isMixed ? (codingQuestions[subjectId] ?? codingQuestions.dsa) : [];

  // For pure MCQ or pure coding
  const questions = isCoding
    ? (codingQuestions[subjectId] ?? codingQuestions.dsa)
    : isMcqOnly
    ? (examQuestions[subjectId]  ?? examQuestions.fset)
    : [];

  const [phase,      setPhase]      = useState("preflight");
  const [answers,    setAnswers]    = useState({});   // MCQ answers
  const [codeMap,    setCodeMap]    = useState({});   // Coding: { [questionId]: { code, language } }
  const [timeLeft,   setTimeLeft]   = useState(EXAM_DURATION);
  const [autoSaved,  setAutoSaved]  = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [modal,      setModal]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const [warningLog, setWarningLog] = useState([]);
  const [warnings,   setWarnings]   = useState(0);

  // Secure mode + extension simulation
  const [secureModeBanner, setSecureModeBanner] = useState(false);
  const [extensionAlert,   setExtensionAlert]   = useState(false);

  const autoSaveTimer  = useRef(null);
  const isBlurred      = useRef(false);
  const toastTimer     = useRef(null);
  const examActiveRef  = useRef(false);
  const extTimer       = useRef(null);

  const {
    screenReady,
    permissionDenied,
    screenEnded,
    startProctoring,
    captureEvidence,
    stopProctoring,
  } = useProctoring();

  useEffect(() => () => stopProctoring(), [stopProctoring]);

  // ── Extension simulation — fires once between 60–180 s after exam start ──
  const scheduleExtensionSim = useCallback(() => {
    const delay = (60 + Math.floor(Math.random() * 120)) * 1000;
    extTimer.current = setTimeout(async () => {
      if (!examActiveRef.current || submitted) return;
      setExtensionAlert(true);
      setTimeout(() => setExtensionAlert(false), 6000);
      await handleSuspiciousActivity("Unauthorized extension activity", 80);
    }, delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Exit fullscreen detection ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;
    const handleFsChange = () => {
      if (!examActiveRef.current) return;
      if (!document.fullscreenElement && !submitted) {
        handleSuspiciousActivity("Fullscreen exited", 75);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, [phase, submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown ────────────────────────────────────────────────────────────
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

  // ── Auto-save ────────────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    setAutoSaved(true);
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => setAutoSaved(false), 2500);
  }, []);

  const handleAnswer = (qId, oi) => {
    setAnswers((prev) => ({ ...prev, [qId]: oi }));
    triggerAutoSave();
  };

  const handleCodeChange = (qId, code, language) => {
    setCodeMap((prev) => ({ ...prev, [qId]: { code, language } }));
    triggerAutoSave();
  };

  // ── Show corner toast ─────────────────────────────────────────────────────
  const showToast = useCallback((data) => {
    setToast({ ...data, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  // ── Core suspicious-activity handler ──────────────────────────────────────
  const handleSuspiciousActivity = useCallback(async (reason, confidence) => {
    const evidence = await captureEvidence();

    setWarnings((prev) => {
      const newCount = prev + 1;
      const time     = new Date().toLocaleTimeString();
      const isFinal  = newCount >= 3;

      if (isFinal) {
        setModal({
          type: "critical",
          title: "Exam Terminated",
          reason: `${reason} — maximum violations exceeded`,
          subtitle: "You have exceeded 3 violations. Your exam has been auto-submitted and reported to faculty.",
          time,
        });
        setWarningLog((l) => [...l, { type: "critical", icon: "⛔", reason: "Exam Terminated", time }]);
        setSubmitted(true);
        stopProctoring();
        clearTimeout(extTimer.current);
        setTimeout(() => navigate("/subject-select"), 5000);
      } else {
        const icon = reason.includes("Tab") ? "🔀" :
                     reason.includes("Fullscreen") ? "🖥️" :
                     reason.includes("extension") ? "🧩" :
                     reason.includes("paste") ? "📋" : "⚠️";
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

    if (currentUserId && addFlag) {
      addFlag(currentUserId, reason, confidence, evidence, subjectId);
    }
  }, [captureEvidence, currentUserId, addFlag, stopProctoring, navigate, showToast, subjectId]);

  // ── Tab-switch detection (visibilitychange is the most reliable API) ─────
  // window.blur is unreliable in fullscreen and some browsers; it fires for
  // DevTools open, file dialogs, etc. document.visibilitychange fires every
  // time the tab becomes hidden — tab switch, Alt+Tab, minimise, lock screen.
  useEffect(() => {
    if (phase !== "exam") return;

    // Primary: visibility API
    const handleVisibility = async () => {
      if (document.hidden) {
        if (!examActiveRef.current || submitted || isBlurred.current) return;
        isBlurred.current = true;
        await handleSuspiciousActivity("Tab switch detected", 85);
      } else {
        isBlurred.current = false;
      }
    };

    // Fallback: window blur for focus-loss that doesn't hide the tab
    // (e.g. another OS window steals focus while the tab stays visible)
    const handleBlur = async () => {
      if (!examActiveRef.current || submitted || isBlurred.current) return;
      if (document.hidden) return;  // already handled by visibilitychange
      isBlurred.current = true;
      await handleSuspiciousActivity("Tab switch detected", 85);
    };

    const handleFocus = () => { isBlurred.current = false; };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur",  handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur",  handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [phase, submitted, handleSuspiciousActivity]);

  const doSubmit = () => {
    setSubmitted(true);
    stopProctoring();
    clearTimeout(extTimer.current);
    clearExamProgress(subjectId);   // remove from ongoing-exams section
    if (markExamSubmitted) markExamSubmitted(currentUserId, subjectId);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setTimeout(() => navigate("/subject-select"), 3000);
  };

  const handleStart = () => {
    examActiveRef.current = true;
    isBlurred.current     = false;
    setPhase("exam");
    setSecureModeBanner(true);
    setTimeout(() => setSecureModeBanner(false), 5000);
    scheduleExtensionSim();
  };


  // Progress calculation handles all exam types
  const answered = isMixed
    ? Object.keys(answers).length + Object.keys(codeMap).length
    : isCoding
    ? Object.keys(codeMap).length
    : Object.keys(answers).length;
  const total = isMixed
    ? mixedMcqQuestions.length + mixedCodingQuestions.length
    : questions.length;
  const remaining = total - answered;
  const progress  = total > 0 ? Math.round((answered / total) * 100) : 0;

  // ── Format timer for display and progress saving ──────────────────────────────
  const formatTime = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Persist live progress to localStorage so SubjectDashboard shows ongoing card
  // MUST be placed after answered/total/timeLeft are computed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== "exam" || submitted) return;
    saveExamProgress(subjectId, answered, total, formatTime(timeLeft));
  }, [phase, submitted, answered, total, timeLeft, subjectId]); // eslint-disable-line

  const isUrgent  = timeLeft < 5 * 60;

  // ── ALREADY SUBMITTED guard ───────────────────────────────────────────
  if (alreadySubmitted) {
    return (
      <div className="preflight-overlay">
        <div className="preflight-card" style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔒</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--gray-800)" }}>
            Exam Already Submitted
          </h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            You have already submitted the <strong>{subject.name}</strong> exam.
            Re-attempting is not permitted. Contact your faculty if you believe this is an error.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/subject-select")}>
            ← Back to Subject Selection
          </button>
        </div>
      </div>
    );
  }

  // ── PRE-FLIGHT GATE ───────────────────────────────────────────────────────
  if (phase === "preflight") {
    return (
      <PreflightGate
        onStart={handleStart}
        startProctoring={startProctoring}
        screenReady={screenReady}
        permissionDenied={permissionDenied}
        subject={subject}
      />
    );
  }

  // ── EXAM PHASE ────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Exam Header ──────────────────────────────────────────────── */}
      <div className="exam-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div className="navbar-brand">
            <div className="shield-icon">🛡️</div>
            ExamShield
          </div>
          <span style={{ fontSize: "0.875rem", color: subject.color, fontWeight: 600, marginLeft: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {subject.icon} {subject.name}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className={`screen-rec-pill ${screenReady ? "live" : permissionDenied ? "denied" : "waiting"}`}>
            <span className="screen-rec-dot" />
            {screenReady ? "Screen Recording Active" : permissionDenied ? "Recording Denied" : screenEnded ? "Sharing Stopped" : "Connecting…"}
          </div>

          {warnings > 0 && (
            <div style={{ color: "var(--red-600)", fontWeight: 700, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              ⚠️ {warnings}/3 Violations
            </div>
          )}

          {autoSaved && (
            <div className="autosave">
              <span>✅</span> Answer auto-saved ✓
            </div>
          )}

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

      {/* ── Secure Mode Banner ───────────────────────────────────────── */}
      {secureModeBanner && (
        <div className="secure-mode-banner">
          🔒 Secure Exam Mode Enabled — Browser extensions restricted · Tab switching monitored · Screen recording active
        </div>
      )}

      {/* ── Extension Alert Banner ───────────────────────────────────── */}
      {extensionAlert && (
        <div className="extension-alert-banner">
          ⛔ Unauthorized extension activity detected — This incident has been flagged and reported to faculty.
        </div>
      )}

      {/* ── Status bar ──────────────────────────────────────────────── */}
      <ExamStatusBar screenReady={screenReady} />

      {/* ── Banners ─────────────────────────────────────────────────── */}
      {screenEnded && !permissionDenied && !submitted && (
        <div className="cam-denied-banner" style={{ background: "var(--red-50)", borderColor: "var(--red-500)", color: "var(--red-600)" }}>
          🔴 You stopped screen sharing — this has been flagged. Faculty has been notified.
        </div>
      )}

      {/* ── Warning history strip ────────────────────────────────────── */}
      <WarningStrip log={warningLog} />

      {/* ── Exam Body ────────────────────────────────────────────────── */}
      <div className="exam-body">
        {submitted ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Exam Submitted!</h2>
            <p style={{ color: "var(--gray-500)" }}>Thank you. Returning to subject selection…</p>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="exam-progress">
              <div className="exam-progress-info">
                <span className="exam-progress-label">
                  <strong>{answered}</strong> of <strong>{total}</strong> {isCoding ? "problems" : "questions"} attempted
                </span>
                <span className="exam-progress-remaining">
                  {remaining} remaining · {progress}% complete
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* ── MIXED: MCQ section then Coding section ──────────── */}
            {isMixed ? (
              <>
                {/* MCQ Section */}
                <div className="exam-section-header">
                  <span className="exam-section-badge exam-section-mcq">📝 Part A — Multiple Choice</span>
                  <span className="exam-section-count">{mixedMcqQuestions.length} questions</span>
                </div>
                {mixedMcqQuestions.map((q, qi) => (
                  <div className="card question-card" key={q.id}>
                    <div className="card-body">
                      <div className="question-number">Question {qi + 1} of {mixedMcqQuestions.length}</div>
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
                      {answers[q.id] !== undefined && (
                        <div className="mcq-saved-indicator">✅ Answer auto-saved ✓</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Coding Section */}
                <div className="exam-section-header" style={{ marginTop: "1.5rem" }}>
                  <span className="exam-section-badge exam-section-coding">💻 Part B — Coding Problems</span>
                  <span className="exam-section-count">{mixedCodingQuestions.length} problem{mixedCodingQuestions.length > 1 ? "s" : ""}</span>
                </div>
                {mixedCodingQuestions.map((q, qi) => (
                  <div className="card question-card coding-question-card" key={q.id}>
                    <div className="card-body">
                      <div className="coding-q-header">
                        <div>
                          <span className="question-number">Problem {qi + 1} of {mixedCodingQuestions.length}</span>
                          <h3 className="coding-q-title">{q.title}</h3>
                        </div>
                        <span className={`difficulty-badge diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                      </div>
                      <p className="coding-q-description">{q.description}</p>
                      <div className="coding-examples">
                        <div className="coding-examples-title">Examples:</div>
                        {q.examples.map((ex, ei) => (
                          <div key={ei} className="coding-example">
                            <div><span className="coding-ex-label">Input:</span> <code>{ex.input}</code></div>
                            <div><span className="coding-ex-label">Output:</span> <code>{ex.output}</code></div>
                          </div>
                        ))}
                      </div>
                      <div className="coding-constraints">
                        <div className="coding-constraints-title">Constraints:</div>
                        <pre className="coding-constraints-text">{q.constraints}</pre>
                      </div>
                      <CodeEditor
                        question={q}
                        onCodeChange={(code, lang) => handleCodeChange(q.id, code, lang)}
                      />
                      {codeMap[q.id] && <div className="code-saved-indicator">✅ Answer auto-saved ✓</div>}
                    </div>
                  </div>
                ))}
              </>
            ) : isCoding ? (
              // ── Pure Coding Exam ───────────────────────────────────
              questions.map((q, qi) => (
                <div className="card question-card coding-question-card" key={q.id}>
                  <div className="card-body">
                    <div className="coding-q-header">
                      <div>
                        <span className="question-number">Problem {qi + 1} of {total}</span>
                        <h3 className="coding-q-title">{q.title}</h3>
                      </div>
                      <span className={`difficulty-badge diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                    </div>
                    <p className="coding-q-description">{q.description}</p>
                    <div className="coding-examples">
                      <div className="coding-examples-title">Examples:</div>
                      {q.examples.map((ex, ei) => (
                        <div key={ei} className="coding-example">
                          <div><span className="coding-ex-label">Input:</span> <code>{ex.input}</code></div>
                          <div><span className="coding-ex-label">Output:</span> <code>{ex.output}</code></div>
                        </div>
                      ))}
                    </div>
                    <div className="coding-constraints">
                      <div className="coding-constraints-title">Constraints:</div>
                      <pre className="coding-constraints-text">{q.constraints}</pre>
                    </div>
                    <CodeEditor question={q} onCodeChange={(code, lang) => handleCodeChange(q.id, code, lang)} />
                    {codeMap[q.id] && <div className="code-saved-indicator">✅ Answer auto-saved ✓</div>}
                  </div>
                </div>
              ))
            ) : (
              // ── Pure MCQ Exam ─────────────────────────────────────
              questions.map((q, qi) => (
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
                    {answers[q.id] !== undefined && (
                      <div className="mcq-saved-indicator">✅ Answer auto-saved ✓</div>
                    )}
                  </div>
                </div>
              ))
            )}

            <div style={{ textAlign: "center", marginTop: "1rem", paddingBottom: "2rem" }}>
              <button id="exam-submit-bottom" className="btn btn-primary" style={{ minWidth: "200px" }} onClick={doSubmit}>
                Submit Exam
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Corner toast ─────────────────────────────────────────────── */}
      <FlagToast toast={toast} />

      {/* ── Blocking modal ───────────────────────────────────────────── */}
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
                <span className="modal-key">Subject</span>
                <span className="modal-val">{subject.icon} {subject.name}</span>
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
