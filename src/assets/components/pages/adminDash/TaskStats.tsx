// src/components/TaskStats.tsx
import React from 'react';
import styles from '../../css/TaskStats.module.css';

interface TaskStatsProps {
  stats: {
    completed: number;
    total: number;
    pending: number;
  };
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const completionRate = Math.round((stats.completed / stats.total) * 100);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Task Stats</h3>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Total Tasks</span>
          <span className={styles.value}>{stats.total}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Completed</span>
          <span className={styles.value}>{stats.completed}</span>
          <span className={styles.percentage}>{completionRate}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Pending</span>
          <span className={styles.value}>{stats.pending}</span>
          <span className={styles.percentage}>{Math.round((stats.pending / stats.total) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
