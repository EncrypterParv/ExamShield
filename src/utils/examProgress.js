// ── Exam progress persistence ──────────────────────────────────────────────
// Stores live exam progress (answered count, total, time left) in localStorage
// so the SubjectDashboard can display the "Ongoing Exams" section dynamically.

const PROGRESS_KEY = "examshield_progress";

export function saveExamProgress(subjectId, answered, total, timeLeft) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    all[subjectId] = { answered, total, timeLeft, ts: Date.now() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch { /* ignore quota errors */ }
}

export function clearExamProgress(subjectId) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    delete all[subjectId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function loadAllProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}
