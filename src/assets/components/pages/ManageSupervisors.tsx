import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../css/SupervisorManagement.module.css";
import CompanyAside from "../Navbar/CompanyAside";
import { API_BASE_URL } from "../utils/apiUtils";

interface Supervisor {
  id: number;
  name: string;
  email: string;
}

interface Internship {
  id: number;
  title: string;
}

// New interface for the shortcut table
interface InternshipWithSupervisors {
  internship_id: number;
  title: string;
  location: string;
  start_date: string;
  supervisor_id: number | null;
  supervisor_name: string | null;
  co_supervisor_id: number | null;
  co_supervisor_name: string | null;
}

interface AssignedSupervisors {
  supervisor: Supervisor | null;
  coSupervisor: Supervisor | null;
}

const ManageSupervisors: React.FC = () => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [newSupervisor, setNewSupervisor] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null); // NEW state for delete

  const companyId = 1; // Replace with session later

  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<
    number | null
  >(null);
  const [assignSupervisorId, setAssignSupervisorId] = useState<number | null>(
    null
  );
  const [assignCoSupervisorId, setAssignCoSupervisorId] = useState<
    number | null
  >(null);
  const [assignedSupervisors, setAssignedSupervisors] =
    useState<AssignedSupervisors>({ supervisor: null, coSupervisor: null });

  // New state for the shortcut table
  const [internshipsWithSupervisors, setInternshipsWithSupervisors] = useState<
    InternshipWithSupervisors[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Add new state for search/filter
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSupervisors, setFilteredSupervisors] = useState<Supervisor[]>(
    []
  );

  useEffect(() => {
    fetchSupervisors();
    fetchInternships();
    fetchInternshipsWithSupervisors(); // New fetch for the shortcut table
  }, []);

  useEffect(() => {
    if (selectedInternshipId) {
      fetchAssignedSupervisors(selectedInternshipId);
    } else {
      setAssignedSupervisors({ supervisor: null, coSupervisor: null });
      // Clear the assignment dropdowns when no internship is selected
      setAssignSupervisorId(null);
      setAssignCoSupervisorId(null);
    }
  }, [selectedInternshipId]);

  // Add new useEffect to handle filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSupervisors(supervisors);
      return;
    }

    const filtered = supervisors.filter(
      (supervisor) =>
        supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredSupervisors(filtered);
  }, [searchTerm, supervisors]);

  const fetchSupervisors = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/supervisors/${companyId}`
      );
      setSupervisors(response.data);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const handleAddSupervisor = async () => {
    if (!newSupervisor.name.trim()) {
      alert("Supervisor name cannot be empty.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/supervisors`, {
        company_id: companyId,
        name: newSupervisor.name,
        email: newSupervisor.email,
        password: newSupervisor.password,
      });
      setNewSupervisor({ name: "", email: "", password: "" });
      fetchSupervisors();
      alert("Supervisor added successfully!");
    } catch (error) {
      console.error("Error adding supervisor:", error);
      alert("Error adding supervisor.");
    }
  };

  const handleEdit = (supervisor: Supervisor) => {
    setEditingId(supervisor.id);
    setNewSupervisor({
      name: supervisor.name,
      email: supervisor.email,
      password: "",
    });
    setDeleteId(null); // prevent delete conflict
  };

  const handleSaveEdit = async () => {
    if (!newSupervisor.name.trim()) {
      alert("Supervisor name cannot be empty.");
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/api/supervisors/${editingId}`, {
        name: newSupervisor.name,
        email: newSupervisor.email,
      });
      setEditingId(null);
      setNewSupervisor({ name: "", email: "", password: "" });
      fetchSupervisors();
      alert("Supervisor updated successfully!");
    } catch (error) {
      console.error("Error updating supervisor:", error);
      alert("Error updating supervisor.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewSupervisor({ name: "", email: "", password: "" });
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setEditingId(null); // prevent edit conflict
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/supervisors/${deleteId}`);
      fetchSupervisors();
      setDeleteId(null);
      alert("Supervisor deleted successfully!");
    } catch (error) {
      console.error("Error deleting supervisor:", error);
      alert("Error deleting supervisor.");
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const fetchInternships = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/internships/company/${companyId}`
      );
      setInternships(response.data);
    } catch (error) {
      console.error("Error fetching internships:", error);
    }
  };

  const fetchAssignedSupervisors = async (internshipId: number) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/internships/${internshipId}/supervisors`
      );

      const data = response.data;

      // Transform the backend response to match the expected frontend structure
      setAssignedSupervisors({
        supervisor: data.supervisor_id
          ? {
              id: data.supervisor_id,
              name: data.supervisor_name,
              email: data.supervisor_email,
            }
          : null,
        coSupervisor: data.co_supervisor_id
          ? {
              id: data.co_supervisor_id,
              name: data.co_supervisor_name,
              email: data.co_supervisor_email,
            }
          : null,
      });

      // Pre-populate the assignment dropdowns with current assignments
      setAssignSupervisorId(data.supervisor_id || null);
      setAssignCoSupervisorId(
        data.co_supervisor_id === 0 ? null : data.co_supervisor_id || null
      );
    } catch (error) {
      console.error("Error fetching assigned supervisors:", error);
      setAssignedSupervisors({ supervisor: null, coSupervisor: null });
      // Reset dropdowns if there's an error
      setAssignSupervisorId(null);
      setAssignCoSupervisorId(null);
    }
  };

  // New function to fetch internships with their assigned supervisors
  const fetchInternshipsWithSupervisors = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/company/${companyId}/internships-with-supervisors`
      );
      setInternshipsWithSupervisors(response.data);
    } catch (error) {
      console.error("Error fetching internships with supervisors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh data after assignment
  const handleAssignSupervisors = async () => {
    if (!selectedInternshipId) {
      alert("Please select an internship.");
      return;
    }

    if (!assignSupervisorId) {
      alert("Please select a supervisor.");
      return;
    }

    try {
      const payload = {
        supervisor_id: assignSupervisorId,
        co_supervisor_id: assignCoSupervisorId || null,
      };

      console.log("Assigning supervisors payload:", payload);

      await axios.put(
        `${API_BASE_URL}/api/internships/${selectedInternshipId}/supervisors`,
        payload
      );

      alert("Supervisors updated successfully!");
      fetchAssignedSupervisors(selectedInternshipId);
      fetchInternshipsWithSupervisors(); // Refresh the shortcut table
      // Don't clear the form - keep the current assignments visible
    } catch (error: any) {
      console.error("Error assigning supervisors:", error.response || error);
      alert(
        error.response?.data?.message ||
          "Error assigning supervisors. Check the server logs."
      );
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.container}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Manage Supervisors</h2>
          <p className={styles.pageDescription}>
            Add, edit, or assign supervisors to internships
          </p>
        </div>

        <section className={styles.formCard}>
          <h3 className={styles.sectionTitle}>
            {editingId ? "Edit Supervisor" : "Add New Supervisor"}
          </h3>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="supervisorName" className={styles.formLabel}>
                Name
              </label>
              <input
                id="supervisorName"
                type="text"
                value={newSupervisor.name}
                onChange={(e) =>
                  setNewSupervisor({ ...newSupervisor, name: e.target.value })
                }
                className={styles.input}
                placeholder="Enter supervisor name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="supervisorEmail" className={styles.formLabel}>
                Email
              </label>
              <input
                id="supervisorEmail"
                type="email"
                value={newSupervisor.email}
                onChange={(e) =>
                  setNewSupervisor({ ...newSupervisor, email: e.target.value })
                }
                className={styles.input}
                placeholder="Enter supervisor email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="supervisorPassword" className={styles.formLabel}>
              {editingId
                ? "New Password (leave empty to keep current)"
                : "Password"}
            </label>
            <input
              id="supervisorPassword"
              type="password"
              value={newSupervisor.password}
              onChange={(e) =>
                setNewSupervisor({ ...newSupervisor, password: e.target.value })
              }
              className={styles.input}
              placeholder={
                editingId ? "Enter new password (optional)" : "Enter password"
              }
            />
          </div>

          <div className={styles.formActions}>
            <button
              onClick={editingId ? handleSaveEdit : handleAddSupervisor}
              className={styles.primaryButton}
              aria-label={editingId ? "Update supervisor" : "Add supervisor"}
            >
              {editingId ? "Update Supervisor" : "Add Supervisor"}
            </button>
            {editingId !== null && (
              <button
                onClick={handleCancelEdit}
                className={styles.cancelButton}
                aria-label="Cancel editing supervisor"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className={styles.formCard}>
          <h3 className={styles.sectionTitle}>Existing Supervisors</h3>

          {/* Add search box for supervisors */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search supervisors by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearSearchButton}
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className={styles.supervisorsList}>
            {filteredSupervisors.length === 0 ? (
              <div className={styles.emptyState}>
                {supervisors.length === 0 ? (
                  <p>No supervisors found. Add your first supervisor above.</p>
                ) : (
                  <p>
                    No supervisors match your search. Try a different search
                    term.
                  </p>
                )}
              </div>
            ) : (
              filteredSupervisors.map((s) => (
                <div key={s.id} className={styles.supervisorCard}>
                  <div className={styles.supervisorInfo}>
                    <h4 className={styles.supervisorName}>{s.name}</h4>
                    <p className={styles.supervisorEmail}>{s.email}</p>
                  </div>
                  <div className={styles.supervisorActions}>
                    <button
                      onClick={() => handleEdit(s)}
                      className={styles.editButton}
                      aria-label={`Edit ${s.name}`}
                    >
                      Edit
                    </button>

                    {deleteId === s.id ? (
                      <div className={styles.deleteConfirm}>
                        <span>Confirm delete?</span>
                        <button
                          onClick={handleConfirmDelete}
                          className={styles.confirmYesButton}
                          aria-label={`Confirm delete ${s.name}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className={styles.confirmNoButton}
                          aria-label="Cancel delete"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(s.id)}
                        className={styles.deleteButton}
                        aria-label={`Delete ${s.name}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Assignment Section */}
        <section className={styles.formCard}>
          <h3 className={styles.sectionTitle}>
            Assign Supervisors to Internships
          </h3>

          <div className={styles.formGroup}>
            <label htmlFor="internshipSelect" className={styles.formLabel}>
              Select Internship
            </label>
            <select
              id="internshipSelect"
              value={selectedInternshipId || ""}
              onChange={(e) => setSelectedInternshipId(Number(e.target.value))}
              className={styles.input}
              aria-label="Select internship"
              title="Select an internship to assign supervisors to"
            >
              <option value="">-- Select an Internship --</option>
              {internships.map((internship) => (
                <option key={internship.id} value={internship.id}>
                  {internship.title}
                </option>
              ))}
            </select>
          </div>

          {selectedInternshipId && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label
                    htmlFor="supervisorSelect"
                    className={styles.formLabel}
                  >
                    Supervisor
                  </label>
                  <select
                    id="supervisorSelect"
                    value={assignSupervisorId || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAssignSupervisorId(value ? Number(value) : null);
                    }}
                    className={styles.input}
                    aria-label="Select supervisor"
                    title="Select supervisor for the internship"
                  >
                    <option value="">-- Select Supervisor --</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label
                    htmlFor="coSupervisorSelect"
                    className={styles.formLabel}
                  >
                    Co-Supervisor (Optional)
                  </label>
                  <select
                    id="coSupervisorSelect"
                    value={assignCoSupervisorId || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAssignCoSupervisorId(value ? Number(value) : null);
                    }}
                    className={styles.input}
                    aria-label="Select co-supervisor"
                    title="Select co-supervisor for the internship (optional)"
                  >
                    <option value="">-- Select Co-Supervisor --</option>
                    <option value="0">None</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  onClick={handleAssignSupervisors}
                  className={styles.primaryButton}
                  aria-label="Update supervisor assignments for this internship"
                >
                  Update Supervisors
                </button>
              </div>
            </>
          )}

          {selectedInternshipId &&
            (assignedSupervisors.supervisor ||
              assignedSupervisors.coSupervisor) && (
              <div className={styles.assignmentInfoCard}>
                <h4 className={styles.assignmentInfoTitle}>
                  Current Assignment
                </h4>

                <div className={styles.assignmentDetails}>
                  {assignedSupervisors.supervisor && (
                    <div className={styles.assignmentItem}>
                      <span className={styles.assignmentLabel}>
                        Supervisor:
                      </span>
                      <span className={styles.assignmentValue}>
                        {assignedSupervisors.supervisor.name}
                      </span>
                    </div>
                  )}
                  {assignedSupervisors.coSupervisor && (
                    <div className={styles.assignmentItem}>
                      <span className={styles.assignmentLabel}>
                        Co-Supervisor:
                      </span>
                      <span className={styles.assignmentValue}>
                        {assignedSupervisors.coSupervisor.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </section>

        {/* New Shortcut Table Section */}
        <section className={styles.formCard}>
          <h3 className={styles.sectionTitle}>
            Current Supervisor Assignments
          </h3>

          {isLoading ? (
            <div className={styles.loadingState}>Loading assignments...</div>
          ) : internshipsWithSupervisors.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No internships found or no supervisors assigned yet.</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.assignmentsTable}>
                <thead>
                  <tr>
                    <th>Internship Title</th>
                    <th>Location</th>
                    <th>Start Date</th>
                    <th>Supervisor</th>
                    <th>Co-Supervisor</th>
                  </tr>
                </thead>
                <tbody>
                  {internshipsWithSupervisors.map((internship) => (
                    <tr key={internship.internship_id}>
                      <td>{internship.title}</td>
                      <td>{internship.location}</td>
                      <td>{formatDate(internship.start_date)}</td>
                      <td>
                        {internship.supervisor_name ? (
                          <span className={styles.supervisorTag}>
                            {internship.supervisor_name}
                          </span>
                        ) : (
                          <span className={styles.unassignedTag}>
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td>
                        {internship.co_supervisor_name &&
                        internship.co_supervisor_id !== 0 ? (
                          <span className={styles.coSupervisorTag}>
                            {internship.co_supervisor_name}
                          </span>
                        ) : (
                          <span className={styles.unassignedTag}>None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ManageSupervisors;
