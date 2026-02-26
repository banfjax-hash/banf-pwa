// ========== BANF API Service ==========
const API = (() => {
  const BASE_URLS = [
    'https://www.jaxbengali.org/_functions',
    'https://banfwix.wixsite.com/banf1/_functions'
  ];

  let activeBase = BASE_URLS[0];

  async function request(endpoint, options = {}) {
    const url = `${activeBase}${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      // Try fallback URL
      if (activeBase === BASE_URLS[0] && BASE_URLS[1]) {
        activeBase = BASE_URLS[1];
        return request(endpoint, options);
      }
      throw err;
    }
  }

  function get(endpoint) { return request(endpoint); }
  function post(endpoint, body) {
    return request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  return {
    // Events
    getEvents: () => get('/getEvents'),
    getEventById: (id) => get(`/getEvent?id=${id}`),
    registerForEvent: (eventId, data) => post('/registerForEvent', { eventId, ...data }),

    // Sponsors
    getSponsors: () => get('/getSponsors'),

    // Radio
    getRadioSchedule: () => get('/getRadioSchedule'),
    getNowPlaying: () => get('/getNowPlaying'),
    requestSong: (data) => post('/requestSong', data),

    // Magazine
    getMagazines: () => get('/getMagazines'),
    getLatestMagazine: () => get('/getLatestMagazine'),

    // Members
    login: (email, password) => post('/login', { email, password }),
    signup: (data) => post('/signup', data),
    getMemberProfile: (token) => get(`/getMemberProfile?token=${token}`),

    // General
    getAnnouncements: () => get('/getAnnouncements'),
    getGalleryPhotos: () => get('/getGalleryPhotos'),
    submitContactForm: (data) => post('/submitContactForm', data),
    healthCheck: () => get('/healthCheck')
  };
})();

// ========== Auth Storage ==========
const Auth = (() => {
  const KEY = 'banf_auth';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  function isLoggedIn() {
    return !!get()?.token;
  }

  function getMember() {
    return get()?.member || null;
  }

  return { get, save, clear, isLoggedIn, getMember };
})();
