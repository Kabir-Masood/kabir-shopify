/* ============================================================
   KABIR.ME — Portfolio JavaScript
   ============================================================ */

/* ---- NAV: scroll effect + mobile toggle ---- */
(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  function openMenu() {
    links.classList.add('open');
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    const spans = toggle.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  }

  function closeMenu() {
    links.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    const spans = toggle.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }

  toggle.addEventListener('click', () => {
    links.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on link click or Escape key
  links.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ---- REVEAL ON SCROLL (Intersection Observer) ---- */
(function () {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children within same parent
          const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
          let delay = 0;
          siblings.forEach((el, idx) => {
            if (el === entry.target) delay = idx * 80;
          });
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach(el => observer.observe(el));
})();

/* ---- TYPED TEXT EFFECT ---- */
(function () {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'Shopify stores that convert.',
    'fast, accessible storefronts.',
    'pixel-perfect Figma themes.',
    'data-driven CRO wins.',
    'custom Liquid features.',
    'Shopify solutions that scale.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let pause = false;

  function type() {
    if (pause) return;
    const current = phrases[phraseIdx];

    if (!isDeleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        pause = true;
        setTimeout(() => { pause = false; isDeleting = true; type(); }, 2200);
        return;
      }
      setTimeout(type, 55);
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 300);
        return;
      }
      setTimeout(type, 30);
    }
  }

  setTimeout(type, 800);
})();

/* ---- SMOOTH SCROLL for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = document.getElementById('nav').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- ACTIVE NAV LINK on scroll ---- */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  function setActive() {
    const scrollY = window.scrollY;
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${id}"]`);
      if (!link) return;
      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
})();

/* Add active style for nav link */
const style = document.createElement('style');
style.textContent = `.nav__link.active { color: var(--green) }`;
document.head.appendChild(style);

/* ---- CONTACT FORM (Formspree) ---- */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // If Formspree ID not yet set, warn in console but don't break
    if (form.action.includes('YOUR_FORM_ID')) {
      console.warn('Portfolio: set your Formspree form ID in index.html');
    }

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Sending…</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        btn.style.display = 'none';
        successMsg.classList.add('visible');
        form.reset();
        setTimeout(() => {
          successMsg.classList.remove('visible');
          btn.style.display = '';
          btn.innerHTML = originalHTML;
          btn.disabled = false;
        }, 6000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.innerHTML = '<span>Failed — try emailing directly</span>';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }, 3000);
    }
  });
})();

/* ---- PARALLAX: hero glows follow mouse ---- */
(function () {
  const glow1 = document.querySelector('.hero__glow--1');
  const glow2 = document.querySelector('.hero__glow--2');
  if (!glow1 || !glow2) return;

  let ticking = false;
  document.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      glow1.style.transform = `translate(${x * 30}px, ${y * 20}px)`;
      glow2.style.transform = `translate(${-x * 20}px, ${-y * 15}px)`;
      ticking = false;
    });
  });
})();

/* ---- NUMBER COUNTER ANIMATION ---- */
(function () {
  const stats = document.querySelectorAll('.hero__stat-num');
  let animated = false;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || animated) return;
    animated = true;

    stats.forEach(el => {
      const text = el.textContent;
      const suffix = text.replace(/[0-9]/g, '');
      const target = parseInt(text);
      if (isNaN(target)) return;

      let start = 0;
      const duration = 1200;
      const step = timestamp => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  if (stats[0]) observer.observe(stats[0].closest('.hero__stats'));
})();
