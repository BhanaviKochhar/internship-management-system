// ── Login Page ─────────────────────────────────────────────
PageInit['login'] = function () {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.onsubmit = async e => {
    e.preventDefault();
    clearAlert('login-alert');
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in…';

    const email    = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showAlert('login-alert', 'Please enter email and password.');
      btn.disabled = false; btn.textContent = 'Sign In';
      return;
    }

    try {
      const res = await API.post('/api/auth/login', { email, password });
      if (res.success && res.token) {
        Auth.setToken(res.token);
        Auth.setUser(res.user);
        Toast.success(`Welcome back, ${res.user.name}!`);
        Router.toDashboard(res.user.role);
      } else {
        showAlert('login-alert', res.message || 'Login failed. Check credentials.');
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    } catch {
      showAlert('login-alert', 'Network error. Is the backend running?');
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  };
};

// ── Register Page ──────────────────────────────────────────
PageInit['register'] = function () {
  const form = document.getElementById('register-form');
  if (!form) return;
  form.onsubmit = async e => {
    e.preventDefault();
    clearAlert('register-alert');
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account…';

    const name   = form.reg_name.value.trim();
    const email  = form.reg_email.value.trim();
    const password = form.reg_password.value;
    const universityId = form.reg_university.value.trim();

    if (!name || !email || !password || !universityId) {
      showAlert('register-alert', 'Name, email, password and university ID are required.');
      btn.disabled = false; btn.textContent = 'Create Account';
      return;
    }
    if (password.length < 6) {
      showAlert('register-alert', 'Password must be at least 6 characters.');
      btn.disabled = false; btn.textContent = 'Create Account';
      return;
    }

    const body = {
      name, email, password, universityId,
      rollNumber:    form.reg_roll.value.trim() || undefined,
      department:    form.reg_dept.value.trim() || undefined,
      graduationYear: form.reg_year.value ? parseInt(form.reg_year.value) : undefined,
    };

    try {
      const res = await API.post('/api/auth/register', body);
      if (res.token) {
        Auth.setToken(res.token);
        Auth.setUser(res.user);
        Toast.success('Account created! Welcome.');
        Router.toDashboard(res.user.role);
      } else {
        showAlert('register-alert', res.message || 'Registration failed.');
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    } catch {
      showAlert('register-alert', 'Network error.');
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  };
};