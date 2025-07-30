import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../css/Chart.module.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { API_BASE_URL } from '../../utils/apiUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ApplicationStatsProps {
  dateRange: string;
}

interface ApplicationStat {
  status: string;
  count: number;
}

interface MajorStat {
  major: string;
  count: number;
}

const ApplicationStats: React.FC<ApplicationStatsProps> = ({ dateRange }) => {
  const chartRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<ApplicationStat[]>([]);
  const [majorData, setMajorData] = useState<MajorStat[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try fetching applications from the database
      console.log('Fetching application data...');
      
      // First attempt to get applications data
      try {
        const appsResponse = await axios.get(`${API_BASE_URL}/api/applications`, { 
          timeout: 8000,
          params: { all: true } 
        });
        
        if (appsResponse.data && Array.isArray(appsResponse.data)) {
          // Process application status statistics
          const statusCounts: Record<string, number> = {};
          appsResponse.data.forEach((app: any) => {
            const status = app.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          
          // Convert to array format
          const statusStats = Object.keys(statusCounts).map(status => ({
            status,
            count: statusCounts[status]
          }));
          
          setApplicationData(statusStats);
        }
      } catch (e) {
        console.log('Could not fetch applications, using sample data');
        // Use sample data if API call fails
        setApplicationData([
          { status: 'pending', count: 12 },
          { status: 'accepted', count: 8 },
          { status: 'rejected', count: 3 }
        ]);
      }
      
      // Then try to get student major statistics
      try {
        const studentsResponse = await axios.get(`${API_BASE_URL}/api/students-with-email`, { timeout: 8000 });
        
        if (studentsResponse.data && Array.isArray(studentsResponse.data)) {
          // Group by major
          const majorCounts: Record<string, number> = {};
          studentsResponse.data.forEach((student: any) => {
            if (student.major) {
              majorCounts[student.major] = (majorCounts[student.major] || 0) + 1;
            }
          });
          
          // Convert to array and sort by count
          const majorStats = Object.keys(majorCounts)
            .map(major => ({ major, count: majorCounts[major] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 majors
            
          setMajorData(majorStats);
        }
      } catch (e) {
        console.log('Could not fetch students, using sample data');
        // Use sample data if API call fails
        setMajorData([
          { major: 'Computer Science', count: 15 },
          { major: 'Engineering', count: 10 },
          { major: 'Business', count: 8 },
          { major: 'Health Sciences', count: 6 },
          { major: 'Arts', count: 4 }
        ]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in ApplicationStats:', err);
      setError('Failed to load application statistics');
      
      // Set fallback data even when errors occur
      setApplicationData([
        { status: 'pending', count: 12 },
        { status: 'accepted', count: 8 },
        { status: 'rejected', count: 3 }
      ]);
      
      setMajorData([
        { major: 'Computer Science', count: 15 },
        { major: 'Engineering', count: 10 },
        { major: 'Business', count: 8 },
        { major: 'Health Sciences', count: 6 },
        { major: 'Arts', count: 4 }
      ]);
      
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    return () => {
      if (chartRef.current) {
        (chartRef.current as any).destroy();
      }
    };
  }, [dateRange]);

  // If we're still loading, show a placeholder
  if (loading) {
    return (
      <div className={styles.card}>
        <h4>Application Statistics</h4>
        <div className={`${styles.chartContainer} ${styles.loading}`}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading application data...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show error message with retry option
  if (error) {
    return (
      <div className={styles.card}>
        <h4>Application Statistics</h4>
        <div className={`${styles.chartContainer} ${styles.error}`}>
          <div className={styles.errorMessage}>
            <div className={styles.errorIcon}>⚠️</div>
            <p>{error}</p>
            <button 
              className={styles.retryButton} 
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchData();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no data is available, show a message
  if (applicationData.length === 0 && majorData.length === 0) {
    return (
      <div className={styles.card}>
        <h4>Application Statistics</h4>
        <div className={`${styles.chartContainer} ${styles.error}`}>
          <div className={styles.errorMessage}>
            <div className={styles.errorIcon}>ℹ️</div>
            <p>No application data available for the selected period</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Color mapping for status
  const statusColors = {
    'pending': 'rgba(255, 159, 64, 0.8)',  // Orange
    'accepted': 'rgba(75, 192, 192, 0.8)',  // Green
    'rejected': 'rgba(255, 99, 132, 0.8)'   // Red
  };
  
  // Application status data
  const statusData = {
    labels: applicationData.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
    datasets: [
      {
        data: applicationData.map(item => item.count),
        backgroundColor: applicationData.map(item => 
          (statusColors as any)[item.status] || 'rgba(153, 102, 255, 0.8)'
        ),
        borderWidth: 1,
      }
    ],
  };
  
  // Major distribution data
  const majorData2 = {
    labels: majorData.map(item => item.major),
    datasets: [
      {
        label: 'Student Count',
        data: majorData.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderWidth: 1,
      }
    ],
  };

  // Chart options for application status pie chart
  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Application Status Distribution',
        padding: 8,
      },
      tooltip: {
        padding: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
  };
  
  // Chart options for major distribution bar chart
  const majorOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Student Majors',
        padding: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
        ticks: {
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
        },
      },
    },
    indexAxis: 'y' as const, // Horizontal bar chart
  };

  return (
    <div className={styles.card}>
      <h4>Application Statistics</h4>
      <div className={styles.chartContainer} style={{ height: '220px', marginBottom: '20px' }}>
        <Pie data={statusData} options={statusOptions} ref={chartRef} />
      </div>
      <div className={styles.chartContainer} style={{ height: '220px' }}>
        <Bar data={majorData2} options={majorOptions} />
      </div>
    </div>
  );
};

export default ApplicationStats;