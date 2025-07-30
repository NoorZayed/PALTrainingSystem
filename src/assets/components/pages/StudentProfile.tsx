import React, { useEffect, useState } from "react";
import styles from "../css/StudentProfile.module.css";
import Aside from "../Navbar/studentAside";
import InternshipSearch from "./InternshipSearch";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

interface Student {
  id?: string;
  student_id: string;
  first_name: string;
  second_name: string;
  major: string;
  location: string;
  interests: string[];
  internshipApplications: string[];
  about: string;
  skills: string[];
  profile_image: string | null;
  education?: string;
  experience?: string;
  gpa?: number;
  contact_email?: string;
  phone?: string;
  graduation_year?: string;
  achievements?: string[];
}

const StudentProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"self" | "other">("self");

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);

      try {
        // If we have an ID in the URL, fetch that specific student
        if (id) {
          setViewMode("other");
          const res = await axios.get<Student>(
            `${API_BASE_URL}/api/students/${id}`
          );
          console.log("Response from server:", res.data);
          const data = res.data;
          processStudentData(data);
        } else {
          // Otherwise, fetch the logged-in student's profile
          const userStr = localStorage.getItem("user");
          if (!userStr) {
            setError("You must be logged in to view your profile");
            setLoading(false);
            return;
          }

          const user = JSON.parse(userStr);
          if (user.role === "student") {
            const res = await axios.get<Student>(
              `${API_BASE_URL}/api/students/${user.id}`
            );
            console.log("Response from server:", res.data);
            const data = res.data;
            processStudentData(data);
          }
        }
      } catch (error) {
        console.error("Failed to load student data:", error);
        setError("Failed to load student data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const processStudentData = (data: any) => {
      // Process interests
      if (typeof data.interests === "string") {
        try {
          data.interests = JSON.parse(data.interests);
        } catch {
          data.interests = [];
        }
      } else if (!Array.isArray(data.interests)) {
        data.interests = [];
      }

      // Process internship applications
      if (typeof data.internshipApplications === "string") {
        try {
          data.internshipApplications = JSON.parse(data.internshipApplications);
        } catch {
          data.internshipApplications = [];
        }
      } else if (!Array.isArray(data.internshipApplications)) {
        data.internshipApplications = [];
      }

      // Process skills
      if (typeof data.skills === "string") {
        try {
          data.skills = JSON.parse(data.skills);
        } catch {
          data.skills = [];
        }
      } else if (!Array.isArray(data.skills)) {
        data.skills = [];
      }

      // Process achievements if available
      if (typeof data.achievements === "string") {
        try {
          data.achievements = JSON.parse(data.achievements);
        } catch {
          data.achievements = [];
        }
      } else if (!Array.isArray(data.achievements)) {
        data.achievements = [];
      }

      setStudent(data);
    };

    fetchStudent();
  }, [id]);

  const handleEditProfile = () => {
    navigate("/student/EditStudentProfile");
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className={styles.profileContainer}>
      {viewMode === "self" && <Aside />}
      <main className={styles.mainContent}>
        {location.pathname === "/search" ? (
          <InternshipSearch />
        ) : loading ? (
          <p className={styles.loadingMessage}>Loading profile...</p>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={handleGoBack} className={styles.backButton}>
              Go Back
            </button>
          </div>
        ) : !student ? (
          <p className={styles.errorMessage}>Student not Found</p>
        ) : (
          <>
            {viewMode === "other" && (
              <div className={styles.backNavigation}>
                <button onClick={handleGoBack} className={styles.backButton}>
                  &larr; Back to Requests
                </button>
              </div>
            )}

            <header className={styles.profileHeader}>
              <div className={styles.profilePicture}>
                <img
                  src={
                    student.profile_image
                      ? `/uploads/${student.profile_image}`
                      : "/assets/components/images/default-profile.png"
                  }
                  alt="student profile"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "/assets/components/images/default-profile.png";
                  }}
                />
              </div>
              <div className={styles.profileInfo}>
                <h2>
                  {student.first_name} {student.second_name}
                </h2>
                <p>{student.major} student at Birzeit University</p>
                <p>{student.location}</p>
                {viewMode === "self" && (
                  <div className={styles.profileButtons}>
                    <button onClick={handleEditProfile}>Edit profile</button>
                  </div>
                )}
              </div>
            </header>

            <section className={styles.profileDetails}>
              <h3>About</h3>
              <p>{student.about || "No information provided."}</p>
            </section>

            {/* Education Section */}
            <section className={styles.educationSection}>
              <h3>Education</h3>
              <div className={styles.educationDetails}>
                <p>
                  <strong>Major:</strong> {student.major}
                </p>
                {student.graduation_year && (
                  <p>
                    <strong>Expected Graduation:</strong>{" "}
                    {student.graduation_year}
                  </p>
                )}
                {student.gpa && (
                  <p>
                    <strong>GPA:</strong> {student.gpa}
                  </p>
                )}
                {student.education && <p>{student.education}</p>}
              </div>
            </section>

            {/* Experience Section */}
            {student.experience && (
              <section className={styles.experienceSection}>
                <h3>Experience</h3>
                <p>{student.experience}</p>
              </section>
            )}

            <section className={styles.skills}>
              <h3>Skills</h3>
              <div className={styles.skillsContainer}>
                {student.skills && student.skills.length > 0 ? (
                  student.skills.map((skill, index) => (
                    <div key={index} className={styles.skillsTag}>
                      {skill}
                    </div>
                  ))
                ) : (
                  <p>No skills listed</p>
                )}
              </div>
            </section>

            <section className={styles.interests}>
              <h3>Interests</h3>
              <div className={styles.interestsContainer}>
                {student.interests && student.interests.length > 0 ? (
                  student.interests.map((interest, index) => (
                    <div key={index} className={styles.interestTag}>
                      {interest}
                    </div>
                  ))
                ) : (
                  <p>No interests listed</p>
                )}
              </div>
            </section>

            {/* Achievements Section */}
            {student.achievements && student.achievements.length > 0 && (
              <section className={styles.achievementsSection}>
                <h3>Achievements</h3>
                <ul className={styles.achievementsList}>
                  {student.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Contact Information */}
            <section className={styles.contactSection}>
              <h3>Contact Information</h3>
              <div className={styles.contactDetails}>
                {student.contact_email && (
                  <p>
                    <strong>Email:</strong> {student.contact_email}
                  </p>
                )}
                {student.phone && (
                  <p>
                    <strong>Phone:</strong> {student.phone}
                  </p>
                )}
                <p>
                  <strong>Location:</strong> {student.location}
                </p>
              </div>
            </section>

            {viewMode === "self" && (
              <section className={styles.internshipRequests}>
                <h3>Internship Applications</h3>
                {student.internshipApplications &&
                student.internshipApplications.length === 0 ? (
                  <p>No internship requests yet.</p>
                ) : (
                  student.internshipApplications &&
                  student.internshipApplications.map((application, idx) => (
                    <div key={idx} className={styles.requestItem}>
                      <h4>{application}</h4>
                      <p>Status: Pending</p>
                      <div className={styles.pendingStatus}>Pending</div>
                    </div>
                  ))
                )}
                <Link to="/student/requests" className={styles.showMore}>
                  Show all requests
                </Link>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StudentProfile;
