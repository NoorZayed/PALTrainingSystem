import React, { useEffect, useState } from "react";
import styles from "../css/Report.module.css";
import Aside from "../Navbar/studentAside";
import Notification from "./Notification";
import { API_BASE_URL } from '../utils/apiUtils';


interface Report {
  report_id: number;
  course_subject: string;
  internship_type: string;
  month: string;
  year: number;
  full_name: string;
  supervisor_name: string;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
  supervisor_comments?: string; // Not visible to students for privacy
  letter_grade?: string;
  numeric_grade?: number;
  submitted_report_id?: number;
  due_date?: string;
  report_title?: string; // Added report title
  status?: string; // Could be "draft", "submitted", "graded"
}

const ReportPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Helper functions for formatting dates and times
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return 'N/A';
    try {
      // Handle time format like "08:00:00"
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return timeString;
    }
  };

  const formatDateRange = (startDate: string | undefined, endDate: string | undefined): string => {
    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  };

  const formatTimeRange = (startTime: string | undefined, endTime: string | undefined): string => {
    return `${formatTime(startTime)} to ${formatTime(endTime)}`;
  };
  
  // Format report title helper function
  const getReportTitle = (report: Report): string => {
    // Prioritize the actual report_title from the database
    if (report.report_title) return report.report_title;
    
    // If we have a month and year, show them
    if (report.month && report.year) {
      return `Report for ${report.month} ${report.year}`;
    }
    
    // Fallback to a generic title
    return "Internship Report";
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) {
        setNotification({
          message: "User not logged in. Please log in to view reports.",
          type: "error",
        });
        return;
      }
      
      // Checking for existing reports for this student
      const response = await fetch(`${API_BASE_URL}/api/reports/${user.id}`);
      
      if (response.status === 404) {
        // Handle 404 gracefully - it might mean no reports yet
        setReports([]);
        setNotification({
          message: "No reports found for your account.",
          type: "info",
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error("Expected array of reports but got:", data);
        setReports([]);
        setNotification({
          message: "Received invalid data format from server.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
      setNotification({
        message: "Failed to load reports. Please try again later.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className={styles.reportPageContainer}>
      <Aside />
      <div className={styles.reportContent}>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={handleCloseNotification}
          />
        )}

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <p>Loading reports...</p>
          </div>
        ) : !selectedReport ? (
          <>
            <h1>My Reports</h1>
            
            {reports.length === 0 ? (
              <div className={styles.noReports}>
                <p>No reports found. Your supervisor or training manager will publish reports for you to view.</p>
              </div>
            ) : (
              <>
                <h2>All Reports</h2>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Report Title</th>
                      <th>Period</th>
                      <th>Course</th>
                      <th>Supervisor</th>
                      <th>Status</th>
                      <th>Grade</th>
                      <th>Due Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.report_id}>
                        <td>{report.report_title || "Untitled Report"}</td>
                        <td>{report.month} {report.year}</td>
                        <td>{report.course_subject}</td>
                        <td>{report.supervisor_name}</td>
                        <td>
                          {report.letter_grade 
                            ? "Graded" 
                            : report.status === "published" 
                              ? "Waiting for supervisor" 
                              : report.status === "completed" 
                                ? "Supervisor submitted" 
                                : report.status === "draft" 
                                  ? "Not yet published" 
                                  : "Pending"}
                        </td>
                        <td>{report.letter_grade ?? "N/A"}</td>
                        <td>{formatDate(report.due_date)}</td>
                        <td>
                          <button
                            className={styles.viewButton}
                            onClick={() => handleSelectReport(report)}
                          >
                            <span role="img" aria-label="view">
                              👁️
                            </span>{" "}
                            View 
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        ) : (
          <>
            <button
              className={styles.backButton}
              onClick={() => setSelectedReport(null)}
            >
              ← Back to Reports
            </button>
            <div className={styles.reportPageContainer2}>
              {/* <button className={styles.backButton} onClick={() => setSelectedReport(null)}>
              ← Back to Reports
            </button> */}
              <section className={styles.reportDetails}>
                <h2>{selectedReport.report_title || "Internship Report Details"}</h2>
                <div className={styles.reportForm}>
                  <div className={styles.formGroup}>
                    <label>Report Period</label>
                    <input
                      type="text"
                      value={`${selectedReport.month} ${selectedReport.year}`}
                      disabled
                      title="Report Period"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Internship Subject</label>
                    <input
                      type="text"
                      value={selectedReport.course_subject || ""}
                      disabled
                      title="Internship Subject"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Internship Type</label>
                    <input
                      type="text"
                      value={selectedReport.internship_type}
                      disabled
                      title="Internship Type"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Supervisor Name</label>
                    <input
                      type="text"
                      value={selectedReport.supervisor_name}
                      disabled
                      title="Supervisor Name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Duration</label>
                    <input
                      type="text"
                      value={formatDateRange(selectedReport.date_from, selectedReport.date_to)}
                      disabled
                      title="Duration"
                      placeholder="Duration"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Working Hours</label>
                    <input
                      type="text"
                      value={formatTimeRange(selectedReport.time_from, selectedReport.time_to)}
                      disabled
                      title="Working Hours"
                      placeholder="Working hours (e.g., 9:00 AM to 5:00 PM)"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Due Date</label>
                    <input
                      type="text"
                      value={formatDate(selectedReport.due_date)}
                      disabled
                      title="Due Date"
                      placeholder="Due Date"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Report Status</label>
                    <input
                      type="text"
                      value={
                        selectedReport.letter_grade 
                          ? "Graded" 
                          : selectedReport.status === "published" 
                            ? "Waiting for supervisor feedback" 
                            : selectedReport.status === "completed" 
                              ? "Supervisor has submitted feedback" 
                              : selectedReport.status === "draft" 
                                ? "Not yet published" 
                                : "Pending"
                      }
                      disabled
                      title="Status"
                      placeholder="Report Status"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Grade</label>
                    <input
                      type="text"
                      value={selectedReport.letter_grade || selectedReport.numeric_grade?.toString() || "Not graded yet"}
                      disabled
                      title="Grade"
                      placeholder="Grade"
                    />
                  </div>

                  <button 
                    className={styles.backButton}
                    onClick={() => setSelectedReport(null)}
                  >
                    Back to Reports List
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
