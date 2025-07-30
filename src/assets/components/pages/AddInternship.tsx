import React, { useState, useEffect } from "react";
import styles from "../css/CompanyPages.module.css";
import internshipStyles from "../css/CompanyInternships.module.css";
import CompanyAside from "../Navbar/CompanyAside";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../utils/apiUtils';

// Interface for form state
interface InternshipForm {
  title: string;
  duration: string;
  type: string;
  location: string;
  supervisor_id: string;
  start_date: string;
  end_date: string;
  company_id: number;
  seats: number;
  other_location?: string;
}

// Interface for supervisor data
interface Supervisor {
  id: number;
  name: string;
  email?: string;
}

const AddInternship: React.FC = () => {
  const [internship, setInternship] = useState<InternshipForm>({
    title: "",
    duration: "",
    type: "",
    location: "",
    supervisor_id: "",
    start_date: "",
    end_date: "",
    seats: 1,
    company_id: 1, // Using fixed company_id for now, ideally should come from auth context
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSupervisors = async () => {
      setFetchingData(true);
      try {
        // Use correct backend endpoint and company id
        const res = await axios.get(`${API_BASE_URL}/api/supervisors/1`);
        // Map supervisor_id to id for select
        setSupervisors(
          res.data.map((s: any) => ({ id: s.id, name: s.name, email: s.email }))
        );
      } catch (err) {
        console.error("Error fetching supervisors:", err);
        setErrors((prev) => ({
          ...prev,
          supervisor:
            "Failed to load supervisors. Please refresh and try again.",
        }));
      } finally {
        setFetchingData(false);
      }
    };
    fetchSupervisors();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!internship.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!internship.duration.trim()) {
      newErrors.duration = "Duration is required";
    }
    if (!internship.type.trim()) {
      newErrors.type = "Type is required";
    }
    if (!internship.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!internship.supervisor_id) {
      newErrors.supervisor_id = "Please select a supervisor";
    }
    if (!internship.seats || internship.seats < 1) {
      newErrors.seats = "Number of seats must be at least 1";
    }
    if (!internship.start_date) {
      newErrors.start_date = "Start date is required";
    } else {
      const selectedDate = new Date(internship.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only

      if (selectedDate < today) {
        newErrors.start_date = "Start date cannot be in the past";
      }
    }
    if (!internship.end_date) {
      newErrors.end_date = "End date is required";
    } else if (internship.start_date) {
      const startDate = new Date(internship.start_date);
      const endDate = new Date(internship.end_date);
      if (endDate < startDate) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    // Handle number inputs specially
    if (name === "seats") {
      setInternship((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setInternship((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = { ...internship };
      // If location is "Other", use the other_location value
      if (internship.location === "Other" && internship.other_location) {
        payload.location = internship.other_location;
      }

      await axios.post(`${API_BASE_URL}/api/internships`, payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/company/internships", {
          state: { message: "Internship created successfully!" },
        });
      }, 1500);
    } catch (error: any) {
      console.error("Error adding internship:", error);
      setErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.message ||
          "Failed to add internship. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // If form is not empty, show confirmation dialog
    if (
      internship.title.trim() ||
      internship.duration.trim() ||
      internship.type.trim() ||
      internship.location.trim() ||
      internship.start_date ||
      internship.end_date
    ) {
      setConfirmCancel(true);
    } else {
      navigate(-1); // No changes, just go back
    }
  };

  return (
    <div className={styles.container}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <div className={`${styles.headerRow} ${internshipStyles.pageHeader}`}>
          <button
            className={styles.backButton}
            onClick={handleCancel}
            title="Back"
            disabled={loading}
          >
            ← Back
          </button>
          <h2 className={internshipStyles.pageTitle}>Add New Internship</h2>
          <div className={styles.spacer}></div>{" "}
          {/* This helps with centering */}
        </div>

        <div className={styles.formCard}>
          {submitSuccess ? (
            <div className={styles.successMessage}>
              <h3>✓ Internship Added Successfully!</h3>
              <p>Redirecting to internships list...</p>
            </div>
          ) : confirmCancel ? (
            <div className={internshipStyles.confirmDialog}>
              <h3>Discard Changes?</h3>
              <p>Any unsaved changes will be lost. Do you want to continue?</p>
              <div className={internshipStyles.confirmActions}>
                <button
                  className={internshipStyles.confirmNoButton}
                  onClick={() => setConfirmCancel(false)}
                >
                  No, Continue Editing
                </button>
                <button
                  className={internshipStyles.confirmYesButton}
                  onClick={() => navigate(-1)}
                >
                  Yes, Discard Changes
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={styles.internshipForm}
              autoComplete="off"
            >
              {errors.submit && (
                <div className={styles.errorMessage}>{errors.submit}</div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    name="title"
                    className={`${styles.input} ${
                      errors.title ? styles.inputError : ""
                    }`}
                    placeholder="Enter internship title"
                    value={internship.title}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.title && (
                    <span className={styles.errorText}>{errors.title}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="duration">Duration</label>
                  <select
                    id="duration"
                    name="duration"
                    className={`${styles.input} ${
                      errors.duration ? styles.inputError : ""
                    }`}
                    value={internship.duration}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select duration</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.duration && (
                    <span className={styles.errorText}>{errors.duration}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="seats">Number of Seats</label>
                  <input
                    id="seats"
                    type="number"
                    name="seats"
                    min="1"
                    max="100"
                    className={`${styles.input} ${
                      errors.seats ? styles.inputError : ""
                    }`}
                    placeholder="Enter number of available seats"
                    value={internship.seats}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.seats && (
                    <span className={styles.errorText}>{errors.seats}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    className={`${styles.input} ${
                      errors.type ? styles.inputError : ""
                    }`}
                    value={internship.type}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select type</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  {errors.type && (
                    <span className={styles.errorText}>{errors.type}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="location">Location</label>
                  <select
                    id="location"
                    name="location"
                    className={`${styles.input} ${
                      errors.location ? styles.inputError : ""
                    }`}
                    value={internship.location}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select location</option>
                    <option value="Ramallah">Ramallah</option>
                    <option value="Nablus">Nablus</option>
                    <option value="Hebron">Hebron</option>
                    <option value="Bethlehem">Bethlehem</option>
                    <option value="Jenin">Jenin</option>
                    <option value="Tulkarm">Tulkarm</option>
                    <option value="Qalqilya">Qalqilya</option>
                    <option value="Jericho">Jericho</option>
                    <option value="Salfit">Salfit</option>
                    <option value="Tubas">Tubas</option>
                    <option value="Jerusalem">Jerusalem</option>
                    <option value="Gaza">Gaza</option>
                    <option value="Other">Other</option>
                  </select>
                  {internship.location === "Other" && (
                    <input
                      type="text"
                      name="other_location"
                      placeholder="Please specify location"
                      className={`${styles.input} ${styles.marginTop} ${
                        errors.location ? styles.inputError : ""
                      }`}
                      value={internship.other_location || ""}
                      onChange={(e) => {
                        setInternship((prev) => ({
                          ...prev,
                          other_location: e.target.value,
                        }));
                        if (errors.location) {
                          setErrors((prev) => ({ ...prev, location: "" }));
                        }
                      }}
                      disabled={loading}
                    />
                  )}
                  {errors.location && (
                    <span className={styles.errorText}>{errors.location}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="start_date">Start Date</label>
                  <input
                    id="start_date"
                    type="date"
                    name="start_date"
                    className={`${styles.input} ${
                      errors.start_date ? styles.inputError : ""
                    }`}
                    value={internship.start_date}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.start_date && (
                    <span className={styles.errorText}>
                      {errors.start_date}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="end_date">End Date</label>
                  <input
                    id="end_date"
                    type="date"
                    name="end_date"
                    className={`${styles.input} ${
                      errors.end_date ? styles.inputError : ""
                    }`}
                    value={internship.end_date}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.end_date && (
                    <span className={styles.errorText}>{errors.end_date}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="supervisor_id">Supervisor</label>
                <select
                  id="supervisor_id"
                  name="supervisor_id"
                  className={`${styles.input} ${
                    errors.supervisor_id ? styles.inputError : ""
                  }`}
                  value={internship.supervisor_id}
                  onChange={handleChange}
                  disabled={loading || fetchingData}
                >
                  <option value="">Select a supervisor</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.email ? `(${s.email})` : ""}
                    </option>
                  ))}
                </select>
                {errors.supervisor_id && (
                  <span className={styles.errorText}>
                    {errors.supervisor_id}
                  </span>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.addInternshipButton}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Adding Internship...
                    </>
                  ) : (
                    "Add Internship"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AddInternship;
