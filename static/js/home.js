// ── Ink Reveal Canvas ──
(function () {
    var hero = document.getElementById('hero');
    var canvas = document.getElementById('heroMask');
    if (!hero || !canvas) return;

    var canHover = window.matchMedia('(hover: hover)').matches;
    if (!canHover) { canvas.style.display = 'none'; return; }

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var maskRGB = '6, 6, 6';

    function syncMask() {
        var raw = getComputedStyle(document.documentElement).getPropertyValue('--mask-color').trim();
        var tmp = document.createElement('div');
        tmp.style.color = raw;
        document.body.appendChild(tmp);
        var computed = getComputedStyle(tmp).color;
        document.body.removeChild(tmp);
        var m = computed.match(/\d+/g);
        if (m) maskRGB = m.slice(0, 3).join(', ');
    }
    syncMask();

    var R_START = 6, R_END = 120, R_VARY = 0.5, LIFETIME = 600;
    var STAMP_STEP = 10, MAX_STAMPS = 200;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;

    function getIsDark() {
        return document.documentElement.getAttribute('data-theme') !== 'light';
    }
    var isDark = getIsDark();
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stars = [];

    function generateStars() {
        stars = [];
        var count = Math.min(120, Math.max(40, Math.floor(w * h / 12000)));
        for (var i = 0; i < count; i++) {
            var r = Math.random() * 1.2 + 0.3;
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: r,
                phase: Math.random() * Math.PI * 2,
                speed: 2 + Math.random() * 4,
                baseAlpha: 0.3 + Math.random() * 0.5,
                flare: Math.random() < 0.15 && r > 1.0,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15
            });
        }
    }

    function drawStars(now) {
        var t = now / 1000;
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x += w; else if (s.x > w) s.x -= w;
            if (s.y < 0) s.y += h; else if (s.y > h) s.y -= h;
            var twinkle = reducedMotion ? 1 : (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
            var alpha = s.baseAlpha * (0.2 + 0.8 * twinkle);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            if (s.flare) {
                ctx.strokeStyle = 'rgba(255, 255, 255, ' + (alpha * 0.4) + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(s.x - s.r * 3, s.y);
                ctx.lineTo(s.x + s.r * 3, s.y);
                ctx.moveTo(s.x, s.y - s.r * 3);
                ctx.lineTo(s.x, s.y + s.r * 3);
                ctx.stroke();
            }
        }
    }

    function drawDayScene(now) {
        var t = now / 1000;

        // 1. 天空渐变
        var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(0.6, '#B0E0E6');
        skyGrad.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. 太阳位置根据当前时间（7:00-19:00 白天时段；夜间映射到白天）
        var d = new Date();
        var timeOfDay = d.getHours() + d.getMinutes() / 60;
        var dayProgress;
        if (timeOfDay >= 7 && timeOfDay <= 19) {
            dayProgress = (timeOfDay - 7) / 12;
        } else {
            dayProgress = ((timeOfDay - 19 + 24) % 24) / 12;
        }
        var sunX = w * (0.1 + dayProgress * 0.8);
        var sunY = h * 0.5 - Math.sin(dayProgress * Math.PI) * h * 0.35;
        var sunR = Math.min(w, h) * 0.05;
        var pulse = reducedMotion ? 1 : (0.85 + 0.15 * Math.sin(t * 1.5));
        var haloR = sunR * 6 * pulse;
        var haloGrad = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, haloR);
        haloGrad.addColorStop(0, 'rgba(255, 240, 200, 0.5)');
        haloGrad.addColorStop(0.3, 'rgba(255, 230, 180, 0.2)');
        haloGrad.addColorStop(1, 'rgba(255, 230, 180, 0)');
        ctx.fillStyle = haloGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255, 250, 220, 0.95)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
    }

    function resize() {
        syncMask();
        isDark = getIsDark();
        var rect = hero.getBoundingClientRect();
        w = rect.width; h = rect.height;
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgb(' + maskRGB + ')';
        ctx.fillRect(0, 0, w, h);
        generateStars();
    }
    resize();
    requestAnimationFrame(loop);
    window.addEventListener('resize', resize);

    var stamps = [];
    var lastX = null, lastY = null;

    function addStamp(x, y) {
        if (stamps.length >= MAX_STAMPS) stamps.shift();
        stamps.push({ x: x, y: y, born: performance.now(), seed: Math.random() * Math.PI * 2, rmax: R_END * (1 - R_VARY + Math.random() * R_VARY) });
    }

    function stampAlong(x, y) {
        if (lastX === null) { addStamp(x, y); }
        else {
            var dx = x - lastX, dy = y - lastY;
            var dist = Math.hypot(dx, dy);
            var steps = Math.max(1, Math.ceil(dist / STAMP_STEP));
            for (var i = 1; i <= steps; i++) { addStamp(lastX + (dx * i) / steps, lastY + (dy * i) / steps); }
        }
        lastX = x; lastY = y;
    }

    function carveInk(x, y, r, alpha, seed) {
        var g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
        g.addColorStop(0, 'rgba(0,0,0,' + (0.95 * alpha) + ')');
        g.addColorStop(0.5, 'rgba(0,0,0,' + (0.85 * alpha) + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        var segs = 32;
        for (var i = 0; i <= segs; i++) {
            var a = (i / segs) * Math.PI * 2;
            var wobble = 0.75 + 0.15 * Math.sin(a * 3 + seed) + 0.08 * Math.sin(a * 7 + seed * 2.1) + 0.04 * Math.sin(a * 13 + seed * 0.7);
            var rr = r * wobble;
            var px = x + Math.cos(a) * rr;
            var py = y + Math.sin(a) * rr;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    function loop() {
        var now = performance.now();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgb(' + maskRGB + ')';
        ctx.fillRect(0, 0, w, h);
        if (isDark) drawStars(now);
        else drawDayScene(now);
        ctx.globalCompositeOperation = 'destination-out';
        for (var i = stamps.length - 1; i >= 0; i--) {
            var t = (now - stamps[i].born) / LIFETIME;
            if (t >= 1) { stamps.splice(i, 1); continue; }
            var ease = 1 - Math.pow(1 - t, 3);
            var r = R_START + (stamps[i].rmax - R_START) * ease;
            var alpha = 1 - t * t;
            carveInk(stamps[i].x, stamps[i].y, r, alpha, stamps[i].seed);
        }
        requestAnimationFrame(loop);
    }
    hero.addEventListener('mouseenter', function (e) {
        var rect = hero.getBoundingClientRect();
        lastX = e.clientX - rect.left; lastY = e.clientY - rect.top;
        stampAlong(lastX, lastY);
    });
    hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        stampAlong(e.clientX - rect.left, e.clientY - rect.top);
    });
    hero.addEventListener('mouseleave', function () { lastX = null; lastY = null; });

    var observer = new MutationObserver(function () { syncMask(); isDark = getIsDark(); resize(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

// ── Mouse Parallax ──
(function () {
    var hero = document.getElementById('hero');
    var heroBg = document.getElementById('heroBg');
    if (!hero || !heroBg) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var STRENGTH = 25;
    var targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function parallaxLoop() {
        currentX = lerp(currentX, targetX, 0.08);
        currentY = lerp(currentY, targetY, 0.08);
        heroBg.style.transform = 'translate(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px)';
        var dx = Math.abs(targetX - currentX), dy = Math.abs(targetY - currentY);
        if (dx > 0.05 || dy > 0.05) { rafId = requestAnimationFrame(parallaxLoop); }
        else { heroBg.style.transform = 'translate(' + targetX.toFixed(2) + 'px, ' + targetY.toFixed(2) + 'px)'; rafId = null; }
    }
    function startParallax() { if (!rafId) rafId = requestAnimationFrame(parallaxLoop); }

    hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width * 2 - 1;
        var ny = (e.clientY - rect.top) / rect.height * 2 - 1;
        targetX = -nx * STRENGTH; targetY = -ny * STRENGTH;
        startParallax();
    });
    hero.addEventListener('mouseleave', function () { targetX = 0; targetY = 0; startParallax(); });
})();

// ── i18n & Theme ──
(function () {
    var cfgEl = document.getElementById('dycn-config');
    var cfg = cfgEl ? JSON.parse(cfgEl.getAttribute('data-config') || '{}') : {};
    var i18n = cfg.i18n || { en: {}, zh: {} };
    var currentLang = localStorage.getItem('dycn-lang') || cfg.defaultLang || 'en';
    var currentTheme = localStorage.getItem('dycn-theme') || cfg.defaultTheme || 'dark';

    function applyLang(lang) {
        var rawDict = i18n[lang] || {};
        var dict = {};
        Object.keys(rawDict).forEach(function (k) { dict[k.toLowerCase()] = rawDict[k]; });
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n').toLowerCase();
            if (dict[key]) el.innerHTML = dict[key].replace(/\n/g, '<br>');
        });
        var sig = document.getElementById('signature');
        if (sig && dict.signature) sig.innerHTML = dict.signature.replace(/\n/g, '<br>');
        var langBtn = document.getElementById('langToggle');
        if (langBtn) langBtn.textContent = lang === 'zh' ? '中' : 'EN';
        document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
        currentLang = lang;
        localStorage.setItem('dycn-lang', lang);
    }

    function applyTheme(theme) {
        var isDark = theme === 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        var btn = document.getElementById('themeToggle');
        if (btn) btn.innerHTML = isDark ? '<i class="bi bi-moon-stars"></i>' : '<i class="bi bi-sun"></i>';
        currentTheme = theme;
        localStorage.setItem('dycn-theme', theme);
    }

    var langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.addEventListener('click', function () { applyLang(currentLang === 'en' ? 'zh' : 'en'); });
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', function () { applyTheme(currentTheme === 'dark' ? 'light' : 'dark'); });

    applyLang(currentLang);
    applyTheme(currentTheme);

    // ── Populate Contact Items ──
    var contactItems = document.getElementById('contactItems');
    var contacts = cfg.contacts || [];
    if (contactItems && contacts.length) {
        contacts.forEach(function (c) {
            var div = document.createElement('div');
            var colorClass = '';
            var iconColor = '';
            if (c.label === 'WeChat') { colorClass = ' contact-item--wechat'; iconColor = ' style="color: #07c160"'; }
            else if (c.label === 'Email') iconColor = ' style="color: #EA4335"';
            else if (c.label === 'Twitter') iconColor = ' style="color: #1DA1F2"';
            else if (c.label === 'Telegram') iconColor = ' style="color: #00BCD4"';
            else if (c.label === 'YouTube') iconColor = ' style="color: #FF0000"';
            else if (c.label === 'TikTok') iconColor = ' class="tiktok-icon"';
            else if (c.label === 'Instagram') iconColor = ' style="color: #E4405F"';
            else if (c.label === 'QQ') iconColor = ' style="color: #12B7F5"';
            div.className = 'contact-item' + colorClass;
            var valueColor = c.label === 'WeChat' ? ' style="color: #07c160"' : '';
            div.innerHTML = '<i class="bi ' + c.icon + '"' + iconColor + '></i><span>' + c.label + ': </span><span' + valueColor + '>' + c.value + '</span>';
            if (c.label === 'WeChat') {
                div.title = 'Click to view QR code';
                div.addEventListener('click', function () { showWechatQR(); });
            }
            contactItems.appendChild(div);
        });
    }

    // ── WeChat QR Modal ──
    function showWechatQR() {
        var modal = document.getElementById('wechatModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'wechatModal';
            modal.className = 'wechat-modal';
            modal.innerHTML = '<div class="wechat-modal__overlay"></div><div class="wechat-modal__content"><button class="wechat-modal__close"><i class="bi bi-x-lg"></i></button><img src="/img/wechat.png" alt="WeChat QR Code"></div>';
            document.body.appendChild(modal);
            modal.querySelector('.wechat-modal__overlay').addEventListener('click', closeWechatQR);
            modal.querySelector('.wechat-modal__close').addEventListener('click', closeWechatQR);
        }
        modal.classList.add('show');
    }
    function closeWechatQR() {
        var modal = document.getElementById('wechatModal');
        if (modal) modal.classList.remove('show');
    }

    // ── Blog & About Interactions ──
    var blogLink = document.getElementById('blogLink');
    var blogSection = document.getElementById('blogSection');
    if (blogLink && blogSection) {
        blogLink.addEventListener('click', function (e) { e.preventDefault(); blogSection.scrollIntoView({ behavior: 'smooth' }); });
    }

    var aboutLink = document.getElementById('aboutLink');
    var aboutPanel = document.getElementById('aboutPanel');
    var aboutClose = document.getElementById('aboutClose');
    var aboutOverlay = document.getElementById('aboutOverlay');

    function openAbout() { if (aboutPanel) aboutPanel.classList.add('open'); if (aboutOverlay) aboutOverlay.classList.add('show'); }
    function closeAbout() { if (aboutPanel) aboutPanel.classList.remove('open'); if (aboutOverlay) aboutOverlay.classList.remove('show'); }

    if (aboutLink) aboutLink.addEventListener('click', function (e) { e.preventDefault(); openAbout(); });
    if (aboutClose) aboutClose.addEventListener('click', closeAbout);
    if (aboutOverlay) aboutOverlay.addEventListener('click', closeAbout);

    // ── Contact Popup ──
    var contactLink = document.getElementById('contactLink');
    var contactPopup = document.getElementById('contactPopup');

    function positionContactPopup() {
        if (!contactLink || !contactPopup) return;
        var rect = contactLink.getBoundingClientRect();
        contactPopup.style.position = 'fixed';
        contactPopup.style.top = (rect.bottom + 10) + 'px';
        contactPopup.style.left = (rect.left + rect.width / 2) + 'px';
        contactPopup.style.transform = 'translateX(-50%)';
    }

    function openContact() {
        positionContactPopup();
        if (contactPopup) contactPopup.classList.add('show');
    }
    function closeContact() {
        if (contactPopup) contactPopup.classList.remove('show');
    }

    if (contactLink) contactLink.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (contactPopup.classList.contains('show')) {
            closeContact();
        } else {
            openContact();
        }
    });

    document.addEventListener('click', function (e) {
        if (contactPopup && !contactPopup.contains(e.target) && !contactLink.contains(e.target)) {
            closeContact();
        }
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAbout(); closeContact(); } });

    // ── Tag Filter + Pagination ──
    var tagFilter = document.getElementById('tagFilter');
    var blogItems = document.querySelectorAll('.blog-item');
    var pagination = document.getElementById('pagination');
    var pageSize = (cfg && cfg.pageSize) || 5;
    var currentPage = 1;

    function getFilteredItems(tag) {
        var result = [];
        blogItems.forEach(function (item) {
            if (tag === '*') {
                result.push(item);
            } else {
                var tags = (item.getAttribute('data-tags') || '').split(',').map(function (t) { return t.trim(); });
                if (tags.indexOf(tag.trim()) !== -1) result.push(item);
            }
        });
        return result;
    }

    function renderPage(tag, page) {
        var filtered = getFilteredItems(tag);
        var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (page > totalPages) page = totalPages;
        if (page < 1) page = 1;
        currentPage = page;

        var start = (page - 1) * pageSize;
        var end = start + pageSize;

        blogItems.forEach(function (item) { item.classList.add('hidden'); });
        filtered.slice(start, end).forEach(function (item) { item.classList.remove('hidden'); });

        if (pagination) {
            pagination.innerHTML = '';
            if (totalPages <= 1) return;

            var prevBtn = document.createElement('button');
            prevBtn.className = 'pagination__btn';
            prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
            prevBtn.disabled = (page === 1);
            prevBtn.addEventListener('click', function () { renderPage(tag, page - 1); });
            pagination.appendChild(prevBtn);

            for (var i = 1; i <= totalPages; i++) {
                var btn = document.createElement('button');
                btn.className = 'pagination__btn' + (i === page ? ' active' : '');
                btn.textContent = i;
                (function (p) {
                    btn.addEventListener('click', function () { renderPage(tag, p); });
                })(i);
                pagination.appendChild(btn);
            }

            var nextBtn = document.createElement('button');
            nextBtn.className = 'pagination__btn';
            nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
            nextBtn.disabled = (page === totalPages);
            nextBtn.addEventListener('click', function () { renderPage(tag, page + 1); });
            pagination.appendChild(nextBtn);
        }
    }

    if (tagFilter && blogItems.length) {
        tagFilter.addEventListener('click', function (e) {
            if (!e.target.classList.contains('tag-filter__btn')) return;
            var tag = e.target.getAttribute('data-tag');
            tagFilter.querySelectorAll('.tag-filter__btn').forEach(function (btn) {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            renderPage(tag, 1);
        });
        renderPage('*', 1);
    }
})();
