"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db")); // Ensure db.ts exists and is correctly configured
const multer_1 = __importDefault(require("multer"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = 5000;
const upload = (0, multer_1.default)({ dest: "uploads/" });
//const router = express.Router();
// Middleware
app.use((0, cors_1.default)()); // Allow requests from frontend
app.use(express_1.default.json()); // Parse JSON request bodies
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const getUserQuery = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db_1.default.query(getUserQuery, [email, password], (err, users) => {
        if (err)
            return res.status(500).json({ message: "Database error" });
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const user = users[0];
        // if role is student, get `is_first_login` from students table
        if (user.role === "student") {
            const studentQuery = "SELECT is_first_login FROM students WHERE student_id = ?";
            db_1.default.query(studentQuery, [user.id], (err, students) => {
                var _a, _b;
                if (err)
                    return res.status(500).json({ message: "DB error (student check)" });
                const isFirstLogin = (_b = (_a = students[0]) === null || _a === void 0 ? void 0 : _a.is_first_login) !== null && _b !== void 0 ? _b : null;
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
        }
        else {
            return res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    isFirstLogin: null,
                },
            });
        }
    });
});
//contact us
app.post("/contact", (req, res) => {
    const { first_name, last_name, email, phone_number, message } = req.body;
    const sql = `INSERT INTO contact_messages (first_name, last_name, email, phone_number, message) VALUES (?, ?, ?, ?, ?)`;
    db_1.default.query(sql, [first_name, last_name, email, phone_number, message], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, message: "Message sent successfully!" });
    });
});
// get student profile by ID
app.get("/api/students/:studentID", (req, res) => {
    const { studentID } = req.params;
    const sql = "SELECT * FROM students WHERE student_id = ?";
    db_1.default.query(sql, [studentID], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }
        const student = result[0];
        // parse interests and applications since they are stored as JSON
        try {
            student.interests = JSON.parse(student.interests || '[]');
            student.internshipApplications = JSON.parse(student.internshipApplications || '[]');
            student.skills = JSON.parse(student.skills || []);
        }
        catch (err) {
            student.interests = [];
            student.internshipApplications = [];
            student.skilld = [];
        }
        res.json(student);
    });
});
//edit student profile
app.put("/api/students/:studentID", (req, res) => {
    const { studentID } = req.params;
    const { first_name, last_name, major, location, interests, skills, about, } = req.body;
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
    db_1.default.query(updateStudentSql, [
        first_name,
        last_name,
        major,
        location,
        JSON.stringify(skills || []),
        about,
        studentID,
    ], (err, result) => {
        if (err) {
            console.error("Error updating student:", err);
            return res.status(500).json({ message: "Student update failed" });
        }
        // sync student_interests
        const deleteSql = "DELETE FROM student_interests WHERE student_id = ?";
        db_1.default.query(deleteSql, [studentID], (delErr) => {
            if (delErr) {
                console.error("Error deleting old interests:", delErr);
                return res.status(500).json({ message: "Failed to remove old interests" });
            }
            if (!interests || interests.length === 0) {
                return res.status(200).json({ message: "Student updated successfully" });
            }
            //interest_ids from interests table
            const selectSql = `SELECT interest_id, name FROM interests WHERE name IN (?)`;
            db_1.default.query(selectSql, [interests], (selErr, rows) => {
                if (selErr) {
                    console.error("Error fetching interest IDs:", selErr);
                    return res.status(500).json({ message: "Failed to fetch interests" });
                }
                const insertValues = rows.map((row) => [studentID, row.interest_id]);
                if (insertValues.length === 0) {
                    return res.status(200).json({ message: "Student updated with no matched interests" });
                }
                const insertSql = "INSERT INTO student_interests (student_id, interest_id) VALUES ?";
                db_1.default.query(insertSql, [insertValues], (insErr) => {
                    if (insErr) {
                        console.error("Error inserting interests:", insErr);
                        return res.status(500).json({ message: "Failed to insert new interests" });
                    }
                    res.status(200).json({ message: "Student and interests updated successfully" });
                });
            });
        });
    });
});
// company profile 
app.get("/companies/:companyID", (req, res) => {
    const { companyID } = req.params;
    const sql = "SELECT * FROM company WHERE company_id = ?";
    db_1.default.query(sql, [companyID], (err, result) => {
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
app.post("/api/reset-password", (req, res) => {
    const { email, password } = req.body;
    const userQuery = "SELECT * FROM users WHERE email = ?";
    db_1.default.query(userQuery, [email], (err, users) => {
        if (err)
            return res.status(500).json({ message: "Database error while fetching user." });
        if (users.length === 0)
            return res.status(404).json({ message: "User not found." });
        const user = users[0];
        // update password in users table
        const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
        db_1.default.query(updatePasswordQuery, [password, email], (err) => {
            if (err)
                return res.status(500).json({ message: "Failed to update password." });
            if (user.role === "student") {
                // update is_first_login in students table
                const updateLoginStatusQuery = "UPDATE students SET is_first_login = false WHERE student_id = ?";
                db_1.default.query(updateLoginStatusQuery, [user.id], (err) => {
                    if (err)
                        return res.status(500).json({ message: "Failed to update login status for student." });
                    return res.json({ message: "Password reset and first login flag updated for student." });
                });
            }
            else {
                // For company or manager, only update the password
                return res.json({ message: "Password updated successfully." });
            }
        });
    });
});
//student's form 
app.post("/api/student-form", (req, res) => {
    const { student_id, major, sex, phoneNumber, location, interests, skills, description, gpa, graduationYear, completedHours, experience, certifications, languages, linkedin, portfolio, preferredTraining, availability } = req.body;
    // if (!student_id || !Array.isArray(interests)) {
    //   return res.status(400).json({ message: "Invalid student ID or interests." });
    // }
    const updateQuery = `
    UPDATE students SET
      major = ?,
      sex = ?,
      phone = ?,
      location = ?,
      interests = ?,  -- for legacy or fallback usage
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
      availability = ?
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
    db_1.default.query(updateQuery, updateValues, (err) => {
        if (err) {
            console.error("Failed to update student profile:", err);
            return res.status(500).json({ message: "Failed to update profile." });
        }
        // clear old student_interests
        const deleteQuery = "DELETE FROM student_interests WHERE student_id = ?";
        db_1.default.query(deleteQuery, [student_id], (delErr) => {
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
            const values = interests.map((id) => [student_id, id]);
            db_1.default.query(insertQuery, [values], (insertErr) => {
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
app.get("/api/recommended-internships/:studentId", (req, res) => {
    const { studentId } = req.params;
    const studentQuery = `
    SELECT location FROM students WHERE student_id = ?
  `;
    db_1.default.query(studentQuery, [studentId], (err, studentResult) => {
        if (err || studentResult.length === 0) {
            console.error("Student not found or DB error", err);
            return res.status(500).json({ message: "Student not found or DB error." });
        }
        const studentLocation = studentResult[0].location;
        // get student's interests
        const interestQuery = `
      SELECT interest_id FROM student_interests WHERE student_id = ?
    `;
        db_1.default.query(interestQuery, [studentId], (err, interestRows) => {
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
            db_1.default.query(internshipQuery, [...interestIds, studentLocation], (err, internships) => {
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
app.post("/api/report", (req, res) => {
    const { student_id, courseSubject, internshipType, month, year, fullName, supervisorName, startDate, endDate, startTime, endTime, supervisorComments, } = req.body;
    // if (!student_id) {
    //   return res.status(400).json({ message: "Missing student ID." });
    // }
    const insertQuery = `
    INSERT INTO report (
      student_id, course_subject, internship_type, month, year, full_name,
      supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    db_1.default.query(insertQuery, [
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
    ], (err) => {
        if (err) {
            console.error("Failed to insert report:", err);
            return res.status(500).json({ message: "Database error." });
        }
        return res.json({ message: "Report submitted successfully." });
    });
});
//endpoint for student request page
app.get("/api/internships/student/:studentId", (req, res) => {
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
    db_1.default.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("Failed to fetch internships:", err);
            return res.status(500).json({ message: "Database error." });
        }
        res.json(results);
    });
});
// show internships for students in internship search page
app.get("/api/internships", (req, res) => {
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
    db_1.default.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching internships:", err);
            return res.status(500).json({ message: "Database error." });
        }
        res.json(results);
    });
});
// saved internship list by student
//post to add the internship to the list
app.post("/api/students/:studentId/save", (req, res) => {
    const { studentId } = req.params;
    const { internshipId } = req.body;
    const getQuery = "SELECT saved_internships FROM students WHERE student_id = ?";
    db_1.default.query(getQuery, [studentId], (err, results) => {
        if (err)
            return res.status(500).json({ message: "Error fetching student." });
        let saved = [];
        try {
            saved = JSON.parse(results[0].saved_internships || '[]');
        }
        catch (_a) { }
        if (!saved.includes(internshipId)) {
            saved.push(internshipId);
        }
        const updateQuery = "UPDATE students SET saved_internships = ? WHERE student_id = ?";
        db_1.default.query(updateQuery, [JSON.stringify(saved), studentId], (err) => {
            if (err)
                return res.status(500).json({ message: "Error saving internship." });
            res.json({ message: "Internship saved." });
        });
    });
});
// get to load saved internships
app.get("/api/students/:studentId/saved-internships", (req, res) => {
    const { studentId } = req.params;
    console.log("Fetching saved internships for student:", studentId);
    const getQuery = `SELECT saved_internships FROM students WHERE student_id = ?`;
    db_1.default.query(getQuery, [studentId], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "Failed to retrieve saved internships." });
        }
        if (results.length === 0) {
            console.warn("No student found with that ID.");
            return res.status(404).json({ message: "Student not found." });
        }
        let savedIds = [];
        try {
            savedIds = JSON.parse(results[0].saved_internships || '[]');
            console.log("Parsed saved internship IDs:", savedIds);
        }
        catch (parseErr) {
            console.error("JSON parse error:", parseErr);
            return res.status(500).json({ message: "Invalid saved data format." });
        }
        if (!savedIds.length)
            return res.json([]);
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
        db_1.default.query(sql, savedIds, (err, data) => {
            if (err) {
                console.error("SQL error when loading internships:", err);
                return res.status(500).json({ message: "Error retrieving internship data." });
            }
            res.json(data);
        });
    });
});
//remove internship from saved list in student's saved internships list
app.delete("/api/students/:studentId/saved-internships/:internshipId", (req, res) => {
    const { studentId, internshipId } = req.params;
    const getQuery = `SELECT saved_internships FROM students WHERE student_id = ?`;
    db_1.default.query(getQuery, [studentId], (err, results) => {
        if (err || results.length === 0) {
            console.error("Error fetching saved internships:", err);
            return res.status(500).json({ message: "Student not found." });
        }
        let saved = [];
        try {
            saved = JSON.parse(results[0].saved_internships || '[]');
        }
        catch (parseErr) {
            console.error("Failed to parse saved_internships:", parseErr);
            return res.status(500).json({ message: "Corrupted saved_internships format." });
        }
        const updated = saved.filter(id => id !== parseInt(internshipId));
        const updateQuery = `UPDATE students SET saved_internships = ? WHERE student_id = ?`;
        db_1.default.query(updateQuery, [JSON.stringify(updated), studentId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating saved_internships:", updateErr);
                return res.status(500).json({ message: "Failed to update saved list." });
            }
            res.json({ message: "Internship removed from saved list." });
        });
    });
});
//student apply action endpoint
app.post("/api/internships/apply", (req, res) => {
    const { student_id, internship_id, motivation_letter } = req.body;
    // check how many the student has applied for internships
    const dailyLimitQuery = `
    SELECT COUNT(*) AS count
    FROM applications
WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;
    db_1.default.query(dailyLimitQuery, [student_id], (limitErr, limitResult) => {
        var _a, _b;
        if (limitErr) {
            console.error("Error checking daily limit:", limitErr);
            return res.status(500).json({ message: "Database error." });
        }
        const applicationsToday = (_b = (_a = limitResult[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
        if (applicationsToday >= 10) {
            return res.status(429).json({
                message: "Daily limit reached. You can apply to a maximum of 10 internships per day.",
            });
        }
        // check if the student already has applied to the internship
        const checkQuery = `
      SELECT * FROM applications 
      WHERE student_id = ? AND internship_id = ?
    `;
        db_1.default.query(checkQuery, [student_id, internship_id], (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error checking existing application:", checkErr);
                return res.status(500).json({ message: "Database error." });
            }
            if (checkResult.length > 0) {
                return res.status(409).json({
                    message: "You have already applied to this internship.",
                });
            }
            // insert new application
            const insertQuery = `
        INSERT INTO applications (student_id, internship_id, motivation_letter)
        VALUES (?, ?, ?)
      `;
            db_1.default.query(insertQuery, [student_id, internship_id, motivation_letter || null], (insertErr) => {
                if (insertErr) {
                    console.error("Error inserting application:", insertErr);
                    return res.status(500).json({ message: "Failed to apply to internship." });
                }
                return res.status(201).json({ message: "Application submitted successfully." });
            });
        });
    });
});
app.get("/api/applications/daily-count/:studentId", (req, res) => {
    const { studentId } = req.params;
    const sql = `
    SELECT COUNT(*) AS count
    FROM applications
    WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;
    db_1.default.query(sql, [studentId], (err, results) => {
        var _a, _b;
        if (err) {
            console.error("Error fetching daily count:", err);
            return res.status(500).json({ message: "Database error." });
        }
        const count = (_b = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
        res.json({ count });
    });
});
//students application
app.get("/api/applications/:studentId", (req, res) => {
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
    db_1.default.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("Error fetching student applications:", err);
            return res.status(500).json({ message: "Error fetching applications." });
        }
        res.json(results);
    });
});
//cancel application request
app.delete("/api/applications/cancel/:studentId/:internshipId", (req, res) => {
    const { studentId, internshipId } = req.params;
    const query = `
    DELETE FROM applications
    WHERE student_id = ? AND internship_id = ?
  `;
    db_1.default.query(query, [studentId, internshipId], (err, result) => {
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
//get all majors
app.get("/api/majors", (req, res) => {
    const sql = "SELECT * FROM majors";
    db_1.default.query(sql, (err, results) => {
        if (err) {
            console.error("Failed to fetch majors:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.json(results);
    });
});
//get interests by major's name
app.get("/api/interests/by-major-name/:majorName", (req, res) => {
    const { majorName } = req.params;
    const sql = `
    SELECT i.interest_id, i.name 
    FROM interests i
    JOIN majors m ON i.major_id = m.major_id
    WHERE m.name = ?
  `;
    db_1.default.query(sql, [majorName], (err, results) => {
        if (err) {
            console.error("Failed to fetch interests by major name:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.json(results);
    });
});
// add students from admin csv file
app.post("/api/import-students", upload.single("file"), (req, res) => {
    var _a;
    const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!filePath) {
        console.error("No file was uploaded.");
        res.status(400).json({ message: "File is missing." });
        return;
    }
    const students = [];
    fs_1.default.createReadStream(filePath)
        .pipe((0, csv_parser_1.default)())
        .on("data", (row) => {
        if (!row["University ID"] || !row["Email"])
            return;
        students.push({
            id: row["University ID"].trim(),
            email: row["Email"].trim(),
            first_name: row["First Name"].trim(),
            last_name: row["Last Name"].trim(),
            phone: row["Phone"].trim(),
            major: row["Major"].trim(),
            gpa: parseFloat(row["GPA"]),
        });
    })
        .on("end", () => {
        const userInsert = `
        INSERT IGNORE INTO users (id,first_name,last_name, email,password, role)
        VALUES ?
      `;
        const studentInsert = `
  INSERT IGNORE INTO students (
    student_id, first_name, last_name, phone, major, gpa, account_status
  ) VALUES ?
`;
        const userValues = students.map(s => [s.id, s.first_name, s.last_name, s.email, s.email, "student"]);
        const studentValues = students.map(s => [
            s.id, s.first_name, s.last_name, s.phone, s.major, s.gpa, "active"
        ]);
        db_1.default.query(userInsert, [userValues], (err) => {
            if (err) {
                fs_1.default.unlinkSync(filePath);
                console.error("User insert failed:", err);
                res.status(500).json({ message: "Failed to insert users" });
                return;
            }
            db_1.default.query(studentInsert, [studentValues], (err2) => {
                fs_1.default.unlinkSync(filePath);
                if (err2) {
                    console.error("Student insert failed:", err2);
                    res.status(500).json({ message: "Failed to insert students" });
                    return;
                }
                res.json({ message: `Successfully imported ${students.length} students.` });
            });
        });
    });
    // show users for admin in messaging system
    app.get("/api/users", (req, res) => {
        const query = "SELECT id, email FROM users WHERE role != 'admin'";
        db_1.default.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Failed to fetch users" });
            }
            res.json(results);
        });
    });
    //show supervisors for admin messaging system
    app.get("/api/supervisors", (req, res) => {
        const query = `
    SELECT s.supervisor_id AS id, s.name
    FROM supervisors s
    JOIN users u ON s.supervisor_id = u.id
  `;
        db_1.default.query(query, (err, results) => {
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
    // Get supervisor details by ID
    app.get("/api/supervisors/detail/:id", (req, res) => {
        const { id } = req.params;
        const query = `
    SELECT supervisor_id as id, name, email, company_id
    FROM supervisors 
    WHERE supervisor_id = ?
  `;
        db_1.default.query(query, [id], (err, results) => {
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
    //create single student by admin
    app.post("/api/create-student", (req, res) => {
        const { firstName, lastName, email, phone = "", universityId, major = "", gpa, accountStatus, } = req.body;
        const userInsert = `
    INSERT IGNORE INTO users (id,first_name, last_name, email, password, role)
    VALUES (?,?,?, ?, ?, 'student')
  `;
        const studentInsert = `
    INSERT IGNORE INTO students (
      student_id, first_name, last_name, phone, major, gpa, account_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
        const defaultPassword = email;
        db_1.default.query(userInsert, [universityId, firstName, lastName, email, defaultPassword], (err) => {
            if (err) {
                console.error("User insert error:", err);
                return res.status(500).json({ message: "Error inserting into users" });
            }
            db_1.default.query(studentInsert, [
                universityId,
                firstName,
                lastName,
                phone,
                major,
                gpa,
                accountStatus,
            ], (err2) => {
                if (err2) {
                    console.error("Student insert error:", err2);
                    return res.status(500).json({ message: "Error inserting into students" });
                }
                res.status(200).json({ message: "Student created successfully", insertId: universityId });
            });
        });
    });
    //show reports for admin
    app.get("/api/reports", (req, res) => {
        db_1.default.query("SELECT * FROM submit_report", (err, results) => {
            if (err)
                return res.status(500).json({ message: "Error fetching reports", err });
            res.json(results);
        });
    });
    // Get published reports for supervisors to select from
    app.get("/api/published-reports", (req, res) => {
        const sql = `
    SELECT report_id, report_title, month, year, due_date, is_published, status
    FROM submit_report 
    WHERE is_published = 1 AND status = 'published'
    ORDER BY year DESC, month DESC
  `;
        db_1.default.query(sql, (err, results) => {
            if (err)
                return res.status(500).json({ message: "Error fetching published reports", err });
            res.json(results);
        });
    });
    // Get internship details for a student to auto-populate report fields
    app.get("/api/student/:studentId/internship-details", (req, res) => {
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
        db_1.default.query(sql, [studentId], (err, results) => {
            if (err)
                return res.status(500).json({ message: "Database error.", error: err });
            if (results.length === 0) {
                return res.status(404).json({ message: "No active internship found for this student." });
            }
            res.json(results[0]);
        });
    });
    // Check if supervisor has already submitted a report for student/report combination
    app.get("/api/supervisor/check-report/:studentId/:reportId", (req, res) => {
        const { studentId, reportId } = req.params;
        const { supervisorName } = req.query;
        const sql = `
    SELECT COUNT(*) as count 
    FROM report 
    WHERE student_id = ? AND report_id = ? AND supervisor_name = ?
  `;
        db_1.default.query(sql, [studentId, reportId, supervisorName], (err, results) => {
            var _a;
            if (err) {
                console.error("Error checking existing report:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            const exists = ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) > 0;
            res.json({ exists });
        });
    });
    // Submit supervisor report
    app.post("/api/supervisor/submit-report", (req, res) => {
        const { student_id, report_id, course_subject, internship_type, month, year, full_name, supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments, company_name } = req.body;
        // Generate a unique report ID for this submission
        const uniqueReportId = `${Date.now()}_${student_id}_${report_id}`;
        const insertQuery = `
    INSERT INTO report (
      student_id, report_id, course_subject, internship_type, month, year, 
      full_name, supervisor_name, date_from, date_to, time_from, time_to, 
      supervisor_comments, company_name, submitted_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
        db_1.default.query(insertQuery, [
            student_id,
            uniqueReportId,
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
            company_name
        ], (err) => {
            if (err) {
                console.error("Failed to insert supervisor report:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.json({
                message: "Supervisor report submitted successfully",
                reportId: uniqueReportId
            });
        });
    });
    //student apply action endpoint
    app.post("/api/internships/apply", (req, res) => {
        const { student_id, internship_id, motivation_letter } = req.body;
        // check how many the student has applied for internships
        const dailyLimitQuery = `
    SELECT COUNT(*) AS count
    FROM applications
WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;
        db_1.default.query(dailyLimitQuery, [student_id], (limitErr, limitResult) => {
            var _a, _b;
            if (limitErr) {
                console.error("Error checking daily limit:", limitErr);
                return res.status(500).json({ message: "Database error." });
            }
            const applicationsToday = (_b = (_a = limitResult[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
            if (applicationsToday >= 10) {
                return res.status(429).json({
                    message: "Daily limit reached. You can apply to a maximum of 10 internships per day.",
                });
            }
            // check if the student already has applied to the internship
            const checkQuery = `
      SELECT * FROM applications 
      WHERE student_id = ? AND internship_id = ?
    `;
            db_1.default.query(checkQuery, [student_id, internship_id], (checkErr, checkResult) => {
                if (checkErr) {
                    console.error("Error checking existing application:", checkErr);
                    return res.status(500).json({ message: "Database error." });
                }
                if (checkResult.length > 0) {
                    return res.status(409).json({
                        message: "You have already applied to this internship.",
                    });
                }
                // insert new application
                const insertQuery = `
        INSERT INTO applications (student_id, internship_id, motivation_letter)
        VALUES (?, ?, ?)
      `;
                db_1.default.query(insertQuery, [student_id, internship_id, motivation_letter || null], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting application:", insertErr);
                        return res.status(500).json({ message: "Failed to apply to internship." });
                    }
                    return res.status(201).json({ message: "Application submitted successfully." });
                });
            });
        });
    });
    app.get("/api/applications/daily-count/:studentId", (req, res) => {
        const { studentId } = req.params;
        const sql = `
    SELECT COUNT(*) AS count
    FROM applications
    WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;
        db_1.default.query(sql, [studentId], (err, results) => {
            var _a, _b;
            if (err) {
                console.error("Error fetching daily count:", err);
                return res.status(500).json({ message: "Database error." });
            }
            const count = (_b = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
            res.json({ count });
        });
    });
    //students application
    app.get("/api/applications/:studentId", (req, res) => {
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
        db_1.default.query(sql, [studentId], (err, results) => {
            if (err) {
                console.error("Error fetching student applications:", err);
                return res.status(500).json({ message: "Error fetching applications." });
            }
            res.json(results);
        });
    });
    //cancel application request
    app.delete("/api/applications/cancel/:studentId/:internshipId", (req, res) => {
        const { studentId, internshipId } = req.params;
        const query = `
    DELETE FROM applications
    WHERE student_id = ? AND internship_id = ?
  `;
        db_1.default.query(query, [studentId, internshipId], (err, result) => {
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
    //get all majors
    app.get("/api/majors", (req, res) => {
        const sql = "SELECT * FROM majors";
        db_1.default.query(sql, (err, results) => {
            if (err) {
                console.error("Failed to fetch majors:", err);
                return res.status(500).json({ message: "Server error" });
            }
            res.json(results);
        });
    });
    //get interests by major's name
    app.get("/api/interests/by-major-name/:majorName", (req, res) => {
        const { majorName } = req.params;
        const sql = `
    SELECT i.interest_id, i.name 
    FROM interests i
    JOIN majors m ON i.major_id = m.major_id
    WHERE m.name = ?
  `;
        db_1.default.query(sql, [majorName], (err, results) => {
            if (err) {
                console.error("Failed to fetch interests by major name:", err);
                return res.status(500).json({ message: "Server error" });
            }
            res.json(results);
        });
    });
    // add students from admin csv file
    app.post("/api/import-students", upload.single("file"), (req, res) => {
        var _a;
        const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!filePath) {
            console.error("No file was uploaded.");
            res.status(400).json({ message: "File is missing." });
            return;
        }
        const students = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", (row) => {
            if (!row["University ID"] || !row["Email"])
                return;
            students.push({
                id: row["University ID"].trim(),
                email: row["Email"].trim(),
                first_name: row["First Name"].trim(),
                last_name: row["Last Name"].trim(),
                phone: row["Phone"].trim(),
                major: row["Major"].trim(),
                gpa: parseFloat(row["GPA"]),
            });
        })
            .on("end", () => {
            const userInsert = `
        INSERT IGNORE INTO users (id,first_name,last_name, email,password, role)
        VALUES ?
      `;
            const studentInsert = `
  INSERT IGNORE INTO students (
    student_id, first_name, last_name, phone, major, gpa, account_status
  ) VALUES ?
`;
            const userValues = students.map(s => [s.id, s.first_name, s.last_name, s.email, s.email, "student"]);
            const studentValues = students.map(s => [
                s.id, s.first_name, s.last_name, s.phone, s.major, s.gpa, "active"
            ]);
            db_1.default.query(userInsert, [userValues], (err) => {
                if (err) {
                    fs_1.default.unlinkSync(filePath);
                    console.error("User insert failed:", err);
                    res.status(500).json({ message: "Failed to insert users" });
                    return;
                }
                db_1.default.query(studentInsert, [studentValues], (err2) => {
                    fs_1.default.unlinkSync(filePath);
                    if (err2) {
                        console.error("Student insert failed:", err2);
                        res.status(500).json({ message: "Failed to insert students" });
                        return;
                    }
                    res.json({ message: `Successfully imported ${students.length} students.` });
                });
            });
        });
        // show users for admin in messaging system
        app.get("/api/users", (req, res) => {
            const query = "SELECT id, email FROM users WHERE role != 'admin'";
            db_1.default.query(query, (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to fetch users" });
                }
                res.json(results);
            });
        });
        //show supervisors for admin messaging system
        app.get("/api/supervisors", (req, res) => {
            const query = `
    SELECT s.supervisor_id AS id, s.name
    FROM supervisors s
    JOIN users u ON s.supervisor_id = u.id
  `;
            db_1.default.query(query, (err, results) => {
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
        // Get supervisor details by ID
        app.get("/api/supervisors/detail/:id", (req, res) => {
            const { id } = req.params;
            const query = `
    SELECT supervisor_id as id, name, email, company_id
    FROM supervisors 
    WHERE supervisor_id = ?
  `;
            db_1.default.query(query, [id], (err, results) => {
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
        //create single student by admin
        app.post("/api/create-student", (req, res) => {
            const { firstName, lastName, email, phone = "", universityId, major = "", gpa, accountStatus, } = req.body;
            const userInsert = `
    INSERT IGNORE INTO users (id,first_name, last_name, email, password, role)
    VALUES (?,?,?, ?, ?, 'student')
  `;
            const studentInsert = `
    INSERT IGNORE INTO students (
      student_id, first_name, last_name, phone, major, gpa, account_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
            const defaultPassword = email;
            db_1.default.query(userInsert, [universityId, firstName, lastName, email, defaultPassword], (err) => {
                if (err) {
                    console.error("User insert error:", err);
                    return res.status(500).json({ message: "Error inserting into users" });
                }
                db_1.default.query(studentInsert, [
                    universityId,
                    firstName,
                    lastName,
                    phone,
                    major,
                    gpa,
                    accountStatus,
                ], (err2) => {
                    if (err2) {
                        console.error("Student insert error:", err2);
                        return res.status(500).json({ message: "Error inserting into students" });
                    }
                    res.status(200).json({ message: "Student created successfully", insertId: universityId });
                });
            });
        });
        //show reports for admin
        app.get("/api/reports", (req, res) => {
            db_1.default.query("SELECT * FROM submit_report", (err, results) => {
                if (err)
                    return res.status(500).json({ message: "Error fetching reports", err });
                res.json(results);
            });
        });
        // Get published reports for supervisors to select from
        app.get("/api/published-reports", (req, res) => {
            const sql = `
    SELECT report_id, report_title, month, year, due_date, is_published, status
    FROM submit_report 
    WHERE is_published = 1 AND status = 'published'
    ORDER BY year DESC, month DESC
  `;
            db_1.default.query(sql, (err, results) => {
                if (err)
                    return res.status(500).json({ message: "Error fetching published reports", err });
                res.json(results);
            });
        });
        // Get internship details for a student to auto-populate report fields
        app.get("/api/student/:studentId/internship-details", (req, res) => {
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
            db_1.default.query(sql, [studentId], (err, results) => {
                if (err)
                    return res.status(500).json({ message: "Database error.", error: err });
                if (results.length === 0) {
                    return res.status(404).json({ message: "No active internship found for this student." });
                }
                res.json(results[0]);
            });
        });
        // Check if supervisor has already submitted a report for student/report combination
        app.get("/api/supervisor/check-report/:studentId/:reportId", (req, res) => {
            const { studentId, reportId } = req.params;
            const { supervisorName } = req.query;
            const sql = `
    SELECT COUNT(*) as count 
    FROM report 
    WHERE student_id = ? AND report_id = ? AND supervisor_name = ?
  `;
            db_1.default.query(sql, [studentId, reportId, supervisorName], (err, results) => {
                var _a;
                if (err) {
                    console.error("Error checking existing report:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }
                const exists = ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) > 0;
                res.json({ exists });
            });
        });
        // Submit supervisor report
        app.post("/api/supervisor/submit-report", (req, res) => {
            const { student_id, report_id, course_subject, internship_type, month, year, full_name, supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments, company_name } = req.body;
            // Generate a unique report ID for this submission
            const uniqueReportId = `${Date.now()}_${student_id}_${report_id}`;
            const insertQuery = `
    INSERT INTO report (
      student_id, report_id, course_subject, internship_type, month, year, 
      full_name, supervisor_name, date_from, date_to, time_from, time_to, 
      supervisor_comments, company_name, submitted_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
            db_1.default.query(insertQuery, [
                student_id,
                uniqueReportId,
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
                company_name
            ], (err) => {
                if (err) {
                    console.error("Failed to insert supervisor report:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }
                res.json({
                    message: "Supervisor report submitted successfully",
                    reportId: uniqueReportId
                });
            });
        });
        //student apply action endpoint
        app.post("/api/internships/apply", (req, res) => {
            const { student_id, internship_id, motivation_letter } = req.body;
            // check how many the student has applied for internships
            const dailyLimitQuery = `
    SELECT COUNT(*) AS count
    FROM applications
WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;
            db_1.default.query(dailyLimitQuery, [student_id], (limitErr, limitResult) => {
                var _a, _b;
                if (limitErr) {
                    console.error("Error checking daily limit:", limitErr);
                    return res.status(500).json({ message: "Database error." });
                }
                const applicationsToday = (_b = (_a = limitResult[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
                if (applicationsToday >= 10) {
                    return res.status(429).json({
                        message: "Daily limit reached. You can apply to a maximum of 10 internships per day.",
                    });
                }
                // check if the student already has applied to the internship
                const checkQuery = `
      SELECT * FROM applications 
      WHERE student_id = ? AND internship_id = ?
    `;
                db_1.default.query(checkQuery, [student_id, internship_id], (checkErr, checkResult) => {
                    if (checkErr) {
                        console.error("Error checking existing application:", checkErr);
                        return res.status(500).json({ message: "Database error." });
                    }
                    if (checkResult.length > 0) {
                        return res.status(409).json({
                            message: "You have already applied to this internship.",
                        });
                    }
                    // insert new application
                    const insertQuery = `
        INSERT INTO applications (student_id, internship_id, motivation_letter)
        VALUES (?, ?, ?)
      `;
                    db_1.default.query(insertQuery, [student_id, internship_id, motivation_letter || null], (insertErr) => {
                        if (insertErr) {
                            console.error("Error inserting application:", insertErr);
                            return res.status(500).json({ message: "Failed to apply to internship." });
                        }
                        return res.status(201).json({ message: "Application submitted successfully." });
                    });
                });
            });
        });
        app.get("/api/applications/daily-count/:studentId", (req, res) => {
            const { studentId } = req.params;
            const sql = `
    SELECT COUNT(*) AS count
    FROM applications
    WHERE student_id = ? AND DATE(applied_at) = CURDATE()
  `;
            db_1.default.query(sql, [studentId], (err, results) => {
                var _a, _b;
                if (err) {
                    console.error("Error fetching daily count:", err);
                    return res.status(500).json({ message: "Database error." });
                }
                const count = (_b = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
                res.json({ count });
            });
        });
        //students application
        app.get("/api/applications/:studentId", (req, res) => {
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
            db_1.default.query(sql, [studentId], (err, results) => {
                if (err) {
                    console.error("Error fetching student applications:", err);
                    return res.status(500).json({ message: "Error fetching applications." });
                }
                res.json(results);
            });
        });
        //cancel application request
        app.delete("/api/applications/cancel/:studentId/:internshipId", (req, res) => {
            const { studentId, internshipId } = req.params;
            const query = `
    DELETE FROM applications
    WHERE student_id = ? AND internship_id = ?
  `;
            db_1.default.query(query, [studentId, internshipId], (err, result) => {
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
        //get all majors
        app.get("/api/majors", (req, res) => {
            const sql = "SELECT * FROM majors";
            db_1.default.query(sql, (err, results) => {
                if (err) {
                    console.error("Failed to fetch majors:", err);
                    return res.status(500).json({ message: "Server error" });
                }
                res.json(results);
            });
        });
        //get interests by major's name
        app.get("/api/interests/by-major-name/:majorName", (req, res) => {
            const { majorName } = req.params;
            const sql = `
    SELECT i.interest_id, i.name 
    FROM interests i
    JOIN majors m ON i.major_id = m.major_id
    WHERE m.name = ?
  `;
            db_1.default.query(sql, [majorName], (err, results) => {
                if (err) {
                    console.error("Failed to fetch interests by major name:", err);
                    return res.status(500).json({ message: "Server error" });
                }
                res.json(results);
            });
        });
        // add students from admin csv file
        app.post("/api/import-students", upload.single("file"), (req, res) => {
            var _a;
            const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            if (!filePath) {
                console.error("No file was uploaded.");
                res.status(400).json({ message: "File is missing." });
                return;
            }
            const students = [];
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on("data", (row) => {
                if (!row["University ID"] || !row["Email"])
                    return;
                students.push({
                    id: row["University ID"].trim(),
                    email: row["Email"].trim(),
                    first_name: row["First Name"].trim(),
                    last_name: row["Last Name"].trim(),
                    phone: row["Phone"].trim(),
                    major: row["Major"].trim(),
                    gpa: parseFloat(row["GPA"]),
                });
            })
                .on("end", () => {
                const userInsert = `
        INSERT IGNORE INTO users (id,first_name,last_name, email,password, role)
        VALUES ?
      `;
                const studentInsert = `
  INSERT IGNORE INTO students (
    student_id, first_name, last_name, phone, major, gpa, account_status
  ) VALUES ?
`;
                const userValues = students.map(s => [s.id, s.first_name, s.last_name, s.email, s.email, "student"]);
                const studentValues = students.map(s => [
                    s.id, s.first_name, s.last_name, s.phone, s.major, s.gpa, "active"
                ]);
                db_1.default.query(userInsert, [userValues], (err) => {
                    if (err) {
                        fs_1.default.unlinkSync(filePath);
                        console.error("User insert failed:", err);
                        res.status(500).json({ message: "Failed to insert users" });
                        return;
                    }
                    db_1.default.query(studentInsert, [studentValues], (err2) => {
                        fs_1.default.unlinkSync(filePath);
                        if (err2) {
                            console.error("Student insert failed:", err2);
                            res.status(500).json({ message: "Failed to insert students" });
                            return;
                        }
                        res.json({ message: `Successfully imported ${students.length} students.` });
                    });
                });
            });
            // show users for admin in messaging system
            app.get("/api/users", (req, res) => {
                const query = "SELECT id, email FROM users WHERE role != 'admin'";
                db_1.default.query(query, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: "Failed to fetch users" });
                    }
                    res.json(results);
                });
            });
            //show supervisors for admin messaging system
            app.get("/api/supervisors", (req, res) => {
                const query = `
    SELECT s.supervisor_id AS id, s.name
    FROM supervisors s
    JOIN users u ON s.supervisor_id = u.id
  `;
                db_1.default.query(query, (err, results) => {
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
            // Get supervisor details by ID
            app.get("/api/supervisors/detail/:id", (req, res) => {
                const { id } = req.params;
                const query = `
    SELECT supervisor_id as id, name, email, company_id
    FROM supervisors 
    WHERE supervisor_id = ?
  `;
                db_1.default.query(query, [id], (err, results) => {
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
            //create single student by admin
            app.post("/api/create-student", (req, res) => {
                const { firstName, lastName, email, phone = "", universityId, major = "", gpa, accountStatus, } = req.body;
                const userInsert = `
    INSERT IGNORE INTO users (id,first_name, last_name, email, password, role)
    VALUES (?,?,?, ?, ?, 'student')
  `;
                const studentInsert = `
    INSERT IGNORE INTO students (
      student_id, first_name, last_name, phone, major, gpa, account_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
                const defaultPassword = email;
                db_1.default.query(userInsert, [universityId, firstName, lastName, email, defaultPassword], (err) => {
                    if (err) {
                        console.error("User insert error:", err);
                        return res.status(500).json({ message: "Error inserting into users" });
                    }
                    db_1.default.query(studentInsert, [
                        universityId,
                        firstName,
                        lastName,
                        phone,
                        major,
                        gpa,
                        accountStatus,
                    ], (err2) => {
                        if (err2) {
                            console.error("Student insert error:", err2);
                            return res.status(500).json({ message: "Error inserting into students" });
                        }
                        res.status(200).json({ message: "Student created successfully", insertId: universityId });
                    });
                });
            });
            //show reports for admin
            app.get("/api/reports", (req, res) => {
                db_1.default.query("SELECT * FROM submit_report", (err, results) => {
                    if (err)
                        return res.status(500).json({ message: "Error fetching reports", err });
                    res.json(results);
                });
            });
            // Get published reports for supervisors to select from
            app.get("/api/published-reports", (req, res) => {
                const sql = `
    SELECT report_id, report_title, month, year, due_date, is_published, status
    FROM submit_report 
    WHERE is_published = 1 AND status = 'published'
    ORDER BY year DESC, month DESC
  `;
                db_1.default.query(sql, (err, results) => {
                    if (err)
                        return res.status(500).json({ message: "Error fetching published reports", err });
                    res.json(results);
                });
            });
            // Get internship details for a student to auto-populate report fields
            app.get("/api/student/:studentId/internship-details", (req, res) => {
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
                db_1.default.query(sql, [studentId], (err, results) => {
                    if (err)
                        return res.status(500).json({ message: "Database error.", error: err });
                    if (results.length === 0) {
                        return res.status(404).json({ message: "No active internship found for this student." });
                    }
                    res.json(results[0]);
                });
            });
            // Check if supervisor has already submitted a report for student/report combination
            app.get("/api/supervisor/check-report/:studentId/:reportId", (req, res) => {
                const { studentId, reportId } = req.params;
                const { supervisorName } = req.query;
                const sql = `
    SELECT COUNT(*) as count 
    FROM report 
    WHERE student_id = ? AND report_id = ? AND supervisor_name = ?
  `;
                db_1.default.query(sql, [studentId, reportId, supervisorName], (err, results) => {
                    var _a;
                    if (err) {
                        console.error("Error checking existing report:", err);
                        return res.status(500).json({ message: "Database error", error: err });
                    }
                    const exists = ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) > 0;
                    res.json({ exists });
                });
            });
            // Submit supervisor report
            app.post("/api/supervisor/submit-report", (req, res) => {
                const { student_id, report_id, course_subject, internship_type, month, year, full_name, supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments, company_name } = req.body;
                // Generate a unique report ID for this submission
                const uniqueReportId = `${Date.now()}_${student_id}_${report_id}`;
                const insertQuery = `
    INSERT INTO report (
      student_id, report_id, course_subject, internship_type, month, year, 
      full_name, supervisor_name, date_from, date_to, time_from, time_to, 
      supervisor_comments, company_name, submitted_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
                db_1.default.query(insertQuery, [
                    student_id,
                    uniqueReportId,
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
                    company_name
                ], (err) => {
                    if (err) {
                        console.error("Failed to insert supervisor report:", err);
                        return res.status(500).json({ message: "Database error", error: err });
                    }
                    res.json({
                        message: "Supervisor report submitted successfully",
                        reportId: uniqueReportId
                    });
                });
            });
            // === Company Reports API Endpoints ===
            // Get all students with accepted applications for a company's internships
            app.get("/api/company/:companyId/students", (req, res) => {
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
                db_1.default.query(sql, [companyId], (err, results) => {
                    if (err) {
                        console.error("Error fetching company students:", err);
                        return res.status(500).json({ message: "Error fetching students." });
                    }
                    res.json(results);
                });
            });
            // Get reports for a specific student (for student's own access)
            app.get("/api/reports/:studentId", (req, res) => {
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
      r.supervisor_comments,
      r.due_date,
      r.grade,
      r.status,
      CASE WHEN r.status IS NOT NULL THEN true ELSE false END as published
    FROM report r
    WHERE r.student_id = ?
    ORDER BY r.year DESC, r.month DESC
  `;
                db_1.default.query(sql, [studentId], (err, results) => {
                    if (err) {
                        console.error("Error fetching student reports:", err);
                        return res.status(500).json({ message: "Error fetching reports." });
                    }
                    res.json(results);
                });
            });
            // Update a student's report (for student's own reports)
            app.put("/api/reports/:reportId", (req, res) => {
                const { reportId } = req.params;
                const { supervisor_comments } = req.body;
                const sql = `
    UPDATE report 
    SET supervisor_comments = ?
    WHERE report_id = ?
  `;
                db_1.default.query(sql, [supervisor_comments, reportId], (err, result) => {
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
            app.get("/api/company/:companyId/student/:studentId/reports", (req, res) => {
                const { companyId, studentId } = req.params;
                const sql = `
    SELECT 
      r.*
    FROM report r
    WHERE r.student_id = ?
    ORDER BY r.year DESC, r.month DESC
  `;
                db_1.default.query(sql, [studentId], (err, results) => {
                    if (err) {
                        console.error("Error fetching student reports:", err);
                        return res.status(500).json({ message: "Error fetching reports." });
                    }
                    res.json(results);
                });
            });
            // === Supervisor API Endpoints ===
            // === New Route: Get Accepted Students for Supervisor ===
            app.get("/api/supervisor/:supervisorId/accepted-students", (req, res) => {
                const { supervisorId } = req.params;
                const sql = `
    SELECT s.student_id, s.first_name, s.last_name, a.internship_id
    FROM internship i
    JOIN applications a ON i.internship_id = a.internship_id
    JOIN students s ON a.student_id = s.student_id
    WHERE i.supervisor_id = ? AND a.status = 'accepted'
  `;
                db_1.default.query(sql, [supervisorId], (err, results) => {
                    if (err)
                        return res.status(500).json({ message: "Database error.", error: err });
                    res.json(results);
                });
            });
            // === New Route: Get Attendance Summary for Supervisor ===
            app.get("/api/supervisor/:supervisorId/attendance-summary", (req, res) => {
                const { supervisorId } = req.params;
                // Get all accepted students for this supervisor
                const studentsSql = `
    SELECT s.student_id, s.first_name, s.last_name
    FROM internship i
    JOIN applications a ON i.internship_id = a.internship_id
    JOIN students s ON a.student_id = s.student_id
    WHERE i.supervisor_id = ? AND a.status = 'accepted'
  `;
                db_1.default.query(studentsSql, [supervisorId], (err, studentsResult) => {
                    if (err)
                        return res.status(500).json({ message: "Database error.", error: err });
                    const students = studentsResult;
                    if (!students || students.length === 0)
                        return res.json([]);
                    // For each student, get absence count and history
                    const studentIds = students.map((s) => s.student_id);
                    const absencesSql = `
      SELECT student_id, date, reason
      FROM absences
      WHERE supervisor_id = ? AND student_id IN (?)
      ORDER BY date DESC
    `;
                    db_1.default.query(absencesSql, [supervisorId, studentIds], (err2, absencesResult) => {
                        if (err2)
                            return res.status(500).json({ message: "Database error.", error: err2 });
                        const absences = absencesResult;
                        // Group absences by student_id
                        const absMap = {};
                        for (const a of absences) {
                            if (!absMap[a.student_id])
                                absMap[a.student_id] = [];
                            absMap[a.student_id].push({ date: a.date, reason: a.reason });
                        }
                        // Build summary
                        const summary = students.map((s) => {
                            var _a;
                            return ({
                                student_id: s.student_id,
                                first_name: s.first_name,
                                last_name: s.last_name,
                                absenceCount: ((_a = absMap[s.student_id]) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                absenceHistory: absMap[s.student_id] || [],
                            });
                        });
                        res.json(summary);
                    });
                });
            });
            // === New Route: Record Daily Absences ===
            app.post("/api/attendance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                const values = absences.map((a) => [a.student_id, supervisor_id, date, a.reason || null]);
                const sql = `INSERT INTO absences (student_id, supervisor_id, date, reason) VALUES ?`;
                db_1.default.query(sql, [values], (err, result) => {
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
            }));
            // === New Route: Supervisor Dashboard Data ===
            app.get("/api/supervisor/:supervisorId/dashboard", (req, res) => {
                const { supervisorId } = req.params;
                // 1. Get supervised students (accepted only)
                const studentsSql = `
    SELECT s.student_id, s.first_name, s.last_name
    FROM internship i
    JOIN applications a ON i.internship_id = a.internship_id
    JOIN students s ON a.student_id = s.student_id
    WHERE i.supervisor_id = ? AND a.status = 'accepted'
  `;
                db_1.default.query(studentsSql, [supervisorId], (err, studentsResult) => {
                    if (err)
                        return res.status(500).json({ message: "Database error (students)", error: err });
                    const students = studentsResult;
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
                    db_1.default.query(absencesSql, [supervisorId, studentIds], (err2, absResult) => {
                        var _a;
                        if (err2)
                            return res.status(500).json({ message: "Database error (absences)", error: err2 });
                        const absArr = absResult;
                        const totalAbsences = ((_a = absArr[0]) === null || _a === void 0 ? void 0 : _a.totalAbsences) || 0;
                        // 3. Get recent reports for these students (last 5)
                        const reportsSql = `
        SELECT r.report_id, r.student_id, s.first_name, s.last_name, r.course_subject, r.month, r.year
        FROM report r
        JOIN students s ON r.student_id = s.student_id
        WHERE r.student_id IN (?)
        ORDER BY r.year DESC, r.month DESC
        LIMIT 5
      `;
                        db_1.default.query(reportsSql, [studentIds], (err3, reportsResult) => {
                            if (err3)
                                return res.status(500).json({ message: "Database error (reports)", error: err3 });
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
            app.get("/api/student/:studentId/absences", (req, res) => {
                const { studentId } = req.params;
                const sql = `
    SELECT date, reason, supervisor_id
    FROM absences
    WHERE student_id = ?
    ORDER BY date DESC
  `;
                db_1.default.query(sql, [studentId], (err, results) => {
                    if (err)
                        return res.status(500).json({ message: "Database error.", error: err });
                    res.json(results);
                });
            });
            // Get reports for a specific student by supervisor
            app.get("/api/supervisor/:supervisorId/student/:studentId/reports", (req, res) => {
                const { supervisorId, studentId } = req.params;
                const sql = `
    SELECT r.*
    FROM report r
    JOIN internship i ON r.student_id = ?
    WHERE i.supervisor_id = ? AND r.student_id = ?
    ORDER BY r.year DESC, r.month DESC
  `;
                db_1.default.query(sql, [studentId, supervisorId, studentId], (err, results) => {
                    if (err)
                        return res.status(500).json({ message: "Database error.", error: err });
                    res.json(results);
                });
            });
            // Check if supervisor has already submitted a report for a specific student and report template
            app.get("/api/supervisor/check-report/:studentId/:reportId", (req, res) => {
                const { studentId, reportId } = req.params;
                // Get supervisor info from request (you might want to get this from auth token)
                const supervisorInfo = req.query.supervisorName;
                const sql = `
    SELECT report_id, submitted_at 
    FROM report 
    WHERE student_id = ? AND supervisor_name = ? AND (month = (SELECT month FROM submit_report WHERE report_id = ?) AND year = (SELECT year FROM submit_report WHERE report_id = ?))
    LIMIT 1
  `;
                db_1.default.query(sql, [studentId, supervisorInfo, reportId, reportId], (err, results) => {
                    if (err) {
                        console.error("Error checking existing report:", err);
                        return res.status(500).json({ message: "Database error." });
                    }
                    const alreadySubmitted = results.length > 0;
                    res.json({
                        alreadySubmitted,
                        existingReport: alreadySubmitted ? results[0] : null
                    });
                });
            });
            app.post("/api/supervisor/submit-report", (req, res) => {
                const { student_id, report_id, course_subject, internship_type, month, year, full_name, supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments } = req.body;
                // Generate a smaller unique report ID
                const reportId = Math.floor(Math.random() * 1000000);
                const sql = `
    INSERT INTO report (
      report_id, student_id, course_subject, internship_type, month, year, full_name,
      supervisor_name, date_from, date_to, time_from, time_to, supervisor_comments
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
                db_1.default.query(sql, [
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
                ], (err, result) => {
                    if (err) {
                        console.error("Error submitting supervisor report:", err);
                        return res.status(500).json({ message: "Failed to submit report." });
                    }
                    res.json({ message: "Report submitted successfully." });
                });
            });
            // Fixed check-report endpoint that works with the new submission logic
            app.get("/api/supervisor/check-report-fixed/:studentId/:reportId", (req, res) => {
                const { studentId, reportId } = req.params;
                const { supervisorName } = req.query;
                // First get the month and year from the published report
                const getReportDetailsQuery = `
    SELECT month, year FROM submit_report WHERE report_id = ?
  `;
                db_1.default.query(getReportDetailsQuery, [reportId], (err, reportDetails) => {
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
                    db_1.default.query(checkQuery, [studentId, supervisorName, month, year], (err, results) => {
                        var _a;
                        if (err) {
                            console.error("Error checking existing report:", err);
                            return res.status(500).json({ message: "Database error", error: err });
                        }
                        const exists = ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) > 0;
                        res.json({ exists });
                    });
                });
            });
        });
    });
});
