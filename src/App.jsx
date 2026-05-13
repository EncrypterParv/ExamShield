import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// ── Bump this whenever the data schema changes to auto-clear stale localStorage ──
const STORAGE_VERSION = "v2-multisubject";

import LoginPage        from "./pages/LoginPage";
import SubjectDashboard from "./pages/SubjectDashboard";
import StudentExamPage  from "./pages/StudentExamPage";
import FacultyDashboard from "./pages/FacultyDashboard";
import FlagReviewPage   from "./pages/FlagReviewPage";
import ReportPage       from "./pages/ReportPage";
import AnalyticsPage    from "./pages/AnalyticsPage";
import { students }     from "./data/dummyData";

function App() {
  // ── Persistent student data ──────────────────────────────────────────────
  const [studentData, setStudentData] = useState(() => {
    // Flush stale localStorage if it's from an older schema version
    const storedVersion = localStorage.getItem("examshield_version");
    if (storedVersion !== STORAGE_VERSION) {
      localStorage.removeItem("examshield_data");
      localStorage.removeItem("examshield_uid");
      localStorage.removeItem("examshield_subject");
      localStorage.setItem("examshield_version", STORAGE_VERSION);
    }
    const saved = localStorage.getItem("examshield_data");
    return saved ? JSON.parse(saved) : students;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem("examshield_uid");
    return saved ? parseInt(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() =>
    localStorage.getItem("examshield_role") || "student"
  );

  const [selectedSubjectId, setSelectedSubjectId] = useState(() =>
    localStorage.getItem("examshield_subject") || null
  );

  // Track which exams a student has submitted — Map: userId -> [subjectId]
  const [submittedExams, setSubmittedExams] = useState(() => {
    const saved = localStorage.getItem("examshield_submitted");
    return saved ? JSON.parse(saved) : {};
  });

  const markExamSubmitted = (userId, subjectId) => {
    setSubmittedExams((prev) => {
      const key  = String(userId);
      const list = [...(prev[key] || []), subjectId];
      const next = { ...prev, [key]: [...new Set(list)] };
      localStorage.setItem("examshield_submitted", JSON.stringify(next));
      return next;
    });
  };

  const isExamSubmitted = (userId, subjectId) => {
    const list = submittedExams[String(userId)] || [];
    return list.includes(subjectId);
  };

  // ── Persist to localStorage ──────────────────────────────────────────────
  // Strip recording/screenshot payloads before saving — base64 videos are
  // several MB each and would quickly blow the ~5 MB localStorage quota.
  // Flag metadata (reason, timestamp, confidence, etc.) is preserved.
  // The real recordings live in React state and are viewable by faculty in
  // the same browser session without a hard refresh.
  useEffect(() => {
    const slimData = studentData.map((s) => ({
      ...s,
      flags: s.flags.map((f) => ({
        ...f,
        recordingBlobUrl:  f.recordingBlobUrl  ? "__recorded__" : null,
        screenshotDataUrl: null,   // also large; simulated view is shown after reload
      })),
    }));
    try {
      localStorage.setItem("examshield_data", JSON.stringify(slimData));
    } catch {
      // Quota exceeded — silently ignore; in-memory state is still intact
    }
  }, [studentData]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem("examshield_uid", currentUserId.toString());
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem("examshield_role", currentRole);
  }, [currentRole]);

  useEffect(() => {
    if (selectedSubjectId) localStorage.setItem("examshield_subject", selectedSubjectId);
  }, [selectedSubjectId]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "examshield_data" && e.newValue) {
        setStudentData(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── Update a flag's status ───────────────────────────────────────────────
  const updateFlag = (studentId, flagId, newStatus) => {
    setStudentData((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, flags: s.flags.map((f) => f.id === flagId ? { ...f, status: newStatus } : f) }
          : s
      )
    );
  };

  // ── Add a new flag with evidence ─────────────────────────────────────────
  const addFlag = (studentId, reason, confidence, evidence = {}, subjectId = null) => {
    const now = new Date();
    const incidentDurationSec = Math.floor(Math.random() * 20) + 8;
    const endTs = new Date(now.getTime() + incidentDurationSec * 1000);
    const fmt = (d) =>
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newFlag = {
      id: `new-${Date.now()}`,
      reason,
      timestamp: now.toLocaleString(),
      confidence,
      status: "Pending",
      subjectId: subjectId || selectedSubjectId || "dsa",
      incidentStart:    fmt(now),
      incidentEnd:      fmt(endTs),
      incidentDuration: incidentDurationSec,
      // The recording clip is the last 15s before the flag fired.
      // The incident occurs at the END of that clip, so jump to ~12s in.
      incidentStartSec: 12,
      recordingBlobUrl:  evidence.recordingBlobUrl  ?? null,
      screenshotDataUrl: evidence.screenshotDataUrl ?? null,
      audioObservation:  evidence.audioObservation  ?? "No unusual audio",
      audioIcon:         evidence.audioIcon         ?? "✅",
      audioSeverity:     evidence.audioSeverity     ?? "low",
      audioLevel:        evidence.audioLevel        ?? 0,
    };

    setStudentData((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const updatedFlags = [...s.flags, newFlag];
        // Count all flags for risk escalation (or just for this subject)
        const subFlags = updatedFlags.filter((f) => f.subjectId === newFlag.subjectId);
        const violationCount = subFlags.length;

        let newRisk = s.risk;
        let terminated = s.terminated;
        let terminatedSubjects = [...(s.terminatedSubjects || [])];

        if (violationCount >= 3) {
          newRisk = "High";
          terminated = true;
          if (!terminatedSubjects.includes(newFlag.subjectId)) {
            terminatedSubjects.push(newFlag.subjectId);
          }
        } else if (violationCount === 2) {
          newRisk = "High";
        } else if (violationCount === 1 && s.risk !== "High") {
          newRisk = "Medium";
        }

        return { ...s, risk: newRisk, terminated, terminatedSubjects, flags: updatedFlags };
      })
    );
  };

  // ── Login handler ────────────────────────────────────────────────────────
  const handleLogin = (email, name, role) => {
    setCurrentRole(role);
    if (role === "student") {
      // Determine whether the student already exists synchronously so we can
      // call both setStudentData and setCurrentUserId at the top level —
      // avoiding the anti-pattern of calling setState inside another setState
      // callback, which caused currentUserId to still be null when addFlag
      // fired during the exam for brand-new users.
      setStudentData((prev) => {
        const existing = prev.find((s) => s.email === email);
        if (existing) {
          // Schedule the ID update outside this render cycle
          setTimeout(() => setCurrentUserId(existing.id), 0);
          return prev;
        }
        const generatedId = Date.now();
        const newStudent = {
          id: generatedId,
          name: name || email.split("@")[0],
          email,
          rollNo: "NEW-" + Math.floor(Math.random() * 10000),
          risk: "Low",
          terminated: false,
          terminatedSubjects: [],
          flags: [],
        };
        setTimeout(() => setCurrentUserId(generatedId), 0);
        return [...prev, newStudent];
      });
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={<LoginPage onLogin={handleLogin} />}
        />

        {/* Subject selection — shared by both roles */}
        <Route
          path="/subject-select"
          element={
            <SubjectDashboard
              role={currentRole}
              currentUserId={currentUserId}
              submittedExams={submittedExams}
              isExamSubmitted={isExamSubmitted}
              onSelectSubject={setSelectedSubjectId}
            />
          }
        />

        {/* Student exam */}
        <Route
          path="/student/exam"
          element={
            <StudentExamPage
              currentUserId={currentUserId}
              selectedSubjectId={selectedSubjectId}
              addFlag={addFlag}
              markExamSubmitted={markExamSubmitted}
              isExamSubmitted={isExamSubmitted}
            />
          }
        />

        {/* Faculty routes */}
        <Route
          path="/faculty/dashboard"
          element={
            <FacultyDashboard
              students={studentData}
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={setSelectedSubjectId}
            />
          }
        />
        <Route
          path="/faculty/review/:studentId"
          element={
            <FlagReviewPage
              students={studentData}
              updateFlag={updateFlag}
              selectedSubjectId={selectedSubjectId}
            />
          }
        />
        <Route
          path="/faculty/report"
          element={
            <ReportPage
              students={studentData}
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={setSelectedSubjectId}
            />
          }
        />
        <Route
          path="/faculty/analytics"
          element={<AnalyticsPage students={studentData} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
