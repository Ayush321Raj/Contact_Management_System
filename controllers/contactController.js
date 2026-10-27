// ==========================================================
// controllers/contactController.js
// Handles all CRUD operations for contacts with parameterized SQL
// ==========================================================

const pool = require('../config/db');

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate phone number (digits, spaces, hyphens, min 7 digits)
const isValidPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

// ----------------------------------------------------------
// 1. GET ALL CONTACTS
// GET /api/contacts
// ----------------------------------------------------------
const getAllContacts = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM contacts ORDER BY id DESC');
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: Unable to retrieve contacts.'
        });
    }
};

// ----------------------------------------------------------
// 2. GET SINGLE CONTACT BY ID
// GET /api/contacts/:id
// ----------------------------------------------------------
const getContactById = async (req, res) => {
    const contactId = parseInt(req.params.id, 10);

    // Validate ID
    if (isNaN(contactId) || contactId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid contact ID provided.'
        });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [contactId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${contactId} not found.`
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: Unable to retrieve contact.'
        });
    }
};

// ----------------------------------------------------------
// 3. CREATE NEW CONTACT
// POST /api/contacts
// ----------------------------------------------------------
const createContact = async (req, res) => {
    const { name, email, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: name, email, and phone.'
        });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = (address || '').trim();

    if (trimmedName.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Full Name must be at least 2 characters long.'
        });
    }

    if (!isValidEmail(trimmedEmail)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.'
        });
    }

    if (!isValidPhone(trimmedPhone)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid phone number (7 to 15 digits).'
        });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO contacts (name, email, phone, address) VALUES (?, ?, ?, ?)',
            [trimmedName, trimmedEmail, trimmedPhone, trimmedAddress]
        );

        res.status(201).json({
            success: true,
            message: 'Contact created successfully.',
            data: {
                id: result.insertId,
                name: trimmedName,
                email: trimmedEmail,
                phone: trimmedPhone,
                address: trimmedAddress
            }
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: Unable to create contact.'
        });
    }
};

// ----------------------------------------------------------
// 4. UPDATE EXISTING CONTACT
// PUT /api/contacts/:id
// ----------------------------------------------------------
const updateContact = async (req, res) => {
    const contactId = parseInt(req.params.id, 10);

    if (isNaN(contactId) || contactId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid contact ID provided.'
        });
    }

    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: name, email, and phone.'
        });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = (address || '').trim();

    if (trimmedName.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Full Name must be at least 2 characters long.'
        });
    }

    if (!isValidEmail(trimmedEmail)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.'
        });
    }

    if (!isValidPhone(trimmedPhone)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid phone number (7 to 15 digits).'
        });
    }

    try {
        // Check if contact exists first
        const [checkRows] = await pool.execute('SELECT id FROM contacts WHERE id = ?', [contactId]);
        if (checkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${contactId} not found.`
            });
        }

        await pool.execute(
            'UPDATE contacts SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [trimmedName, trimmedEmail, trimmedPhone, trimmedAddress, contactId]
        );

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully.',
            data: {
                id: contactId,
                name: trimmedName,
                email: trimmedEmail,
                phone: trimmedPhone,
                address: trimmedAddress
            }
        });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: Unable to update contact.'
        });
    }
};

// ----------------------------------------------------------
// 5. DELETE CONTACT
// DELETE /api/contacts/:id
// ----------------------------------------------------------
const deleteContact = async (req, res) => {
    const contactId = parseInt(req.params.id, 10);

    if (isNaN(contactId) || contactId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid contact ID provided.'
        });
    }

    try {
        // Verify existence before deletion
        const [checkRows] = await pool.execute('SELECT id FROM contacts WHERE id = ?', [contactId]);
        if (checkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${contactId} not found.`
            });
        }

        await pool.execute('DELETE FROM contacts WHERE id = ?', [contactId]);

        res.status(200).json({
            success: true,
            message: `Contact with ID ${contactId} deleted successfully.`
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: Unable to delete contact.'
        });
    }
};

module.exports = {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
};
