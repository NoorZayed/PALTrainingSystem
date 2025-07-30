import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/studentAside.module.css";
import dashboardIcon from "../../components/images/dashboard.png";
import messageIcon from "../../components/images/message.svg";
import absentIcon from "../../components/images/report.svg";
import reportIcon from "../../components/images/report.svg";
import logoutIcon from "../../components/images/logout.svg";
import profileIcon from "../../components/images/dashboard.png"; // Using dashboard icon as a placeholder for profile

function SupervisorAside() {
  const location = useLocation();
  return (
    <aside className={styles.aside}>
      <Link to="/supervisor/dashboard" className={`${styles.asideItem} ${location.pathname === "/supervisor/dashboard" ? styles.active : ""}`}>
        <img src={dashboardIcon} alt="Dashboard" className={styles.icon} /> Dashboard
      </Link>
      <Link to="/supervisor/messages" className={`${styles.asideItem} ${location.pathname === "/supervisor/messages" ? styles.active : ""}`}>
        <img src={messageIcon} alt="Messages" className={styles.icon} /> Messages
      </Link>
      <Link to="/supervisor/set-absent" className={`${styles.asideItem} ${location.pathname === "/supervisor/set-absent" ? styles.active : ""}`}>
        <img src={absentIcon} alt="Set Absent" className={styles.icon} /> Set Absent
      </Link>
      <Link to="/supervisor/reports" className={`${styles.asideItem} ${location.pathname === "/supervisor/reports" ? styles.active : ""}`}>
        <img src={reportIcon} alt="Reports" className={styles.icon} /> Reports
      </Link>
      <Link to="/supervisor/profile" className={`${styles.asideItem} ${location.pathname === "/supervisor/profile" ? styles.active : ""}`}>
        <img src={profileIcon} alt="Profile" className={styles.icon} /> Profile
      </Link>
      <Link
        to="/logout"
        className={`${styles.asideItem} ${
          location.pathname === "/logout" ? styles.active : ""
        }`}
      >
        <img src={logoutIcon} alt="Logout" className={styles.icon} /> Logout
      </Link>
    </aside>
  );
}
export default SupervisorAside;
