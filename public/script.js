// ==========================================================
// script.js
// Frontend Logic for Contact Management System
// Uses Fetch API, REST Endpoints, and Vanilla JavaScript
// ==========================================================

// Global state variables
let allContacts = [];
let contactToDeleteId = null;

// DOM Elements
const contactForm = document.getElementById('contact-form');
const contactIdInput = document.getElementById('contact-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');

const formHeading = document.getElementById('form-heading');
const formIcon = document.getElementById('form-icon');
const submitBtn = document.getElementById('submit-btn');
const submitBtnText = document.getElementById('submit-btn-text');
const cancelBtn = document.getElementById('cancel-btn');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const contactsTbody = document.getElementById('contacts-tbody');
const contactsTable = document.getElementById('contacts-table');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const emptyStateDesc = document.getElementById('empty-state-desc');

const totalContactsCount = document.getElementById('total-contacts-count');
const filteredCount = document.getElementById('filtered-count');

// Modal Elements
const deleteModal = document.getElementById('delete-modal');
const deleteContactName = document.getElementById('delete-contact-name');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// Error message elements
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');

// ==========================================================
// 1. INITIALIZATION ON PAGE LOAD
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    fetchContacts();
    setupEventListeners();
});

// Setup interactive event listeners
function setupEventListeners() {
    // Form submission (Add or Update)
    contactForm.addEventListener('submit', handleFormSubmit);

    // Cancel edit mode
    cancelBtn.addEventListener('click', resetFormToAddMode);

    // Live search input
    searchInput.addEventListener('input', handleSearchInput);
    clearSearchBtn.addEventListener('click', clearSearch);

    // Modal controls
    modalCancelBtn.addEventListener('click', closeDeleteModal);
    modalConfirmBtn.addEventListener('click', confirmDeleteContact);

    // Close modal on outside backdrop click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal.style.display !== 'none') {
            closeDeleteModal();
        }
    });

    // Real-time input error clearing
    nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));
    emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
    phoneInput.addEventListener('input', () => clearFieldError(phoneInput, phoneError));
}

// ==========================================================
// 2. FETCH CONTACTS (GET /api/contacts)
// ==========================================================
async function fetchContacts() {
    showLoading(true);
    try {
        const response = await fetch('/api/contacts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
            allContacts = result.data || [];
            totalContactsCount.textContent = allContacts.length;
            renderContacts(allContacts);
        } else {
            showToast(result.message || 'Failed to fetch contacts.', 'error');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        showToast('Unable to connect to the server. Please ensure Node.js and MySQL are running.', 'error');
        renderContacts([]);
    } finally {
        showLoading(false);
    }
}

// ==========================================================
// 3. RENDER CONTACTS IN TABLE
// ==========================================================
function renderContacts(contacts) {
    contactsTbody.innerHTML = '';
    filteredCount.textContent = contacts.length;

    if (contacts.length === 0) {
        contactsTable.style.display = 'none';
        emptyState.style.display = 'block';

        if (searchInput.value.trim() !== '') {
            emptyStateDesc.textContent = `No contacts matching "${escapeHtml(searchInput.value.trim())}".`;
        } else {
            emptyStateDesc.textContent = 'You have not added any contacts yet. Use the form to add one!';
        }
        return;
    }

    contactsTable.style.display = 'table';
    emptyState.style.display = 'none';

    contacts.forEach((contact, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="contact-id-col">${index + 1}</td>
            <td>
                <span class="contact-name">${escapeHtml(contact.name)}</span>
                <a href="mailto:${escapeHtml(contact.email)}" class="contact-email" title="Send Email">
                    ✉️ ${escapeHtml(contact.email)}
                </a>
            </td>
            <td>
                <a href="tel:${escapeHtml(contact.phone)}" class="contact-phone" title="Call Contact">
                    📞 ${escapeHtml(contact.phone)}
                </a>
            </td>
            <td>
                <div class="contact-address">
                    ${contact.address ? escapeHtml(contact.address) : '<span class="address-empty">Not provided</span>'}
                </div>
            </td>
            <td class="text-right">
                <div class="actions-cell">
                    <button class="action-btn btn-edit" onclick="startEditContact(${contact.id})" title="Edit Contact">
                        ✏️ Edit
                    </button>
                    <button class="action-btn btn-delete" onclick="openDeleteModal(${contact.id}, '${escapeQuote(contact.name)}')" title="Delete Contact">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;
        contactsTbody.appendChild(tr);
    });
}

// ==========================================================
// 4. FORM VALIDATION (CLIENT-SIDE)
// ==========================================================
function validateForm() {
    let isValid = true;

    // Reset previous errors
    clearFieldError(nameInput, nameError);
    clearFieldError(emailInput, emailError);
    clearFieldError(phoneInput, phoneError);

    // 1. Validate Name
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
        setFieldError(nameInput, nameError, 'Full Name is required.');
        isValid = false;
    } else if (nameVal.length < 2) {
        setFieldError(nameInput, nameError, 'Name must be at least 2 characters.');
        isValid = false;
    }

    // 2. Validate Email
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
        setFieldError(emailInput, emailError, 'Email address is required.');
        isValid = false;
    } else if (!emailRegex.test(emailVal)) {
        setFieldError(emailInput, emailError, 'Please enter a valid email (e.g. name@example.com).');
        isValid = false;
    }

    // 3. Validate Phone Number (7 to 15 digits)
    const phoneVal = phoneInput.value.trim();
    const digitsOnly = phoneVal.replace(/\D/g, '');
    if (!phoneVal) {
        setFieldError(phoneInput, phoneError, 'Phone number is required.');
        isValid = false;
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setFieldError(phoneInput, phoneError, 'Enter a valid phone number (7 to 15 digits).');
        isValid = false;
    }

    return isValid;
}

