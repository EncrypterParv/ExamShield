import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onStudentLogin }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "student") {
        if (onStudentLogin) onStudentLogin(email, email.split("@")[0]);
        navigate("/student/exam");
      } else {
        navigate("/faculty/dashboard");
      }
    }, 900);
  };

  return (
    <div className="login-wrapper">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-logo">🛡️</div>
        <h1>ExamShield</h1>
        <p>AI-powered online proctoring that keeps your examinations fair and secure.</p>
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">👁️</div>
            <span>Real-time behaviour monitoring</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">⚡</div>
            <span>Instant suspicious activity alerts</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📋</div>
            <span>Detailed faculty review dashboard</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <span>Comprehensive session reports</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome back</h2>
          <p>Sign in to continue to ExamShield</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Sign in as</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">🎓 Student</option>
                <option value="faculty">👨‍🏫 Faculty</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ background: "var(--red-50)", border: "1px solid var(--red-100)", borderRadius: "var(--radius)", padding: "0.75rem 1rem", color: "var(--red-600)", fontSize: "0.875rem", fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? "Signing in…" : `Sign in as ${role === "student" ? "Student" : "Faculty"}`}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", fontSize: "0.8125rem", color: "var(--gray-400)", textAlign: "center" }}>
            Demo prototype · No real authentication
          </p>
        </div>
      </div>
    </div>
  );
}
