import React, { useState, useRef, useEffect } from "react";
import styles from "../css/AdminViewStudents.module.css";
import Aside from "../Navbar/AdminAside";
import requestStyles from "../css/studentRequestPage.module.css";
import { API_BASE_URL } from "../utils/apiUtils";

interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  universityId?: number;
  major?: string;
  gpa: string;
  trainingStatus?: string;
  accountStatus: string;
  registrationStatus?: string;
  company?: string;
  date?: string;
  status?: string;
}

const AdminViewStudents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "students" | "create" | "profiles"
  >("students");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [editedInternship, setEditedInternship] = useState<Partial<Student>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<Student[]>([]);

  const [newStudent, setNewStudent] = useState<Omit<Student, "id">>({
    firstName: "",
    lastName: "",
    email: "",
    universityId: undefined,
    gpa: "",
    accountStatus: "Active",
    registrationStatus: "Confirmed",
    phone: "",
    major: "",
    trainingStatus: "",
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newStudent.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!newStudent.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!newStudent.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudent.email)) {
      errors.email = "Invalid email format";
    }

    if (!newStudent.universityId) {
      errors.universityId = "University ID is required";
    }

    if (!newStudent.gpa.trim()) {
      errors.gpa = "GPA is required";
    } else {
      const gpa = parseFloat(newStudent.gpa);
      if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
        errors.gpa = "GPA must be between 0 and 4.0";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStudent = async () => {
    if (!validateForm()) return;

    const payload = {
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      email: newStudent.email,
      phone: "",
      universityId: newStudent.universityId,
      major: "",
      gpa: parseFloat(newStudent.gpa),
      accountStatus: "Active",
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/create-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        alert("Failed to create student: " + result.message);
        return;
      }

      const newId = newStudent.universityId;
      setStudents([
        ...students,
        {
          id: newId,
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          email: newStudent.email,
          universityId: newStudent.universityId,
          gpa: newStudent.gpa,
          accountStatus: "Active",
        },
      ]);

      setNewStudent({
        firstName: "",
        lastName: "",
        email: "",
        universityId: undefined,
        gpa: "",
        accountStatus: "Active",
      });

      setFormErrors({});
      setActiveTab("students");
      alert("Student account created successfully");
    } catch (err) {
      console.error("Error creating student:", err);
      alert("Server error. Please try again later.");
    }
  };

  const [studentInternships, setStudentInternships] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/students-internships`)
      .then((res) => res.json())
      .then(setStudentInternships)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/students-with-email`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((s: any) => ({
          id: s.student_id,
          firstName: s.first_name,
          lastName: s.last_name,
          email: s.email,
          trainingStatus: s.training_status,
          accountStatus: s.account_status,
        }));
        setStudents(mapped);
      })
      .catch(console.error);
  }, []);

  const handleDeleteStudent = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (res.ok) {
      setStudents(students.filter((s) => s.id !== id));
    } else {
      alert("Error deleting: " + result.message);
    }
  };

  const handleDeactivateStudent = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/api/students/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (res.ok) {
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, accountStatus: "Deactivated" } : s
        )
      );
    } else {
      alert("Error deactivating: " + result.message);
    }
  };

  const handleReactivateStudent = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/api/students/reactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();

    if (res.ok) {
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, accountStatus: "Active" } : s
        )
      );
    } else {
      alert("Error reactivating: " + result.message);
    }
  };

  const handlePreviewInternship = (student: any) => {
    const [firstName, ...rest] = (student.name || "").split(" ");
    const lastName = rest.join(" ");

    setSelectedStudent({
      ...student,
      firstName,
      lastName,
    });
    setShowPreviewModal(true);
  };

  const handleModifyInternship = (student: Student) => {
    setSelectedStudent(student);
    setEditedInternship({
      company: student.company,
      date: student.date,
      status: student.status,
    });
    setShowModifyModal(true);
  };

  const handleSaveModifications = () => {
    if (selectedStudent) {
      setStudents(
        students.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, ...editedInternship }
            : student
        )
      );
      setShowModifyModal(false);
      setSelectedStudent(null);
      setEditedInternship({});
    }
  };

  const closeModals = () => {
    setShowPreviewModal(false);
    setShowModifyModal(false);
    setSelectedStudent(null);
    setEditedInternship({});
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map((student) => student.id!));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case "activate":
        setStudents(
          students.map((student) =>
            selectedStudents.includes(student.id!)
              ? { ...student, accountStatus: "Active" }
              : student
          )
        );
        break;
      case "deactivate":
        setStudents(
          students.map((student) =>
            selectedStudents.includes(student.id!)
              ? { ...student, accountStatus: "Deactivated" }
              : student
          )
        );
        break;
      case "delete":
        setStudents(
          students.filter((student) => !selectedStudents.includes(student.id!))
        );
        break;
    }
    setSelectedStudents([]);
    setShowBulkActions(false);
  };

  const handleExport = () => {
    const data = filteredStudents.map((student) => ({
      FirstName: student.firstName,
      LastName: student.lastName,
      Email: student.email,
      "University ID": student.universityId,
      Major: student.major,
      GPA: student.gpa,
      "Training Status": student.trainingStatus,
      "Account Status": student.accountStatus,
      // Company: student.company || 'N/A',
      // 'Training Date': student.date || 'N/A',
      // 'Internship Status': student.status || 'N/A'
    }));

    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students_data.csv";
    link.click();
  };

  const handleImportCSV = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/import-students`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
      } else {
        alert("Import failed: " + result.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong while uploading the file.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const matchesSearch =
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.universityId?.toString().includes(searchTerm.toLowerCase());

        const matchesFilter =
          filterStatus === "all" || student.accountStatus === filterStatus;

        return matchesSearch && matchesFilter;
      })
    : [];

  return (
    <div className={styles.container}>
      <Aside />
      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={activeTab === "students" ? styles.active : ""}
            onClick={() => setActiveTab("students")}
          >
            All Students
          </button>
          <button
            className={activeTab === "create" ? styles.active : ""}
            onClick={() => setActiveTab("create")}
          >
            Create Student
          </button>
          <button
            className={activeTab === "profiles" ? styles.active : ""}
            onClick={() => setActiveTab("profiles")}
          >
            Student Profiles
          </button>
        </div>

        {activeTab === "students" && (
          <div className={styles.studentList}>
            <div className={styles.tableHeader}>
              <h2>All Students</h2>
              <div className={styles.tableActions}>
                <div className={styles.searchBox}>
                  <label htmlFor="studentSearch" className="sr-only">
                    Search students
                  </label>
                  <input
                    id="studentSearch"
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search students"
                  />
                </div>
                <div className={styles.filterBox}>
                  <label htmlFor="statusFilter" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={handleFilterChange}
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
                <button
                  className={styles.exportButton}
                  onClick={handleExport}
                  aria-label="Export student data to CSV"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {selectedStudents.length > 0 && (
              <div className={styles.bulkActions}>
                <span>{selectedStudents.length} students selected</span>
                <div className={styles.bulkButtons}>
                  <button onClick={() => handleBulkAction("activate")}>
                    Activate Selected
                  </button>
                  <button onClick={() => handleBulkAction("deactivate")}>
                    Deactivate Selected
                  </button>
                  <button onClick={() => handleBulkAction("delete")}>
                    Delete Selected
                  </button>
                  <button onClick={() => setSelectedStudents([])}>
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <label htmlFor="selectAll" className="sr-only">
                      Select all students
                    </label>
                    <input
                      id="selectAll"
                      type="checkbox"
                      checked={
                        selectedStudents.length === filteredStudents.length
                      }
                      onChange={handleSelectAll}
                      aria-label="Select all students"
                    />
                  </th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Training Status</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={`student-${student.id}-${index}`}>
                    <td>
                      <label
                        htmlFor={`select-${student.id}`}
                        className="sr-only"
                      >
                        Select {student.firstName}
                      </label>
                      <input
                        id={`select-${student.id}`}
                        type="checkbox"
                        checked={selectedStudents.includes(student.id!)}
                        onChange={() => handleSelectStudent(student.id!)}
                        aria-label={`Select ${student.firstName}`}
                      />
                    </td>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.trainingStatus}</td>
                    <td>{student.accountStatus}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteStudent(student.id!)}
                        aria-label={`Delete ${student.firstName}`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() =>
                          student.accountStatus.toLowerCase() === "active"
                            ? handleDeactivateStudent(student.id!)
                            : handleReactivateStudent(student.id!)
                        }
                        aria-label={`${
                          student.accountStatus.toLowerCase() === "active"
                            ? "Deactivate"
                            : "Re-activate"
                        } ${student.firstName}`}
                      >
                        {student.accountStatus.toLowerCase() === "active"
                          ? "Deactivate"
                          : "Re-activate"}
                      </button>

                      <button
                        onClick={() => setActiveTab("profiles")}
                        aria-label={`View profile of ${student.firstName}`}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Students Internships</h3>
            <hr />
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Training Date</th>
                  <th>Internship Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentInternships.map((student, index) => (
                  <tr key={`internship-${student.id}-${index}`}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.company}</td>
                    <td>{student.date || "N/A"}</td>
                    <td>
                      <span
                        className={`${requestStyles.status} ${
                          student.status === "accepted"
                            ? requestStyles.accepted
                            : student.status === "pending"
                            ? requestStyles.pending
                            : requestStyles.rejected
                        }`}
                      >
                        {student.status || "N/A"}
                      </span>
                    </td>

                    <td>
                      <button
                        className={styles.prevBtn}
                        onClick={() => handlePreviewInternship(student)}
                        title="Preview Internship Details"
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/709/709612.png"
                          alt="Preview"
                        />
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "create" && (
          <div className={styles.createForm}>
            <h2>Create New Student Account</h2>

            <div className={styles.importSection}>
              <h3>Import Students from CSV</h3>
              <p>
                Download the template and fill it with student information, then
                import it here.
              </p>
              <div className={styles.importActions}>
                <button
                  className={styles.templateButton}
                  onClick={() => {
                    const template =
                      "First Name,Last Name,Email,Phone,University ID,Major,GPA\n";
                    const blob = new Blob([template], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "student_import_template.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Download Template
                </button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  id="csvImportCreate"
                />
                <label
                  htmlFor="csvImportCreate"
                  className={styles.importButton}
                >
                  Import CSV
                </label>
              </div>
            </div>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <h3>Create Single Student</h3>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="First Name"
                value={newStudent.firstName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, firstName: e.target.value })
                }
                className={formErrors.firstName ? styles.error : ""}
              />
              {formErrors.firstName && (
                <span className={styles.errorText}>{formErrors.firstName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Last Name"
                value={newStudent.lastName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, lastName: e.target.value })
                }
                className={formErrors.lastName ? styles.error : ""}
              />
              {formErrors.lastName && (
                <span className={styles.errorText}>{formErrors.lastName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                className={formErrors.email ? styles.error : ""}
              />
              {formErrors.email && (
                <span className={styles.errorText}>{formErrors.email}</span>
              )}
            </div>

            {/* <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Phone"
                value={newStudent.phone}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, phone: e.target.value })
                }
                className={formErrors.phone ? styles.error : ""}
              />
              {formErrors.phone && (
                <span className={styles.errorText}>{formErrors.phone}</span>
              )}
            </div> */}

            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="University ID"
                value={newStudent.universityId}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    universityId: Number(e.target.value),
                  })
                }
                className={formErrors.universityId ? styles.error : ""}
              />
              {formErrors.universityId && (
                <span className={styles.errorText}>
                  {formErrors.universityId}
                </span>
              )}
            </div>

            {/* <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Major"
                value={newStudent.major}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, major: e.target.value })
                }
                className={formErrors.major ? styles.error : ""}
              />
              {formErrors.major && (
                <span className={styles.errorText}>{formErrors.major}</span>
              )}
            </div> */}

            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="GPA"
                value={newStudent.gpa}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, gpa: e.target.value })
                }
                className={formErrors.gpa ? styles.error : ""}
              />
              {formErrors.gpa && (
                <span className={styles.errorText}>{formErrors.gpa}</span>
              )}
            </div>

            {/* <div className={styles.formGroup}>
              <select
                value={newStudent.trainingStatus}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    trainingStatus: e.target.value,
                  })
                }
                className={formErrors.trainingStatus ? styles.error : ""}
                aria-label="Training Status"
              >
                <option value="">Select Training Status</option>
                <option value="Not Started">Not Started</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
              {formErrors.trainingStatus && (
                <span className={styles.errorText}>
                  {formErrors.trainingStatus}
                </span>
              )}
            </div> */}

            <button onClick={handleCreateStudent}>Create Account</button>
          </div>
        )}

        {activeTab === "profiles" && (
          <div className={styles.profileView}>
            <h2>Student Profiles</h2>
            <p>
              🔎 Select a student from "All Students" to view full profile here.
            </p>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedStudent && (
          <div className={styles.modalOverlay} onClick={closeModals}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Internship Details</h3>
              <div className={styles.modalContent}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Student Name:</span>
                  <span className={styles.value}>
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{selectedStudent.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Company:</span>
                  <span className={styles.value}>
                    {selectedStudent.company || "N/A"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Training Date:</span>
                  <span className={styles.value}>
                    {selectedStudent.date || "N/A"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Status:</span>
                  <span className={styles.value}>
                    <span
                      className={
                        selectedStudent.status === "Active"
                          ? styles.active
                          : styles.inactive
                      }
                    >
                      {selectedStudent.status || "N/A"}
                    </span>
                  </span>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.closeButton} onClick={closeModals}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modify Modal */}
        {showModifyModal && selectedStudent && (
          <div className={styles.modalOverlay} onClick={closeModals}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Modify Internship</h3>
              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    type="text"
                    value={editedInternship.company || ""}
                    onChange={(e) =>
                      setEditedInternship({
                        ...editedInternship,
                        company: e.target.value,
                      })
                    }
                    placeholder="Enter company name"
                    aria-label="Company name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Training Date</label>
                  <input
                    id="date"
                    type="date"
                    value={editedInternship.date || ""}
                    onChange={(e) =>
                      setEditedInternship({
                        ...editedInternship,
                        date: e.target.value,
                      })
                    }
                    aria-label="Training date"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={editedInternship.status || ""}
                    onChange={(e) =>
                      setEditedInternship({
                        ...editedInternship,
                        status: e.target.value,
                      })
                    }
                    aria-label="Internship status"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.closeButton} onClick={closeModals}>
                  Cancel
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleSaveModifications}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewStudents;
