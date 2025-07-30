import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "", 
  database: "pal_db",
  port: 3308,
  flags: ["+MULTI_STATEMENTS"],
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database.");
  
  // Set SQL mode to allow AUTO_INCREMENT to work properly
  db.query("SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'", (sqlModeErr) => {
    if (sqlModeErr) {
      console.error("Failed to set SQL mode:", sqlModeErr);
    } else {
      console.log("SQL mode set successfully for AUTO_INCREMENT");
    }
  });
});

export default db;
