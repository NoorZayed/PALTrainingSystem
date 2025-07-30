import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../components/css/Login.module.scss";
import bgImage from "../../components/images/login1.png";
import { API_BASE_URL } from "../utils/apiUtils";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("user", JSON.stringify(data.user));
        // window.location.href = "/ResetPassword";
        if (data.user.role === "student" && data.user.isFirstLogin) {
          window.location.href = "/Student/form";
        } else if (
          data.user.role === "student" &&
          data.user.isFirstLogin === false
        ) {
          window.location.href = "/student/StudentDashboard";
        } else if (data.user.role === "training manager") {
          window.location.href = "/adminDashboard";
        } else if (data.user.role === "company") {
          window.location.href = "/company/companyDashboard";
        } else if (data.user.role === "supervisor") {
          window.location.href = "/supervisor/dashboard";
        } else {
          setLoginError(data.message || "Invalid credentials");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Failed to connect to the server.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginImage}>
          <img src={bgImage} alt="Background" className={styles.bgImage} />
        </div>
        <div className={styles.rightSection}>
          <h1>Welcome to</h1>
          <h1>PAL TrainingSystem</h1>
          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="email@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="at least 8 digit"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>

            {loginError && <p className={styles.error}>{loginError}</p>}

            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
          <p className={styles.signUpText}>
            Don't Have An Account? <Link to="/signup">Sign Up!</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
