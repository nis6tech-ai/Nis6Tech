/**
 * Certificate System Logic (Firebase Integrated)
 * Handles Firebase Firestore and Auth
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDCzpuyopoYoh4Qu7a0vyT_mlnRexQ3vlg",
    authDomain: "nis6techweb.firebaseapp.com",
    projectId: "nis6techweb",
    storageBucket: "nis6techweb.firebasestorage.app",
    messagingSenderId: "800006145695",
    appId: "1:800006145695:web:231e4fef2b36507550c4aa",
    measurementId: "G-D8Q2K6KD3H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const COL_NAME = 'certificates';

const ADMIN_SESSION_KEY = 'nis6tech_admin_session'; // Keeping session key for quick sync checks in UI but relying on Firebase Auth

// --- Data Layer (Firestore) ---
const CertificateDB = {
    async getAll() {
        try {
            const querySnapshot = await getDocs(collection(db, COL_NAME));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching certificates:", error);
            alert("Error connecting to database. Check console details.");
            return [];
        }
    },

    async getById(id) {
        try {
            const docRef = doc(db, COL_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching certificate:", error);
            return null;
        }
    },

    async add(cert) {
        // cert.id is used as document ID
        try {
            // Check existence first
            const existing = await this.getById(cert.id);
            if (existing) {
                throw new Error('Certificate ID already exists');
            }
            // Use setDoc to define custom ID as document ID
            await setDoc(doc(db, COL_NAME, cert.id), {
                name: cert.name,
                course: cert.course,
                date: cert.date,
                status: cert.status
            });
        } catch (error) {
            console.error("Error adding certificate:", error);
            throw error;
        }
    },

    async update(id, data) {
        try {
            const docRef = doc(db, COL_NAME, id);
            // We only update fields provided in data
            // Exclude ID from data payload if it exists
            const { id: _, ...updateData } = data;
            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error("Error updating certificate:", error);
            throw error;
        }
    },

    async delete(id) {
        // Soft delete: Revoke
        await this.update(id, { status: 'Revoked' });
    }
};

// --- Auth Layer ---
const AuthSystem = {
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            sessionStorage.setItem(ADMIN_SESSION_KEY, 'true'); // Helper
            return true;
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
            alert("Login Failed: " + error.message);
            return false;
        }
    },

    async logout() {
        try {
            await signOut(auth);
            sessionStorage.removeItem(ADMIN_SESSION_KEY);

            // Detect if we are in admin directory or root
            if (window.location.pathname.includes('/admin/')) {
                window.location.href = 'login.html';
            } else {
                window.location.href = 'admin/login.html';
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },

    initAuthListener(callback) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
                if (callback) callback(true);
            } else {
                sessionStorage.removeItem(ADMIN_SESSION_KEY);
                if (callback) callback(false);
            }
        });
    }
};


// --- UI Logic ---

// 1. Verification Page Logic
async function initVerificationPage() {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');
    const input = document.getElementById('certIdInput');

    if (urlId) {
        input.value = urlId;
        await verifyCertificate(urlId);
    }

    const verifyBtn = document.getElementById('verifyBtn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const id = input.value.trim();
            if (id) await verifyCertificate(id);
        });
    }
}

async function verifyCertificate(id) {
    const resultContainer = document.getElementById('verificationResult');
    // Show loading
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = '<div style="text-align:center; padding: 2rem;">Searching...</div>';

    const cert = await CertificateDB.getById(id);

    if (!cert) {
        resultContainer.innerHTML = `
            <div class="cert-card cert-bad animation-fade-in">
                <span class="cert-status status-invalid">Invalid / Not Found</span>
                <h3>No certificate found with ID: ${id}</h3>
                <p>Please check the ID and try again.</p>
            </div>
        `;
    } else {
        const statusClass = cert.status === 'Verified' ? 'status-verified' : 'status-revoked';

        resultContainer.innerHTML = `
            <div class="cert-card animation-fade-in">
                <span class="cert-status ${statusClass}">${cert.status}</span>
                <div class="cert-detail-row">
                    <span class="cert-label">Certificate ID</span>
                    <span class="cert-value">${cert.id}</span>
                </div>
                <div class="cert-detail-row">
                    <span class="cert-label">Candidate Name</span>
                    <span class="cert-value">${cert.name}</span>
                </div>
                <div class="cert-detail-row">
                    <span class="cert-label">Course Name</span>
                    <span class="cert-value">${cert.course}</span>
                </div>
                <div class="cert-detail-row">
                    <span class="cert-label">Completion Date</span>
                    <span class="cert-value">${cert.date}</span>
                </div>
            </div>
        `;
    }
}

// 2. Admin Logic
function initAdminDashboard() {
    // Check Auth State
    AuthSystem.initAuthListener((isAuthenticated) => {
        if (!isAuthenticated) {
            window.location.href = 'login.html';
        } else {
            renderCertificateTable();
        }
    });

    // Add Form Submit
    const form = document.getElementById('addCertForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Saving...';
            submitBtn.disabled = true;

            const formData = {
                id: document.getElementById('certId').value,
                name: document.getElementById('candidateName').value,
                course: document.getElementById('courseName').value,
                date: document.getElementById('completionDate').value,
                status: document.getElementById('certStatus').value
            };

            try {
                // Check if editing or adding
                if (document.getElementById('editMode').value === 'true') {
                    await CertificateDB.update(formData.id, formData);
                    alert('Certificate Updated Successfully');
                } else {
                    await CertificateDB.add(formData);
                    alert('Certificate Added Successfully');
                }
                window.closeModal();
                renderCertificateTable(); // Refresh table
            } catch (err) {
                alert(err.message);
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthSystem.logout();
        });
    }
}

async function renderCertificateTable() {
    const tbody = document.getElementById('certTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading data...</td></tr>';

    const certs = await CertificateDB.getAll();

    if (certs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No certificates found.</td></tr>';
        return;
    }

    tbody.innerHTML = certs.map(cert => `
        <tr>
            <td>${cert.id}</td>
            <td>${cert.name}</td>
            <td>${cert.course}</td>
            <td>${cert.date}</td>
            <td><span class="badge ${cert.status.toLowerCase()}">${cert.status}</span></td>
            <td>
                <button class="action-btn" onclick="window.openEditModal('${cert.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="window.revokeCertificate('${cert.id}')"><i class="fa-solid fa-ban"></i></button>
            </td>
        </tr>
    `).join('');
}

// Global functions for inline onclick handlers
// We attach them to window because modules are not global scope
window.revokeCertificate = async function (id) {
    if (confirm('Are you sure you want to revoke this certificate?')) {
        try {
            await CertificateDB.delete(id);
            renderCertificateTable();
        } catch (e) {
            alert('Error updating status: ' + e.message);
        }
    }
};

window.openEditModal = async function (id) {
    // We could fetch from DB or local cache. Fetching from DB ensures freshness.
    const cert = await CertificateDB.getById(id);
    if (!cert) return;

    document.getElementById('modalTitle').innerText = 'Edit Certificate';
    document.getElementById('certId').value = cert.id;
    document.getElementById('certId').readOnly = true; // Cannot change ID
    document.getElementById('candidateName').value = cert.name;
    document.getElementById('courseName').value = cert.course;
    document.getElementById('completionDate').value = cert.date;
    document.getElementById('certStatus').value = cert.status;
    document.getElementById('editMode').value = 'true';

    document.getElementById('certModal').style.display = 'flex';
};

window.openAddModal = function () {
    document.getElementById('modalTitle').innerText = 'Issue New Certificate';
    document.getElementById('addCertForm').reset();
    document.getElementById('certId').readOnly = false;
    document.getElementById('editMode').value = 'false';
    document.getElementById('certModal').style.display = 'flex';
};

window.closeModal = function () {
    document.getElementById('certModal').style.display = 'none';
};

// Admin Login Logic
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');

            btn.innerText = 'Logging in...';
            btn.disabled = true;

            const success = await AuthSystem.login(email, pass);
            if (success) {
                // Determine redirect path
                if (window.location.pathname.includes('/admin/')) {
                    window.location.href = 'certificates.html';
                } else {
                    window.location.href = 'admin/certificates.html';
                }
            } else {
                alert('Invalid Credentials or Login Error');
                btn.innerText = 'Login';
                btn.disabled = false;
            }
        });
    }
}

// Expose initialization to be called from HTML
window.initVerificationPage = initVerificationPage;
window.initAdminDashboard = initAdminDashboard;
window.initLoginPage = initLoginPage;
