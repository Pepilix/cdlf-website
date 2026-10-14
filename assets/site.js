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
  /* Film pop-up: plays a YouTube film with sound and controls. Any button with data-film="<YouTube id>"
     opens it (optionally data-film-title for the player's accessible name); the home film card uses it too. */
  var filmDlg = document.getElementById('film-dialog'), filmBox = filmDlg && filmDlg.querySelector('.film-frame');
  var filmReturn = null, filmClosed = null;
  function openFilm(id, opener, onClose) {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&controls=1&rel=0&playsinline=1';
    f.title = (opener && opener.dataset.filmTitle) || 'Charlie Dallas Lancaster Foundation film';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    filmBox.replaceChildren(f);
    filmReturn = opener || null; filmClosed = onClose || null;
    filmDlg.showModal();
  }
  // Stop the film and hand focus back. Called directly by every way of closing, rather than relying only on
  // the dialog's "close" event, which some browsers deliver late or not at all; safe to call more than once.
  function filmCleanup() {
    if (!filmBox.firstChild && !filmClosed && !filmReturn) return;
    filmBox.replaceChildren();
    var done = filmClosed, back = filmReturn;
    filmClosed = null; filmReturn = null;
    if (done) done();
    if (back) back.focus();
  }
  function closeFilm() { if (filmDlg.open) filmDlg.close(); filmCleanup(); }
  if (filmDlg) {
    filmDlg.addEventListener('close', filmCleanup);
    filmDlg.addEventListener('cancel', function (e) { e.preventDefault(); closeFilm(); });   // Escape key
    filmDlg.querySelector('[data-close-film]').addEventListener('click', closeFilm);
    filmDlg.addEventListener('click', function (e) { if (e.target === filmDlg) closeFilm(); });
    document.querySelectorAll('[data-film]').forEach(function (btn) {
      btn.addEventListener('click', function () { openFilm(btn.dataset.film, btn); });
    });
  }

  var card = document.querySelector('.reel-card');
  if (card && filmDlg) {
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

    // Watch with sound: full player in the pop-up; the card loop rests underneath and resumes on close.
    soundBtn.addEventListener('click', function () {
      if (frame) setPaused(true);
      openFilm(id, soundBtn, function () { if (frame && !userPaused) setPaused(false); });
    });
  }

  /* Donation form (form[data-paypal]): the same PayPal settings as the original cdlf.uk donate page.
     One-off: cmd=_donations with "amount". Monthly: cmd=_xclick-subscriptions with a3/p3/t3/src.
     Without JavaScript the preset one-off amounts still work, and the monthly option stays hidden. */
  document.querySelectorAll('form[data-paypal]').forEach(function (form) {
    var monthlyOpt = form.querySelector('[data-monthly-option]'), submit = form.querySelector('[type=submit]');
    var custom = form.querySelector('input[name=custom_amount]'), otherRadio = form.querySelector('input[name=amount][value=""]');
    var err = form.querySelector('.donate-error');
    if (monthlyOpt) monthlyOpt.hidden = false;
    function freq() { var r = form.querySelector('input[name=frequency]:checked'); return r ? r.value : 'single'; }
    function amount() {
      var r = form.querySelector('input[name=amount]:checked');
      if (!r) return '';
      return r === otherRadio ? (custom.value || '').trim().replace(/^£/, '') : r.value;
    }
    function valid(a) { return /^\d+(\.\d{1,2})?$/.test(a) && parseFloat(a) >= 1; }
    function label() {
      var a = amount(), m = freq() === 'monthly';
      var money = valid(a) ? '£' + (parseFloat(a) % 1 ? parseFloat(a).toFixed(2) : parseFloat(a)) : '';
      submit.textContent = money ? 'Donate ' + money + (m ? ' a month' : '') + ' with PayPal' : 'Donate with PayPal';
    }
    form.addEventListener('change', function (e) {
      if (e.target === otherRadio) custom.focus();
      label();
    });
    custom.addEventListener('focus', function () { otherRadio.checked = true; label(); });
    // Typing an amount (or autofill) always means "Other", even if the box was never focused first.
    custom.addEventListener('input', function () { otherRadio.checked = true; label(); });
    form.addEventListener('submit', function (e) {
      var a = amount();
      if (!valid(a)) {
        e.preventDefault();
        err.textContent = 'Please enter an amount of £1 or more, for example 15 or 12.50.';
        custom.setAttribute('aria-invalid', 'true'); otherRadio.checked = true; custom.focus();
        return;
      }
      err.textContent = ''; custom.removeAttribute('aria-invalid');
      otherRadio.value = a;                                  // so "amount" carries a custom value too
      form.querySelector('input[name=a3]').value = a;
      form.querySelector('input[name=cmd]').value = freq() === 'monthly' ? '_xclick-subscriptions' : '_donations';
    });
    label();
  });

  /* Partnership buttons (a[data-partnership]): pre-select that option in the enquiry form. The link's own
     #contact-form target (and the smooth-scroll handler above) takes the visitor to the form; focus then
     moves to the choice so keyboard and screen-reader users land where they can confirm or change it. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-partnership]');
    var sel = document.querySelector('select[name=topic]');
    if (!a || !sel) return;
    var want = a.dataset.partnership;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === want) { sel.selectedIndex = i; break; }
    }
    sel.removeAttribute('aria-invalid');
    var err = document.getElementById(sel.id + '-error'); if (err) err.textContent = '';
    setTimeout(function () { sel.focus({ preventScroll: true }); }, 700);
  });

  /* Partnership pack ([data-pack]): the download button appears only once the PDF actually exists at the
     given path, so the page never links to a missing file. Until then the placeholder stays. */
  document.querySelectorAll('[data-pack]').forEach(function (box) {
    var src = box.dataset.pack, ready = box.querySelector('[data-pack-ready]'), pending = box.querySelector('[data-pack-pending]');
    fetch(src, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      var type = r.headers.get('content-type') || '';
      if (!r.ok || /text\/html/.test(type)) return;
      ready.href = src; ready.setAttribute('download', ''); ready.hidden = false;
      if (pending) pending.hidden = true;
    }).catch(function () {});
  });

  /* Corporate partner directory ([data-partner-directory]): reads the JSON file and lists approved partners
     whose partnership is current. Foundation, then Impact, then Community partners, each in name order. */
  function renderPartners(list, root) {
    var dir = document.querySelector('[data-partner-directory]'), empty = document.querySelector('[data-partner-empty]');
    if (!dir) return 0;
    var today = new Date().toISOString().slice(0, 10), rank = { 'Foundation Partner': 0, 'Impact Partner': 1, 'Community Partner': 2 };
    var current = (list || []).filter(function (p) {
      return p && p.approved === true && p.name && p.start && p.end && p.start <= today && today <= p.end;
    }).sort(function (a, b) { return ((rank[a.tier] ?? 3) - (rank[b.tier] ?? 3)) || a.name.localeCompare(b.name); });
    dir.replaceChildren();
    current.forEach(function (p) {
      var li = document.createElement('li');
      var mark;
      if (p.logo) {
        mark = document.createElement('img');
        mark.src = (root || '') + p.logo; mark.alt = p.name + ' logo'; mark.loading = 'lazy';
      } else {
        mark = document.createElement('span'); mark.className = 'partner-name'; mark.setAttribute('aria-hidden', 'true');
        mark.textContent = p.name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 3).toUpperCase();
      }
      var body = document.createElement('div');
      var h = document.createElement('h3'); h.textContent = p.name;
      var tier = document.createElement('p'); tier.className = 'tier'; tier.textContent = p.tier || 'Corporate Partner';
      var since = document.createElement('p');
      since.textContent = 'Partner since ' + new Date(p.start + 'T12:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) + '.';
      body.append(h, tier, since);
      if (p.website && /^https:\/\//.test(p.website)) {
        var a = document.createElement('a'); a.href = p.website; a.textContent = 'Visit ' + p.name + ' (external site)';
        since.append(' '); since.append(a);
      }
      li.append(mark, body); dir.append(li);
    });
    dir.hidden = current.length === 0;
    if (empty) empty.hidden = current.length > 0;
    return current.length;
  }
  var dirEl = document.querySelector('[data-partner-directory]');
  if (dirEl) {
    fetch(dirEl.dataset.partnerDirectory, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : { partners: [] }; })
      .then(function (data) { renderPartners(data.partners, dirEl.dataset.root); })
      .catch(function () {});
  }
  window.CDLF = { renderPartners: renderPartners };   // lets the directory be previewed or tested with sample data

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
      if (field.validity.valueMissing) return field.type === 'checkbox' ? 'Please tick this box so we can reply to you.' : field.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.';
      if (field.validity.typeMismatch) return 'Enter an email address like name@example.com.';
      return '';
    }
    var fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.type === 'checkbox') fieldError(f, message(f)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) {
        var m = message(f); fieldError(f, m);
        if (m && !firstBad) firstBad = f;
      });
      if (firstBad) { status.textContent = 'Please check the highlighted fields.'; firstBad.focus(); return; }
      var v = function (name) { var el = form.elements[name]; return el ? el.value.trim() : ''; };
      // Subject: the form's own subject, plus the topic or business name when the form has one.
      var subject = form.dataset.subject + (v('topic') ? ': ' + v('topic') : '') + (v('business') ? ' from ' + v('business') : '');
      // Body: every filled-in field as "Label: value", with the message last.
      var lines = [];
      fields.forEach(function (f) {
        if (f.type === 'checkbox' || f.name === 'message' || f.name === 'topic' || !f.value.trim()) return;
        var lab = form.querySelector('label[for="' + f.id + '"]');
        lines.push((lab ? lab.textContent.replace(/\(optional\)/, '').trim() : f.name) + ': ' + f.value.trim());
      });
      var body = lines.concat(['', v('message')]).join('\n');
      status.textContent = 'Your email app should now open with your message ready to send. If it does not, email us at ' + form.dataset.mailto + '.';
      window.location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });
})();
