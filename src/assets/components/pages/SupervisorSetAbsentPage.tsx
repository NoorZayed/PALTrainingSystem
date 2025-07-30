import React, { useState, useEffect } from "react";
import SupervisorAside from "../Navbar/SupervisorAside";
import styles from "../css/SupervisorSetAbsentPage.module.css";
import axios from "axios";
import { API_BASE_URL } from '../utils/apiUtils';

interface Student {
  id: number;
  name: string;
  student_id: number;
  first_name: string;
  last_name: string;
  isAbsent: boolean;
  reason?: string;
  absenceCount: number;
  absenceHistory: { date: string; reason?: string }[];
}

const SupervisorSetAbsentPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ open: boolean; student?: Student }>({ open: false });

  // Get user info from localStorage (assuming supervisor is logged in)
  const supervisorInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const supervisorId = supervisorInfo?.id;

  // Fetch students supervised by this supervisor (only accepted students)
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch only accepted students for this supervisor
        const res = await axios.get(
          `${API_BASE_URL}/api/supervisor/${supervisorId}/accepted-students`
        );
        // Each row: student_id, first_name, last_name, internship_id
        const transformedStudents = res.data.map((row: any) => ({
          id: row.student_id,
          student_id: row.student_id,
          name: `${row.first_name} ${row.last_name}`,
          first_name: row.first_name,
          last_name: row.last_name,
          isAbsent: false,
          absenceCount: 0,
          absenceHistory: [],
        }));
        setStudents(transformedStudents);
        // Fetch absence history for each student
        for (const student of transformedStudents) {
          fetchStudentAbsenceHistory(student.id);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again later.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [supervisorId]);

  // Fetch absence history for a student
  const fetchStudentAbsenceHistory = async (studentId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/${studentId}/absences`);
      
      // Update the student with absence history
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === studentId 
            ? {
                ...student,
                absenceCount: response.data.length,
                absenceHistory: response.data.map((absence: any) => ({
                  date: new Date(absence.date).toISOString().split('T')[0],
                  reason: absence.reason
                }))
              } 
            : student
        )
      );
    } catch (err) {
      console.error(`Error fetching absence history for student ${studentId}:`, err);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAbsentChange = (id: number) => {
    setStudents(students.map(s =>
      s.id === id ? { ...s, isAbsent: !s.isAbsent } : s
    ));
  };

  const handleReasonChange = (id: number, reason: string) => {
    setStudents(students.map(s =>
      s.id === id ? { ...s, reason } : s
    ));
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setStudents(students.map(s => ({ ...s, isAbsent: !selectAll })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter students marked as absent
    const absentStudents = students.filter(s => s.isAbsent);
    
    if (absentStudents.length === 0) {
      alert("No students marked as absent.");
      return;
    }
    
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }
    
    try {
      // Send attendance data to the server
      await axios.post(`${API_BASE_URL}/api/attendance`, {
        supervisor_id: supervisorId,
        date: selectedDate,
        absences: absentStudents.map(student => ({
          student_id: student.id,
          reason: student.reason || null
        }))
      });
      
      // Update local state
      setStudents(prev => prev.map(s => {
        if (s.isAbsent) {
          const alreadyAbsentToday = s.absenceHistory.some(h => h.date === selectedDate);
          if (!alreadyAbsentToday) {
            return {
              ...s,
              absenceCount: s.absenceCount + 1,
              absenceHistory: [...s.absenceHistory, { date: selectedDate, reason: s.reason }],
              isAbsent: false,
              reason: ""
            };
          }
        }
        return { ...s, isAbsent: false, reason: "" };
      }));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Error submitting absences:", err);
      alert("Failed to submit absences. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <SupervisorAside />
      <div className={styles.abscontent}>
        <h2>Set Student Absence</h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {loading ? (
          <div className={styles.loadingState}>Loading students...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.absentForm}>
            <div className={styles.absentFormRow}>
              <label>
                Date:
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
              </label>
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.absentSearch}
              />
            </div>
            <div className={styles.absentTableWrapper}>
              <table className={styles.studentTable}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        title="Select all"
                      />
                    </th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Absent</th>
                    <th>Reason</th>
                    <th>History</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={7} className={styles.absentNoStudents}>No students found.</td></tr>
                  )}
                  {filteredStudents.map(student => (
                    <tr key={student.id} className={
                      student.isAbsent ? styles.absentRow :
                      student.absenceCount >= 3 ? styles.absentHighCountRow : undefined
                    }>
                      <td>
                        <input
                          type="checkbox"
                          checked={student.isAbsent}
                          onChange={() => handleAbsentChange(student.id)}
                          title={`Mark ${student.name} as absent`}
                        />
                      </td>
                      <td>{student.student_id}</td>
                      <td>{student.name}</td>
                      <td>
                        <span className={student.isAbsent ? styles.absentStatus : styles.presentStatus}>
                          {student.isAbsent ? "Absent" : "Present"}
                        </span>
                      </td>
                      <td>
                        <span className={student.absenceCount >= 3 ? styles.absentHighCount : undefined}>
                          {student.absenceCount}
                        </span>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Reason (optional)"
                          value={student.reason || ""}
                          onChange={e => handleReasonChange(student.id, e.target.value)}
                          disabled={!student.isAbsent}
                          className={styles.absentReasonInput}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.absentHistoryBtn}
                          onClick={() => {
                            if (
                              historyModal.open &&
                              historyModal.student &&
                              historyModal.student.id === student.id
                            ) {
                              setHistoryModal({ open: false });
                            } else {
                              setHistoryModal({ open: true, student });
                            }
                          }}
                        >
                          {(historyModal.open && historyModal.student && historyModal.student.id === student.id)
                            ? "Hide"
                            : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="submit" className={styles.actionButton}>Submit Absence</button>
            {showSuccess && (
              <div className={styles.absentSuccessToast}>Absence submitted!</div>
            )}
          </form>
        )}
        
        {historyModal.open && historyModal.student && (
          <div className={styles.absentHistoryModal}>
            <div className={styles.absentHistoryModalContent}>
              <h3>Absence History for {historyModal.student.name}</h3>
              {historyModal.student.absenceHistory.length === 0 ? (
                <p>No absences recorded.</p>
              ) : (
                <table className={styles.absentHistoryTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyModal.student.absenceHistory.map((h, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{h.date}</strong>
                        </td>
                        <td>
                          {h.reason ? h.reason : <span className={styles.absentNoReason}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                onClick={() => setHistoryModal({ open: false })}
                className={styles.actionButton}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorSetAbsentPage;
