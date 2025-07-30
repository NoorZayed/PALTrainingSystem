import express, { Request, Response, Application } from "express";
import cors from "cors";
import db from "./db";  // Ensure db.ts exists and is correctly configured
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";
import { QueryError } from "mysql2";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import ExcelJS from "exceljs";
import path from "path";
import { sendVerificationEmail } from "./utils/sendVerificationEmail";
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { randomBytes } from "crypto";

dotenv.config();

const app: Application = express();
const PORT = 5000;

const upload = multer({ dest: "uploads/" });
//const router = express.Router();

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON request bodies

app.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const getUserQuery = `SELECT * FROM users WHERE email = ? AND password = ?`;

  db.query<RowDataPacket[]>(getUserQuery, [email, password], (err, users) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    if (user.role === "student") {
      const studentQuery = "SELECT is_first_login FROM students WHERE student_id = ?";
      db.query<RowDataPacket[]>(studentQuery, [user.id], (err, students) => {
        if (err) return res.status(500).json({ message: "DB error (student check)" });
        if (!students || students.length === 0) {
          return res.status(404).json({ message: "Student record not found." });
        }

        const isFirstLogin = students[0].is_first_login === 1;

        return res.json({
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            isFirstLogin,
          },
        });
      });
    } else {
      return res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      });
    }
  });
});

//contact us
app.post("/contact", (req: Request, res: Response) => {
  const { first_name, last_name, email, phone_number, message } = req.body;

  const sql = `INSERT INTO contact_messages (first_name, last_name, email, phone_number, message) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [first_name, last_name, email, phone_number, message], (err) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ success: false, message: "Database error." });
      }

      res.json({ success: true, message: "Message sent successfully!" });
  });
});


//student's profile
app.get("/api/students/:studentID", (req: Request, res: Response) => {
  const { studentID } = req.params;

  const sql = "SELECT * FROM students WHERE student_id = ?";
  db.query<RowDataPacket[]>(sql, [studentID], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const student = result[0];

try {
  let interestIds: number[] = [];
let applications: any[] = [];
let skills: string[] = [];

try {
  if (typeof student.interests === "string" && student.interests.trim().startsWith("[")) {
    interestIds = JSON.parse(student.interests);
  } else if (Array.isArray(student.interests)) {
    interestIds = student.interests;
  }

  if (typeof student.internshipApplications === "string" && student.internshipApplications.trim().startsWith("[")) {
    applications = JSON.parse(student.internshipApplications);
  } else if (Array.isArray(student.internshipApplications)) {
    applications = student.internshipApplications;
  }

  if (typeof student.skills === "string" && student.skills.trim().startsWith("[")) {
    skills = JSON.parse(student.skills);
  } else if (Array.isArray(student.skills)) {
    skills = student.skills;
  }
} catch (err) {
  console.error("Parsing error:", err);
  interestIds = [];
  applications = [];
  skills = [];
}

if (!Array.isArray(interestIds) || interestIds.length === 0) {
  student.interests = [];
  student.internshipApplications = applications;
  student.skills = skills;
  return res.json(student);
}

      const interestQuery = `
        SELECT interest_id, name FROM interests
        WHERE interest_id IN (${interestIds.map(() => '?').join(',')})
      `;

      db.query<RowDataPacket[]>(interestQuery, interestIds, (err, interestsResult) => {
        if (err) {
          console.error("Error fetching interest names:", err);
          return res.status(500).json({ success: false, message: "Failed to fetch interests." });
        }

        // show interests in student's profile
        const interestNames = interestsResult.map(row => row.name);

        student.interests = interestNames;
        student.internshipApplications = applications;
        student.skills = skills;

        res.json(student);
      });
    } catch (err) {
      console.error("Parsing error:", err);
      student.interests = [];
      student.internshipApplications = [];
      student.skills = [];
      console.log("Final student object being returned:", student);
res.json(student);

      res.json(student);
    }
  });
});


//edit student profile
app.put("/api/students/:studentID", (req: Request, res: Response) => {
  const { studentID } = req.params;
  const {
    first_name,
    last_name,
    major,
    location,
    interests,
    skills,
    about,
  } = req.body;

  const updateStudentSql = `
    UPDATE students
    SET 
      first_name = ?,
      last_name = ?,
      major = ?,
      location = ?,
      skills = ?,
      about = ?
    WHERE student_id = ?
  `;

  db.query(
    updateStudentSql,
    [
      first_name,
      last_name,
      major,
      location,
      JSON.stringify(skills || []),
      about,
      studentID,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating student:", err);
        return res.status(500).json({ message: "Student update failed" });
      }

      // sync student_interests
      const deleteSql = "DELETE FROM student_interests WHERE student_id = ?";
      db.query(deleteSql, [studentID], (delErr) => {
        if (delErr) {
          console.error("Error deleting old interests:", delErr);
          return res.status(500).json({ message: "Failed to remove old interests" });
        }

        if (!interests || interests.length === 0) {
          return res.status(200).json({ message: "Student updated successfully" });
        }

        //interest_ids from interests table
        const selectSql = `SELECT interest_id, name FROM interests WHERE name IN (?)`;
        db.query<RowDataPacket[]>(selectSql, [interests], (selErr, rows) => {
          if (selErr) {
            console.error("Error fetching interest IDs:", selErr);
            return res.status(500).json({ message: "Failed to fetch interests" });
          }

          const insertValues = rows.map((row: any) => [studentID, row.interest_id]);
          if (insertValues.length === 0) {
            return res.status(200).json({ message: "Student updated with no matched interests" });
          }

          const insertSql = "INSERT INTO student_interests (student_id, interest_id) VALUES ?";
          db.query(insertSql, [insertValues], (insErr) => {
            if (insErr) {
              console.error("Error inserting interests:", insErr);
              return res.status(500).json({ message: "Failed to insert new interests" });
            }

            res.status(200).json({ message: "Student and interests updated successfully" });
          });
        });
      });
    }
  );
});


// company profile 
app.get("/companies/:companyID", (req: Request, res: Response) => {
  const { companyID } = req.params;
  const sql = "SELECT * FROM company WHERE company_id = ?";
  db.query<RowDataPacket[]>(sql, [companyID], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    const company = result[0];
    res.json(company);
  });
});


app.post("/api/reset-password", (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userQuery = "SELECT * FROM users WHERE email = ?";
  db.query<RowDataPacket[]>(userQuery, [email], (err, users) => {
    if (err) return res.status(500).json({ message: "Database error while fetching user." });
    if (users.length === 0) return res.status(404).json({ message: "User not found." });

    const user = users[0];

    // update password in users table
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    db.query(updatePasswordQuery, [password, email], (err) => {
      if (err) return res.status(500).json({ message: "Failed to update password." });

      if (user.role === "student") {
        // update is_first_login in students table
        const updateLoginStatusQuery = "UPDATE students SET is_first_login = false WHERE student_id = ?";
        db.query(updateLoginStatusQuery, [user.id], (err) => {
          if (err) return res.status(500).json({ message: "Failed to update login status for student." });

          return res.json({ message: "Password reset and first login flag updated for student." });
        });
      } else {
        // For company or manager, only update the password
        return res.json({ message: "Password updated successfully." });
      }
    });
  });
});

//student's form 
app.post("/api/student-form", (req: Request, res: Response) => {
  const {
    student_id,
    major,
    sex,
    phoneNumber,
    location,
    interests, 
    skills,
    description,
    gpa,
    graduationYear,
    completedHours,
    experience,
    certifications,
    languages,
    linkedin,
    portfolio,
    preferredTraining,
    availability
  } = req.body;

  // if (!student_id || !Array.isArray(interests)) {
  //   return res.status(400).json({ message: "Invalid student ID or interests." });
  // }
  const updateQuery = `
    UPDATE students SET
      major = ?,
      sex = ?,
      phone = ?,
      location = ?,
      interests = ?,
      skills = ?,
      about = ?,
      gpa = ?,
      graduation_year = ?,
      completed_hours = ?,
      experience = ?,
      certifications = ?,
      languages = ?,
      linkedin = ?,
      portfolio = ?,
      preferred_training = ?,
      availability = ?,
      is_first_login = 0

    WHERE student_id = ?
  `;

  const updateValues = [
    major,
    sex,
    phoneNumber,
    location,
    JSON.stringify(interests), 
    JSON.stringify(skills),
    description,
    gpa,
    graduationYear,
    completedHours,
    experience,
    certifications,
    languages,
    linkedin,
    portfolio,
    preferredTraining,
    availability,
    student_id
  ];

  db.query(updateQuery, updateValues, (err) => {
    if (err) {
      console.error("Failed to update student profile:", err);
      return res.status(500).json({ message: "Failed to update profile." });
    }

    // clear old student_interests
    const deleteQuery = "DELETE FROM student_interests WHERE student_id = ?";
    db.query(deleteQuery, [student_id], (delErr) => {
      if (delErr) {
        console.error("Failed to clear old interests:", delErr);
        return res.status(500).json({ message: "Failed to refresh interests." });
      }

      // insert each interest id
      if (interests.length === 0) {
        return res.json({ message: "Profile updated. No interests selected." });
      }

      const insertQuery = `
        INSERT INTO student_interests (student_id, interest_id)
        VALUES ?
      `;
      const values = interests.map((id: number) => [student_id, id]);

      db.query(insertQuery, [values], (insertErr) => {
        if (insertErr) {
          console.error("Failed to insert new interests:", insertErr);
          return res.status(500).json({ message: "Profile updated but interests failed." });
        }

        return res.json({ message: "Student profile updated successfully." });
      });
    });
  });
});

//filter for students to show internships recommendations
app.get("/api/recommended-internships/:studentId", (req: Request, res: Response) => {
  const { studentId } = req.params;

  const studentQuery = `
    SELECT location FROM students WHERE student_id = ?
  `;

  db.query<RowDataPacket[]>(studentQuery, [studentId], (err, studentResult) => {
    if (err || studentResult.length === 0) {
      console.error("Student not found or DB error", err);
      return res.status(500).json({ message: "Student not found or DB error." });
    }

    const studentLocation = studentResult[0].location;

    // get student's interests
    const interestQuery = `
      SELECT interest_id FROM student_interests WHERE student_id = ?
    `;

    db.query<RowDataPacket[]>(interestQuery, [studentId], (err, interestRows) => {
      if (err) {
        console.error("Error fetching interests", err);
        return res.status(500).json({ message: "Error fetching interests." });
      }

      const interestIds = interestRows.map(row => row.interest_id);
      if (interestIds.length === 0) {
        return res.json([]); //no matches
      }

      const placeholders = interestIds.map(() => '?').join(',');

      // match internships with location and interests
      const internshipQuery = `
        SELECT DISTINCT i.internship_id, i.title, i.location, i.duration, i.start_date, i.company_id,
               c.company_name AS company, c.profile_image
        FROM internship i
        JOIN internship_interests ii ON i.internship_id = ii.internship_id
        JOIN company c ON i.company_id = c.company_id
        WHERE ii.interest_id IN (${placeholders}) AND i.location = ?
      `;

      db.query<RowDataPacket[]>(internshipQuery, [...interestIds, studentLocation], (err, internships) => {
        if (err) {
          console.error("Failed to fetch recommended internships:", err);
          return res.status(500).json({ message: "Database error." });
        }

        res.json(internships);
      });
    });
  });
});

//student report form
app.post("/api/report", (req: Request, res: Response) => {
  const {
    student_id,
    courseSubject,
    internshipType,
    month,
    year,
    fullName,
    supervisorName,
    startDate,
    endDate,
    startTime,
    endTime,
    supervisorComments,
  } = req.body;

  // if (!student_id) {
  //   return res.status(400).json({ message: "Missing student ID." });
  // }

  const insertQuery = `
    INSERT INTO report (
      student_id, course_subject, internship_type, month, year, full_name,
      supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments, grade
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [
      student_id,
      courseSubject,
      internshipType,
      month,
      year,
      fullName,
      supervisorName,
      startDate,
      endDate,
      startTime,
      endTime,
      supervisorComments,
      null  // Default grade to null
    ],
    (err) => {
      if (err) {
        console.error("Failed to insert report:", err);
        return res.status(500).json({ message: "Database error." });
      }
      return res.json({ message: "Report submitted successfully." });
    }
  );
});

