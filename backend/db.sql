CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    isbn VARCHAR(50),
    copies INT DEFAULT 1
);

INSERT INTO admin (username, password) VALUES ('admin', 'admin123');

INSERT INTO books (title, author, isbn, copies) VALUES
('Harry Potter', 'J.K. Rowling', '9780439708180', 5),
('The Alchemist', 'Paulo Coelho', '9780061122415', 3),
('1984', 'George Orwell', '9780451524935', 4);

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'asps1234';
FLUSH PRIVILEGES;

select * from library_db;