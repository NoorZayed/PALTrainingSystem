// components/CompanyAside.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/studentAside.module.css";
import dashboardIcon from "../../components/images/dashboard.png";
import internshipIcon from "../../components/images/internship.png";
import superIcon from "../../components/images/super.png";

import requestIcon from "../../components/images/request.svg";
import reportIcon from "../../components/images/report.svg";
import profileIcon from "../../components/images/profile.svg";
import logoutIcon from "../../components/images/logout.svg";
import messageIcon from "../../components/images/message.svg";

function CompanyAside() {
  const location = useLocation();

  return (
    <aside className={styles.aside}>
      <Link
        to="/company/CompanyDashboard"
        className={`${styles.asideItem} ${
          location.pathname === "/company/CompanyDashboard" ? styles.active : ""
        }`}
      >
        <img src={dashboardIcon} alt="Dashboard" className={styles.icon} />{" "}
        Dashboard
      </Link>
      
      <Link
        to="/company/supervisors"
        className={`${styles.asideItem} ${
          location.pathname === "/company/supervisors" ? styles.active : ""
        }`}
      >
        <img src={superIcon} alt="Supervisors" className={styles.icon} />{" "}
        Supervisors
      </Link>
      <Link
        to="/company/internships"
        className={`${styles.asideItem} ${
          location.pathname === "/company/internships" ? styles.active : ""
        }`}
      >
        <img src={internshipIcon} alt="Internships" className={styles.icon} />{" "}
        Internships
      </Link>
      <Link
        to="/company/requests"
        className={`${styles.asideItem} ${
          location.pathname === "/company/requests" ? styles.active : ""
        }`}
      >
        <img src={requestIcon} alt="Requests" className={styles.icon} />{" "}
        Requests
      </Link>
      <Link
        to="/company/reports"
        className={`${styles.asideItem} ${
          location.pathname === "/company/reports" ? styles.active : ""
        }`}
      >
        <img src={reportIcon} alt="Reports" className={styles.icon} /> Reports
      </Link>
      
      <Link
        to="/company/Profile"
        className={`${styles.asideItem} ${
          location.pathname === "/company/Profile" ? styles.active : ""
        }`}
      >
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

export default CompanyAside;
