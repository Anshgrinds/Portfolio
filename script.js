/**
 * Ansh Jha Portfolio — Clean Interactive Engine
 * Restrained, high-performance interactions: 3D Slider, Filter Tabs, Lightbox, Copy Email Toast
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initComparisonSlider();
  initBreakdownTabs();
  initPortfolioFilters();
  initLightbox();
  initEmailCopy();
  initMobileNav();
  initScrollSpy();
  initSmoothScroll();
});

/* ========================================================
   1. Scroll Progress Indicator
======================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

/* ========================================================
   2. 3D Cycles vs Viewport Comparison Sliders
======================================================== */
function initComparisonSlider() {
  const containers = document.querySelectorAll('.comparison-container');
  if (!containers.length) return;

  containers.forEach(container => {
    const slider = container.querySelector('.comparison-slider');
    const overlay = container.querySelector('.comparison-overlay');
    if (!slider || !overlay) return;

    let isDragging = false;

    function updateSlider(x) {
      const rect = container.getBoundingClientRect();
      let pos = (x - rect.left) / rect.width;
      if (pos < 0.02) pos = 0.02;
      if (pos > 0.98) pos = 0.98;
      const percentage = pos * 100;
      overlay.style.width = `${percentage}%`;
      slider.style.left = `${percentage}%`;
    }

    slider.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDragging = true;
    });
    window.addEventListener('mouseup', () => (isDragging = false));
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    // Touch
    slider.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      isDragging = true;
    }, { passive: true });
    window.addEventListener('touchend', () => (isDragging = false));
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });

    container.addEventListener('click', (e) => {
      updateSlider(e.clientX);
    });
  });
}

/* ========================================================
   2b. 3D Technical Breakdown Tab Switcher
======================================================== */
function initBreakdownTabs() {
  const tabBtns = document.querySelectorAll('.breakdown-tab-btn');
  const panels = document.querySelectorAll('.breakdown-panel');
  if (!tabBtns.length || !panels.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = `breakdown-${btn.getAttribute('data-breakdown')}`;

      panels.forEach(panel => {
        if (panel.id === targetId) {
          panel.style.display = 'grid';
          panel.style.opacity = '0';
          panel.style.transform = 'translateY(8px)';
          setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
          }, 30);
        } else {
          panel.style.display = 'none';
        }
      });
    });
  });
}

/* ========================================================
   3. Portfolio Filter Tabs
======================================================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ========================================================
   4. Artwork Lightbox Modal
======================================================== */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-image');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.querySelector('.lightbox-close');
  if (!modal || !modalImg) return;

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const imgSrc = item.getAttribute('data-lightbox-src') || item.getAttribute('src');
      const title = item.getAttribute('data-lightbox-title') || 'Artwork Preview';
      const desc = item.getAttribute('data-lightbox-desc') || '';

      modalImg.src = imgSrc;
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ========================================================
   5. Copy Email
======================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  const emailStr = 'anshgrind@gmail.com';
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailStr).then(() => {
      showToast('Copied: anshgrind@gmail.com');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = emailStr;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied: anshgrind@gmail.com');
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
}

/* ========================================================
   6. Mobile Navigation
======================================================== */
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

/* ========================================================
   7. ScrollSpy Active Navigation Links
======================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links li a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active-link');
      } else {
        link.classList.remove('active-link');
      }
    });
  }, { passive: true });
}

/* ========================================================
   8. Smooth Scroll
======================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