//endpoint for student request page
app.get("/api/internships/student/:studentId", (req: Request, res: Response) => {
  const { studentId } = req.params;

  const sql = `
    SELECT 
      internship.internship_id,
      internship.industry,
      internship.status,
      internship.company_id,
      company.company_name
    FROM internship
    LEFT JOIN company ON internship.company_id = company.company_id
    WHERE internship.student_id = ?
  `;

  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Failed to fetch internships:", err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json(results);
  });
});

// show internships for students in internship search page
app.get("/api/internships", (req: Request, res: Response) => {
  const sql = `
    SELECT 
      i.internship_id,
      i.title,
      i.location,
      i.duration,
      i.start_date,
      i.company_id,
      c.company_name AS company
    FROM internship i
    JOIN company c ON i.company_id = c.company_id
  `;

  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) {
      console.error("Error fetching internships:", err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json(results);
  });
});


// saved internship list by student
//post to add the internship to the list
app.post("/api/students/:studentId/save", (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { internshipId } = req.body;

  const getQuery = "SELECT saved_internships FROM students WHERE student_id = ?";
  db.query<RowDataPacket[]>(getQuery, [studentId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching student." });

    let saved = [];
    try {
      saved = JSON.parse(results[0].saved_internships || '[]');
    } catch {}

    if (!saved.includes(internshipId)) {
      saved.push(internshipId);
    }

    const updateQuery = "UPDATE students SET saved_internships = ? WHERE student_id = ?";
    db.query(updateQuery, [JSON.stringify(saved), studentId], (err) => {
      if (err) return res.status(500).json({ message: "Error saving internship." });
      res.json({ message: "Internship saved." });
    });
  });
});

// get to load saved internships
app.get("/api/students/:studentId/saved-internships", (req: Request, res: Response) => {
  const { studentId } = req.params;
  console.log("Fetching saved internships for student:", studentId);

  const getQuery = `SELECT saved_internships FROM students WHERE student_id = ?`;
  db.query<RowDataPacket[]>(getQuery, [studentId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Failed to retrieve saved internships." });
    }

    if (results.length === 0) {
      console.warn("No student found with that ID.");
      return res.status(404).json({ message: "Student not found." });
    }

    let savedIds: number[] = [];
    try {
      savedIds = JSON.parse(results[0].saved_internships || '[]');
      console.log("Parsed saved internship IDs:", savedIds);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return res.status(500).json({ message: "Invalid saved data format." });
    }

    if (!savedIds.length) return res.json([]);

    const placeholders = savedIds.map(() => '?').join(',');

    const sql = `
      SELECT 
        i.internship_id,
        i.title,
        c.company_name AS company,
        i.location,
        c.profile_image AS profile_image
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.internship_id IN (${placeholders})
    `;

    db.query<RowDataPacket[]>(sql, savedIds, (err, data) => {
      if (err) {
        console.error("SQL error when loading internships:", err);
        return res.status(500).json({ message: "Error retrieving internship data." });
      }

      res.json(data);
    });
  });
});

//remove internship from saved list in student's saved internships list
app.delete("/api/students/:studentId/saved-internships/:internshipId", (req: Request, res: Response) => {
  const { studentId, internshipId } = req.params;

  const getQuery = `SELECT saved_internships FROM students WHERE student_id = ?`;
  db.query<RowDataPacket[]>(getQuery, [studentId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching saved internships:", err);
      return res.status(500).json({ message: "Student not found." });
    }

    let saved: number[] = [];
    try {
      saved = JSON.parse(results[0].saved_internships || '[]');
    } catch (parseErr) {
      console.error("Failed to parse saved_internships:", parseErr);
      return res.status(500).json({ message: "Corrupted saved_internships format." });
    }

    const updated = saved.filter(id => id !== parseInt(internshipId));

    const updateQuery = `UPDATE students SET saved_internships = ? WHERE student_id = ?`;
    db.query(updateQuery, [JSON.stringify(updated), studentId], (updateErr) => {
      if (updateErr) {
        console.error("Error updating saved_internships:", updateErr);
        return res.status(500).json({ message: "Failed to update saved list." });
      }

      res.json({ message: "Internship removed from saved list." });
    });
  });
});

//student apply action endpoint
app.post("/api/internships/apply", (req: Request, res: Response) => {
  const { student_id, internship_id, motivation_letter } = req.body;

  //check daily application limit
  const dailyLimitQuery = `
    SELECT COUNT(*) AS count
    FROM applications
    WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;

  db.query<RowDataPacket[]>(dailyLimitQuery, [student_id], (limitErr, limitResult) => {
    if (limitErr) {
      console.error("Error checking daily limit:", limitErr);
      return res.status(500).json({ message: "Database error." });
    }

    const applicationsToday = limitResult[0]?.count ?? 0;
    if (applicationsToday >= 10) {
      return res.status(429).json({
        message: "Daily limit reached. You can apply to a maximum of 10 internships per day.",
      });
    }

    //check if already applied
    const checkQuery = `
      SELECT * FROM applications 
      WHERE student_id = ? AND internship_id = ?
    `;

    db.query<RowDataPacket[]>(checkQuery, [student_id, internship_id], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking existing application:", checkErr);
        return res.status(500).json({ message: "Database error." });
      }

      if (checkResult.length > 0) {
        return res.status(409).json({
          message: "You have already applied to this internship.",
        });
      }

      // insert application 
      const insertQuery = `
        INSERT INTO applications (student_id, internship_id, motivation_letter)
        VALUES (?, ?, ?)
      `;

      db.query(insertQuery, [student_id, internship_id, motivation_letter || null], (insertErr) => {
        if (insertErr) {
          console.error("Error inserting application:", insertErr);
          return res.status(500).json({ message: "Failed to apply to internship." });
        }

        return res.status(201).json({ message: "Application submitted successfully." });
      });
    });
  });
});


app.get("/api/applications/daily-count/:studentId", (req: Request, res: Response) => {
  const { studentId } = req.params;

  const sql = `
    SELECT COUNT(*) AS count
    FROM applications
    WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;

  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching daily count:", err);
      return res.status(500).json({ message: "Database error." });
    }

    const count = results[0]?.count ?? 0;
    res.json({ count });
  });
});

//students application
app.get("/api/applications/:studentId", (req: Request, res: Response) => {
  const { studentId } = req.params;

  const sql = `
    SELECT 
      a.internship_id,
      a.status,
      i.title AS title,
      c.company_name AS company_name
    FROM applications a
    JOIN internship i ON a.internship_id = i.internship_id
    JOIN company c ON i.company_id = c.company_id
    WHERE a.student_id = ?
  `;

  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching student applications:", err);
      return res.status(500).json({ message: "Database error." });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "No applications found for this student." });
    }
    
    res.json(results);
  });
});

//cancel application request
app.delete("/api/applications/cancel/:studentId/:internshipId", (req: Request, res: Response) => {
  const { studentId, internshipId } = req.params;

  const query = `
    DELETE FROM applications
    WHERE student_id = ? AND internship_id = ?
  `;

  db.query<RowDataPacket[]>(query, [studentId, internshipId], (err, result) => {
    if (err) {
      console.error("Error deleting application:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application canceled successfully" });
  });
});

//confirm application by student
app.post("/api/applications/confirm", (req: Request, res: Response) => {
  const { student_id, internship_id } = req.body;

  const sqlConfirm = `
    UPDATE applications 
    SET status = 'accepted', is_confirmed = 1
    WHERE student_id = ? AND internship_id = ?
  `;

  const sqlDeleteOthers = `
    DELETE FROM applications 
    WHERE student_id = ? AND internship_id != ? AND status = 'accepted'
  `;

  db.query(sqlConfirm, [student_id, internship_id], (err) => {
    if (err) {
      console.error("Error confirming internship:", err);
      return res.status(500).json({ message: "Failed to confirm internship." });
    }

    db.query(sqlDeleteOthers, [student_id, internship_id], (err) => {
      if (err) {
        console.error("Error deleting other accepted applications:", err);
        return res.status(500).json({ message: "Failed to clean up other applications." });
      }

      res.json({ message: "Internship confirmed and others removed." });
    });
  });
});

