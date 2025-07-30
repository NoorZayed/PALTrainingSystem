import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiUtils';
import styles from '../../css/StudentDashboard.module.css';

interface Internship {
  title: string;
  internship_type: string;
  start_date: string;
  end_date: string;
  company_name: string;
  supervisor_name?: string;
  co_supervisor_name?: string;
  status?: string;
}

const TrainingProgressCard = () => {
  const [currentInternship, setCurrentInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchCurrentInternship = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const studentId = userData?.id;
        
        if (!studentId) {
          setLoading(false);
          return;
        }
        
        // First try the active-internship endpoint
        try {
          const response = await axios.get(`${API_BASE_URL}/api/student/${studentId}/active-internship`);
          if (response.data) {
            setCurrentInternship(response.data);
            calculateProgress(response.data.start_date, response.data.end_date);
            setLoading(false);
            return;
          }
        } catch (activeErr) {
          console.log("Active internship endpoint failed, trying applications endpoint");
        }
        
        // If active-internship endpoint fails, try applications to find accepted internship
        const applicationsRes = await axios.get(`${API_BASE_URL}/api/applications/${studentId}`);
        const activeApplication = applicationsRes.data?.find((app: any) => 
          app.status === 'accepted' || app.status === 'active'
        );
        
        if (activeApplication) {
          setCurrentInternship({
            title: activeApplication.title,
            internship_type: activeApplication.type || 'Internship',
            start_date: activeApplication.start_date,
            end_date: activeApplication.end_date,
            company_name: activeApplication.company_name,
            status: activeApplication.status
          });
          calculateProgress(activeApplication.start_date, activeApplication.end_date);
        } else {
          setCurrentInternship(null);
        }
      } catch (err) {
        console.error("Failed to fetch current internship:", err);
        setError("Failed to load current internship data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentInternship();
  }, []);

  const calculateProgress = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const today = new Date().getTime();
      
      if (today <= start) {
        setPercentage(0);
      } else if (today >= end) {
        setPercentage(100);
      } else {
        const total = end - start;
        const elapsed = today - start;
        const calculated = Math.round((elapsed / total) * 100);
        setPercentage(calculated);
      }
    } catch (err) {
      console.error("Date calculation error:", err);
      setPercentage(0);
    }
  };

  const getStatusMessage = () => {
    if (!currentInternship) return 'No active internship';
    if (percentage === 0) return 'Not started yet';
    if (percentage === 100) return 'Completed!';
    if (percentage < 25) return 'Just getting started';
    if (percentage < 50) return 'Making progress';
    if (percentage < 75) return 'More than halfway!';
    return 'Almost there!';
  };

  const getFeedbackMessage = () => {
    if (!currentInternship) return 'Apply to internships to start your journey';
    if (percentage === 0) return 'Prepare for your upcoming internship';
    if (percentage === 100) return 'Waiting for final evaluation';
    if (percentage < 50) return 'Keep up the good work!';
    return 'The finish line is in sight!';
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>🎯 Training Progress</h3>
      
      {loading ? (
        <div className={styles.loadingState}>Loading progress...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : !currentInternship ? (
        <p className={styles.emptyState}>No active internship found. Apply to start your journey!</p>
      ) : (
        <div className={styles.trainingProgressContent}>
          <div className={styles.progressCircle}>
            <CircularProgressbar
              value={percentage}
              text={`${percentage}%`}
              styles={buildStyles({
                textSize: '18px',
                pathColor: percentage === 100 ? '#22c55e' : '#3b82f6',
                textColor: '#1f2937',
                trailColor: '#d1d5db',
              })}
            />
          </div>
          <div className={styles.trainingStatus}>
            <p className={styles.statusText}>
              {getStatusMessage()}
            </p>
            <p className={styles.feedbackText}>
              {getFeedbackMessage()}
            </p>
            {currentInternship && (
              <p className={styles.internshipInfo}>
                {currentInternship.title} at {currentInternship.company_name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingProgressCard;
