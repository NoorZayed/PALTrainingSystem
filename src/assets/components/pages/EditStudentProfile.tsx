import React, { useState, useEffect } from "react";
import styles from "../css/EditStudentProfile.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../utils/apiUtils";

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  major: string;
  location: string;
  interests: string[];
  about: string;
  skills: string[];
}

const EditStudentProfile: React.FC = () => {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [interestsInput, setInterestsInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const studentId = user?.id;
        if (!studentId) return;
        const response = await axios.get<Student>(
          `${API_BASE_URL}/api/students/${studentId}`
        );
        setStudentData(response.data);
      } catch (error) {
        console.error("Error fetching student data for edit:", error);
      }
    };

    fetchStudentData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStudentData((prevData) =>
      prevData ? { ...prevData, [name]: value } : null
    );
  };

  const handleAddInterest = () => {
    if (studentData && interestsInput.trim()) {
      setStudentData({
        ...studentData,
        interests: [...(studentData.interests || []), interestsInput.trim()],
      });
      setInterestsInput("");
    }
  };

  const handleRemoveInterest = (index: number) => {
    if (studentData && studentData.interests) {
      const updatedInterests = [...studentData.interests];
      updatedInterests.splice(index, 1);
      setStudentData({ ...studentData, interests: updatedInterests });
    }
  };

  const handleAddSkill = () => {
    if (studentData && skillsInput.trim()) {
      setStudentData({
        ...studentData,
        skills: [...(studentData.skills || []), skillsInput.trim()],
      });
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    if (studentData && studentData.skills) {
      const updatedSkills = [...studentData.skills];
      updatedSkills.splice(index, 1);
      setStudentData({ ...studentData, skills: updatedSkills });
    }
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const studentId = user?.id;
      if (!studentId || !studentData) return;
      await axios.put(`${API_BASE_URL}/api/students/${studentId}`, studentData);
      console.log("Student profile updated successfully!");
      navigate("/studentProfile");
    } catch (error: any) {
      console.error("Error updating student profile:", error);
      alert(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    navigate("/studentProfile");
  };

  if (!studentData) {
    return <div>Loading edit form...</div>;
  }

  return (
    <div className={styles.editContainer}>
      <div className={styles.header}>
        <button onClick={handleCancel} className={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h2>Edit Student Profile</h2>
      </div>
      <form className={styles.editForm}>
        <div className={styles.formGroup}>
          <label htmlFor="first_name">First Name:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={studentData.first_name || ""}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="second_name">Second Name:</label>
          <input
            type="text"
            id="second_name"
            name="second_name"
            value={studentData.last_name || ""}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="major">Major:</label>
          <input
            type="text"
            id="major"
            name="major"
            value={studentData.major || ""}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={studentData.location || ""}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="interests">Interests:</label>
          <div>
            {(studentData.interests || []).map((interest, index) => (
              <span key={index} className={styles.tag}>
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className={styles.removeTag}
                >
                  x
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add interest"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
            />
            <button type="button" onClick={handleAddInterest}>
              Add
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="skills">Skills:</label>
          <div>
            {(studentData.skills || []).map((skill, index) => (
              <span key={index} className={styles.tag}>
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className={styles.removeTag}
                >
                  x
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add skill"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <button type="button" onClick={handleAddSkill}>
              Add
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="about">About Me:</label>
          <textarea
            id="about"
            name="about"
            value={studentData.about || ""}
            onChange={handleChange}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleSave}
            className={styles.saveButton}
          >
            <FontAwesomeIcon icon={faSave} /> Save Changes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudentProfile;
