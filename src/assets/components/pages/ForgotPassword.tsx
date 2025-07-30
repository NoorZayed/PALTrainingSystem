import React, { useState } from "react";
import styles from "../../components/css/ForgotPassword.module.scss";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API call (replace with your actual API call)
    try {
      const mockApiCall = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === "test@example.com") {
            resolve("Password reset email sent!");
          } else {
            reject(new Error("Email not found")); // Ensure error is instance of Error
          }
        }, 1000);
      });

      await mockApiCall;

      setMessage("Password reset email sent!");
      setIsError(false);
    } catch (error) {
      if (error instanceof Error) { // Type check
        setMessage(error.toString());
        setIsError(true);
      } else {
        setMessage("An unknown error occurred.");
        setIsError(true);
      }
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <form onSubmit={handleForgotPassword} className={styles.forgotPasswordForm}>
        <h2>Forgot Password</h2>
        {message && <p className={isError ? styles.error : styles.success}>{message}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.forgotPasswordInput}
        />
        <button type="submit" className={styles.forgotPasswordButton}>
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;