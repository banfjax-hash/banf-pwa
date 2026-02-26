// ========== BANF Radio Player ==========
const RadioPlayer = (() => {
  const STREAM_URL = 'https://stream.banfradio.org/live';
  let audio = null;
  let playing = false;
  let onStateChange = null;

  function init() {
    if (!audio) {
      audio = new Audio();
      audio.preload = 'none';
      audio.addEventListener('playing', () => { playing = true; notify(); });
      audio.addEventListener('pause', () => { playing = false; notify(); });
      audio.addEventListener('error', () => { playing = false; notify(); });
    }
  }

  function play() {
    init();
    audio.src = STREAM_URL;
    audio.play().catch(() => {});
    updateMiniPlayer(true);
    updateMediaSession();
  }

  function pause() {
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    playing = false;
    updateMiniPlayer(false);
    notify();
  }

  function toggle() {
    if (playing) pause(); else play();
  }

  function isPlaying() { return playing; }

  function notify() {
    if (onStateChange) onStateChange(playing);
  }

  function setOnStateChange(fn) { onStateChange = fn; }

  function updateMiniPlayer(isPlaying) {
    const mini = document.getElementById('radio-mini');
    const btn = document.getElementById('mini-play-btn');
    if (!mini || !btn) return;

    if (isPlaying) {
      mini.classList.remove('hidden');
      btn.innerHTML = '<span class="material-icons-round">pause</span>';
    } else {
      btn.innerHTML = '<span class="material-icons-round">play_arrow</span>';
    }
  }

  function hideMiniPlayer() {
    const mini = document.getElementById('radio-mini');
    if (mini && !playing) mini.classList.add('hidden');
  }

  function showMiniPlayer() {
    const mini = document.getElementById('radio-mini');
    if (mini && playing) mini.classList.remove('hidden');
  }

  function updateMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'BANF Radio',
        artist: 'Live Stream',
        album: 'Bengali Association of North Florida',
        artwork: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
    }
  }

  return { play, pause, toggle, isPlaying, setOnStateChange, hideMiniPlayer, showMiniPlayer };
})();
