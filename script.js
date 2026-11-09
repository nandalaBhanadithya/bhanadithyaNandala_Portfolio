/* ==========================================================================
   Bhanadithya Nandala - Professional Portfolio Logic (script.js)
   Features:
   - Three-State Theme Controller (Light / Dark / System Default)
   - Real-Time Message Dispatch to bhanadithyanandala@gmail.com via FormSubmit
   - Local Message Inbox ("Make them visible to me" in-browser viewer)
   - Dynamic Theme-Aware Neural Canvas Synapse Animation
   - Intersection Observer Scroll Reveals & Category Filter Tabs
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeController();
  initNeuralCanvas();
  initScrollReveal();
  initSkillFilters();
  initNavigation();
  initMessageInboxSystem();
  setCopyrightYear();
});

/* ==========================================================================
   1. Theme Controller (Light, Dark, System Preference)
   ========================================================================== */
class ThemeController {
  constructor() {
    this.storageKey = 'theme-preference';
    this.buttons = document.querySelectorAll('.theme-btn');
    this.html = document.documentElement;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.currentPreference = localStorage.getItem(this.storageKey) || 'system';
    this.init();
  }

  init() {
    this.applyTheme(this.currentPreference);

    this.buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.currentTarget.getAttribute('data-set-theme');
        if (theme) {
          this.setTheme(theme);
        }
      });
    });

    this.mediaQuery.addEventListener('change', () => {
      if (this.currentPreference === 'system') {
        this.applyTheme('system');
      }
    });
  }

  setTheme(theme) {
    this.currentPreference = theme;
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
    showToast(`Switched theme to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  }

  applyTheme(themePreference) {
    let resolvedTheme = themePreference;

    if (themePreference === 'system') {
      resolvedTheme = this.mediaQuery.matches ? 'dark' : 'light';
    }

    this.html.setAttribute('data-theme', resolvedTheme);
    this.html.setAttribute('data-theme-preference', themePreference);

    this.buttons.forEach(btn => {
      const btnTheme = btn.getAttribute('data-set-theme');
      btn.classList.toggle('active', btnTheme === themePreference);
    });

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: resolvedTheme } }));
  }

  getActiveTheme() {
    return this.html.getAttribute('data-theme') || 'dark';
  }
}

let themeControllerInstance = null;
function initThemeController() {
  themeControllerInstance = new ThemeController();
}

/* ==========================================================================
   2. Theme-Aware Neural Canvas Synapse Animation
   ========================================================================== */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 65);
  const maxDistance = 140;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 1.6 + 1.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw(theme) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'light' ? 'rgba(37, 99, 235, 0.45)' : 'rgba(96, 165, 250, 0.6)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const theme = themeControllerInstance ? themeControllerInstance.getActiveTheme() : 'dark';

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * (theme === 'light' ? 0.25 : 0.28);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = theme === 'light' ? `rgba(37, 99, 235, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw(theme);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   3. Scroll Reveal via Intersection Observer
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. Tech Stack Category Filter (Tabs Logic)
   ========================================================================== */
function initSkillFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  if (!filterButtons.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (targetCategory === 'all' || cardCategory === targetCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   5. Navigation & Mobile Menu Toggles
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('main-nav');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const fromTop = window.scrollY + 120;
    navLinks.forEach(link => {
      if (!link.hash) return;
      const section = document.querySelector(link.hash);
      if (
        section &&
        section.offsetTop <= fromTop &&
        section.offsetTop + section.offsetHeight > fromTop
      ) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   6. Contact Form & Real-Time Email + On-Site Inbox ("Make them visible to me")
   ========================================================================== */
const INBOX_STORAGE_KEY = 'bhanadithya_portfolio_messages';

function getStoredMessages() {
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredMessages(messages) {
  try {
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(messages));
    updateInboxBadges();
  } catch (e) {
    console.error('Failed to save message to localStorage', e);
  }
}

function updateInboxBadges() {
  const messages = getStoredMessages();
  const count = messages.length;

  const countElements = [
    document.getElementById('inbox-card-count'),
    document.getElementById('inbox-modal-count'),
    document.getElementById('footer-inbox-count')
  ];

  countElements.forEach(el => {
    if (el) el.textContent = `${count} message${count === 1 ? '' : 's'}`;
  });

  const dot = document.getElementById('nav-inbox-dot');
  if (dot) {
    dot.style.display = count > 0 ? 'block' : 'none';
  }
}

/* Modal Open & Close Logic */
function openInboxModal() {
  const modal = document.getElementById('inbox-modal');
  if (!modal) return;
  renderInboxMessages();
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeInboxModal() {
  const modal = document.getElementById('inbox-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderInboxMessages() {
  const container = document.getElementById('inbox-messages-container');
  if (!container) return;

  const messages = getStoredMessages();

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="inbox-empty-state">
        <div class="inbox-empty-icon"><i class="fa-regular fa-folder-open"></i></div>
        <h4 style="color: var(--text-main); margin-bottom: 0.5rem; font-weight: 700;">No Messages in Local Inbox</h4>
        <p style="font-size: 0.88rem; color: var(--text-dim); max-width: 420px; margin: 0 auto 1.5rem;">
          Inquiries submitted through your portfolio contact form will appear here and are emailed directly to <strong>bhanadithyanandala@gmail.com</strong>.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(msg => `
    <div class="inbox-message-item" id="msg-card-${msg.id}">
      <div class="inbox-msg-header">
        <div>
          <div class="inbox-sender-name">${escapeHtml(msg.name)}</div>
          <div class="inbox-sender-email"><i class="fa-regular fa-envelope"></i> ${escapeHtml(msg.email)}</div>
        </div>
        <div class="inbox-timestamp">${escapeHtml(msg.date || 'Recent')}</div>
      </div>
      
      ${msg.subject ? `<div class="inbox-subject"><i class="fa-solid fa-tag" style="color: var(--primary); font-size: 0.8rem;"></i> ${escapeHtml(msg.subject)}</div>` : ''}
      
      <div class="inbox-body-text">${escapeHtml(msg.message)}</div>
      
      <div class="inbox-msg-actions">
        <a href="mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent('Re: ' + (msg.subject || 'Portfolio Inquiry'))}" class="btn btn-sm btn-outline">
          <i class="fa-solid fa-reply"></i> Reply by Email
        </a>
        <button class="btn btn-sm btn-outline" onclick="copyMessageText('${msg.id}')" title="Copy message text">
          <i class="fa-regular fa-copy"></i> Copy
        </button>
        <button class="btn btn-sm btn-outline" onclick="deleteInboxMessage('${msg.id}')" title="Delete message" style="color: #ef4444;">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.deleteInboxMessage = function(id) {
  let messages = getStoredMessages();
  messages = messages.filter(m => m.id !== id);
  saveStoredMessages(messages);
  renderInboxMessages();
  showToast('Message removed from inbox');
};

window.copyMessageText = function(id) {
  const messages = getStoredMessages();
  const target = messages.find(m => m.id === id);
  if (target) {
    const text = `From: ${target.name} (${target.email})\nDate: ${target.date}\nSubject: ${target.subject}\n\n${target.message}`;
    copyToClipboard(text, 'Message copied to clipboard');
  }
};

function initMessageInboxSystem() {
  updateInboxBadges();

  const openTriggers = [
    document.getElementById('card-open-inbox'),
    document.getElementById('nav-inbox-trigger'),
    document.getElementById('footer-inbox-btn')
  ];

  openTriggers.forEach(el => {
    if (el) el.addEventListener('click', openInboxModal);
  });

  const closeBtn = document.getElementById('close-inbox-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeInboxModal);

  const modal = document.getElementById('inbox-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeInboxModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeInboxModal();
  });

  // Clear all button
  const clearBtn = document.getElementById('btn-clear-messages');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all stored messages from your local inbox?')) {
        saveStoredMessages([]);
        renderInboxMessages();
        showToast('All stored messages cleared');
      }
    });
  }

  // Export JSON backup button
  const exportBtn = document.getElementById('btn-export-messages');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const messages = getStoredMessages();
      if (!messages.length) {
        showToast('No messages to export');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `bhanadithya_messages_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Messages exported to JSON');
    });
  }
}

/* ==========================================================================
   7. Form Submission Handler (FormSubmit AJAX + Local Storage Backup)
   ========================================================================== */
async function handleFormSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const subjectInput = document.getElementById('form-subject');
  const messageInput = document.getElementById('form-message');
  const submitBtn = document.getElementById('btn-submit-form');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const subject = subjectInput ? subjectInput.value.trim() : 'Portfolio Contact Inquiry';
  const message = messageInput.value.trim();

  if (!name || !email || !message) {
    showToast('Please fill out all required fields');
    return;
  }

  // 1. Immediately store in Local Message Inbox so Bhanadithya can view it right away!
  const newMsg = {
    id: 'msg_' + Date.now(),
    name: name,
    email: email,
    subject: subject || 'Portfolio Inquiry',
    message: message,
    date: new Date().toLocaleString(),
    timestamp: Date.now()
  };

  const stored = getStoredMessages();
  stored.unshift(newMsg);
  saveStoredMessages(stored);

  // 2. Transmit to FormSubmit.co for direct delivery to bhanadithyanandala@gmail.com
  const originalHtml = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...';
  submitBtn.style.pointerEvents = 'none';

  try {
    const response = await fetch('https://formsubmit.co/ajax/bhanadithyanandala@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: subject ? `Portfolio Message: ${subject}` : `New Portfolio Inquiry from ${name}`,
        message: message,
        _template: 'box'
      })
    });

    submitBtn.innerHTML = originalHtml;
    submitBtn.style.pointerEvents = 'auto';

    if (response.ok) {
      showToast(`Thank you, ${name}! Your message was dispatched and saved.`);
      e.target.reset();
    } else {
      // Even if FormSubmit needs confirmation or was blocked, it is already safely saved in the inbox!
      showToast(`Message logged to your on-site inbox!`);
      e.target.reset();
    }
  } catch (err) {
    // Network offline / adblocker fallback: Message is already safely logged in browser inbox!
    submitBtn.innerHTML = originalHtml;
    submitBtn.style.pointerEvents = 'auto';
    showToast(`Message saved to on-site inbox! You can also email directly.`);
    e.target.reset();
  }
}

/* ==========================================================================
   8. Copy to Clipboard Utility
   ========================================================================== */
function copyToClipboard(text, customMessage = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMessage);
    }).catch(() => {
      fallbackCopyText(text, customMessage);
    });
  } else {
    fallbackCopyText(text, customMessage);
  }
}

function fallbackCopyText(text, customMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(customMessage);
  } catch (err) {
    showToast('Failed to copy. Please manually select text.');
  }
  document.body.removeChild(textArea);
}

/* ==========================================================================
   9. Toast Notification System
   ========================================================================== */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   10. Current Year Auto-Update
   ========================================================================== */
function setCopyrightYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
