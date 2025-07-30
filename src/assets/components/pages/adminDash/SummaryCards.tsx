import React from "react";
import styles from "../../css/SummaryCards.module.css";

interface SummaryStats {
  reports: number;
  companies: number;
  tasks: number;
  students: number;
}

interface SummaryCardsProps {
  stats: SummaryStats;
}

// Icon components using emojis - replace with actual icons if available
const ReportIcon = () => <span>📝</span>;
const CompanyIcon = () => <span>🏢</span>;
const StudentsIcon = () => <span>👥</span>;

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Reports",
      value: stats.reports.toLocaleString(),
      icon: <ReportIcon />,
    },
    {
      title: "Companies",
      value: stats.companies.toLocaleString(),
      icon: <CompanyIcon />,
    },
    {
      title: "Students",
      value: stats.students.toLocaleString(),
      icon: <StudentsIcon />,
    },
  ];

  return (
    <div className={styles.cardContainer}>
      {cards.map((card, index) => (
        <div key={index} className={styles.card}>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          <p className={styles.cardValue}>{card.value}</p>
          <div className={styles.cardIcon}>{card.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
