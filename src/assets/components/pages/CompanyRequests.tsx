import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyAside from '../Navbar/CompanyAside';
import styles from '../css/CompanyPages.module.css';
import '../css/CompanyRequestsExtended.css'; // Import additional styles
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiUtils';

interface StudentProfile {
  id: number;
  name: string;
  major: string;
  location: string;
  skills: string[];
  about: string;
  interests: string[];
  email: string;
  phone: string;
  profile_image?: string;
}

interface Application {
  application_id: number;
  student_id: number;
  name: string;
  recommended: boolean;
  match_percentage?: number; // Skill match percentage
  status: 'pending' | 'accepted' | 'rejected'; // Use specific types
  application_date?: string;
}

interface Internship {
  id: number;
  title: string;
  requests: Application[];
}

type FilterState = Record<number, 'all' | 'top10'>;

const CompanyRequests: React.FC = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [showCV, setShowCV] = useState<StudentProfile | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
  const [page, setPage] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const REQUESTS_PER_PAGE = 5;

  // Get companyId from localStorage or context
  const companyId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  // Fetch internships and applications
  const fetchInternships = () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    axios.get(`${API_BASE_URL}/api/internships/company/${companyId}`)
      .then(async (res) => {
        const internshipsData = await Promise.all(res.data.map(async (intern: any) => {
          const appsRes = await axios.get(`${API_BASE_URL}/api/applications/internship/${intern.id}`);
          const requests = appsRes.data.map((app: any) => ({
            application_id: app.application_id,
            student_id: app.student_id,
            name: app.first_name && app.last_name ? app.first_name + ' ' + app.last_name : 'Unknown',
            recommended: app.match_percentage ? app.match_percentage > 80 : false,
            match_percentage: app.match_percentage || 0,
            status: app.status,
            application_date: app.application_date
          }));
          return {
            id: intern.id,
            title: intern.title,
            requests
          };
        }));
        setInternships(internshipsData);
        
        // Debug information
        console.log("[DEBUG] Fetched internships data:", internshipsData.map(i => ({
          id: i.id,
          title: i.title,
          requestCount: i.requests.length,
          matchPercentages: i.requests.map((r: any) => r.match_percentage)
        })));
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError('Error fetching company internships or applications.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInternships();
  }, [companyId]);

  const handleFilterChange = (internshipId: number, value: 'all' | 'top10') => {
    setFilters((prev) => ({ ...prev, [internshipId]: value }));
    setPage((prev) => ({ ...prev, [internshipId]: 1 }));
  };
  const handleCollapse = (internshipId: number) => {
    setCollapsed((prev) => ({ ...prev, [internshipId]: !prev[internshipId] }));
  };
  const handleSearchChange = (internshipId: number, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [internshipId]: value }));
    setPage((prev) => ({ ...prev, [internshipId]: 1 }));
  };
  const handlePageChange = (internshipId: number, newPage: number) => {
    setPage((prev) => ({ ...prev, [internshipId]: newPage }));
  };

  // Fetch full student profile for modal
  const handleShowCV = async (student_id: number) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students/${student_id}`);
      setShowCV({
        id: res.data.student_id,
        name: res.data.first_name + ' ' + res.data.last_name,
        major: res.data.major,
        location: res.data.location,
        skills: Array.isArray(res.data.skills) ? res.data.skills : [],
        about: res.data.about,
        interests: Array.isArray(res.data.interests) ? res.data.interests : [],
        email: res.data.email,
        phone: res.data.phone,
        profile_image: res.data.profile_image,
      });
    } catch (err) {
      setShowCV(null);
      alert('Failed to load student profile.');
    }
  };

  // Function to update application status locally
  const updateApplicationStatus = (applicationId: number, newStatus: 'accepted' | 'rejected') => {
    setInternships(prevInternships =>
      prevInternships.map(internship => ({
        ...internship,
        requests: internship.requests.map(request =>
          request.application_id === applicationId
            ? { ...request, status: newStatus }
            : request
        )
      }))
    );
  };

  // Handle Accept action
  const handleAccept = async (applicationId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/api/applications/${applicationId}/accept`);
      updateApplicationStatus(applicationId, 'accepted');
      alert('Application accepted successfully!');
    } catch (err) {
      console.error("Error accepting application:", err);
      alert('Failed to accept application.');
    }
  };

  // Handle Reject action
  const handleReject = async (applicationId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/api/applications/${applicationId}/reject`);
      updateApplicationStatus(applicationId, 'rejected');
      alert('Application rejected successfully!');
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert('Failed to reject application.');
    }
  };

  return (
    <div className={styles.container}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <header>
          <h2>Company Requests</h2>
          <p>Manage student requests for each of your internships.</p>
        </header>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : internships.length === 0 ? (
          <p>No internships found for your company.</p>
        ) : (
          internships.map((internship) => {
            const filter = filters[internship.id] || 'all';
            const search = searchQueries[internship.id] || '';
            const currentPage = page[internship.id] || 1;
            let filteredRequests = internship.requests;
            
            if (filter === 'top10') {
              // Sort by match percentage and get top 10 (or all if less than 10)
              filteredRequests = [...internship.requests]
                .sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0))
                .slice(0, Math.min(10, internship.requests.length));
              
              console.log(`[DEBUG] Top 10 filter for internship ${internship.id}:`, {
                totalRequests: internship.requests.length,
                filteredCount: filteredRequests.length,
                matchPercentages: filteredRequests.map(r => r.match_percentage)
              });
            }
            // Apply search filter after other filters
            if (search) {
              filteredRequests = filteredRequests.filter((r) =>
                r.name.toLowerCase().includes(search.toLowerCase())
              );
            }
            const totalPages = Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE) || 1;
            const paginatedRequests = filteredRequests.slice(
              (currentPage - 1) * REQUESTS_PER_PAGE,
              currentPage * REQUESTS_PER_PAGE
            );
            const isCollapsed = collapsed[internship.id] ?? false;
            return (
              <section key={internship.id} className={styles.internshipCard}>
                <div className={styles.internshipHeader}>
                  <h3>{internship.title}</h3>
                  <button
                    className={styles.collapseButton}
                    onClick={() => handleCollapse(internship.id)}
                    aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                  >
                    {isCollapsed ? '+' : '–'}
                  </button>
                </div>
                {!isCollapsed && (
                  <>
                    <div className={styles.filterRow}>
                      <label htmlFor={`filter-${internship.id}`} className={styles.filterLabel}>Filter:</label>
                      <select
                        id={`filter-${internship.id}`}
                        value={filter}
                        onChange={e => handleFilterChange(internship.id, e.target.value as 'all' | 'top10')}
                        className={styles.filterSelect}
                        title="Filter requests"
                      >
                        <option value="all">All</option>
                        <option value="top10">Top 10 Skill Matches</option>
                      </select>
                      <input
                        type="text"
                        className={`${styles.searchInput} ${styles.requestSearchInput}`}
                        placeholder="Search student..."
                        value={search}
                        onChange={e => handleSearchChange(internship.id, e.target.value)}
                        aria-label="Search student by name"
                      />
                    </div>
                    {filteredRequests.length === 0 ? (
                      <p>
                        {filter === 'top10' 
                          ? `No applications found. This internship has ${internship.requests.length} total applications.`
                          : "No student requests found for this filter."
                        }
                      </p>
                    ) : (
                      <>
                        <div className={styles.requestsList}>
                          {paginatedRequests.length === 0 ? (
                            <p>No student applications for this internship.</p>
                          ) : (
                            paginatedRequests.map((req) => (
                              <div className={styles.requestItem} key={req.application_id}>
                                <h4>{req.name}</h4>
                                <p>Status: <span className={`${styles.status} ${styles[req.status]}`}>{req.status}</span></p>
                                {req.match_percentage !== undefined && (
                                  <p>
                                    Skills Match: 
                                    <span className={styles.matchPercentage}>
                                      {req.match_percentage}%
                                      {filter === 'top10' && req.match_percentage > 80 && " 🌟"}
                                    </span>
                                    {filter === 'top10' && (
                                      <small className={styles.matchInfo}>
                                        {req.match_percentage > 80 ? " (Highly Recommended)" : 
                                         req.match_percentage > 60 ? " (Good Match)" : " (Partial Match)"}
                                      </small>
                                    )}
                                  </p>
                                )}
                                {req.application_date && (
                                  <p>Applied on: {new Date(req.application_date).toLocaleDateString()}</p>
                                )}
                                <div className={styles.requestActionsRow}>
                                  {req.status === 'pending' && (
                                    <>
                                      <button className={styles.acceptButton} onClick={() => handleAccept(req.application_id)}>Accept</button>
                                      <button className={styles.rejectButton} onClick={() => handleReject(req.application_id)}>Reject</button>
                                    </>
                                  )}
                                  <span className={styles.cvButtonRightWrapper}>
                                    <button className={styles.cvButton} onClick={() => handleShowCV(req.student_id)}>
                                      <span className={styles.cvIcon} aria-hidden="true">
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <rect x="3" y="2" width="14" height="16" rx="3" fill="#fff" stroke="#ff9800" strokeWidth="1.5"/>
                                          <rect x="6" y="6" width="8" height="1.5" rx="0.75" fill="#ff9800"/>
                                          <rect x="6" y="9" width="8" height="1.5" rx="0.75" fill="#ff9800"/>
                                          <rect x="6" y="12" width="5" height="1.5" rx="0.75" fill="#ff9800"/>
                                        </svg>
                                      </span>
                                      Show CV
                                    </button>
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {totalPages > 1 && (
                          <div className={styles.paginationRow}>
                            <button
                              className={styles.pageButton}
                              onClick={() => handlePageChange(internship.id, currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Prev
                            </button>
                            <span className={styles.pageInfo}>
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              className={styles.pageButton}
                              onClick={() => handlePageChange(internship.id, currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </section>
            );
          })
        )}
        {showCV && (
          <div className={styles.modalOverlay} onClick={() => setShowCV(null)}>
            <div
              className={styles.cvModalSmall}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cv-modal-title"
              tabIndex={-1}
              onClick={e => e.stopPropagation()}
            >
              <button
                className={styles.closeModalButton}
                onClick={() => setShowCV(null)}
                aria-label="Close CV modal"
              >
                ×
              </button>
              <img
                src={showCV.profile_image ? `/uploads/${showCV.profile_image}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(showCV.name)}&background=0a6a2a&color=fff&size=64`}
                alt="avatar"
                className={styles.avatar}
              />
              <h2 id="cv-modal-title">{showCV.name}'s CV</h2>
              <p><b>Major:</b> {showCV.major}</p>
              <p><b>Location:</b> {showCV.location}</p>
              <p><b>Email:</b> {showCV.email}</p>
              <p><b>Phone:</b> {showCV.phone}</p>
              <p><b>About:</b> {showCV.about}</p>
              <p><b>Skills:</b> {showCV.skills.join(', ')}</p>
              <p><b>Interests:</b> {showCV.interests.join(', ')}</p>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.showMoreButton}
                  onClick={() => {
                    setShowCV(null); // Close the modal first
                    navigate(`/student-profile/${showCV.id}`); // Navigate to full profile
                  }}
                >
                  Show Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyRequests;

