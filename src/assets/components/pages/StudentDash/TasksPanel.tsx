import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiUtils';
import styles from '../../css/StudentDashboard.module.css';

interface Application {
  internship_id: number;
  status: string;
  title: string;
  company_name: string;
  application_date?: string;
}

const TasksPanel = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const studentId = userData?.id;
        
        if (!studentId) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/applications/${studentId}`);
        setApplications(response.data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusEmoji = (status: string) => {
    switch(status.toLowerCase()) {
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>🗂️ Applications & Tasks</h3>
      
      {loading ? (
        <div className={styles.loadingState}>Loading applications...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : applications.length === 0 ? (
        <p className={styles.emptyState}>No applications found. Apply to internships to see them here.</p>
      ) : (
        <ul className={styles.taskList}>
          {applications.map((app, i) => (
            <li key={i} className={styles.taskItem}>
              <div className={styles.taskInfo}>
                <span className={styles.taskTitle}>
                  {getStatusEmoji(app.status)} {app.title}
                </span>
                <span className={styles.taskCompany}>{app.company_name}</span>
              </div>
              <span className={styles.taskStatus}>{app.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TasksPanel;
