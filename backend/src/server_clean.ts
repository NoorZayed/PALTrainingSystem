import express, { Request, Response, Application } from "express";
import cors from "cors";
import db from "./db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

const app: Application = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic login endpoint
app.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const getUserQuery = `SELECT * FROM users WHERE email = ? AND password = ?`;
  
  db.query<RowDataPacket[]>(getUserQuery, [email, password], (err, users) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const user = users[0];
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  });
});

// Get supervisor details by ID - FIXING THE 404 ERROR
app.get("/api/supervisors/detail/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  
  const query = `
    SELECT supervisor_id as id, name, email, company_id
    FROM supervisors 
    WHERE supervisor_id = ?
  `;
  
  db.query<RowDataPacket[]>(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching supervisor details:", err);
      return res.status(500).json({ message: "Failed to fetch supervisor details" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Supervisor not found" });
    }
    
    res.json(results[0]);
  });
});

// Get published reports
app.get("/api/published-reports", (req: Request, res: Response) => {
  const query = `
    SELECT submit_report_id as id, month, year, course_subject, internship_type, 
           due_date, description
    FROM submit_report 
    WHERE status = 'published'
  `;
  
  db.query<RowDataPacket[]>(query, (err, results) => {
    if (err) {
      console.error("Error fetching published reports:", err);
      return res.status(500).json({ message: "Failed to fetch published reports" });
    }
    res.json(results);
  });
});

// Get students
app.get("/api/students", (req: Request, res: Response) => {
  const query = `
    SELECT s.student_id as id, s.first_name, s.last_name, u.email, s.major
    FROM students s
    LEFT JOIN users u ON s.student_id = u.id
    WHERE s.account_status = 'active'
  `;
  
  db.query<RowDataPacket[]>(query, (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ message: "Failed to fetch students" });
    }
    res.json(results);
  });
});

// Get student internship details
app.get("/api/student/:id/internship-details", (req: Request, res: Response) => {
  const { id } = req.params;
  
  const query = `
    SELECT s.student_id, s.first_name, s.last_name, 
           i.title as internship_title, i.start_date, i.end_date,
           sup.name as supervisor_name, c.name as company_name
    FROM students s
    LEFT JOIN applications a ON s.student_id = a.student_id AND a.status = 'accepted'
    LEFT JOIN internship i ON a.internship_id = i.internship_id  
    LEFT JOIN supervisors sup ON i.supervisor_id = sup.supervisor_id
    LEFT JOIN companies c ON i.company_id = c.company_id
    WHERE s.student_id = ?
  `;
  
  db.query<RowDataPacket[]>(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching student details:", err);
      return res.status(500).json({ message: "Failed to fetch student details" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json(results[0]);
  });
});

// Check if supervisor has already submitted a report
app.get("/api/supervisor/check-report-fixed", (req: Request, res: Response) => {
  const { studentId, month, year, supervisorName } = req.query;
  
  const checkQuery = `
    SELECT COUNT(*) as count 
    FROM report 
    WHERE student_id = ? AND supervisor_name = ? AND month = ? AND year = ?
  `;
  
  db.query<RowDataPacket[]>(checkQuery, [studentId, supervisorName, month, year], (err, results) => {
    if (err) {
      console.error("Error checking report:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    const exists = results[0]?.count > 0;
    res.json({ exists });
  });
});

// Submit supervisor report - FIXING THE 500 ERROR
app.post("/api/supervisor/submit-report", (req: Request, res: Response) => {
  const {
    student_id,
    course_subject,
    internship_type,
    month,
    year,
    full_name,
    supervisor_name,
    date_from,
    date_to,
    time_from,
    time_to,
    supervisor_comments
  } = req.body;

  // Generate a unique report ID
  const reportId = Math.floor(Math.random() * 1000000);

  const sql = `
    INSERT INTO report (
      report_id, student_id, course_subject, internship_type, month, year, full_name,
      supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    reportId,
    student_id,
    course_subject,
    internship_type,
    month,
    year,
    full_name,
    supervisor_name,
    date_from,
    date_to,
    time_from,
    time_to,
    supervisor_comments
  ], (err: any, result: any) => {
    if (err) {
      console.error("Error submitting supervisor report:", err);
      return res.status(500).json({ message: "Failed to submit report." });
    }
    res.json({ message: "Report submitted successfully." });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
