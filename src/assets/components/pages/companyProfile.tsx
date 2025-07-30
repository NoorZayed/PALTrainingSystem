import React, { useEffect, useState } from "react";
import styles from "../css/companyProfile.module.css";
import CompanyAside from "../Navbar/CompanyAside";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { API_BASE_URL } from '../utils/apiUtils';

interface Company {
  company_id: number;
  company_name: string;
  registration_number: string;
  contact_person: string | null;
  website: string;
  email: string;
  phone_number: string;
  location: string;
  about: string;
  industry: string;
  profile_image: string | null;
  reviews: string | null;
  internship_id: number | null;
}

const CompanyProfile: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate("/company/EditCompanyProfile");
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const companyID = user?.id;

    if (!companyID) {
      console.error("Company ID not found in localStorage");
      return;
    }

    axios
      .get<Company>(`${API_BASE_URL}/companies/${companyID}`)
      .then((response) => {
        setCompany(response.data);
      })
      .catch((error) => {
        console.error("Failed to load company", error);
      });
  }, []);

  if (!company) return <div>Loading...</div>;

  return (
    <div className={styles.profileContainer}>
      <CompanyAside />

      <main className={styles.mainContent}>
        <header className={styles.profileHeader}>
          <div className={styles.profilePicture}>
            <img src={`/uploads/${company.profile_image}`} alt="Company Logo" />
          </div>
          <div className={styles.profileInfo}>
            <h2>{company.company_name}</h2>
            <p>Industry: {company.industry}</p>
            <p>Location: {company.location}</p>
            <p>
              Website:{" "}
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit
              </a>
            </p>
            <div className={styles.profileButtons}>
              <button onClick={handleEditProfile} className={styles.editButton}>
                Edit Profile
              </button>
              <button>More</button>
            </div>
          </div>
        </header>

        <section className={styles.profileDetails}>
          <h3>About</h3>
          <p>{company.about || "No information provided yet."}</p>
        </section>

        <section className={styles.internships}>
          <h3>Available Internships</h3>
          <p>Check the internships section for more information.</p>
        </section>

        <section className={styles.reviews}>
          <h3>Company Reviews</h3>
          <p>{company.reviews ? company.reviews : "No reviews yet."}</p>
        </section>
      </main>
    </div>
  );
};

export default CompanyProfile;
