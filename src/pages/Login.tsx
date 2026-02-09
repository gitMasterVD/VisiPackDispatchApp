import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface LoginErrors {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errors, setErrors] = useState<LoginErrors>({
    email: "",
    password: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: LoginErrors = { email: "", password: "" };

    // ✅ STRICT email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) return;

    // ✅ POC success flow (backend-ready)
    setSuccessMessage("Login successful. Redirecting to dispatch list...");

    setTimeout(() => {
      navigate("/dispatches");
    }, 1200);
  };

  return (
    <div className="login-wrapper">
      <div className="mobile-container login-card">
        <div className="logo-circle">📦</div>

        <h1>Welcome!</h1>
        <p className="subtitle">Log in to manage your dispatches</p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <div className={`input-box ${errors.email ? "error" : ""}`}>
              <span className="icon">✉️</span>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                }}
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
        <div className="form-group">
  <label>Password</label>
  <div className={`input-box ${errors.password ? "error" : ""}`}>
    {/* Lock icon */}
    <span className="icon">🔒</span>

    {/* Password input */}
    <input
      type={showPassword ? "text" : "password"}
      required
      placeholder="Enter your password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setErrors({ ...errors, password: "" });
      }}
    />

    {/* Eye toggle */}
    <span
      className="eye"
      onClick={() => setShowPassword(!showPassword)}
      title={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
    </span>
  </div>

  {/* Error message */}
  {errors.password && (
    <span className="field-error">{errors.password}</span>
  )}
</div>


          <button className="login-btn">Log In →</button>
        </form>

        <div className="divider">or</div>

        <button className="google-btn">
          🛡️ Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
