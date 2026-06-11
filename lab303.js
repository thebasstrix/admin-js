function goBack() {
  document.getElementById('page-1').style.display = 'none';
  document.getElementById('steps-nav').style.display = 'none';
  document.getElementById('form-logo-wrap').style.display = 'none';
  document.getElementById('cover-page').style.display = 'block';
  document.querySelector('.sc').classList.remove('opaque');
  window.scrollTo(0, 0);
}

function startForm() {
  document.getElementById('cover-page').style.display = 'none';
  document.getElementById('form-logo-wrap').style.display = 'block';
  document.getElementById('steps-nav').style.display = 'flex';
  document.getElementById('page-1').style.display = 'block';
  document.querySelector('.sc').classList.add('opaque');
  window.scrollTo(0, 0);
}

function goToPage1() {
  document.getElementById('page-2').style.display = 'none';
  document.getElementById('page-1').style.display = 'block';
  document.getElementById('c1').className = 'step-circle active';
  document.getElementById('s2').className = 'step inactive';
  document.getElementById('c2').className = 'step-circle';
  window.scrollTo(0, 0);
}

function goToPage2() {
  const name = document.getElementById('name').value.trim();
  const djName = document.getElementById('dj_name').value.trim();
  const location = document.getElementById('location').value;
  const email = document.getElementById('email').value.trim();
  let valid = true;

  showErr('err-name', !name); if (!name) valid = false;
  showErr('err-dj', !djName); if (!djName) valid = false;
  showErr('err-location', !location); if (!location) valid = false;
  showErr('err-email', !email); if (!email) valid = false;

  if (!valid) return;

  document.getElementById('page-1').style.display = 'none';
  document.getElementById('page-2').style.display = 'block';
  document.getElementById('c1').className = 'step-circle done';
  document.getElementById('s2').className = 'step';
  document.getElementById('c2').className = 'step-circle active';
  window.scrollTo(0, 0);
}

const fileInput = document.getElementById('mix_file');
const uploadBox = document.getElementById('upload-box');
const fileNameDisplay = document.getElementById('file-name-display');
const photoInput = document.getElementById('photo_file');
const photoUploadBox = document.getElementById('photo-upload-box');
const photoNameDisplay = document.getElementById('photo-name-display');

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) fileNameDisplay.textContent = '✓ ' + fileInput.files[0].name;
});

uploadBox.addEventListener('dragover', e => { e.preventDefault(); uploadBox.classList.add('dragover'); });
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', e => {
  e.preventDefault(); uploadBox.classList.remove('dragover');
  if (e.dataTransfer.files[0]) {
    fileInput.files = e.dataTransfer.files;
    fileNameDisplay.textContent = '✓ ' + e.dataTransfer.files[0].name;
  }
});

photoInput.addEventListener('change', () => {
  if (photoInput.files[0]) photoNameDisplay.textContent = '✓ ' + photoInput.files[0].name;
});

photoUploadBox.addEventListener('dragover', e => { e.preventDefault(); photoUploadBox.classList.add('dragover'); });
photoUploadBox.addEventListener('dragleave', () => photoUploadBox.classList.remove('dragover'));
photoUploadBox.addEventListener('drop', e => {
  e.preventDefault(); photoUploadBox.classList.remove('dragover');
  if (e.dataTransfer.files[0]) {
    photoInput.files = e.dataTransfer.files;
    photoNameDisplay.textContent = '✓ ' + e.dataTransfer.files[0].name;
  }
});

function showErr(id, show) {
  document.getElementById(id).style.display = show ? 'block' : 'none';
}