function setFieldError(inputElement, errorElement, message) {
    inputElement.classList.add('is-invalid');
    errorElement.textContent = message;
}

function clearFieldError(inputElement, errorElement) {
    inputElement.classList.remove('is-invalid');
    errorElement.textContent = '';
}

// ==========================================================
// 5. FORM SUBMISSION (CREATE OR UPDATE)
// ==========================================================
async function handleFormSubmit(e) {
    e.preventDefault();

    // Client-side validation check
    if (!validateForm()) {
        return;
    }

    const contactId = contactIdInput.value.trim();
    const isEditMode = Boolean(contactId);

    const contactData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim()
    };

    // Disable submit button during request
    submitBtn.disabled = true;
    submitBtnText.textContent = isEditMode ? 'Updating...' : 'Adding...';

    try {
        let response;
        if (isEditMode) {
            // PUT /api/contacts/:id
            response = await fetch(`/api/contacts/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
        } else {
            // POST /api/contacts
            response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
        }

        const result = await response.json();

        if (response.ok && result.success) {
            showToast(result.message || (isEditMode ? 'Contact updated!' : 'Contact added!'), 'success');
            resetFormToAddMode();
            await fetchContacts();
        } else {
            showToast(result.message || 'Operation failed. Check input details.', 'error');
        }
    } catch (error) {
        console.error('Save Error:', error);
        showToast('Error communicating with the backend server.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtnText.textContent = isEditMode ? 'Update Contact' : 'Add Contact';
    }
}

// ==========================================================
// 6. EDIT CONTACT MODE
// ==========================================================
function startEditContact(id) {
    const contact = allContacts.find(c => c.id === id);
    if (!contact) {
        showToast('Contact not found.', 'error');
        return;
    }

    // Populate form fields
    contactIdInput.value = contact.id;
    nameInput.value = contact.name;
    emailInput.value = contact.email;
    phoneInput.value = contact.phone;
    addressInput.value = contact.address || '';

    // Clear any previous error styling
    clearFieldError(nameInput, nameError);
    clearFieldError(emailInput, emailError);
    clearFieldError(phoneInput, phoneError);

    // Switch form UI to Edit state
    formHeading.textContent = 'Edit Contact';
    formIcon.textContent = '✏️';
    submitBtnText.textContent = 'Update Contact';
    cancelBtn.style.display = 'inline-flex';

    // Scroll smoothly to form
    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    nameInput.focus();
}

function resetFormToAddMode() {
    contactForm.reset();
    contactIdInput.value = '';

    clearFieldError(nameInput, nameError);
    clearFieldError(emailInput, emailError);
    clearFieldError(phoneInput, phoneError);

    formHeading.textContent = 'Add New Contact';
    formIcon.textContent = '➕';
    submitBtnText.textContent = 'Add Contact';
    cancelBtn.style.display = 'none';
}

// ==========================================================
// 7. DELETE CONTACT (DELETE /api/contacts/:id)
// ==========================================================
function openDeleteModal(id, name) {
    contactToDeleteId = id;
    deleteContactName.textContent = `"${name}"`;
    deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
    contactToDeleteId = null;
    deleteModal.style.display = 'none';
}

async function confirmDeleteContact() {
    if (!contactToDeleteId) return;

    modalConfirmBtn.disabled = true;
    modalConfirmBtn.textContent = 'Deleting...';

    try {
        const response = await fetch(`/api/contacts/${contactToDeleteId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast(result.message || 'Contact deleted successfully.', 'success');
            closeDeleteModal();

            // If the deleted contact was currently being edited, reset form
            if (contactIdInput.value === String(contactToDeleteId)) {
                resetFormToAddMode();
            }

            await fetchContacts();
        } else {
            showToast(result.message || 'Failed to delete contact.', 'error');
        }
    } catch (error) {
        console.error('Delete Error:', error);
        showToast('Error deleting contact from server.', 'error');
    } finally {
        modalConfirmBtn.disabled = false;
        modalConfirmBtn.textContent = 'Yes, Delete';
    }
}

// ==========================================================
// 8. LIVE SEARCH AND FILTERING
// ==========================================================
function handleSearchInput() {
    const query = searchInput.value.trim().toLowerCase();

    // Toggle clear button
    clearSearchBtn.style.display = query ? 'block' : 'none';

    if (!query) {
        renderContacts(allContacts);
        return;
    }

    const filtered = allContacts.filter(contact => {
        const nameMatch = (contact.name || '').toLowerCase().includes(query);
        const emailMatch = (contact.email || '').toLowerCase().includes(query);
        const phoneMatch = (contact.phone || '').toLowerCase().includes(query);
        const addressMatch = (contact.address || '').toLowerCase().includes(query);
        return nameMatch || emailMatch || phoneMatch || addressMatch;
    });

    renderContacts(filtered);
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    renderContacts(allContacts);
}

// ==========================================================
// 9. UI HELPERS (LOADING, TOASTS, ESCAPING)
// ==========================================================
function showLoading(isLoading) {
    if (isLoading) {
        loadingState.style.display = 'block';
        contactsTable.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <div class="toast-body">
            <span>${icon}</span>
            <span>${escapeHtml(message)}</span>
        </div>
        <button class="toast-close" title="Dismiss">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    toastContainer.appendChild(toast);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3500);
}

// Escape HTML to prevent XSS attacks
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Escape quotes for inline onclick parameter safely
function escapeQuote(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
