import React, { useState, useEffect } from "react";
import styles from "../css/EditCompanyProfile.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Company {
  company_id: number;
  company_name: string;
  contact_person: string | null;
  website: string;
  email: string;
  phone_number: string;
  location: string;
  about: string;
  industry: string;
}

const EditCompanyProfile: React.FC = () => {
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const companyId = user?.id;
        if (!companyId) return;
        const response = await axios.get<Company>(`/api/companies/${companyId}`);
        setCompanyData(response.data);
      } catch (error) {
        console.error("Error fetching company data for edit:", error);
      }
    };

    fetchCompanyData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => (prevData ? { ...prevData, [name]: value } : null));
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const companyId = user?.id;
      if (!companyId || !companyData) return;
      await axios.put(`/api/companies/${companyId}`, companyData);
      console.log("Company profile updated successfully!");
      navigate("/company/profile");
    } catch (error: any) {
      console.error("Error updating company profile:", error);
      alert(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    navigate("/company/profile");
  };

  if (!companyData) {
    return <div>Loading edit form...</div>;
  }

  return (
    <div className={styles.editContainer}>
      <div className={styles.header}>
        <button onClick={handleCancel} className={styles.backButton}>
          {/* <FontAwesomeIcon icon={faArrowLeft} /> Back */}back
        </button>
        <h2>Edit Company Profile</h2>
      </div>
      <form className={styles.editForm}>
        <div className={styles.formGroup}>
          <label htmlFor="company_name">Company Name:</label>
          <input type="text" id="company_name" name="company_name" value={companyData.company_name || ""} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="contact_person">Contact Person:</label>
          <input type="text" id="contact_person" name="contact_person" value={companyData.contact_person || ""} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="website">Website:</label>
          <input type="url" id="website" name="website" value={companyData.website || ""} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={companyData.email || ""} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone_number">Phone Number:</label>
          <input type="tel" id="phone_number" name="phone_number" value={companyData.phone_number || ""} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" name="location" value={companyData.location || ""} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="about">About Us:</label>
          <textarea id="about" name="about" value={companyData.about || ""} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="industry">Industry:</label>
          <input type="text" id="industry" name="industry" value={companyData.industry || ""} onChange={handleChange} />
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" onClick={handleSave} className={styles.saveButton}>Save Changes
            {/* <FontAwesomeIcon icon={faSave} /> Save Changes */}
          </button>
          <button type="button" onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCompanyProfile;