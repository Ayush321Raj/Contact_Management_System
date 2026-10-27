// ==========================================================
// routes/contactRoutes.js
// Express Router for Contact CRUD Endpoints
// ==========================================================

const express = require('express');
const router = express.Router();

const {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
} = require('../controllers/contactController');

// Route definitions for /api/contacts
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
