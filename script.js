// Portfolio interaction logic
// This file handles scroll reveals, active nav links, motion effects,
// and the animated stats counter for easier future edits.

const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

// Navigation highlight while scrolling
const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (sections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const targetId = '#' + entry.target.id;
        const activeLink = navLinks.find((link) => link.getAttribute('href') === targetId);

        if (!activeLink) return;

        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove('active'));
          activeLink.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));
}

// Motion effects for portrait tilt and card spotlight
const portraitFrame = document.getElementById('portraitFrame');
const cards = document.querySelectorAll('.card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasHover = window.matchMedia('(hover:hover)').matches;

let pointerX = 0;
let pointerY = 0;
let animationFrameScheduled = false;
let hoveredCard = null;

function updatePortraitTilt() {
  animationFrameScheduled = false;

  if (portraitFrame && hasHover && !prefersReducedMotion) {
    const bounds = portraitFrame.getBoundingClientRect();
    const insideFrame =
      pointerX >= bounds.left &&
      pointerX <= bounds.right &&
      pointerY >= bounds.top &&
      pointerY <= bounds.bottom;

    if (insideFrame) {
      const x = (pointerX - bounds.left) / bounds.width - 0.5;
      const y = (pointerY - bounds.top) / bounds.height - 0.5;
      portraitFrame.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    } else {
      portraitFrame.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
    }
  }

  if (hoveredCard) {
    const bounds = hoveredCard.getBoundingClientRect();
    hoveredCard.style.setProperty('--mx', (pointerX - bounds.left) + 'px');
    hoveredCard.style.setProperty('--my', (pointerY - bounds.top) + 'px');
  }
}

if (hasHover && !prefersReducedMotion) {
  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!animationFrameScheduled) {
        animationFrameScheduled = true;
        requestAnimationFrame(updatePortraitTilt);
      }
    },
    { passive: true }
  );

  cards.forEach((card) => {
    card.addEventListener('pointerenter', () => {
      hoveredCard = card;
    });

    card.addEventListener('pointerleave', () => {
      if (hoveredCard === card) hoveredCard = null;
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

// Count-up stats animation
const statElements = document.querySelectorAll('.about-stats b[data-count]');

if (statElements.length) {
  const animateCounter = (element) => {
    const target = parseInt(element.dataset.count, 10) || 0;
    const suffix = element.dataset.suffix || '';

    if (prefersReducedMotion) {
      element.textContent = target + suffix;
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(eased * target) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  statElements.forEach((element) => statsObserver.observe(element));
}

// Small dev-only message
console.log('%cBuilt for you, Himel — by your brother. 🚀', 'font-size:14px;color:#00e5ff;font-family:monospace;');
