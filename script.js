/* ==========================================================================
   Bhanadithya Nandala - Portfolio Interactive Logic (script.js)
   Features: Theme Controller (Light/Dark/System), Neural Canvas, Scroll Reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeController();
  initNeuralCanvas();
  initScrollReveal();
  initSkillFilters();
  initNavigation();
  setCopyrightYear();
});

/* ==========================================================================
   1. Theme Controller (Light, Dark, and System Default)
   ========================================================================== */
function initThemeController() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  const systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Get initial preferred theme from FOUC script attribute or storage
  let currentPref = localStorage.getItem('theme-preference') || 'system';
  updateSwitcherUI(currentPref);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-set-theme');
      applyThemePreference(selectedTheme);
    });
  });

  // Listen to OS system level changes if user is on 'system' mode
  systemMediaQuery.addEventListener('change', (e) => {
    if (localStorage.getItem('theme-preference') === 'system') {
      const resolved = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', resolved);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: resolved } }));
    }
  });

  function applyThemePreference(pref) {
    localStorage.setItem('theme-preference', pref);
    document.documentElement.setAttribute('data-theme-preference', pref);
    
    let resolvedTheme = pref;
    if (pref === 'system') {
      resolvedTheme = systemMediaQuery.matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    updateSwitcherUI(pref);
    
    // Notify canvas or animations of color shift
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: resolvedTheme } }));
    showToast(`Theme switched to ${pref.charAt(0).toUpperCase() + pref.slice(1)} mode.`);
  }

  function updateSwitcherUI(pref) {
    themeButtons.forEach(btn => {
      const themeType = btn.getAttribute('data-set-theme');
      if (themeType === pref) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

/* ==========================================================================
   2. Interactive Neural Network Canvas (Adapts to Active Theme)
   ========================================================================== */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 22), 45); // Elegant density

  class Node {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1.5;
      this.colorType = Math.random() > 0.5 ? 'primary' : 'secondary';
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
      
      if (theme === 'light') {
        ctx.fillStyle = this.colorType === 'primary' ? '#0284c7' : '#4f46e5';
      } else {
        ctx.fillStyle = this.colorType === 'primary' ? '#38bdf8' : '#818cf8';
      }

      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Node());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const theme = getCurrentTheme();

    // Draw lines between proximate nodes
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 180;
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          
          // Smooth alpha transition by distance and theme
          const maxAlpha = theme === 'light' ? 0.12 : 0.16;
          const alpha = (1 - dist / maxDist) * maxAlpha;
          const strokeColor = theme === 'light' ? `rgba(2, 132, 199, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
          
          ctx.strokeStyle = strokeColor;
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
   3. Scroll Reveal Animation via Intersection Observer
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observerOptions = {
    threshold: 0.15,
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
  const skillCards = document.querySelectorAll('.skill-category-card');

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
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
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
   6. Interactive Utilities: Copy to Clipboard & Form Submission
   ========================================================================== */

function copyToClipboard(text, customMessage = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMessage);
    }).catch(err => {
      fallbackCopyTextToClipboard(text, customMessage);
    });
  } else {
    fallbackCopyTextToClipboard(text, customMessage);
  }
}

function fallbackCopyTextToClipboard(text, customMessage) {
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
    alert('Failed to copy. Please manually copy: ' + text);
  }
  document.body.removeChild(textArea);
}

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

function handleFormSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('form-name');
  const name = nameInput.value;
  
  const btn = document.getElementById('btn-submit-form');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting Data...';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.pointerEvents = 'auto';
    showToast(`Thank you, ${name}! Your message has been received.`);
    e.target.reset();
  }, 1000);
}

function setCopyrightYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
