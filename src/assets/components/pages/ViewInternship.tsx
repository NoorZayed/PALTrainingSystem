import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../css/InternshipDetail.module.css";
import companyStyles from "../css/CompanyPages.module.css";
import CompanyAside from "../Navbar/CompanyAside";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from '../utils/apiUtils';

interface SupervisorInfo {
  id: number;
  name: string;
  email: string;
}

interface InternshipData {
  internship_id: number;
  title: string;
  duration: string;
  location: string;
  start_date: string;
  company_id: number;
  supervisor_id: number | null;
  co_supervisor_id: number | null;
}

const ViewInternship: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<InternshipData | null>(null);
  const [supervisor, setSupervisor] = useState<SupervisorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching internship with ID:", id);
        // Log the full URL being requested
        const url = `${API_BASE_URL}/api/internships/${id}`;
        console.log("Request URL:", url);

        const internshipRes = await axios.get(url);
        console.log("Internship data received:", internshipRes.data);
        setInternship(internshipRes.data);

        // If there's a supervisor assigned, fetch their details
        if (internshipRes.data.supervisor_id) {
          try {
            const supervisorUrl = `${API_BASE_URL}/api/supervisors/detail/${internshipRes.data.supervisor_id}`;
            console.log("Fetching supervisor details from:", supervisorUrl);
            const supervisorRes = await axios.get(supervisorUrl);
            console.log("Supervisor data received:", supervisorRes.data);
            setSupervisor(supervisorRes.data);
          } catch (err) {
            console.error("Error fetching supervisor details:", err);
            if (err instanceof AxiosError) {
              console.error(
                "Error details:",
                err.response?.data || err.message
              );
            } else if (err instanceof Error) {
              console.error("Error message:", err.message);
            }
            // We don't set the main error state here as the internship data was retrieved successfully
          }
        }
      } catch (err) {
        console.error("Error fetching internship:", err);
        if (err instanceof AxiosError) {
          console.error("Error details:", err.response?.data || err.message);
          console.error("Error status:", err.response?.status);
        } else if (err instanceof Error) {
          console.error("Error message:", err.message);
        }
        setError("Failed to load internship details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={companyStyles.container}>
        <CompanyAside />
        <main className={companyStyles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading internship details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className={companyStyles.container}>
        <CompanyAside />
        <main className={companyStyles.mainContent}>
          <div className={styles.errorState}>
            <h3>Error</h3>
            <p>{error || "Internship not found"}</p>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/company/internships")}
            >
              Return to Internships
            </button>
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
            title="Back to internships"
          >
            ← Back
          </button>
          <h2>Internship Details</h2>
        </div>

        <div className={styles.internshipDetailCard}>
          <div className={styles.internshipHeader}>
            <h3>{internship.title}</h3>
            <div className={styles.badgeContainer}>
              <span className={styles.locationBadge}>
                {internship.location}
              </span>
              <span className={styles.durationBadge}>
                {internship.duration}
              </span>
            </div>
          </div>

          <div className={styles.internshipDetails}>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Start Date</div>
              <div className={styles.detailValue}>
                {internship.start_date
                  ? formatDate(internship.start_date)
                  : "Not specified"}
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Supervisor</div>
              <div className={styles.detailValue}>
                {supervisor ? (
                  <div className={styles.supervisorInfo}>
                    <span>{supervisor.name}</span>
                    <span className={styles.supervisorEmail}>
                      {supervisor.email}
                    </span>
                  </div>
                ) : (
                  "No supervisor assigned"
                )}
              </div>
            </div>
          </div>

          <div className={styles.actionButtonsRow}>
            <button
              className={styles.editButton}
              onClick={() =>
                navigate(
                  `/company/internships/edit/${internship.internship_id}`
                )
              }
            >
              Edit Internship
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this internship?"
                  )
                ) {
                  setLoading(true);
                  axios
                    .delete(
                      `${API_BASE_URL}/api/internships/${internship.internship_id}`
                    )
                    .then(() => {
                      navigate("/company/internships", {
                        state: { message: "Internship deleted successfully" },
                      });
                    })
                    .catch((err) => {
                      console.error("Error deleting internship:", err);
                      if (err instanceof AxiosError) {
                        console.error(
                          "Error details:",
                          err.response?.data || err.message
                        );
                        console.error("Error status:", err.response?.status);
                      } else if (err instanceof Error) {
                        console.error("Error message:", err.message);
                      }
                      setError(
                        "Failed to delete internship. Please try again."
                      );
                      setLoading(false);
                    });
                }
              }}
            >
              Delete Internship
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewInternship;
