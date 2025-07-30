import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../css/StudentDashboard.module.css';

const QuickActions = () => {
  const navigate = useNavigate();

  // Handle navigation for different actions
  const handleAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>⚙️ Quick Actions</h3>
      <div className={styles.quickActionsList}>
        <button 
          className={styles.quickActionButton}
          onClick={() => handleAction('/internships')}
        >
          <i className="fas fa-search"></i> Find Internships
        </button>
        <button 
          className={styles.quickActionButton}
          onClick={() => handleAction('/student/EditStudentProfile')}
        >
          <i className="fas fa-user-edit"></i> Update Profile
        </button>
        <button 
          className={styles.quickActionButton}
          onClick={() => handleAction('/student/Report')}
        >
          <i className="fas fa-file-alt"></i> Submit Report
        </button>
        <button 
          className={styles.quickActionButton}
          onClick={() => handleAction('/student/messages')}
        >
          <i className="fas fa-envelope"></i> Messages
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
