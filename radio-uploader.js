const SUPABASE_URL = 'https://qaacilmywkiupbcrijgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhYWNpbG15d2tpdXBiY3JpamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDYwMTAsImV4cCI6MjA4ODk4MjAxMH0.kEq_QI8krG-t7SuPr4-GH0fHJLe8SkjHEIHbj1zJMLs';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhYWNpbG15d2tpdXBiY3JpamdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQwNjAxMCwiZXhwIjoyMDg4OTgyMDEwfQ.uQoR70ucogD-fu-XsQA9KFW1n7IzqWxW9Pr9UAJ8fwc';

// ── Sidebar toggle ──
document.getElementById('pu-sidebar-toggle').addEventListener('click', () => {
  document.getElementById('pu-sidebar').classList.toggle('expanded');
});

// ── Episode number preview ──
const epNum = document.getElementById('ep-num');
const epNumPreview = document.getElementById('ep-num-preview');
epNum.addEventListener('input', () => {
  epNumPreview.textContent = '→ ' + String(epNum.value).padStart(3, '0');
});

// ── Date validation ──
const epDate = document.getElementById('ep-date');
epDate.addEventListener('blur', () => {
  const v = epDate.value.trim();
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
  epDate.classList.toggle('ru-date-invalid', v.length > 0 && !ok);
});

// ── SoundCloud preview ──
const scInput = document.getElementById('ep-sc-url');
const scPreview = document.getElementById('ru-sc-preview');
scInput.addEventListener('blur', () => {
  const url = scInput.value.trim();
  if (!url.startsWith('https://soundcloud.com/')) { scPreview.style.display = 'none'; return; }
  scPreview.style.display = 'block';
  scPreview.innerHTML = `<iframe width="100%" height="120" scrolling="no" frameborder="no" allow="autoplay" src="${buildEmbedUrl(url)}"></iframe>`;
});

// ── Helpers ──
function buildEmbedUrl(trackUrl) {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%230c260c&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
}

function buildSlug(title, num) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + String(num).padStart(3, '0');
}

function setStatus(id, type, msg) {
  const el = document.getElementById(id);
  el.className = `ru-status ${type}`;
  el.textContent = msg;
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'2-digit'});
}

