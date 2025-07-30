import React, { useEffect, useState } from 'react';
import styles from '../css/CompanyDashboard.module.css';
import CompanyAside from '../Navbar/CompanyAside';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

import { API_BASE_URL } from '../utils/apiUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const COMPANY_ID = 1; // TODO: Replace with dynamic company ID from auth/session

const CompanyDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    totalApplications: 0,
    acceptedStudents: 0,
    applicationsOverTime: [],
    topMajors: []
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const endpoints = [
        `${API_BASE_URL}/api/company/${COMPANY_ID}/total-internships`,
        `${API_BASE_URL}/api/company/${COMPANY_ID}/active-internships`,
        `${API_BASE_URL}/api/company/${COMPANY_ID}/total-applications`,
        `${API_BASE_URL}/api/company/${COMPANY_ID}/accepted-students`,
        `${API_BASE_URL}/api/company/${COMPANY_ID}/applications-over-time`,
        `${API_BASE_URL}/api/company/${COMPANY_ID}/top-majors`
      ];
      try {
        const [total, active, applications, accepted, overTime, majors] = await Promise.all(
          endpoints.map(url => fetch(url).then(r => r.json()))
        );
        setStats({
          totalInternships: total.total,
          activeInternships: active.active,
          totalApplications: applications.total,
          acceptedStudents: accepted.accepted,
          applicationsOverTime: overTime.reverse(), // oldest to newest
          topMajors: majors
        });
        // Fetch recent applications for the company
        const recentApps = await fetch(`${API_BASE_URL}/api/applications/company/${COMPANY_ID}`).then(r => r.json());
        setRecentApplications(recentApps.slice(0, 5)); // Show only 5 most recent
      } catch (e) {
        // handle error
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Chart data
  const barData = {
    labels: stats.applicationsOverTime.map((d: any) => d.month),
    datasets: [
      {
        label: 'Applications',
        data: stats.applicationsOverTime.map((d: any) => d.applications),
        backgroundColor: '#4e73df',
      },
    ],
  };
  const pieData = {
    labels: stats.topMajors.map((m: any) => m.major),
    datasets: [
      {
        data: stats.topMajors.map((m: any) => m.count),
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
      },
    ],
  };

  return (
    <div className={styles.dashboardContainer}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <h2>Welcome, Company</h2>
        <p>Here's a quick overview of your internship activity.</p>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Internships</h3>
            <p>{loading ? '...' : stats.totalInternships}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active Internships</h3>
            <p>{loading ? '...' : stats.activeInternships}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Applications Received</h3>
            <p>{loading ? '...' : stats.totalApplications}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Students Accepted</h3>
            <p>{loading ? '...' : stats.acceptedStudents}</p>
          </div>
        </div>
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <h4>Applications Over Time</h4>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className={styles.tableSection}>
          <h3>Recent Applications</h3>
          <table className={styles.appTable}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Internship</th>
                <th>Status</th>
               
              </tr>
            </thead>
            <tbody>
              {recentApplications.length === 0 && (
                <tr><td colSpan={4}>No recent applications</td></tr>
              )}
              {recentApplications.map((app, idx) => (
                <tr key={idx}>
                  <td>
                    <div className={styles.studentCell}>
                      {app.profile_image && <img src={app.profile_image} alt="profile" className={styles.avatar} />}
                      {app.first_name} {app.last_name}
                    </div>
                  </td>
                  <td>{app.internship_title}</td>
                  <td>
                    <span className={
                      app.status === 'accepted' ? styles.statusAccepted :
                      app.status === 'pending' ? styles.statusPending :
                      styles.statusRejected
                    }>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
