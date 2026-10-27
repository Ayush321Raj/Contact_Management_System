// ==========================================================
// server.js
// Main Express Application Entry Point
// Contact Management System — MCA IWT Lab
// ==========================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 1. Load environment variables
dotenv.config();

// 2. Import database connection pool (tests connection on startup)
const pool = require('./config/db');

// 3. Import contact routes
const contactRoutes = require('./routes/contactRoutes');

// 4. Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// 5. Middleware configuration
app.use(cors()); // Allow Cross-Origin requests
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// 6. Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 7. Register API Routes
app.use('/api/contacts', contactRoutes);

// 8. Base Health Check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Contact Management System API is running smoothly.',
        timestamp: new Date().toISOString()
    });
});

// 9. 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

// 10. Start the server
app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 Contact Management System is running!`);
    console.log(`🌐 Application URL : http://localhost:${PORT}`);
    console.log(`📡 REST API Endpoint : http://localhost:${PORT}/api/contacts`);
    console.log('====================================================');
});
