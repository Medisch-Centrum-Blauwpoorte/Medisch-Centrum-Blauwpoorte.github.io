// =====================================================
// Medisch Centrum Blauwpoorte — main.js
// =====================================================

// ----- Hamburger navigatiemenu -----
(function () {
  var hamburger = document.querySelector('.nav__hamburger');
  var navLinks  = document.querySelector('.nav__links');

  if (!hamburger || !navLinks) return;

  function sluitMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  hamburger.addEventListener('click', function () {
    var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('open');
    document.body.classList.toggle('menu-open', !isOpen);
    // Verplaats focus naar eerste menu-item bij openen (WCAG 2.4.3)
    if (!isOpen) {
      var eersteLink = navLinks.querySelector('a');
      if (eersteLink) eersteLink.focus();
    }
  });

  // Sluit menu wanneer op een link geklikt wordt
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', sluitMenu);
  });

  // Sluit menu bij klik buiten de navigatie
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      sluitMenu();
    }
  });

  // Sluit menu met Escape-toets
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') sluitMenu();
  });
})();

// ----- Copyright-jaar automatisch bijwerken -----
(function () {
  var jaar = document.getElementById('copyright-jaar');
  if (jaar) jaar.textContent = String(new Date().getFullYear());
})();

// ----- Team-kaart modal -----
(function () {
  var modal = document.getElementById('team-modal');
  var knoppen = document.querySelectorAll('.team-kaart__meer-knop');
  if (!modal || !knoppen.length) return;

  var fotoEl    = modal.querySelector('.team-modal__foto');
  var naamEl    = modal.querySelector('.team-modal__naam');
  var titelEl   = modal.querySelector('.team-modal__titel');
  var bioEl     = modal.querySelector('.team-modal__bio');
  var sluitKnop = modal.querySelector('.team-modal__sluit');

  function sluit() {
    if (modal.open) modal.close();
  }

  knoppen.forEach(function (knop) {
    knop.addEventListener('click', function () {
      var kaart = knop.closest('.team-kaart');
      if (!kaart) return;

      var foto  = kaart.querySelector('.team-kaart__foto');
      var naam  = kaart.querySelector('.team-kaart__naam');
      var titel = kaart.querySelector('.team-kaart__titel');
      var bioId = knop.getAttribute('aria-controls');
      var bio   = bioId ? document.getElementById(bioId) : null;

      if (foto) {
        fotoEl.src = foto.getAttribute('src');
        fotoEl.alt = foto.getAttribute('alt') || '';
      }
      naamEl.textContent = naam ? naam.textContent : '';
      titelEl.innerHTML  = titel ? titel.innerHTML : '';
      bioEl.innerHTML    = bio ? bio.innerHTML : '';

      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }

      // Focus op de naam zodat schermlezers horen wie er geopend is (WCAG)
      naamEl.focus();
    });
  });

  if (sluitKnop) sluitKnop.addEventListener('click', sluit);

  // Klik op de achtergrond (buiten de inhoud) sluit de modal
  modal.addEventListener('click', function (e) {
    if (e.target === modal) sluit();
  });
})();

// ----- FAQ Accordion -----
(function () {
  var vragen = document.querySelectorAll('.faq-item__vraag');

  vragen.forEach(function (knop) {
    knop.addEventListener('click', function () {
      var isOpen = this.getAttribute('aria-expanded') === 'true';
      var antwoord = document.getElementById(
        this.getAttribute('aria-controls')
      );

      // Sluit alle andere items
      vragen.forEach(function (andereKnop) {
        var andereId = andereKnop.getAttribute('aria-controls');
        var andereAntwoord = document.getElementById(andereId);
        andereKnop.setAttribute('aria-expanded', 'false');
        if (andereAntwoord) andereAntwoord.classList.remove('open');
      });

      // Schakel huidig item
      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        if (antwoord) antwoord.classList.add('open');
      }
    });
  });
})();

// ----- Scroll-reveal animaties -----
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Geen observer-ondersteuning of gereduceerde beweging: toon alles meteen
  if (!('IntersectionObserver' in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  reveals.forEach(function (el) { observer.observe(el); });
})();

// ----- Open/gesloten-indicator (openingsuren) -----
(function () {
  var el = document.getElementById('open-status');
  if (!el) return;

  // Openingsuren in minuten per weekdag; index 0 = zondag (Date.getDay())
  var uren = [
    null,         // zondag    — gesloten
    [1080, 1230], // maandag   18:00–20:30
    null,         // dinsdag   — gesloten
    [1080, 1230], // woensdag  18:00–20:30
    [810, 1080],  // donderdag 13:30–18:00
    [540, 720],   // vrijdag   09:00–12:00
    [540, 720]    // zaterdag  09:00–12:00
  ];
  var dagNamen = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

  function fmt(m) {
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  }

  var nu = new Date();
  var dag = nu.getDay();
  var minuten = nu.getHours() * 60 + nu.getMinutes();
  var vandaag = uren[dag];

  if (vandaag && minuten >= vandaag[0] && minuten < vandaag[1]) {
    el.textContent = 'Nu open — sluit om ' + fmt(vandaag[1]);
    el.classList.add('is-open');
  } else {
    for (var i = 0; i < 7; i++) {
      var d = (dag + i) % 7;
      var u = uren[d];
      if (u && (i > 0 || minuten < u[0])) {
        var wanneer = i === 0 ? 'vandaag' : (i === 1 ? 'morgen' : dagNamen[d]);
        el.textContent = 'Nu gesloten — opent ' + wanneer + ' om ' + fmt(u[0]);
        break;
      }
    }
  }
  el.hidden = false;
})();

// ----- Terug-naar-boven knop -----
(function () {
  var knop = document.createElement('button');
  knop.type = 'button';
  knop.className = 'terug-boven';
  knop.setAttribute('aria-label', 'Terug naar boven');
  knop.textContent = '↑';
  document.body.appendChild(knop);

  knop.addEventListener('click', function () {
    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  if (!('IntersectionObserver' in window)) return;

  // Sentinel van 600px hoog: knop verschijnt zodra die volledig uit beeld is
  var sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText =
    'position:absolute;top:0;left:0;width:1px;height:600px;pointer-events:none;';
  document.body.prepend(sentinel);

  new IntersectionObserver(function (entries) {
    // Laatste melding telt (meldingen kunnen gebundeld binnenkomen)
    var laatste = entries[entries.length - 1];
    knop.classList.toggle('zichtbaar', !laatste.isIntersecting);
  }).observe(sentinel);
})();

// ----- Nav-schaduw bij scrollen -----
(function () {
  var header = document.querySelector('.header');
  if (!header || !('IntersectionObserver' in window)) return;

  // Onzichtbare sentinel bovenaan; zodra die uit beeld is, is er gescrold
  var sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText =
    'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
  document.body.prepend(sentinel);

  var observer = new IntersectionObserver(function (entries) {
    var laatste = entries[entries.length - 1];
    header.classList.toggle('gescrolld', !laatste.isIntersecting);
  }, { threshold: 0 });

  observer.observe(sentinel);
})();
