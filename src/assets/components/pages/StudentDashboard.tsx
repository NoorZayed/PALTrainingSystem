import React, { useState, useEffect } from "react";
import ReportCard from "./StudentDash/ReportCard";
import TasksPanel from "./StudentDash/TasksPanel";
import InternshipSection from "./StudentDash/InternshipSection";
import AttendanceCard from "./StudentDash/AttendanceCard";
import QuickActions from "./StudentDash/QuickActions";
import styles from "../css/StudentDashboard.module.css";
import TrainingProgressCard from "./StudentDash/TrainingProgressCard";
import TrainingCertificate from "./StudentDash/TrainingCertificate";
import StudentAside from "../Navbar/studentAside";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

interface DashboardStats {
  applications: number;
  certificates: number;
  attendanceRate: number;
  absenceCount: number;
}

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<any>(null);

  const [stats, setStats] = useState<DashboardStats>({
    applications: 0,
    certificates: 0,
    attendanceRate: 100,
    absenceCount: 0,
  });
  // Get student data from database
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const studentId = userData?.id;

        if (!studentId) {
          setLoading(false);
          return;
        }

        // Fetch the student data from the API
        const response = await axios.get(
          `${API_BASE_URL}/api/students/${studentId}`
        );
        const studentData = response.data;

        // Set student name from database record - if first_name and last_name exist, use them
        if (studentData.first_name) {
          setStudentName(`${studentData.first_name}`);
        } else {
          setStudentName("");
        }

        // Fetch additional dashboard stats
        try {
          // Fetch all application data for the student
          const applicationsRes = await axios.get(
            `${API_BASE_URL}/api/applications/${studentId}`
          );
          const applications = applicationsRes.data?.length || 0;

          // Fetch absences data
          const absencesRes = await axios.get(
            `${API_BASE_URL}/api/student/${studentId}/absences`
          );
          const absenceCount = absencesRes.data?.length || 0;

          // Calculate attendance rate based on total expected days
          // Assuming 30 working days in a month as a baseline
          const totalExpectedDays = 30;
          const attendanceRate = Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((totalExpectedDays - absenceCount) / totalExpectedDays) * 100
              )
            )
          );

          // Get completed certifications/internships
          const completedInternships = applicationsRes.data
            ? applicationsRes.data.filter(
                (app: any) => app.status === "completed"
              ).length
            : 0;

          // Try to get application stats if available from the stats endpoint
          try {
            const statsResponse = await axios.get(
              `${API_BASE_URL}/api/student/${studentId}/application-stats`
            );
            console.log(statsResponse);
            if (statsResponse.data) {
              // Use the server-side stats data if available
              setStats({
                applications: statsResponse.data.applications,
                certificates: completedInternships,
                attendanceRate,
                absenceCount,
              });
            } else {
              // Fall back to the calculated values
              setStats({
                applications,
                certificates: completedInternships,
                attendanceRate,
                absenceCount,
              });
            }
          } catch (statsEndpointError) {
            console.log(
              "Stats endpoint not available, using calculated values"
            );
            // If the stats endpoint fails, use the calculated values
            setStats({
              applications,
              certificates: completedInternships,
              attendanceRate,
              absenceCount,
            });
          }
        } catch (statsError) {
          console.error("Error fetching dashboard stats:", statsError);
          // Set default values if there's an error
          setStats({
            applications: 0,
            certificates: 0,
            attendanceRate: 100,
            absenceCount: 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        setStudentName("");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);
  // We'll use the component's built-in fetching logic for certificates
  // instead of providing sample data

  return (
    <div className={styles.dashboardContainer}>
      <StudentAside />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.welcomeSection}>
            <h1>
              {loading
                ? "Loading..."
                : studentName
                ? `Welcome ${studentName}!`
                : "Welcome!"}
            </h1>
            <p>Here's an overview of your internship progress</p>
          </div>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "overview" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "internships" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("internships")}
            >
              🔍 Internship Recommendations
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "certificates" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("certificates")}
            >
              Certificates
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            {" "}
            <div className={styles.quickStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <i className="fas fa-tasks"></i>
                </div>
                <div className={styles.statInfo}>
                  <h3>Applications</h3>
                  <p>
                    {loading
                      ? "Loading..."
                      : `${stats.applications || 0} Total`}
                  </p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className={styles.statInfo}>
                  <h3>Attendance Rate</h3>
                  <p>
                    {loading ? "Loading..." : `${stats.attendanceRate || 100}%`}
                  </p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <i className="fas fa-certificate"></i>
                </div>
                <div className={styles.statInfo}>
                  <h3>Certificates</h3>
                  <p>
                    {loading
                      ? "Loading..."
                      : `${stats.certificates || 0} Completed`}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.cardsGrid}>
              <div className={styles.card}>
                <ReportCard />
              </div>
              <div className={styles.card}>
                <QuickActions />
              </div>
              <div className={styles.card}>
                <TasksPanel />
              </div>
              <div className={styles.card}>
                <AttendanceCard />
              </div>
            </div>
          </>
        )}

        {activeTab === "internships" && (
          <div className={styles.internshipSection}>
            <InternshipSection />
          </div>
        )}

        {activeTab === "certificates" && (
          <div className={styles.certificatesSection}>
            <div className={styles.card}>
              <TrainingProgressCard />
            </div>
            <div className={styles.card}>
              <TrainingCertificate showAll={true} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
