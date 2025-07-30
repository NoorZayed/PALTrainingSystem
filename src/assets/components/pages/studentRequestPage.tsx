import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../css/studentRequestPage.module.css";
import Aside from "../Navbar/studentAside";
import { API_BASE_URL } from "../utils/apiUtils";

interface InternshipRequest {
  application_id: number;
  internship_id: number;
  status: "pending" | "accepted" | "rejected";
  company_id: number;
  company_name: string;
  title?: string;
  internship_title?: string;
  location?: string;
  application_date?: string;
  is_confirmed?: 0 | 1;
}

const StudentRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<InternshipRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const studentId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  useEffect(() => {
    if (studentId) {
      axios
        .get(`${API_BASE_URL}/api/applications/${studentId}`)
        .then((res) => setRequests(res.data))
        .catch((err) => console.error("Error fetching applications:", err));
      axios
        .get(`${API_BASE_URL}/api/applications/${studentId}/is-confirmed`)
        .then((res) => setIsConfirmed(res.data.isConfirmed))
        .catch((err) => console.error("Error checking confirmation:", err));
    }
  }, [studentId]);

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus);

  const acceptedRequests = requests.filter((req) => req.status === "accepted");
  const isAlreadyConfirmed = requests.some((req) => req.is_confirmed === 1);
  const hasUnconfirmedAccepted =
    acceptedRequests.filter((req) => req.is_confirmed !== 1).length > 1;

  const handleCancel = async (internshipId: number) => {
    if (!studentId) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/applications/cancel/${studentId}/${internshipId}`
      );
      setRequests((prev) =>
        prev.filter((req) => req.internship_id !== internshipId)
      );
    } catch (err) {
      console.error("Failed to cancel application:", err);
    }
  };

  const handleConfirm = async (internshipId: number) => {
    if (!studentId) return;

    const confirmed = window.confirm(
      "Are you sure you want to confirm this internship and start training in it? All other accepted applications will be removed."
    );

    if (!confirmed) return;

    try {
      await axios.post(`${API_BASE_URL}/api/applications/confirm`, {
        student_id: studentId,
        internship_id: internshipId,
      });

      const res = await axios.get(
        `${API_BASE_URL}/api/applications/${studentId}`
      );
      setRequests(res.data);

      const confirmationRes = await axios.get(
        `${API_BASE_URL}/api/applications/${studentId}/is-confirmed`
      );
      setIsConfirmed(confirmationRes.data.isConfirmed);
    } catch (err) {
      console.error("Error confirming internship:", err);
    }
  };

  return (
    <div className={styles.requestPageContainer}>
      <Aside />
      <main className={styles.mainContent}>
        <section className={styles.internshipRequests}>
          <h3>Request Internship</h3>

          {/* Filter Buttons */}
          <div className={styles.filterControls}>
            <button
              className={`${styles.filterButton} ${
                filterStatus === "all" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("all")}
            >
              All
            </button>
            <button
              className={`${styles.filterButton} ${
                filterStatus === "pending" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </button>
            <button
              className={`${styles.filterButton} ${
                filterStatus === "accepted" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("accepted")}
            >
              Accepted
            </button>
            <button
              className={`${styles.filterButton} ${
                filterStatus === "rejected" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("rejected")}
            >
              Rejected
            </button>
          </div>

          {/* Internship Cards */}
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div key={request.application_id} className={styles.requestItem}>
                <h4>{request.title}</h4>
                <p>{request.company_name}</p>
                <div className={styles.requestFooter}>
                  <div className={styles.statusRow}>
                    <div
                      className={`${styles.status} ${styles[request.status]}`}
                    >
                      {request.status}
                    </div>

                    {request.status === "pending" && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(request.internship_id)}
                      >
                        Cancel
                      </button>
                    )}

                    {request.status === "accepted" &&
                      !isConfirmed &&
                      !request.is_confirmed && (
                        <button
                          className={styles.confirmBtn}
                          onClick={() => handleConfirm(request.internship_id)}
                        >
                          Confirm
                        </button>
                      )}
                  </div>
                </div>
                {request.application_date && (
                  <div className={styles.date}>
                    Applied:{" "}
                    {new Date(request.application_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No internship applications found.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentRequestPage;
