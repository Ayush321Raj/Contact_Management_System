-- ==========================================================
-- Contact Management System - Database Schema
-- Designed for MCA IWT Lab Examination / Practical
-- ==========================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS contact_db;

-- 2. Select Database
USE contact_db;

-- 3. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Sample Demonstration Data
INSERT INTO contacts (name, email, phone, address) VALUES
('Ayush Raj', 'ayush@example.com', '9876543210', 'Puducherry, India'),
('Priya Sharma', 'priya.sharma@example.com', '9845123456', 'Chennai, Tamil Nadu'),
('Rahul Verma', 'rahul.verma@example.com', '9123456780', 'Bengaluru, Karnataka')
ON DUPLICATE KEY UPDATE id=id;
