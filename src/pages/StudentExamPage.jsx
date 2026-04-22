import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { examQuestions } from "../data/dummyData";

const EXAM_DURATION = 45 * 60; // 45 minutes in seconds

export default function StudentExamPage({ currentUserId, addFlag }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [autoSaved, setAutoSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alert, setAlert] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const autoSaveTimer = useRef(null);
  const isBlurred = useRef(false);

  // ── Countdown timer ──
  useEffect(() => {
    if (submitted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [submitted]);

  // ── Auto-save simulation ──
  const triggerAutoSave = useCallback(() => {
    setAutoSaved(true);
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => setAutoSaved(false), 2500);
  }, []);

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    triggerAutoSave();
  };

  // ── Tab-switch / blur detection ──
  useEffect(() => {
    const handleBlur = () => {
      if (submitted || isBlurred.current) return;
      isBlurred.current = true;

      setWarnings((prev) => {
        const newWarnings = prev + 1;
        
        if (currentUserId && addFlag) {
          addFlag(currentUserId, "Tab switch detected", 85);
        }

        if (newWarnings >= 3) {
          setAlert({
            type: "critical",
            reason: "Maximum warnings exceeded (Tab switching)",
            title: "Exam Terminated",
            subtitle: "You have exceeded the maximum allowed tab switches. Your exam has been auto-submitted.",
          });
          setSubmitted(true);
          setTimeout(() => navigate("/login"), 4000);
        } else {
          setAlert({
            type: "warning",
            reason: "Tab switch / Window focus lost detected",
            confidence: 85,
            timestamp: new Date().toLocaleTimeString(),
            title: "Suspicious Activity Detected",
            subtitle: `Warning ${newWarnings} of 3. This incident has been automatically logged.`,
          });
        }
        return newWarnings;
      });
    };
    
    const handleFocus = () => {
      isBlurred.current = false;
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [submitted, navigate, currentUserId, addFlag]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answered = Object.keys(answers).length;
  const total = examQuestions.length;
  const progress = Math.round((answered / total) * 100);
  const isUrgent = timeLeft < 5 * 60;

  return (
    <>
      {/* Exam Header */}
      <div className="exam-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div className="navbar-brand">
            <div className="shield-icon">🛡️</div>
            ExamShield
          </div>
          <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginLeft: "0.5rem" }}>
            | Data Structures & Algorithms
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {warnings > 0 && (
             <div style={{ color: "var(--red-600)", fontWeight: 700, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
               <span>⚠️</span> {warnings}/3 Warnings
             </div>
          )}
          {autoSaved && (
            <div className="autosave">
              <span>✅</span> Auto-saved
            </div>
          )}
          <div className="exam-timer">
            <span className="timer-label">Time Left</span>
            <span className={`timer-value ${isUrgent ? "urgent" : ""}`}>{formatTime(timeLeft)}</span>
          </div>
          <button
            id="exam-submit-btn"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitted}
          >
            {submitted ? "Submitting…" : "Submit Exam"}
          </button>
        </div>
      </div>

      {/* Exam Body */}
      <div className="exam-body">
        {submitted ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Exam Submitted!</h2>
            <p style={{ color: "var(--gray-500)" }}>Thank you. Redirecting you to login…</p>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="exam-progress">
              <div className="exam-progress-label">
                {answered} of {total} questions answered
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Questions */}
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
                        <span className="option-letter">
                          {String.fromCharCode(65 + oi)}
                        </span>
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
                onClick={handleSubmit}
              >
                Submit Exam
              </button>
            </div>
          </>
        )}
      </div>

      {/* Suspicious Activity Modal */}
      {alert && (
        <div className="modal-overlay" onClick={() => { if(alert.type !== "critical") setAlert(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">{alert.type === "critical" ? "⛔" : "⚠️"}</div>
            <div className="modal-title">{alert.title || "Suspicious Activity Detected"}</div>
            <div className="modal-subtitle">
              {alert.subtitle || "This incident has been automatically logged and flagged for faculty review."}
            </div>
            <div className="modal-detail">
              <div className="modal-row">
                <span className="modal-key">Reason</span>
                <span className="modal-val">{alert.reason}</span>
              </div>
              {alert.timestamp && (
                <div className="modal-row">
                  <span className="modal-key">Time</span>
                  <span className="modal-val">{alert.timestamp}</span>
                </div>
              )}
              {alert.confidence && (
                <>
                  <div className="modal-row">
                    <span className="modal-key">Confidence</span>
                    <span className="modal-val" style={{ color: "var(--red-500)" }}>{alert.confidence}%</span>
                  </div>
                  <div className="confidence-bar-wrap">
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${alert.confidence}%` }} />
                    </div>
                  </div>
                </>
              )}
            </div>
            {alert.type !== "critical" ? (
              <button
                id="alert-dismiss-btn"
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => setAlert(null)}
              >
                I Understand — Continue Exam
              </button>
            ) : (
              <button
                className="btn btn-danger"
                style={{ width: "100%" }}
                disabled
              >
                Auto-submitting...
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
