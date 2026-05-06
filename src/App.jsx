import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import StudentExamPage from "./pages/StudentExamPage";
import FacultyDashboard from "./pages/FacultyDashboard";
import FlagReviewPage from "./pages/FlagReviewPage";
import ReportPage from "./pages/ReportPage";
import { students } from "./data/dummyData";

function App() {
  const [studentData, setStudentData] = useState(() => {
    const saved = localStorage.getItem("examshield_data");
    return saved ? JSON.parse(saved) : students;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem("examshield_uid");
    return saved ? parseInt(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("examshield_data", JSON.stringify(studentData));
  }, [studentData]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem("examshield_uid", currentUserId.toString());
    }
  }, [currentUserId]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "examshield_data" && e.newValue) {
        setStudentData(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── Update a flag's status ──────────────────────────────────────────────
  const updateFlag = (studentId, flagId, newStatus) => {
    setStudentData((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              flags: s.flags.map((f) =>
                f.id === flagId ? { ...f, status: newStatus } : f
              ),
            }
          : s
      )
    );
  };

  // ── Add a new flag with optional real-media evidence ───────────────────
  const addFlag = (studentId, reason, confidence, evidence = {}) => {
    const newFlag = {
      id: `new-${Date.now()}`,
      reason,
      timestamp: new Date().toLocaleString(),
      confidence,
      status: "Pending",
      // Real media evidence (populated by useProctoring hook)
      recordingBlobUrl : evidence.recordingBlobUrl  ?? null,
      screenshotDataUrl: evidence.screenshotDataUrl ?? null,
      audioObservation : evidence.audioObservation  ?? "No unusual audio",
      audioIcon        : evidence.audioIcon         ?? "✅",
      audioSeverity    : evidence.audioSeverity     ?? "low",
      audioLevel       : evidence.audioLevel        ?? 0,
    };

    setStudentData((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updatedFlags = [...s.flags, newFlag];
          const tabSwitches = updatedFlags.filter(
            (f) => f.reason === "Tab switch detected"
          ).length;

          let newRisk = s.risk;
          if (tabSwitches >= 2) newRisk = "High";
          else if (tabSwitches === 1 && s.risk !== "High") newRisk = "Medium";

          return { ...s, risk: newRisk, flags: updatedFlags };
        }
        return s;
      })
    );
  };

  const handleStudentLogin = (email, name) => {
    const generatedId = Date.now();

    setStudentData((prev) => {
      const existingIndex = prev.findIndex((s) => s.email === email);
      if (existingIndex >= 0) {
        setCurrentUserId(prev[existingIndex].id);
        return prev;
      } else {
        const newStudent = {
          id: generatedId,
          name: name || email.split("@")[0],
          email,
          rollNo: "NEW-" + Math.floor(Math.random() * 10000),
          risk: "Low",
          flags: [],
        };
        setCurrentUserId(generatedId);
        return [...prev, newStudent];
      }
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage onStudentLogin={handleStudentLogin} />} />
        <Route
          path="/student/exam"
          element={<StudentExamPage currentUserId={currentUserId} addFlag={addFlag} />}
        />
        <Route
          path="/faculty/dashboard"
          element={<FacultyDashboard students={studentData} />}
        />
        <Route
          path="/faculty/review/:studentId"
          element={<FlagReviewPage students={studentData} updateFlag={updateFlag} />}
        />
        <Route
          path="/faculty/report"
          element={<ReportPage students={studentData} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