//check if there exists an accepted application
app.get("/api/applications/:studentId/is-confirmed", (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT COUNT(*) AS count 
    FROM applications 
    WHERE student_id = ? AND is_confirmed = 1
  `;

  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error checking confirmation:", err);
      return res.status(500).json({ message: "Server error" });
    }

    const confirmed = results[0].count > 0;
    res.json({ isConfirmed: confirmed });
  });
});

//show supervisor name for student messaging system
app.get("/api/supervisors/by-student/:studentId", (req: Request, res: Response) => {
  const { studentId } = req.params;

  const sql = `
    SELECT s.supervisor_id, s.name
    FROM applications a
    JOIN internship i ON a.internship_id = i.internship_id
    LEFT JOIN supervisors s ON s.supervisor_id IN (i.supervisor_id, i.co_supervisor_id)
    WHERE a.student_id = ? AND a.status = 'accepted'
  `;

  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching supervisors:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch supervisors." });
    }

    res.json(results);
  });
});

//get all majors
app.get("/api/majors", (req: Request, res: Response) => {
  const sql = "SELECT * FROM majors";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to fetch majors:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

//get interests by major's name
app.get("/api/interests/by-major-name/:majorName", (req: Request, res: Response) => {
  const { majorName } = req.params;
  const sql = `
    SELECT i.interest_id, i.name 
    FROM interests i
    JOIN majors m ON i.major_id = m.major_id
    WHERE m.name = ?
  `;
  db.query(sql, [majorName], (err, results) => {
    if (err) {
      console.error("Failed to fetch interests by major name:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

//student dashboard
//show current internship in student dashboard
app.get("/api/student/:studentId/active-internship", (req, res) => {
  const studentId = req.params.studentId;

  const sql = `
    SELECT 
      i.internship_id,
      i.title,
      i.location,
      i.start_date,
      i.end_date,
      a.status,
      c.company_name AS company,
      c.profile_image
    FROM applications a
    JOIN internship i ON a.internship_id = i.internship_id
    JOIN company c ON i.company_id = c.company_id
    WHERE a.student_id = ? AND a.is_confirmed = 1
    LIMIT 1
  `;

  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching confirmed internship:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.json(null);
    }
    res.json(results[0]);
  });
});

//number of applications
app.get("/api/student/:studentId/dashboard-stats", (req, res) => {
  const { studentId } = req.params;

  const sqlApplications = `SELECT COUNT(*) AS applications FROM applications WHERE student_id = ?`;
  const sqlSaved = `SELECT saved_internships FROM students WHERE student_id = ?`;
  const sqlLocation = `SELECT location FROM students WHERE student_id = ?`;
  const sqlInterests = `SELECT interest_id FROM student_interests WHERE student_id = ?`;

  //pplications
  db.query<RowDataPacket[]>(sqlApplications, [studentId], (err, appResults) => {
    if (err) return res.status(500).json({ message: "Failed to get application count" });

    const applications = appResults[0].applications;

    // saved internships
    db.query<RowDataPacket[]>(sqlSaved, [studentId], (err, savedResults) => {
      if (err) return res.status(500).json({ message: "Failed to get saved internships" });

      const savedRaw = savedResults[0]?.saved_internships || "[]";
      let saved = 0;
      try {
        const savedArray = JSON.parse(savedRaw);
        saved = Array.isArray(savedArray) ? savedArray.length : 0;
      } catch (e) {
        console.error("Saved internships parsing error:", e);
      }

      // location
      db.query<RowDataPacket[]>(sqlLocation, [studentId], (err, locResults) => {
        if (err || locResults.length === 0) return res.status(500).json({ message: "Failed to get location" });

        const location = locResults[0].location;

        // interests
        db.query<RowDataPacket[]>(sqlInterests, [studentId], (err, intResults) => {
          if (err) return res.status(500).json({ message: "Failed to get interests" });

          const interestIds = intResults.map(row => row.interest_id);
          if (interestIds.length === 0) return res.json({ applications, saved, matches: 0 });

          const placeholders = interestIds.map(() => "?").join(",");
          const sqlMatches = `
            SELECT COUNT(DISTINCT i.internship_id) AS matches
            FROM internship i
            JOIN internship_interests ii ON i.internship_id = ii.internship_id
            WHERE ii.interest_id IN (${placeholders}) AND i.location = ?
          `;

          db.query<RowDataPacket[]>(sqlMatches, [...interestIds, location], (err, matchResults) => {
            if (err) return res.status(500).json({ message: "Failed to get matches" });

            const matches = matchResults[0].matches;
            res.json({ applications, saved, matches });
          });
        });
      });
    });
  });
});



// add students from admin csv file
app.post("/api/import-students", upload.single("file"), (req: Request, res: Response): void => {
  const filePath = req.file?.path;

  if (!filePath) {
    console.error("No file was uploaded.");
    res.status(400).json({ message: "File is missing." });
    return; 
  }

  const students: any[] = [];

  fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (row) => {
    if (!row["University ID"] || !row["Email"]) return;

    students.push({
      id: row["University ID"].trim(),
      email: row["Email"].trim(),
      first_name: row["First Name"].trim(),
      last_name: row["Last Name"].trim(),
      phone: row["Phone"]?.trim() || "",
      major: row["Major"]?.trim() || "",
      gpa: parseFloat(row["GPA"]) || 0,
    });
  })
  .on("end", async () => {
    if (students.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "No valid student data found." });
    }

    const userInsert = `
      INSERT IGNORE INTO users (id,first_name,last_name, email,password, role)
      VALUES ?
    `;

    const studentInsert = `
      INSERT IGNORE INTO students (
        student_id, first_name, last_name, phone, major, gpa, account_status
      ) VALUES ?
    `;

    const tempPassword = randomBytes(16).toString("hex");
    const userValues = students.map(s => [s.id, s.first_name, s.last_name, s.email, tempPassword, "student"]);
    const studentValues = students.map(s => [
      s.id, s.first_name, s.last_name, s.phone, s.major, s.gpa, "active"
    ]);

    db.query(userInsert, [userValues], (err) => {
      if (err) {
        fs.unlinkSync(filePath);
        console.error("User insert failed:", err);
        return res.status(500).json({ message: "Failed to insert users" });
      }

      db.query(studentInsert, [studentValues], async (err2) => {
        fs.unlinkSync(filePath);
        if (err2) {
          console.error("Student insert failed:", err2);
          return res.status(500).json({ message: "Failed to insert students" });
        }

        for (const student of students) {
          try {
            const token = jwt.sign({ email: student.email }, process.env.JWT_SECRET!, {              
              expiresIn: "24h",
            });
             console.log(`Token generated for ${student.email} is ${token}`);

            await sendVerificationEmail(student.email, token);
          } catch (emailErr) {
            console.error(`Failed to send email to ${student.email}:`, emailErr);
          }
        }

        res.json({ message: `Successfully imported ${students.length} students and sent emails.` });
      });
    });
  })});


//show supervisors for admin messaging system
app.get("/api/supervisors", (req: Request, res: Response) => {
  const query = `
    SELECT s.supervisor_id AS id, s.name
    FROM supervisors s
    JOIN users u ON s.supervisor_id = u.id
  `;
  db.query<RowDataPacket[]>(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch training managers" });
    }

    const supervisors = results.map((supervisor) => ({
      id: supervisor.id.toString(),
      name: `${supervisor.name}`,
    }));

    res.json(supervisors);
  });
});

//create single student by admin
app.post("/api/create-student", (req: Request, res: Response) => {
  const {
    firstName, lastName, email, phone = "", universityId, major = "", gpa, accountStatus,
  } = req.body;

  const userInsert = `
    INSERT IGNORE INTO users (id,first_name, last_name, email, password, role)
    VALUES (?, ?, ?, ?, ?, 'student')
  `;

  const studentInsert = `
    INSERT IGNORE INTO students (
      student_id, first_name, last_name, phone, major, gpa, account_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

const tempPassword = randomBytes(16).toString("hex");

  db.query(userInsert, [universityId, firstName, lastName, email, tempPassword], (err) => {
    if (err) return res.status(500).json({ message: "Error inserting into users" });

    db.query(
      studentInsert,
      [universityId, firstName, lastName, phone, major, gpa, accountStatus],
      async (err2) => {
        if (err2) return res.status(500).json({ message: "Error inserting into students" });

        // generate a JWT token for password setup
const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "24h" });
        try {
          await sendVerificationEmail(email, token);
        } catch (emailErr) {
          console.error("Email failed:", emailErr);
        }

        res.status(200).json({ message: "Student created and email sent" });
      }
    );
  });
});

//update password for students to complete account setup
app.post("/api/set-password", async (req, res) => {
  const { token, password } = req.body;
    console.log("Received token:", token);
  console.log("Received password:", password);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, decoded.email],
      (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ success: true, message: "Password set successfully" });
      }
    );
  } catch (err) {
        console.error("JWT error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

//show reports for admin
app.get("/api/reports", (req, res) => {
  const managerId = req.query.manager_id;
  const query = "SELECT * FROM submit_report WHERE training_manager_id = ?";

  db.query(query, [managerId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching reports", err });
    }

    res.json(results);
  });
});


//show student submissions for reports for admin
app.get("/api/reports/:reportId/student-submissions", (req: Request, res: Response) => {
  const reportId = req.params.reportId;

  const query = `
  SELECT 
    r.student_id, 
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.company_name,
    sup.name AS supervisor_name,
    r.student_id,
    r.course_subject,
    r.internship_type,
    r.supervisor_comments,
    r.letter_grade,
    r.numeric_grade,
    r.date_from AS start_date,
    r.date_to AS end_date,
    r.time_from,
    r.time_to
  FROM report r
  JOIN students s ON r.student_id = s.student_id
  JOIN applications a ON a.student_id = r.student_id AND a.status = 'accepted'
  JOIN internship i ON a.internship_id = i.internship_id
  JOIN company c ON i.company_id = c.company_id
  JOIN supervisors sup ON i.supervisor_id = sup.supervisor_id
  WHERE r.submitted_report_id = ?
`;

  db.query<RowDataPacket[]>(query, [reportId], (err, results) => {
    if (err) {
      console.error("Error fetching student submissions:", err);
      return res.status(500).json({ message: "Failed to fetch student submissions" });
    }

    const submissions = results.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name,
      company_name: row.company_name,
      supervisor_name: row.supervisor_name,
      course_subject: row.course_subject,
      internship_type: row.internship_type,
      supervisor_comments: row.supervisor_comments,
      status: "submitted",
      grade: row.letter_grade,
      numeric_grade: row.numeric_grade,
      internship_dates: {
        start_date: row.date_from,
        end_date: row.date_to,
        working_hours: {
          start_time: row.time_from,
          end_time: row.time_to,
        },
      },
    }));

    res.json(submissions);
  });
});



