// src/components/AbsentStats.tsx
import React, { useState, useEffect } from 'react';
import styles from '../../css/AbsentStats.module.scss';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiUtils';

interface AbsentStatsProps {
  stats: {
    total: number;
    absent: number;
    present: number;
  };
}

interface AbsentStudent {
  id: string;
  name: string;
  reason: string;
  date: string;
}

const AbsentStats: React.FC<AbsentStatsProps> = ({ stats }) => {
  const [showAbsentList, setShowAbsentList] = useState(false);
  
  const presentPercentage = Math.round((stats.present / stats.total) * 100) || 0;
  const absentPercentage = Math.round((stats.absent / stats.total) * 100) || 0;
  const attendanceRate = Math.round((stats.present / stats.total) * 100) || 0;

  // For a real implementation, we'd fetch this data from the API
  const [absentStudents, setAbsentStudents] = useState<AbsentStudent[]>([]);
  const [absentLoading, setAbsentLoading] = useState<boolean>(false);
  const [absentError, setAbsentError] = useState<string | null>(null);

  // Fetch absent students from the database
  const fetchAbsentStudents = async () => {
    try {
      setAbsentLoading(true);
      setAbsentError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/absences/today`, { timeout: 8000 });
      
      if (response.data && Array.isArray(response.data)) {
        const absenceData = response.data.map((absence: any) => ({
          id: absence.student_id,
          name: `${absence.first_name} ${absence.last_name}`,
          reason: absence.reason || 'Not specified',
          date: new Date(absence.date).toLocaleDateString()
        }));
        
        setAbsentStudents(absenceData);
      } else {
        setAbsentError('Invalid data format received from the server');
      }
      
      setAbsentLoading(false);
    } catch (error) {
      console.error('Error fetching absent students:', error);
      setAbsentError('Failed to load absent students data from the database');
      setAbsentLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAbsentStudents();
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Attendance Overview</h3>
          <div className={styles.dateRange}>Today's Report</div>
        </div>
        <div className={styles.attendanceRate}>
          <div className={styles.rateCircle}>
            <span className={styles.rateValue}>{attendanceRate}%</span>
            <span className={styles.rateLabel}>Attendance Rate</span>
          </div>
        </div>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <span className={styles.label}>Total Students</span>
          <span className={styles.value}>{stats.total}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Present</span>
          <span className={styles.value}>{stats.present}</span>
          <span className={`${styles.percentage} ${styles.positive}`}>
            {presentPercentage}%
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Absent</span>
          <span className={styles.value}>{stats.absent}</span>
          <span className={`${styles.percentage} ${styles.negative}`}>
            {absentPercentage}%
          </span>
        </div>
      </div>

      <div className={styles.absentListSection}>
        <div className={styles.absentListHeader}>
          <h4>Absent Students Today ({stats.absent})</h4>
          <button 
            className={styles.toggleButton}
            onClick={() => setShowAbsentList(!showAbsentList)}
          >
            {showAbsentList ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        {showAbsentList && (
          <div className={styles.absentList}>
            {absentLoading ? (
              <div className={styles.loading}>Loading absent students data...</div>
            ) : absentError ? (
              <div className={styles.error}>
                {absentError}
                <button 
                  className={styles.retryButton}
                  onClick={() => fetchAbsentStudents()}
                >
                  Retry
                </button>
              </div>
            ) : absentStudents.length > 0 ? (
              absentStudents.map((student) => (
                <div key={student.id} className={styles.absentStudent}>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>{student.name}</span>
                    <span className={styles.studentReason}>{student.reason}</span>
                  </div>
                  <span className={styles.studentDate}>{student.date}</span>
                </div>
              ))
            ) : (
              <div className={styles.noAbsentStudents}>
                No absent students today
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewDetailsBtn}>
          View Full Attendance Report
        </button>
      </div>
    </div>
  );
};

export default AbsentStats;