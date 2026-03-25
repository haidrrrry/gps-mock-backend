let userId = null;
let userData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    userId = params.get('id');
    if (!userId) {
        window.location.href = 'users.html';
        return;
    }
    
    await loadData();
    
    document.getElementById('btn-ban').addEventListener('click', toggleBan);
    document.getElementById('btn-limit').addEventListener('click', updateLimit);
    document.getElementById('btn-add-sub').addEventListener('click', updateSubscription);
    document.getElementById('btn-password').addEventListener('click', updatePassword);
});

async function loadData() {
    try {
        const res = await apiFetch(`/admin-user-detail?id=${userId}`);
        userData = res.user;
        const sessions = res.sessions;
        
        document.getElementById('user-email').textContent = userData.email;
        
        const badge = document.getElementById('user-badge');
        const nowMs = Date.now();
        if (userData.isBanned) {
            badge.className = 'badge danger';
            badge.textContent = 'Banned';
            document.getElementById('btn-ban').textContent = 'Unban User';
            document.getElementById('btn-ban').className = 'btn btn-success';
        } else if (userData.subscriptionExpiry && new Date(userData.subscriptionExpiry).getTime() < nowMs) {
            badge.className = 'badge warning';
            badge.textContent = 'Expired';
            document.getElementById('btn-ban').textContent = 'Ban User';
            document.getElementById('btn-ban').className = 'btn btn-danger';
        } else {
            badge.className = 'badge success';
            badge.textContent = 'Active';
            document.getElementById('btn-ban').textContent = 'Ban User';
            document.getElementById('btn-ban').className = 'btn btn-danger';
        }
        
        document.getElementById('inp-limit').value = userData.deviceLimit;
        
        const expStr = userData.subscriptionExpiry ? new Date(userData.subscriptionExpiry).toLocaleString() : 'Never';
        document.getElementById('lbl-expiry').textContent = expStr;
        
        const tbody = document.getElementById('sessions-tbody');
        tbody.innerHTML = '';
        if (sessions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No sessions found.</td></tr>';
        } else {
            sessions.forEach(s => {
                const tr = document.createElement('tr');
                const stat = s.isActive ? `<span class="badge success">Active</span>` : `<span class="badge" style="background:#cbd5e1;color:#475569">Killed</span>`;
                const btn = s.isActive ? `<button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="killSession('${s._id}')">Kill</button>` : '-';
                tr.innerHTML = `
                    <td>${s.deviceName || s.deviceId}</td>
                    <td>${new Date(s.loggedInAt).toLocaleString()}</td>
                    <td>${stat}</td>
                    <td>${btn}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {}
}

async function toggleBan() {
    try {
        await apiFetch(`/admin-user-ban?id=${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ ban: !userData.isBanned })
        });
        showToast('Ban status updated');
        loadData();
    } catch (err) {}
}

async function updateLimit() {
    const limit = parseInt(document.getElementById('inp-limit').value);
    try {
        await apiFetch(`/admin-user-devicelimit?id=${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ limit })
        });
        showToast('Login chances updated');
        loadData();
    } catch (err) {}
}

async function updateSubscription() {
    const days = parseInt(document.getElementById('inp-sub-days').value);
    if (!days) return;
    try {
        await apiFetch(`/admin-user-subscription?id=${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ days })
        });
        showToast('Subscription updated');
        document.getElementById('inp-sub-days').value = '';
        loadData();
    } catch (err) {}
}

async function updatePassword() {
    const password = document.getElementById('inp-password').value;
    if (!password) return;
    try {
        await apiFetch(`/admin-user-password?id=${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ password })
        });
        showToast('Password updated');
        document.getElementById('inp-password').value = '';
    } catch (err) {}
}

window.killSession = async function(sessionId) {
    if (!confirm('Kill this session?')) return;
    try {
        await apiFetch(`/admin-user-sessions?userId=${userId}&sessionId=${sessionId}`, { method: 'DELETE' });
        showToast('Session killed');
        loadData();
    } catch (err) {}
}

window.deleteUser = async function() {
    if (!confirm('Are you absolutely sure you want to delete this user completely?')) return;
    try {
        await apiFetch(`/admin-user-detail?id=${userId}`, { method: 'DELETE' });
        showToast('User deleted', 'success');
        setTimeout(() => window.location.href = 'users.html', 1000);
    } catch (err) {}
}