// create new report by training manager (admin)
app.post("/api/create-report", (req, res) => {
  const {
    training_manager_id,
    report_title,
    month,
    year,
    due_date,
    is_published,
    status
  } = req.body;

  const insertQuery = `
    INSERT INTO submit_report 
      (training_manager_id, report_title, month, year, due_date, is_published, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query<RowDataPacket[]>(
    insertQuery,
    [
      is_published == 1 ? training_manager_id : null,
      report_title,
      month,
      year,
      due_date,
      is_published,
      status
    ],
    (err, result) => {
      if (err) {
        console.error("Insert report error:", err);
        return res.status(500).json({ message: "Failed to create report" });
      }
      res.status(200).json({
        message: "Report created successfully",
      });
    }
  );
});


//edit on the submitted report by training manager
app.put("/api/reports/:id", (req, res) => {
  const { id } = req.params;
  const { report_title, month, year, due_date, is_published, status } = req.body;

  const query = `
    UPDATE submit_report
    SET report_title = ?, month = ?, year = ?, due_date = ?, is_published = ?, status = ?
    WHERE report_id = ?
  `;

  db.query<RowDataPacket[]>(
    query,
    [report_title, month, year, due_date, is_published, status, id],
    (err, result) => {
      if (err) {
        console.error("Error updating report:", err);
        return res.status(500).json({ message: "Failed to update report" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.status(200).json({ message: "Report updated successfully" });
    }
  );
});

// delete report by admin
app.delete("/api/reports/:id", (req, res) => {
  const { id } = req.params;

  const deleteQuery = `DELETE FROM submit_report WHERE report_id = ?`;

  db.query<RowDataPacket[]>(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting report:", err);
      return res.status(500).json({ message: "Failed to delete report" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  });
});

// Get student submissions for a specific report template
app.get("/api/reports/:reportId/student-submissions", (req, res) => {
  const { reportId } = req.params;

  const query = `
    SELECT 
      s.student_id,
      CONCAT(s.first_name, ' ', s.last_name) as student_name,
      COALESCE(c.company_name, 'No Company Assigned') as company_name,
      COALESCE(sup.name, 'No Supervisor Assigned') as supervisor_name,
      i.start_date,
      i.end_date,
      CASE 
        WHEN r.report_id IS NOT NULL THEN 'submitted'
        ELSE 'pending'
      END as status,
      r.supervisor_comments,
      r.date_from,
      r.date_to,
      r.time_from,
      r.time_to,
      r.grade,
      r.submitted_report_id as submission_id
    FROM students s
    LEFT JOIN applications a ON s.student_id = a.student_id AND a.status = 'accepted'
    LEFT JOIN internship i ON a.internship_id = i.internship_id
    LEFT JOIN company c ON i.company_id = c.company_id
    LEFT JOIN supervisors sup ON i.supervisor_id = sup.supervisor_id
    LEFT JOIN submit_report sr ON sr.report_id = ?
    LEFT JOIN report r ON (
      s.student_id = r.student_id AND
      r.submitted_report_id = sr.report_id
    )
    WHERE s.account_status = 'active'
    ORDER BY s.first_name, s.last_name
  `;

  db.query(query, [reportId], (err, results) => {
    if (err) {
      console.error("Error fetching student submissions:", err);
      return res.status(500).json({ message: "Error fetching student submissions", error: err });
    }
    res.json(results);
  });
});


// Update grade for a student's report submission
app.put("/api/reports/:reportId/students/:studentId/grade", (req, res) => {
  const { reportId, studentId } = req.params;
  const { grade, numeric_grade } = req.body;

  const updateGradeQuery = `
    UPDATE report 
    SET letter_grade = ?, numeric_grade = ?
    WHERE student_id = ? AND submitted_report_id = ?
  `;

  db.query<ResultSetHeader>(
    updateGradeQuery,
    [grade, numeric_grade, studentId, reportId],
    (err, result) => {
      if (err) {
        console.error("Error updating grade:", err);
        return res.status(500).json({ message: "Error updating grade", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No matching report submission found to update" });
      }

      res.json({ message: "Grade updated successfully" });
    }
  );
});


//show registration from students to admin
app.get("/api/student-requests", (req, res) => {
  const query = `
    SELECT 
      s.student_id AS id,
      CONCAT(s.first_name, ' ', s.last_name) AS name,
      u.email,
      s.phone AS phoneNumber,
      s.location AS country,
      s.student_id AS universityId,
      s.account_status AS accountStatus,
      s.registration_status AS registrationStatus
    FROM students s
    JOIN users u ON u.id = s.student_id
    WHERE s.registration_status = 'Pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching student requests:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});


//accept student registration request by admin
app.put("/api/student-requests/:id/confirm", (req, res) => {
  const studentId = req.params.id;
  const query = `
    UPDATE students
    SET registration_status = 'Accepted', account_status = 'active'
    WHERE student_id = ?
  `;
  db.query(query, [studentId], (err, result) => {
    if (err) {
      console.error("Error confirming student:", err);
      return res.status(500).json({ message: "Failed to confirm student." });
    }
    res.json({ message: "Student confirmed successfully." });
  });
});

//reject student registration request by admin
app.put("/api/student-requests/:id/reject", (req, res) => {
  const studentId = req.params.id;

  const query = `
    UPDATE students 
    SET registration_status = 'Rejected', account_status = 'inactive' 
    WHERE student_id = ?
  `;

  db.query<RowDataPacket[]>(query, [studentId], (err, result) => {
    if (err) {
      console.error("Error rejecting student:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student rejected successfully" });
  });
});


// Show student names for supervisor messaging system
app.get("/api/students", (req, res) => {
  const query = `
    SELECT student_id AS id, first_name, last_name
    FROM students
  `;
  db.query<RowDataPacket[]>(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch students" });
    }

    const students = results.map((student) => ({
      id: student.id.toString(),
      name: `${student.first_name} ${student.last_name}`,
    }));

    res.json(students);
  });
});


//show admin info for profile edit
app.get("/api/admin/:id", (req, res) => {
  const adminId = req.params.id;

  const query = `
    SELECT 
      t.id AS admin_id,
      CONCAT(t.first_name, ' ', t.last_name) AS admin_name,
      u.email,
      t.phone AS phone_number,
      t.about,
      t.image AS profile_image
    FROM training_manager t
    JOIN users u ON t.id = u.id
    WHERE t.id = ?
  `;

  db.query<RowDataPacket[]>(query, [adminId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(404).json({ message: "Admin not found" });
    res.json(results[0]);
  });
});

//update admin profile info
app.put("/api/admin/:id", (req, res) => {
  const id = req.params.id; 
  const { name, email, phone_number, about, profile_image, uni_name } = req.body;

  const [first_name, last_name = ""] = name.split(" ");

  const getUserIdQuery = "SELECT id FROM training_manager WHERE id = ?";
  db.query<RowDataPacket[]>(getUserIdQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get user ID", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const userId = results[0].user_id;

    const updateManagerQuery = `
      UPDATE training_manager
      SET first_name = ?, last_name = ?, phone = ?, about = ?, image = ?, uni_name = ?
      WHERE id = ?
    `;

    db.query(
      updateManagerQuery,
      [first_name, last_name, phone_number, about, profile_image || null, uni_name || "", id],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to update training manager", error: err });
        }
        const updateEmailQuery = "UPDATE users SET email = ? WHERE id = ?";
        db.query(updateEmailQuery, [email, userId], (err) => {
          if (err) {
            return res.status(500).json({ message: "Failed to update email", error: err });
          }

          res.json({ message: "Admin profile and email updated successfully" });
        });
      }
    );
  });
});

//show students for admin in to use actions on account
app.get("/api/students-with-email", (req, res) => {
  const query = `
    SELECT s.student_id, s.first_name, s.last_name, s.training_status, s.account_status, u.email
    FROM students s
    JOIN users u ON u.id = s.student_id
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", err });
    res.json(results);
  });
});

//allow admin deactivate student's account
app.post("/api/students/deactivate", (req, res) => {
  const { id } = req.body;
  db.query("UPDATE students SET account_status = 'inactive' WHERE student_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to deactivate" });
    res.json({ message: "Student deactivated" });
  });
});

//admin re-active student's account
app.post("/api/students/reactivate", (req, res) => {
  const { id } = req.body;
  db.query("UPDATE students SET account_status = 'active' WHERE student_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to reactivate" });
    res.json({ message: "Student re-activated" });
  });
});

//admin deletes student's account
app.delete("/api/students/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM students WHERE student_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete student" });
    res.json({ message: "Student deleted" });
  });
});

//show internships for admin
app.get("/api/internships-with-details", (req: Request, res: Response) => {
  const sql = `
    SELECT 
      i.internship_id,
      i.title,
      i.location,
      i.mode,
      i.seats,
      i.duration,
      i.start_date,
      i.end_date,
      c.company_name AS company
    FROM internship i
    JOIN company c ON i.company_id = c.company_id
  `;

  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) {
      console.error("Error fetching internship details:", err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json(results);
  });
});

//assign a student to an internship by admin
app.post("/api/internships/assign", (req: Request, res: Response) => {
  const { student_id, internship_id } = req.body;

  const checkSql = `
    SELECT * FROM applications WHERE student_id = ? AND internship_id = ?
  `;

  db.query<RowDataPacket[]>(checkSql, [student_id, internship_id], (checkErr, results) => {
    if (checkErr) {
      console.error("Database check error:", checkErr);
      return res.status(500).json({ success: false, message: "Database error during check" });
    }

    // if the student exists and the application status is pending , the status is converted to 'acepted'
    if (results.length > 0) {
      const existingStatus = results[0].status;

      if (existingStatus === "pending") {
        const updateSql = `
          UPDATE applications
          SET status = 'accepted', applied_at = NOW()
          WHERE student_id = ? AND internship_id = ?
        `;

        db.query(updateSql, [student_id, internship_id], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Update error:", updateErr);
            return res.status(500).json({ success: false, message: "Database error during update" });
          }

          return res.status(200).json({
            success: true,
            message: `Updated existing application to 'accepted'.`,
          });
        });
      } else {
        return res.status(409).json({
          success: false,
          message: `Student is already assigned to this internship with status '${existingStatus}'.`,
        });
      }

    } else {
      //if the record doesnt exists , insert a new one
      const insertSql = `
        INSERT INTO applications (student_id, internship_id, status, applied_at)
        VALUES (?, ?, 'accepted', NOW())
      `;

      db.query(insertSql, [student_id, internship_id], (insertErr) => {
        if (insertErr) {
          console.error("Insert error:", insertErr);
          return res.status(500).json({ success: false, message: "Database error during insert" });
        }

        res.status(201).json({
          success: true,
          message: `Student ${student_id} assigned to internship ${internship_id} with status 'accepted'.`,
        });
      });
    }
  });
});

//show students internships details fro admin
app.get("/api/students-internships", (req: Request, res: Response) => {
  const query = `
    SELECT 
      s.student_id,
      s.first_name,
      s.last_name,
      u.email,
      c.company_name,
      i.start_date,
      a.status
    FROM applications a
    JOIN internship i ON a.internship_id = i.internship_id
    JOIN company c ON i.company_id = c.company_id
    JOIN students s ON a.student_id = s.student_id
    JOIN users u ON s.student_id = u.id
  `;

  db.query<RowDataPacket[]>(query, (err, results) => {
    if (err) {
      console.error("SQL error fetching students internships:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    const formatted = results.map(row => ({
      id: row.student_id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      company: row.company_name,
      date: row.start_date,
      status: row.status,
    }));

    res.json(formatted);
  });
});

//admin generate reort for passed students
app.get("/api/final-report/download", async (req: Request, res: Response) => {
  const threshold = parseInt(req.query.threshold as string, 10);

  const query = `
    SELECT 
  s.student_id,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  u.email,
  s.location,
  s.phone,
  i.title AS internship_title,
  c.company_name,
  sp.name AS supervisor_name,
  IFNULL(ab_count.absences, 0) AS absences,
  DATEDIFF(i.end_date, i.start_date) + 1 AS total_days,
  ROUND(((DATEDIFF(i.end_date, i.start_date) + 1 - IFNULL(ab_count.absences, 0)) / (DATEDIFF(i.end_date, i.start_date) + 1)) * 100, 2) AS attendance_percentage
FROM students s
JOIN users u ON s.student_id = u.id
JOIN applications a ON s.student_id = a.student_id
JOIN internship i ON a.internship_id = i.internship_id
JOIN company c ON i.company_id = c.company_id
JOIN supervisors sp ON i.supervisor_id = sp.supervisor_id
LEFT JOIN (
  SELECT student_id, COUNT(*) AS absences
  FROM absences
  GROUP BY student_id
) ab_count ON ab_count.student_id = s.student_id
WHERE a.status = 'accepted'
HAVING attendance_percentage >= ?
  `;

  db.query<RowDataPacket[]>(query, [threshold], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Final Report");

      worksheet.columns = [
        { header: "Student ID", key: "student_id", width: 15 },
        { header: "Name", key: "student_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Location", key: "location", width: 15 },
        { header: "Phone", key: "phone", width: 20 },
        { header: "Internship", key: "internship_title", width: 30 },
        { header: "Company", key: "company_name", width: 25 },
        { header: "Supervisor", key: "supervisor_name", width: 25 },
        { header: "Absences", key: "absences", width: 10 },
        { header: "Attendance %", key: "attendance_percentage", width: 18 },
      ];

      results.forEach((row) => {
        worksheet.addRow(row);
      });

      // Write to buffer
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=FinalReport.xlsx`);
      res.send(buffer);
    } catch (e) {
      console.error("Excel generation error:", e);
      res.status(500).json({ message: "Failed to generate Excel", error: e });
    }
  });
});

