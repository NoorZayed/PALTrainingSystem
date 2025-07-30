import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../css/InternshipDetail.module.css";
import companyStyles from "../css/CompanyPages.module.css";
import CompanyAside from "../Navbar/CompanyAside";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

interface Supervisor {
  id: number;
  name: string;
}

interface InternshipForm {
  title: string;
  duration: string;
  type: string;
  location: string;
  start_date: string;
  end_date: string;
  supervisor_id: string;
  seats: number;
}

const EditInternship: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<InternshipForm>({
    title: "",
    duration: "",
    type: "",
    location: "",
    start_date: "",
    end_date: "",
    supervisor_id: "",
    seats: 1,
  });
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof InternshipForm, string>>
  >({});

  // Add state for original supervisor and confirmation dialog
  const [originalSupervisorId, setOriginalSupervisorId] = useState<
    string | null
  >(null);
  const [showSupervisorConfirm, setShowSupervisorConfirm] = useState(false);
  const [pendingSupervisorId, setPendingSupervisorId] = useState<string | null>(
    null
  );
  const [originalSupervisorName, setOriginalSupervisorName] =
    useState<string>("");
  const [newSupervisorName, setNewSupervisorName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch internship details
        console.log("EditInternship - Fetching internship with ID:", id);
        const internshipRes = await axios.get(
          `${API_BASE_URL}/api/internships/${id}`
        );
        console.log(
          "EditInternship - Internship data received:",
          internshipRes.data
        );

        // Format the dates properly for the date input (YYYY-MM-DD)
        const internship = internshipRes.data;
        if (internship.start_date) {
          const date = new Date(internship.start_date);
          internship.start_date = date.toISOString().split("T")[0];
        }
        if (internship.end_date) {
          const date = new Date(internship.end_date);
          internship.end_date = date.toISOString().split("T")[0];
        }

        setForm({
          title: internship.title || "",
          duration: internship.duration || "",
          type: internship.type || "",
          location: internship.location || "",
          start_date: internship.start_date || "",
          end_date: internship.end_date || "",
          seats: internship.seats || 1,
          supervisor_id: internship.supervisor_id
            ? String(internship.supervisor_id)
            : "",
        });
        setOriginalSupervisorId(
          internship.supervisor_id ? String(internship.supervisor_id) : null
        );

        // Fetch supervisors list
        console.log("Fetching supervisors");
        const supervisorsRes = await axios.get(
          `${API_BASE_URL}/api/supervisors/1`
        ); // Assuming company_id is 1
        console.log("Supervisors data:", supervisorsRes.data);
        setSupervisors(supervisorsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err instanceof AxiosError) {
          console.error("Error details:", err.response?.data || err.message);
          console.error("Error status:", err.response?.status);
        } else if (err instanceof Error) {
          console.error("Error message:", err.message);
        }
        setError("Failed to load internship data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateForm = () => {
    const errors: Partial<Record<keyof InternshipForm, string>> = {};

    if (!form.title.trim()) {
      errors.title = "Title is required";
    }
    if (!form.duration.trim()) {
      errors.duration = "Duration is required";
    }
    if (!form.type.trim()) {
      errors.type = "Type is required";
    }
    if (!form.location.trim()) {
      errors.location = "Location is required";
    }
    if (!form.supervisor_id) {
      errors.supervisor_id = "Please select a supervisor";
    }
    if (!form.seats || form.seats < 1) {
      errors.seats = "Number of seats must be at least 1";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle number inputs specially
    if (name === "seats") {
      setForm((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (formErrors[name as keyof InternshipForm]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await axios.put(`${API_BASE_URL}/api/internships/${id}`, {
        ...form,
        supervisor_id: form.supervisor_id ? parseInt(form.supervisor_id) : null,
        start_date: form.start_date,
      });
      navigate("/company/internships", {
        state: { message: "Internship updated successfully" },
      });
    } catch (err) {
      console.error("Error updating internship:", err);
      if (err instanceof AxiosError) {
        console.error("Error details:", err.response?.data || err.message);
        console.error("Error status:", err.response?.status);
      } else if (err instanceof Error) {
        console.error("Error message:", err.message);
      }
      setError("Failed to update internship. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSupervisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, supervisor_id: value }));

    const selectedSupervisor = supervisors.find(
      (s) => s.id === parseInt(value)
    );
    if (selectedSupervisor) {
      setNewSupervisorName(selectedSupervisor.name);
    }

    // Show confirmation dialog if the supervisor is changed
    if (originalSupervisorId && value !== originalSupervisorId) {
      setShowSupervisorConfirm(true);
      setPendingSupervisorId(value);
    } else {
      setShowSupervisorConfirm(false);
      setPendingSupervisorId(null);
    }
  };

  const handleConfirmSupervisorChange = async () => {
    if (pendingSupervisorId) {
      setForm((prev) => ({ ...prev, supervisor_id: pendingSupervisorId }));
      setShowSupervisorConfirm(false);
      setPendingSupervisorId(null);

      // Optionally, you can also submit the form here after confirmation
      // handleSubmit();
    }
  };

  const handleCancelSupervisorChange = () => {
    setShowSupervisorConfirm(false);
    setPendingSupervisorId(null);
  };

  if (loading) {
    return (
      <div className={companyStyles.container}>
        <CompanyAside />
        <main className={companyStyles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading internship data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={companyStyles.container}>
      <CompanyAside />
      <main className={companyStyles.mainContent}>
        <div className={styles.headerRow}>
          <button
            className={styles.backButton}
            onClick={() => navigate("/company/internships")}
            title="Back"
            disabled={submitting}
          >
            ← Back
          </button>
          <h2>Edit Internship</h2>
        </div>

        <div className={styles.formCard}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form
            onSubmit={handleSubmit}
            className={styles.internshipForm}
            autoComplete="off"
          >
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                className={`${styles.input} ${
                  formErrors.title ? styles.inputError : ""
                }`}
                placeholder="Enter internship title"
                value={form.title}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.title && (
                <span className={styles.errorText}>{formErrors.title}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
                name="duration"
                className={`${styles.input} ${
                  formErrors.duration ? styles.inputError : ""
                }`}
                placeholder="e.g., 3 months"
                value={form.duration}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.duration && (
                <span className={styles.errorText}>{formErrors.duration}</span>
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
                  formErrors.seats ? styles.inputError : ""
                }`}
                placeholder="Enter number of available seats"
                value={form.seats}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.seats && (
                <span className={styles.errorText}>{formErrors.seats}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                className={`${styles.input} ${
                  formErrors.type ? styles.inputError : ""
                }`}
                value={form.type}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Select type</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {formErrors.type && (
                <span className={styles.errorText}>{formErrors.type}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                className={`${styles.input} ${
                  formErrors.location ? styles.inputError : ""
                }`}
                placeholder="Enter location"
                value={form.location}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.location && (
                <span className={styles.errorText}>{formErrors.location}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="start_date">Start Date</label>
              <input
                id="start_date"
                type="date"
                name="start_date"
                className={`${styles.input} ${
                  formErrors.start_date ? styles.inputError : ""
                }`}
                value={form.start_date}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.start_date && (
                <span className={styles.errorText}>
                  {formErrors.start_date}
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
                  formErrors.end_date ? styles.inputError : ""
                }`}
                value={form.end_date}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.end_date && (
                <span className={styles.errorText}>{formErrors.end_date}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="supervisor_id">Supervisor</label>
              <select
                id="supervisor_id"
                name="supervisor_id"
                className={`${styles.input} ${
                  formErrors.supervisor_id ? styles.inputError : ""
                }`}
                value={form.supervisor_id}
                onChange={handleSupervisorChange}
                disabled={submitting}
              >
                <option value="">Select a supervisor</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {formErrors.supervisor_id && (
                <span className={styles.errorText}>
                  {formErrors.supervisor_id}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Updating Internship...
                </>
              ) : (
                "Update Internship"
              )}
            </button>
          </form>

          {showSupervisorConfirm && (
            <div className={styles.confirmationDialog}>
              <p>
                Are you sure you want to change the supervisor from{" "}
                <strong>{originalSupervisorName}</strong> to{" "}
                <strong>{newSupervisorName}</strong>?
              </p>
              <div className={styles.confirmationButtons}>
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirmSupervisorChange}
                >
                  Yes, change supervisor
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelSupervisorChange}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditInternship;
