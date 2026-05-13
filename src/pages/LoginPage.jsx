import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── Animated SVG Shield Logo ────────────────────────────────────────────── */
function ShieldLogo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="login-shield-svg">
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1"   stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="sg2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="sglow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Outer glow ring */}
      <circle cx="32" cy="32" r="30" stroke="url(#sg1)" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" className="login-shield-ring" />
      {/* Shield body */}
      <path d="M32 4 L56 14 L56 32 C56 46 44 56 32 60 C20 56 8 46 8 32 L8 14 Z" fill="url(#sg2)" filter="url(#sglow)" />
      {/* Shield inner highlight */}
      <path d="M32 10 L50 18 L50 32 C50 43 42 51 32 54 C22 51 14 43 14 32 L14 18 Z" fill="none" stroke="url(#sg1)" strokeWidth="1.5" opacity="0.6" />
      {/* Lock icon */}
      <rect x="25" y="31" width="14" height="11" rx="2" fill="white" opacity="0.95" />
      <path d="M27 31 L27 27 C27 23.7 36.3 23.7 36.3 27 L36.3 31" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.95" />
      <circle cx="32" cy="36.5" r="1.5" fill="url(#sg2)" />
    </svg>
  );
}

/* ── Animated mesh background ────────────────────────────────────────────── */
function MeshBackground() {
  return (
    <div className="login-mesh" aria-hidden="true">
      {/* Glowing orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />
      {/* Grid */}
      <div className="login-grid-overlay" />
    </div>
  );
}

const FEATURES = [
  { icon: "🛡️", label: "AI Proctoring"      },
  { icon: "📹", label: "Evidence Capture"   },
  { icon: "📚", label: "5 Subject Portals"  },
  { icon: "⚡", label: "Real-time Alerts"   },
  { icon: "📊", label: "Visual Analytics"   },
  { icon: "🧩", label: "Extension Blocker"  },
];

export default function LoginPage({ onLogin }) {
  const navigate  = useNavigate();
  const [role,     setRole]     = useState("student");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onLogin) onLogin(email, email.split("@")[0], role);
      navigate("/subject-select");
    }, 1100);
  };

  const demoFill = (r) => {
    setRole(r);
    setEmail(r === "student" ? "student@university.edu" : "faculty@university.edu");
    setPassword("demo123");
  };

  return (
    <div className="login-root">
      <MeshBackground />

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="login-left-panel">
        {/* Brand */}
        <div className="login-brand">
          <ShieldLogo size={38} />
          <span className="login-brand-name">ExamShield</span>
          <span className="login-brand-tag">v2.0</span>
        </div>

        {/* Hero copy */}
        <div className="login-hero">
          <div className="login-hero-badge">
            <span className="login-live-dot" /> Prototype Demo Build
          </div>
          <h1 className="login-hero-title">
            The Intelligent<br />
            <span className="login-hero-gradient">Exam Security</span><br />
            Platform
          </h1>
          <p className="login-hero-sub">
            AI-powered proctoring, real-time evidence capture, and
            multi-subject integrity management — all in one dashboard.
          </p>
        </div>

        {/* Feature pills */}
        <div className="login-feature-grid">
          {FEATURES.map((f) => (
            <div key={f.label} className="login-feature-chip">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="login-stats-row">
          {[
            { val: "5",    label: "Subjects"         },
            { val: "3",    label: "Strike Policy"     },
            { val: "Real-time", label: "Proctoring"  },
          ].map((s) => (
            <div key={s.label} className="login-stat-item">
              <div className="login-stat-val">{s.val}</div>
              <div className="login-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────── */}
      <div className="login-right-panel">
        <div className="login-card-glass">
          {/* Card header */}
          <div className="login-card-header">
            <div className="login-card-logo-wrap">
              <ShieldLogo size={52} />
              <div className="login-card-logo-ring" />
            </div>
            <h2 className="login-card-title">Welcome Back</h2>
            <p className="login-card-sub">Sign in to your secure examination portal</p>
          </div>

          {/* Role tabs */}
          <div className="login-role-tabs">
            <button id="role-student" className={`login-role-tab ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>
              🎓 Student
            </button>
            <button id="role-faculty" className={`login-role-tab ${role === "faculty" ? "active" : ""}`} onClick={() => setRole("faculty")}>
              👨‍🏫 Faculty
            </button>
          </div>

          {/* Form */}
          <form className="login-form-v2" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-field-label">University Email</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✉️</span>
                <input id="login-email" type="email" className="login-input-v2"
                  placeholder={role === "student" ? "student@university.edu" : "faculty@university.edu"}
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field-label">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔑</span>
                <input id="login-password" type={showPass ? "text" : "password"} className="login-input-v2"
                  placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                <button type="button" className="login-show-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <div className="login-error-box">⚠️ {error}</div>}

            <button id="login-submit" type="submit" className={`login-submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading
                ? <><span className="login-spinner" /> Authenticating…</>
                : <>{role === "student" ? "🎓 Enter Student Portal" : "👨‍🏫 Enter Faculty Portal"}</>}
            </button>
          </form>

          <div className="login-divider"><span>quick demo access</span></div>

          <div className="login-demo-btns">
            <button className="login-demo-btn" onClick={() => demoFill("student")}>🎓 Student Demo</button>
            <button className="login-demo-btn" onClick={() => demoFill("faculty")}>👨‍🏫 Faculty Demo</button>
          </div>

          <p className="login-proto-note">🔒 End-to-end encrypted · Prototype demo</p>
        </div>
      </div>
    </div>
  );
}
