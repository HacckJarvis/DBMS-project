// Library Management System Backend
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected!");
});

// ---------- LOGIN ----------
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM admin WHERE username=? AND password=?";
  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length > 0) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.json({ success: false, message: "Invalid username or password" });
    }
  });
});

// ---------- FETCH BOOKS ----------
app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to fetch books" });
    res.json(result);
  });
});

// ---------- ADD BOOK ----------
app.post("/books", (req, res) => {
  const { title, author, isbn, copies } = req.body;
  const sql = "INSERT INTO books (title, author, isbn, copies) VALUES (?,?,?,?)";
  db.query(sql, [title, author, isbn, copies], (err) => {
    if (err) return res.status(500).json({ error: "Failed to add book" });
    res.json({ success: true, message: "📗 Book added successfully" });
  });
});

// ---------- UPDATE BOOK ----------
app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, copies } = req.body;
  const sql = "UPDATE books SET title=?, author=?, isbn=?, copies=? WHERE id=?";
  db.query(sql, [title, author, isbn, copies, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update book" });
    res.json({ success: true, message: "✏️ Book updated successfully" });
  });
});

// ---------- DELETE BOOK ----------
app.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM books WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete book" });
    res.json({ success: true, message: "🗑️ Book deleted successfully" });
  });
});

// ========== ISSUE BOOK ==========
app.post('/issue', (req, res) => {
  const { book_id, student_name } = req.body;

  const checkCopies = "SELECT copies FROM books WHERE id=?";
  db.query(checkCopies, [book_id], (err, result) => {
    if (err) return res.json({ message: "Error checking book" });

    if (result.length === 0) return res.json({ message: "Book not found!" });
    if (result[0].copies <= 0) return res.json({ message: "No copies available!" });

    const issueBook = "INSERT INTO issued_books (book_id, student_name) VALUES (?, ?)";
    db.query(issueBook, [book_id, student_name], (err2) => {
      if (err2) return res.json({ message: "Error issuing book" });

      const updateCopies = "UPDATE books SET copies = copies - 1 WHERE id=?";
      db.query(updateCopies, [book_id]);
      res.json({ message: "Book issued successfully!" });
    });
  });
});

// ========== RETURN BOOK ==========
app.put('/return/:id', (req, res) => {
  const { id } = req.params;

  const getBook = "SELECT book_id FROM issued_books WHERE id=?";
  db.query(getBook, [id], (err, result) => {
    if (err) return res.json({ message: "Error finding issue record" });
    if (result.length === 0) return res.json({ message: "Record not found!" });

    const book_id = result[0].book_id;
    const updateReturn = `
      UPDATE issued_books 
      SET status='Returned', return_date=CURRENT_DATE 
      WHERE id=?`;
    db.query(updateReturn, [id], (err2) => {
      if (err2) return res.json({ message: "Error updating record" });

      const updateBook = "UPDATE books SET copies = copies + 1 WHERE id=?";
      db.query(updateBook, [book_id]);
      res.json({ message: "Book returned successfully!" });
    });
  });
});

// ========== VIEW ISSUED BOOKS ==========
app.get('/issued', (req, res) => {
  const query = `
    SELECT ib.id, b.title, ib.student_name, ib.issue_date, ib.return_date, ib.status
    FROM issued_books ib
    JOIN books b ON ib.book_id = b.id`;
  db.query(query, (err, result) => {
    if (err) return res.json({ message: "Error fetching issued books" });
    res.json(result);
  });
});


app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