// ── EDIT / SVG icons ──
const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const ICON_DEL  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`;

// ── Load & render show list ──
let allShows = [];

async function loadShows() {
  const list = document.getElementById('ru-show-list');
  list.innerHTML = '<div style="font-size:12px;color:#aaa">Loading...</div>';
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/radio_shows?select=*&order=number.asc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    allShows = await res.json();
    renderShowList();

    // Auto-increment episode number
    if (allShows.length) {
      const max = Math.max(...allShows.map(s => s.number));
      epNum.value = max + 1;
      epNumPreview.textContent = '→ ' + String(max + 1).padStart(3, '0');
    }
  } catch(e) {
    list.innerHTML = '<div style="font-size:12px;color:#c00">Failed to load shows.</div>';
  }
}

function renderShowList() {
  const list = document.getElementById('ru-show-list');
  if (!allShows.length) {
    list.innerHTML = '<div style="font-size:12px;color:#aaa">No episodes yet.</div>';
    return;
  }
  list.innerHTML = allShows.map(s => `
    <div class="ru-show-row" data-slug="${s.slug}">
      <div class="ru-show-info">
        <div class="ru-show-title">${s.title}</div>
        <div class="ru-show-meta">${fmtDate(s.broadcast_date)}${s.host ? ' · ' + s.host : ''}${s.duration ? ' · ' + s.duration : ''}</div>
      </div>
      <div class="ru-show-actions">
        <button class="ru-icon-btn edit" title="Edit" onclick="openEdit('${s.slug}')">${ICON_EDIT}</button>
        <button class="ru-icon-btn del" title="Delete" onclick="deleteShow('${s.slug}', '${s.title.replace(/'/g,"\\'")}')"> ${ICON_DEL}</button>
      </div>
    </div>
  `).join('');
}

// ── DELETE ──
async function deleteShow(slug, title) {
  if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return;
  setStatus('ru-manage-status', 'loading', 'Deleting...');
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/radio_shows?slug=eq.${encodeURIComponent(slug)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );
    if (!res.ok) throw new Error('Delete failed');
    setStatus('ru-manage-status', 'success', `✓ "${title}" deleted.`);
    await loadShows();
  } catch(e) {
    setStatus('ru-manage-status', 'error', `✗ ${e.message}`);
  }
}

// ── EDIT modal ──
function openEdit(slug) {
  const show = allShows.find(s => s.slug === slug);
  if (!show) return;

  document.getElementById('edit-slug').value     = show.slug;
  document.getElementById('edit-title').value    = show.title;
  document.getElementById('edit-num').value      = show.number;
  document.getElementById('edit-date').value     = show.broadcast_date || '';
  document.getElementById('edit-host').value     = show.host || '';
  document.getElementById('edit-duration').value = show.duration || '';
  document.getElementById('edit-time').value     = show.show_time || '';
  document.getElementById('edit-thumb').value    = show.thumbnail_url || '';
  document.getElementById('edit-desc').value     = show.description || '';

  // Reverse-engineer SC track URL from embed URL for display
  const scEmbed = show.soundcloud_url || '';
  const scMatch = scEmbed.match(/url=([^&]+)/);
  document.getElementById('edit-sc-url').value = scMatch ? decodeURIComponent(scMatch[1]) : '';

  document.getElementById('ru-modal-title').textContent = `Edit: ${show.title}`;
  document.getElementById('ru-edit-status').className = 'ru-status';
  document.getElementById('ru-modal-bg').classList.add('open');
}

function closeModal() {
  document.getElementById('ru-modal-bg').classList.remove('open');
}

document.getElementById('ru-modal-close').addEventListener('click', closeModal);
document.getElementById('ru-modal-cancel').addEventListener('click', closeModal);
document.getElementById('ru-modal-bg').addEventListener('click', e => {
  if (e.target === document.getElementById('ru-modal-bg')) closeModal();
});

document.getElementById('ru-modal-save').addEventListener('click', async () => {
  const slug     = document.getElementById('edit-slug').value;
  const title    = document.getElementById('edit-title').value.trim();
  const num      = parseInt(document.getElementById('edit-num').value);
  const date     = document.getElementById('edit-date').value.trim();
  const host     = document.getElementById('edit-host').value.trim();
  const duration = document.getElementById('edit-duration').value.trim();
  const showTime = document.getElementById('edit-time').value.trim();
  const scUrl    = document.getElementById('edit-sc-url').value.trim();
  const thumb    = document.getElementById('edit-thumb').value.trim();
  const desc     = document.getElementById('edit-desc').value.trim();

  if (!title || !num || !date) {
    setStatus('ru-edit-status', 'error', '✗ Title, episode number and date are required.');
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    setStatus('ru-edit-status', 'error', '✗ Date must be YYYY-MM-DD');
    return;
  }

  const newSlug = buildSlug(title.replace(/\s*\d{3}$/, '').trim(), num);

  const payload = {
    slug: newSlug,
    number: num,
    title,
    broadcast_date: date,
    host: host || null,
    duration: duration || null,
    show_time: showTime || null,
    thumbnail_url: thumb || null,
    description: desc || null,
  };

  if (scUrl.startsWith('https://soundcloud.com/')) {
    payload.soundcloud_url = buildEmbedUrl(scUrl);
    payload.soundcloud_track_title = scUrl.split('/').pop().replace(/-/g, ' ');
  }

  const saveBtn = document.getElementById('ru-modal-save');
  saveBtn.disabled = true;
  setStatus('ru-edit-status', 'loading', 'Saving...');

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/radio_shows?slug=eq.${encodeURIComponent(slug)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.details || 'Unknown error');
    }
    setStatus('ru-edit-status', 'success', '✓ Saved!');
    await loadShows();
    setTimeout(closeModal, 900);
  } catch(e) {
    setStatus('ru-edit-status', 'error', `✗ ${e.message}`);
  } finally {
    saveBtn.disabled = false;
  }
});

// ── ADD new episode ──
document.getElementById('ru-submit-btn').addEventListener('click', async () => {
  const title    = document.getElementById('ep-title').value.trim();
  const num      = parseInt(epNum.value);
  const date     = epDate.value.trim();
  const host     = document.getElementById('ep-host').value.trim();
  const duration = document.getElementById('ep-duration').value.trim();
  const showTime = document.getElementById('ep-time').value.trim();
  const scUrl    = scInput.value.trim();
  const thumb    = document.getElementById('ep-thumb').value.trim();
  const desc     = document.getElementById('ep-desc').value.trim();

  if (!title || !num || !date || !scUrl) {
    setStatus('ru-add-status', 'error', '✗ Please fill in title, episode number, date and SoundCloud URL.');
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    setStatus('ru-add-status', 'error', '✗ Date must be YYYY-MM-DD e.g. 2026-06-14');
    epDate.classList.add('ru-date-invalid');
    return;
  }
  if (!scUrl.startsWith('https://soundcloud.com/')) {
    setStatus('ru-add-status', 'error', '✗ SoundCloud URL must start with https://soundcloud.com/');
    return;
  }

  const slug      = buildSlug(title, num);
  const fullTitle = `${title} ${String(num).padStart(3, '0')}`;

  const payload = {
    slug,
    number: num,
    title: fullTitle,
    guest: null,
    broadcast_date: date,
    duration: duration || null,
    thumbnail_url: thumb || null,
    preview_video_url: null,
    soundcloud_url: buildEmbedUrl(scUrl),
    soundcloud_track_title: scUrl.split('/').pop().replace(/-/g, ' '),
    host,
    show_time: showTime,
    description: desc || null
  };

  const btn = document.getElementById('ru-submit-btn');
  btn.disabled = true;
  setStatus('ru-add-status', 'loading', 'Saving to Supabase...');

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/radio_shows`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.details || 'Unknown error');
    }

    setStatus('ru-add-status', 'success', `✓ Episode saved! Slug: ${slug}`);
    resetForm();
    await loadShows();

  } catch(e) {
    setStatus('ru-add-status', 'error', `✗ Failed to save: ${e.message}`);
  } finally {
    btn.disabled = false;
  }
});

// ── Reset ──
document.getElementById('ru-reset-btn').addEventListener('click', resetForm);

function resetForm() {
  document.getElementById('ep-title').value = 'Enter The Basstrix';
  epDate.value = '';
  epDate.classList.remove('ru-date-invalid');
  document.getElementById('ep-host').value = 'Twelve Step Audio';
  document.getElementById('ep-duration').value = '';
  document.getElementById('ep-time').value = '22:00 – 00:00';
  scInput.value = '';
  document.getElementById('ep-thumb').value = 'https://od.lk/s/NzdfNjY3NzMzNDFf/vennrad.webp';
  document.getElementById('ep-desc').value = '';
  scPreview.style.display = 'none';
  document.getElementById('ru-add-status').className = 'ru-status';
}

// ── Init ──
loadShows();
