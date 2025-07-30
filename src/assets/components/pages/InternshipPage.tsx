import React, { useState } from 'react';
import styles from '../css/InternshipPage.module.css';

interface Internship {
  id: string;
  company: string;
  role: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  matchScore: number;
  logo?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary?: string;
  postedDate: string;
}

const InternshipPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: [] as string[],
    location: [] as string[],
    experience: [] as string[]
  });

  // Mock data - replace with actual data from your backend
  const recommendedInternships: Internship[] = [
    {
      id: '1',
      company: 'Google',
      role: 'Frontend Developer Intern',
      location: 'Mountain View, CA',
      type: 'hybrid',
      matchScore: 95,
      logo: 'https://logo.clearbit.com/google.com',
      description: 'Join our team to build the next generation of web applications...',
      requirements: ['React', 'TypeScript', 'CSS'],
      benefits: ['Competitive salary', 'Health insurance', '401k'],
      salary: '$45-55/hour',
      postedDate: '2024-03-15'
    },
    // Add more mock internships...
  ];

  return (
    <div className={styles.internshipPage}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1>Find Your Perfect Internship</h1>
        <p>Discover opportunities that match your skills and interests</p>
        
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by role, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.searchButton}>
            <span className={styles.searchIcon}>🔍</span>
            Search
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Filters Sidebar */}
        <aside className={styles.filtersSidebar}>
          <div className={styles.filterSection}>
            <h3>Work Type</h3>
            <div className={styles.filterOptions}>
              {['Remote', 'On-site', 'Hybrid'].map(type => (
                <label key={type} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.type.includes(type.toLowerCase())}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...selectedFilters.type, type.toLowerCase()]
                        : selectedFilters.type.filter(t => t !== type.toLowerCase());
                      setSelectedFilters({ ...selectedFilters, type: newTypes });
                    }}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3>Experience Level</h3>
            <div className={styles.filterOptions}>
              {['Entry Level', 'Intermediate', 'Advanced'].map(level => (
                <label key={level} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.experience.includes(level.toLowerCase())}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...selectedFilters.experience, level.toLowerCase()]
                        : selectedFilters.experience.filter(l => l !== level.toLowerCase());
                      setSelectedFilters({ ...selectedFilters, experience: newLevels });
                    }}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </div>

          <button className={styles.clearFiltersButton}>
            Clear All Filters
          </button>
        </aside>

        {/* Internship Listings */}
        <main className={styles.internshipListings}>
          <div className={styles.listingsHeader}>
            <h2>Recommended for You</h2>
            <div className={styles.sortOptions}>
              <select 
                className={styles.sortSelect}
                aria-label="Sort internships by"
              >
                <option value="match">Best Match</option>
                <option value="recent">Most Recent</option>
                <option value="salary">Salary</option>
              </select>
            </div>
          </div>

          <div className={styles.internshipGrid}>
            {recommendedInternships.map(internship => (
              <div key={internship.id} className={styles.internshipCard}>
                <div className={styles.cardHeader}>
                  {internship.logo && (
                    <img 
                      src={internship.logo} 
                      alt={internship.company}
                      className={styles.companyLogo}
                    />
                  )}
                  <div className={styles.matchScore}>
                    <span className={styles.score}>{internship.matchScore}%</span>
                    <span className={styles.matchLabel}>Match</span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.roleTitle}>{internship.role}</h3>
                  <h4 className={styles.companyName}>{internship.company}</h4>
                  
                  <div className={styles.details}>
                    <span className={styles.location}>
                      📍 {internship.location}
                    </span>
                    <span className={styles.type}>
                      💼 {internship.type}
                    </span>
                    {internship.salary && (
                      <span className={styles.salary}>
                        💰 {internship.salary}
                      </span>
                    )}
                  </div>

                  <p className={styles.description}>
                    {internship.description}
                  </p>

                  <div className={styles.requirements}>
                    {internship.requirements.map((req, index) => (
                      <span key={index} className={styles.requirementTag}>
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.applyButton}>
                    Apply Now
                  </button>
                  <button className={styles.saveButton}>
                    <span className={styles.saveIcon}>🔖</span>
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.pageButton}>Previous</button>
            <div className={styles.pageNumbers}>
              <button className={`${styles.pageButton} ${styles.active}`}>1</button>
              <button className={styles.pageButton}>2</button>
              <button className={styles.pageButton}>3</button>
              <span className={styles.pageEllipsis}>...</span>
              <button className={styles.pageButton}>10</button>
            </div>
            <button className={styles.pageButton}>Next</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InternshipPage; 