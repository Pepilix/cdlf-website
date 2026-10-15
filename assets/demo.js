/* CDLF trustee and partner area: DEMONSTRATION ONLY.
   There is no real login, server or database. Everything is kept in the visitor's own browser (localStorage),
   so each person who tries the demo starts fresh and nothing is ever sent anywhere.
   The planned real version (Decap CMS with email logins) is described in LAUNCH.md, section 7.
   To remove the demo: delete /login/, /trustees/, /partners/, /news/, this file, the "Trustee and partner login"
   footer links, and the "Demo figures" block in assets/site.js. */
(function () {
  var KEYS = { session: 'cdlf-demo-session', posts: 'cdlf-demo-posts', figures: 'cdlf-demo-figures' };
  // The published figures, used as the starting values in the figures form.
  var PUBLISHED = { given: 155688, period: '2026', grants: 28, charities: 6, boards: 172, amalYear: '2025', amalMiles: 20176 };
  var MAX_WORDS = 1000, MAX_PHOTOS = 6;

  function load(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }   // may throw when storage is full
  function remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'text') n.textContent = attrs[k]; else if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { if (c) n.append(c); });
    return n;
  }
  function words(text) { return (text || '').trim().split(/\s+/).filter(Boolean).length; }
  function fmt(n) { return Number(n).toLocaleString('en-GB'); }
  function dateText(iso) { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  var page = document.body.dataset.demoPage;

  /* ---------- Login ---------- */
  if (page === 'login') {
    var form = document.querySelector('form[data-demo-login]');
    var params = new URLSearchParams(location.search);
    if (params.get('role') === 'partner') form.querySelector('input[value=partner]').checked = true;
    function syncRole() {
      var partner = form.querySelector('input[name=role]:checked').value === 'partner';
      form.querySelector('#demo-email').value = partner ? 'partner@example.com' : 'trustee@cdlf.uk';
    }
    form.addEventListener('change', syncRole); syncRole();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var partner = form.querySelector('input[name=role]:checked').value === 'partner';
      try { save(KEYS.session, { role: partner ? 'partner' : 'trustee', name: partner ? 'Example Business Ltd' : 'Demo trustee', at: new Date().toISOString() }); }
      catch (err) { form.querySelector('.form-msg').textContent = 'Your browser is blocking storage, so the demo can’t sign you in. Try a normal (not private) window.'; return; }
      location.href = partner ? '../partners/' : '../trustees/';
    });
    return;
  }

  /* ---------- Signed-in pages: send people to the login page if they haven't "signed in" ---------- */
  var session = load(KEYS.session, null);
  if ((page === 'trustees' || page === 'partners') && (!session || session.role !== page.replace(/s$/, ''))) {
    location.replace('../login/' + (page === 'partners' ? '?role=partner' : ''));
    return;
  }
  document.querySelectorAll('[data-demo-name]').forEach(function (n) { if (session) n.textContent = session.name; });
  document.querySelectorAll('[data-demo-signout]').forEach(function (b) {
    b.addEventListener('click', function () { remove(KEYS.session); location.href = '../login/'; });
  });

  /* ---------- Posts: shared by the trustee area and the public News page ---------- */
  function renderPost(p, opts) {
    var text = el('div', { class: 'post-text' }, p.text.split(/\n{2,}/).map(function (para) { return el('p', { text: para.trim() }); }));
    var photos = null;
    if (p.photos && p.photos.length) {
      photos = el('div', { class: 'post-photos', 'data-count': String(p.photos.length) }, p.photos.map(function (ph) { return el('img', { src: ph.src, alt: ph.alt || '', loading: 'lazy' }); }));
    }
    var meta = el('div', { class: 'post-meta' }, [
      el('span', { class: 'avatar', 'aria-hidden': 'true' }, [el('img', { src: '../assets/logo-lettering-400.webp', alt: '' })]),
      el('span', { text: 'Charlie Dallas Lancaster Foundation · ' + dateText(p.date) })
    ]);
    var art = el('article', { class: 'post', id: 'post-' + p.id }, [meta, el(opts.headingTag || 'h2', { text: p.title }), text, photos]);
    if (opts.actions) art.append(opts.actions(p));
    return art;
  }

  if (page === 'news') {
    var list = document.querySelector('[data-news-list]'), posts = load(KEYS.posts, []);
    if (posts.length) {
      document.querySelector('[data-news-empty]').hidden = true;
      posts.forEach(function (p) { list.append(renderPost(p, { headingTag: 'h2' })); });
      if (location.hash) { var t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
    }
    return;
  }

  /* ---------- Trustee area ---------- */
  if (page === 'trustees') {
    // Post composer
    var c = document.querySelector('form[data-composer]'), title = c.querySelector('#post-title'), body = c.querySelector('#post-text');
    var fileInput = c.querySelector('#post-photos'), grid = c.querySelector('.photo-grid'), count = c.querySelector('.count'), msg = c.querySelector('.form-msg');
    var photos = [];   // { src, alt }

    function updateCount() {
      var n = words(body.value);
      count.textContent = fmt(n) + ' / ' + fmt(MAX_WORDS) + ' words';
      count.classList.toggle('over', n > MAX_WORDS);
    }
    function drawPhotos() {
      grid.replaceChildren();
      photos.forEach(function (ph, i) {
        var alt = el('input', { type: 'text', 'aria-label': 'Describe photo ' + (i + 1) + ' for people who can’t see it', placeholder: 'Describe this photo' });
        alt.value = ph.alt; alt.addEventListener('input', function () { ph.alt = alt.value; });
        var del = el('button', { type: 'button', 'aria-label': 'Remove photo ' + (i + 1), text: '×' });
        del.addEventListener('click', function () { photos.splice(i, 1); drawPhotos(); });
        grid.append(el('div', { class: 'photo-item' }, [el('div', { class: 'thumb' }, [el('img', { src: ph.src, alt: '' }), del]), alt]));
      });
      c.querySelector('[data-photo-count]').textContent = photos.length ? photos.length + ' of ' + MAX_PHOTOS + ' photos' : '';
    }
    // Photos are shrunk in the browser (longest side 1000px) so the demo fits in browser storage.
    function shrink(file) {
      return new Promise(function (resolve, reject) {
        var img = new Image(), url = URL.createObjectURL(file);
        img.onload = function () {
          var s = Math.min(1, 1000 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
          cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          URL.revokeObjectURL(url); resolve(cv.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Not an image')); };
        img.src = url;
      });
    }
    fileInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fileInput.files), room = MAX_PHOTOS - photos.length;
      msg.className = 'form-msg'; msg.textContent = '';
      if (files.length > room) { msg.className = 'form-msg err'; msg.textContent = 'You can add up to ' + MAX_PHOTOS + ' photos. Only the first ' + room + ' were added.'; }
      Promise.all(files.slice(0, Math.max(room, 0)).map(function (f) { return shrink(f).then(function (src) { return { src: src, alt: '' }; }, function () { return null; }); }))
        .then(function (added) { photos = photos.concat(added.filter(Boolean)); drawPhotos(); fileInput.value = ''; });
    });
    body.addEventListener('input', updateCount); updateCount();

    function drawFeed() {
      var feed = document.querySelector('[data-feed]'), posts = load(KEYS.posts, []);
      feed.replaceChildren();
      document.querySelector('[data-feed-empty]').hidden = posts.length > 0;
      posts.forEach(function (p) {
        feed.append(renderPost(p, { headingTag: 'h3', actions: function (post) {
          var view = el('a', { class: 'btn btn-quiet', href: '../news/#post-' + post.id, text: 'View on the website' });
          var del = el('button', { class: 'btn btn-quiet', type: 'button', text: 'Delete post' });
          del.addEventListener('click', function () { save(KEYS.posts, load(KEYS.posts, []).filter(function (x) { return x.id !== post.id; })); drawFeed(); });
          return el('div', { class: 'post-actions' }, [view, del]);
        } }));
      });
    }
    c.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = body.value.trim(), n = words(text);
      msg.className = 'form-msg err';
      if (!text) { msg.textContent = 'Write something before publishing.'; body.focus(); return; }
      if (n > MAX_WORDS) { msg.textContent = 'This post is ' + fmt(n) + ' words. Please keep it to ' + fmt(MAX_WORDS) + ' or fewer.'; body.focus(); return; }
      var missingAlt = photos.findIndex(function (ph) { return !ph.alt.trim(); });
      if (missingAlt > -1) { msg.textContent = 'Please describe photo ' + (missingAlt + 1) + ' so people using screen readers know what it shows.'; grid.querySelectorAll('.photo-item input')[missingAlt].focus(); return; }
      var headline = title.value.trim() || text.split(/[.!?\n]/)[0].slice(0, 90);
      var post = { id: Date.now().toString(36), title: headline, text: text, photos: photos.slice(), date: new Date().toISOString() };
      var posts = load(KEYS.posts, []);
      try { save(KEYS.posts, [post].concat(posts)); }
      catch (err) { msg.textContent = 'Your browser’s demo storage is full. Try fewer or smaller photos, or delete an earlier demo post.'; return; }
      c.reset(); photos = []; drawPhotos(); updateCount();
      msg.className = 'form-msg ok'; msg.textContent = 'Published. It’s now on the News page (in this browser only, as this is a demo).';
      drawFeed();
    });
    drawFeed();

    // Figures form
    var ff = document.querySelector('form[data-figures]'), fmsg = ff.querySelector('.form-msg');
    var current = Object.assign({}, PUBLISHED, load(KEYS.figures, {}));
    Object.keys(PUBLISHED).forEach(function (k) { var i = ff.elements[k]; if (i) i.value = current[k]; });
    function showUpdated() {
      var saved = load(KEYS.figures, null);
      document.querySelector('[data-figures-updated]').textContent = saved && saved.updated ? 'Last updated ' + dateText(saved.updated) + ' (demo).' : 'Showing the published figures.';
    }
    showUpdated();
    ff.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = {}, bad = null;
      Object.keys(PUBLISHED).forEach(function (k) {
        var i = ff.elements[k]; if (!i) return;
        var v = i.value.replace(/[£,\s]/g, '');
        var ok = /year|period/i.test(k) ? /^20\d\d$/.test(v) : /^\d+$/.test(v);
        i.toggleAttribute('aria-invalid', !ok);
        if (!ok && !bad) bad = i;
        out[k] = /year|period/i.test(k) ? v : parseInt(v, 10);
      });
      if (bad) { fmsg.className = 'form-msg err'; fmsg.textContent = 'Please check the highlighted figure. Use whole numbers, and a four-digit year.'; bad.focus(); return; }
      out.updated = new Date().toISOString();
      try { save(KEYS.figures, out); } catch (err) { fmsg.className = 'form-msg err'; fmsg.textContent = 'Your browser is blocking storage, so the demo can’t save.'; return; }
      fmsg.className = 'form-msg ok'; fmsg.textContent = 'Saved. The new figures now show on Home, Our impact, Corporate partnerships and A Mile a Life, in this browser only.';
      showUpdated();
    });
    ff.querySelector('[data-figures-reset]').addEventListener('click', function () {
      remove(KEYS.figures);
      Object.keys(PUBLISHED).forEach(function (k) { var i = ff.elements[k]; if (i) { i.value = PUBLISHED[k]; i.removeAttribute('aria-invalid'); } });
      fmsg.className = 'form-msg ok'; fmsg.textContent = 'Back to the published figures.'; showUpdated();
    });
    return;
  }

  /* ---------- Partner area ---------- */
  if (page === 'partners') {
    var figs = Object.assign({}, PUBLISHED, load(KEYS.figures, {}));
    document.querySelectorAll('[data-partner-figure]').forEach(function (n) {
      var k = n.dataset.partnerFigure;
      n.textContent = k === 'given' ? '£' + fmt(figs.given) : k === 'period' ? figs.period : fmt(figs[k]);
    });
    // Draft partner badge, drawn from the real logo artwork, offered as a PNG download.
    var cv = document.querySelector('canvas[data-badge]'), dl = document.querySelector('[data-badge-download]');
    if (cv) {
      var S = 600, g = cv.getContext('2d'), art = new Image();
      cv.width = S; cv.height = S;
      art.onload = function () {
        g.fillStyle = '#FFFDF8'; g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#FFB224'; g.beginPath(); g.arc(S * 0.47, S * 0.42, S * 0.31, 0, Math.PI * 2); g.fill();
        g.drawImage(art, S * 0.12, S * 0.07, S * 0.7, S * 0.7);
        g.fillStyle = '#15171C'; g.textAlign = 'center';
        g.font = '600 38px "Source Sans 3", "Segoe UI", sans-serif'; g.fillText((cv.dataset.badge || 'Community Partner').toUpperCase(), S / 2, S * 0.83);
        g.font = '400 30px "Source Sans 3", "Segoe UI", sans-serif'; g.fillText(cv.dataset.badgeYear || '', S / 2, S * 0.9);
        try { dl.href = cv.toDataURL('image/png'); dl.hidden = false; } catch (e) {}
      };
      art.src = '../assets/logo-lettering-700.webp';
    }
  }
})();
