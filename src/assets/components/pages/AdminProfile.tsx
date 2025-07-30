import React, { useEffect, useState } from "react";
import styles from "../css/adminProfile.module.css";
import AdminAside from "../Navbar/AdminAside";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../utils/apiUtils';

interface Admin {
  admin_id: number;
  admin_name: string;
  university_name?: string;
  email: string;
  phone_number: string;
  profile_image: string | null;
  about: string | null;
}

const AdminProfile: React.FC = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const navigate = useNavigate();
  const adminId = JSON.parse(localStorage.getItem("user") || "{}").id;

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/${adminId}`);
        if (!res.ok) throw new Error("Failed to fetch admin data");
        const data = await res.json();

        const formattedAdmin: Admin = {
          admin_id: data.admin_id,
          admin_name: data.admin_name,
          university_name: data.uni_name,
          email: data.email,
          phone_number: data.phone_number,
          profile_image: data.profile_image,
          about: data.about,
        };

        setAdmin(formattedAdmin);
      } catch (err) {
        console.error("Error fetching admin:", err);
      }
    };

    fetchAdmin();
  }, [adminId]);

  const handleEditProfile = () => {
    navigate("/admin/EditAdminProfile");
  };

  if (!admin) return <div>Loading...</div>;

  return (
    <div className={styles.profileContainer}>
      <AdminAside />
      <main className={styles.mainContent}>
        <header className={styles.profileHeader}>
          <div className={styles.profilePicture}>
            <img
              src={
                admin.profile_image
                  ? `/uploads/${admin.profile_image}`
                  : "https://via.placeholder.com/150"
              }
              alt={`${admin.admin_name}'s Profile`}
            />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.adminName}>{admin.admin_name}</h1>
            <p className={styles.adminRole}>Training Coordinator</p>
            <ul className={styles.contactInfo}>
              {admin.university_name && <li>{admin.university_name}</li>}
              <li>
                <a href={`mailto:${admin.email}`}>{admin.email}</a>
              </li>
              <li>{admin.phone_number}</li>
            </ul>
            <button onClick={handleEditProfile} className={styles.editButton}>
              Edit Profile
            </button>
          </div>
        </header>

        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>About Me</h2>
          <p className={styles.sectionContent}>
            {admin.about || "No information provided yet."}
          </p>
        </section>
      </main>
    </div>
  );
};

export default AdminProfile;
