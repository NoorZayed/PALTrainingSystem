// components/CompanyAside.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/studentAside.module.css";
import dashboardIcon from "../../components/images/dashboard.png";
import internshipIcon from "../../components/images/internship.png";
import requestIcon from "../../components/images/request.svg";
import reportIcon from "../../components/images/report.svg";
import profileIcon from "../../components/images/profile.svg";
import logoutIcon from "../../components/images/logout.svg";
import messageIcon from "../../components/images/message.svg";
import studentsIcon from "../../components/images/students.png";
function AdminAside() {
  const location = useLocation();

  return (
    <aside className={styles.aside}>
      <Link
        to="/adminDashboard"
        className={`${styles.asideItem} ${
          location.pathname === "/adminDashboard" ? styles.active : ""
        }`}
      >
        <img src={dashboardIcon} alt="adminDashboard" className={styles.icon} />{" "}
        Dashboard
      </Link>
      <Link
        to="/admin/InternshipAdminPage"
        className={`${styles.asideItem} ${
          location.pathname === "/admin/InternshipAdminPage"
            ? styles.active
            : ""
        }`}
      >
        <img src={internshipIcon} alt="Internships" className={styles.icon} />{" "}
        Internships
      </Link>
      {/* <Link
        to="/admin/StudentRequests"
        className={`${styles.asideItem} ${
          location.pathname === "/admin/StudentRequests" ? styles.active : ""
        }`}
      >
        <img src={requestIcon} alt="StudentRequests" className={styles.icon} />{" "}
        Requests
      </Link> */}
      <Link
        to="/admin/AdminViewStudents"
        className={`${styles.asideItem} ${
          location.pathname === "/admin/AdminViewStudents" ? styles.active : ""
        }`}
      >
        <img
          src={studentsIcon}
          alt="AdminViewStudents"
          className={styles.icon}
        />{" "}
        Students Management
      </Link>
      <Link
        to="/admin/TrainingReportsPage"
        className={`${styles.asideItem} ${
          location.pathname === "/admin/TrainingReportsPage"
            ? styles.active
            : ""
        }`}
      >
        <img src={reportIcon} alt="Reports" className={styles.icon} /> Reports
      </Link>
      <Link
        to="/admin/adminMessages"
        className={`${styles.asideItem} ${
          location.pathname === "/admin/adminMessages" ? styles.active : ""
        }`}
      >
        <img src={messageIcon} alt="Messages" className={styles.icon} />{" "}
        Messages
      </Link>
      <Link
        to="/admin/AdminProfile"
        className={`${styles.asideItem} ${
          location.pathname === "/admin/AdminProfile" ? styles.active : ""
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

export default AdminAside;
