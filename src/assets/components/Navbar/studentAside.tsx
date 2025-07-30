// components/Aside.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/studentAside.module.css";
import dashboardIcon from "../../components/images/dashboard.png";
import requestIcon from "../../components/images/request.svg";
import searchIcon from "../../components/images/search.svg";
import reportIcon from "../../components/images/report.svg";
import profileIcon from "../../components/images/profile.svg";
import saveListIcon from "../../components/images/saveList.svg";
import logoutIcon from "../../components/images/logout.svg";
import messageIcon from "../../components/images/message.svg";

function StudentAside() {
  const location = useLocation();

  return (
    <aside className={styles.aside}>
      <Link
        to="/student/studentDashboard"
        className={`${styles.asideItem} ${
          location.pathname === "/student/studentDashboard" ? styles.active : ""
        }`}
      >
        <img src={dashboardIcon} alt="Dashboard" className={styles.icon} /> Dashboard
      </Link>
      <Link
        to="/student/requests"
        className={`${styles.asideItem} ${
          location.pathname === "/student/requests" ? styles.active : ""
        }`}
      >
        <img src={requestIcon} alt="Request" className={styles.icon} /> Request
      </Link>
      <Link
        to="/student/InternshipSearch"
        className={`${styles.asideItem} ${
          location.pathname === "/student/InternshipSearch" ? styles.active : ""
        }`}
      >
        <img src={searchIcon} alt="Search" className={styles.icon} /> Search
      </Link>
      <Link
        to="/student/Report"
        className={`${styles.asideItem} ${
          location.pathname === "/student/Report" ? styles.active : ""
        }`}
      >
        <img src={reportIcon} alt="Report" className={styles.icon} /> Report
      </Link>
      <Link
        to="/student/messages"
        className={`${styles.asideItem} ${
          location.pathname === "/student/messages" ? styles.active : ""
        }`}
      >
        <img src={messageIcon} alt="Messages" className={styles.icon} />{" "}
        Messages
      </Link>
      <Link
        to="/StudentProfile"
        className={`${styles.asideItem} ${
          location.pathname === "/StudentProfile" ? styles.active : ""
        }`}
      >
        <img src={profileIcon} alt="Profile" className={styles.icon} /> Profile
      </Link>
      <Link
        to="/student/save-list"
        className={`${styles.asideItem} ${
          location.pathname === "/student/save-list" ? styles.active : ""
        }`}
      >
        <img src={saveListIcon} alt="Save list" className={styles.icon} /> Save
        list
      </Link>
      <Link
        to="/ResetPassword"
        className={`${styles.asideItem} ${
          location.pathname === "/ResetPassword" ? styles.active : ""
        }`}
      >
        <img src={saveListIcon} alt="ResetPassword" className={styles.icon} />{" "}
        Reset Password
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

export default StudentAside;
