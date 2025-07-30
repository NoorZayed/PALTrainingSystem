import React, { useEffect, useState } from 'react';
import styles from '../css/CompanyPages.module.css';
import CompanyAside from '../Navbar/CompanyAside';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiUtils';

const SupervisorManager: React.FC = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  // Get the company ID from the logged-in user data in localStorage
  const companyId = JSON.parse(localStorage.getItem('user') || '{}')?.company_id || 1;

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/supervisors/${companyId}`);
      setSupervisors(res.data);
    } catch (err) {
      alert('Failed to fetch supervisors.');
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/supervisors`, { ...form, company_id: companyId });
      fetchSupervisors();
    } catch (err) {
      alert('Failed to add supervisor.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/supervisors/${id}`);
      fetchSupervisors();
    } catch (err) {
      alert('Failed to delete supervisor.');
    }
  };

  return (
    <div className={styles.container}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <h2>Manage Supervisors</h2>
        <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
        <button onClick={handleAdd}>Add Supervisor</button>
        <ul>
          {supervisors.map((sup: any) => (
            <li key={sup.id}>
              {sup.name} ({sup.email})
              <button onClick={() => handleDelete(sup.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default SupervisorManager;
