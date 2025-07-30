import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pal_db'
});

// Read SQL file content
const sqlFilePath = path.join(__dirname, 'add_student_interests.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
  
  // Execute SQL commands
  connection.query(sqlContent, (err, results) => {
    if (err) {
      console.error('Error executing SQL commands:', err);
      return;
    }
    console.log('SQL commands executed successfully!');
    
    // Query to verify the results
    connection.query('SELECT * FROM student_interests', (err, results) => {
      if (err) {
        console.error('Error querying student_interests:', err);
        return;
      }
      console.log('Student interests:');
      console.log(results);
      
      connection.query('SELECT * FROM internship_interests', (err, results) => {
        if (err) {
          console.error('Error querying internship_interests:', err);
          return;
        }
        console.log('Internship interests:');
        console.log(results);
        
        // Close the connection
        connection.end();
      });
    });
  });
});
