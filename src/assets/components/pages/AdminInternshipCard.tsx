import React from "react";
import styles from "../css/InternshipCard.module.css";

type InternshipStatus = "Active" | "Pending" | "Completed" | "Cancelled";

interface InternshipCardProps {
  title: string;
  company: string;
  location: string;
  companyIcon: string;
  mode: InternshipStatus | string;
  startDate?: string;
  endDate?: string;
  studentCount?: number;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const InternshipCard: React.FC<InternshipCardProps> = ({
  title,
  company,
  location,
  companyIcon,
  mode,
  startDate,
  endDate,
  studentCount = 0,
  onClick,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (mode: string): string => {
    const normalizedStatus = mode.toLowerCase();
    switch (normalizedStatus) {
      case "active":
        return styles.active;
      case "pending":
        return styles.pending;
      case "completed":
        return styles.completed;
      case "cancelled":
        return styles.cancelled;
      default:
        return styles.pending;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.companyInfo}>
          <img
            src={companyIcon}
            alt={`${company} logo`}
            className={styles.companyIcon}
          />
          <div className={styles.companyDetails}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.companyName}>{company}</p>
          </div>
        </div>
        <div className={styles.modeBadge}>
          <span className={`${styles.status} ${getStatusColor(mode)}`}>
            {mode || "no mode"}
          </span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.infoRow}>
          <i className={styles.icon}>📍</i>
          <span className={styles.location}>{location}</span>
        </div>

        <div className={styles.dateRange}>
          <div className={styles.infoRow}>
            <i className={styles.icon}>📅</i>
            <span>Start: {formatDate(startDate)}</span>
          </div>
          <div className={styles.infoRow}>
            <i className={styles.icon}>📅</i>
            <span>End: {formatDate(endDate)}</span>
          </div>
        </div>

        <div className={styles.infoRow}>
          <i className={styles.icon}>👥</i>
          <span>
            {studentCount} {studentCount === 1 ? "Student" : "Students"}
          </span>
        </div>
      </div>

      <div className={styles.cardActions}>
        {onEdit && (
          <button
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label={`Edit ${title} internship`}
          >
            <i className={styles.icon}>✏️</i>
            Edit
          </button>
        )}
        {onDelete && (
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Delete ${title} internship`}
          >
            <i className={styles.icon}>🗑️</i>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default InternshipCard;
