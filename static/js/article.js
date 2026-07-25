// ── Article page: i18n & Theme ──
(function () {
    var cfgEl = document.getElementById('dycn-config');
    var cfg = cfgEl ? JSON.parse(cfgEl.getAttribute('data-config') || '{}') : {};
    var i18n = cfg.i18n || { en: {}, zh: {} };
    var currentLang = localStorage.getItem('dycn-lang') || cfg.defaultLang || 'en';
    var currentTheme = localStorage.getItem('dycn-theme') || cfg.defaultTheme || 'dark';

    function applyLang(lang) {
        var dict = i18n[lang] || {};
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
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
})();
