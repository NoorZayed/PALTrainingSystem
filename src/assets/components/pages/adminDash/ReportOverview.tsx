import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import styles from '../../css/Chart.module.css';
import { API_BASE_URL } from '../../utils/apiUtils';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ReportOverviewProps {
  dateRange: string;
}

interface ReportData {
  month: string;
  count: number;
}

// Month name mapping for consistent formatting
const monthNameMap: {[key: string]: string} = {
  'January': 'Jan',
  'February': 'Feb',
  'March': 'Mar',
  'April': 'Apr',
  'May': 'May',
  'June': 'Jun',
  'July': 'Jul',
  'August': 'Aug',
  'September': 'Sep',
  'October': 'Oct',
  'November': 'Nov',
  'December': 'Dec'
};

const ReportOverview: React.FC<ReportOverviewProps> = ({ dateRange }) => {
  const chartRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [internshipData, setInternshipData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const year = new Date().getFullYear();
      console.log('Fetching report data for year:', year);
      
      // Fetch monthly report counts
      const reportResponse = await axios.get(`${API_BASE_URL}/api/monthly-reports-students?year=${year}`, { timeout: 8000 });
      
      // Fetch internship data for comparison
      const internshipResponse = await axios.get(`${API_BASE_URL}/api/internships-with-details`, { timeout: 8000 });
      
      if (reportResponse.data && Array.isArray(reportResponse.data)) {
        console.log('Report data received:', reportResponse.data.length, 'records');
        setReportData(reportResponse.data);
      } else {
        console.warn('Invalid report data format');
      }
      
      if (internshipResponse.data && Array.isArray(internshipResponse.data)) {
        console.log('Internship data received:', internshipResponse.data.length, 'records');
        setInternshipData(internshipResponse.data);
      } else {
        console.warn('Invalid internship data format');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in ReportOverview:', err);
      setError('Failed to load report data from the database');
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
        <h4>Training Reports Overview</h4>
        <div className={`${styles.chartContainer} ${styles.loading}`}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show error message with retry option
  if (error) {
    return (
      <div className={styles.card}>
        <h4>Training Reports Overview</h4>
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
  if (reportData.length === 0) {
    return (
      <div className={styles.card}>
        <h4>Training Reports Overview</h4>
        <div className={`${styles.chartContainer} ${styles.error}`}>
          <div className={styles.errorMessage}>
            <div className={styles.errorIcon}>ℹ️</div>
            <p>No report data available for the selected period</p>
          </div>
        </div>
      </div>
    );
  }

  // Process internship data to get monthly counts
  const processInternshipData = () => {
    const monthCounts: {[key: string]: number} = {
      'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0,
      'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'December': 0
    };
    
    internshipData.forEach((internship: any) => {
      if (internship.start_date) {
        const date = new Date(internship.start_date);
        const monthName = date.toLocaleString('default', { month: 'long' });
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });
    
    return Object.keys(monthCounts).map(month => ({
      month,
      count: monthCounts[month]
    }));
  };

  const internshipsByMonth = processInternshipData();

  // Get labels and data for chart
  const labels = reportData.map(item => monthNameMap[item.month] || item.month);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Student Reports',
        borderColor: '#00b894',
        backgroundColor: 'rgba(0, 184, 148, 0.1)',
        data: reportData.map(item => item.count),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Internship Opportunities',
        borderColor: '#0984e3',
        backgroundColor: 'rgba(9, 132, 227, 0.1)',
        data: labels.map(shortMonth => {
          const longMonth = Object.keys(monthNameMap).find(key => monthNameMap[key] === shortMonth) || shortMonth;
          const data = internshipsByMonth.find(item => item.month === longMonth);
          return data ? data.count : 0;
        }),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: `Training Activity Overview - ${dateRange}`,
        padding: 8,
      },
      tooltip: {
        padding: 8,
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 12,
        },
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
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className={styles.card}>
      <h4>Training Activity Overview</h4>
      <div className={styles.chartContainer}>
        <Line data={data} options={options} ref={chartRef} />
      </div>
    </div>
  );
};

export default ReportOverview;