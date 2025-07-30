import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../css/CompanyPages.module.css";
import internshipStyles from "../css/CompanyInternships.module.css";
import CompanyAside from "../Navbar/CompanyAside";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

interface Internship {
  id: number; // This matches the backend's transformed internship_id
  title: string;
  duration: string;
  type: string;
  location: string;
  start_date: string;
  end_date: string | null;
  company_id: number;
  supervisor_id: number | null;
  co_supervisor_id: number | null;
}

interface LocationState {
  message?: string;
}

const CompanyInternships: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const [internships, setInternships] = useState<Internship[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // New filter states
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("title");

  // Lists for filter dropdowns
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    // Set success message if it exists in location state
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the location state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });

      // Auto-hide the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state, navigate, location.pathname]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/internships/company/1`);
      setInternships(res.data);

      // Extract unique locations and types for filters
      const uniqueLocations = Array.from(
        new Set(res.data.map((i: Internship) => i.location))
      ).filter(Boolean);
      const uniqueTypes = Array.from(
        new Set(res.data.map((i: Internship) => i.type))
      ).filter(Boolean);

      setLocations(uniqueLocations as string[]);
      setTypes(uniqueTypes as string[]);

      setError(null);
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError(
        "Failed to load internships. Please refresh the page to try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/internships/${id}`);
      setSuccessMessage("Internship deleted successfully");
      fetchInternships(); // Refresh list after deletion
      setDeleteConfirmId(null); // Close the confirmation dialog
    } catch (err) {
      console.error("Error deleting internship:", err);
      setError("Failed to delete internship. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Apply filters and sorting
  const getFilteredInternships = () => {
    let filtered = internships;

    // Apply text search
    if (search) {
      filtered = filtered.filter(
        (i) =>
          (i.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (i.location || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply location filter
    if (filterLocation) {
      filtered = filtered.filter((i) => i.location === filterLocation);
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter((i) => i.type === filterType);
    }

    // Apply status filter - assuming we can determine status from dates
    if (filterStatus) {
      const now = new Date();

      if (filterStatus === "active") {
        filtered = filtered.filter((i) => {
          const startDate = i.start_date ? new Date(i.start_date) : null;
          const endDate = i.end_date ? new Date(i.end_date) : null;
          return startDate && startDate <= now && (!endDate || endDate >= now);
        });
      } else if (filterStatus === "upcoming") {
        filtered = filtered.filter((i) => {
          const startDate = i.start_date ? new Date(i.start_date) : null;
          return startDate && startDate > now;
        });
      } else if (filterStatus === "completed") {
        filtered = filtered.filter((i) => {
          const endDate = i.end_date ? new Date(i.end_date) : null;
          return endDate && endDate < now;
        });
      }
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "location":
          return a.location.localeCompare(b.location);
        case "date":
          return (
            new Date(a.start_date || 0).getTime() -
            new Date(b.start_date || 0).getTime()
          );
        default:
          return 0;
      }
    });
  };

  const filteredInternships = getFilteredInternships();

  const clearFilters = () => {
    setSearch("");
    setFilterLocation("");
    setFilterType("");
    setFilterStatus("");
    setSortBy("title");
  };

  return (
    <div className={styles.container}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <header className={internshipStyles.pageHeader}>
          <div className={internshipStyles.headerContent}>
            <h2 className={internshipStyles.pageTitle}>Internships</h2>
            <p className={internshipStyles.headerSubtitle}>
              Manage and edit your active internship listings.
            </p>
          </div>
        </header>

        {successMessage && (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>✓</span>
            {successMessage}
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>!</span>
            {error}
            <button className={styles.retryButton} onClick={fetchInternships}>
              Retry
            </button>
          </div>
        )}

        <div className={styles.filterContainer}>
          <div className={styles.searchRow}>
            <div className={styles.searchWrapper}>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.filterWrapper}>
              {/* Location filter */}
              <select
                className={styles.filterSelect}
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                disabled={loading}
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Type filter */}
              <select
                className={styles.filterSelect}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={loading}
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type === "site"
                      ? "On Site"
                      : type === "remote"
                      ? "Remote"
                      : type === "online"
                      ? "Online"
                      : type === "hybrid"
                      ? "Hybrid"
                      : type
                      ? type.charAt(0).toUpperCase() + type.slice(1)
                      : "Unknown"}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={loading}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>

              {/* Sort by */}
              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={loading}
              >
                <option value="title">Sort by Title</option>
                <option value="location">Sort by Location</option>
                <option value="date">Sort by Date</option>
              </select>

              <button
                className={styles.clearFiltersButton}
                onClick={clearFilters}
                disabled={loading}
              >
                Clear Filters
              </button>
            </div>

            <button
              className={styles.addInternshipButton}
              onClick={() => navigate("/company/internships/add")}
              disabled={loading}
            >
              <span className={styles.addIcon}>+</span>
              Add New Internship
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading internships...</p>
          </div>
        ) : (
          <div className={internshipStyles.internshipGrid}>
            {filteredInternships.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No internships found</h3>
                <p>Add a new internship or adjust your search.</p>
              </div>
            ) : (
              filteredInternships.map((internship) => (
                <section
                  key={internship.id}
                  className={internshipStyles.internshipCard}
                >
                  <div className={internshipStyles.cardContent}>
                    <h3 className={internshipStyles.cardTitle}>
                      {internship.title}
                    </h3>
                    <div className={internshipStyles.badgeRow}>
                      <span className={internshipStyles.locationBadge}>
                        {internship.location}
                      </span>
                      <span className={internshipStyles.typeBadge}>
                        {internship.type === "site"
                          ? "On Site"
                          : internship.type === "remote"
                          ? "Remote"
                          : internship.type === "online"
                          ? "Online"
                          : internship.type === "hybrid"
                          ? "Hybrid"
                          : internship.type
                          ? internship.type.charAt(0).toUpperCase() +
                            internship.type.slice(1)
                          : "Unknown"}
                      </span>
                    </div>
                    <div className={internshipStyles.cardDetails}>
                      <div className={internshipStyles.detailItem}>
                        <span className={internshipStyles.detailLabel}>
                          Start Date:
                        </span>
                        <span className={internshipStyles.detailValue}>
                          {internship.start_date
                            ? formatDate(internship.start_date)
                            : "Not set"}
                        </span>
                      </div>
                      <div className={internshipStyles.detailItem}>
                        <span className={internshipStyles.detailLabel}>
                          Duration:
                        </span>
                        <span className={internshipStyles.detailValue}>
                          {internship.duration || "Not specified"}
                        </span>
                      </div>
                    </div>
                    <div className={internshipStyles.buttonRow}>
                      <button
                        className={internshipStyles.editButton}
                        onClick={() =>
                          navigate(`/company/internships/edit/${internship.id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className={internshipStyles.editButton}
                        onClick={() =>
                          navigate(`/company/applications/${internship.id}`)
                        }
                      >
                        View Applications
                      </button>
                      <button
                        className={internshipStyles.deleteButton}
                        onClick={() => handleDeleteConfirm(internship.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirmId !== null && (
        <div className={styles.modalBackdrop}>
          <div className={styles.confirmDialog}>
            <h3>Delete Internship</h3>
            <p>Are you sure you want to delete this internship?</p>
            <p className={styles.warningText}>This action cannot be undone.</p>
            <div className={styles.buttonGroup}>
              <button
                className={styles.cancelButton}
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInternships;
