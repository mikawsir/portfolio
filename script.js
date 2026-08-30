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
    const nav = document.querySelector('.main-nav');
    const navToggle = document.querySelector('.nav-toggle');
    const clearActiveLinks = () => {
        navLinks.forEach((link) => link.classList.remove('active'));
    };

    const setActiveLink = (targetId) => {
        clearActiveLinks();
        const activeLink = navLinks.find((link) => link.getAttribute('href') === targetId);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    };

    let lastScrollY = window.scrollY;

    const updateNavState = () => {
        const currentScrollY = window.scrollY;

        if (nav) {
            nav.classList.toggle('nav-scrolled', currentScrollY > 24);
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
        }

        if (currentScrollY <= 120) {
            clearActiveLinks();
            lastScrollY = currentScrollY;
            return;
        }

        const sectionInView = sections
            .map((section) => {
                const rect = section.getBoundingClientRect();
                return { section, rect, visible: rect.top < window.innerHeight * 0.45 && rect.bottom > window.innerHeight * 0.2 };
            })
            .filter((item) => item.visible)
            .sort((a, b) => a.rect.top - b.rect.top)[0];

        if (sectionInView) {
            setActiveLink('#' + sectionInView.section.id);
        }

        lastScrollY = currentScrollY;
    };

    const closeMenu = () => {
        if (!nav || !navToggle) return;
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        if (!nav || !navToggle) return;
        nav.classList.add('menu-open');
        navToggle.setAttribute('aria-expanded', 'true');
    };

    if (navToggle && nav) {
        navToggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (nav.classList.contains('menu-open')) {
                closeMenu();
                return;
            }

            openMenu();
        });

        document.addEventListener('click', (event) => {
            const target = event.target;
            if (!nav.classList.contains('menu-open')) return;
            if (target === nav || nav.contains(target) || target === navToggle || navToggle.contains(target)) return;
            closeMenu();
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;

            event.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - 110;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }

            closeMenu();
            setActiveLink(targetId);
        });
    });

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', updateNavState);
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
        const syncCardLight = (event) => {
            const bounds = card.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;

            card.style.setProperty('--mx', `${x}%`);
            card.style.setProperty('--my', `${y}%`);
            hoveredCard = card;
        };

        card.addEventListener('pointerenter', syncCardLight);
        card.addEventListener('pointermove', syncCardLight);

        card.addEventListener('pointerleave', () => {
            if (hoveredCard === card) hoveredCard = null;
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });

        card.addEventListener('focus', () => {
            hoveredCard = card;
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });

        card.addEventListener('blur', () => {
            if (hoveredCard === card) hoveredCard = null;
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });
    });
}

// Hover-to-play / hover-stop for the video cards
const hoverVideos = document.querySelectorAll('.hover-video, #featuredVideo');

if (hoverVideos.length) {
    hoverVideos.forEach((video) => {
        video.playsInline = true;
        video.controls = false;
        video.muted = true;
        video.volume = 0.7;
        video.setAttribute('playsinline', 'true');

        const playVideo = () => {
            if (video.readyState < 2) {
                video.load();
            }
            video.muted = true;
            video.play().catch(() => {});
        };

        const stopVideo = () => {
            try {
                video.pause();
            } catch (error) {
                // Safe no-op if the browser blocks the pause call.
            }
            video.currentTime = 0;
            video.muted = true;
        };

        if (window.matchMedia('(hover: hover)').matches) {
            const card = video.closest('.video-card, .video-feature');
            if (card) {
                card.addEventListener('mouseenter', playVideo);
                card.addEventListener('mouseleave', stopVideo);
            }

            video.addEventListener('mouseenter', playVideo);
            video.addEventListener('mouseleave', stopVideo);
        }
    });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', () => {
        if (submitButton) {
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
        }
    });
}

// Fullscreen modal video viewer
const videoTriggerCards = document.querySelectorAll('.video-trigger');
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.querySelector('.video-modal-close');

if (videoTriggerCards.length && videoModal && modalVideo) {
    const openModal = (event) => {
        const trigger = event.currentTarget;
        const videoSource = trigger.dataset.videoSrc || 'asset/videos/IMG_0921.MP4';
        const videoTitle = trigger.dataset.videoTitle || 'Portfolio video';

        const currentSource = modalVideo.querySelector('source');
        currentSource.src = videoSource;
        modalVideo.load();
        modalVideo.setAttribute('aria-label', videoTitle);
        videoModal.classList.add('is-open');
        videoModal.setAttribute('aria-hidden', 'false');
        modalVideo.muted = false;
        modalVideo.play().catch(() => {});
    };

    const closeModal = () => {
        videoModal.classList.remove('is-open');
        videoModal.setAttribute('aria-hidden', 'true');
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.muted = true;
    };

    videoTriggerCards.forEach((card) => {
        card.addEventListener('click', openModal);
    });

    modalClose.addEventListener('click', closeModal);
    videoModal.addEventListener('click', (event) => {
        if (event.target.dataset.closeModal === 'true') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && videoModal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

const workCards = document.querySelectorAll('.work-card');
const imageModal = document.getElementById('imageModal');
const modalWorkImage = document.getElementById('modalWorkImage');
const modalWorkTitle = document.getElementById('modalWorkTitle');
const imageModalClose = document.querySelector('.image-modal-close');

if (workCards.length && imageModal && modalWorkImage && modalWorkTitle) {
    const fallbackImage = 'asset/social.jpg';

    const openImageModal = (event) => {
        const card = event.currentTarget;
        const imageSrc = card.dataset.image || fallbackImage;
        const title = card.dataset.title || 'Project preview';

        modalWorkImage.onerror = () => {
            modalWorkImage.src = fallbackImage;
        };

        modalWorkImage.src = imageSrc;
        modalWorkTitle.textContent = title;
        imageModal.classList.add('is-open');
        imageModal.setAttribute('aria-hidden', 'false');
    };

    const closeImageModal = () => {
        imageModal.classList.remove('is-open');
        imageModal.setAttribute('aria-hidden', 'true');
    };

    workCards.forEach((card) => {
        card.addEventListener('click', openImageModal);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openImageModal(event);
            }
        });
    });

    imageModalClose.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (event) => {
        if (event.target.dataset.closeImage === 'true') {
            closeImageModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && imageModal.classList.contains('is-open')) {
            closeImageModal();
        }
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
