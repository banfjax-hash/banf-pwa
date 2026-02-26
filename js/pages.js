// ========== BANF PWA - All Page Renderers ==========

// ==================== HOME PAGE ====================
function renderHome(container) {
  container.innerHTML = `
    <div class="hero hero-green">
      <h1>Bengali Association of<br>North Florida</h1>
      <p>Connecting the Bengali community in Jacksonville</p>
    </div>

    <div class="quick-actions">
      <div class="quick-action" onclick="Router.navigate('events')">
        <div class="quick-action-icon" style="background:rgba(21,101,192,0.12);color:#1565C0"><span class="material-icons-round">event</span></div>
        <span>Events</span>
      </div>
      <div class="quick-action" onclick="Router.navigate('radio')">
        <div class="quick-action-icon" style="background:rgba(106,27,154,0.12);color:#6A1B9A"><span class="material-icons-round">radio</span></div>
        <span>Radio</span>
      </div>
      <div class="quick-action" onclick="Router.navigate('magazine')">
        <div class="quick-action-icon" style="background:rgba(230,81,0,0.12);color:#E65100"><span class="material-icons-round">menu_book</span></div>
        <span>Magazine</span>
      </div>
      <div class="quick-action" onclick="Router.navigate('more')">
        <div class="quick-action-icon" style="background:rgba(27,94,32,0.12);color:#1B5E20"><span class="material-icons-round">people</span></div>
        <span>Members</span>
      </div>
      <div class="quick-action" onclick="Router.navigate('volunteers')">
        <div class="quick-action-icon" style="background:rgba(198,40,40,0.12);color:#C62828"><span class="material-icons-round">favorite</span></div>
        <span>Volunteer</span>
      </div>
      <div class="quick-action" onclick="Router.navigate('contact')">
        <div class="quick-action-icon" style="background:rgba(0,105,92,0.12);color:#00695C"><span class="material-icons-round">card_giftcard</span></div>
        <span>Donate</span>
      </div>
    </div>

    <div id="home-announcements"></div>

    <div class="section-header mt-16">
      <h2>Upcoming Events</h2>
      <a href="#events" onclick="event.preventDefault();Router.navigate('events')">See All <span class="material-icons-round" style="font-size:14px">chevron_right</span></a>
    </div>
    <div id="home-events"><div class="loading"><div class="spinner"></div></div></div>

    <div id="home-sponsors"></div>
    <div style="height:24px"></div>
  `;

  // Load data
  loadHomeData();
}

