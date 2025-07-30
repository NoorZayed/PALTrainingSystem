import React, { useState, useEffect } from "react";
import styles from "../css/EditProfile.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCamera } from "@fortawesome/free-solid-svg-icons";

interface ProfileData {
  id: number | string;
  name: string;
  email: string;
  phone_number: string;
  about: string | null;
  profile_image?: string | null;
  [key: string]: any;
}

interface EditProfileProps {
  userType: "admin" | "student" | "company";
  initialData: ProfileData;
  onSave: (data: ProfileData) => Promise<void>;
  onCancel: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({
  userType,
  initialData,
  onSave,
  onCancel,
}) => {
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData.profile_image || null
  );
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setProfileData((prevData) => ({ ...prevData, profile_image: file.name }));
    }
  };

  const handleSaveClick = async () => {
    try {
      await onSave(profileData);
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const getTitle = () => {
    switch (userType) {
      case "admin":
        return "Edit Admin Profile";
      case "student":
        return "Edit Student Profile";
      case "company":
        return "Edit Company Profile";
      default:
        return "Edit Profile";
    }
  };

  return (
    <div className={styles.editContainer}>
      <div className={styles.header}>
        <button onClick={onCancel} className={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h2>{getTitle()}</h2>
      </div>
      <form className={styles.editForm}>
        <div className={styles.profileImageSection}>
          <div className={styles.imageContainer}>
            <img
              src={previewImage || `/uploads/default-${userType}.jpg`}
              alt="Profile Preview"
              className={styles.profileImage}
            />
            <label htmlFor="profile_image" className={styles.imageUploadLabel}>
              <FontAwesomeIcon icon={faCamera} />
              <span>Change Photo</span>
            </label>
            <input
              type="file"
              id="profile_image"
              name="profile_image"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.imageInput}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone_number">Phone Number:</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={profileData.phone_number || ""}
            onChange={handleChange}
          />
        </div>

        {userType === "company" && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="website">Website:</label>
              <input
                type="url"
                id="website"
                name="website"
                value={profileData.website || ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="industry">Industry:</label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={profileData.industry || ""}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {userType === "student" && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="major">Major:</label>
              <input
                type="text"
                id="major"
                name="major"
                value={profileData.major || ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={profileData.location || ""}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="about">About Me:</label>
          <textarea
            id="about"
            name="about"
            value={profileData.about || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleSaveClick}
            className={styles.saveButton}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
