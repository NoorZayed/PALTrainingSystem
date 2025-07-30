// src/components/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import styles from "../../components/css/ResetPassword.module.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../utils/apiUtils';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const [forceReset, setForceReset] = useState(true);

  useEffect(() => {
    if (!forceReset) {
      navigate("/dashboard");
    }
  }, [navigate, forceReset]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true); // Start loading

      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const response = await fetch(
          `${API_BASE_URL}/api/reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email, password }),
          }
        );

        if (response.ok) {
          setResetSuccess(true);
          setResetError("");
          navigate("/Student/form");
        } else {
          const errorData = await response.json();
          setResetError(
            errorData.message || "Password reset failed. Please try again."
          );
          setResetSuccess(false);
        }
      } catch (error) {
        setResetError("An unexpected error occurred. Please try again.");
        setResetSuccess(false);
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };

  if (!forceReset) {
    return null;
  }

  if (resetSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.resetSuccess}>
          <h2>Password Reset Successful!</h2>
          <p>
            Your password has been reset successfully. You can now access your
            account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.resetForm}>
        <h2>Reset Your Password</h2>
        <p>Your account is activated, please set new password.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={styles.input}
            />
            {passwordError && <p className={styles.error}>{passwordError}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={styles.input}
            />
            {confirmPasswordError && (
              <p className={styles.error}>{confirmPasswordError}</p>
            )}
          </div>
          {resetError && <p className={styles.error}>{resetError}</p>}
          <button
            type="submit"
            className={styles.resetButton}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
