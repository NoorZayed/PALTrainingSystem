import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../css/InternshipDetails.module.css';
import Aside from '../Navbar/studentAside';
import { API_BASE_URL } from '../utils/apiUtils';

interface InternshipDetail {
  internship_id: number;
  title: string;
  description: string | null;
  company_name: string;
  location: string;
  duration: string;
  type: string;
  start_date: string;
  end_date: string;
  company_id: number;
//   profile_image: string | null;
}

const InternshipDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<InternshipDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  
  const studentId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        setLoading(true);
        // Get the internship details
        const response = await axios.get(`${API_BASE_URL}/api/internships/${id}/details`);
        setInternship(response.data);
        
        // Check if student has already applied
        if (studentId) {
          try {
            const appliedResponse = await axios.get(`${API_BASE_URL}/api/applications/${studentId}`);
            const hasApplied = appliedResponse.data.some((app: any) => 
              app.internship_id === parseInt(id as string)
            );
            setIsApplied(hasApplied);
          } catch (err) {
            console.log("Error checking application status:", err);
          }
          
          // Check if student has saved this internship
          try {
            const savedResponse = await axios.get(`${API_BASE_URL}/api/students/${studentId}/saved-internships`);
            const isSavedInternship = savedResponse.data.some((saved: any) => 
              saved.internship_id === parseInt(id as string)
            );
            setIsSaved(isSavedInternship);
          } catch (err) {
            console.log("Error checking saved status:", err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching internship details:', err);
        setError('Failed to load internship details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInternshipDetails();
    }
  }, [id, studentId]);

  const handleApply = async () => {
    if (!studentId) {
      alert('Please log in to apply for internships.');
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/api/applications`, {
        student_id: studentId,
        internship_id: id,
        message: ''
      });
      setIsApplied(true);
      alert('Application submitted successfully!');
    } catch (err: any) {
      if (err.response?.status === 429) {
        alert('You have reached the maximum number of applications for today.');
      } else {
        alert('Failed to submit application. Please try again later.');
      }
    }
  };

  const handleSave = async () => {
    if (!studentId) {
      alert('Please log in to save internships.');
      return;
    }
    
    try {
      if (!isSaved) {
        await axios.post(`${API_BASE_URL}/api/students/${studentId}/save`, {
          internshipId: parseInt(id as string)
        });
        setIsSaved(true);
        alert('Internship saved successfully!');
      } else {
        await axios.delete(`${API_BASE_URL}/api/students/${studentId}/saved-internships/${id}`);
        setIsSaved(false);
        alert('Internship removed from saved list.');
      }
    } catch (err) {
      alert('Failed to update saved internships. Please try again later.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Aside />
        <main className={styles.mainContent}>
          <div className={styles.loading}>Loading internship details...</div>
        </main>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className={styles.container}>
        <Aside />
        <main className={styles.mainContent}>
          <div className={styles.error}>
            {error || 'Internship not found.'}
            <button onClick={() => navigate('/internships')} className={styles.backButton}>
              Back to Internships
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Aside />
      <main className={styles.mainContent}>
        <div className={styles.detailsHeader}>
          <button onClick={() => navigate('/internships')} className={styles.backButton}>
            ← Back to Internships
          </button>
        </div>
        
        <div className={styles.detailsCard}>
          <div className={styles.headerSection}>
            <div className={styles.titleSection}>
              <h1 className={styles.internshipTitle}>{internship.title}</h1>
              <div className={styles.companyInfo}>
                <span className={styles.companyName}>{internship.company_name}</span>
                <span className={styles.locationBadge}>{internship.location}</span>
                <span className={styles.modeBadge}>{internship.type || 'On-site'}</span>
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                onClick={handleApply} 
                className={`${styles.applyButton} ${isApplied ? styles.applied : ''}`}
                disabled={isApplied}
              >
                {isApplied ? 'Applied' : 'Apply Now'}
              </button>
              
              <button 
                onClick={handleSave} 
                className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
              >
                {isSaved ? 'Saved' : 'Save for Later'}
              </button>
            </div>
          </div>
          
          <div className={styles.detailsSection}>
            <div className={styles.detailItem}>
              <h3>Duration</h3>
              <p>{internship.duration || 'Not specified'}</p>
            </div>
            
            <div className={styles.detailItem}>
              <h3>Start Date</h3>
              <p>{formatDate(internship.start_date)}</p>
            </div>
            
            <div className={styles.detailItem}>
              <h3>End Date</h3>
              <p>{formatDate(internship.end_date)}</p>
            </div>
            
            <div className={styles.detailItem}>
              <h3>Work Mode</h3>
              <p>{internship.type || 'On-site'}</p>
            </div>
          </div>
          
          <div className={styles.descriptionSection}>
            <h2>Description</h2>
            <p>{internship.description || 'No description provided for this internship.'}</p>
          </div>
          
          <div className={styles.companySection}>
            <h2>About the Company</h2>
            <div className={styles.companyCard}>
              {/* {internship.profile_image && (
                <img 
                  src={`${API_BASE_URL}/uploads/${internship.profile_image}`} 
                  alt={`${internship.company_name} logo`} 
                  className={styles.companyLogo}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/default-company.png';
                  }}
                />
              )} */}
              <div className={styles.companyDetails}>
                <h3>{internship.company_name}</h3>
                <button 
                  onClick={() => navigate(`/company/${internship.company_id}`)}
                  className={styles.viewCompanyButton}
                >
                  View Company Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InternshipDetails;