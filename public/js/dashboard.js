document.addEventListener('DOMContentLoaded', async () => {
    try {
        const users = await apiFetch('/admin-users');
        
        document.getElementById('s-total').textContent = users.length;
        
        const bannedCount = users.filter(u => u.isBanned).length;
        document.getElementById('s-banned').textContent = bannedCount;
        
        const activeCount = users.filter(u => u.isActive && !u.isBanned).length;
        document.getElementById('s-active').textContent = activeCount;
        
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const nowMs = Date.now();
        const expiringCount = users.filter(u => {
            if (!u.subscriptionExpiry) return false;
            const exp = new Date(u.subscriptionExpiry).getTime();
            return exp > nowMs && (exp - nowMs) < threeDaysMs;
        }).length;
        
        document.getElementById('s-expiring').textContent = expiringCount;
        
        // Render recent
        const tbody = document.getElementById('recent-users-tbody');
        tbody.innerHTML = '';
        
        const recent = users.slice(0, 5);
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No users found.</td></tr>';
            return;
        }
        
        recent.forEach(user => {
            const tr = document.createElement('tr');
            
            let badge = `<span class="badge success">Active</span>`;
            if (user.isBanned) badge = `<span class="badge danger">Banned</span>`;
            else if (user.subscriptionExpiry && new Date(user.subscriptionExpiry).getTime() < nowMs) {
                badge = `<span class="badge warning">Expired</span>`;
            }
            
            tr.innerHTML = `
                <td>${user.email}</td>
                <td>${badge}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (err) {
        // error handled by apiFetch
        console.error(err);
    }
});