// Show training manager info for supervisor's messaging system
app.get("/api/admins", (req, res) => {
  const query = `
    SELECT id, first_name, last_name
    FROM training_manager
  `;
  db.query<RowDataPacket[]>(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch training managers" });
    }

    const admins = results.map((admin) => ({
      id: admin.id.toString(),
      name: `${admin.first_name} ${admin.last_name}`,
    }));

    res.json(admins);
  });
});

// Get published reports for supervisors to select from
app.get("/api/published-reports", (req: Request, res: Response) => {
  const sql = `
    SELECT report_id, report_title, month, year, due_date, is_published, status
    FROM submit_report 
    WHERE is_published = 1 AND status = 'published'
    ORDER BY year DESC, month DESC
  `;
  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching published reports", err });
    res.json(results);
  });
});

// Get internship details for a student to auto-populate report fields
app.get("/api/student/:studentId/internship-details", (req: Request, res: Response) => {
  const { studentId } = req.params;
  const sql = `
    SELECT 
      i.title,
      i.mode as internship_type,
      i.start_date,
      i.end_date,
      c.company_name,
      s.name as supervisor_name,
      co_s.name as co_supervisor_name
    FROM applications a
    JOIN internship i ON a.internship_id = i.internship_id
    JOIN company c ON i.company_id = c.company_id
    LEFT JOIN supervisors s ON i.supervisor_id = s.supervisor_id
    LEFT JOIN supervisors co_s ON i.co_supervisor_id = co_s.supervisor_id
    WHERE a.student_id = ? AND a.status = 'accepted'
    LIMIT 1
  `;
  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    if (results.length === 0) {
      return res.status(404).json({ message: "No active internship found for this student." });
    }
    res.json(results[0]);
  });
});


//show registration from students to company

app.get("/api/student-requests", (req: Request, res: Response) => {
  const query = `
    SELECT 
      s.student_id AS id,
      CONCAT(s.first_name, ' ', s.last_name) AS name,
      u.email,
      s.phone AS phoneNumber,
      s.location AS country,
      s.student_id AS universityId,
      s.account_status AS accountStatus,
      s.registration_status AS registrationStatus
    FROM students s
    JOIN users u ON u.id = s.student_id
    WHERE s.registration_status = 'Pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching student requests:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// === New Route: Create Internship ===
app.post("/api/internships", (req: Request, res: Response) => {
  const { title, duration, type, location, supervisor_id, start_date, end_date, company_id, seats } = req.body;
  // Use company_id from request or default to 1
  const companyId = company_id || 1; // In a real app, this would come from authentication
  const seatsValue = seats || 1; // Default to 1 seat if not provided

  const sql = `INSERT INTO internship (title, seats, duration, mode, location, company_id, supervisor_id, co_supervisor_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [title, seatsValue, duration, type, location, companyId, supervisor_id, 0, start_date, end_date], (err) => {
    if (err) {
      console.error("Error adding internship:", err);
      return res.status(500).json({ message: "Error adding internship." });
    }
    res.json({ message: "Internship added successfully." });
  });
});

// === New Route: Edit Internship ===
app.put("/api/internships/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, duration, mode, location, supervisor_id, start_date, end_date  } = req.body;

  const sql = `UPDATE internship SET title = ?, duration = ?, mode = ?, location = ?, supervisor_id = ?, start_date = ?, end_date = ? WHERE internship_id = ?`;
  db.query(sql, [title, duration, mode, location, supervisor_id, start_date, end_date, id], (err, result) => {
    if (err) {
      console.error("Error updating internship:", err);
      return res.status(500).json({ message: "Error updating internship." });
    }
    res.json({ message: "Internship updated successfully." });
  });
});

// === New Route: Delete Internship ===
app.delete("/api/internships/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const sql = `DELETE FROM internship WHERE internship_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting internship:", err);
      return res.status(500).json({ message: "Error deleting internship." });
    }
    res.json({ message: "Internship deleted successfully." });
  });
});

// === New Route: Get Single Internship by ID ===
app.get("/api/internships/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      internship_id,
      title,
      seats,
      duration,
      mode as type,
      location,
      start_date,
      end_date,
      company_id,
      supervisor_id,
      co_supervisor_id
    FROM internship 
    WHERE internship_id = ?
  `;
  db.query<RowDataPacket[]>(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching internship:", err);
      return res.status(500).json({ message: "Error fetching internship." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }
    res.json(results[0]);
  });
});

// === New Route: Get Internship Details (for student view) ===
app.get("/api/internships/:id/details", (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      i.internship_id,
      i.title,
      i.description,
      i.duration,
      i.mode as type,
      i.location,
      i.start_date,
      i.end_date,
      i.company_id,
      c.company_name,
      c.profile_image
    FROM internship i
    JOIN company c ON i.company_id = c.company_id
    WHERE i.internship_id = ?
  `;
  db.query<RowDataPacket[]>(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching internship details:", err);
      return res.status(500).json({ message: "Error fetching internship details." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }
    res.json(results[0]);
  });
});

// === Route: Get a Supervisor by ID ===
app.get("/api/supervisors/detail/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = `SELECT * FROM supervisors WHERE supervisor_id = ?`;
  db.query<RowDataPacket[]>(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching supervisor details:", err);
      return res.status(500).json({ message: "Error fetching supervisor details." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Supervisor not found." });
    }
    const supervisor = results[0];
    res.json({
      id: supervisor.supervisor_id,
      name: supervisor.name,
      email: supervisor.email
    });
  });
});

// === New Route: Get All Supervisors for a Company ===
app.get("/api/supervisors/:company_id", (req: Request, res: Response) => {
  const { company_id } = req.params;
  const sql = `SELECT * FROM supervisors WHERE company_id = ?`;
  db.query<RowDataPacket[]>(sql, [company_id], (err, results) => {
    if (err) {
      console.error("Error fetching supervisors:", err);
      return res.status(500).json({ message: "Error fetching supervisors." });
    }
    // Map supervisor_id to id for frontend compatibility
    const mapped = results.map((sup) => ({
      id: sup.supervisor_id,
      name: sup.name,
      email: sup.email
    }));
    res.json(mapped);
  });
});
// === New Route: Add Supervisor ===
app.post("/api/supervisors", (req: Request, res: Response) => {
  const { name, email, password, company_id } = req.body;

  const sql = `INSERT INTO supervisors (name, email, password, company_id) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, email, password, company_id], (err) => {
    if (err) {
      console.error("Error adding supervisor:", err);
      return res.status(500).json({ message: "Error adding supervisor." });
    }
    res.json({ message: "Supervisor added successfully." });
  });
});
// === Route: Edit Supervisor ===
app.put("/api/supervisors/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  let sql: string;
  let params: any[];

  if (password && password.trim() !== "") {
    sql = `UPDATE supervisors SET name = ?, email = ?, password = ? WHERE supervisor_id = ?`;
    params = [name, email, password, id];
  } else {
    sql = `UPDATE supervisors SET name = ?, email = ? WHERE supervisor_id = ?`;
    params = [name, email, id];
  }

  db.query<ResultSetHeader>(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating supervisor:", err);
      return res.status(500).json({ message: "Error updating supervisor." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supervisor not found." });
    }
    res.json({ message: "Supervisor updated successfully." });
  });
});

// === Route: Update Supervisor Profile (email and password) ===
app.put("/api/supervisor/update-profile/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, currentPassword, newPassword } = req.body;
  
  // First verify the current password
  const verifyPasswordSql = `SELECT * FROM supervisors WHERE supervisor_id = ? AND password = ?`;
  db.query<RowDataPacket[]>(verifyPasswordSql, [id, currentPassword], (err, results) => {
    if (err) {
      console.error("Error verifying supervisor password:", err);
      return res.status(500).json({ message: "Database error while verifying credentials." });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }
    
    // Password is correct, update profile
    const updateSql = `UPDATE supervisors SET email = ?, password = ? WHERE supervisor_id = ?`;
    db.query<ResultSetHeader>(updateSql, [email, newPassword, id], (err, result) => {
      if (err) {
        console.error("Error updating supervisor profile:", err);
        return res.status(500).json({ message: "Error updating profile." });
      }
      
      // Also update email in users table if it exists there
      const updateUserSql = `UPDATE users SET email = ? WHERE id = ?`;
      db.query<ResultSetHeader>(updateUserSql, [email, id], (userErr) => {
        if (userErr) {
          console.error("Error updating user email:", userErr);
          // Don't return error as the main supervisor table was updated successfully
        }
        
        res.json({ message: "Profile updated successfully." });
      });
    });
  });
});
// === New Route: Delete Supervisor ===
app.delete("/api/supervisors/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const sql = `DELETE FROM supervisors WHERE supervisor_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting supervisor:", err);
      return res.status(500).json({ message: "Error deleting supervisor." });
    }
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: "Supervisor not found." });
    }
    res.json({ message: "Supervisor deleted successfully." });
  });
});