async function uploadFile(file, progressBar, pctEl, processingMsg, btn) {
  const APPS_SCRIPT_URL = 'https://aged-wood-f405.rapid-pine-e011.workers.dev/';

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 30);
        progressBar.style.width = pct + '%';
        pctEl.textContent = 'Reading file... ' + pct + '%';
      }
    };
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  const formBody = new URLSearchParams({
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    data: base64
  }).toString();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', APPS_SCRIPT_URL);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = 30 + Math.round((e.loaded / e.total) * 70);
        progressBar.style.width = pct + '%';
        pctEl.textContent = 'Uploading... ' + pct + '%';
      }
    };

    xhr.upload.onload = () => {
      progressBar.style.width = '100%';
      pctEl.style.display = 'none';
      processingMsg.style.display = 'block';
      if (btn) btn.textContent = 'Processing...';
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch (e) { reject(new Error('Invalid response from server')); }
      } else {
        reject(new Error('Upload error: ' + xhr.status));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formBody);
  });
}

async function handleSubmit() {
  const file = fileInput.files[0];

  if (!file) { showErr('err-file', true); return; }
  showErr('err-file', false);

  if (file.size > 2 * 1024 * 1024 * 1024) {
    alert('Your mix file exceeds the 2GB limit. Please compress or trim it before uploading.');
    return;
  }

  const btn = document.getElementById('submit-btn');
  const backBtn = document.getElementById('back-btn-2');
  btn.textContent = 'Uploading...';
  btn.disabled = true;
  backBtn.disabled = true;

  const progressWrap = document.getElementById('progress-wrap');
  const progressBar = document.getElementById('progress-bar');
  const pctEl = document.getElementById('progress-pct');
  const processingMsg = document.getElementById('processing-msg');
  progressWrap.style.display = 'block';
  pctEl.style.display = 'block';

  try {
    // Upload mix
    const mixResult = await uploadFile(file, progressBar, pctEl, processingMsg, btn);
    if (mixResult.status !== 'ok') throw new Error('Mix upload failed: ' + mixResult.message);
    processingMsg.style.display = 'none';

    // Upload photo if provided
    const photoFile = photoInput.files[0];
    if (photoFile) {
      const photoProgressWrap = document.getElementById('photo-progress-wrap');
      const photoProgressBar = document.getElementById('photo-progress-bar');
      const photoPctEl = document.getElementById('photo-progress-pct');
      const photoProcessingMsg = document.getElementById('photo-processing-msg');
      photoProgressWrap.style.display = 'block';
      photoPctEl.style.display = 'block';
      btn.textContent = 'Uploading photo...';
      const photoResult = await uploadFile(photoFile, photoProgressBar, photoPctEl, photoProcessingMsg, btn);
      if (photoResult.status !== 'ok') throw new Error('Photo upload failed: ' + photoResult.message);
      photoProcessingMsg.style.display = 'none';
    }

    btn.textContent = 'Submitting...';

    const payload = {
      name: document.getElementById('name').value.trim(),
      dj_name: document.getElementById('dj_name').value.trim(),
      location: document.getElementById('location').value,
      email: document.getElementById('email').value.trim(),
      bio: document.getElementById('bio').value,
      _subject: 'Mix Submission: ' + document.getElementById('dj_name').value.trim()
    };

    const resp = await fetch('https://formspree.io/f/xdavlvlz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      document.getElementById('c2').className = 'step-circle done';
      document.getElementById('s3').className = 'step';
      document.getElementById('c3').className = 'step-circle active';
      document.getElementById('page-2').style.display = 'none';
      document.getElementById('thanks-msg').textContent = 'Thanks ' + payload.name + ' — we\'ll give it a listen and be in touch.';
      document.getElementById('thanks-screen').style.display = 'block';
      window.scrollTo(0, 0);
    } else {
      const data = await resp.json();
      throw new Error(data?.errors?.[0]?.message || 'Form submission failed');
    }

  } catch (err) {
    alert('Something went wrong: ' + err.message + '. Please try again.');
    btn.textContent = 'Submit →';
    btn.disabled = false;
    backBtn.disabled = false;
    progressWrap.style.display = 'none';
    progressBar.style.width = '0%';
    pctEl.style.display = 'none';
    processingMsg.style.display = 'none';
  }
}
