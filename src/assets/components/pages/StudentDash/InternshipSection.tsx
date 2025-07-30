import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/StudentDashboard.module.css";
import axios from "axios";
import { API_BASE_URL } from "../../utils/apiUtils";

interface Internship {
  internship_id: number;
  title: string;
  company: string;
  location: string;
  type: "remote" | "onsite" | "hybrid";
  matchScore?: number;
  logo?: string;
  profile_image?: string;
  requirements?: string[];
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface CurrentInternship {
  internship_id: number;
  company: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  logo?: string;
  profile_image?: string;
}

interface ApplicationStats {
  applications: number;
  saved: number;
  matches: number;
}

const InternshipSection = () => {
  const navigate = useNavigate();
  const [recommendedInternships, setRecommendedInternships] = useState<
    Internship[]
  >([]);
  const [currentInternship, setCurrentInternship] =
    useState<CurrentInternship | null>(null);
  const [stats, setStats] = useState<ApplicationStats>({
    applications: 0,
    saved: 0,
    matches: 0,
  });
  const [loading, setLoading] = useState({
    recommendations: true,
    current: true,
    stats: true,
  });
  const [filterType, setFilterType] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");

  // Get student ID from local storage or context
  const studentId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  // Fetch recommended internships
  useEffect(() => {
    if (!studentId) return;

    setLoading((prev) => ({ ...prev, recommendations: true }));
    axios
      .get(`${API_BASE_URL}/api/recommended-internships/${studentId}`)
      .then((res) => {
        setRecommendedInternships(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch recommended internships:", err);
        // Fallback to an empty array to prevent errors
        setRecommendedInternships([]);
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, recommendations: false }));
      });
  }, [studentId]);

  // Fetch current active internship if exists
  useEffect(() => {
    if (!studentId) return;

    setLoading((prev) => ({ ...prev, current: true }));
    axios
      .get(`${API_BASE_URL}/api/student/${studentId}/active-internship`)
      .then((res) => {
        if (res.data) {
          setCurrentInternship(res.data);
        } else {
          setCurrentInternship(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch current internship:", err);
        setCurrentInternship(null);
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, current: false }));
      });
  }, [studentId]);

  // Fetch application stats
  useEffect(() => {
    if (!studentId) return;

    setLoading((prev) => ({ ...prev, stats: true }));
    axios
      .get(`${API_BASE_URL}/api/student/${studentId}/dashboard-stats`)
      .then((res) => {
        console.log(res.data);

        setStats({
          applications: res.data.applications,
          saved: res.data.saved,
          matches: res.data.matches,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch application stats:", err);
        setStats({
          applications: 0,
          saved: 0,
          matches: 0,
        });
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, stats: false }));
      });
  }, [studentId]);

  // Filter recommended internships
  const filteredInternships = recommendedInternships.filter((internship) => {
    const matchesType =
      !filterType ||
      (internship.type &&
        internship.type.toLowerCase() === filterType.toLowerCase());

    const matchesLocation =
      !filterLocation ||
      (internship.location &&
        internship.location
          .toLowerCase()
          .includes(filterLocation.toLowerCase()));

    return matchesType && matchesLocation;
  });

  const handleShowMore = () => {
    navigate("/student/InternshipSearch", { state: { showRecommended: true } });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "N/A";
    }
  };

  return (
    <div className={styles.internshipSection}>
      <div className={styles.internshipOverview}>
        {/* Current Internship Status */}
        <div className={styles.currentInternship}>
          <h3>Current Internship</h3>
          {loading.current ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading internship data...</p>
            </div>
          ) : currentInternship ? (
            <div className={styles.activeInternship}>
              <div className={styles.companyInfo}>
                {currentInternship.profile_image ? (
                  <img
                    src={`/uploads/${currentInternship.profile_image}`}
                    alt={currentInternship.company}
                    className={styles.companyLogo}
                    // onError={(e) => {
                    //   (e.target as HTMLImageElement).onerror = null;
                    //   (e.target as HTMLImageElement).src =
                    //     "https://via.placeholder.com/60x60?text=" +
                    //     currentInternship.company[0];
                    // }}
                  />
                ) : (
                  // : currentInternship.logo ? (
                  //   <img
                  //     src={currentInternship.logo}
                  //     alt={currentInternship.company}
                  //     className={styles.companyLogo}
                  //     onError={(e) => {
                  //       (e.target as HTMLImageElement).onerror = null;
                  //       (e.target as HTMLImageElement).src =
                  //         "https://via.placeholder.com/60x60?text=" +
                  //         currentInternship.company[0];
                  //     }}
                  //   />
                  // )
                  <div className={styles.companyInitial}>
                    {currentInternship.company[0]}
                  </div>
                )}
                <div className={styles.internshipDetails}>
                  <h4>{currentInternship.company}</h4>
                  <p>{currentInternship.title}</p>
                  <div className={styles.internshipPeriod}>
                    <span>{formatDate(currentInternship.start_date)}</span>
                    <span>→</span>
                    <span>{formatDate(currentInternship.end_date)}</span>
                  </div>
                </div>
              </div>
              <div
                className={`${styles.statusBadge} ${
                  currentInternship.status === "Active"
                    ? styles.activeStatus
                    : currentInternship.status === "Completed"
                    ? styles.completedStatus
                    : styles.pendingStatus
                }`}
              >
                <span className={styles.statusDot}></span>
                {currentInternship.status}
              </div>
            </div>
          ) : (
            <div className={styles.noInternship}>
              <p>No active internship</p>
              <button
                className={styles.findInternshipButton}
                onClick={() => navigate("/student/InternshipSearch")}
              >
                Find Internships
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className={styles.internshipStats}>
          {loading.stats ? (
            <div className={styles.loadingStatState}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : (
            <>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.applications}</span>
                <span className={styles.statLabel}>Applications</span>
              </div>

              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.saved}</span>
                <span className={styles.statLabel}>Saved</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.matches}</span>
                <span className={styles.statLabel}>Matches</span>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/student/InternshipSearch")}
          >
            <span className={styles.actionIcon}>🔍</span>
            Search Internships
          </button>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/student/save-list")}
          >
            <span className={styles.actionIcon}>🔖</span>
            Saved Internships
          </button>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/student/requests")}
          >
            <span className={styles.actionIcon}>📝</span>
            My Applications
          </button>
        </div>

        {/* Recommended Internships with Filters */}
        <div className={styles.recommendedInternships}>
          <div className={styles.sectionHeader}>
            <h3>Recommended for You</h3>
            <button className={styles.viewAllButton} onClick={handleShowMore}>
              <span className={styles.viewAllIcon}>🔍</span>
              Show More Internships
            </button>
          </div>

          {/* Filters for recommended internships */}
          <div className={styles.dashboardFilters}>
            <div className={styles.filterGroup}>
              <select
                className={styles.filterSelect}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <input
                type="text"
                placeholder="Filter by location..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className={styles.filterInput}
              />

              {(filterType || filterLocation) && (
                <button
                  className={styles.clearFilterButton}
                  onClick={() => {
                    setFilterType("");
                    setFilterLocation("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {loading.recommendations ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading recommendations...</p>
            </div>
          ) : filteredInternships.length > 0 ? (
            <div className={styles.recommendationsGrid}>
              {filteredInternships.map((internship) => (
                <div
                  key={internship.internship_id}
                  className={styles.recommendationCard}
                >
                  <div className={styles.cardHeader}>
                    {internship.profile_image ? (
                      <img
                        src={`/uploads/${internship.profile_image}`}
                        alt={internship.company}
                        className={styles.companyLogo}
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/60x60?text=" +
                            internship.company[0];
                        }}
                      />
                    ) : internship.logo ? (
                      <img
                        src={internship.logo}
                        alt={internship.company}
                        className={styles.companyLogo}
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/60x60?text=" +
                            internship.company[0];
                        }}
                      />
                    ) : (
                      <div className={styles.companyInitial}>
                        {internship.company[0]}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h4 className={styles.roleTitle}>{internship.title}</h4>
                    <h5 className={styles.companyName}>{internship.company}</h5>
                    <div className={styles.details}>
                      <span className={styles.location}>
                        📍 {internship.location || "Location not specified"}
                      </span>
                      <span className={styles.type}>
                        💼 {internship.type || "Type not specified"}
                      </span>
                    </div>
                    {internship.requirements &&
                      internship.requirements.length > 0 && (
                        <div className={styles.requirements}>
                          {internship.requirements
                            .slice(0, 3)
                            .map((req, index) => (
                              <span
                                key={index}
                                className={styles.requirementTag}
                              >
                                {req}
                              </span>
                            ))}
                        </div>
                      )}
                  </div>
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.applyButton}
                      onClick={() =>
                        navigate(`/internship/${internship.internship_id}`)
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>
                {filterType || filterLocation
                  ? "No recommendations match your filters"
                  : "No recommended internships available at the moment"}
              </p>
              {(filterType || filterLocation) && (
                <button
                  className={styles.clearFilterButton}
                  onClick={() => {
                    setFilterType("");
                    setFilterLocation("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipSection;
