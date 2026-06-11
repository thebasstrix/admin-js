    function goBack() {
      document.getElementById('form-content').style.display = 'none';
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
      document.getElementById('form-content').style.display = 'block';
      document.querySelector('.sc').classList.add('opaque');
      window.scrollTo(0, 0);
    }

    const fileInput = document.getElementById('mix_file');
    const uploadBox = document.getElementById('upload-box');
    const fileNameDisplay = document.getElementById('file-name-display');

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) {
        fileNameDisplay.textContent = '✓ ' + fileInput.files[0].name;
      }
    });

    uploadBox.addEventListener('dragover', e => {
      e.preventDefault();
      uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
      uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', e => {
      e.preventDefault();
      uploadBox.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        fileNameDisplay.textContent = '✓ ' + e.dataTransfer.files[0].name;
      }
    });

    function showErr(id, show) {
      document.getElementById(id).style.display = show ? 'block' : 'none';
    }

    async function handleSubmit() {
      const name = document.getElementById('name').value.trim();
      const djName = document.getElementById('dj_name').value.trim();
      const location = document.getElementById('location').value;
      const file = fileInput.files[0];
      let valid = true;

      showErr('err-name', !name); if (!name) valid = false;
      showErr('err-dj', !djName); if (!djName) valid = false;
      showErr('err-location', !location); if (!location) valid = false;
      showErr('err-file', !file); if (!file) valid = false;

      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      const backBtn = document.getElementById('back-btn');
      btn.textContent = 'Uploading...';
      btn.disabled = true;
      backBtn.disabled = true;

      const progressWrap = document.getElementById('progress-wrap');
      const progressBar = document.getElementById('progress-bar');
      const pctEl = document.getElementById('progress-pct');
      progressWrap.style.display = 'block';
      pctEl.style.display = 'block';

      const APPS_SCRIPT_URL = 'https://aged-wood-f405.rapid-pine-e011.workers.dev/';

      try {
        // Step 1: Read file as base64 (0–30%)
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

        // Step 2: Upload via XHR for real progress (30–100%)
        const formBody = new URLSearchParams({
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64
        }).toString();

        const uploadResult = await new Promise((resolve, reject) => {
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
            // Bytes delivered to server — now waiting for Google Drive to process
            progressBar.style.width = '100%';
            pctEl.style.display = 'none';
            document.getElementById('processing-msg').style.display = 'block';
            btn.textContent = 'Processing...';
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

        if (uploadResult.status !== 'ok') throw new Error('Upload failed: ' + uploadResult.message);

        document.getElementById('processing-msg').style.display = 'none';
        btn.textContent = 'Submitting...';

        // Step 3: Send details to Formspree
        const payload = {
          name: name,
          dj_name: djName,
          location: location,
          bio: document.getElementById('bio').value,
          _subject: 'Mix Submission: ' + djName
        };

        const resp = await fetch('https://formspree.io/f/xdavlvlz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          document.getElementById('c1').className = 'step-circle done';
          document.getElementById('s2').className = 'step';
          document.getElementById('c2').className = 'step-circle active';

          document.getElementById('form-content').style.display = 'none';
          document.getElementById('thanks-msg').textContent = 'Thanks ' + name + ' — we\'ll give it a listen and be in touch.';
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
        pctEl.textContent = 'Uploading... 0%';
        document.getElementById('processing-msg').style.display = 'none';
      }
    }
