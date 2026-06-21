// public/js/admin-sidebar.js
// Render sidebar admin secara konsisten. Dipanggil di setiap halaman admin
// dengan menyisipkan <div id="sidebarMount"></div> lalu memanggil renderAdminSidebar('key-aktif').

function renderAdminSidebar(activeKey) {
  const mount = document.getElementById('sidebarMount');
  if (!mount) return;

  const links = [
    { key: 'dashboard', href: '/admin/dashboard.html', label: 'Dashboard', icon: '◆' },
    { key: 'event-list', href: '/admin/event-list.html', label: 'Semua acara', icon: '☰' },
    { key: 'event-add', href: '/admin/event-add.html', label: 'Buat acara', icon: '+' },
    { key: 'peserta', href: '/admin/peserta.html', label: 'Peserta', icon: '◎' },
    { key: 'users', href: '/admin/users.html', label: 'Pengguna', icon: '◫' },
  ];

  mount.innerHTML = `
    <aside class="sidebar">
      <div>
        <div class="brand">UNI<span>VENTS</span></div>
        <span class="brand-sub">PANEL ADMIN</span>
      </div>
      <div class="nav-group">
        <span class="nav-label">Kelola</span>
        ${links.map((l) => `
          <a href="${l.href}" class="nav-link ${l.key === activeKey ? 'active' : ''}">
            <span>${l.icon}</span> ${l.label}
          </a>
        `).join('')}
      </div>
      <div class="sidebar-footer">
        <button class="logout-btn" id="adminLogoutBtn">Keluar</button>
      </div>
    </aside>
  `;

  document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    UNIVENTS.logout();
  });
}
