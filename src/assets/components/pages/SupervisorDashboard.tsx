import React, { useEffect, useState } from "react";
import SupervisorAside from "../Navbar/SupervisorAside";
import styles from "../css/SupervisorDashboard.module.scss";
import axios from "axios";
import { API_BASE_URL } from '../utils/apiUtils';

// Add these icons if you have access to Font Awesome or similar icon library
// If not, you can remove these imports and the icon elements in the JSX
const UserIcon = () => <span>👤</span>;
const EmailIcon = () => <span>✉️</span>;
const BuildingIcon = () => <span>🏢</span>;
const LocationIcon = () => <span>📍</span>;
const ModeIcon = () => <span>🔄</span>;
const StudentsIcon = () => <span>👥</span>;
const AbsenceIcon = () => <span>📊</span>;
const ReportIcon = () => <span>📝</span>;

const SupervisorDashboard: React.FC = () => {
  const supervisorInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const supervisorId = supervisorInfo?.id;

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supervisorName, setSupervisorName] = useState<string>("");
  const [internshipTitle, setInternshipTitle] = useState<string>("");
  const [supervisorEmail, setSupervisorEmail] = useState<string>("");
  const [internshipLocation, setInternshipLocation] = useState<string>("");
  const [internshipMode, setInternshipMode] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Fetch supervisor name, email, and internship details
  useEffect(() => {
    const fetchSupervisorAndInternship = async () => {
      if (!supervisorId) return;
      try {
        // Fetch supervisor name and email
        const supRes = await axios.get(`${API_BASE_URL}/api/supervisors/detail/${supervisorId}`);
        setSupervisorName(supRes.data.name || "-");
        setSupervisorEmail(supRes.data.email || "-");
        // Fetch internship info (get the first internship supervised by this supervisor)
        const intRes = await axios.get(`${API_BASE_URL}/api/supervisor/${supervisorId}/accepted-students`);
        if (intRes.data && intRes.data.length > 0) {
          const internshipId = intRes.data[0].internship_id;
          if (internshipId) {
            const internshipDetail = await axios.get(`${API_BASE_URL}/api/internships`);
            const found = internshipDetail.data.find((i: any) => i.internship_id === internshipId);
            if (found) {
              setInternshipTitle(found.title || "-");
              setInternshipLocation(found.location || "-");
              setInternshipMode(found.mode || found.type || "-");
              // Fetch company name
              if (found.company_id) {
                try {
                  const companyRes = await axios.get(`${API_BASE_URL}/companies/${found.company_id}`);
                  setCompanyName(companyRes.data.company_name || "-");
                } catch {
                  setCompanyName("-");
                }
              } else {
                setCompanyName("-");
              }
            } else {
              setInternshipTitle("-");
              setInternshipLocation("-");
              setInternshipMode("-");
              setCompanyName("-");
            }
          } else {
            setInternshipTitle("-");
            setInternshipLocation("-");
            setInternshipMode("-");
            setCompanyName("-");
          }
        } else {
          setInternshipTitle("-");
          setInternshipLocation("-");
          setInternshipMode("-");
          setCompanyName("-");
        }
      } catch (err) {
        setSupervisorName("-");
        setSupervisorEmail("-");
        setInternshipTitle("-");
        setInternshipLocation("-");
        setInternshipMode("-");
        setCompanyName("-");
      }
    };
    fetchSupervisorAndInternship();
  }, [supervisorId]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!supervisorId) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/supervisor/${supervisorId}/dashboard`);
        setDashboard(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [supervisorId]);

  return (
    <div className={styles.pageContainer}>
      <SupervisorAside />
      <div className={styles.mainContent}>
        <div className={styles.dashboardHeader}>
          <h2 className={styles.dashboardTitle}>Supervisor Dashboard</h2>
        </div>
        
        <div className={styles.dashboardHeaderInfo}>
          <div className={styles.infoItem}>
            <strong><UserIcon /> Supervisor</strong>
            {supervisorName}
          </div>
          <div className={styles.infoItem}>
            <strong><EmailIcon /> Email</strong>
            {supervisorEmail}
          </div>
          <div className={styles.infoItem}>
            <strong><BuildingIcon /> Internship</strong>
            {internshipTitle}
          </div>
          <div className={styles.infoItem}>
            <strong><LocationIcon /> Location</strong>
            {internshipLocation}
          </div>
          <div className={styles.infoItem}>
            <strong><ModeIcon /> Mode</strong>
            {internshipMode}
          </div>
          <div className={styles.infoItem}>
            <strong><BuildingIcon /> Company</strong>
            {companyName}
          </div>
          <div className={styles.infoItem}>
            <strong><StudentsIcon /> Supervised Students</strong>
            {dashboard && dashboard.students ? dashboard.students.length : 0}
          </div>
        </div>
        
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading dashboard data...</p>
          </div>
        )}
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {dashboard && (
          <>
            <div className={styles.statsContainer}>
              <h3 className={styles.statsTitle}><AbsenceIcon /> Attendance Overview</h3>
              <div>
                <strong>Total Absences: </strong>
                <span className={styles.statsValue}>{dashboard.totalAbsences ?? 0}</span>
              </div>
            </div>
            
            {dashboard.recentReports && dashboard.recentReports.length > 0 && (
              <div className={styles.reportsSection}>
                <h3 className={styles.sectionTitle}><ReportIcon /> Recent Reports</h3>
                <ul className={styles.reportsList}>
                  {(dashboard.recentReports).map((r: any) => (
                    <li key={r.report_id}>
                      <strong>{r.first_name} {r.last_name}</strong> - {r.course_subject} ({r.month}/{r.year})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default SupervisorDashboard;
