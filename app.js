let selectedFiles = [];
let username = localStorage.getItem('uplox_username') || '';

document.addEventListener('DOMContentLoaded', () => {
  if (username) showUploadInterface();
  setupListeners();
});

function showUploadInterface() {
  document.getElementById('username-screen').classList.add('hidden');
  document.getElementById('upload-screen').classList.remove('hidden');
  document.getElementById('active-username').textContent = `@${username}`;
}

function setupListeners() {
  const form = document.getElementById('username-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('input-username').value.trim();
      if (!val) return;
      username = val;
      localStorage.setItem('uplox_username', username);
      showUploadInterface();
    });
  }

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('fileInput');

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    document.getElementById('btn-complete-upload').disabled = selectedFiles.length === 0;
  });
}

async function performUpload() {
  if (selectedFiles.length === 0 || !username) return;
  const progressBox = document.getElementById('upload-progress-box');
  const progressBar = document.getElementById('progress-bar-fill');
  const statusText = document.getElementById('progress-status-text');
  progressBox.classList.remove('hidden');

  try {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      statusText.textContent = `Uploading ${file.name}`;

      const res = await fetch('/.netlify/functions/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mimeType: file.type || 'application/octet-stream', username })
      });
      if (!res.ok) throw new Error('Failed to get upload URL');
      const { signedUrl, storageKey } = await res.json();

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });
      if (!uploadRes.ok) throw new Error('Storage upload failed');

      await fetch('/.netlify/functions/save-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, storageKey, username, fileSize: file.size, mimeType: file.type })
      });

      progressBar.style.width = `${Math.round(((i + 1) / selectedFiles.length) * 100)}%`;
    }
    alert('Upload complete!');
    selectedFiles = [];
    progressBox.classList.add('hidden');
  } catch (err) {
    alert('Error: ' + err.message);
    progressBox.classList.add('hidden');
  }
}