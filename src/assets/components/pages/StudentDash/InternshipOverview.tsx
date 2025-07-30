import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/StudentDashboard.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/apiUtils";

interface Internship {
  company: string;
  role: string;
  status: string;
  startDate: string;
  endDate: string;
  logo?: string;
}

interface Application {
  company: string;
  role: string;
  status: "pending" | "accepted" | "rejected";
  date: string;
}

const InternshipOverview = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual data from your backend
  const currentInternship: Internship | null = {
    company: "Google",
    role: "Frontend Developer Intern",
    status: "Active",
    startDate: "2024-03-01",
    endDate: "2024-08-31",
    logo: "https://logo.clearbit.com/google.com",
  };

  const recentApplications: Application[] = [
    {
      company: "Meta",
      role: "React Developer Intern",
      status: "pending",
      date: "2024-03-15",
    },
    {
      company: "Amazon",
      role: "UI/UX Design Intern",
      status: "rejected",
      date: "2024-03-10",
    },
  ];

  const stats = {
    applications: 5,
    saved: 8,
    matches: 12,
  };

  const [applicationCount, setApplicationCount] = useState<number>(0);

  useEffect(() => {
    const student = JSON.parse(localStorage.getItem("user") || "{}");
    const studentId = student?.id;

    if (!studentId) return;

    axios
      .get(`${API_BASE_URL}/api/student/${studentId}/application-count`)
      .then((res) => {
        setApplicationCount(res.data.total || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch application count:", err);
        setApplicationCount(0);
      });
  }, []);

  return (
    <div className={styles.internshipOverviewCard}>
      {/* Header Section */}
      <div className={styles.internshipHeader}>
        <h3 className={styles.cardTitle}>💼 Internship Status</h3>
        <button
          className={styles.viewAllButton}
          onClick={() => navigate("/internships")}
        >
          View All
        </button>
      </div>

      {/* Current Internship Section */}
      <div className={styles.currentInternshipSection}>
        {currentInternship ? (
          <div className={styles.activeInternship}>
            <div className={styles.companyInfo}>
              {currentInternship.logo && (
                <img
                  src={currentInternship.logo}
                  alt={currentInternship.company}
                  className={styles.companyLogo}
                />
              )}
              <div className={styles.internshipDetails}>
                <h4 className={styles.companyName}>
                  {currentInternship.company}
                </h4>
                <p className={styles.roleTitle}>{currentInternship.role}</p>
                <div className={styles.internshipPeriod}>
                  <span>
                    {new Date(currentInternship.startDate).toLocaleDateString()}
                  </span>
                  <span>→</span>
                  <span>
                    {new Date(currentInternship.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              {currentInternship.status}
            </div>
          </div>
        ) : (
          <div className={styles.noInternship}>
            <p>No active internship</p>
            <button
              className={styles.findInternshipButton}
              onClick={() => navigate("/internships")}
            >
              Find Internships
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className={styles.internshipStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{applicationCount}</span>
          <span className={styles.statLabel}>Applications</span>
        </div>
        {/* <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.interviews}</span>
          <span className={styles.statLabel}>Interviews</span>
        </div> */}
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.saved}</span>
          <span className={styles.statLabel}>Saved</span>
        </div>
      
      </div>

      {/* Recent Applications */}
      <div className={styles.recentApplications}>
        <h4 className={styles.sectionTitle}>Recent Applications</h4>
        <div className={styles.applicationList}>
          {recentApplications.map((app, index) => (
            <div key={index} className={styles.applicationItem}>
              <div className={styles.applicationInfo}>
                <h5 className={styles.applicationCompany}>{app.company}</h5>
                <p className={styles.applicationRole}>{app.role}</p>
                <span className={styles.applicationDate}>
                  {new Date(app.date).toLocaleDateString()}
                </span>
              </div>
              <div className={`${styles.statusBadge} ${styles[app.status]}`}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/internships/recommended")}
        >
          <span className={styles.actionIcon}>🎯</span>
          View Recommendations
        </button>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/internships/saved")}
        >
          <span className={styles.actionIcon}>🔖</span>
          Saved Internships
        </button>
      </div>
    </div>
  );
};

export default InternshipOverview;