//get internship info for edit and view
app.get("/api/internships/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = "SELECT * FROM internship WHERE internship_id = ?";
  db.query<RowDataPacket[]>(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching internship:", err);
      return res.status(500).json({ message: "Server error while fetching internship." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }

    res.status(200).json(results[0]);
  });
});

// === Route: Get all internships for a company ===
app.get("/api/internships/company/:companyId", (req: Request, res: Response) => {
  const { companyId } = req.params;
  // Use the correct table name: 'internships' (plural) as per schema
  const sql = `
    SELECT 
      internship_id as id,
      title,
      duration,
      mode as type,
      location,
      start_date,
      end_date,
      company_id,
      supervisor_id,
      co_supervisor_id
    FROM internship
    WHERE company_id = ?
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error("Error fetching internships for company:", err, "companyId:", companyId);
      return res.status(500).json({ message: "Database error.", error: err });
    }
    if (!Array.isArray(results)) {
      console.error("Unexpected result for internships/company:", results);
      return res.status(500).json({ message: "Unexpected result from database." });
    }
    res.json(results);
  });
});
const checkQuery = `
    SELECT * FROM internship_applications 
    WHERE student_id = ? AND internship_id = ?
  `;
  
//students application
app.get("/api/applications/:studentId", (req: Request, res: Response) => {
  const { studentId } = req.params;

  const sql = `
    SELECT 
      a.internship_id,
      a.status,
      i.title AS title,
      c.company_name AS company_name
    FROM applications a
    JOIN internship i ON a.internship_id = i.internship_id
    JOIN company c ON i.company_id = c.company_id
    WHERE a.student_id = ?
  `;

  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching student applications:", err);
      return res.status(500).json({ message: "Database error." });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "No applications found for this student." });
    }
    
    res.json(results);
  });
});

// The duplicate endpoint for deleting internships has been removed
// Endpoint to verify company code and return data
app.get("/api/verify-company/:code", (req, res) => {
  const { code } = req.params;
const markCodeUsed = "UPDATE company_verification SET used = TRUE WHERE code = ?";
db.query(markCodeUsed, [code], () => {});

  const sql = `SELECT * FROM company_verification WHERE code = ?`;
  db.query<RowDataPacket[]>(sql, [code], (err, result) => {
    if (err) {
      console.error("Error fetching student applications:", err);
      return res.status(500).json({ message: "Error fetching applications." });
    }

    res.json(result);
  });
});

//get applications for a specific internship (company view)
app.get("/api/applications/internship/:internshipId", (req: Request, res: Response) => {
  const { internshipId } = req.params;
  console.log("[DEBUG] /api/applications/internship/:internshipId route hit with id:", internshipId);

  // First get the internship requirements/interests
  db.query<RowDataPacket[]>(
    "SELECT interest_id FROM internship_interests WHERE internship_id = ?",
    [internshipId],
    (err, internshipInterests) => {
      if (err) {
        console.error("Error fetching internship interests:", err);
        return res.status(500).json({ message: "Error fetching internship requirements." });
      }

      const internshipSkillIds = internshipInterests.map(row => row.interest_id);
      console.log("[DEBUG] Internship skill IDs:", internshipSkillIds);

      const sql = `
        SELECT 
          a.application_id,
          a.student_id,
          a.status,
          a.applied_at,
          s.first_name,
          s.last_name,
          s.major,
          s.location,
          s.skills,
          u.email
        FROM applications a
        JOIN students s ON a.student_id = s.student_id
        LEFT JOIN users u ON s.student_id = u.id
        WHERE a.internship_id = ?
        ORDER BY a.applied_at DESC
      `;

      db.query<RowDataPacket[]>(sql, [internshipId], (err, results) => {
        if (err) {
          console.error("Error fetching internship applications:", err);
          return res.status(500).json({ message: "Error fetching applications." });
        }

        // Get student interest IDs for each applicant
        const studentIds = results.map(app => app.student_id);
        
        if (studentIds.length === 0) {
          return res.json([]);
        }

        const placeholders = studentIds.map(() => '?').join(',');
        const studentInterestsQuery = `
          SELECT student_id, interest_id 
          FROM student_interests 
          WHERE student_id IN (${placeholders})
        `;

        db.query<RowDataPacket[]>(studentInterestsQuery, studentIds, (err, studentInterests) => {
          if (err) {
            console.error("Error fetching student interests:", err);
            return res.status(500).json({ message: "Error calculating match percentages." });
          }

          // Group student interests by student_id
          const studentInterestsMap: { [key: string]: number[] } = {};
          studentInterests.forEach(si => {
            if (!studentInterestsMap[si.student_id]) {
              studentInterestsMap[si.student_id] = [];
            }
            studentInterestsMap[si.student_id].push(si.interest_id);
          });

          console.log("[DEBUG] Student interests map:", studentInterestsMap);

          // Calculate match percentage for each application
          const enhancedResults = results.map(app => {
            // Get student's skill IDs
            const studentSkillIds = studentInterestsMap[app.student_id] || [];
            
            // Calculate percentage match based on interests
            let matchPercentage = 0;
            if (internshipSkillIds.length > 0 && studentSkillIds.length > 0) {
              // Count matching skills
              const matches = internshipSkillIds.filter(id => 
                studentSkillIds.includes(id)
              ).length;
              
              // Calculate percentage based on internship requirements
              matchPercentage = Math.round((matches / internshipSkillIds.length) * 100);
            } else if (internshipSkillIds.length === 0) {
              // If internship has no specific requirements, use a skill-based fallback
              const studentSkillsArray = app.skills ? 
                (typeof app.skills === 'string' ? JSON.parse(app.skills || '[]') : app.skills) : [];
              
              // For demonstration, assign a random percentage between 20-95 if no interests are defined
              // In production, you might want to implement a more sophisticated skill matching algorithm
              if (studentSkillsArray.length > 0) {
                // Simple heuristic: more skills = higher match percentage
                const skillCount = Math.min(studentSkillsArray.length, 10);
                matchPercentage = Math.min(20 + (skillCount * 8), 95);
              } else {
                matchPercentage = 25; // Base score for students without skills
              }
            }

            // Parse student skills (if needed)
            let skills = [];
            try {
              if (app.skills) {
                skills = typeof app.skills === 'string' ? JSON.parse(app.skills) : app.skills;
              }
            } catch (e) {
              console.error("Error parsing skills:", e);
              skills = [];
            }

            console.log(`[DEBUG] Student ${app.student_id}: skills=${studentSkillIds}, match=${matchPercentage}%`);

            return {
              ...app,
              match_percentage: matchPercentage,
              skills
            };
          });

          console.log("[DEBUG] Enhanced results with match percentages:", enhancedResults.map((r: any) => ({id: r.student_id, match: r.match_percentage})));
          res.json(enhancedResults);
        });
      });
    }
  );
});

// --- Company Dashboard Statistics API ---

// 1. Total internships posted by company
app.get("/api/company/:companyId/total-internships", (req, res) => {
  const { companyId } = req.params;
  const sql = `SELECT COUNT(*) AS total FROM internship WHERE company_id = ?`;
  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    // results should be RowDataPacket[]
    const row = Array.isArray(results) && results.length > 0 ? results[0] : null;
    res.json({ total: row && (row as any).total !== undefined ? (row as any).total : 0 });
  });
});

// 2. Active internships for company
app.get("/api/company/:companyId/active-internships", (req, res) => {
  const { companyId } = req.params;
  const sql = `SELECT COUNT(*) AS active FROM internship WHERE company_id = ? AND (end_date IS NULL OR end_date > NOW())`;
  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    const row = Array.isArray(results) && results.length > 0 ? results[0] : null;
    res.json({ active: row && (row as any).active !== undefined ? (row as any).active : 0 });
  });
});

// 3. Total applications for company
app.get("/api/company/:companyId/total-applications", (req, res) => {
  const { companyId } = req.params;
  const sql = `
    SELECT COUNT(*) AS total 
    FROM applications a 
    JOIN internship i ON a.internship_id = i.internship_id 
    WHERE i.company_id = ?
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    const row = Array.isArray(results) && results.length > 0 ? results[0] : null;
    res.json({ total: row && (row as any).total !== undefined ? (row as any).total : 0 });
  });
});

