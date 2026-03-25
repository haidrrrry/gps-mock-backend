// auth.js
const API_URL = '/api';

// Theme toggling
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function showToast(msg, type='success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
    return c;
}

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });
        
        const data = await res.json();
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                if (window.location.pathname !== '/login.html') {
                    localStorage.removeItem('adminToken');
                    window.location.href = '/login.html';
                }
            }
            throw new Error(data.message || data.error || 'API Error');
        }
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token && window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
    if (token && window.location.pathname === '/login.html') {
        window.location.href = '/dashboard.html';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
