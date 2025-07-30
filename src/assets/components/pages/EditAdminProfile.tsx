import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";
import { API_BASE_URL } from '../utils/apiUtils';

const EditAdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<any>(null);
  const adminId = JSON.parse(localStorage.getItem("user") || "{}").id;

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/${adminId}`);
        const data = await res.json();
        setAdminData(data);
      } catch (err) {
        console.error("Failed to load admin profile", err);
      }
    };
    fetchAdmin();
  }, [adminId]);

  const handleSave = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }

      alert("Profile updated successfully.");
      navigate("/admin/AdminProfile");
    } catch (error) {
      alert("Something went wrong while updating.");
    }
  };

  const handleCancel = () => navigate("/admin/AdminProfile");

  if (!adminData) return <div>Loading...</div>;

  const profileData = {
    id: adminData.admin_id,
    name: adminData.admin_name,
    email: adminData.email,
    phone_number: adminData.phone_number,
    about: adminData.about,
    profile_image: adminData.profile_image,
    university_name: adminData.uni_name,
  };

  return (
    <EditProfile
      userType="admin"
      initialData={profileData}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default EditAdminProfile;
