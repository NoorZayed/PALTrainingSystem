// src/components/TodayAbsent.tsx
import React from 'react';
import styles from '../../css/TodayAbsent.module.css';

const absentees = [
  {
    name: 'Martin Lewis',
    position: 'Creative Studio',
    date: '4 Sep 2025',
    status: 'Pending',
    avatar: '/avatars/user1.jpg',
  },
  {
    name: 'Sofia Annisa',
    position: 'Content Strategist',
    date: '3 Sep 2025',
    status: 'Approved',
    avatar: '/avatars/user2.jpg',
  },
  {
    name: 'Shaikh Ramzi',
    position: 'Creative Director',
    date: '2 Sep 2025',
    status: 'Approved',
    avatar: '/avatars/user3.jpg',
  },
];

const TodayAbsent: React.FC = () => {
  return (
    <div className={styles.card}>
      <h4>Today Absent</h4>
      {absentees.map((user, i) => (
        <div key={i} className={styles.item}>
          <div className={styles.details}>
            <h5>{user.name}</h5>
            <p>{user.position}</p>
            <span>{user.date}</span>
          </div>
          <span
            className={`${styles.status} ${
              user.status === 'Approved' ? styles.approved : styles.pending
            }`}
          >
            {user.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TodayAbsent;
