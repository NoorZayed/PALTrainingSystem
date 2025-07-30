import React from "react";
import styles from "../css/CertificationsPage.module.css";
import StudentAside from '../Navbar/studentAside';

export const certificates = [
  { 
    title: "Frontend Development", 
    issuedBy: "Coursera", 
    date: "Jan 2024", 
    certificateUrl: "https://example.com/certificate1.pdf" // Sample download URL
  },
  { 
    title: "React Basics", 
    issuedBy: "Udemy", 
    date: "Feb 2024", 
    certificateUrl: "https://example.com/certificate2.pdf" 
  },
  { 
    title: "TypeScript Essentials", 
    issuedBy: "Codecademy", 
    date: "Mar 2024", 
    certificateUrl: "https://example.com/certificate3.pdf" 
  },
  { 
    title: "UI/UX Design", 
    issuedBy: "Google", 
    date: "Apr 2024", 
    certificateUrl: "https://example.com/certificate4.pdf" 
  },
  { 
    title: "Agile Fundamentals", 
    issuedBy: "Scrum.org", 
    date: "May 2024", 
    certificateUrl: "https://example.com/certificate5.pdf" 
  }
];

const CertificationsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Sidebar - Aside Section */}
      <div className={styles.asideContainer}>
        <StudentAside />
      </div>

      {/* Main Content */}
      <div>
        <h2 className={styles.title}>All Training Certificates</h2>

        <div className={styles.grid}>
          {certificates.map((cert, index) => (
            <div key={index} className={styles.card}>
              <h4 className={styles.cardTitle}>{cert.title}</h4>
              <p className={styles.cardText}>Issued by: <span className={styles.issuer}>{cert.issuedBy}</span></p>
              <p className={styles.cardText}>Date: <span className={styles.date}>{cert.date}</span></p>

              <div className={styles.buttonContainer}>
                <button className={styles.viewDetailsButton}>View Details</button>
                {cert.certificateUrl && (
                  <a href={cert.certificateUrl} download className={styles.downloadButton}>Download</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificationsPage;