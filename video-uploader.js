  const _sb = supabase.createClient(
    'https://qaacilmywkiupbcrijgi.supabase.co',
    'sb_publishable_jqflkGEKJaGTd5phvgbwcA_Ob7npOXw'
  );
  _sb.auth.getSession().then(({ data }) => {
    if (!data.session) {
      window.location.href = 'https://thebasstrix.co.uk/pages/admin-login';
    } else {
      loadVideoList();
      loadDraftList();
    }
  });
  document.getElementById('pu-logout-btn').addEventListener('click', async () => {
    await _sb.auth.signOut();
    window.location.href = 'https://thebasstrix.co.uk/pages/admin-login';
  });
  const SUPABASE_URL = 'https://qaacilmywkiupbcrijgi.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_jqflkGEKJaGTd5phvgbwcA_Ob7npOXw';
  async function vgUploadPreview(file) {
    const ext = file.name.split('.').pop();
    const filename = `video-previews/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await _sb.storage.from('videos').upload(filename, file, { upsert: false, contentType: file.type });
    if (error) throw new Error('Storage: ' + error.message);
    const { data: urlData } = _sb.storage.from('videos').getPublicUrl(filename);
    return urlData.publicUrl;
  }
  function extractYouTubeID(url) {
    const m = url.match(/^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/);
    return (m && m[1].length === 11) ? m[1] : null;
  }
  function showStatus(msg, type) {
    const el = document.getElementById('vg-status');
    el.textContent = msg; el.className = 'vg-status ' + type;
  }
  document.getElementById('vg-yt-url').addEventListener('blur', async () => {
    const url = document.getElementById('vg-yt-url').value.trim();
    if (!url) return;
    const videoId = extractYouTubeID(url);
    if (!videoId) return;
    const titleField = document.getElementById('vg-vid-title');
    if (titleField.value.trim()) return;
    titleField.placeholder = 'Fetching title...';
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      titleField.value = data.title;
    } catch(e) { titleField.placeholder = 'Could not fetch title — enter manually'; }
  });
  let pendingUploads = [];
  function renderPendingUploads() {
    const list = document.getElementById('vg-pending-uploads-list');
    const bar = document.getElementById('vg-upload-save-bar');
    const count = document.getElementById('vg-upload-pending-count');
    list.innerHTML = '';
    if (!pendingUploads.length) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    count.textContent = pendingUploads.length === 1 ? '1 video staged' : `${pendingUploads.length} videos staged`;
    pendingUploads.forEach((v, idx) => {
      const row = document.createElement('div');
      row.className = 'vg-video-row'; row.style.opacity = '0.75';
      row.innerHTML = `<img src="https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg" alt="${v.title}"><div class="vg-video-row-title">${v.title}</div><button class="vg-remove-btn" data-idx="${idx}">Remove</button>`;
      row.querySelector('.vg-remove-btn').addEventListener('click', () => { pendingUploads.splice(idx, 1); renderPendingUploads(); });
      list.appendChild(row);
    });
  }
  document.getElementById('vg-inject-btn').addEventListener('click', async () => {
    const youtubeURL = document.getElementById('vg-yt-url').value.trim();
    const previewFile = document.getElementById('vg-prev-file').files[0] || null;
    const title = document.getElementById('vg-vid-title').value.trim();
    if (!youtubeURL || !previewFile || !title) { showStatus('Please fill in all fields and select a preview file.', 'error'); return; }
    const videoId = extractYouTubeID(youtubeURL);
    if (!videoId) { showStatus('Could not extract a YouTube video ID — please check the URL.', 'error'); return; }
    pendingUploads.unshift({ youtube_id: videoId, previewFile, title });
    renderPendingUploads();
    document.getElementById('vg-yt-url').value = '';
    document.getElementById('vg-prev-file').value = '';
    document.getElementById('vg-vid-title').value = '';
    showStatus('✓ Video staged. Click Save to publish.', 'success');
  });
  document.getElementById('vg-upload-save-btn').addEventListener('click', async () => {
    if (!pendingUploads.length) return;
    const btn = document.getElementById('vg-upload-save-btn');
    btn.disabled = true; btn.textContent = 'Uploading...';
    let failed = 0; let lastError = '';
    for (const v of pendingUploads) {
      try {
        const previewUrl = await vgUploadPreview(v.previewFile);
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_positions`, { method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        const res = await fetch(`${SUPABASE_URL}/rest/v1/videos`, { method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ youtube_id: v.youtube_id, preview_url: previewUrl, title: v.title, position: 0 }) });
        if (!res.ok) throw new Error(await res.text());
      } catch(e) { lastError = e.message; failed++; }
    }
    pendingUploads = []; renderPendingUploads(); loadVideoList(); loadDraftList();
    btn.disabled = false; btn.textContent = 'Save & Publish';
    if (failed) showStatus(`${failed} video(s) failed: ${lastError}`, 'error');
    else { showStatus('✓ Videos published successfully!', 'success'); setTimeout(() => document.getElementById('vg-status').className = 'vg-status', 4000); }
  });
  document.getElementById('vg-upload-discard-btn').addEventListener('click', () => { pendingUploads = []; renderPendingUploads(); showStatus('', ''); });
  let pendingRemovals = new Set();
  let vgReorderDirty = false;
  function updateSaveBar() {
    const bar = document.getElementById('vg-save-bar');
    const count = document.getElementById('vg-pending-count');
    if (pendingRemovals.size) { bar.style.display = 'flex'; count.textContent = pendingRemovals.size === 1 ? '1 video staged for removal' : `${pendingRemovals.size} videos staged for removal`; }
    else bar.style.display = 'none';
  }
  function vgSetReorderDirty(val) { vgReorderDirty = val; document.getElementById('vg-reorder-save-bar').style.display = val ? 'flex' : 'none'; }
  function vgMakeSortable() {
    const list = document.getElementById('vg-video-list');
    let dragSrc = null;
    list.querySelectorAll('.vg-sort-row').forEach(row => {
      row.addEventListener('dragstart', e => { dragSrc = row; row.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move'; });
      row.addEventListener('dragend', () => { row.style.opacity = '1'; list.querySelectorAll('.vg-sort-row').forEach(r => r.classList.remove('vg-drag-over')); });
      row.addEventListener('dragover', e => { e.preventDefault(); list.querySelectorAll('.vg-sort-row').forEach(r => r.classList.remove('vg-drag-over')); if (row !== dragSrc) row.classList.add('vg-drag-over'); });
      row.addEventListener('drop', e => {
        e.preventDefault();
        if (dragSrc && dragSrc !== row) {
          const rows = [...list.querySelectorAll('.vg-sort-row')];
          const si = rows.indexOf(dragSrc), ti = rows.indexOf(row);
          if (si < ti) list.insertBefore(dragSrc, row.nextSibling); else list.insertBefore(dragSrc, row);
          vgSetReorderDirty(true);
        }
        row.classList.remove('vg-drag-over');
      });
    });
  }
  async function loadVideoList() {
    const wrap = document.getElementById('vg-video-list');
    const loading = document.getElementById('vg-video-list-loading');
    pendingRemovals.clear(); updateSaveBar(); vgSetReorderDirty(false);
    wrap.innerHTML = ''; loading.style.display = 'block'; loading.textContent = 'Loading videos...';
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=*&draft=eq.false&order=position.asc`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
      const videos = await res.json();
      loading.style.display = 'none';
      if (!videos.length) { wrap.innerHTML = '<div style="font-size:12px;color:#aaa;padding:10px 0;">No videos found.</div>'; return; }
      videos.forEach(v => {
        const row = document.createElement('div');
        row.className = 'vg-video-row vg-sort-row'; row.draggable = true;
        row.id = `vg-row-${v.id}`; row.dataset.id = v.id; row.dataset.previewUrl = v.preview_url || '';
        row.innerHTML = `<div class="vg-drag-handle" title="Drag to reorder">&#9776;</div><img src="https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg" alt="${v.title}"><div class="vg-video-row-title">${v.title}</div><button class="vg-remove-btn" data-id="${v.id}">Remove</button>`;
        const btn = row.querySelector('.vg-remove-btn');
        btn.addEventListener('click', function() {
          const id = this.dataset.id;
          const title = row.querySelector('.vg-video-row-title').textContent;
          if (!confirm(`Remove "${title}"?`)) return;
          pendingRemovals.add(id); row.style.opacity = '0.35'; row.style.textDecoration = 'line-through'; row.draggable = false;
          this.textContent = 'Undo'; this.style.borderColor = '#aaa'; this.style.color = '#aaa';
          this.onclick = () => { pendingRemovals.delete(id); row.style.opacity = '1'; row.style.textDecoration = 'none'; row.draggable = true; this.textContent = 'Remove'; this.style.borderColor = ''; this.style.color = ''; this.onclick = null; updateSaveBar(); };
          updateSaveBar();
        });
        wrap.appendChild(row);
      });
      vgMakeSortable();
    } catch(e) { loading.textContent = 'Failed to load videos.'; }
  }
  document.getElementById('vg-save-removals-btn').addEventListener('click', async () => {
    const saveBtn = document.getElementById('vg-save-removals-btn');
    saveBtn.disabled = true; saveBtn.textContent = 'Removing...';
    let failed = 0;
    for (const id of pendingRemovals) {
      try {
        const row = document.getElementById(`vg-row-${id}`);
        const previewUrl = row?.dataset?.previewUrl || '';
        const res = await fetch(`${SUPABASE_URL}/rest/v1/videos?id=eq.${id}`, { method: 'DELETE', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
        if (!res.ok) throw new Error(await res.text());
        row?.remove();
        if (previewUrl && previewUrl.includes('/video-previews/')) {
          const filename = 'video-previews/' + previewUrl.split('/video-previews/').pop().split('?')[0];
          await _sb.storage.from('videos').remove([filename]);
        }
      } catch(e) { failed++; }
    }
    pendingRemovals.clear(); updateSaveBar();
    saveBtn.disabled = false; saveBtn.textContent = 'Remove Selected';
    const status = document.getElementById('vg-remove-status');
    if (failed) { status.textContent = `${failed} video(s) could not be removed.`; status.className = 'vg-status error'; }
    else { status.textContent = '✓ Videos removed.'; status.className = 'vg-status success'; setTimeout(() => status.className = 'vg-status', 4000); }
  });
  document.getElementById('vg-discard-btn').addEventListener('click', () => loadVideoList());
  document.getElementById('vg-reorder-save-btn').addEventListener('click', async () => {
    const btn = document.getElementById('vg-reorder-save-btn');
    btn.disabled = true; btn.textContent = 'Saving...';
    const rows = document.getElementById('vg-video-list').querySelectorAll('.vg-sort-row');
    let failed = 0;
    for (let i = 0; i < rows.length; i++) {
      const id = rows[i].dataset.id;
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/videos?id=eq.${id}`, { method: 'PATCH', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ position: i }) });
        if (!r.ok) throw new Error();
      } catch(e) { failed++; }
    }
    btn.disabled = false; btn.textContent = 'Save Order'; vgSetReorderDirty(false);
    const status = document.getElementById('vg-reorder-status');
    if (failed) { status.textContent = `${failed} video(s) failed.`; status.className = 'vg-status error'; }
    else { status.textContent = '✓ Order saved.'; status.className = 'vg-status success'; setTimeout(() => status.className = 'vg-status', 4000); }
  });
  document.getElementById('vg-reorder-discard-btn').addEventListener('click', () => loadVideoList());
  async function loadDraftList() {
    const wrap = document.getElementById('vg-drafts-list');
    const loading = document.getElementById('vg-drafts-loading');
    wrap.innerHTML = ''; loading.style.display = 'block'; loading.textContent = 'Loading drafts...';
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=*&draft=eq.true&order=position.asc`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
      const videos = await res.json();
      loading.style.display = 'none';
      if (!videos.length) { wrap.innerHTML = '<div style="font-size:12px;color:#aaa;padding:10px 0;">No drafts saved.</div>'; return; }
      videos.forEach(v => {
        const row = document.createElement('div');
        row.className = 'vg-video-row'; row.id = `vg-draft-row-${v.id}`;
        row.innerHTML = `<img src="https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg" alt="${v.title}"><div class="vg-video-row-title">${v.title}</div><div style="display:flex;gap:6px;flex-shrink:0;"><button class="vg-publish-draft-btn vg-btn vg-btn-primary" data-id="${v.id}" style="padding:6px 12px;font-size:13px;">Publish</button><button class="vg-delete-draft-btn vg-remove-btn" data-id="${v.id}">Delete</button></div>`;
        wrap.appendChild(row);
      });
      wrap.querySelectorAll('.vg-publish-draft-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Publish this draft?')) return;
          btn.disabled = true; btn.textContent = '...';
          const id = btn.dataset.id;
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_positions`, { method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/videos?id=eq.${id}`, { method: 'PATCH', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ draft: false, position: 0 }) });
            if (!patchRes.ok) throw new Error(await patchRes.text());
            document.getElementById(`vg-draft-row-${id}`)?.remove(); loadVideoList(); loadDraftList();
            const status = document.getElementById('vg-drafts-status');
            status.textContent = '✓ Draft published.'; status.className = 'vg-status success';
            setTimeout(() => status.className = 'vg-status', 4000);
          } catch(e) { btn.disabled = false; btn.textContent = 'Publish'; document.getElementById('vg-drafts-status').textContent = 'Error: ' + e.message; document.getElementById('vg-drafts-status').className = 'vg-status error'; }
        });
      });
      wrap.querySelectorAll('.vg-delete-draft-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Permanently delete this draft?')) return;
          btn.disabled = true; btn.textContent = '...';
          const id = btn.dataset.id;
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/videos?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
            if (!res.ok) throw new Error(await res.text());
            document.getElementById(`vg-draft-row-${id}`)?.remove();
            const status = document.getElementById('vg-drafts-status');
            status.textContent = '✓ Draft deleted.'; status.className = 'vg-status success';
            setTimeout(() => status.className = 'vg-status', 3000);
          } catch(e) { btn.disabled = false; btn.textContent = 'Delete'; }
        });
      });
    } catch(e) { loading.textContent = 'Failed to load drafts.'; }
  }
  document.getElementById('vg-draft-btn').addEventListener('click', async () => {
    const youtubeURL = document.getElementById('vg-yt-url').value.trim();
    const previewFile = document.getElementById('vg-prev-file').files[0] || null;
    const title = document.getElementById('vg-vid-title').value.trim();
    if (!youtubeURL || !previewFile || !title) { showStatus('Please fill in all fields.', 'error'); return; }
    const videoId = extractYouTubeID(youtubeURL);
    if (!videoId) { showStatus('Invalid YouTube URL.', 'error'); return; }
    const btn = document.getElementById('vg-draft-btn');
    btn.disabled = true; btn.textContent = 'Uploading...';
    try {
      const previewUrl = await vgUploadPreview(previewFile);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/videos`, { method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ youtube_id: videoId, preview_url: previewUrl, title, draft: true, position: 9999 }) });
      if (!res.ok) throw new Error(await res.text());
      document.getElementById('vg-yt-url').value = '';
      document.getElementById('vg-prev-file').value = '';
      document.getElementById('vg-vid-title').value = '';
      showStatus('✓ Saved as draft.', 'success'); loadDraftList();
    } catch(e) { showStatus('Error: ' + e.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Save as Draft'; }
  });
  document.getElementById('pu-sidebar-toggle').addEventListener('click', function() {
    var s = document.getElementById('pu-sidebar');
    var w = document.querySelector('.vg-wrap');
    var expanded = s.classList.toggle('expanded');
    if (w) w.style.paddingLeft = expanded ? '200px' : '48px';
    this.innerHTML = expanded ? '&#10005;' : '&#9776;';
  });
