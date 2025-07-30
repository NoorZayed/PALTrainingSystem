import React, { useEffect, useState } from "react";
import styles from "../css/SaveList.module.css";
import Aside from "../Navbar/studentAside";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/apiUtils";

interface Internship {
  internship_id: number;
  title: string;
  company: string;
  location: string;
  company_logo?: string;
  match_percentage?: number;
}

const SaveList: React.FC = () => {
  const [savedInternships, setSavedInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const studentId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) return;
    fetchSavedInternships();
  }, [studentId]);

  const fetchSavedInternships = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/students/${studentId}/saved-internships`
      );
      setSavedInternships(res.data);
    } catch (err) {
      console.error("Error fetching saved internships:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (internshipId: number) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/students/${studentId}/saved-internships/${internshipId}`
      );
      setSavedInternships((prev) =>
        prev.filter((internship) => internship.internship_id !== internshipId)
      );
    } catch (err) {
      console.error("Error removing internship:", err);
    }
  };

  const handleViewDetails = (internshipId: number) => {
    navigate(`/internship/${internshipId}`);
  };

  const filteredInternships = savedInternships.filter(
    (internship) =>
      internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMatchBadgeClass = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 80) return styles.high;
    if (percentage >= 60) return styles.medium;
    return styles.low;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Aside />
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <h1>Saved Internships</h1>
          </div>
          <div className={styles.emptyState}>
            <p>Loading your saved internships...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Aside />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Saved Internships</h1>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span>📚</span>
              {savedInternships.length} Saved
            </div>
            <div className={styles.stat}>
              <span>🎯</span>
              {
                savedInternships.filter(
                  (i) => i.match_percentage && i.match_percentage >= 80
                ).length
              }{" "}
              High Matches
            </div>
            <div className={styles.stat}>
              <span>📍</span>
              {new Set(savedInternships.map((i) => i.location)).size} Locations
            </div>
          </div>
        </div>

        <div className={styles.searchBar}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search saved internships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredInternships.length > 0 ? (
          <div className={styles.cards}>
            {filteredInternships.map((internship) => (
              <div key={internship.internship_id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.companyLogo}>
                    {internship.company_logo ? (
                      <img
                        src={internship.company_logo}
                        alt={`${internship.company} logo`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      internship.company.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className={styles.cardTitle}>{internship.title}</h3>
                    <p className={styles.cardCompany}>{internship.company}</p>
                  </div>
                </div>
                <div className={styles.cardDetails}>
                  <span>📍 {internship.location}</span>
                  {internship.match_percentage && (
                    <span
                      className={`${styles.matchBadge} ${getMatchBadgeClass(
                        internship.match_percentage
                      )}`}
                    >
                      {internship.match_percentage}% Match
                    </span>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.actionButton} ${styles.viewButton}`}
                    onClick={() => handleViewDetails(internship.internship_id)}
                  >
                    <span>👁️</span> View Details
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.removeButton}`}
                    onClick={() => handleRemove(internship.internship_id)}
                  >
                    <span>🗑️</span> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>You haven't saved any internships yet.</p>
            <button
              className={styles.emptyStateButton}
              onClick={() => navigate("/internships/search")}
            >
              🔍 Browse Internships
            </button>
          </div>
        )}

        <button
          className={styles.fab}
          onClick={() => navigate("/internships/search")}
        >
          +
        </button>
      </main>
    </div>
  );
};

export default SaveList;