// 4. Accepted students for company
app.get("/api/company/:companyId/accepted-students", (req, res) => {
  const { companyId } = req.params;
  const sql = `
    SELECT COUNT(*) AS accepted 
    FROM applications a 
    JOIN internship i ON a.internship_id = i.internship_id 
    WHERE i.company_id = ? AND a.status = 'accepted'
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    const row = Array.isArray(results) && results.length > 0 ? results[0] : null;
    res.json({ accepted: row && (row as any).accepted !== undefined ? (row as any).accepted : 0 });
  });
});

// 5. Applications over time for company
app.get("/api/company/:companyId/applications-over-time", (req, res) => {
  const { companyId } = req.params;
  const sql = `
    SELECT 
      DATE_FORMAT(a.applied_at, '%Y-%m') as month,
      COUNT(*) as applications
    FROM applications a 
    JOIN internship i ON a.internship_id = i.internship_id 
    WHERE i.company_id = ?
    GROUP BY DATE_FORMAT(a.applied_at, '%Y-%m')
    ORDER BY month DESC
    LIMIT 12
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

// 6. Top majors applying to company
app.get("/api/company/:companyId/top-majors", (req, res) => {
  const { companyId } = req.params;
  const sql = `
    SELECT 
      s.major,
      COUNT(*) as count
    FROM applications a 
    JOIN internship i ON a.internship_id = i.internship_id 
    JOIN students s ON a.student_id = s.student_id
    WHERE i.company_id = ? AND s.major IS NOT NULL AND s.major != ''
    GROUP BY s.major
    ORDER BY count DESC
    LIMIT 5
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

// 7. Applications for company (recent applications)
app.get("/api/applications/company/:companyId", (req, res) => {
  const { companyId } = req.params;
  const sql = `
    SELECT 
      a.application_id,
      a.student_id,
      a.status,
      a.applied_at,
      s.first_name,
      s.last_name,
      i.title as internship_title
    FROM applications a 
    JOIN internship i ON a.internship_id = i.internship_id 
    JOIN students s ON a.student_id = s.student_id
    WHERE i.company_id = ?
    ORDER BY a.applied_at DESC
    LIMIT 10
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

// 8. Get internships with supervisors for a company (for ManageSupervisors page)
app.get("/api/company/:companyId/internships-with-supervisors", (req, res) => {
  const { companyId } = req.params;
  const sql = `
    SELECT 
      i.internship_id,
      i.title,
      i.location,
      i.start_date,
      i.supervisor_id,
      s1.name as supervisor_name,
      i.co_supervisor_id,
      s2.name as co_supervisor_name
    FROM internship i
    LEFT JOIN supervisors s1 ON i.supervisor_id = s1.supervisor_id
    LEFT JOIN supervisors s2 ON i.co_supervisor_id = s2.supervisor_id
    WHERE i.company_id = ?
    ORDER BY i.internship_id DESC
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error("Error fetching internships with supervisors:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results || []);
  });
});

// Get assigned supervisors for a specific internship
app.get("/api/internships/:id/supervisors", (req: Request, res: Response) => {
  const { id } = req.params;
  
  const sql = `
    SELECT 
      i.supervisor_id,
      i.co_supervisor_id,
      s1.name as supervisor_name,
      s1.email as supervisor_email,
      s2.name as co_supervisor_name,
      s2.email as co_supervisor_email
    FROM internship i
    LEFT JOIN supervisors s1 ON i.supervisor_id = s1.supervisor_id
    LEFT JOIN supervisors s2 ON i.co_supervisor_id = s2.supervisor_id
    WHERE i.internship_id = ?
  `;
  
  db.query<RowDataPacket[]>(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching assigned supervisors:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Internship not found" });
    }
    
    const result = results[0];
    const assignedSupervisors = {
      supervisor_id: result.supervisor_id,
      supervisor_name: result.supervisor_name,
      supervisor_email: result.supervisor_email,
      co_supervisor_id: result.co_supervisor_id,
      co_supervisor_name: result.co_supervisor_name,
      co_supervisor_email: result.co_supervisor_email
    };
    
    res.json(assignedSupervisors);
  });
});

// Assign/Update supervisors for a specific internship
app.put("/api/internships/:id/supervisors", (req: Request, res: Response) => {
  const { id } = req.params;
  const { supervisor_id, co_supervisor_id } = req.body;
  
  const sql = `
    UPDATE internship 
    SET supervisor_id = ?, co_supervisor_id = ?
    WHERE internship_id = ?
  `;
  
  db.query<ResultSetHeader>(sql, [supervisor_id || null, co_supervisor_id || null, id], (err, result) => {
    if (err) {
      console.error("Error assigning supervisors:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Internship not found" });
    }
    
    res.json({ message: "Supervisors assigned successfully" });
  });
});

// ===== ADMIN DASHBOARD ENDPOINTS =====

// Get all companies for admin dashboard
app.get("/api/companies", (req: Request, res: Response) => {
  const sql = `SELECT company_id, company_name, location, industry, profile_image FROM company`;
  
  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) {
      console.error("Error fetching companies:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.json(results);
  });
});

// Get all reports for admin dashboard
app.get("/api/reports", (req: Request, res: Response) => {
  const sql = `
    SELECT 
      r.report_id,
      r.student_id,
      r.course_subject,
      r.internship_type,
      r.month,
      r.year,
      r.full_name,
      r.supervisor_name
    FROM report r
    ORDER BY r.year DESC, r.month DESC
  `;
  
  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.json(results);
  });
});

// Get monthly revenue data for charts
app.get("/api/monthly-revenue", (req: Request, res: Response) => {
  const { year } = req.query;
  
  // Since this seems to be a mock endpoint for dashboard, return sample data
  const monthlyData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 14000 },
    { month: 'May', revenue: 20000 },
    { month: 'Jun', revenue: 22000 },
    { month: 'Jul', revenue: 0 },
    { month: 'Aug', revenue: 0 },
    { month: 'Sep', revenue: 0 },
    { month: 'Oct', revenue: 0 },
    { month: 'Nov', revenue: 0 },
    { month: 'Dec', revenue: 0 }
  ];
  
  res.json(monthlyData);
});

// Get monthly reports from students
app.get("/api/monthly-reports-students", (req: Request, res: Response) => {
  const { year } = req.query;
  
  const sql = `
    SELECT 
      month,
      COUNT(*) as count
    FROM report 
    WHERE year = ?
    GROUP BY month
    ORDER BY 
      CASE month
        WHEN 'January' THEN 1
        WHEN 'February' THEN 2
        WHEN 'March' THEN 3
        WHEN 'April' THEN 4
        WHEN 'May' THEN 5
        WHEN 'June' THEN 6
        WHEN 'July' THEN 7
        WHEN 'August' THEN 8
        WHEN 'September' THEN 9
        WHEN 'October' THEN 10
        WHEN 'November' THEN 11
        WHEN 'December' THEN 12
      END
  `;
  
  db.query<RowDataPacket[]>(sql, [year || 2025], (err, results) => {
    if (err) {
      console.error("Error fetching monthly reports:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.json(results);
  });
});

// Get all absences for admin dashboard
app.get("/api/absences", (req: Request, res: Response) => {
  const sql = `
    SELECT 
      a.absence_id,
      a.student_id,
      s.first_name,
      s.last_name,
      a.date,
      a.reason,
      a.supervisor_id
    FROM absences a
    JOIN students s ON a.student_id = s.student_id
    ORDER BY a.date DESC
  `;
  
  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) {
      console.error("Error fetching absences:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.json(results);
  });
});

// Get today's absent students
app.get("/api/absences/today", (req: Request, res: Response) => {
  const sql = `
    SELECT 
      a.absence_id,
      a.student_id,
      s.first_name,
      s.last_name,
      a.date
    FROM absences a
    JOIN students s ON a.student_id = s.student_id
    WHERE DATE(a.date) = CURDATE()
  `;
  
  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) {
      console.error("Error fetching today's absences:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.json(results);
  });
});

// Get all absences for admin dashboard
app.get("/api/absences", (req: Request, res: Response) => {
  const sql = `
    SELECT 
      a.absence_id,
      a.student_id,
      s.first_name,
      s.last_name,
      a.date,
      a.reason,
      a.supervisor_id
    FROM absences a
    JOIN students s ON a.student_id = s.student_id
    ORDER BY a.date DESC
  `;
  
  db.query<RowDataPacket[]>(sql, (err, results) => {
    if (err) {
      console.error("Error fetching absences:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.json(results);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//accept application endpoint
app.put("/api/applications/:applicationId/accept", (req: Request, res: Response) => {
  const { applicationId } = req.params;
  
  const sql = `UPDATE applications SET status = 'accepted' WHERE application_id = ?`;
  
  db.query<ResultSetHeader>(sql, [applicationId], (err, result) => {
    if (err) {
      console.error("Error accepting application:", err);
      return res.status(500).json({ message: "Error accepting application." });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found." });
    }
    
    res.json({ message: "Application accepted successfully." });
  });
});

//reject application endpoint
app.put("/api/applications/:applicationId/reject", (req: Request, res: Response) => {
  const { applicationId } = req.params;
  
  const sql = `UPDATE applications SET status = 'rejected' WHERE application_id = ?`;
  
  db.query<ResultSetHeader>(sql, [applicationId], (err, result) => {
    if (err) {
      console.error("Error rejecting application:", err);
      return res.status(500).json({ message: "Error rejecting application." });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found." });
    }
    
    res.json({ message: "Application rejected successfully." });
  });
});

// === Company Reports API Endpoints ===

// Get all students with accepted applications for a company's internships
app.get("/api/company/:companyId/students", (req: Request, res: Response) => {
  const { companyId } = req.params;
  
  const sql = `
    SELECT DISTINCT
      s.student_id,
      s.first_name,
      s.last_name,
      u.email,
      s.major,
      s.location,
      i.internship_id,
      i.title as internship_title,
      i.start_date,
      i.end_date,
      sup.name as supervisor_name,
      co_sup.name as co_supervisor_name
    FROM applications a
    JOIN students s ON a.student_id = s.student_id
    LEFT JOIN users u ON s.student_id = u.id
    JOIN internship i ON a.internship_id = i.internship_id
    LEFT JOIN supervisors sup ON i.supervisor_id = sup.supervisor_id
    LEFT JOIN supervisors co_sup ON i.co_supervisor_id = co_sup.supervisor_id
    WHERE i.company_id = ? AND a.status = 'accepted'
    ORDER BY s.last_name, s.first_name
  `;
  
  db.query<RowDataPacket[]>(sql, [companyId], (err, results) => {
    if (err) {
      console.error("Error fetching company students:", err);
      return res.status(500).json({ message: "Error fetching students." });
    }
    
    res.json(results);
  });
});

// Get reports for a specific student (for student's own access)
app.get("/api/reports/:studentId", (req: Request, res: Response) => {
  const { studentId } = req.params;
  
  const sql = `
    SELECT 
      r.report_id,
      r.course_subject,
      r.internship_type,
      r.month,
      r.year,
      r.full_name,
      r.supervisor_name,
      r.date_from,
      r.date_to,
      r.time_from,
      r.time_to,
      r.letter_grade,
      r.numeric_grade,
      sr.report_title,
      sr.due_date,
      sr.status,
      sr.is_published as published
    FROM report r
    LEFT JOIN submit_report sr ON r.report_id = sr.report_id
    WHERE r.student_id = ?
    ORDER BY r.year DESC, r.month DESC
  `;
  
  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching student reports:", err);
      return res.status(500).json({ message: "Error fetching reports." });
    }
    
    res.json(results);
  });
});

// Update a student's report (for student's own reports)
app.put("/api/reports/:reportId", (req: Request, res: Response) => {
  const { reportId } = req.params;
  const { supervisor_comments } = req.body;
  
  const sql = `
    UPDATE report 
    SET supervisor_comments = ?
    WHERE report_id = ?
  `;
  
  db.query<RowDataPacket[]>(sql, [supervisor_comments, reportId], (err, result) => {
    if (err) {
      console.error("Error updating report:", err);
      return res.status(500).json({ message: "Error updating report." });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Report not found." });
    }
    
    res.json({ message: "Report updated successfully." });
  });
});

// Get reports for a specific student under a company (read-only access)
app.get("/api/company/:companyId/student/:studentId/reports", (req: Request, res: Response) => {
  const { companyId, studentId } = req.params;
  
  const sql = `
    SELECT 
      r.*
    FROM report r
    WHERE r.student_id = ?
    ORDER BY r.year DESC, r.month DESC
  `;
  
  db.query<RowDataPacket[]>(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching student reports:", err);
      return res.status(500).json({ message: "Error fetching reports." });
    }
    
    res.json(results);
  });
});

// === Supervisor API Endpoints ===

// === New Route: Get Accepted Students for Supervisor ===
app.get("/api/supervisor/:supervisorId/accepted-students", (req: Request, res: Response) => {
  const { supervisorId } = req.params;
  const sql = `
    SELECT s.student_id, s.first_name, s.last_name, a.internship_id
    FROM internship i
    JOIN applications a ON i.internship_id = a.internship_id
    JOIN students s ON a.student_id = s.student_id
    WHERE i.supervisor_id = ? AND a.status = 'accepted'
  `;
  db.query(sql, [supervisorId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
});

// === New Route: Get Attendance Summary for Supervisor ===
app.get("/api/supervisor/:supervisorId/attendance-summary", (req: Request, res: Response) => {
  const { supervisorId } = req.params;
  // Get all accepted students for this supervisor
  const studentsSql = `
    SELECT s.student_id, s.first_name, s.last_name
    FROM internship i
    JOIN applications a ON i.internship_id = a.internship_id
    JOIN students s ON a.student_id = s.student_id
    WHERE i.supervisor_id = ? AND a.status = 'accepted'
  `;
  db.query(studentsSql, [supervisorId], (err, studentsResult) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    const students = studentsResult as any[];
    if (!students || students.length === 0) return res.json([]);
    // For each student, get absence count and history
    const studentIds = students.map((s: any) => s.student_id);
    const absencesSql = `
      SELECT student_id, date, reason
      FROM absences
      WHERE supervisor_id = ? AND student_id IN (?)
      ORDER BY date DESC
    `;
    db.query(absencesSql, [supervisorId, studentIds], (err2, absencesResult) => {
      if (err2) return res.status(500).json({ message: "Database error.", error: err2 });
      const absences = absencesResult as any[];
      // Group absences by student_id
      const absMap: { [studentId: number]: { date: string, reason: string }[] } = {};
      for (const a of absences) {
        if (!absMap[a.student_id]) absMap[a.student_id] = [];
        absMap[a.student_id].push({ date: a.date, reason: a.reason });
      }
      // Build summary
      const summary = students.map((s: any) => ({
        student_id: s.student_id,
        first_name: s.first_name,
        last_name: s.last_name,
        absenceCount: absMap[s.student_id]?.length || 0,
        absenceHistory: absMap[s.student_id] || [],
      }));
      res.json(summary);
    });
  });
});

// === New Route: Record Daily Absences ===
app.post("/api/attendance", async (req: Request, res: Response): Promise<void> => {
  const { supervisor_id, date, absences } = req.body;
  if (!supervisor_id || !date || !Array.isArray(absences)) {
    res.status(400).json({ message: "Missing required fields." });
    return;
  }
  if (absences.length === 0) {
    res.status(400).json({ message: "No absences to record." });
    return;
  }
  // Prepare values for bulk insert
  const values = absences.map((a: any) => [a.student_id, supervisor_id, date, a.reason || null]);
  const sql = `INSERT INTO absences (student_id, supervisor_id, date, reason) VALUES ?`;
  db.query(sql, [values], (err: any, result: any) => {
    if (err) {
      if ((err && err.code) === 'ER_DUP_ENTRY') {
        res.status(409).json({ message: "Some absences already exist for this date." });
        return;
      }
      console.error("Error inserting absences:", err);
      res.status(500).json({ message: "Failed to record absences." });
      return;
    }
    res.json({ message: "Absences recorded successfully." });
  });
});

// === New Route: Supervisor Dashboard Data ===
app.get("/api/supervisor/:supervisorId/dashboard", (req: Request, res: Response) => {
  const { supervisorId } = req.params;

  // 1. Get supervised students (accepted only)
  const studentsSql = `
    SELECT s.student_id, s.first_name, s.last_name
    FROM internship i
    JOIN applications a ON i.internship_id = a.internship_id
    JOIN students s ON a.student_id = s.student_id
    WHERE i.supervisor_id = ? AND a.status = 'accepted'
  `;
  db.query(studentsSql, [supervisorId], (err, studentsResult) => {
    if (err) return res.status(500).json({ message: "Database error (students)", error: err });
    const students = studentsResult as any[];
    const studentIds = students.map((s) => s.student_id);
    if (students.length === 0) {
      return res.json({ students: [], totalAbsences: 0, recentReports: [] });
    }

    // 2. Get total absences for these students
    const absencesSql = `
      SELECT COUNT(*) as totalAbsences
      FROM absences
      WHERE supervisor_id = ? AND student_id IN (?)
    `;
    db.query(absencesSql, [supervisorId, studentIds], (err2, absResult) => {
      if (err2) return res.status(500).json({ message: "Database error (absences)", error: err2 });
      const absArr = absResult as any[];
      const totalAbsences = absArr[0]?.totalAbsences || 0;

      // 3. Get recent reports for these students (last 5)
      const reportsSql = `
        SELECT r.report_id, r.student_id, s.first_name, s.last_name, r.course_subject, r.month, r.year
        FROM report r
        JOIN students s ON r.student_id = s.student_id
        WHERE r.student_id IN (?)
        ORDER BY r.year DESC, r.month DESC
        LIMIT 5
      `;
      db.query(reportsSql, [studentIds], (err3, reportsResult) => {
        if (err3) return res.status(500).json({ message: "Database error (reports)", error: err3 });
        res.json({
          students,
          totalAbsences,
          recentReports: reportsResult || []
        });
      });
    });
  });
});

// === Additional Supervisor API Endpoints ===

// Get absences for a specific student
app.get("/api/student/:studentId/absences", (req: Request, res: Response) => {
  const { studentId } = req.params;
  const sql = `
    SELECT date, reason, supervisor_id
    FROM absences
    WHERE student_id = ?
    ORDER BY date DESC
  `;
  db.query(sql, [studentId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
});

// Get reports for a specific student by supervisor
app.get("/api/supervisor/:supervisorId/student/:studentId/reports", (req: Request, res: Response) => {
  const { supervisorId, studentId } = req.params;
  const sql = `
    SELECT r.*
    FROM report r
    JOIN internship i ON r.student_id = ?
    WHERE i.supervisor_id = ? AND r.student_id = ?
    ORDER BY r.year DESC, r.month DESC
  `;
  db.query(sql, [studentId, supervisorId, studentId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
});

// Check if supervisor has already submitted a report for a specific student and report template
app.get("/api/supervisor/check-report/:studentId/:reportId", (req: Request, res: Response) => {
  const { studentId, reportId } = req.params;
  const { supervisorName } = req.query;
  
  // First get the month and year from the published report
  const getReportDetailsQuery = `
    SELECT month, year FROM submit_report WHERE report_id = ?
  `;
  
  db.query<RowDataPacket[]>(getReportDetailsQuery, [reportId], (err, reportDetails) => {
    if (err) {
      console.error("Error fetching report details:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    
    if (reportDetails.length === 0) {
      return res.status(404).json({ message: "Published report not found" });
    }
    
    const { month, year } = reportDetails[0];
    
    // Check if supervisor has submitted a report for this student in the same month/year
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM report 
      WHERE student_id = ? AND supervisor_name = ? AND month = ? AND year = ?
    `;
    
    db.query<RowDataPacket[]>(checkQuery, [studentId, supervisorName, month, year], (err, results) => {
      if (err) {
        console.error("Error checking existing report:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      
      const exists = results[0]?.count > 0;
      res.json({ exists });
    });
  });
});


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
    supervisor_comments,
    submitted_report_id
  } = req.body;

  // Generate a smaller unique report ID
  const reportId = Math.floor(Math.random() * 1000000);

  // Convert date strings to proper DATE format (YYYY-MM-DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  };

  const sql = `
    INSERT INTO report (
      report_id, student_id, course_subject, internship_type, month, year, full_name,
      supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments, letter_grade, numeric_grade,submitted_report_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    formatDate(date_from),
    formatDate(date_to),
    time_from,
    time_to,
    supervisor_comments,
    null,
    null,
    submitted_report_id
  ], (err: any, result: any) => {
    if (err) {
      console.error("Error submitting supervisor report:", err);
      return res.status(500).json({ message: "Failed to submit report." });
    }
    res.json({ message: "Report submitted successfully." });
  });
});



// Fixed check-report endpoint that works with the new submission logic
app.get("/api/supervisor/check-report-fixed/:studentId/:reportId", (req: Request, res: Response) => {
  const { studentId, reportId } = req.params;
  const { supervisorName } = req.query;
  
  // First get the month and year from the published report
  const getReportDetailsQuery = `
    SELECT month, year FROM submit_report WHERE report_id = ?
  `;
  
  db.query<RowDataPacket[]>(getReportDetailsQuery, [reportId], (err, reportDetails) => {
    if (err) {
      console.error("Error fetching report details:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    
    if (reportDetails.length === 0) {
      return res.status(404).json({ message: "Published report not found" });
    }
    
    const { month, year } = reportDetails[0];
    
    // Check if supervisor has submitted a report for this student in the same month/year
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM report 
      WHERE student_id = ? AND supervisor_name = ? AND month = ? AND year = ?
    `;
    
    db.query<RowDataPacket[]>(checkQuery, [studentId, supervisorName, month, year], (err, results) => {
      if (err) {
        console.error("Error checking existing report:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      
      const exists = results[0]?.count > 0;
      res.json({ 
        alreadySubmitted: exists
      });
    });
  });
});