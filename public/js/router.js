// ── Router ─────────────────────────────────────────────────
const Router = {
  current: null,

  go(page, params = {}) {
    // hide all top-level pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // show target page
    const el = document.getElementById(`page-${page}`);
    if (el) {
      el.classList.add('active');
      this.current = page;
      // close mobile sidebar
      document.querySelector('.sidebar')?.classList.remove('open');
      // call page init if registered
      if (PageInit[page]) PageInit[page](params);
    } else {
      console.warn('Page not found:', page);
    }
  },

  init() {
    if (Auth.isLoggedIn()) {
      const user = Auth.getUser();
      if (user) {
        this.toDashboard(user.role);
      } else {
        API.get('/api/auth/me').then(res => {
          if (res.user) {
            Auth.setUser(res.user);
            this.toDashboard(res.user.role);
          } else {
            this.go('login');
          }
        }).catch(() => this.go('login'));
      }
    } else {
      this.go('login');
    }
  },

  toDashboard(role) {
    const map = {
      super_admin:      'super-admin',
      company_admin:    'company-admin',
      university_admin: 'university-admin',
      recruiter:        'recruiter',
      student:          'student',
    };
    this.go(map[role] || 'login');
  }
};

// ── Page Init Hooks ────────────────────────────────────────
const PageInit = {};

// ── Logout ─────────────────────────────────────────────────
function logout() {
  Auth.clear();
  Router.go('login');
  Toast.info('Logged out');
}

// ── Dashboard nav helper ───────────────────────────────────
function initSidebarNav(role) {
  const user = Auth.getUser();
  if (!user) return;

  // Set avatar / name
  document.querySelectorAll('.sidebar-user-name').forEach(el => el.textContent = user.name);
  document.querySelectorAll('.sidebar-user-role').forEach(el => el.textContent = user.role?.replace(/_/g, ' '));
  document.querySelectorAll('.avatar').forEach(el => el.textContent = initials(user.name));

  // Wire nav items
  document.querySelectorAll(`#page-${role} .nav-item[data-view]`).forEach(item => {
    item.addEventListener('click', () => {
      // active state
      document.querySelectorAll(`#page-${role} .nav-item`).forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      // show view
      const viewId = item.dataset.view;
      document.querySelectorAll(`#page-${role} .view`).forEach(v => v.classList.remove('active'));
      const view = document.getElementById(viewId);
      if (view) {
        view.classList.add('active');
        const topbarTitle = document.querySelector(`#page-${role} .topbar-title`);
        if (topbarTitle) topbarTitle.textContent = item.querySelector('.nav-label')?.textContent || '';
        // Call view init if registered
        const viewInit = ViewInit[viewId];
        if (viewInit) viewInit();
      }
    });
  });
}

// ── View Init Hooks ────────────────────────────────────────
const ViewInit = {};

// ── Activate first nav item ────────────────────────────────
function activateFirstNav(role) {
  const first = document.querySelector(`#page-${role} .nav-item[data-view]`);
  if (first) first.click();
}

// ── Generic confirm modal ──────────────────────────────────
function confirmModal(title, message, onConfirm) {
  const overlay = document.getElementById('confirm-modal');
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  overlay.classList.add('open');

  const btn = document.getElementById('confirm-ok');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => {
    overlay.classList.remove('open');
    onConfirm();
  });
  document.getElementById('confirm-cancel').onclick = () => overlay.classList.remove('open');
}