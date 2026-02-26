// ========== Client-side Router ==========
const Router = (() => {
  const routes = {};
  let currentRoute = null;

  function register(name, renderFn) {
    routes[name] = renderFn;
  }

  function navigate(route, params = {}) {
    const [name, ...rest] = route.split('/');
    const routeFn = routes[name];
    if (!routeFn) return;

    currentRoute = name;
    window.location.hash = route;

    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.route === name);
    });

    // Hide bottom nav on detail pages (only on mobile)
    const nav = document.getElementById('bottom-nav');
    const detailPages = ['event-detail', 'magazine-detail', 'sponsors', 'volunteers', 'login', 'settings', 'contact', 'about'];
    const isDetail = detailPages.includes(name);
    const isDesktop = window.innerWidth >= 1024;
    if (nav) {
      nav.style.display = (isDetail && !isDesktop) ? 'none' : '';
    }

    // Update page content padding for detail pages
    const content = document.getElementById('page-content');
    if (content) {
      content.style.paddingBottom = isDetail ? '24px' : '';
    }

    // Scroll to top
    document.getElementById('page-content')?.scrollTo(0, 0);

    // Toggle mini radio player visibility
    if (name === 'radio') {
      RadioPlayer.hideMiniPlayer();
    } else {
      RadioPlayer.showMiniPlayer();
    }

    // Render page
    const container = document.getElementById('page-content');
    container.innerHTML = '';
    routeFn(container, rest.join('/'), params);
  }

  function back() {
    window.history.back();
  }

  function init() {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      navigate(hash);
    });

    // Nav button clicks
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.route));
    });

    // Mini player click
    document.getElementById('mini-play-btn')?.addEventListener('click', () => RadioPlayer.toggle());
    document.getElementById('radio-mini')?.addEventListener('click', (e) => {
      if (e.target.closest('#mini-play-btn')) return;
      navigate('radio');
    });

    // Initial route
    const hash = window.location.hash.slice(1) || 'home';
    navigate(hash);
  }

  return { register, navigate, back, init, get current() { return currentRoute; } };
})();
