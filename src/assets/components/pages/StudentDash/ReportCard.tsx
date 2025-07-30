import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiUtils';
import styles from '../../css/StudentDashboard.module.css';

interface Report {
  report_id: number;
  course_subject: string;
  grade: string;
  month: string;
  year: string;
  date_from: string;
  date_to: string;
  supervisor_comments?: string;
}

const ReportCard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const studentId = userData?.id;
        
        if (!studentId) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/reports/${studentId}`);
        
        // Get only the most recent reports (limit to 3)
        setReports(response.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handlePreview = (report: Report) => {
    alert(`Previewing report: ${report.course_subject} - ${report.month}/${report.year}`);
    // Could be expanded to open a modal with full report details
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>📊 Report Card</h3>
      
      {loading ? (
        <div className={styles.loadingState}>Loading reports...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : reports.length === 0 ? (
        <p className={styles.emptyState}>No reports found. Reports will appear here when your supervisor submits them.</p>
      ) : (
        <ul className={styles.reportList}>
          {reports.map((r, i) => (
            <li key={i} className={styles.reportItem}>
              <div className={styles.reportInfo}>
                <span className={styles.reportCourse}>{r.course_subject}</span>
                <span className={styles.reportGrade}>{r.grade || 'Pending'}</span>
                <span className={styles.reportDate}>{r.month}/{r.year}</span>
              </div>
              <button onClick={() => handlePreview(r)} className={styles.previewButton}>
                Preview
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportCard;
