import { useState } from "react";
import type { FormEvent } from "react";
import { useGoogleLogin } from "@react-oauth/google";



import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

// ✅ Define possible roles for your POC
type UserRole = "superuser" | "plantManager" | "fg" | "qc" | "dispatch" | "finance";

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
  const [errors, setErrors] = useState<LoginErrors>({ email: "", password: "" });

  // ✅ Mock login function (POC-ready)
  const mockLogin = async (email: string, password: string): Promise<{ token: string; role: UserRole }> => {
    // You can map emails to different roles for testing
    const roleMap: Record<string, UserRole> = {
      "gitmaster@vddigitalalliance.com": "superuser",
      "karthik@vddigitalalliance.com": "plantManager",
      "besha@vddigitalalliance.com": "fg",
      "divya@vddigitalalliance.com": "qc",
      "deepika@vddigitalalliance.com": "dispatch",
      "laksmipathi.d@gmail.com": "finance",
    };

    // Simple validation
    if (!roleMap[email] || password !== "123456") {
      throw new Error("Invalid credentials");
    }

    // Return mock token and role
    return {
      token: "mockToken123",
      role: roleMap[email],
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // ✅ Validation
    const newErrors: LoginErrors = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Enter valid email";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    try {
      const response = await mockLogin(email, password);

      // ✅ Save token & role in sessionStorage
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("role", response.role);

      setSuccessMessage(`Login successful as ${response.role}. Redirecting...`);

      setTimeout(() => {
        navigate("/dispatches"); // redirect to dispatch list page
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrors({ email: "", password: "Login failed. Check credentials." });
    }
  };

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email",
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
  
        // Save token
        localStorage.setItem("google_token", accessToken);
  
        // 🔥 Get user email from Google
        const userRes = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
  
        const userData = await userRes.json();
        const email = userData.email;
  
        console.log("Logged in email:", email);
  
        // 🔥 Role mapping
        const roleMap: Record<string, UserRole> = {
          "gitmaster@vddigitalalliance.com": "superuser",
          "karthik@vddigitalalliance.com": "plantManager",
          "besha@vddigitalalliance.com": "fg",
          "divya@vddigitalalliance.com": "qc",
          "deepika@vddigitalalliance.com": "dispatch",
          "laksmipathi.d@gmail.com": "finance",
        };
  
        const role = roleMap[email] || "guest";
  
        // Save role in session
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("user_email", email);
  
        navigate("/dispatches");
      } catch (error) {
        console.error("Login process failed", error);
      }
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  return (
    <div className="login-wrapper">
      <div className="mobile-container login-card">
        <div className="logo-circle">📦</div>

        <h1>Welcome!</h1>
        <p className="subtitle">Log in to manage your dispatches</p>

        {successMessage && <div className="success-message">{successMessage}</div>}

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
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className={`input-box ${errors.password ? "error" : ""}`}>
              <span className="icon">🔒</span>
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
              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button className="login-btn">Log In →</button>
        </form>

        <div className="divider">or</div>

        <button className="google-btn" onClick={() => login()}>🛡️ Continue with Google</button>
      </div>
    </div>
  );
};

export default Login;
