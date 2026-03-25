let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    
    document.getElementById('search-input').addEventListener('input', renderUsers);
    document.getElementById('filter-select').addEventListener('change', renderUsers);
    
    document.getElementById('create-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('c-email').value;
        const password = document.getElementById('c-password').value;
        const subscriptionDays = parseInt(document.getElementById('c-days').value);
        const deviceLimit = parseInt(document.getElementById('c-limit').value);
        
        try {
            await apiFetch('/admin-users', {
                method: 'POST',
                body: JSON.stringify({ email, password, subscriptionDays, deviceLimit })
            });
            showToast('User created successfully');
            hideCreateModal();
            loadUsers();
        } catch (err) {
            // Error managed by apiFetch
        }
    });
});

async function loadUsers() {
    try {
        allUsers = await apiFetch('/admin-users');
        renderUsers();
    } catch (err) {}
}

function renderUsers() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const filter = document.getElementById('filter-select').value;
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    const nowMs = Date.now();
    
    const filtered = allUsers.filter(u => {
        if (search && !u.email.toLowerCase().includes(search)) return false;
        
        const isExpired = u.subscriptionExpiry && new Date(u.subscriptionExpiry).getTime() < nowMs;
        
        if (filter === 'active' && (u.isBanned || isExpired)) return false;
        if (filter === 'banned' && !u.isBanned) return false;
        if (filter === 'expired' && !isExpired) return false;
        return true;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
        return;
    }
    
    filtered.forEach(u => {
        let badge = `<span class="badge success">Active</span>`;
        if (u.isBanned) badge = `<span class="badge danger">Banned</span>`;
        else if (u.subscriptionExpiry && new Date(u.subscriptionExpiry).getTime() < nowMs) {
            badge = `<span class="badge warning">Expired</span>`;
        }
        
        const expStr = u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString() : 'Never';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.email}</td>
            <td>${badge}</td>
            <td>${expStr}</td>
            <td>${u.deviceLimit}</td>
            <td>
                <a href="user-detail.html?id=${u._id}" class="btn btn-outline" style="padding: 6px 10px; font-size:0.8rem;">View</a>
                <button class="btn btn-danger" style="padding: 6px 10px; font-size:0.8rem; margin-left:5px;" onclick="window.deleteUser('${u._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.showCreateModal = function() {
    document.getElementById('create-modal').classList.remove('hidden');
}
window.hideCreateModal = function() {
    document.getElementById('create-modal').classList.add('hidden');
    document.getElementById('create-form').reset();
}
window.deleteUser = async function(id) {
    if (!confirm('Are you sure you want to delete this user completely?')) return;
    try {
        await apiFetch(`/admin-user-detail?id=${id}`, { method: 'DELETE' });
        showToast('User deleted', 'success');
        loadUsers();
    } catch (err) {}
}
