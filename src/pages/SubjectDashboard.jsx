import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SUBJECTS, examQuestions, mcqQuestions, codingQuestions } from "../data/dummyData";
import { loadAllProgress } from "../utils/examProgress";

// Derive total question count for a subject (used for the ongoing-exam progress bar)
function getTotalQuestions(subject) {
  if (subject.examType === "mixed") {
    const mcq    = (mcqQuestions[subject.id]    ?? []).length;
    const coding = (codingQuestions[subject.id] ?? codingQuestions.dsa ?? []).length;
    return mcq + coding;
  }
  if (subject.examType === "coding") {
    return (codingQuestions[subject.id] ?? codingQuestions.dsa ?? []).length;
  }
  return (examQuestions[subject.id] ?? []).length;
}

export default function SubjectDashboard({ role, currentUserId, onSelectSubject, isExamSubmitted }) {
  const navigate  = useNavigate();
  const isStudent = role === "student";
  const [hover,    setHover]    = useState(null);
  const [progress, setProgress] = useState({});

  // Load per-subject progress from localStorage (written by StudentExamPage via examProgress util)
  useEffect(() => {
    const load = () => setProgress(loadAllProgress());
    load();
    // Re-sync on cross-tab storage events
    window.addEventListener("storage", load);
    // Poll every 3 s so same-tab updates (which don't fire storage events) are picked up
    const id = setInterval(load, 3000);
    return () => { window.removeEventListener("storage", load); clearInterval(id); };
  }, []);

  // Build ongoing list: subjects with saved progress that haven't been submitted
  const ongoingExams = isStudent
    ? SUBJECTS.filter((s) => {
        const isSubmitted = isExamSubmitted?.(currentUserId, s.id);
        const inProgress  = progress[s.id] != null;
        return inProgress && !isSubmitted;
      }).map((s) => {
        const p = progress[s.id] || {};
        return {
          subjectId: s.id,
          answered:  p.answered  ?? 0,
          total:     p.total     ?? getTotalQuestions(s),
          timeLeft:  p.timeLeft  ?? "--:--",
        };
      })
    : [];

  const handleSelect = (subjectId) => {
    if (isStudent && isExamSubmitted?.(currentUserId, subjectId)) return;
    if (onSelectSubject) onSelectSubject(subjectId);
    if (role === "faculty") {
      navigate(`/faculty/dashboard?subject=${subjectId}`);
    } else {
      navigate(`/student/exam?subject=${subjectId}`);
    }
  };

  const handleFacultyAll = () => {
    if (onSelectSubject) onSelectSubject("all");
    navigate("/faculty/dashboard");
  };

  return (
    <div className="subject-dashboard-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="shield-icon">🛡️</div>
          ExamShield
        </div>
        <div className="navbar-actions">
          {role === "faculty" && (
            <>
              <Link to="/faculty/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/faculty/report"    className="nav-link">Reports</Link>
              <Link to="/faculty/analytics" className="nav-link">Analytics</Link>
            </>
          )}
          <Link to="/login" className="btn btn-outline btn-sm">Logout</Link>
        </div>
      </nav>

      <div className="subject-dashboard-body">
        {/* Header */}
        <div className="subject-dash-header">
          <div>
            <h1 className="subject-dash-title">
              {isStudent ? "📚 Select Your Exam" : "🏫 Faculty Portal"}
            </h1>
            <p className="subject-dash-subtitle">
              {isStudent
                ? "Choose a subject below to begin your examination. Each subject has its own secure exam session."
                : "Select a subject to monitor student activity, review flagged incidents, or view analytics."}
            </p>
          </div>
          {role === "faculty" && (
            <button className="btn btn-outline" onClick={handleFacultyAll}>
              🗂️ View All Subjects
            </button>
          )}
        </div>

        {/* ── STUDENT: Dynamic Ongoing Exams Section ────────────────────── */}
        {isStudent && ongoingExams.length > 0 && (
          <div className="ongoing-exams-section">
            <div className="ongoing-exams-title">
              <span className="ongoing-live-dot" /> Live — Ongoing Exams
            </div>
            <div className="ongoing-exams-grid">
              {ongoingExams.map((exam) => {
                const subj = SUBJECTS.find((s) => s.id === exam.subjectId);
                if (!subj) return null;
                const pct = exam.total > 0 ? Math.round((exam.answered / exam.total) * 100) : 0;
                return (
                  <div key={exam.subjectId} className="ongoing-card">
                    <div className="ongoing-card-left">
                      <div className="ongoing-subject-icon" style={{ background: subj.color + "22", color: subj.color }}>
                        {subj.icon}
                      </div>
                      <div>
                        <div className="ongoing-subject-name">{subj.short}</div>
                        <div className="ongoing-subject-full">{subj.name}</div>
                      </div>
                    </div>
                    <div className="ongoing-card-center">
                      <div className="ongoing-progress-label">
                        <span>{exam.answered}/{exam.total} answered</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="ongoing-card-right">
                      <div className="ongoing-timer">⏱ {exam.timeLeft}</div>
                      <div className="ongoing-timer-label">remaining</div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSelect(exam.subjectId)}
                    >
                      Resume →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subject Grid */}
        <div className="subject-grid-label">
          {isStudent ? "🗂️ Available Exams" : "📚 Select Subject"}
        </div>
        <div className="subject-card-grid">
          {SUBJECTS.map((s) => {
            const submitted = isStudent && isExamSubmitted?.(currentUserId, s.id);
            return (
              <button
                key={s.id}
                id={`subject-card-${s.id}`}
                className={`subject-card ${submitted ? "subject-card-submitted" : ""}`}
                style={{ "--subject-color": s.color, cursor: submitted ? "not-allowed" : "pointer", opacity: submitted ? 0.65 : 1 }}
                onMouseEnter={() => !submitted && setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => handleSelect(s.id)}
                disabled={submitted}
              >
                <div className="subject-card-bar" style={{ background: submitted ? "#64748b" : s.color }} />

                {submitted && (
                  <div className="subject-submitted-badge">✅ Submitted</div>
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", paddingTop: "0.5rem" }}>
                  <div className="subject-card-icon" style={{ background: (submitted ? "#64748b" : s.color) + "22", color: submitted ? "#64748b" : s.color }}>
                    {submitted ? "🔒" : s.icon}
                  </div>
                  <div className="subject-card-info">
                    <div className="subject-card-short" style={{ color: submitted ? "#64748b" : s.color }}>{s.short}</div>
                    <div className="subject-card-name">{s.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.375rem", flexWrap: "wrap" }}>
                      <div className="subject-card-date">📅 {s.date}</div>
                      {isStudent && !submitted && (
                        <span className={`subject-type-badge ${s.examType === "mixed" ? "subject-type-mixed" : s.examType === "coding" ? "subject-type-coding" : "subject-type-mcq"}`}>
                          {s.examType === "mixed" ? "📝+💻 Mixed" : s.examType === "coding" ? "💻 Coding" : "📝 MCQ"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="subject-card-footer">
                  {submitted ? (
                    <span className="subject-card-action" style={{ color: "#64748b" }}>Exam complete — read-only</span>
                  ) : isStudent ? (
                    <span className="subject-card-action">Start Exam</span>
                  ) : (
                    <span className="subject-card-action">Monitor</span>
                  )}
                  {!submitted && <span className="subject-card-arrow">→</span>}
                </div>
              </button>
            );
          })}
        </div>

        <p className="subject-dashboard-note">
          {isStudent
            ? "🔒 Each exam runs in a secure, proctored environment. Ensure your screen sharing and camera are ready before starting."
            : "Faculty: select a subject to filter the dashboard, reports, and analytics to that subject only."}
        </p>
      </div>
    </div>
  );
}
