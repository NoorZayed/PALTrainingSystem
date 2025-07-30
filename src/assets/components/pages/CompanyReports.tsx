import React, { useState, useEffect } from 'react';
import CompanyAside from '../Navbar/CompanyAside';
import styles from '../css/CompanyPages.module.css';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiUtils';

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  major: string;
  location: string;
  internship_id: number;
  internship_title: string;
  start_date: string;
  end_date: string | null;
  supervisor_name: string;
  co_supervisor_name: string;
}

interface Report {
  report_id: number;
  student_id: number;
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
  supervisor_comments: string;
}

const CompanyReports: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentReports, setStudentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = 1; // This should come from auth context

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch students
      const studentsRes = await axios.get(`${API_BASE_URL}/api/company/${companyId}/students`);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReports = async (studentId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/company/${companyId}/student/${studentId}/reports`);
      setStudentReports(response.data);
    } catch (err) {
      console.error('Error fetching student reports:', err);
      setError('Failed to load student reports.');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentReports(student.student_id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Remove seconds
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <CompanyAside />
        <main className={styles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading reports...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h2>Student Reports & Progress</h2>
          <p>View student internship progress and performance reports.</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>!</span>
            {error}
            <button className={styles.retryButton} onClick={fetchData}>
              Retry
            </button>
          </div>
        )}

        <div className={styles.reportsContent}>
          {/* Students List */}
          <div className={styles.studentsSection}>
            <h3>Students</h3>
            {students.length === 0 ? (
              <p className={styles.noData}>No students found for your internships.</p>
            ) : (
              <div className={styles.studentsList}>
                {students.map((student) => (
                  <div
                    key={`${student.student_id}-${student.internship_id}`}
                    className={`${styles.studentCard} ${
                      selectedStudent?.student_id === student.student_id && 
                      selectedStudent?.internship_id === student.internship_id ? styles.selectedStudent : ''
                    }`}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className={styles.studentInfo}>
                      <h4>{student.first_name} {student.last_name}</h4>
                      <p className={styles.internshipTitle}>{student.internship_title}</p>
                      <p className={styles.supervisorName}>Supervisor: {student.supervisor_name}</p>
                      <div className={styles.studentMeta}>
                        <span>Started: {formatDate(student.start_date)}</span>
                        <span className={styles.statusBadge}>Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Reports Section - Read Only */}
          {selectedStudent && (
            <div className={styles.reportsSection}>
              <div className={styles.reportsSectionHeader}>
                <div>
                  <h3>Reports for {selectedStudent.first_name} {selectedStudent.last_name}</h3>
                  <p>{selectedStudent.internship_title}</p>
                  <small className={styles.readOnlyNote}>
                    📋 Reports are created by students or training managers. You have read-only access.
                  </small>
                </div>
              </div>

              {/* Reports List - View Only */}
              <div className={styles.reportsList}>
                {studentReports.length === 0 ? (
                  <p className={styles.noReports}>No reports found for this student.</p>
                ) : (
                  studentReports.map((report) => (
                    <div key={report.report_id} className={styles.reportCard}>
                      <div className={styles.reportHeader}>
                        <div>
                          <h4>{report.course_subject}</h4>
                          <p>{report.month} {report.year}</p>
                        </div>
                        <div className={styles.reportBadge}>
                          <span className={styles.reportType}>{report.internship_type}</span>
                        </div>
                      </div>
                      
                      <div className={styles.reportDetails}>
                        <div className={styles.reportRow}>
                          <span className={styles.label}>Student:</span>
                          <span>{report.full_name}</span>
                        </div>
                        <div className={styles.reportRow}>
                          <span className={styles.label}>Period:</span>
                          <span>{formatDate(report.date_from)} - {formatDate(report.date_to)}</span>
                        </div>
                        <div className={styles.reportRow}>
                          <span className={styles.label}>Working Hours:</span>
                          <span>{formatTime(report.time_from)} - {formatTime(report.time_to)}</span>
                        </div>
                        <div className={styles.reportRow}>
                          <span className={styles.label}>Supervisor:</span>
                          <span>{report.supervisor_name}</span>
                        </div>
                        {report.supervisor_comments && (
                          <div className={styles.reportComments}>
                            <span className={styles.label}>Supervisor Comments:</span>
                            <div className={styles.commentsBox}>
                              <p>{report.supervisor_comments}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyReports;
