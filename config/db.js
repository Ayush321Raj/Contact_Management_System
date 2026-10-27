// ==========================================================
// config/db.js
// MySQL Database Connection Pool Configuration
// ==========================================================

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a connection pool to optimize query execution and connection reuse
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'contact_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to test the database connection when the server starts
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database successfully:', process.env.DB_NAME || 'contact_db');
        connection.release(); // Release connection back to pool
    } catch (error) {
        console.error('❌ Database connection failed!');
        console.error('Error details:', error.message);
        console.log('💡 Tip: Ensure MySQL / XAMPP is running and database "contact_db" exists.');
    }
}

// Test immediately on module load
testConnection();

module.exports = pool;
