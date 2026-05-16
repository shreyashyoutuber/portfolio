/**
 * Portfolio Website Logic
 * Handles Theme Toggle, Mobile Navigation, and Accessible Form Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── THEME TOGGLE LOGIC ───
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  
  body.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Accessible notification for theme change (optional)
      const announcement = `Theme changed to ${newTheme} mode`;
      announceToScreenReader(announcement);
    });
  }

  // ─── MOBILE MENU LOGIC ───
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      primaryNav.classList.toggle('active');
      
      // Prevent scrolling when menu is open
      document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
    });

    // Close menu on link click
    primaryNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
  }

  // ─── ACCESSIBLE FORM VALIDATION ───
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let firstError = null;
      const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
      
      inputs.forEach(input => {
        const errorSpan = document.getElementById(`${input.id.replace('user_', '')}-error`);
        let isValid = true;

        if (input.type === 'email') {
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        } else if (input.tagName === 'TEXTAREA') {
          isValid = input.value.length >= 20;
        } else {
          isValid = input.value.trim().length > 0;
        }

        if (!isValid) {
          input.setAttribute('aria-invalid', 'true');
          if (errorSpan) errorSpan.style.display = 'block';
          if (!firstError) firstError = input;
        } else {
          input.setAttribute('aria-invalid', 'false');
          if (errorSpan) errorSpan.style.display = 'none';
        }
      });

      if (firstError) {
        firstError.focus();
      } else {
        // Success state
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.textContent = 'Message Sent! ✅';
        submitBtn.disabled = true;
        contactForm.reset();
        announceToScreenReader('Message sent successfully. I will get back to you soon.');
      }
    });
  }

  // ─── DYNAMIC YEAR ───
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── UTILS ───
  function announceToScreenReader(message) {
    let ariaAnnouncer = document.getElementById('aria-announcer');
    if (!ariaAnnouncer) {
      ariaAnnouncer = document.createElement('div');
      ariaAnnouncer.id = 'aria-announcer';
      ariaAnnouncer.setAttribute('aria-live', 'polite');
      ariaAnnouncer.style.position = 'absolute';
      ariaAnnouncer.style.width = '1px';
      ariaAnnouncer.style.height = '1px';
      ariaAnnouncer.style.overflow = 'hidden';
      document.body.appendChild(ariaAnnouncer);
    }
    ariaAnnouncer.textContent = message;
  }
});
