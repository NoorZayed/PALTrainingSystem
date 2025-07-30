import React, { useState, useEffect } from "react";
import SupervisorAside from "../Navbar/SupervisorAside";
import styles from "../css/AsupervisorReportPage.module.scss";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

interface Student {
  id: number;
  full_name: string;
}

interface PublishedReport {
  report_id: number;
  report_title: string;
  month: string;
  year: number;
  due_date: string;
  is_published: boolean;
  status: string;
}

interface InternshipDetails {
  title: string;
  internship_type: string;
  start_date: string;
  end_date: string;
  company_name: string;
  supervisor_name: string;
  co_supervisor_name?: string;
}

interface Report {
  report_id?: number;
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
  due_date: string;
  grade: string | null;
}

const initialReport: Report = {
  course_subject: "",
  internship_type: "",
  month: "",
  year: new Date().getFullYear(),
  full_name: "",
  supervisor_name: "",
  date_from: "",
  date_to: "",
  time_from: "",
  time_to: "",
  supervisor_comments: "",
  due_date: "",
  grade: null,
};

const validateReport = (report: Report) => {
  const errors: Record<string, string> = {};

  // Only validate supervisor comments since all other fields are auto-populated
  if (!report.supervisor_comments || !report.supervisor_comments.trim()) {
    errors.supervisor_comments = "Supervisor comments are required";
  } else if (report.supervisor_comments.trim().length < 10) {
    errors.supervisor_comments =
      "Please provide more detailed comments (at least 10 characters)";
  }

  return errors;
};

const steps = [
  "Select Student",
  "Select Report",
  "Fill Report",
  "Review & Submit",
];

// Custom Tooltip component
const Tooltip: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={styles.tooltipContainer}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={styles.tooltipTrigger}
      >
        {children}
      </div>
      {showTooltip && (
        <div className={styles.tooltipContent}>
          {title}
          <div className={styles.tooltipArrow} />
        </div>
      )}
    </div>
  );
};

