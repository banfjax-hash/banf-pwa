// ========== BANF PWA - App Initialization ==========

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}

// Register all routes
Router.register('home', renderHome);
Router.register('events', renderEvents);
Router.register('event-detail', renderEventDetail);
Router.register('radio', renderRadio);
Router.register('magazine', renderMagazine);
Router.register('magazine-detail', renderMagazineDetail);
Router.register('more', renderMore);
Router.register('sponsors', renderSponsors);
Router.register('volunteers', renderVolunteers);
Router.register('login', renderLogin);
Router.register('settings', renderSettings);
Router.register('contact', renderContact);
Router.register('about', renderAbout);

// Initialize router
Router.init();

// ========== Install Prompt ==========
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install banner after 3 seconds if not already installed
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    setTimeout(() => {
      const banner = document.getElementById('install-banner');
      if (banner) banner.classList.remove('hidden');
    }, 3000);
  }
});

document.getElementById('install-accept')?.addEventListener('click', async () => {
  const banner = document.getElementById('install-banner');
  if (banner) banner.classList.add('hidden');

  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install prompt outcome:', outcome);
    deferredPrompt = null;
  }
});

document.getElementById('install-dismiss')?.addEventListener('click', () => {
  const banner = document.getElementById('install-banner');
  if (banner) banner.classList.add('hidden');
});

// ========== Push Notification Permission ==========
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
    }
  }
}

// Request after user interaction (delayed)
setTimeout(() => {
  if (Auth.isLoggedIn()) requestNotificationPermission();
}, 10000);
