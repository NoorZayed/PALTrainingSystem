import React, { useState, useEffect } from "react";
import styles from "../css/StudentRequests.module.css";
import Aside from "../Navbar/AdminAside";
import { API_BASE_URL } from '../utils/apiUtils';

interface Student {
  id: number;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  country: string;
  universityId: number;
  accountStatus: string;
  registrationStatus: string;
}

const StudentRequests: React.FC = () => {
  const [requests, setRequests] = useState<Student[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/student-requests`
        );
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching student requests:", err);
      }
    };

    fetchRequests();
  }, []);

  const handleConfirmStudent = async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/student-requests/${id}/confirm`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert("Failed to confirm student: " + result.message);
        return;
      }

      // remove from requests list (since it's no longer pending)
      setRequests((prev) => prev.filter((student) => student.id !== id));
      alert("Student confirmed successfully");
    } catch (err) {
      console.error("Confirm error:", err);
      alert("Server error while confirming student.");
    }
  };

  const handleRejectStudent = async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/student-requests/${id}/reject`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert("Failed to reject student: " + result.message);
        return;
      }

      setRequests((prev) => prev.filter((student) => student.id !== id));
      alert("Student rejected and deleted successfully");
    } catch (err) {
      console.error("Reject error:", err);
      alert("Server error while rejecting student.");
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return styles.statusActive;
      case "inactive":
        return styles.statusInactive;
      case "pending":
        return styles.statusPending;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <Aside />
      <div className={styles.requests}>
        <h2>Student Registration Requests</h2>
        <div className={styles.tableContainer}>
          {requests.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>University ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.universityId}</td>
                    <td>
                      <span
                        className={`${styles.status} ${getStatusClass(
                          student.registrationStatus
                        )}`}
                      >
                        {student.registrationStatus}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.button} ${styles.viewButton}`}
                          onClick={() => handleViewDetails(student)}
                        >
                          View Details
                        </button>
                        <button
                          className={`${styles.button} ${styles.confirmButton}`}
                          onClick={() => handleConfirmStudent(student.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className={`${styles.button} ${styles.rejectButton}`}
                          onClick={() => handleRejectStudent(student.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              No pending student registration requests
            </div>
          )}
        </div>
      </div>

      {showModal && selectedStudent && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Student Details</h3>
            <div className={styles.modalContent}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{selectedStudent.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{selectedStudent.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Phone Number:</span>
                <span className={styles.value}>
                  {selectedStudent.phoneNumber}
                </span>
              </div>
              {/* <div className={styles.detailRow}>
                <span className={styles.label}>Address:</span>
                <span className={styles.value}>{selectedStudent.address}</span>
              </div> */}
              <div className={styles.detailRow}>
                <span className={styles.label}>Country:</span>
                <span className={styles.value}>{selectedStudent.country}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>University ID:</span>
                <span className={styles.value}>
                  {selectedStudent.universityId}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Account Status:</span>
                <span
                  className={`${styles.value} ${styles.status} ${getStatusClass(
                    selectedStudent.accountStatus
                  )}`}
                >
                  {selectedStudent.accountStatus}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Registration Status:</span>
                <span
                  className={`${styles.value} ${styles.status} ${getStatusClass(
                    selectedStudent.registrationStatus
                  )}`}
                >
                  {selectedStudent.registrationStatus}
                </span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={`${styles.button} ${styles.confirmButton}`}
                onClick={() => {
                  handleConfirmStudent(selectedStudent.id);
                  handleCloseModal();
                }}
              >
                Confirm
              </button>
              <button
                className={`${styles.button} ${styles.rejectButton}`}
                onClick={() => {
                  handleRejectStudent(selectedStudent.id);
                  handleCloseModal();
                }}
              >
                Reject
              </button>
              <button
                className={`${styles.button} ${styles.closeButton}`}
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRequests;
