import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorAside from "../Navbar/SupervisorAside";
import styles from "../css/SupervisorProfile.module.css";
import axios from "axios";

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

interface SupervisorProfile {
  id: string;
  name: string;
  email: string;
}

interface Notification {
  type: "success" | "error";
  message: string;
}

const SupervisorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SupervisorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<boolean>(false);

  // Get supervisor info from localStorage
  const supervisorInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const supervisorId = supervisorInfo?.id;

  useEffect(() => {
    // Redirect to login if no supervisor ID found
    if (!supervisorId) {
      navigate("/login");
      return;
    }

    const fetchSupervisorProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/supervisors/detail/${supervisorId}`);
        setProfile(response.data);
        setEmail(response.data.email || "");
      } catch (err) {
        console.error("Error fetching supervisor profile:", err);
        setError("Failed to load profile information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorProfile();
  }, [supervisorId, navigate]);

  // Validate form data
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate email
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Only validate password fields if user is attempting to change password
    if (currentPassword || newPassword || confirmPassword) {
      // Current password is required if changing password
      if (!currentPassword) {
        errors.currentPassword = "Current password is required";
      }

      // Validate new password
      if (!newPassword) {
        errors.newPassword = "New password is required";
      } else if (newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters long";
      }

      // Confirm password must match new password
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check password strength
  const checkPasswordStrength = (password: string): "weak" | "medium" | "strong" => {
    if (!password) return "weak";
    
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < 8) return "weak";
    if (hasLetters && hasNumbers && hasSpecial && password.length >= 10) return "strong";
    if ((hasLetters && hasNumbers) || (hasLetters && hasSpecial) || (hasNumbers && hasSpecial)) return "medium";
    
    return "weak";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!validateForm()) {
      return;
    }

    // Prepare request data
    const updateData: any = {
      email,
    };

    // Only include password fields if user is changing password
    if (currentPassword && newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    setUpdating(true);
    try {
      // Call the API to update profile
      await axios.put(`${API_BASE_URL}/api/supervisor/update-profile/${supervisorId}`, updateData);
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Show success notification
      setNotification({
        type: "success",
        message: "Profile updated successfully"
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      
      // Show error notification with specific message if available
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to update profile. Please try again."
      });
    } finally {
      setUpdating(false);
    }
  };

  // Password strength indicator
  const passwordStrength = checkPasswordStrength(newPassword);

  return (
    <div className={styles.container}>
      <SupervisorAside />
      
      <div className={styles.mainContent}>
        <div className={styles.profileHeader}>
          <h2>Profile Settings</h2>
          <p>Update your email and password</p>
        </div>
        
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading profile information...</p>
          </div>
        )}
        
        {error && <div className={`${styles.notification} ${styles.error}`}>{error}</div>}
        
        {!loading && profile && (
          <div className={styles.formContainer}>
            {notification && (
              <div className={`${styles.notification} ${styles[notification.type]}`}>
                {notification.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={profile.name || ""}
                  disabled
                  className={styles.disabledInput}
                />
                <small className={styles.helpText}>Name cannot be changed here. Contact admin for name changes.</small>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {validationErrors.email && (
                  <div className={styles.error}>{validationErrors.email}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter only if changing password"
                />
                {validationErrors.currentPassword && (
                  <div className={styles.error}>{validationErrors.currentPassword}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter only if changing password"
                />
                {newPassword && (
                  <>
                    <div className={styles.passwordStrengthMeter}>
                      <div className={`${styles.passwordStrength} ${styles[passwordStrength]}`}></div>
                    </div>
                    <div className={styles.strengthText}>
                      Password strength: <strong>{passwordStrength}</strong>
                    </div>
                  </>
                )}
                {validationErrors.newPassword && (
                  <div className={styles.error}>{validationErrors.newPassword}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                {validationErrors.confirmPassword && (
                  <div className={styles.error}>{validationErrors.confirmPassword}</div>
                )}
              </div>
              
              <div className={styles.buttonContainer}>
                <button
                  type="submit"
                  className={styles.updateButton}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <div className={styles.spinner}></div> Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorProfilePage;
