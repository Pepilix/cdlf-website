/* CDLF shared behaviour: header, drop-down menu, crisis pop-up, smooth in-page links, film card. */
/* ---------- UI: header, menu, crisis overlay, film card, enquiry forms ---------- */
(function () {
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Smooth in-page links (except the skip link, which should jump straight to the content).
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip') || a.getAttribute('href') === '#') return;
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    var calmNav = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: calmNav ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', a.getAttribute('href'));
  });

  // Drop-down menu: the burger opens and closes it; Escape, a click outside, or choosing a link closes it.
  var menu = document.getElementById('site-menu');
  var openBtn = document.querySelector('.bar .menu-btn');
  var menuOpen = false;
  function setMenu(open, returnFocus) {
    menuOpen = open;
    header.classList.toggle('menu-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
    if (!open && returnFocus) openBtn.focus();
  }
  openBtn.addEventListener('click', function () { setMenu(!menuOpen); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false, true); });
  document.addEventListener('click', function (e) { if (menuOpen && !header.contains(e.target)) setMenu(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  var dlg = document.getElementById('crisis');
  if (dlg && typeof dlg.showModal === 'function') {
    document.querySelectorAll('[data-crisis]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (menuOpen) setMenu(false);
        dlg.showModal();
      });
    });
    dlg.querySelector('[data-close-crisis]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* Film card: a silent, chrome-free loop (browsers only allow muted autoplay).
     The poster sits underneath; the video fades in only once YouTube reports it is really playing,
     and fades back to the poster just before each loop, so the card never shows black or a spinner.
     data-start / data-end on the card pick which part of the film loops (seconds; end 0 = whole film).
     "Watch with sound" opens the full player in a dialog. Reduced motion: poster only, no loop. */
  var card = document.querySelector('.reel-card');
  if (card) {
    var id = card.dataset.yt, media = card.querySelector('.reel-media');
    var START = +card.dataset.start || 0, END = +card.dataset.end || 0;
    var soundBtn = card.querySelector('[data-reel="sound"]'), pauseBtn = card.querySelector('[data-reel="pause"]');
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Phones and data-saving visitors get the poster and a tap-to-watch button instead of the streaming loop.
    var conn = navigator.connection || {};
    var saveData = conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || '');
    var phone = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches;
    if (phone || saveData) {
      still = true;
      soundBtn.textContent = 'Watch the film';
    }
    var frame = null, paused = false, userPaused = false, heard = false;
    var yt = { state: -1, t: 0, dur: 0, seeking: false };
    var embed = 'https://www.youtube-nocookie.com/embed/' + id;

    function send(func, args) {
      if (frame && frame.contentWindow) frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
    }
    // Preferred: a short self-hosted clip (data-mp4) plays with no third-party player at all.
    var clip = null;
    function setPaused(p) {
      paused = p;
      if (clip) { p ? clip.pause() : clip.play().catch(function () {}); }
      else send(p ? 'pauseVideo' : 'playVideo');
      pauseBtn.textContent = p ? 'Play' : 'Pause';
    }
    function startClip() {
      clip = document.createElement('video');
      clip.src = card.dataset.mp4;
      clip.muted = true; clip.loop = true; clip.playsInline = true; clip.autoplay = true;
      clip.setAttribute('aria-hidden', 'true');
      clip.addEventListener('playing', function () { clip.classList.add('ready'); }, { once: true });
      media.appendChild(clip);
      frame = clip;   // lets the scroll observer below treat it like the YouTube loop
      pauseBtn.hidden = false;
    }
    function sync() {
      var end = END || yt.dur;
      var live = (yt.state === 1 || yt.state === 2) && yt.t >= START + 0.3 && (!end || yt.t < end - 0.9);
      frame.classList.toggle('ready', live);
      // Loop ourselves (rather than YouTube's loop) so the restart happens behind the poster.
      if (!yt.seeking && ((end && yt.t >= end - 0.5) || yt.state === 0)) {
        yt.seeking = true;
        send('seekTo', [START, true]); if (!paused) send('playVideo');
        setTimeout(function () { yt.seeking = false; }, 1500);
      }
    }
    window.addEventListener('message', function (e) {
      if (!frame || e.source !== frame.contentWindow || typeof e.data !== 'string') return;
      var d; try { d = JSON.parse(e.data); } catch (_) { return; }
      heard = true;
      var info = d.info || {};
      if (typeof info.playerState === 'number') yt.state = info.playerState;
      if (typeof info.currentTime === 'number') yt.t = info.currentTime;
      if (typeof info.duration === 'number' && info.duration > 0) yt.dur = info.duration;
      sync();
    });
    function startLoop() {
      frame = document.createElement('iframe');
      frame.src = embed + '?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&rel=0&playsinline=1&iv_load_policy=3&cc_load_policy=0' +
        '&loop=1&playlist=' + id + '&start=' + START + '&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
      frame.title = 'Charlie Dallas Lancaster Foundation film (silent preview)';
      frame.allow = 'autoplay; encrypted-media';
      frame.tabIndex = -1; frame.setAttribute('aria-hidden', 'true');
      frame.addEventListener('load', function () {
        // Ask the player to report its state and time back to this page.
        frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'reel', channel: 'widget' }), '*');
        // If the player never reports (blocked messaging), just show it.
        setTimeout(function () { if (!heard) frame.classList.add('ready'); }, 5000);
      });
      media.appendChild(frame);
      pauseBtn.hidden = false;
    }

    if (!still) {
      // Don't compete with the page itself: start the loop only after everything else has loaded.
      var afterLoad = function (fn) {
        var go = function () { setTimeout(fn, 1200); };
        if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
      };
      afterLoad(function () {
        new IntersectionObserver(function (entries) {
          var e = entries[0];
          if (e.isIntersecting && !frame) (card.dataset.mp4 ? startClip : startLoop)();
          // Rest the loop while it is off screen; resume unless the visitor paused it.
          else if (frame && !userPaused && !filmDlg.open) setPaused(!e.isIntersecting);
        }, { rootMargin: '200px 0px' }).observe(card);
      });
    }
    pauseBtn.addEventListener('click', function () { userPaused = !paused; setPaused(!paused); });

    // Watch with sound: full player in a dialog; the card loop rests underneath and resumes on close.
    var filmDlg = document.getElementById('film-dialog'), filmBox = filmDlg.querySelector('.film-frame');
    soundBtn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = embed + '?autoplay=1&controls=1&rel=0&playsinline=1';
      f.title = 'Charlie Dallas Lancaster Foundation film';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      filmBox.replaceChildren(f);
      if (frame) setPaused(true);
      filmDlg.showModal();
    });
    filmDlg.addEventListener('close', function () {
      filmBox.replaceChildren();
      if (frame && !userPaused) setPaused(false);
      soundBtn.focus();
    });
    filmDlg.querySelector('[data-close-film]').addEventListener('click', function () { filmDlg.close(); });
    filmDlg.addEventListener('click', function (e) { if (e.target === filmDlg) filmDlg.close(); });
  }

  /* Enquiry forms (form[data-mailto]): check each field, then open the visitor's email app with the
     message written out. Nothing is sent from the website itself, and the form says so.
     To connect a form service at launch, point the form's action at it and remove data-mailto (see LAUNCH.md). */
  document.querySelectorAll('form[data-mailto]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    function fieldError(field, message) {
      var err = document.getElementById(field.id + '-error');
      if (err) err.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    }
    function message(field) {
      if (field.validity.valueMissing) return field.type === 'checkbox' ? 'Please tick this box so we can reply to you.' : 'Please fill in this field.';
      if (field.validity.typeMismatch) return 'Enter an email address like name@example.com.';
      return '';
    }
    form.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.type === 'checkbox') fieldError(f, message(f)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('input, textarea').forEach(function (f) {
        var m = message(f); fieldError(f, m);
        if (m && !firstBad) firstBad = f;
      });
      if (firstBad) { status.textContent = 'Please check the highlighted fields.'; firstBad.focus(); return; }
      var v = function (name) { var el = form.elements[name]; return el ? el.value.trim() : ''; };
      var subject = form.dataset.subject + (v('business') ? ' from ' + v('business') : '');
      var body = ['Name: ' + v('name'), 'Business: ' + v('business'), 'Email: ' + v('email'), v('phone') ? 'Phone: ' + v('phone') : '', '', v('message')]
        .filter(function (line, i) { return line !== '' || i === 4; }).join('\n');
      status.textContent = 'Your email app should now open with your message ready to send. If it does not, email us at ' + form.dataset.mailto + '.';
      window.location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });
})();
