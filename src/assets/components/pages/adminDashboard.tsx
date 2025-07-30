import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Navbar/AdminAside";
import styles from "../css/adminDashboard.module.css";
import SummaryCards from "./adminDash/SummaryCards";
import ApplicationStats from "./adminDash/ApplicationStats";
import ReportOverview from "./adminDash/ReportOverview";
import AbsentStats from "./adminDash/AbsentStats";
import StudentTable from "./adminDash/StudentTable";
import { API_BASE_URL } from "../utils/apiUtils";
import FinalReport from "./adminDash/FinalReport";

interface Activity {
  type: "registration" | "internship" | "completion";
  message: string;
  time: string;
}

interface StudentStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
  present: number;
  absent: number;
}

interface DashboardData {
  totalStudents: number;
  activeInternships: number;
  partnerCompanies: number;
  completionRate: number;
  recentActivities: Activity[];
  studentStats: StudentStats;
}

interface SummaryStats {
  reports: number;
  companies: number;
  tasks: number;
  students: number;
}

// Icons using emojis - replace with actual icons if available
const CalendarIcon = () => <span>📅</span>;
const RegistrationIcon = () => <span>👤</span>;
const InternshipIcon = () => <span>🏢</span>;
const CompletionIcon = () => <span>🎓</span>;

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("month");
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudents: 0,
    activeInternships: 0,
    partnerCompanies: 0,
    completionRate: 0,
    recentActivities: [],
    studentStats: {
      total: 0,
      active: 0,
      completed: 0,
      pending: 0,
      present: 0,
      absent: 0,
    },
  });

  // Fetch dashboard data on component mount and when dateRange changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize with default/empty values
        let students: any[] = [];
        let internships: any[] = [];
        let companies: any[] = [];
        let reports: any[] = [];
        let absences: any[] = [];

        // Fetch total students
        try {
          const studentsResponse = await axios.get(
            `${API_BASE_URL}/api/students`,
            { timeout: 8000 }
          );
          students = studentsResponse.data || [];
          console.log("Fetched students:", students.length);
        } catch (err) {
          console.error("Failed to fetch students data:", err);
          setError("Failed to fetch students data from the database");
          throw err;
        }

        // Fetch internships
        try {
          const internshipsResponse = await axios.get(
            `${API_BASE_URL}/api/internships`,
            { timeout: 8000 }
          );
          internships = internshipsResponse.data || [];
          console.log("Fetched internships:", internships.length);
        } catch (err) {
          console.error("Failed to fetch internships data:", err);
          setError("Failed to fetch internships data from the database");
          throw err;
        }

        // Fetch companies
        try {
          const companiesResponse = await axios.get(
            `${API_BASE_URL}/api/companies`,
            { timeout: 8000 }
          );
          companies = companiesResponse.data || [];
          console.log("Fetched companies:", companies.length);
        } catch (err) {
          console.error("Failed to fetch companies data:", err);
          setError("Failed to fetch companies data from the database");
          throw err;
        }

        // Fetch reports
        try {
          const reportsResponse = await axios.get(
            `${API_BASE_URL}/api/reports`,
            { timeout: 8000 }
          );
          reports = reportsResponse.data || [];
          console.log("Fetched reports:", reports.length);
        } catch (err) {
          console.error("Failed to fetch reports data:", err);
          setError("Failed to fetch reports data from the database");
          throw err;
        }

        // Fetch absences
        try {
          const absencesResponse = await axios.get(
            `${API_BASE_URL}/api/absences`,
            { timeout: 8000 }
          );
          absences = absencesResponse.data || [];
          console.log("Fetched absences:", absences.length);
        } catch (err) {
          console.error("Failed to fetch absences data:", err);
          setError("Failed to fetch absences data from the database");
          throw err;
        }

        // Calculate statistics
        const activeStudents = students.filter(
          (student: any) => student.account_status === "active"
        ).length;
        const pendingStudents = students.filter(
          (student: any) => student.registration_status === "Pending"
        ).length;
        const completedInternships = students.filter(
          (student: any) => student.training_status === "completed"
        ).length;

        // Calculate completion rate
        const completionRate =
          students.length > 0
            ? Math.round((completedInternships / students.length) * 100)
            : 0;

        // Get recent activities
        const recentActivities: Activity[] = [];

        // Add recent student registrations
        const recentStudentsList = [...students]
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          )
          .slice(0, 3);

        setRecentStudents(recentStudentsList);

        recentStudentsList.forEach((student: any) => {
          recentActivities.push({
            type: "registration",
            message: `New student registered: ${student.first_name} ${student.last_name}`,
            time: formatTimeAgo(student.created_at || new Date()),
          });
        });

        // Add recent internship postings
        const recentInternships = [...internships]
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          )
          .slice(0, 3);

        recentInternships.forEach((internship: any) => {
          recentActivities.push({
            type: "internship",
            message: `New internship posted: ${internship.title}`,
            time: formatTimeAgo(internship.created_at || new Date()),
          });
        });

        // Sort activities by time
        recentActivities
          .sort((a, b) => {
            return getTimeAgoValue(a.time) - getTimeAgoValue(b.time);
          })
          .slice(0, 5);

        const dashboardData = {
          totalStudents: students.length,
          activeInternships: internships.filter(
            (i: any) => new Date(i.end_date || "2099-12-31") > new Date()
          ).length,
          partnerCompanies: companies.length,
          completionRate,
          recentActivities,
          studentStats: {
            total: students.length,
            active: activeStudents,
            completed: completedInternships,
            pending: pendingStudents,
            present: students.length - absences.length,
            absent: absences.length,
          },
        };

        setDashboardData(dashboardData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data from the database");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Trigger a re-fetch by updating the dateRange state
    setDateRange((prev) => prev);
  };

  const handleDateRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDateRange(event.target.value);
  };

  const summaryStats: SummaryStats = {
    reports: dashboardData.studentStats.total,
    companies: dashboardData.partnerCompanies,
    tasks: dashboardData.studentStats.pending,
    students: dashboardData.totalStudents,
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
        </div>

        <div className={styles.tabRow}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={activeTab === "dashboard" ? styles.activeTab : ""}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("final-report")}
            className={activeTab === "final-report" ? styles.activeTab : ""}
          >
            Final Report
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button className={styles.retryButton} onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {activeTab === "dashboard" && (
          <>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading dashboard data...</p>
              </div>
            ) : (
              /* Main Dashboard Content */
              <div className={styles.dashboardContent}>
                {/* Top Section - Charts */}
                <div className={styles.topSection}>
                  <div className={styles.chartsSection}>
                    <ApplicationStats dateRange={dateRange} />
                    <ReportOverview dateRange={dateRange} />
                  </div>
                  <div className={styles.summarySection}>
                    <SummaryCards stats={summaryStats} />
                  </div>
                </div>

                {/* Middle Section - Attendance Stats */}
                <div className={styles.middleSection}>
                  {/* Absent Stats Section */}
                  <div className={styles.statsSection}>
                    <AbsentStats
                      stats={{
                        total: dashboardData.studentStats.total,
                        present: dashboardData.studentStats.present,
                        absent: dashboardData.studentStats.absent,
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Section - Activity and Students */}
                <div className={styles.bottomSection}>
                  {/* Recent Activity Section */}
                  <div className={styles.recentActivity}>
                    <h2>Recent Activity</h2>
                    <div className={styles.activityList}>
                      {dashboardData.recentActivities.length > 0 ? (
                        dashboardData.recentActivities.map(
                          (activity, index) => (
                            <div key={index} className={styles.activityItem}>
                              <div className={styles.activityIcon}>
                                {activity.type === "registration" ? (
                                  <RegistrationIcon />
                                ) : activity.type === "internship" ? (
                                  <InternshipIcon />
                                ) : (
                                  <CompletionIcon />
                                )}
                              </div>
                              <div className={styles.activityInfo}>
                                <p>{activity.message}</p>
                                <span className={styles.activityTime}>
                                  {activity.time}
                                </span>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className={styles.noActivity}>
                          No recent activities
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Students Table Section */}
                  <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                      <h2>Recent Students</h2>
                      <button className={styles.viewAllBtn}>View All</button>
                    </div>
                    <StudentTable students={recentStudents || []} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {activeTab === "final-report" && (
          <div className={styles.finalReportWrapper}>
            <FinalReport />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for time formatting
const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const pastDate = new Date(date);
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  // Less than a minute
  if (seconds < 60) {
    return "just now";
  }

  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // Less than a month
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  // Less than a year
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  // More than a year
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

// Helper function to get numeric value of time ago for sorting
const getTimeAgoValue = (timeAgo: string): number => {
  const now = new Date().getTime();

  if (timeAgo.includes("just now")) {
    return 0;
  }

  const [value, unit] = timeAgo.split(" ");
  const numValue = parseInt(value);

  if (unit.includes("minute")) {
    return numValue * 60 * 1000;
  } else if (unit.includes("hour")) {
    return numValue * 60 * 60 * 1000;
  } else if (unit.includes("day")) {
    return numValue * 24 * 60 * 60 * 1000;
  } else if (unit.includes("week")) {
    return numValue * 7 * 24 * 60 * 60 * 1000;
  } else if (unit.includes("month")) {
    return numValue * 30 * 24 * 60 * 60 * 1000;
  } else if (unit.includes("year")) {
    return numValue * 365 * 24 * 60 * 60 * 1000;
  }

  return 0;
};

export default AdminDashboard;
