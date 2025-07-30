import React, { useState, useEffect } from "react";
import styles from "../css/AdminReportPage.module.scss";
import Aside from "../Navbar/AdminAside";
import { API_BASE_URL } from "../utils/apiUtils";

interface StudentReport {
  student_id: number;
  student_name: string;
  company_name: string;
  submission_date?: string;
  status: "pending" | "submitted" | "graded";
  grade?: string;
  numeric_grade?: number;
  student_comments?: string;
  supervisor_comments?: string;
  supervisor_name?: string;
  internship_dates?: {
    start_date: string;
    end_date: string;
    working_hours: {
      start_time: string;
      end_time: string;
    };
  };
}

interface Report {
  report_id: number;
  // course_subject: string;
  // internship_type: string;
  report_title: string;
  month: string;
  year: number;
  due_date: string;
  published: boolean;
  status: "draft" | "published" | "completed";
  student_reports: StudentReport[];
}

const gradeMappings = {
  A: 95,
  B: 85,
  C: 75,
  D: 65,
  F: 50,
};

const numericToLetter = (num: number) => {
  if (num >= 90) return "A";
  if (num >= 80) return "B";
  if (num >= 70) return "C";
  if (num >= 60) return "D";
  return "F";
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Generate years array (current year to 5 years in the future)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

const AdminReportPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentReport[]>(
    []
  );
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [form, setForm] = useState<Omit<Report, "report_id">>({
    // course_subject: "",
    // internship_type: "",
    report_title: "",
    month: months[new Date().getMonth()],
    year: new Date().getFullYear(),
    due_date: "",
    published: false,
    status: "draft",
    student_reports: [],
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const user = localStorage.getItem("user");

        if (!user) {
          console.warn("No user data found in localStorage");
          return;
        }

        const parsedUser = JSON.parse(user);
        const managerId = parsedUser.id;

        const response = await fetch(
          `${API_BASE_URL}/api/reports?manager_id=${managerId}`
        );
        const data = await response.json();

        const formattedReports: Report[] = data.map((r: any) => ({
          report_id: r.report_id,
          report_title: r.report_title,
          month: r.month,
          year: r.year,
          due_date: r.due_date,
          published: r.is_published === 1,
          status: r.status,
          student_reports: [],
        }));

        setReports(formattedReports);
      } catch (error) {
        console.error("Failed to load reports", error);
      }
    };

    fetchReports();
  }, []);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedStudentReport, setSelectedStudentReport] =
    useState<StudentReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);

  const openCreateModal = () => {
    setForm({
      // course_subject: "",
      // internship_type: "",
      report_title: "",
      month: months[new Date().getMonth()],
      year: new Date().getFullYear(),
      due_date: "",
      published: false,
      status: "draft",
      student_reports: [],
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (report: Report) => {
    const { report_id: id, ...rest } = report;
    setForm(rest);
    setEditingId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = localStorage.getItem("user");
    const managerId = user ? JSON.parse(user).id : null;

    const reportPayload = {
      report_title: form.report_title,
      month: form.month,
      year: form.year,
      due_date: form.due_date,
      is_published: form.published ? 1 : 0,
      status: form.status,
      ...(form.published && managerId && { training_manager_id: managerId }),
    };

    if (editingId !== null) {
      //update existing report
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/reports/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportPayload),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          alert("Error updating report: " + result.message);
          return;
        }

        setReports((prev) =>
          prev.map((r) =>
            r.report_id === editingId ? { ...r, ...reportPayload } : r
          )
        );
      } catch (err) {
        console.error("Update error:", err);
        alert("Failed to update report.");
      }
    } else {
      //create new report
      try {
        const response = await fetch(`${API_BASE_URL}/api/create-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportPayload),
        });

        const result = await response.json();

        if (!response.ok) {
          alert("Error: " + result.message);
          return;
        }

        const newReport: Report = {
          report_id: result.reportId,
          ...reportPayload,
          published: false,
          student_reports: [],
        };

        setReports((prev) => [...prev, newReport]);
      } catch (err) {
        console.error("Creation error:", err);
        alert("Failed to create report.");
      }
    }

    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/${confirmDeleteId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert("Failed to delete report: " + result.message);
        return;
      }

      setReports(reports.filter((r) => r.report_id !== confirmDeleteId));
      setConfirmDeleteId(null);
      alert("Report deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error while deleting the report.");
    }
  };

  const handlePublish = (id: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.report_id === id ? { ...r, published: !r.published } : r
      )
    );
  };

  const fetchStudentSubmissions = async (reportId: number) => {
    setLoadingSubmissions(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/${reportId}/student-submissions`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch student submissions");
      }
      const data = await response.json();

      // Transform the data to match our StudentReport interface
      const formattedSubmissions: StudentReport[] = data.map((item: any) => ({
        student_id: item.student_id,
        student_name: item.student_name,
        company_name: item.company_name,
        supervisor_name: item.supervisor_name,
        status: item.status as "pending" | "submitted" | "graded",
        grade: item.grade,
        numeric_grade: item.numeric_grade,
        supervisor_comments: item.supervisor_comments,
        submission_date:
          item.status === "submitted"
            ? new Date().toISOString().split("T")[0]
            : undefined,
        internship_dates:
          item.start_date && item.end_date
            ? {
                start_date: item.start_date,
                end_date: item.end_date,
                working_hours: {
                  start_time: item.time_from || "08:00",
                  end_time: item.time_to || "17:00",
                },
              }
            : undefined,
      }));

      setStudentSubmissions(formattedSubmissions);
    } catch (error) {
      console.error("Failed to fetch student submissions:", error);
      alert("Failed to load student submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleReportClick = (report: Report, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedReport(report);
    fetchStudentSubmissions(report.report_id);
  };

  const handleViewDetails = (report: Report, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const handleStudentReportClick = (
    studentReport: StudentReport,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }
    console.log("Setting selected student report:", studentReport); // Debug log
    setSelectedStudentReport(studentReport);
  };

  const handleGradeSubmit = async (
    reportId: number,
    studentId: number,
    grade: string,
    numeric_grade: number
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/${reportId}/students/${studentId}/grade`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ grade, numeric_grade }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update grade");
      }

      // Update local state
      setStudentSubmissions((prev) =>
        prev.map((submission) =>
          submission.student_id === studentId
            ? {
                ...submission,
                grade,
                numeric_grade,
                status: "graded" as const,
              }
            : submission
        )
      );

      alert("Grade updated successfully!");
    } catch (error) {
      console.error("Error updating grade:", error);
      alert("Failed to update grade. Please try again.");
    }
  };

  return (
    <div className={styles.page}>
      <Aside />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Training Report Management</h1>
          <button onClick={openCreateModal}>Create New Report</button>
        </div>

        <div className={styles.reportsGrid}>
          {reports.map((report) => (
            <div key={report.report_id} className={styles.reportCard}>
              <div
                className={styles.reportCard__content}
                onClick={(e) => handleReportClick(report, e)}
              >
                <h3>{report.report_title}</h3>
                {/* <p><strong>Type:</strong> {report.internship_type}</p> */}
                <p>
                  <strong>Period:</strong> {report.month} {report.year}
                </p>
                <p>
                  <strong>Status:</strong> {report.status}
                </p>
                <p>
                  <strong>Published:</strong> {report.published ? "Yes" : "No"}
                </p>
              </div>
              <div className={styles.reportCard__actions}>
                <button onClick={(e) => handleViewDetails(report, e)}>
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(report);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(report.report_id);
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePublish(report.report_id);
                  }}
                  className={report.published ? styles.published : ""}
                >
                  {report.published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedReport && showReportDetails && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowReportDetails(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Report Details</h2>
              <div className={styles.reportDetails}>
                <p>
                  <strong>Course Subject:</strong> {selectedReport.report_title}
                </p>
                {/* <p><strong>Internship Type:</strong> {selectedReport.internship_type}</p> */}
                <p>
                  <strong>Period:</strong> {selectedReport.month}{" "}
                  {selectedReport.year}
                </p>
                <p>
                  <strong>Due Date:</strong> {selectedReport.due_date}
                </p>
                <p>
                  <strong>Status:</strong> {selectedReport.status}
                </p>
                <p>
                  <strong>Published:</strong>{" "}
                  {selectedReport.published ? "Yes" : "No"}
                </p>
              </div>
              <div className={styles.modal__buttons}>
                <button onClick={() => setShowReportDetails(false)}>
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowReportDetails(false);
                    handleReportClick(selectedReport);
                  }}
                >
                  View Submissions
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedReport && !showReportDetails && (
          <div className={styles.studentsTable}>
            <div className={styles.studentsTable__header}>
              <h3>Student Submissions for {selectedReport.report_title}</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className={styles.closeButton}
              >
                Close Table
              </button>
            </div>
            {loadingSubmissions ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                Loading student submissions...
              </div>
            ) : (
              <div className={styles.studentsTable__container}>
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Company</th>
                      <th>Supervisor</th>
                      <th>Internship Period</th>
                      <th>Status</th>
                      <th>Letter Grade</th>
                      <th>Numeric Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentSubmissions.map((studentReport) => (
                      <tr key={studentReport.student_id}>
                        <td>{studentReport.student_name}</td>
                        <td>{studentReport.company_name}</td>
                        <td>
                          {studentReport.supervisor_name || "Not assigned"}
                        </td>
                        <td>
                          {studentReport.internship_dates
                            ? `${studentReport.internship_dates.start_date} to ${studentReport.internship_dates.end_date}`
                            : "Not set"}
                        </td>
                        <td>{studentReport.status}</td>
                        <td>{studentReport.grade || "Not graded"}</td>
                        <td>{studentReport.numeric_grade ?? "-"}</td>
                        <td>
                          {studentReport.status === "submitted" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!studentReport.student_id) {
                                  alert("Student ID is missing.");
                                  return;
                                }
                                const input = prompt(
                                  "Enter grade (A-F or 0-100):"
                                );
                                if (!input) return;
                                const grade = input.trim().toUpperCase();

                                let letterGrade: string;
                                let numericGrade: number;

                                if (!isNaN(Number(grade))) {
                                  numericGrade = parseInt(grade);
                                  letterGrade = numericToLetter(numericGrade);
                                } else {
                                  letterGrade = grade;
                                  numericGrade =
                                    gradeMappings[
                                      letterGrade as keyof typeof gradeMappings
                                    ] ?? 0;
                                }

                                handleGradeSubmit(
                                  selectedReport.report_id,
                                  studentReport.student_id,
                                  letterGrade,
                                  numericGrade
                                );

                                setStudentSubmissions((prev) =>
                                  prev.map((s) =>
                                    s.student_id === studentReport.student_id
                                      ? ({
                                          ...s,
                                          grade: letterGrade,
                                          numeric_grade: numericGrade,
                                          status: "graded",
                                        } as StudentReport)
                                      : s
                                  )
                                );
                              }}
                            >
                              Grade
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentReportClick(studentReport, e);
                            }}
                            className={styles.viewDetailsButton}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedStudentReport && (
          <div
            className={styles.modalOverlay}
            onClick={() => setSelectedStudentReport(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Student Report Details</h2>
              <p>
                <strong>Student:</strong> {selectedStudentReport.student_name}
              </p>
              <p>
                <strong>Company:</strong> {selectedStudentReport.company_name}
              </p>
              <p>
                <strong>Supervisor:</strong>{" "}
                {selectedStudentReport.supervisor_name || "Not assigned"}
              </p>
              {selectedStudentReport.internship_dates && (
                <>
                  <p>
                    <strong>Internship Period:</strong>
                  </p>
                  <p>
                    From: {selectedStudentReport.internship_dates.start_date}
                  </p>
                  <p>To: {selectedStudentReport.internship_dates.end_date}</p>
                  <p>
                    <strong>Working Hours:</strong>{" "}
                    {
                      selectedStudentReport.internship_dates.working_hours
                        .start_time
                    }{" "}
                    -{" "}
                    {
                      selectedStudentReport.internship_dates.working_hours
                        .end_time
                    }
                  </p>
                </>
              )}
              <p>
                <strong>Status:</strong> {selectedStudentReport.status}
              </p>
              {selectedStudentReport.submission_date && (
                <p>
                  <strong>Submitted on:</strong>{" "}
                  {selectedStudentReport.submission_date}
                </p>
              )}
              {selectedStudentReport.student_comments && (
                <>
                  <p>
                    <strong>Student Comments:</strong>
                  </p>
                  <p>{selectedStudentReport.student_comments}</p>
                </>
              )}
              {selectedStudentReport.supervisor_comments && (
                <>
                  <p>
                    <strong>Supervisor Comments:</strong>
                  </p>
                  <p>{selectedStudentReport.supervisor_comments}</p>
                </>
              )}
              {selectedStudentReport.grade && (
                <p>
                  <strong>Grade:</strong> {selectedStudentReport.grade}
                </p>
              )}
              <button onClick={() => setSelectedStudentReport(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingId !== null ? "Edit Report" : "Create New Report"}
              </h2>
              <form className={styles.modalForm} onSubmit={handleSubmit}>
                <label htmlFor="report_title">Report Title:</label>
                <input
                  type="text"
                  id="report_title"
                  value={form.report_title}
                  onChange={(e) =>
                    setForm({ ...form, report_title: e.target.value })
                  }
                  required
                />
                {/* <label htmlFor="internship_type">Internship Type:</label>
                <input
                  type="text"
                  id="internship_type"
                  value={form.internship_type}
                  onChange={(e) => setForm({ ...form, internship_type: e.target.value })}
                  required
                /> */}
                <label htmlFor="month">Month:</label>
                <select
                  id="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  required
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <label htmlFor="year">Year:</label>
                <select
                  id="year"
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: parseInt(e.target.value) })
                  }
                  required
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <label htmlFor="due_date">Due Date:</label>
                <input
                  type="date"
                  id="due_date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <div className={styles.modalForm__controls}>
                  <label>
                    Published:
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) =>
                        setForm({ ...form, published: e.target.checked })
                      }
                    />
                  </label>
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as
                          | "draft"
                          | "published"
                          | "completed",
                      })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className={styles.modal__buttons}>
                  <button type="submit">
                    {editingId !== null ? "Update Report" : "Create Report"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={styles.cancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDeleteId !== null && (
          <div
            className={styles.modalOverlay}
            onClick={() => setConfirmDeleteId(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete this report?</p>
              <div className={styles.modal__buttons}>
                <button onClick={handleDelete}>Yes, Delete</button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className={styles.cancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportPage;