const SupervisorReportPage: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedPublishedReport, setSelectedPublishedReport] =
    useState<PublishedReport | null>(null);
  const [publishedReports, setPublishedReports] = useState<PublishedReport[]>(
    []
  );
  const [internshipDetails, setInternshipDetails] =
    useState<InternshipDetails | null>(null);
  const [report, setReport] = useState<Report>(initialReport);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studentSearch, setStudentSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [step, setStep] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [submittedReports, setSubmittedReports] = useState<
    Record<string, boolean>
  >({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setReport((prev) => ({ ...prev, [name]: newValue }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    const supervisorInfo = JSON.parse(localStorage.getItem("user") || "{}");
    const supervisorId = supervisorInfo?.id;
    if (!supervisorId) return;

    const fetchStudents = async () => {
      try {
        // Fetch only accepted students for this supervisor
        const res = await axios.get(
          `${API_BASE_URL}/api/supervisor/${supervisorId}/accepted-students`
        );
        // Each row: student_id, first_name, last_name, internship_id
        const transformed = res.data.map((row: any) => ({
          id: row.student_id,
          full_name: `${row.first_name} ${row.last_name}`,
        }));
        setStudents(transformed);
      } catch (err) {
        setStudents([]);
      }
    };

    const fetchPublishedReports = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/published-reports`);
        setPublishedReports(res.data);
      } catch (err) {
        console.error("Error fetching published reports:", err);
        setPublishedReports([]);
      }
    };

    fetchStudents();
    fetchPublishedReports();
  }, []);

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredPublishedReports = publishedReports.filter((r) =>
    r.report_title.toLowerCase().includes(reportSearch.toLowerCase())
  );

  // Function to check which reports have already been submitted for the selected student
  const checkSubmittedReports = async (student: Student) => {
    if (!student || publishedReports.length === 0) return;

    const supervisorInfo = JSON.parse(localStorage.getItem("user") || "{}");
    const supervisorName =
      supervisorInfo?.first_name && supervisorInfo?.last_name
        ? `${supervisorInfo.first_name} ${supervisorInfo.last_name}`
        : "noor Zayed"; // fallback for testing

    console.log(
      "Checking submitted reports for:",
      student.full_name,
      "by supervisor:",
      supervisorName
    );

    const submittedStatus: Record<string, boolean> = {};

    // Check each published report
    for (const report of publishedReports) {
      try {
        const checkRes = await axios.get(
          `${API_BASE_URL}/api/supervisor/check-report-fixed/${student.id}/${
            report.report_id
          }?supervisorName=${encodeURIComponent(supervisorName)}`
        );
        submittedStatus[report.report_id] = checkRes.data.exists || false;
        console.log(
          `Report ${report.report_title} (${report.month} ${report.year}):`,
          checkRes.data.exists ? "SUBMITTED" : "NOT SUBMITTED"
        );
      } catch (error) {
        console.error("Error checking report status:", error);
        submittedStatus[report.report_id] = false;
      }
    }

    console.log("Final submitted status:", submittedStatus);
    setSubmittedReports(submittedStatus);
  };

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setErrors({});

    // Fetch internship details for auto-population
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/student/${student.id}/internship-details`
      );
      setInternshipDetails(res.data);

      // Check which reports have already been submitted for this student
      await checkSubmittedReports(student);
    } catch (err) {
      console.error("Error fetching internship details:", err);
      setInternshipDetails(null);
    }
  };

  const handleSelectReport = async (publishedReport: PublishedReport) => {
    // Check if this report has already been submitted
    if (submittedReports[publishedReport.report_id]) {
      setNotification({
        type: "error",
        message: `You have already submitted a report "${publishedReport.report_title}" for ${selectedStudent?.full_name} for ${publishedReport.month} ${publishedReport.year}. Please choose a different report.`,
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setSelectedPublishedReport(publishedReport);

    // Auto-populate report fields based on selected report and internship details
    if (internshipDetails && selectedStudent) {
      const supervisorInfo = JSON.parse(localStorage.getItem("user") || "{}");
      setReport({
        ...initialReport,
        full_name: selectedStudent.full_name,
        course_subject: internshipDetails.title || publishedReport.report_title,
        internship_type: internshipDetails.internship_type || "On-Site",
        month: publishedReport.month,
        year: publishedReport.year,
        supervisor_name:
          supervisorInfo?.first_name && supervisorInfo?.last_name
            ? `${supervisorInfo.first_name} ${supervisorInfo.last_name}`
            : internshipDetails.supervisor_name || "",
        date_from: internshipDetails.start_date || "",
        date_to: internshipDetails.end_date || "",
        time_from: "08:00",
        time_to: "16:00",
        due_date: publishedReport.due_date,
        supervisor_comments: "",
      });
    }
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateReport(report);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setNotification({
        type: "error",
        message: "Please fix the errors before submitting.",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const supervisorInfo = JSON.parse(localStorage.getItem("user") || "{}");
      const reportData = {
        student_id: selectedStudent?.id,
        course_subject: report.course_subject,
        internship_type: report.internship_type,
        month: report.month,
        year: report.year,
        full_name: report.full_name,
        supervisor_name: report.supervisor_name,
        date_from: report.date_from,
        date_to: report.date_to,
        time_from: report.time_from,
        time_to: report.time_to,
        supervisor_comments: report.supervisor_comments,
        due_date: report.due_date,
        submitted_report_id: selectedPublishedReport?.report_id,
      };

      await axios.post(
        `${API_BASE_URL}/api/supervisor/submit-report`,
        reportData
      );

      setLoading(false);
      setNotification({
        type: "success",
        message: "Report submitted successfully for " + report.full_name,
      });
      setSelectedStudent(null);
      setReport(initialReport);
      setStep(0);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setLoading(false);
      setNotification({
        type: "error",
        message: "Failed to submit report. Please try again.",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Fetch real reports for selected student
  useEffect(() => {
    const fetchReports = async () => {
      if (selectedStudent) {
        setLoading(true);
        try {
          const supervisorInfo = JSON.parse(
            localStorage.getItem("user") || "{}"
          );
          const supervisorId = supervisorInfo?.id;
          const res = await axios.get(
            `${API_BASE_URL}/api/supervisor/${supervisorId}/student/${selectedStudent.id}/reports`
          );
          // If you want to show previous reports, you can set them in state here
          // setStudentReports(res.data);
        } catch (err) {
          // Optionally handle error
        } finally {
          setLoading(false);
        }
      }
    };
    fetchReports();
    // eslint-disable-next-line
  }, [selectedStudent]);

  return (
    <div className={styles.container}>
      <SupervisorAside />
      <div className={styles.mainContent}>
        <main className={styles.contentWrapper}>
          <h2 className={styles.pageTitle}>Supervisor Student Report</h2>
          {/* Stepper */}
          <div className={styles.stepper}>
            {steps.map((label, idx) => (
              <div key={label} className={styles.stepperItem}>
                <div
                  className={`${styles.stepperCircle} ${
                    idx <= step ? styles.active : ""
                  }`}
                >
                  {idx < step ? "✓" : idx + 1}
                </div>
                <span
                  className={`${styles.stepperLabel} ${
                    idx === step ? styles.active : ""
                  }`}
                >
                  {label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={styles.stepperLine} />
                )}
              </div>
            ))}
          </div>
          {/* Notification */}
          {notification && (
            <div
              className={`${styles.notification} ${
                notification.type === "success" ? styles.success : styles.error
              }`}
            >
              {notification.type === "success" ? "✓" : "⚠"}{" "}
              {notification.message}
            </div>
          )}
          {/* Loading Spinner Overlay */}
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
            </div>
          )}
          {/* Step 1: Select Student */}
          {step === 0 && (
            <div className={styles.card}>
              <h3>Select a student to fill their report:</h3>
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className={styles.studentSearch}
              />
              <ul className={styles.studentList}>
                {filteredStudents.length === 0 && <li>No students found.</li>}
                {filteredStudents.map((student) => (
                  <li key={student.id}>
                    <button
                      className={styles.studentButton}
                      onClick={() => {
                        handleSelectStudent(student);
                        nextStep();
                      }}
                    >
                      <span>👤</span>
                      {student.full_name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 2: Select Report */}
          {step === 1 && selectedStudent && (
            <div className={styles.card}>
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedPublishedReport(null);
                  setStep(0);
                }}
                className={styles.backButton}
              >
                ← Back to Students
              </button>
              <h3>Select a Report Template for {selectedStudent.full_name}</h3>
              <p className={styles.stepDescription}>
                Choose a published training report to fill out for this student.
              </p>
              <p className={styles.infoMessage}>
                ℹ️ Reports marked with "✅ Already Submitted" cannot be selected
                again. You can only submit one report per template per student.
              </p>

              <input
                type="text"
                placeholder="Search report templates..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className={styles.studentSearch}
              />

              <div className={styles.reportsList}>
                {filteredPublishedReports.length === 0 ? (
                  <p className={styles.noReports}>
                    No published reports available.
                  </p>
                ) : (
                  filteredPublishedReports.map((publishedReport) => {
                    const isSubmitted =
                      submittedReports[publishedReport.report_id] || false;
                    console.log(
                      `Rendering report ${publishedReport.report_title}:`,
                      `ID=${publishedReport.report_id}`,
                      `isSubmitted=${isSubmitted}`,
                      `submittedReports=`,
                      submittedReports
                    );
                    return (
                      <div
                        key={publishedReport.report_id}
                        className={`${styles.reportCard} ${
                          selectedPublishedReport?.report_id ===
                          publishedReport.report_id
                            ? styles.selectedReport
                            : ""
                        } ${isSubmitted ? styles.submittedReport : ""}`}
                        onClick={() => {
                          if (!isSubmitted) {
                            handleSelectReport(publishedReport);
                            nextStep();
                          }
                        }}
                        style={{
                          opacity: isSubmitted ? 0.6 : 1,
                          cursor: isSubmitted ? "not-allowed" : "pointer",
                        }}
                      >
                        <div className={styles.reportInfo}>
                          <h4>{publishedReport.report_title}</h4>
                          <p className={styles.reportPeriod}>
                            {publishedReport.month} {publishedReport.year}
                          </p>
                          <p className={styles.reportDueDate}>
                            Due:{" "}
                            {new Date(
                              publishedReport.due_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={styles.reportStatus}>
                          {isSubmitted ? (
                            <span className={styles.submittedBadge}>
                              ✅ Already Submitted
                            </span>
                          ) : (
                            <span className={styles.publishedBadge}>
                              Published
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {internshipDetails && (
                <div className={styles.internshipPreview}>
                  <h4>📋 Internship Information</h4>
                  <div className={styles.internshipDetails}>
                    <p>
                      <strong>Company:</strong> {internshipDetails.company_name}
                    </p>
                    <p>
                      <strong>Position:</strong> {internshipDetails.title}
                    </p>
                    <p>
                      <strong>Type:</strong> {internshipDetails.internship_type}
                    </p>
                    <p>
                      <strong>Period:</strong>{" "}
                      {new Date(
                        internshipDetails.start_date
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        internshipDetails.end_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Fill Report */}
          {step === 2 && selectedStudent && selectedPublishedReport && (
            <form onSubmit={handleSubmit} className={styles.card}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                }}
                className={styles.backButton}
              >
                ← Back to Report Selection
              </button>

              <div className={styles.reportHeader}>
                <h3>Fill Report: {selectedPublishedReport.report_title}</h3>
                <p className={styles.studentInfo}>
                  Student: {selectedStudent.full_name}
                </p>
                <p className={styles.autoPopulatedNote}>
                  ✨ Information has been auto-populated from internship data
                </p>
                <p className={styles.autoPopulatedNote}>
                  📝 Only supervisor comments can be edited
                </p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="full_name">Student Name</label>
                  <div className={styles.readOnlyField}>{report.full_name}</div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="course_subject">Course Subject</label>
                  <div className={styles.readOnlyField}>
                    {report.course_subject}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="internship_type">Internship Type</label>
                  <div className={styles.readOnlyField}>
                    {report.internship_type}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="month">Month</label>
                  <div className={styles.readOnlyField}>{report.month}</div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="year">Year</label>
                  <div className={styles.readOnlyField}>{report.year}</div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="supervisor_name">Supervisor Name</label>
                  <div className={styles.readOnlyField}>
                    {report.supervisor_name}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="date_from">Duration From</label>
                  <div className={styles.readOnlyField}>
                    {report.date_from
                      ? new Date(report.date_from).toLocaleDateString()
                      : "Not specified"}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="date_to">Duration To</label>
                  <div className={styles.readOnlyField}>
                    {report.date_to
                      ? new Date(report.date_to).toLocaleDateString()
                      : "Not specified"}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="time_from">Working Hours From</label>
                  <div className={styles.readOnlyField}>{report.time_from}</div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="time_to">Working Hours To</label>
                  <div className={styles.readOnlyField}>{report.time_to}</div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="due_date">Due Date</label>
                  <div className={styles.readOnlyField}>
                    {report.due_date
                      ? new Date(report.due_date).toLocaleDateString()
                      : "Not specified"}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="company_name">Company</label>
                  <div className={styles.readOnlyField}>
                    {internshipDetails?.company_name || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Only editable field - Supervisor Comments */}
              <div className={styles.formGroup} style={{ marginTop: "1.5rem" }}>
                <label htmlFor="supervisor_comments">
                  <strong>Supervisor Comments *</strong>
                  <span
                    style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      marginLeft: "0.5rem",
                    }}
                  >
                    (This is the only field you can edit)
                  </span>
                </label>
                <textarea
                  id="supervisor_comments"
                  name="supervisor_comments"
                  value={report.supervisor_comments}
                  onChange={handleInputChange}
                  required
                  className={styles.textarea}
                  aria-label="Supervisor Comments"
                  placeholder="Please provide your feedback and comments about the student's performance during the internship period..."
                  rows={6}
                  style={{
                    border: "2px solid #1976d2",
                    backgroundColor: "#f8f9ff",
                  }}
                />
                {errors.supervisor_comments && (
                  <span className={styles.errorMsg}>
                    {errors.supervisor_comments}
                  </span>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={loading || !report.supervisor_comments.trim()}
                  onClick={nextStep}
                >
                  {loading ? (
                    <div className={styles.spinner} />
                  ) : (
                    "Review & Submit"
                  )}
                </button>
              </div>
            </form>
          )}
          {/* Step 4: Review & Submit */}
          {step === 3 && selectedStudent && selectedPublishedReport && (
            <div className={styles.card}>
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                }}
                className={styles.backButton}
              >
                ← Back to Form
              </button>

              <div className={styles.reviewHeader}>
                <h3>Review & Submit Report</h3>
                <p className={styles.reviewSubtitle}>
                  Please review the information before submitting
                </p>
              </div>

              <div className={styles.reviewContainer}>
                <div className={styles.reviewSection}>
                  <h4>📋 Report Information</h4>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>
                        Report Template:
                      </span>
                      <span className={styles.reviewValue}>
                        {selectedPublishedReport.report_title}
                      </span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Student:</span>
                      <span className={styles.reviewValue}>
                        {report.full_name}
                      </span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Company:</span>
                      <span className={styles.reviewValue}>
                        {internshipDetails?.company_name || "Not specified"}
                      </span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>
                        Course Subject:
                      </span>
                      <span className={styles.reviewValue}>
                        {report.course_subject}
                      </span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Period:</span>
                      <span className={styles.reviewValue}>
                        {report.month} {report.year}
                      </span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Supervisor:</span>
                      <span className={styles.reviewValue}>
                        {report.supervisor_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <h4>📅 Internship Duration</h4>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Duration:</span>
                      <span className={styles.reviewValue}>
                        {report.date_from && report.date_to
                          ? `${new Date(
                              report.date_from
                            ).toLocaleDateString()} - ${new Date(
                              report.date_to
                            ).toLocaleDateString()}`
                          : "Not specified"}
                      </span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Working Hours:</span>
                      <span className={styles.reviewValue}>
                        {report.time_from} - {report.time_to}
                      </span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>
                        Internship Type:
                      </span>
                      <span className={styles.reviewValue}>
                        {report.internship_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <h4>💬 Supervisor Comments</h4>
                  <div className={styles.commentsReview}>
                    {report.supervisor_comments || "No comments provided"}
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.backButton} onClick={prevStep}>
                  ← Back to Edit Comments
                </button>
                <button
                  className={styles.submitButton}
                  disabled={loading}
                  onClick={() => setShowConfirm(true)}
                >
                  {loading ? (
                    <div className={styles.spinner} />
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>

              {showConfirm && (
                <div className={styles.confirmModal}>
                  <div className={styles.confirmContent}>
                    <h4>Confirm Submission</h4>
                    <p>
                      Are you sure you want to submit this report for{" "}
                      <strong>{report.full_name}</strong>?
                    </p>
                    <p className={styles.confirmNote}>
                      Once submitted, you cannot edit this report again.
                    </p>
                    <div className={styles.confirmActions}>
                      <button
                        onClick={confirmSubmit}
                        className={styles.confirmBtn}
                      >
                        Yes, Submit Report
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SupervisorReportPage;