async function loadHomeData() {
  try {
    const [eventsRes, sponsorsRes, announcementsRes] = await Promise.allSettled([
      API.getEvents(),
      API.getSponsors(),
      API.getAnnouncements()
    ]);

    // Events
    const eventsEl = document.getElementById('home-events');
    if (eventsEl) {
      const events = eventsRes.status === 'fulfilled' ? (eventsRes.value?.items || eventsRes.value || []) : [];
      if (events.length === 0) {
        eventsEl.innerHTML = '<div class="empty-state"><span class="material-icons-round">event</span><p>No upcoming events. Stay tuned!</p></div>';
      } else {
        eventsEl.innerHTML = events.slice(0, 3).map(e => eventCardHTML(e)).join('');
      }
    }

    // Sponsors
    const sponsorsEl = document.getElementById('home-sponsors');
    if (sponsorsEl) {
      const sponsors = sponsorsRes.status === 'fulfilled' ? (sponsorsRes.value?.items || sponsorsRes.value || []) : [];
      if (sponsors.length > 0) {
        sponsorsEl.innerHTML = `
          <h2 class="section-title mt-16">Our Sponsors</h2>
          <div class="sponsors-row">
            ${sponsors.slice(0, 8).map(s => `
              <div class="sponsor-badge">
                <div class="sponsor-avatar">${(s.name || '??').slice(0, 2).toUpperCase()}</div>
                <span>${s.name || ''}</span>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    // Announcements
    const annEl = document.getElementById('home-announcements');
    if (annEl) {
      const announcements = announcementsRes.status === 'fulfilled' ? (announcementsRes.value?.items || announcementsRes.value || []) : [];
      if (announcements.length > 0) {
        annEl.innerHTML = `
          <h2 class="section-title mt-16">Announcements</h2>
          <div class="announcements-row">
            ${announcements.map(a => `
              <div class="announcement-card">
                <div class="badge"><span class="material-icons-round" style="font-size:14px">campaign</span> ${(a.type || 'NOTICE').toUpperCase()}</div>
                <h4>${a.title || ''}</h4>
                ${a.message ? `<p>${a.message}</p>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
    }
  } catch (err) {
    const eventsEl = document.getElementById('home-events');
    if (eventsEl) eventsEl.innerHTML = '<div class="empty-state"><p>Unable to load data. Check your connection.</p></div>';
  }
}

function eventCardHTML(e) {
  const month = (e.date || '').slice(0, 3).toUpperCase() || 'TBD';
  const day = (e.date || '').split('-').pop()?.slice(0, 2) || '--';
  return `
    <div class="event-card" onclick="Router.navigate('event-detail/${e._id || e.id}')">
      <div class="event-date-badge">
        <span class="month">${month}</span>
        <span class="day">${day}</span>
      </div>
      <div class="event-info">
        <h3>${e.title || 'Untitled Event'}</h3>
        ${e.location ? `<div class="event-meta"><span class="material-icons-round">location_on</span>${e.location}</div>` : ''}
        ${e.time ? `<div class="event-meta"><span class="material-icons-round">schedule</span>${e.time}</div>` : ''}
      </div>
    </div>
  `;
}


// ==================== EVENTS PAGE ====================
let eventsCache = [];
let eventsFilter = 'all';

function renderEvents(container) {
  container.innerHTML = `
    <div class="search-bar">
      <span class="material-icons-round">search</span>
      <input type="text" id="events-search" placeholder="Search events...">
    </div>
    <div class="filter-chips">
      <button class="chip active" data-filter="all">All</button>
      <button class="chip" data-filter="upcoming">Upcoming</button>
      <button class="chip" data-filter="past">Past</button>
    </div>
    <div id="events-list"><div class="loading"><div class="spinner"></div></div></div>
  `;

  // Search handler
  document.getElementById('events-search')?.addEventListener('input', (e) => {
    filterAndRenderEvents(e.target.value);
  });

  // Filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      eventsFilter = chip.dataset.filter;
      filterAndRenderEvents(document.getElementById('events-search')?.value || '');
    });
  });

  loadEvents();
}

async function loadEvents() {
  try {
    const data = await API.getEvents();
    eventsCache = data?.items || data || [];
    filterAndRenderEvents('');
  } catch {
    document.getElementById('events-list').innerHTML = '<div class="empty-state"><span class="material-icons-round">event_busy</span><p>Failed to load events</p></div>';
  }
}

function filterAndRenderEvents(query) {
  const q = query.toLowerCase();
  let filtered = eventsCache.filter(e =>
    (e.title || '').toLowerCase().includes(q) ||
    (e.location || '').toLowerCase().includes(q) ||
    (e.description || '').toLowerCase().includes(q)
  );

  // Date filter - simplified
  if (eventsFilter === 'upcoming') {
    filtered = filtered.filter(e => new Date(e.date) >= new Date());
  } else if (eventsFilter === 'past') {
    filtered = filtered.filter(e => new Date(e.date) < new Date());
  }

  const el = document.getElementById('events-list');
  if (!el) return;

  if (filtered.length === 0) {
    el.innerHTML = '<div class="empty-state"><span class="material-icons-round">event_busy</span><p>No events found</p></div>';
  } else {
    el.innerHTML = filtered.map(e => `
      <div class="event-card" onclick="Router.navigate('event-detail/${e._id || e.id}')">
        <div class="event-date-badge">
          <span class="month">${(e.date || '').slice(0, 3).toUpperCase() || 'TBD'}</span>
          <span class="day">${(e.date || '').split('-').pop()?.slice(0, 2) || '--'}</span>
        </div>
        <div class="event-info">
          <h3>${e.title || ''}</h3>
          ${e.description ? `<p class="text-sm text-secondary" style="margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${e.description}</p>` : ''}
          <div style="display:flex;gap:14px;margin-top:6px;flex-wrap:wrap">
            ${e.date ? `<div class="event-meta"><span class="material-icons-round">calendar_month</span>${e.date}</div>` : ''}
            ${e.time ? `<div class="event-meta"><span class="material-icons-round">schedule</span>${e.time}</div>` : ''}
            ${e.location ? `<div class="event-meta"><span class="material-icons-round">location_on</span>${e.location}</div>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
}


// ==================== EVENT DETAIL PAGE ====================
function renderEventDetail(container, eventId) {
  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>Event Details</h2>
    </div>
    <div id="event-detail-body"><div class="loading"><div class="spinner"></div></div></div>
  `;

  const event = eventsCache.find(e => (e._id || e.id) === eventId);
  if (event) {
    renderEventDetailContent(event);
  } else {
    API.getEventById(eventId).then(e => renderEventDetailContent(e)).catch(() => {
      document.getElementById('event-detail-body').innerHTML = '<div class="empty-state"><p>Event not found</p></div>';
    });
  }
}

function renderEventDetailContent(e) {
  const body = document.getElementById('event-detail-body');
  if (!body) return;

  body.innerHTML = `
    <div style="margin:0 16px;height:180px;border-radius:16px;background:var(--green-bg);display:flex;align-items:center;justify-content:center">
      <span class="material-icons-round" style="font-size:64px;color:var(--green);opacity:0.3">event</span>
    </div>
    <h2 style="margin:16px 16px 0;font-size:22px">${e.title || ''}</h2>
    <div class="card" style="margin:12px 16px;background:var(--bg)">
      <div style="padding:16px">
        ${e.date ? `<div class="info-row"><span class="material-icons-round">calendar_month</span><div><div class="info-label">Date</div><div class="info-value">${e.date}</div></div></div>` : ''}
        ${e.time ? `<div class="info-row"><span class="material-icons-round">schedule</span><div><div class="info-label">Time</div><div class="info-value">${e.time}</div></div></div>` : ''}
        ${e.location ? `<div class="info-row"><span class="material-icons-round">location_on</span><div><div class="info-label">Location</div><div class="info-value">${e.location}</div></div></div>` : ''}
        ${e.type ? `<div class="info-row"><span class="material-icons-round">category</span><div><div class="info-label">Type</div><div class="info-value">${e.type}</div></div></div>` : ''}
      </div>
    </div>
    ${e.description ? `
      <h3 style="margin:16px 16px 8px;font-size:16px">About this Event</h3>
      <p style="margin:0 16px;color:var(--text-secondary);font-size:14px;line-height:1.6">${e.description}</p>
    ` : ''}
    <div style="padding:20px 16px">
      <button class="btn-primary" onclick="showRegisterDialog('${e._id || e.id}')">
        <span class="material-icons-round" style="font-size:20px">how_to_reg</span> Register for Event
      </button>
    </div>
  `;
}

function showRegisterDialog(eventId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <span class="material-icons-round" style="font-size:40px;color:var(--green);display:block;text-align:center">how_to_reg</span>
      <h3>Register for Event</h3>
      <p>Your registration will be submitted to the BANF team. You'll receive a confirmation email.</p>
      <div class="modal-actions">
        <button class="cancel" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="confirm" onclick="this.closest('.modal-overlay').remove()">Register</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}


// ==================== RADIO PAGE ====================
function renderRadio(container) {
  const isPlaying = RadioPlayer.isPlaying();

  container.innerHTML = `
    <div class="radio-hero">
      <div class="disc ${isPlaying ? 'spinning' : ''}" id="radio-disc"></div>
      <div class="now-playing-label">${isPlaying ? '<span class="live-dot"></span> NOW PLAYING' : 'RADIO'}</div>
      <h2 style="font-size:22px;margin-top:8px" id="radio-title">BANF Radio</h2>
      <p style="opacity:0.7;font-size:14px" id="radio-artist">Live Stream</p>
      <div class="radio-controls">
        <button class="radio-side-btn" onclick="showSongRequestDialog()">
          <span class="material-icons-round" style="font-size:18px">music_note</span> Request
        </button>
        <button class="play-btn" id="radio-play-btn" onclick="RadioPlayer.toggle()">
          <span class="material-icons-round">${isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
        <button class="radio-side-btn">
          <span class="material-icons-round" style="font-size:18px">volume_up</span> Volume
        </button>
      </div>
    </div>
    <h2 class="section-title">Schedule</h2>
    <div id="radio-schedule"><div class="loading"><div class="spinner"></div></div></div>
  `;

  // Update on state change
  RadioPlayer.setOnStateChange((playing) => {
    const btn = document.getElementById('radio-play-btn');
    const disc = document.getElementById('radio-disc');
    if (btn) btn.innerHTML = `<span class="material-icons-round">${playing ? 'pause' : 'play_arrow'}</span>`;
    if (disc) disc.classList.toggle('spinning', playing);
  });

  loadRadioSchedule();
  loadNowPlaying();
}

async function loadRadioSchedule() {
  try {
    const data = await API.getRadioSchedule();
    const items = data?.items || data || [];
    const el = document.getElementById('radio-schedule');
    if (!el) return;

    if (items.length === 0) {
      el.innerHTML = '<div class="empty-state"><span class="material-icons-round">event_note</span><p>No schedule available</p></div>';
    } else {
      el.innerHTML = items.map(s => `
        <div class="schedule-card">
          <div class="schedule-icon"><span class="material-icons-round">radio</span></div>
          <div class="schedule-info">
            <h4>${s.title || 'Show'}</h4>
            ${s.host ? `<p>Hosted by ${s.host}</p>` : ''}
          </div>
          <div class="schedule-time">
            ${s.day ? `<div class="day">${s.day}</div>` : ''}
            ${s.time ? `<div class="text-secondary text-xs">${s.time}</div>` : ''}
          </div>
        </div>
      `).join('');
    }
  } catch {
    const el = document.getElementById('radio-schedule');
    if (el) el.innerHTML = '<div class="empty-state"><p>Failed to load schedule</p></div>';
  }
}

async function loadNowPlaying() {
  try {
    const data = await API.getNowPlaying();
    if (data?.title) {
      const titleEl = document.getElementById('radio-title');
      const artistEl = document.getElementById('radio-artist');
      if (titleEl) titleEl.textContent = data.title;
      if (artistEl) artistEl.textContent = data.artist || 'Live Stream';
    }
  } catch { /* ignore */ }
}

function showSongRequestDialog() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <span class="material-icons-round" style="font-size:32px;color:#6A1B9A;display:block;text-align:center">music_note</span>
      <h3>Request a Song</h3>
      <div class="form-field"><label>Song Name *</label><input type="text" id="sr-song" placeholder="Enter song name"></div>
      <div class="form-field"><label>Artist (optional)</label><input type="text" id="sr-artist" placeholder="Artist name"></div>
      <div class="form-field"><label>Message (optional)</label><textarea id="sr-message" rows="2" placeholder="Dedication or message"></textarea></div>
      <div class="modal-actions">
        <button class="cancel" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="confirm" onclick="submitSongRequest()">Submit</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

async function submitSongRequest() {
  const song = document.getElementById('sr-song')?.value?.trim();
  if (!song) return;
  try {
    await API.requestSong({
      songName: song,
      artist: document.getElementById('sr-artist')?.value?.trim() || null,
      message: document.getElementById('sr-message')?.value?.trim() || null
    });
  } catch { /* ignore */ }
  document.querySelector('.modal-overlay')?.remove();
}


// ==================== MAGAZINE PAGE ====================
let magazinesCache = [];

function renderMagazine(container) {
  container.innerHTML = `
    <div class="hero hero-orange">
      <span class="material-icons-round">menu_book</span>
      <h1>BANF Magazine</h1>
      <p>Stories, articles & community news</p>
    </div>
    <div id="magazine-grid"><div class="loading"><div class="spinner"></div></div></div>
  `;
  loadMagazines();
}

async function loadMagazines() {
  try {
    const data = await API.getMagazines();
    magazinesCache = data?.items || data || [];
    const el = document.getElementById('magazine-grid');
    if (!el) return;

    if (magazinesCache.length === 0) {
      el.innerHTML = '<div class="empty-state"><span class="material-icons-round">menu_book</span><p>No magazines available yet</p></div>';
    } else {
      el.innerHTML = `<div class="magazine-grid">${magazinesCache.map(m => `
        <div class="magazine-card" onclick="Router.navigate('magazine-detail/${m._id || m.id}')">
          <span class="material-icons-round icon-placeholder">menu_book</span>
          <div class="info-overlay">
            <h4>${m.title || ''}</h4>
            ${m.issueDate ? `<p>${m.issueDate}</p>` : ''}
          </div>
          ${m.issueNumber ? `<div class="issue-badge">Issue ${m.issueNumber}</div>` : ''}
        </div>
      `).join('')}</div>`;
    }
  } catch {
    document.getElementById('magazine-grid').innerHTML = '<div class="empty-state"><p>Failed to load magazines</p></div>';
  }
}


// ==================== MAGAZINE DETAIL PAGE ====================
function renderMagazineDetail(container, magazineId) {
  const mag = magazinesCache.find(m => (m._id || m.id) === magazineId);

  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>${mag?.title || 'Magazine'}</h2>
    </div>
  `;

  if (!mag) {
    container.innerHTML += '<div class="empty-state"><p>Magazine not found</p></div>';
    return;
  }

  container.innerHTML += `
    <div class="card" style="margin:0 16px">
      <div style="padding:20px">
        <h2 style="font-size:20px">${mag.title}</h2>
        <div style="display:flex;gap:12px;margin-top:8px">
          ${mag.issueNumber ? `<span style="padding:4px 10px;border-radius:8px;background:var(--orange-bg);color:var(--orange);font-size:12px;font-weight:600"><span class="material-icons-round" style="font-size:13px;vertical-align:middle">tag</span> Issue ${mag.issueNumber}</span>` : ''}
          ${mag.issueDate ? `<span style="padding:4px 10px;border-radius:8px;background:var(--orange-bg);color:var(--orange);font-size:12px;font-weight:600"><span class="material-icons-round" style="font-size:13px;vertical-align:middle">calendar_month</span> ${mag.issueDate}</span>` : ''}
        </div>
        ${mag.description ? `<p style="margin-top:12px;color:var(--text-secondary);font-size:14px">${mag.description}</p>` : ''}
      </div>
    </div>
    ${(mag.articles && mag.articles.length > 0) ? `
      <h3 style="margin:16px 16px 8px;font-size:16px">Articles</h3>
      ${mag.articles.map(a => `
        <div class="card" style="margin:0 16px 8px;padding:16px">
          <h4 style="font-size:14px;font-weight:600">${a.title || ''}</h4>
          ${a.author ? `<div class="event-meta" style="margin-top:4px"><span class="material-icons-round">person</span>${a.author}</div>` : ''}
          ${a.content ? `<p style="margin-top:8px;font-size:13px;color:var(--text-secondary);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">${a.content}</p>` : ''}
        </div>
      `).join('')}
    ` : ''}
    <div style="height:24px"></div>
  `;
}


// ==================== MORE PAGE ====================
function renderMore(container) {
  const member = Auth.getMember();
  const isLoggedIn = Auth.isLoggedIn();

  container.innerHTML = `
    <div style="padding:16px">
      <div class="card" style="cursor:pointer" onclick="Router.navigate('login')">
        <div style="display:flex;align-items:center;gap:16px;padding:20px">
          <div style="width:52px;height:52px;border-radius:14px;background:var(--green-bg);display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round" style="font-size:28px;color:var(--green)">${isLoggedIn ? 'person' : 'person_outline'}</span>
          </div>
          <div style="flex:1">
            <strong style="font-size:16px">${isLoggedIn ? (member?.firstName || 'Member') : 'Sign In'}</strong>
            <div class="text-sm text-secondary">${isLoggedIn ? 'View your profile' : 'Access member features'}</div>
          </div>
          <span class="material-icons-round" style="color:var(--text-tertiary)">chevron_right</span>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-section-title">Community</div>
      <div class="menu-card">
        ${menuItemHTML('handshake', 'Sponsors', 'Our valued supporters', '#1565C0', 'sponsors')}
        ${menuItemHTML('favorite', 'Volunteers', 'Join our volunteer team', '#C62828', 'volunteers')}
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-section-title">Support</div>
      <div class="menu-card">
        ${menuItemHTML('email', 'Contact Us', 'Get in touch with BANF', '#00695C', 'contact')}
        ${menuItemHTML('info', 'About BANF', 'Learn about our mission', '#E65100', 'about')}
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-section-title">App</div>
      <div class="menu-card">
        ${menuItemHTML('settings', 'Settings', 'Preferences & notifications', '#666', 'settings')}
      </div>
    </div>

    <p class="text-center text-sm text-secondary mt-16" style="opacity:0.5">BANF PWA v1.0.0</p>
    <div style="height:16px"></div>
  `;
}

function menuItemHTML(icon, title, subtitle, color, route) {
  return `
    <button class="menu-item" onclick="Router.navigate('${route}')">
      <div class="menu-item-icon" style="background:${color}15"><span class="material-icons-round" style="color:${color}">${icon}</span></div>
      <div class="menu-item-text"><strong>${title}</strong><small>${subtitle}</small></div>
      <span class="material-icons-round chevron">chevron_right</span>
    </button>
  `;
}


// ==================== SPONSORS PAGE ====================
function renderSponsors(container) {
  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>Our Sponsors</h2>
    </div>
    <div class="hero hero-blue">
      <span class="material-icons-round">handshake</span>
      <h1>Thank You, Sponsors!</h1>
      <p>Your support makes our community events possible</p>
    </div>
    <div id="sponsors-list"><div class="loading"><div class="spinner"></div></div></div>
  `;

  API.getSponsors().then(data => {
    const sponsors = data?.items || data || [];
    const el = document.getElementById('sponsors-list');
    if (!el) return;

    if (sponsors.length === 0) {
      el.innerHTML = '<div class="empty-state"><p>No sponsors to display</p></div>';
      return;
    }

    const tiers = { platinum: [], gold: [], silver: [], bronze: [], community: [] };
    sponsors.forEach(s => {
      const t = (s.tier || 'community').toLowerCase();
      (tiers[t] || tiers.community).push(s);
    });

    const tierColors = { platinum: '#78909C', gold: '#FFC107', silver: '#90A4AE', bronze: '#8D6E63', community: '#1B5E20' };
    let html = '';

    for (const [tier, list] of Object.entries(tiers)) {
      if (list.length === 0) continue;
      html += `<h3 style="padding:12px 16px;font-size:16px;color:${tierColors[tier]}">${tier.charAt(0).toUpperCase() + tier.slice(1)} Sponsors</h3>`;
      html += list.map(s => `
        <div class="card" style="margin:0 16px 8px;padding:14px;display:flex;align-items:center;gap:14px">
          <div style="width:48px;height:48px;border-radius:10px;background:${tierColors[tier]}15;display:flex;align-items:center;justify-content:center;font-weight:700;color:${tierColors[tier]};flex-shrink:0">${(s.name || '').slice(0, 2).toUpperCase()}</div>
          <div>
            <strong style="font-size:14px">${s.name || ''}</strong>
            ${s.businessName ? `<div class="text-sm text-secondary">${s.businessName}</div>` : ''}
            ${s.phone ? `<div class="text-sm text-secondary">${s.phone}</div>` : ''}
          </div>
        </div>
      `).join('');
    }

    el.innerHTML = html + '<div style="height:24px"></div>';
  }).catch(() => {
    document.getElementById('sponsors-list').innerHTML = '<div class="empty-state"><p>Failed to load sponsors</p></div>';
  });
}


// ==================== VOLUNTEERS PAGE ====================
function renderVolunteers(container) {
  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>Volunteers</h2>
    </div>
    <div class="hero hero-red">
      <span class="material-icons-round">favorite</span>
      <h1>Be a Volunteer!</h1>
      <p>Help make our community events amazing</p>
    </div>
    <div class="card" style="margin:0 16px 12px">
      <div style="padding:16px">
        <h3 style="font-size:16px;margin-bottom:12px">Why Volunteer?</h3>
        ${['Connect with the Bengali community', 'Develop leadership skills', 'Give back to the community', 'Make lifelong friendships', 'Build your resume'].map(i => `
          <div class="check-row"><span class="material-icons-round">check_circle</span><span>${i}</span></div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="margin:0 16px 12px">
      <div style="padding:16px">
        <h3 style="font-size:16px;margin-bottom:12px">Volunteer Opportunities</h3>
        ${['Event Planning & Coordination', 'Cultural Program Support', 'Food & Hospitality Team', 'Photography & Media', 'Youth Program Mentoring', 'Community Outreach'].map(i => `
          <div class="check-row"><span class="material-icons-round">check_circle</span><span>${i}</span></div>
        `).join('')}
      </div>
    </div>
    <div style="padding:0 16px 24px">
      <button class="btn-primary" style="background:#C62828" onclick="Router.navigate('contact')">
        <span class="material-icons-round" style="font-size:20px">favorite</span> Sign Up to Volunteer
      </button>
    </div>
  `;
}


// ==================== LOGIN PAGE ====================
function renderLogin(container) {
  if (Auth.isLoggedIn()) {
    renderProfile(container);
    return;
  }

  let isSignUp = false;

  function render() {
    container.innerHTML = `
      <div class="detail-header">
        <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
        <h2>${isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      </div>
      <div class="card" style="margin:0 16px;padding:20px">
        <h2 style="font-size:22px">${isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p class="text-sm text-secondary" style="margin-bottom:20px">${isSignUp ? 'Join the BANF community' : 'Sign in to your BANF account'}</p>
        ${isSignUp ? `
          <div style="display:flex;gap:12px">
            <div class="form-field" style="flex:1"><label>First Name</label><input type="text" id="auth-first"></div>
            <div class="form-field" style="flex:1"><label>Last Name</label><input type="text" id="auth-last"></div>
          </div>
          <div class="form-field"><label>Phone</label><input type="tel" id="auth-phone"></div>
        ` : ''}
        <div class="form-field"><label>Email</label><input type="email" id="auth-email" autocomplete="email"></div>
        <div class="form-field"><label>Password</label><input type="password" id="auth-pass" autocomplete="current-password"></div>
        <div id="auth-error" style="color:#C62828;font-size:13px;margin-bottom:12px;display:none"></div>
        <button class="btn-primary" id="auth-submit">${isSignUp ? 'Create Account' : 'Sign In'}</button>
        <button style="width:100%;background:none;border:none;color:var(--green);margin-top:12px;font-size:14px;cursor:pointer;font-family:inherit;padding:8px" id="auth-toggle">
          ${isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    `;

    document.getElementById('auth-toggle')?.addEventListener('click', () => { isSignUp = !isSignUp; render(); });
    document.getElementById('auth-submit')?.addEventListener('click', handleAuth);
  }

  render();
}

async function handleAuth() {
  const email = document.getElementById('auth-email')?.value?.trim();
  const pass = document.getElementById('auth-pass')?.value;
  const errEl = document.getElementById('auth-error');
  const submitBtn = document.getElementById('auth-submit');

  if (!email || !pass) {
    if (errEl) { errEl.textContent = 'Please fill in all fields'; errEl.style.display = 'block'; }
    return;
  }

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Loading...'; }

  try {
    const isSignUp = document.getElementById('auth-first') !== null;
    let data;

    if (isSignUp) {
      data = await API.signup({
        email, password: pass,
        firstName: document.getElementById('auth-first')?.value?.trim() || '',
        lastName: document.getElementById('auth-last')?.value?.trim() || '',
        phone: document.getElementById('auth-phone')?.value?.trim() || ''
      });
    } else {
      data = await API.login(email, pass);
    }

    Auth.save({ token: data.token, member: data.member || { email } });
    Router.navigate('more');
  } catch (err) {
    if (errEl) { errEl.textContent = err.message || 'Authentication failed'; errEl.style.display = 'block'; }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In'; }
  }
}

function renderProfile(container) {
  const member = Auth.getMember() || {};

  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>Profile</h2>
    </div>
    <div class="profile-card">
      <div class="profile-avatar">${((member.firstName || '')[0] || '') + ((member.lastName || '')[0] || '')}`.toUpperCase() + `</div>
      <h2 style="font-size:20px">${member.firstName || ''} ${member.lastName || ''}</h2>
      ${member.email ? `<p class="text-secondary">${member.email}</p>` : ''}
      ${member.phone ? `<p class="text-secondary text-sm">${member.phone}</p>` : ''}
      ${member.membershipStatus ? `<span style="display:inline-block;margin-top:8px;padding:4px 12px;border-radius:8px;background:var(--green-bg);color:var(--green);font-size:12px;font-weight:600">${member.membershipStatus.toUpperCase()}</span>` : ''}
    </div>
    <div style="padding:0 16px">
      <button class="btn-outline" style="color:#C62828;border-color:#C62828" onclick="Auth.clear();Router.navigate('more')">
        <span class="material-icons-round" style="font-size:18px">logout</span> Sign Out
      </button>
    </div>
  `;
}


// ==================== SETTINGS PAGE ====================
function renderSettings(container) {
  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>Settings</h2>
    </div>
    <div class="menu-section">
      <div class="menu-section-title">Notifications</div>
      <div class="menu-card">
        <div class="toggle-row">
          <span class="material-icons-round" style="color:var(--green)">notifications</span>
          <div class="toggle-info"><strong>Push Notifications</strong><small>Receive BANF updates</small></div>
          <button class="toggle on" onclick="this.classList.toggle('on')"></button>
        </div>
        <div class="toggle-row">
          <span class="material-icons-round" style="color:var(--green)">event_available</span>
          <div class="toggle-info"><strong>Event Reminders</strong><small>Get notified about upcoming events</small></div>
          <button class="toggle on" onclick="this.classList.toggle('on')"></button>
        </div>
        <div class="toggle-row">
          <span class="material-icons-round" style="color:var(--green)">radio</span>
          <div class="toggle-info"><strong>Radio Notifications</strong><small>Know when shows go live</small></div>
          <button class="toggle" onclick="this.classList.toggle('on')"></button>
        </div>
      </div>
    </div>
    <div class="menu-section">
      <div class="menu-section-title">About</div>
      <div class="menu-card">
        <div class="toggle-row">
          <span class="material-icons-round" style="color:var(--text-secondary)">info</span>
          <div class="toggle-info"><strong>Version</strong><small>1.0.0 (PWA)</small></div>
        </div>
        <div class="toggle-row" style="cursor:pointer">
          <span class="material-icons-round" style="color:var(--text-secondary)">policy</span>
          <div class="toggle-info"><strong>Privacy Policy</strong><small>jaxbengali.org/privacy</small></div>
        </div>
      </div>
    </div>
  `;
}


// ==================== CONTACT PAGE ====================
function renderContact(container) {
  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>Contact Us</h2>
    </div>
    <div class="card" style="margin:0 16px 8px;padding:14px;display:flex;align-items:center;gap:14px">
      <span class="material-icons-round" style="color:var(--green)">email</span>
      <div><div class="text-xs text-secondary">Email</div><div style="font-size:14px">info@jaxbengali.org</div></div>
    </div>
    <div class="card" style="margin:0 16px 8px;padding:14px;display:flex;align-items:center;gap:14px">
      <span class="material-icons-round" style="color:var(--green)">language</span>
      <div><div class="text-xs text-secondary">Website</div><div style="font-size:14px">www.jaxbengali.org</div></div>
    </div>
    <div class="card" style="margin:0 16px 8px;padding:14px;display:flex;align-items:center;gap:14px">
      <span class="material-icons-round" style="color:var(--green)">location_on</span>
      <div><div class="text-xs text-secondary">Location</div><div style="font-size:14px">Jacksonville, Florida</div></div>
    </div>

    <h3 style="margin:16px 16px 8px;font-size:16px">Send us a Message</h3>
    <div class="card" style="margin:0 16px;padding:16px">
      <div class="form-field"><label>Your Name</label><input type="text" id="contact-name"></div>
      <div class="form-field"><label>Your Email</label><input type="email" id="contact-email"></div>
      <div class="form-field"><label>Subject</label><input type="text" id="contact-subject"></div>
      <div class="form-field"><label>Message</label><textarea id="contact-message" rows="4"></textarea></div>
      <button class="btn-primary" id="contact-submit">
        <span class="material-icons-round" style="font-size:18px">send</span> Send Message
      </button>
    </div>
    <div style="height:24px"></div>
  `;

  document.getElementById('contact-submit')?.addEventListener('click', async () => {
    const name = document.getElementById('contact-name')?.value?.trim();
    const email = document.getElementById('contact-email')?.value?.trim();
    const message = document.getElementById('contact-message')?.value?.trim();
    if (!name || !email || !message) return;

    try {
      await API.submitContactForm({
        name, email,
        subject: document.getElementById('contact-subject')?.value?.trim() || '',
        message
      });
    } catch { /* ignore */ }

    // Show success
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <span class="material-icons-round" style="font-size:40px;color:var(--green);display:block;text-align:center">check_circle</span>
        <h3>Message Sent!</h3>
        <p>Thank you for reaching out. We'll get back to you soon.</p>
        <div class="modal-actions" style="justify-content:center">
          <button class="confirm" onclick="this.closest('.modal-overlay').remove()">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Clear form
    ['contact-name', 'contact-email', 'contact-subject', 'contact-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  });
}


// ==================== ABOUT PAGE ====================
function renderAbout(container) {
  container.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="Router.back()"><span class="material-icons-round">arrow_back</span></button>
      <h2>About BANF</h2>
    </div>
    <div class="hero hero-green" style="text-align:center">
      <h1 style="font-size:32px">BANF</h1>
      <p style="font-size:16px;opacity:0.9">Bengali Association of<br>North Florida</p>
      <p style="font-size:12px;margin-top:6px;opacity:0.6">Est. Jacksonville, FL</p>
    </div>
    <div class="card" style="margin:0 16px 12px;padding:16px">
      <h3 style="font-size:16px;margin-bottom:8px">Our Mission</h3>
      <p class="text-secondary" style="font-size:14px;line-height:1.6">The Bengali Association of North Florida (BANF) is a non-profit community organization dedicated to preserving and promoting Bengali culture, heritage, and traditions in the North Florida region. We bring together Bengali families and individuals to celebrate our rich cultural identity while fostering community bonds.</p>
    </div>
    <div class="card" style="margin:0 16px 12px;padding:16px">
      <h3 style="font-size:16px;margin-bottom:12px">What We Do</h3>
      ${[
        ['celebration', 'Cultural Events & Festivals'],
        ['radio', 'Community Radio Station'],
        ['menu_book', 'BANF Magazine'],
        ['people', 'Family & Youth Programs'],
        ['music_note', 'Music & Dance Performances'],
        ['restaurant', 'Bengali Food Festivals'],
        ['school', 'Educational Workshops'],
        ['favorite', 'Community Service']
      ].map(([icon, text]) => `
        <div style="display:flex;align-items:center;gap:12px;padding:6px 0">
          <span class="material-icons-round" style="font-size:20px;color:var(--green)">${icon}</span>
          <span style="font-size:14px">${text}</span>
        </div>
      `).join('')}
    </div>
    <div class="card" style="margin:0 16px 12px;padding:16px">
      <h3 style="font-size:16px;margin-bottom:12px">Connect With Us</h3>
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0"><span class="material-icons-round" style="font-size:18px;color:var(--green)">language</span><span>www.jaxbengali.org</span></div>
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0"><span class="material-icons-round" style="font-size:18px;color:var(--green)">email</span><span>info@jaxbengali.org</span></div>
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0"><span class="material-icons-round" style="font-size:18px;color:var(--green)">location_on</span><span>Jacksonville, Florida</span></div>
    </div>
    <p class="text-center text-sm text-secondary mb-24">Made with ❤️ for the Bengali community</p>
  `;
}
