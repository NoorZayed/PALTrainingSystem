import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/InternshipSearch.module.css";
import companyIcon from "../images/company.svg";
import saveIcon from "../images/save.png";
import axios from "axios";
import { API_BASE_URL } from '../utils/apiUtils';

interface InternshipCardProps {
  title: string;
  company: string;
  location: string;
  companyIcon: string;
  internshipId?: number;
  companyId: number;
  isRecommended?: boolean;
  isAlreadyApplied?: boolean;
  setApplicationsToday: React.Dispatch<React.SetStateAction<number>>;
  seats?: number;
  startDate?: string;
  endDate?: string;
  mode?: string;
}

const InternshipCard: React.FC<InternshipCardProps> = ({
  title,
  company,
  location,
  companyIcon,
  internshipId,
  companyId,
  isRecommended,
  isAlreadyApplied = false,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const studentId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
  const [applicationsToday, setApplicationsToday] = useState<number>(0);
  const navigate = useNavigate();


  const handleSave = () => {
    if (!studentId || !internshipId) return;
    setIsSaved(!isSaved);

    axios
      .post(`${API_BASE_URL}/api/students/${studentId}/save`, {
        internshipId,
      })
      .then(() => {
        console.log("Internship saved!");
      })
      .catch((err) => {
        console.error("Error saving internship:", err);
      });
  };

  const handleApply = () => {
    if (!studentId || !internshipId) return;

    axios
      .post(`${API_BASE_URL}/api/internships/apply`, {
        student_id: studentId,
        internship_id: internshipId,
        student_message: "",
      })
      .then((res) => {
        setApplied(true);
        setMessage("Application submitted successfully.");

        // axios
        //   .get(
        //     `${API_BASE_URL}/api/applications/daily-count/${studentId}`
        //   )
        //   .then((res) => {
        //     setApplicationsToday(res.data.count);
        //   })
        //   .catch(() => {
        //     console.warn("Applied but failed to update daily count.");
        //   });
      })
      
      .catch((err) => {
        if (err.response?.status === 409) {
          setMessage("You already applied for this internship.");
        } else if (err.response?.status === 429) {
          setMessage("You’ve reached your daily application limit (10).");
        } else {
          setMessage("Something went wrong. Please try again.");
        }
      });
  };
  
  const handleViewDetails = () => {
    navigate(`/internship/${internshipId}`);
  };
  return (
    <div
      className={`${styles.card} ${isRecommended ? styles.recommended : ""}`}
    >
      {/* Top stripe */}
      <div
        className={`${styles.indicator} ${
          isRecommended ? styles.recommendedIndicator : ""
        }`}
      />

      {/* Save button */}
      <button
        className={`${styles.saveBtn} ${isSaved ? styles.saved : ""}`}
        onClick={handleSave}
      >
        <img src={saveIcon} alt="Save" className={styles.saveIcon} />
      </button>

      {/* Company block */}
      <div className={styles.company}>
        <img
          src={companyIcon}
          alt="Company icon"
          className={styles.companyIcon}
        />
        <span>{company}</span>
        {isRecommended && (
          <span className={styles.recommendedBadge}>🔎 Recommended</span>
        )}
      </div>

      {/* Title & Location */}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.location}>{location}</p>

      {/* Action Buttons */}
      <div className={styles.buttons}>
        <button
            className={styles.viewDetailsButton}
            onClick={handleViewDetails}
            aria-label="View internship details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Details</span>
          </button>
        <button
          className={styles.applyBtn}
          onClick={handleApply}
          disabled={applied || isAlreadyApplied}
        >
          {applied || isAlreadyApplied ? "Applied ✅" : "Apply now"}
        </button>
      </div>

      {/* Status Message */}
      {message && <p className={styles.statusMessage}>{message}</p>}
    </div>
  );
};

export default InternshipCard;
