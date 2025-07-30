import React from 'react';
import styles from '../../css/StudentTable.module.css';

interface Student {
  student_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  account_status?: string;
  created_at?: string;
  // Fallbacks for old interface
  id?: string;
  name?: string;
  status?: string;
  joinDate?: string;
}

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  if (!students || students.length === 0) {
    return <div className={styles.noData}>No student data available</div>;
  }

  // Get initials for avatar
  const getInitials = (firstName?: string, lastName?: string, name?: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return 'S';
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.student_id || student.id}>
              <td>{student.student_id || student.id}</td>
              <td className={styles.nameCell}>
                <div className={styles.avatar}>
                  {getInitials(student.first_name, student.last_name, student.name)}
                </div>
                {`${student.first_name || ''} ${student.last_name || ''}`.trim() || student.name}
              </td>
              <td>{student.email || 'No email'}</td>
              <td>
                <span className={`${styles.status} ${styles[(student.account_status || student.status || 'unknown').toLowerCase()]}`}>
                  {student.account_status || student.status || 'Unknown'}
                </span>
              </td>
              <td>{formatDate(student.created_at) || student.joinDate || 'Unknown'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export default StudentTable; 