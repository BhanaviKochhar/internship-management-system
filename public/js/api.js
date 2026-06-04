// ── API Configuration ──────────────────────────────────────
const BASE_URL = 'http://localhost:5000';

// ── Token helpers ──────────────────────────────────────────
const Auth = {
  getToken()       { return localStorage.getItem('ims_token'); },
  setToken(t)      { localStorage.setItem('ims_token', t); },
  getUser()        { try { return JSON.parse(localStorage.getItem('ims_user')); } catch { return null; } },
  setUser(u)       { localStorage.setItem('ims_user', JSON.stringify(u)); },
  clear()          { localStorage.removeItem('ims_token'); localStorage.removeItem('ims_user'); },
  isLoggedIn()     { return !!this.getToken(); },
  role()           { const u = this.getUser(); return u ? u.role : null; }
};

// ── Core fetch wrapper ─────────────────────────────────────
async function api(method, path, body = null, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, config);
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    Auth.clear();
    Router.go('login');
    throw new Error('Unauthorized');
  }
  return data;
}

const API = {
  get:    (path)         => api('GET',    path),
  post:   (path, body)   => api('POST',   path, body),
  put:    (path, body)   => api('PUT',    path, body),
  patch:  (path, body)   => api('PATCH',  path, body),
  delete: (path)         => api('DELETE', path),
};

// ── Toast notification system ──────────────────────────────
const Toast = {
  show(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}">${icon}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success(m) { this.show(m, 'success'); },
  error(m)   { this.show(m, 'error'); },
  info(m)    { this.show(m, 'info'); },
};

// ── Alert helpers (inside forms) ───────────────────────────
function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const icon = type === 'error' ? '⚠' : type === 'success' ? '✓' : 'ℹ';
  el.innerHTML = `<div class="alert alert-${type}"><span class="alert-icon">${icon}</span><span>${message}</span></div>`;
}
function clearAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

// ── Utility helpers ────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function statusBadge(status) {
  const map = {
    open:         'badge-green',
    closed:       'badge-red',
    draft:        'badge-gray',
    applied:      'badge-blue',
    under_review: 'badge-amber',
    shortlisted:  'badge-green',
    rejected:     'badge-red',
    offered:      'badge-purple',
    active:       'badge-green',
    inactive:     'badge-red',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status?.replace(/_/g,' ')}</span>`;
}
function roleBadge(role) {
  const map = {
    super_admin:      'badge-amber',
    company_admin:    'badge-blue',
    university_admin: 'badge-purple',
    recruiter:        'badge-green',
    student:          'badge-gray',
  };
  return `<span class="badge ${map[role] || 'badge-gray'}">${role?.replace(/_/g,' ')}</span>`;
}
function loading(msg = 'Loading…') {
  return `<div class="loading-overlay"><span class="spinner"></span> ${msg}</div>`;
}
function emptyState(icon, title, sub = '') {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>`;
}

// Close modal when clicking overlay
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Mobile sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.menu-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('open');
    });
  });
});