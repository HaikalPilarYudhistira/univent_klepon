// public/js/app.js
// Helper bersama: panggilan API, penyimpanan token, dan proteksi halaman.

const UNIVENTS = (() => {
  function getToken() {
    return localStorage.getItem('univents_token');
  }

  function getUser() {
    const raw = localStorage.getItem('univents_user');
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(token, user) {
    localStorage.setItem('univents_token', token);
    localStorage.setItem('univents_user', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('univents_token');
    localStorage.removeItem('univents_user');
  }

  async function api(path, { method = 'GET', body = null } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Terjadi kesalahan. Coba lagi.');
    }
    return data;
  }

  // Panggil di halaman yang butuh login. Redirect kalau belum login
  // atau role-nya tidak sesuai.
  function guard(requiredRole = null) {
    const user = getUser();
    if (!user || !getToken()) {
      window.location.href = '/mahasiswa/login.html';
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      window.location.href = user.role === 'admin'
        ? '/admin/dashboard.html'
        : '/mahasiswa/events.html';
      return null;
    }
    return user;
  }

  function logout() {
    clearSession();
    window.location.href = '/mahasiswa/login.html';
  }

  function showAlert(el, message, type = 'error') {
    el.textContent = message;
    el.className = `alert show alert-${type}`;
  }

  function formatTanggal(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatJam(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  return {
    getToken, getUser, setSession, clearSession,
    api, guard, logout, showAlert, formatTanggal, formatJam,
  };
})();
