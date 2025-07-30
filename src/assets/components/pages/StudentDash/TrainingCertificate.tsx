import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiUtils';
import styles from '../../css/StudentDashboard.module.css';

interface Certificate {
  internship_id: number;
  title: string;
  company_name: string;
  start_date: string;
  end_date: string;
  isCompleted: boolean;
  completionPercentage: number;
  certificateUrl?: string;
  grade?: string;
}

interface TrainingCertificatesProps {
  certificates?: Certificate[];
  showAll?: boolean; // If true, show all; else show only a few
}

const TrainingCertificates: React.FC<TrainingCertificatesProps> = ({
  certificates: propCertificates,
  showAll = false,
}) => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>(propCertificates || []);
  const [loading, setLoading] = useState<boolean>(!propCertificates);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If certificates are provided via props, use those
    if (propCertificates && propCertificates.length > 0) {
      setCertificates(propCertificates);
      return;
    }

    const fetchCompletedInternships = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const studentId = userData?.id;
        
        if (!studentId) {
          setLoading(false);
          return;
        }
        
        // Fetch all applications from the student
        const response = await axios.get(`${API_BASE_URL}/api/applications/${studentId}`);
        
        // Filter for completed internships
        const completedInternships = response.data
          .filter((app: any) => app.status === 'completed')
          .map((app: any) => {
            // Calculate progress for each completed internship
            const isCompleted = new Date() > new Date(app.end_date);
            
            return {
              internship_id: app.internship_id,
              title: app.title,
              company_name: app.company_name,
              start_date: app.start_date,
              end_date: app.end_date,
              isCompleted: isCompleted,
              completionPercentage: isCompleted ? 100 : 
                calculateProgress(app.start_date, app.end_date),
              grade: app.grade || null
            };
          });
          
        setCertificates(completedInternships);
      } catch (err) {
        console.error("Failed to fetch completed internships:", err);
        setError("Failed to load certificate data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedInternships();
  }, [propCertificates]);

  const calculateProgress = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const today = new Date().getTime();
      
      if (today <= start) return 0;
      if (today >= end) return 100;
      
      const total = end - start;
      const elapsed = today - start;
      return Math.round((elapsed / total) * 100);
    } catch (err) {
      return 0;
    }
  };

  // Only show a subset if not showing all
  const visibleCertificates = showAll ? certificates : certificates.slice(0, 2);

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        {showAll ? '📄 All Your Training Certificates' : '🎓 Your Training Certificates'}
      </h3>

      {loading ? (
        <div className={styles.loadingState}>Loading certificates...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : certificates.length === 0 ? (
        <p className={styles.emptyState}>
          You have not completed any trainings yet. Keep going!
        </p>
      ) : (
        <>
          <div className={styles.certificatesGrid}>
            {visibleCertificates.map((certificate, index) => (
              <div key={index} className={styles.certificateCard}>
                <h4 className={styles.certificateTitle}>
                  {certificate.title} - {certificate.company_name}
                </h4>

                <div className={styles.progressContainer}>
                  <p className={styles.progressText}>
                    Progress: {certificate.completionPercentage}%
                  </p>
                  <div className={styles.progressBackground}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${certificate.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {certificate.isCompleted ? (
                  <div className={styles.completionSection}>
                    <p className={styles.successMessage}>
                      🎉 Congratulations! Your certificate is ready.
                    </p>
                    {certificate.grade && (
                      <p className={styles.certificateGrade}>
                        Final Grade: <span>{certificate.grade}</span>
                      </p>
                    )}
                    {certificate.certificateUrl ? (
                      <a
                        href={certificate.certificateUrl}
                        download
                        className={styles.downloadLink}
                      >
                        Download Certificate
                      </a>
                    ) : (
                      <button className={styles.downloadLink} disabled>
                        Request Certificate
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.inProgressSection}>
                    <p className={styles.warningMessage}>
                      ⏳ Training still in progress...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showAll && certificates.length > 2 && (
            <div className={styles.seeMoreWrapper}>
              <button
                onClick={() => navigate('/certifications')}
                className={styles.seeMoreButton}
              >
                See More Certificates →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrainingCertificates;
