import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiUtils';
import styles from '../../css/StudentDashboard.module.css';

interface Absence {
  date: string;
  reason: string;
}

const AttendanceCard = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const studentId = userData?.id;
        
        if (!studentId) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/student/${studentId}/absences`);
        setAbsences(response.data || []);
      } catch (err) {
        console.error("Failed to fetch absences:", err);
        setError("Failed to load attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, []);

  const absentCount = absences.length;
  const recentAbsence = absences.length > 0 
    ? new Date(absences[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>📅 Attendance</h3>
      
      {loading ? (
        <div className={styles.loadingState}>Loading attendance...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : (
        <div className={styles.attendanceContent}>
          <div className={styles.absenceCount}>
            <p className={`${styles.absents} ${absentCount > 3 ? styles.highAbsences : ''}`}>
              {absentCount}
            </p>
            <p className={styles.absentsText}>Total Absences</p>
          </div>
          
          {recentAbsence && (
            <div className={styles.recentAbsence}>
              <p className={styles.recentAbsenceLabel}>Most recent:</p>
              <p className={styles.recentAbsenceDate}>{recentAbsence}</p>
            </div>
          )}
          
          {absentCount > 0 && (
            <div className={styles.attendanceWarning}>
              {absentCount >= 3 ? (
                <p>⚠️ High absence count. Please be mindful of attendance requirements.</p>
              ) : (
                <p>Maintain good attendance for better evaluation.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;