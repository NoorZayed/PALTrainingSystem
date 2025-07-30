import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../css/InternshipSearch.module.css";
import InternshipCard from "./InternshipCard";
import Pagination from "./Pagination";
import companyIcon from "../images/company.svg";
import Aside from "../Navbar/studentAside";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

interface Internship {
  internship_id: number;
  title: string;
  company: string;
  location: string;
  status: string;
  isRecommended?: boolean;
  company_id: number;
  type?: string; // internship type (backend, frontend, etc)
  mode?: string; // work mode (onsite, remote, hybrid)
  start_date?: string; // start date of the internship
  end_date?: string; // end date of the internship
}

const InternshipSearch: React.FC = () => {
  const location = useLocation();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showRecommended, setShowRecommended] = useState(false);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>(
    []
  );
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());

  // New state for filters
  const [internshipTypes, setInternshipTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("popular");

  const studentId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
  const [applicationsToday, setApplicationsToday] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  //fetch internships
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/internships`)
      .then((res) => {
        setInternships(res.data);
        setFilteredInternships(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch internships:", err);
      });

    axios
      .get(`${API_BASE_URL}/api/applications/daily-count/${studentId}`)
      .then((res) => {
        setApplicationsToday(res.data.count);
      })
      .catch((err) => {
        console.error("Failed to fetch daily application count:", err);
      });
  }, []);

  useEffect(() => {
    if (studentId) {
      axios
        .get(`${API_BASE_URL}/api/applications/${studentId}`)
        .then((res) => {
          const ids = new Set<number>(
            res.data.map((app: any) => Number(app.internship_id))
          );
          setAppliedIds(ids);
        })
        .catch((err) => {
          console.error("Failed to fetch applied internship IDs:", err);
        });
    }
  }, [studentId]);

  // Handle internship type filter changes
  const handleTypeFilterChange = (type: string) => {
    setInternshipTypes((prevTypes) => {
      if (prevTypes.includes(type)) {
        return prevTypes.filter((t) => t !== type);
      } else {
        return [...prevTypes, type];
      }
    });
  };

  // Handle work mode filter changes
  const handleModeFilterChange = (mode: string) => {
    setWorkModes((prevModes) => {
      if (prevModes.includes(mode)) {
        return prevModes.filter((m) => m !== mode);
      } else {
        return [...prevModes, mode];
      }
    });
  };

  // Enhanced search + filter logic
  const handleSearch = () => {
    let filtered = internships;

    // Filter by search terms
    if (searchTitle || searchLocation) {
      filtered = filtered.filter(
        (intern) =>
          intern.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
          intern.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    // Filter by internship types if any are selected
    if (internshipTypes.length > 0) {
      filtered = filtered.filter((intern) =>
        internshipTypes.includes(intern.type?.toLowerCase() || "")
      );
    }

    // Filter by work modes if any are selected
    if (workModes.length > 0) {
      filtered = filtered.filter((intern) =>
        workModes.includes(intern.mode?.toLowerCase() || "")
      );
    }

    // Handle recommended internships
    if (showRecommended && studentId) {
      axios
        .get(`${API_BASE_URL}/api/recommended-internships/${studentId}`)
        .then((res) => {
          // Apply other filters to recommended internships as well
          let recommendedFiltered = res.data;

          if (searchTitle || searchLocation) {
            recommendedFiltered = recommendedFiltered.filter(
              (intern: Internship) =>
                intern.title
                  .toLowerCase()
                  .includes(searchTitle.toLowerCase()) &&
                intern.location
                  .toLowerCase()
                  .includes(searchLocation.toLowerCase())
            );
          }

          if (internshipTypes.length > 0) {
            recommendedFiltered = recommendedFiltered.filter(
              (intern: Internship) =>
                internshipTypes.includes(intern.type?.toLowerCase() || "")
            );
          }

          if (workModes.length > 0) {
            recommendedFiltered = recommendedFiltered.filter(
              (intern: Internship) =>
                workModes.includes(intern.mode?.toLowerCase() || "")
            );
          }
          setInternships(res.data);
          setFilteredInternships(recommendedFiltered);
        })
        .catch((err) => {
          console.error("Failed to fetch recommended internships:", err);
        });
    } else {
      // Apply sorting
      if (sortBy === "newest") {
        filtered = [...filtered].sort((a, b) => {
          const dateA = new Date(a.start_date || 0);
          const dateB = new Date(b.start_date || 0);
          return dateB.getTime() - dateA.getTime();
        });
      }
      // The default "popular" sort can be implemented based on your specific logic

      setFilteredInternships(filtered);
    }
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    handleSearch();
  }, [showRecommended, internshipTypes, workModes, sortBy]);

  // Reset all filters
  const clearFilters = () => {
    setSearchTitle("");
    setSearchLocation("");
    setShowRecommended(false);
    setInternshipTypes([]);
    setWorkModes([]);
    setSortBy("popular");
    setFilteredInternships(internships);
  };

  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInternships = filteredInternships.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className={styles.container}>
      <Aside />
      <main className={styles.mainContent}>
        <div className={styles.searchBar}>
          <h1>Internship Search</h1>
          <p>Search for your desired job matching your skills</p>
          <div className={styles.inputs}>
            <input
              type="text"
              placeholder="Enter Internship title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        <div className={styles.dailyUsage}>
          <p>You've used {applicationsToday}/10 applications today.</p>
        </div>

        <div className={styles.resultsSection}>
          <aside className={styles.filterSection}>
            <div className={styles.filterHeader}>
              <h2>Filter</h2>
              <button className={styles.clearBtn} onClick={clearFilters}>
                Clear
              </button>
            </div>

            <div className={styles.recommendedFilter}>
              <label className={styles.recommendedLabel}>
                <input
                  type="checkbox"
                  checked={showRecommended}
                  onChange={(e) => setShowRecommended(e.target.checked)}
                />
                <span className={styles.recommendedIcon}>🔎</span>
                Show only recommended for me
              </label>
            </div>

            {/* Internship Type filters */}
            <div className={styles.filterGroup}>
              <h3>Internship Type</h3>
              <ul>
                <li>
                  <input
                    type="checkbox"
                    id="backend"
                    checked={internshipTypes.includes("backend")}
                    onChange={() => handleTypeFilterChange("backend")}
                  />
                  <label htmlFor="backend">Back-End</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    id="frontend"
                    checked={internshipTypes.includes("frontend")}
                    onChange={() => handleTypeFilterChange("frontend")}
                  />
                  <label htmlFor="frontend">Front-End</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    id="fullstack"
                    checked={internshipTypes.includes("fullstack")}
                    onChange={() => handleTypeFilterChange("fullstack")}
                  />
                  <label htmlFor="fullstack">Full-Stack</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    id="mobile"
                    checked={internshipTypes.includes("mobile")}
                    onChange={() => handleTypeFilterChange("mobile")}
                  />
                  <label htmlFor="mobile">Mobile Development</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    id="design"
                    checked={internshipTypes.includes("design")}
                    onChange={() => handleTypeFilterChange("design")}
                  />
                  <label htmlFor="design">UI/UX Design</label>
                </li>
              </ul>
            </div>

            {/* Work Mode filters */}
            <div className={styles.filterGroup}>
              <h3>Work Mode</h3>
              <ul>
                <li>
                  <input
                    type="checkbox"
                    id="onsite"
                    checked={workModes.includes("onsite")}
                    onChange={() => handleModeFilterChange("onsite")}
                  />
                  <label htmlFor="onsite">On-Site</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    id="remote"
                    checked={workModes.includes("remote")}
                    onChange={() => handleModeFilterChange("remote")}
                  />
                  <label htmlFor="remote">Remote</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    id="hybrid"
                    checked={workModes.includes("hybrid")}
                    onChange={() => handleModeFilterChange("hybrid")}
                  />
                  <label htmlFor="hybrid">Hybrid</label>
                </li>
              </ul>
            </div>
          </aside>

          <main className={styles.results}>
            <div className={styles.header}>
              <h2>All internships ({filteredInternships.length})</h2>
              <select
                aria-label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <div className={styles.cards}>
              {currentInternships.map((internship) => (
                <InternshipCard
                  key={internship.internship_id}
                  internshipId={internship.internship_id}
                  title={internship.title}
                  company={internship.company}
                  location={internship.location}
                  companyIcon={companyIcon}
                  companyId={internship.company_id}
                  isRecommended={internship.isRecommended}
                  isAlreadyApplied={appliedIds.has(internship.internship_id)}
                  setApplicationsToday={setApplicationsToday}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </main>
        </div>
      </main>
    </div>
  );
};

export default InternshipSearch;
