(function() {
  var KEY = 'ngpm-theme';
  var root = document.documentElement;

  function applyTheme(theme) {
    var dark = theme === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.querySelectorAll('.btn-theme-toggle').forEach(function(btn) {
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('title', dark ? '切换浅色主题' : '切换深色科技主题');
      var icon = btn.querySelector('.material-symbols-rounded');
      if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
    });
    window.dispatchEvent(new CustomEvent('ngpm-theme-change', { detail: { theme: dark ? 'dark' : 'light' } }));
  }

  function getInitialTheme() {
    try {
      return localStorage.getItem(KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }

  window.toggleNgpmTheme = function() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    applyTheme(next);
  };

  applyTheme(getInitialTheme());
  document.addEventListener('DOMContentLoaded', function() { applyTheme(getInitialTheme()); });
})();
