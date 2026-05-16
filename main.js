/**
 * main.js - Portfolio Website JavaScript
 * Handles: nav toggle, year, form validation, project filtering, scroll animations
 */

// ─── Service Worker Registration ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW failed', err));
  });
}

// ─── Theme Toggle ────────────────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// ─── Dynamic Year ───────────────────────────────────────────────────────────
document.querySelectorAll('#year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// --- Mobile Navigation Toggle ------------------------------------------------
const navToggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('primary-nav');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is clicked (mobile UX)
  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('open')) {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

// --- Scroll-based header shadow -----------------------------------------------
const header = document.querySelector('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 20
      ? '0 2px 20px rgba(0,0,0,.4)'
      : 'none';
  }, { passive: true });
}

// --- Project Filter Tabs ------------------------------------------------------
const filterTabs = document.querySelectorAll('.filter-tab');
const projectCards = document.querySelectorAll('.project-card');

if (filterTabs.length && projectCards.length) {
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update ARIA selected states
      filterTabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('btn-primary');
        t.classList.add('btn-outline');
      });
      tab.setAttribute('aria-selected', 'true');
      tab.classList.remove('btn-outline');
      tab.classList.add('btn-primary');

      // Filter cards
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
        card.setAttribute('aria-hidden', String(!show));
      });
    });
  });
}

// --- Accessible Form Validation -----------------------------------------------
const form = document.getElementById('contact-form');
if (form) {
  const fields = {
    name: { el: document.getElementById('name'), err: document.getElementById('name-error') },
    email: { el: document.getElementById('email'), err: document.getElementById('email-error') },
    subject: { el: document.getElementById('subject'), err: document.getElementById('subject-error') },
    message: { el: document.getElementById('message'), err: document.getElementById('message-error') },
  };

  function validateField(key) {
    const { el, err } = fields[key];
    if (!el) return true;
    let valid = true;

    if (key === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
    } else if (key === 'message') {
      valid = el.value.trim().length >= 20;
    } else {
      valid = el.value.trim().length > 0;
    }

    el.setAttribute('aria-invalid', String(!valid));
    if (err) err.style.display = valid ? 'none' : 'block';
    return valid;
  }

  // Validate on blur for real-time feedback
  Object.keys(fields).forEach(key => {
    const el = fields[key].el;
    if (el) {
      el.addEventListener('blur', () => validateField(key));
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') validateField(key);
      });
    }
  });

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const allValid = Object.keys(fields).map(validateField).every(Boolean);

    if (!allValid) {
      // Focus first invalid field
      const firstInvalid = Object.values(fields).find(f => f.el && f.el.getAttribute('aria-invalid') === 'true');
      if (firstInvalid) firstInvalid.el.focus();
      return;
    }

    // Simulate submission
    const btn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    const statusEl = document.getElementById('submit-status');

    btn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) { btnLoading.style.display = 'inline'; btnLoading.removeAttribute('aria-hidden'); }
    if (statusEl) statusEl.textContent = 'Sending your message...';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) { btnLoading.style.display = 'none'; btnLoading.setAttribute('aria-hidden', 'true'); }
      if (statusEl) statusEl.textContent = 'Message sent successfully!';

      const successMsg = document.getElementById('success-msg');
      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.focus();
        setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
      }

      // Reset aria-invalid
      Object.values(fields).forEach(({ el }) => {
        if (el) el.setAttribute('aria-invalid', 'false');
      });
    }, 1800);
  });
}

// ─── Back to Top Button ──────────────────────────────────────────────────────
const backToTop = document.createElement('button');
backToTop.innerHTML = '↑';
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', 'Back to top');
document.body.appendChild(backToTop);

// Style for back-to-top (could be in CSS but adding here for speed/completeness)
const bttStyle = document.createElement('style');
bttStyle.textContent = `
  .back-to-top {
    position: fixed; bottom: 2rem; right: 2rem;
    width: 44px; height: 44px; background: var(--accent); color: #000;
    border: none; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-weight: bold; opacity: 0; visibility: hidden; transition: all .3s;
    z-index: 1000; box-shadow: var(--shadow);
  }
  .back-to-top.visible { opacity: 1; visibility: visible; }
  .back-to-top:hover { transform: translateY(-5px); }
`;
document.head.appendChild(bttStyle);

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Scroll Animation (Intersection Observer) ─────────────────────────────────
if ('IntersectionObserver' in window) {
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity .5s ease, transform .5s ease; }
    .reveal.visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.skill-card, .project-card, .stat-item, .timeline-item').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}
