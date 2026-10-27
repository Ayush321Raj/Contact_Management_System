# Contact Management System
> **Subtitle:** Manage Your Contacts Easily  
> **Course:** MCA Internet and Web Technology (IWT) Laboratory Practical / Examination  
> **Architecture:** Full-Stack Web Application (HTML5, CSS3, Vanilla JS, Node.js, Express.js, MySQL)

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [Database Design & phpMyAdmin Setup](#-database-design--phpmyadmin-setup)
5. [Installation & Execution Guide](#-installation--execution-guide)
6. [REST API Documentation](#-rest-api-documentation)
7. [Security & Best Practices](#-security--best-practices)
8. [IWT Lab Viva-Voce Questions & Answers](#-iwt-lab-viva-voce-questions--answers)

---

## 🌟 Project Overview
The **Contact Management System** is a clean, responsive, beginner-friendly full-stack web application designed specifically for academic evaluation in Internet and Web Technology (IWT) laboratory examinations.

### Core Features:
- ➕ **Add Contact:** Add new contact with Full Name, Email, Phone Number, and Address.
- 👁️ **View All Contacts:** Fetch and display contacts in a real-time responsive data table.
- 🔍 **Live Search Filter:** Instant client-side search across Name, Email, Phone, and Address without reloading the page.
- ✏️ **Edit Contact:** Seamlessly toggle into edit mode, prefill inputs, and update records in MySQL.
- 🗑️ **Delete Contact:** Safe deletion with confirmation modal dialog to prevent accidental data loss.
- 🛡️ **Dual-Layer Validation:** Strict client-side and server-side validation for email formats and phone number lengths.
- 💾 **Permanent MySQL Storage:** All contacts are stored permanently in a relational MySQL database.

---

## 💻 Technology Stack

| Layer | Technology | Role / Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5 | Semantic structure (`<header>`, `<main>`, `<section>`, `<table>`, `<form>`) |
| **Styling** | CSS3 (Vanilla) | Modern palette (`#2563EB`, `#0F172A`, `#F8FAFC`), subtle card shadows, responsive layout |
| **Client Script** | Vanilla JavaScript | Asynchronous HTTP requests using `fetch()`, DOM updates, validation, live filtering |
| **Backend Runtime**| Node.js | JavaScript server runtime |
| **Web Framework** | Express.js | RESTful routing, middleware (`express.json()`, `express.static()`) |
| **Database** | MySQL | Relational database storage |
| **DB Driver** | `mysql2/promise` | Reusable connection pool with parameterized queries (`?`) |
| **DB GUI** | phpMyAdmin / XAMPP | Visual database administration, table inspection, and SQL querying |

---

## 📁 Project Directory Structure

```text
contact-management-system/
│
├── public/                     # Static frontend files served by Express
│   ├── index.html              # Main HTML user interface
│   ├── style.css               # Professional CSS stylesheet
│   └── script.js               # Frontend JavaScript with Fetch API
│
├── config/
│   └── db.js                   # MySQL connection pool using mysql2/promise
│
├── controllers/
│   └── contactController.js     # Controller functions for CRUD logic
│
├── routes/
│   └── contactRoutes.js        # Express REST API route definitions
│
├── .env                        # Environment variables (Database credentials & Port)
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules (node_modules, .env)
├── database.sql                # SQL script to create database and tables
├── package.json                # Project dependencies and startup scripts
├── server.js                   # Main application entry point
└── README.md                   # Lab manual and documentation
```

---

## 🗄️ Database Design & phpMyAdmin Setup

### Database Name: `contact_db`
### Table Name: `contacts`

### SQL Schema (`database.sql`):
```sql
CREATE DATABASE IF NOT EXISTS contact_db;
USE contact_db;

CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Steps to Import in phpMyAdmin:
1. Open XAMPP Control Panel and start **Apache** and **MySQL**.
2. Open your web browser and navigate to: `http://localhost/phpmyadmin`
3. Click on the **Databases** tab, type `contact_db` under *Create database*, and click **Create**.
4. Select `contact_db` from the left sidebar, click the **Import** tab at the top.
5. Click **Choose File**, select `database.sql` from this project folder, and click **Import** (or **Go**).
6. Verify that the `contacts` table and sample rows are visible.

---

## 🚀 Installation & Execution Guide

### Prerequisites:
- **Node.js** (v16 or higher)
- **MySQL / XAMPP** (with Apache and MySQL services running)

### Step 1: Install Dependencies
Open PowerShell or Command Prompt in the project folder and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Verify or edit the `.env` file in the project root:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=contact_db
PORT=3000
```
*(Leave `DB_PASSWORD=` blank if using standard default XAMPP MySQL).*

### Step 3: Initialize Database (If not done via phpMyAdmin)
You can run the script directly in MySQL CLI:
```bash
mysql -u root < database.sql
```

### Step 4: Start the Application
Run:
```bash
npm start
```
Or for development with automatic restart:
```bash
npm run dev
```

### Step 5: Open in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📡 REST API Documentation

Base URL: `http://localhost:3000/api/contacts`

| Method | Endpoint | Description | Request Body | Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/contacts` | Retrieve all contacts | *None* | `200 OK`, `500 Error` |
| **GET** | `/api/contacts/:id` | Retrieve single contact by ID | *None* | `200 OK`, `400 Bad ID`, `404 Not Found` |
| **POST** | `/api/contacts` | Create a new contact | JSON `{ name, email, phone, address }` | `201 Created`, `400 Invalid Input`, `500 Error` |
| **PUT** | `/api/contacts/:id` | Update existing contact | JSON `{ name, email, phone, address }` | `200 OK`, `400 Bad ID/Input`, `404 Not Found` |
| **DELETE** | `/api/contacts/:id` | Delete a contact | *None* | `200 OK`, `400 Bad ID`, `404 Not Found` |

### Sample JSON Payload (POST / PUT):
```json
{
  "name": "Ayush Raj",
  "email": "ayush@example.com",
  "phone": "9876543210",
  "address": "Puducherry, India"
}
```

---

## 🔒 Security & Best Practices

1. **SQL Injection Prevention:**
   All queries use parameterized placeholders (`?`) via `mysql2/promise`:
   ```javascript
   // SECURE: Uses parameterized query
   await pool.execute('SELECT * FROM contacts WHERE id = ?', [contactId]);
   ```
   *Never concatenate user strings directly into SQL queries.*

2. **Credential Safety:**
   Database passwords and credentials are stored securely in `.env` and loaded via `dotenv`, keeping sensitive keys out of version control.

3. **XSS (Cross-Site Scripting) Defense:**
   In `script.js`, all user data displayed on the page is sanitized using `escapeHtml()` to prevent malicious scripts from executing.

4. **Resource Management:**
   Uses a MySQL Connection Pool (`mysql.createPool`) rather than single connections, maximizing throughput and preventing connection leaks.

---

## 🎓 IWT Lab Viva-Voce Questions & Answers

**Q1: What is REST and why is it used?**  
*Answer:* REST (Representational State Transfer) is an architectural style for web services. It uses standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) for CRUD operations, providing stateless, scalable, and standardized communication between frontend and backend.

**Q2: What is the purpose of `express.json()` and `express.static()` middleware?**  
*Answer:*
- `express.json()` parses incoming HTTP requests with JSON payloads and populates `req.body`.
- `express.static('public')` serves client-side static assets (HTML, CSS, client JS, images) directly from the `public` directory.

**Q3: What is SQL Injection and how did you prevent it in this project?**  
*Answer:* SQL Injection occurs when untrusted user input is concatenated directly into SQL statements, allowing attackers to execute unauthorized commands. We prevented it by using parameterized prepared statements (`?` placeholders) with `mysql2`, which treats user inputs strictly as literal values rather than executable SQL code.

**Q4: Why use a Database Connection Pool instead of `mysql.createConnection`?**  
*Answer:* `createConnection` creates a single connection that can become a bottleneck or disconnect unexpectedly. `createPool` maintains a cache of reusable connections, automatically distributing queries across available connections and queueing requests efficiently.

**Q5: How does the Fetch API work asynchronously?**  
*Answer:* The `fetch()` function returns a `Promise`. By pairing it with `async/await`, the browser initiates the HTTP request in the background without blocking the UI thread. When the server responds, execution resumes and handles the JSON response.
