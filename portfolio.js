// Portfolio JavaScript - Vanilla JS Implementation

// Safe DOM query helpers: use these to avoid throwing when elements are missing
// $safe(selector, ctx) -> Element | null
// runIfPresent(selector, fn, ctx) -> void  (calls fn(el) only when element exists)
function $safe(selector, ctx = document) {
  try {
    const el = ctx.querySelector(selector);
    if (!el) console.warn(`[safe-query] Element not found for selector: "${selector}". Skipping related render logic.`);
    return el;
  } catch (err) {
    console.warn(`[safe-query] Query failed for selector: "${selector}":`, err);
    return null;
  }
}

function runIfPresent(selector, fn, ctx = document) {
  const el = $safe(selector, ctx);
  if (!el) return;
  try {
    fn(el);
  } catch (err) {
    console.error(`[safe-run] Error while executing render for "${selector}":`, err);
  }
}

class PortfolioApp {
  constructor() {
    this.currentSection = 'personal';
    this.isEditing = false;
    this.achievements = [];
    this.reflections = [];
    this.editingAchievement = null;
    this.editingReflection = null;
    
    this.init();
    this.loadSampleData();
  }

  init() {
    this.bindEvents();
    this.showSection('personal');
    // Load personal info from localStorage if present
    this.loadPersonalInfo();
    // Attempt to initialize Google Drive client if client id/key provided
    try { this.initGoogleDriveClient(); } catch (e) { console.warn('Google Drive client init skipped', e); }
  }

  loadPersonalInfo() {
    try {
      const data = JSON.parse(localStorage.getItem('personalInfo') || '{}');
      if (!data) return;
  const fields = ['firstName','title','bio','email','phone','location','linkedin'];
      fields.forEach(id => {
        const display = document.getElementById(id + '-display');
        const input = document.getElementById(id);
        if (display && typeof data[id] !== 'undefined') display.textContent = data[id];
        if (input && typeof data[id] !== 'undefined') input.value = data[id];
      });
      // Load avatar if present
      const imgData = localStorage.getItem('profilePhoto');
      if (imgData) {
        const img = document.querySelector('.avatar-image');
        const fallback = document.querySelector('.avatar-fallback');
        if (img) { img.src = imgData; img.style.display = 'block'; }
        if (fallback) { fallback.style.display = 'none'; }
      } else {
        // Show initials fallback
        const first = data.firstName || '';
  const last = '';
        const initials = (first[0] || '') + (last[0] || '');
        const fallback = document.querySelector('.avatar-fallback');
        if (fallback) { fallback.textContent = initials; fallback.style.display = 'flex'; }
      }
    } catch (e) { console.warn('Failed to load personal info', e); }
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.showSection(section);
      });
    });

    // Achievement and Reflection Add buttons + form submit handlers
    const addAchBtn = document.getElementById('add-achievement');
    if (addAchBtn) addAchBtn.addEventListener('click', (e) => { e.preventDefault(); this.openAchievementModal(); });
    const achForm = document.getElementById('achievement-form');
    if (achForm) achForm.addEventListener('submit', (e) => { e.preventDefault(); this.saveAchievement(e); });

    const addRefBtn = document.getElementById('add-reflection');
    if (addRefBtn) addRefBtn.addEventListener('click', (e) => { e.preventDefault(); this.openReflectionModal(); });
    const refForm = document.getElementById('reflection-form');
    if (refForm) refForm.addEventListener('submit', (e) => { e.preventDefault(); this.saveReflection(e); });

    // Search inputs for achievements and reflections (debounced)
    const searchDesc = document.getElementById('search-descriptive');
    if (searchDesc) {
      let t = null;
      searchDesc.addEventListener('input', (e) => {
        clearTimeout(t);
        t = setTimeout(() => {
          const cat = this.getActiveDescriptiveCategory() || (document.getElementById('mobile-descriptive-select')?.value || '');
          this.filterAchievements(e.target.value || '', cat);
        }, 180);
      });
    }

    // Mobile select change should also filter achievements
    const mobileSelect = document.getElementById('mobile-descriptive-select');
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        const cat = e.target.value || '';
        // update pills active state
        document.querySelectorAll('.descriptive-category').forEach(b => b.classList.remove('active'));
        const matching = document.querySelector(`.descriptive-category[data-category="${cat}"]`);
        if (matching) matching.classList.add('active');
        const searchVal = document.getElementById('search-descriptive')?.value || '';
        this.filterAchievements(searchVal, cat);
      });
    }

    const searchRef = document.getElementById('search-reflective');
    if (searchRef) {
      let t2 = null;
      searchRef.addEventListener('input', (e) => {
        clearTimeout(t2);
        t2 = setTimeout(() => {
          const mood = document.getElementById('filter-reflective')?.value || '';
          this.filterReflections(e.target.value || '', mood);
        }, 180);
      });
    }

    // Reflective mood filter: update on change
    const moodSelect = document.getElementById('filter-reflective');
    if (moodSelect) {
      moodSelect.addEventListener('change', (e) => {
        const q = document.getElementById('search-reflective')?.value || '';
        this.filterReflections(q, e.target.value || '');
      });
    }

    // Export to PDF button (non-invasive): uses html2canvas + jsPDF
    const exportBtn = document.getElementById('export-pdf');
    if (exportBtn) exportBtn.addEventListener('click', (e) => { e.preventDefault(); this.exportToPdf(); });

  // Personal Info Edit Controls (guarded to avoid throwing if elements are missing)
  const editPersonalBtn = document.getElementById('edit-personal');
  if (editPersonalBtn) editPersonalBtn.addEventListener('click', () => this.toggleEditPersonal(true));
  const savePersonalBtn = document.getElementById('save-personal');
  if (savePersonalBtn) savePersonalBtn.addEventListener('click', () => this.savePersonal());
  const cancelPersonalBtn = document.getElementById('cancel-personal');
  if (cancelPersonalBtn) cancelPersonalBtn.addEventListener('click', () => this.toggleEditPersonal(false));
    // Change photo wiring: open hidden file input
    const changePhotoBtn = document.getElementById('change-photo');
    const photoInput = document.getElementById('profile-photo-input');
    if (changePhotoBtn && photoInput) {
      changePhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        photoInput.click();
      });
      photoInput.addEventListener('change', (ev) => {
        const f = ev.target.files && ev.target.files[0];
        if (!f) return;
        // Resize image client-side to limit localStorage/Drive size before saving
        this.resizeImage(f, 800, 0.8).then(dataUrl => {
          const img = document.querySelector('.avatar-image');
          const fallback = document.querySelector('.avatar-fallback');
          if (img) { img.src = dataUrl; img.style.display = 'block'; }
          if (fallback) { fallback.style.display = 'none'; }
          // Persist to localStorage
          try { localStorage.setItem('profilePhoto', dataUrl); } catch (err) { console.warn('Failed to persist profile photo', err); }
        }).catch(err => {
          console.warn('Image resize failed, falling back to direct read', err);
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            const img = document.querySelector('.avatar-image');
            const fallback = document.querySelector('.avatar-fallback');
            if (img) { img.src = dataUrl; img.style.display = 'block'; }
            if (fallback) { fallback.style.display = 'none'; }
            try { localStorage.setItem('profilePhoto', dataUrl); } catch (err2) { console.warn('Failed to persist profile photo', err2); }
          };
          reader.readAsDataURL(f);
        });
      });
    }

    // ------------------------------------------------------------------
    // Delegated/fallback listeners: in some environments the DOM may be
    // re-rendered or an earlier error prevented the direct bindings above
    // from attaching. Attach delegated listeners on document.body so mobile
    // select, descriptive pills and search inputs still work reliably.
    // ------------------------------------------------------------------
    document.body.addEventListener('click', (e) => {
      const pill = e.target.closest && e.target.closest('.descriptive-category');
      if (pill) {
        try {
          // behave like the per-element handler: set active, sync mobile select, filter
          document.querySelectorAll('.descriptive-category').forEach(b => b.classList.remove('active'));
          pill.classList.add('active');
          pill.setAttribute('aria-pressed', 'true');
          const cat = pill.dataset.category || '';
          const mobile = document.getElementById('mobile-descriptive-select'); if (mobile) mobile.value = cat;
          const searchVal = document.getElementById('search-descriptive')?.value || '';
          console.debug('delegated: descriptive pill clicked', { cat, searchVal });
          this.filterAchievements(searchVal, cat);
        } catch (err) { /* swallow to avoid breaking other handlers */ }
      }
    });

    // Delegated change for mobile select and reflective mood select
    document.body.addEventListener('change', (e) => {
      const tgt = e.target;
      if (!tgt) return;
      if (tgt.id === 'mobile-descriptive-select') {
        const cat = tgt.value || '';
        document.querySelectorAll('.descriptive-category').forEach(b => b.classList.remove('active'));
        const matching = document.querySelector(`.descriptive-category[data-category="${cat}"]`);
        if (matching) matching.classList.add('active');
        const searchVal = document.getElementById('search-descriptive')?.value || '';
        console.debug('delegated: mobile select changed', { cat, searchVal });
        this.filterAchievements(searchVal, cat);
        return;
      }
      if (tgt.id === 'filter-reflective') {
        const q = document.getElementById('search-reflective')?.value || '';
        console.debug('delegated: reflective mood changed', { mood: tgt.value, q });
        this.filterReflections(q, tgt.value || '');
        return;
      }
    });

    // Delegated input for search boxes (debounced)
    let _debounceSearch = null;
    document.body.addEventListener('input', (e) => {
      const tgt = e.target;
      if (!tgt) return;
      if (tgt.id === 'search-descriptive') {
        clearTimeout(_debounceSearch);
        _debounceSearch = setTimeout(() => {
          const cat = this.getActiveDescriptiveCategory() || (document.getElementById('mobile-descriptive-select')?.value || '');
          console.debug('delegated: search-descriptive input', { q: tgt.value, cat });
          this.filterAchievements(tgt.value || '', cat);
        }, 180);
      } else if (tgt.id === 'search-reflective') {
        clearTimeout(_debounceSearch);
        _debounceSearch = setTimeout(() => {
          const mood = document.getElementById('filter-reflective')?.value || '';
          console.debug('delegated: search-reflective input', { q: tgt.value, mood });
          this.filterReflections(tgt.value || '', mood);
        }, 180);
      }
    });

  }

  // Helper: resize an image file to a max dimension and return a data URL
  resizeImage(file, maxDim = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject(new Error('Not an image'));
      const img = new Image();
      const reader = new FileReader();
      reader.onerror = (e) => reject(e);
      reader.onload = (e) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const ratio = width / height;
            if (width > height) {
              if (width > maxDim) { width = maxDim; height = Math.round(maxDim / ratio); }
            } else {
              if (height > maxDim) { height = maxDim; width = Math.round(maxDim * ratio); }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            // Fill white background for JPEG
            ctx.fillStyle = '#fff';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            // Draw centered and cover-style: compute scale and offset to cover the canvas
            const sx = 0, sy = 0;
            ctx.drawImage(img, sx, sy, img.width, img.height, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } catch (err) { reject(err); }
        };
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    }

  // Convert a data URL (base64) into a Blob
  dataURLToBlob(dataURL) {
    if (!dataURL || typeof dataURL !== 'string') return null;
    try {
      const parts = dataURL.split(',');
      const meta = parts[0] || '';
      const b64 = parts[1] || '';
      const m = meta.match(/data:([^;]+);base64/);
      const mime = m ? m[1] : 'application/octet-stream';
      const binary = atob(b64);
      const len = binary.length;
      const u8 = new Uint8Array(len);
      for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
      return new Blob([u8], { type: mime });
    } catch (err) {
      console.warn('dataURLToBlob failed', err);
      return null;
    }
  }

  // Create or return a usable URL for an attachment object/value.
  // attachment may be:
  // - a string: data: URI, http(s) URL, blob: URL, or raw base64
  // - a Blob
  // - an ArrayBuffer or TypedArray
  // - an object with { name, type, data }
  getAttachmentUrl(key, attachment) {
    if (!attachment) return null;
    if (!this._attachmentUrls) this._attachmentUrls = {};
    // If attachment is an object with a data property, use that
    let data = attachment && typeof attachment === 'object' && 'data' in attachment ? attachment.data : attachment;
    let filename = attachment && typeof attachment === 'object' && attachment.name ? attachment.name : null;
    let type = attachment && typeof attachment === 'object' && attachment.type ? attachment.type : '';

    // If it's already a usable URL
    if (typeof data === 'string') {
      const s = data.trim();
      if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) {
        return s;
      }
      if (s.startsWith('data:')) {
        const blob = this.dataURLToBlob(s);
        if (!blob) return null;
        try { if (this._attachmentUrls[key]) URL.revokeObjectURL(this._attachmentUrls[key]); } catch (e) {}
        const url = URL.createObjectURL(blob);
        this._attachmentUrls[key] = url;
        return url;
      }
      // If it's probably a bare base64 string (no prefix), try to convert
      const base64Regex = /^[A-Za-z0-9+/=\s]+$/;
      if (base64Regex.test(s)) {
        const mime = type || 'application/octet-stream';
        const dataURL = `data:${mime};base64,${s.replace(/\s+/g,'')}`;
        const blob = this.dataURLToBlob(dataURL);
        if (!blob) return null;
        try { if (this._attachmentUrls[key]) URL.revokeObjectURL(this._attachmentUrls[key]); } catch (e) {}
        const url = URL.createObjectURL(blob);
        this._attachmentUrls[key] = url;
        return url;
      }
      // Unknown string form - return as-is (may still work)
      return s;
    }

    // Blob
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      try { if (this._attachmentUrls[key]) URL.revokeObjectURL(this._attachmentUrls[key]); } catch (e) {}
      const url = URL.createObjectURL(data);
      this._attachmentUrls[key] = url;
      return url;
    }

    // ArrayBuffer or TypedArray
    if (data && (data instanceof ArrayBuffer || ArrayBuffer.isView(data))) {
      const buf = data instanceof ArrayBuffer ? data : data.buffer;
      const blob = new Blob([buf], { type: type || 'application/octet-stream' });
      try { if (this._attachmentUrls[key]) URL.revokeObjectURL(this._attachmentUrls[key]); } catch (e) {}
      const url = URL.createObjectURL(blob);
      this._attachmentUrls[key] = url;
      return url;
    }

    // Fallback: try JSON/stringify and then base64? unlikely — return null
    return null;
  }

    // Normalize/upgrade loaded JSON data (handles legacy shapes)
    normalizeLoadedData(raw) {
      if (!raw || typeof raw !== 'object') return { achievements: [], reflections: [], personalInfo: {}, profilePhoto: null };
      const normalizeEntry = (entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const out = Object.assign({}, entry);
        // ensure id
        out.id = out.id || (Date.now().toString() + Math.random().toString(36).slice(2,7));
        // migrate single `image` to `images` array
        if (out.image && !out.images) {
          out.images = [{ name: out.image.name || 'image', type: out.image.type || 'image/jpeg', data: out.image.data || out.image }];
          delete out.image;
        }
        // ensure images is an array
        if (!Array.isArray(out.images)) out.images = out.images ? [out.images] : [];
        // ensure required fields exist
        out.title = out.title || '';
        out.category = out.category || '';
        out.date = out.date || new Date().toISOString().split('T')[0];
        out.description = out.description || out.content || '';
        out.status = out.status || 'completed';
        return out;
      };

      const achievements = Array.isArray(raw.achievements) ? raw.achievements.map(normalizeEntry).filter(Boolean) : [];
      const reflections = Array.isArray(raw.reflections) ? raw.reflections.map(normalizeEntry).filter(Boolean) : [];
      const personalInfo = raw.personalInfo || {};
      const profilePhoto = raw.profilePhoto || null;
      return { achievements, reflections, personalInfo, profilePhoto };
    }

  
  

  // Helper: returns currently selected descriptive category ('' means all)
  getActiveDescriptiveCategory() {
    const active = document.querySelector('.descriptive-category.active');
    return (active && active.dataset && typeof active.dataset.category === 'string') ? active.dataset.category : '';
  }

  showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    this.currentSection = sectionName;

    // Load section-specific data
    if (sectionName === 'descriptive') {
      this.renderAchievements();
    } else if (sectionName === 'reflective') {
      this.renderReflections();
      this.updateLinkedAchievements();
    }
  }

  // Personal Info Management
  toggleEditPersonal(editing) {
    this.isEditing = editing;
    // Toggle edit controls
    document.getElementById('edit-personal').classList.toggle('hidden', editing);
    document.getElementById('save-personal').classList.toggle('hidden', !editing);
    document.getElementById('cancel-personal').classList.toggle('hidden', !editing);
    document.getElementById('change-photo').classList.toggle('hidden', !editing);

    // Toggle display spans and input fields
    const fields = [
  'firstName', 'title', 'bio', 'email', 'phone', 'location', 'linkedin'
    ];
    fields.forEach(id => {
      const input = document.getElementById(id);
      const display = document.getElementById(id + '-display');
      if (input && display) {
        if (editing) {
          input.style.display = 'block';
          display.style.display = 'none';
        } else {
          input.style.display = 'none';
          display.style.display = 'block';
        }
      }
    });
  }

  savePersonal() {
    // Update display spans with new values
    const fields = [
      'firstName', 'title', 'bio', 'email', 'phone', 'location', 'linkedin'
    ];
    const saved = JSON.parse(localStorage.getItem('personalInfo') || '{}');
    fields.forEach(id => {
      const input = document.getElementById(id);
      const display = document.getElementById(id + '-display');
      if (input && display) {
        display.textContent = input.value;
        saved[id] = input.value;
      }
    });
    // Update avatar initials
    const firstName = document.getElementById('firstName').value || '';
  const initials = (firstName[0] || '');
    const avatarFallback = document.querySelector('.avatar-fallback');
    if (avatarFallback) { avatarFallback.textContent = initials; }

    // Persist to localStorage
    localStorage.setItem('personalInfo', JSON.stringify(saved));

    this.toggleEditPersonal(false);
    this.showToast('Personal information updated successfully', 'success');
  }

  // Achievement Management
  openAchievementModal(achievement = null) {
    this.editingAchievement = achievement;
    const modal = document.getElementById('achievement-modal');
    const title = document.getElementById('achievement-modal-title');
    
    if (achievement) {
      title.textContent = 'Edit Achievement';
      document.getElementById('achievement-title').value = achievement.title;
      document.getElementById('achievement-category').value = achievement.category;
      document.getElementById('achievement-date').value = achievement.date;
      document.getElementById('achievement-description').value = achievement.description;
      document.getElementById('achievement-status').value = achievement.status;
      // Clear file inputs (browsers won't let us populate them programmatically)
      try { document.getElementById('achievement-image').value = null; } catch (e) {}
      try { document.getElementById('achievement-ppt').value = null; } catch (e) {}
      try { document.getElementById('achievement-pdf').value = null; } catch (e) {}
    } else {
      title.textContent = 'Add Achievement';
      document.getElementById('achievement-form').reset();
      document.getElementById('achievement-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
    // Ensure controls inside this modal reliably close it (bind on open)
    try {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) { closeBtn.onclick = () => this.closeModals(); }
      modal.querySelectorAll('.modal-cancel').forEach(b => { b.onclick = () => this.closeModals(); });
    } catch (e) { /* ignore */ }
  }

  saveAchievement(e) {
    e.preventDefault();
    const getFileData = async (inputId, allowMultiple = false) => {
      const fileInput = document.getElementById(inputId);
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;
      const files = Array.from(fileInput.files);
      // Read each file; for images use resizeImage to limit size
      const readers = files.map(file => {
        return new Promise(async (resolve) => {
          try {
            if (file.type.startsWith('image/')) {
              // Use resizeImage to produce a JPEG data URL
              try {
                const data = await this.resizeImage(file, 800, 0.8);
                resolve({ name: file.name, type: file.type, data });
              } catch (e) {
                // fallback to FileReader
                const r = new FileReader();
                r.onload = (ev) => resolve({ name: file.name, type: file.type, data: ev.target.result });
                r.readAsDataURL(file);
              }
            } else {
              const r = new FileReader();
              r.onload = (ev) => resolve({ name: file.name, type: file.type, data: ev.target.result });
              r.readAsDataURL(file);
            }
          } catch (err) { resolve(null); }
        });
      });
      const results = await Promise.all(readers);
      return allowMultiple ? results.filter(Boolean) : (results[0] || null);
    };

    Promise.all([
      getFileData('achievement-image', true),
      getFileData('achievement-ppt', false),
      getFileData('achievement-pdf', false)
    ]).then(([images, ppt, pdf]) => {
      const formData = {
        id: this.editingAchievement?.id || Date.now().toString(),
        title: document.getElementById('achievement-title').value,
        category: document.getElementById('achievement-category').value,
        date: document.getElementById('achievement-date').value,
        description: document.getElementById('achievement-description').value,
        status: document.getElementById('achievement-status').value,
        images: images || null,
        ppt,
        pdf
      };
      if (this.editingAchievement) {
        const index = this.achievements.findIndex(a => a.id === this.editingAchievement.id);
        this.achievements[index] = formData;
        this.showToast('Achievement updated successfully', 'success');
      } else {
        this.achievements.push(formData);
        this.showToast('Achievement added successfully', 'success');
      }
      this.closeModals();
      this.renderAchievements();
      this.updateLinkedAchievements();
    });
  }

  deleteAchievement(id) {
    if (confirm('Are you sure you want to delete this achievement?')) {
      this.achievements = this.achievements.filter(a => a.id !== id);
      this.renderAchievements();
      this.showToast('Achievement deleted successfully', 'success');
    }
  }

  filterAchievements(search, category) {
    const achievements = document.querySelectorAll('.achievement-card');
    
    achievements.forEach(card => {
      const title = card.querySelector('.achievement-title').textContent.toLowerCase();
      const description = card.querySelector('.achievement-description').textContent.toLowerCase();
      const cardCategory = card.querySelector('.achievement-category').textContent.toLowerCase();
      
      const matchesSearch = title.includes(search.toLowerCase()) || 
                           description.includes(search.toLowerCase());
      const matchesCategory = !category || cardCategory.includes(category.toLowerCase());
      
      card.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
    });
  }

  // Helper to open modal by id (prevents embedding large data URLs into inline handlers)
  openAchievementModalById(id) {
    const a = this.achievements.find(x => x.id === id);
    if (a) this.openAchievementModal(a);
  }

  renderAchievements() {
    const container = document.getElementById('achievements-container');
    
    if (this.achievements.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
          <p class="text-muted" style="font-size: 1.125rem;">No achievements added yet.</p>
          <p class="text-muted" style="margin-top: 0.5rem;">Click "Add Achievement" to get started.</p>
        </div>
      `;
      return;
    }

  container.innerHTML = this.achievements.map(achievement => {
  let fileHtml = '';
      // Images may be an array
      if (Array.isArray(achievement.images) && achievement.images.length) {
        fileHtml += `<div class="achievement-images" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">`;
        achievement.images.forEach(img => {
          if (img && img.data) fileHtml += `<div style="flex:1 0 120px;max-width:220px;"><img src="${img.data}" alt="Achievement Image" style="width:100%;height:auto;border-radius:6px;object-fit:cover;"></div>`;
        });
        fileHtml += `</div>`;
      } else if (achievement.image && achievement.image.data) {
        fileHtml += `<div><img src="${achievement.image.data}" alt="Achievement Image" style="max-width:100%;max-height:200px;margin-bottom:8px;"></div>`;
      }
      // Placeholder container for attachments — we'll create blob URLs after injecting HTML
      if ((achievement.pdf && achievement.pdf.data) || (achievement.ppt && achievement.ppt.data)) {
        fileHtml += `<div class="achievement-files" data-attach-id="${achievement.id}"></div>`;
      }
  return `
  <div class="achievement-card" data-category="${(achievement.category||'').toLowerCase()}">
        <div class="achievement-header">
          <span class="achievement-category ${achievement.category}">${achievement.category}</span>
          <span class="achievement-status ${achievement.status.replace('-', '')}">${achievement.status.replace('-', ' ')}</span>
        </div>
        <h3 class="achievement-title">${achievement.title}</h3>
        <div class="achievement-date">${this.formatDate(achievement.date)}</div>
        <p class="achievement-description">${achievement.description}</p>
        ${fileHtml}
        <div class="achievement-actions">
          <button class="btn btn-outline btn-sm" data-edit-id="${achievement.id}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 a2.828 2.828 0 1 1 4 4L12 16l-4 1 1-4 10.5-10.5z"/>
            </svg>
            Edit
          </button>
          <button class="btn btn-outline btn-sm" data-delete-id="${achievement.id}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
      `;
    }).join('');

    // Revoke any previously created blob URLs to avoid leaks
    try {
      if (!this._attachmentUrls) this._attachmentUrls = {};
      Object.keys(this._attachmentUrls).forEach(k => {
        try { URL.revokeObjectURL(this._attachmentUrls[k]); } catch (e) {}
      });
      this._attachmentUrls = {};
    } catch (e) { /* ignore */ }

    // Convert data URLs to blob URLs and insert real links for attachments
    this.achievements.forEach(achievement => {
      const attachContainer = container.querySelector(`.achievement-files[data-attach-id="${achievement.id}"]`);
      if (!attachContainer) return;
      try {
        // Create a consistent attachment row with: filename label, Open action, and a download-icon
        const makeAttachmentRow = (att, typeKey) => {
          const url = this.getAttachmentUrl(`${achievement.id}-${typeKey}`, att);
          if (!url) return;
          const filename = att && att.name ? att.name : (typeKey === 'pdf' ? `achievement-${achievement.id}.pdf` : `achievement-${achievement.id}.ppt`);

          const row = document.createElement('div');
          row.className = 'attachment-item';

          // Decide open URL: for PPT files, prefer Office Online viewer if URL is publicly addressable
          let openUrl = url;
          if (typeKey === 'ppt') {
            try {
              if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                openUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(url);
              } else {
                // blob: or data: URLs are not accessible to Office Online — open directly
                openUrl = url;
              }
            } catch (e) { openUrl = url; }
          }

          // Make the filename itself the clickable open link (styled as a prominent control)
          const nameLink = document.createElement('a');
          nameLink.className = 'attachment-name attach-open';
          nameLink.href = openUrl; nameLink.target = '_blank'; nameLink.rel = 'noopener';
          nameLink.textContent = filename;
          // Accessibility: allow keyboard focus styling
          nameLink.setAttribute('role', 'button');
          row.appendChild(nameLink);

          // If this is a PPT and the openUrl is not an http(s) URL, try to upload to Drive
          // and open via Office Online viewer. This requires Drive integration (gapi) and auth.
          if (typeKey === 'ppt') {
            const isHttp = (typeof openUrl === 'string' && (openUrl.startsWith('http://') || openUrl.startsWith('https://')));
            if (!isHttp) {
              // Prevent default navigation — we'll handle click
              nameLink.addEventListener('click', async (ev) => {
                ev.preventDefault(); ev.stopPropagation();
                try {
                  // Resolve the attachment data to a Blob if necessary
                  let blob = null;
                  // If att.data is a data: URI string, convert via dataURLToBlob
                  const raw = att && (att.data || att);
                  if (typeof raw === 'string' && raw.startsWith('data:')) {
                    blob = this.dataURLToBlob(raw);
                  } else if (typeof Blob !== 'undefined' && raw instanceof Blob) {
                    blob = raw;
                  } else if (raw && (raw instanceof ArrayBuffer || ArrayBuffer.isView(raw))) {
                    const buf = raw instanceof ArrayBuffer ? raw : raw.buffer;
                    blob = new Blob([buf], { type: att.type || 'application/vnd.ms-powerpoint' });
                  }

                  if (!blob) {
                    this.showToast('Cannot prepare PPT for Office preview locally', 'error');
                    // fallback: open the existing URL (may download)
                    window.open(openUrl, '_blank', 'noopener');
                    return;
                  }

                  // Try Drive upload if available, otherwise attempt anonymous public upload services.
                  // Use defensive checks to avoid reading a null token object.
                  const tokenObj = (typeof gapi !== 'undefined' && gapi && gapi.client && typeof gapi.client.getToken === 'function') ? gapi.client.getToken() : null;
                  let publicUrl = null;
                  if (tokenObj && tokenObj.access_token) {
                    try {
                      this.showToast('Uploading file to Drive for Office preview...', 'info');
                      publicUrl = await this._uploadBlobToDriveAndShare(blob, filename, att.type || 'application/vnd.ms-powerpoint');
                    } catch (e) {
                      console.warn('Drive upload attempt failed, will try anonymous upload', e);
                      publicUrl = null;
                    }
                  }

                  // If Drive didn't produce a public URL, try anonymous hosts (may expire or fail due to CORS)
                  if (!publicUrl) {
                    try {
                      this.showToast('Attempting anonymous upload for Office preview...', 'info');
                      publicUrl = await this._uploadBlobToAnonymousHost(blob, filename, att.type || 'application/vnd.ms-powerpoint');
                    } catch (e) {
                      console.warn('Anonymous upload failed', e);
                      publicUrl = null;
                    }
                  }

                  if (publicUrl) {
                    // Open a helper tab that lets the user add the file to OneDrive (if they sign in)
                    // and view it in Office Online. This provides a smoother flow than directly opening
                    // the viewer (which may prompt to sign in) and gives an explicit option to save.
                    this._openOfficeHelperTab(publicUrl, filename);
                    this.showToast('Opened Office helper tab', 'success');
                    return;
                  }

                  // Final fallback: open the blob URL locally (will typically download)
                  this.showToast('Unable to upload for Office preview — opening locally', 'info');
                  const bUrl = URL.createObjectURL(blob);
                  window.open(bUrl, '_blank', 'noopener');
                  // Revoke after a short delay
                  setTimeout(() => { try { URL.revokeObjectURL(bUrl); } catch (e) {} }, 60_000);
                  return;
                } catch (err) {
                  console.error('Office preview upload failed', err);
                  this.showToast('Unable to open PPT in Office Online: ' + (err && err.message ? err.message : ''), 'error');
                }
              });
            }
          }

          // Download icon (keeps existing download behavior)
          const dl = document.createElement('a');
          dl.href = url; dl.download = filename; dl.className = 'attach-download'; dl.title = 'Download ' + filename; dl.rel = 'noopener';
          dl.innerHTML = `
            <svg class="icon icon-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>`;
          row.appendChild(dl);

          attachContainer.appendChild(row);
        };

        if (achievement.pdf) makeAttachmentRow(achievement.pdf, 'pdf');
        if (achievement.ppt) makeAttachmentRow(achievement.ppt, 'ppt');
      } catch (e) { console.warn('attachment processing failed for achievement', achievement.id, e); }
    });

    // Update category cards counts after rendering
    if (typeof this.updateCategoryCards === 'function') this.updateCategoryCards();

    // Wire category-card clicks (so the summary cards filter the grid)
    document.querySelectorAll('#category-cards .cat-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const key = card.dataset.key || '';
        // Activate matching descriptive pill (ensure aria attributes and unique active state)
        document.querySelectorAll('.descriptive-category').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
        const matchingPill = document.querySelector(`.descriptive-category[data-category="${key}"]`);
        if (matchingPill) { matchingPill.classList.add('active'); matchingPill.setAttribute('aria-pressed','true'); }
        // Update mobile select if present
        const mobileSelect = document.getElementById('mobile-descriptive-select');
        if (mobileSelect) { mobileSelect.value = key || ''; mobileSelect.classList.toggle('active', !!key); }
        // Filter
        this.filterAchievements(document.getElementById('search-descriptive')?.value || '', key);
      });
    });

    // Wire edit/delete buttons by id (avoid embedding large data in onclick)
    container.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.editId;
        this.openAchievementModalById(id);
      });
    });
    container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.deleteId;
        this.deleteAchievement(id);
      });
    });

    // Ensure descriptive pills still filter correctly (rebind in case of dynamic HTML)
    document.querySelectorAll('.descriptive-category').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.descriptive-category').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const cat = e.currentTarget.dataset.category || '';
        const searchVal = document.getElementById('search-descriptive')?.value || '';
        // Sync mobile select
        const mobile = document.getElementById('mobile-descriptive-select'); if (mobile) mobile.value = cat;
        this.filterAchievements(searchVal, cat);
      };
    });
  }

  // Override filterAchievements to use achievement.dataset or data-category attribute instead of inner text
  filterAchievements(search, category) {
    const q = (search || '').toLowerCase();
    const achievements = document.querySelectorAll('.achievement-card');
    achievements.forEach(card => {
      const titleEl = card.querySelector('.achievement-title');
      const descEl = card.querySelector('.achievement-description');
      const title = (titleEl && titleEl.textContent || '').toLowerCase();
      const description = (descEl && descEl.textContent || '').toLowerCase();
      const cardCategory = (card.dataset.category || (card.querySelector('.achievement-category') && card.querySelector('.achievement-category').textContent) || '').toLowerCase();
      // Prefer title match; fall back to description if title not matched
      const matchesSearch = q === '' ? true : (title.includes(q) || description.includes(q));
      const matchesCategory = !category || category === '' || cardCategory === (category || '').toLowerCase();
      card.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
    });
  }

  // Update the small category cards' counts based on current achievements
  updateCategoryCards() {
    // Count exactly the four requested categories
    const keys = {
      academic: 0,
      clinical: 0,
      extracurricular: 0,
      research: 0
    };
    (this.achievements || []).forEach(a => {
      const cat = (a.category || '').toLowerCase();
      if (cat === 'academic') keys.academic++;
      else if (cat === 'clinical') keys.clinical++;
      else if (cat === 'extracurricular' || cat === 'extracurriculars') keys.extracurricular++;
      else if (cat === 'research') keys.research++;
    });

    const cards = document.querySelectorAll('#category-cards .cat-card');
    cards.forEach(card => {
      const key = card.dataset.key;
      const count = keys[key] || 0;
      const countEl = card.querySelector('.cat-count');
      if (countEl) countEl.textContent = count;
    });
  }

  // Reflection Management
  openReflectionModal(reflection = null) {
    this.editingReflection = reflection;
    const modal = document.getElementById('reflection-modal');
    const title = document.getElementById('reflection-modal-title');
    
    if (reflection) {
      title.textContent = 'Edit Reflection';
      document.getElementById('reflection-title').value = reflection.title;
      document.getElementById('reflection-date').value = reflection.date;
      document.getElementById('reflection-mood').value = reflection.mood;
      document.getElementById('reflection-content').value = reflection.content;
      document.getElementById('reflection-linked').value = reflection.linkedAchievement || '';
      // Clear file inputs for security/browsers and avoid stale file submission
      try { document.getElementById('reflection-image').value = null; } catch (e) {}
      try { document.getElementById('reflection-ppt').value = null; } catch (e) {}
      try { document.getElementById('reflection-pdf').value = null; } catch (e) {}
    } else {
      title.textContent = 'Add Reflection';
      document.getElementById('reflection-form').reset();
      document.getElementById('reflection-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
    // Ensure controls inside this modal reliably close it (bind on open)
    try {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) { closeBtn.onclick = () => this.closeModals(); }
      modal.querySelectorAll('.modal-cancel').forEach(b => { b.onclick = () => this.closeModals(); });
    } catch (e) { /* ignore */ }
  }

  saveReflection(e) {
    e.preventDefault();
    const getFileData = async (inputId, allowMultiple = false) => {
      const fileInput = document.getElementById(inputId);
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;
      const files = Array.from(fileInput.files);
      const readers = files.map(file => {
        return new Promise(async (resolve) => {
          try {
            if (file.type.startsWith('image/')) {
              try {
                const data = await this.resizeImage(file, 800, 0.8);
                resolve({ name: file.name, type: file.type, data });
              } catch (e) {
                const r = new FileReader();
                r.onload = (ev) => resolve({ name: file.name, type: file.type, data: ev.target.result });
                r.readAsDataURL(file);
              }
            } else {
              const r = new FileReader();
              r.onload = (ev) => resolve({ name: file.name, type: file.type, data: ev.target.result });
              r.readAsDataURL(file);
            }
          } catch (err) { resolve(null); }
        });
      });
      const results = await Promise.all(readers);
      return allowMultiple ? results.filter(Boolean) : (results[0] || null);
    };

    Promise.all([
      getFileData('reflection-image', true),
      getFileData('reflection-ppt', false),
      getFileData('reflection-pdf', false)
    ]).then(([images, ppt, pdf]) => {
      const formData = {
        id: this.editingReflection?.id || Date.now().toString(),
        title: document.getElementById('reflection-title').value,
        date: document.getElementById('reflection-date').value,
        mood: document.getElementById('reflection-mood').value,
        content: document.getElementById('reflection-content').value,
        linkedAchievement: document.getElementById('reflection-linked').value || null,
        images: images || null,
        ppt,
        pdf
      };
      if (this.editingReflection) {
        const index = this.reflections.findIndex(r => r.id === this.editingReflection.id);
        this.reflections[index] = formData;
        this.showToast('Reflection updated successfully', 'success');
      } else {
        this.reflections.push(formData);
        this.showToast('Reflection added successfully', 'success');
      }
      this.closeModals();
      this.renderReflections();
    });
  }

  openReflectionModalById(id) {
    const r = this.reflections.find(x => x.id === id);
    if (r) this.openReflectionModal(r);
  }

  deleteReflection(id) {
    if (confirm('Are you sure you want to delete this reflection?')) {
      this.reflections = this.reflections.filter(r => r.id !== id);
      this.renderReflections();
      this.showToast('Reflection deleted successfully', 'success');
    }
  }

  filterReflections(search, mood) {
    const q = (search || '').toLowerCase();
    const reflections = document.querySelectorAll('.reflection-card');
    reflections.forEach(card => {
      const titleEl = card.querySelector('.reflection-title');
      const contentEl = card.querySelector('.reflection-content');
      const moodEl = card.querySelector('.reflection-mood');
      const title = (titleEl && titleEl.textContent || '').toLowerCase();
      const content = (contentEl && contentEl.textContent || '').toLowerCase();
      const cardMood = (moodEl && moodEl.textContent || '').toLowerCase();
      const matchesSearch = q === '' ? true : (title.includes(q) || content.includes(q));
      const matchesMood = !mood || mood === '' ? true : cardMood === (mood || '').toLowerCase();
      card.style.display = (matchesSearch && matchesMood) ? 'block' : 'none';
    });
  }

  renderReflections() {
    const container = document.getElementById('reflections-container');
    
    if (this.reflections.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding: 3rem;">
          <p class="text-muted" style="font-size: 1.125rem;">No reflections added yet.</p>
          <p class="text-muted" style="margin-top: 0.5rem;">Click "Add Reflection" to start journaling your experiences.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.reflections.map(reflection => {
      const linkedAchievement = this.achievements.find(a => a.id === reflection.linkedAchievement);
      let fileHtml = '';
      if (Array.isArray(reflection.images) && reflection.images.length) {
        fileHtml += `<div class="reflection-images" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">`;
        reflection.images.forEach(img => { if (img && img.data) fileHtml += `<div style="flex:1 0 120px;max-width:220px;"><img src="${img.data}" alt="Reflection Image" style="width:100%;height:auto;border-radius:6px;object-fit:cover;"></div>` });
        fileHtml += `</div>`;
      } else if (reflection.image && reflection.image.data) {
        fileHtml += `<div><img src="${reflection.image.data}" alt="Reflection Image" style="max-width:100%;max-height:200px;margin-bottom:8px;"></div>`;
      }
      // Placeholder container for attachments — we'll create blob URLs after injecting HTML
      if ((reflection.pdf && reflection.pdf.data) || (reflection.ppt && reflection.ppt.data)) {
        fileHtml += `<div class="reflection-files" data-attach-id="${reflection.id}"></div>`;
      }
      return `
        <div class="reflection-card">
          <div class="reflection-header">
            <div class="reflection-meta">
              <span class="reflection-mood ${reflection.mood}">${reflection.mood}</span>
              <div class="reflection-date">${this.formatDate(reflection.date)}</div>
            </div>
            <div class="reflection-actions">
                <button class="btn btn-outline btn-sm" data-edit-id="${reflection.id}">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 a2.828 2.828 0 1 1 4 4L12 16l-4 1 1-4 10.5-10.5z"/>
                </svg>
                Edit
              </button>
                <button class="btn btn-outline btn-sm" data-delete-id="${reflection.id}">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
          <h3 class="reflection-title">${reflection.title}</h3>
          <div class="reflection-content">${reflection.content}</div>
          ${fileHtml}
          ${linkedAchievement ? `
            <div class="reflection-linked">
              <div class="reflection-linked-label">Linked Achievement</div>
              <div class="reflection-linked-title">${linkedAchievement.title}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Wire edit/delete handlers for reflections
    container.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.editId;
        this.openReflectionModalById(id);
      });
    });
    container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.deleteId;
        this.deleteReflection(id);
      });
    });

    // Attach blob-backed links for reflection attachments
    try {
      if (!this._attachmentUrls) this._attachmentUrls = {};
      this.reflections.forEach(reflection => {
        const attachContainer = container.querySelector(`.reflection-files[data-attach-id="${reflection.id}"]`);
        if (!attachContainer) return;
        try {
          const makeAttachmentRow = (att, typeKey) => {
            const url = this.getAttachmentUrl(`${reflection.id}-${typeKey}`, att);
            if (!url) return;
            const filename = att && att.name ? att.name : (typeKey === 'pdf' ? `reflection-${reflection.id}.pdf` : `reflection-${reflection.id}.ppt`);

            const row = document.createElement('div');
            row.className = 'attachment-item';

            let openUrl = url;
            if (typeKey === 'ppt') {
              try {
                if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                  openUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(url);
                } else {
                  openUrl = url;
                }
              } catch (e) { openUrl = url; }
            }

            const nameLink = document.createElement('a');
            nameLink.className = 'attachment-name attach-open';
            nameLink.href = openUrl; nameLink.target = '_blank'; nameLink.rel = 'noopener';
            nameLink.textContent = filename;
            nameLink.setAttribute('role', 'button');
            row.appendChild(nameLink);

            if (typeKey === 'ppt') {
              const isHttp = (typeof openUrl === 'string' && (openUrl.startsWith('http://') || openUrl.startsWith('https://')));
              if (!isHttp) {
                nameLink.addEventListener('click', async (ev) => {
                  ev.preventDefault(); ev.stopPropagation();
                  try {
                    let blob = null;
                    const raw = att && (att.data || att);
                    if (typeof raw === 'string' && raw.startsWith('data:')) {
                      blob = this.dataURLToBlob(raw);
                    } else if (typeof Blob !== 'undefined' && raw instanceof Blob) {
                      blob = raw;
                    } else if (raw && (raw instanceof ArrayBuffer || ArrayBuffer.isView(raw))) {
                      const buf = raw instanceof ArrayBuffer ? raw : raw.buffer;
                      blob = new Blob([buf], { type: att.type || 'application/vnd.ms-powerpoint' });
                    }

                    if (!blob) {
                      this.showToast('Cannot prepare PPT for Office preview locally', 'error');
                      window.open(openUrl, '_blank', 'noopener');
                      return;
                    }

                    const tokenObj = (typeof gapi !== 'undefined' && gapi && gapi.client && typeof gapi.client.getToken === 'function') ? gapi.client.getToken() : null;
                    let publicUrl = null;
                    if (tokenObj && tokenObj.access_token) {
                      try {
                        this.showToast('Uploading file to Drive for Office preview...', 'info');
                        publicUrl = await this._uploadBlobToDriveAndShare(blob, filename, att.type || 'application/vnd.ms-powerpoint');
                      } catch (e) {
                        console.warn('Drive upload attempt failed, will try anonymous upload', e);
                        publicUrl = null;
                      }
                    }

                    if (!publicUrl) {
                      try {
                        this.showToast('Attempting anonymous upload for Office preview...', 'info');
                        publicUrl = await this._uploadBlobToAnonymousHost(blob, filename, att.type || 'application/vnd.ms-powerpoint');
                      } catch (e) {
                        console.warn('Anonymous upload failed', e);
                        publicUrl = null;
                      }
                    }

                    if (publicUrl) {
                      const officeViewer = 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(publicUrl);
                      window.open(officeViewer, '_blank', 'noopener');
                      this.showToast('Opened in Office Online', 'success');
                      return;
                    }

                    this.showToast('Unable to upload for Office preview — opening locally', 'info');
                    const bUrl = URL.createObjectURL(blob);
                    window.open(bUrl, '_blank', 'noopener');
                    setTimeout(() => { try { URL.revokeObjectURL(bUrl); } catch (e) {} }, 60_000);
                    return;
                  } catch (err) {
                    console.error('Office preview upload failed', err);
                    this.showToast('Unable to open PPT in Office Online: ' + (err && err.message ? err.message : ''), 'error');
                  }
                });
              }
            }

            const dl = document.createElement('a');
            dl.href = url; dl.download = filename; dl.className = 'attach-download'; dl.title = 'Download ' + filename; dl.rel = 'noopener';
            dl.innerHTML = `
              <svg class="icon icon-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>`;
            row.appendChild(dl);

            attachContainer.appendChild(row);
          };

          if (reflection.pdf) makeAttachmentRow(reflection.pdf, 'pdf');
          if (reflection.ppt) makeAttachmentRow(reflection.ppt, 'ppt');
        } catch (e) { console.warn('attachment processing failed for reflection', reflection.id, e); }
      });
    } catch (e) { /* ignore */ }
  }

  updateLinkedAchievements() {
    const select = document.getElementById('reflection-linked');
    select.innerHTML = '<option value="">No linked achievement</option>' +
      this.achievements.map(achievement => 
        `<option value="${achievement.id}">${achievement.title}</option>`
      ).join('');
  }

  // Utility Methods
  closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
    this.editingAchievement = null;
    this.editingReflection = null;
  }

  // Export visible portfolio content to PDF using html2canvas + jsPDF
  async exportToPdf() {
    try {
      if (typeof html2canvas === 'undefined' || (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined')) {
        this.showToast('PDF libraries not loaded', 'error');
        return;
      }
      const JSPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (typeof jsPDF !== 'undefined' ? jsPDF : null);
      if (!JSPDF) { this.showToast('jsPDF not available', 'error'); return; }

      // PDF layout parameters
      const pdf = new JSPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28; // points
      const contentWidth = pageWidth - margin * 2;
      let cursorY = margin;

      // Color map for categories and statuses (approximate)
      const categoryColors = {
        academic: { bg: '#eaf4ff', color: '#2b8aef' },
        clinical: { bg: '#ecfdf5', color: '#10b981' },
        extracurricular: { bg: '#fff7ed', color: '#f97316' },
        research: { bg: '#f3e8ff', color: '#8b5cf6' },
        certification: { bg: '#fff7f0', color: '#ef4444' }
      };
      const statusColors = {
        completed: '#10b981',
        'in-progress': '#f59e0b',
        planned: '#3b82f6'
      };

      // Helper to create a styled card DOM node for an achievement or reflection
      const createAchievementCardNode = (a) => {
        const card = document.createElement('div');
        card.style.boxSizing = 'border-box';
        card.style.width = '800px';
        card.style.padding = '14px';
        card.style.borderRadius = '12px';
        card.style.background = '#ffffff';
        card.style.boxShadow = '0 8px 24px rgba(16,24,40,0.06)';
        card.style.marginBottom = '12px';
        // Header row with category badge and status
        const header = document.createElement('div'); header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center';
        const left = document.createElement('div'); left.style.display='flex'; left.style.alignItems='center'; left.style.gap='10px';
        const cat = document.createElement('div');
        const catKey = (a.category || '').toLowerCase();
        const catStyle = categoryColors[catKey] || { bg: '#f3f4f6', color: '#374151' };
        cat.textContent = (a.category || '').toUpperCase();
        cat.style.background = catStyle.bg; cat.style.color = catStyle.color; cat.style.fontWeight='700'; cat.style.padding='6px 8px'; cat.style.borderRadius='999px'; cat.style.fontSize='11px';
        left.appendChild(cat);
        header.appendChild(left);

        const right = document.createElement('div'); right.style.display='flex'; right.style.alignItems='center'; right.style.gap='8px';
        const status = document.createElement('div'); status.textContent = (a.status || '').replace('-', ' ');
        const stColor = statusColors[(a.status||'').toLowerCase()] || '#6b7280';
        status.style.color = stColor; status.style.border = `1px solid ${stColor}33`; status.style.padding='6px 8px'; status.style.borderRadius='999px'; status.style.fontSize='11px'; status.style.fontWeight='700';
        right.appendChild(status);
        header.appendChild(right);

        card.appendChild(header);
        const title = document.createElement('h3'); title.textContent = a.title || ''; title.style.margin='10px 0 6px 0'; title.style.fontSize='16px'; title.style.color='#0f172a';
        card.appendChild(title);
        const meta = document.createElement('div'); meta.textContent = this.formatDate(a.date || new Date().toISOString()); meta.style.fontSize='12px'; meta.style.color='#64748b'; card.appendChild(meta);
        const desc = document.createElement('p'); desc.textContent = a.description || ''; desc.style.fontSize='13px'; desc.style.color='#475569'; desc.style.marginTop='8px'; desc.style.lineHeight='1.4'; card.appendChild(desc);
        // images
        if (Array.isArray(a.images) && a.images.length) {
          const row = document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.flexWrap='wrap'; row.style.marginTop='10px';
          a.images.forEach(img => { if (!img || !img.data) return; const im = document.createElement('img'); im.src = img.data; im.style.width='220px'; im.style.height='140px'; im.style.objectFit='cover'; im.style.borderRadius='8px'; im.style.boxShadow='0 6px 18px rgba(16,24,40,0.06)'; row.appendChild(im); });
          card.appendChild(row);
        }
        return card;
      };

      const createReflectionCardNode = (r) => {
        const card = document.createElement('div');
        card.style.boxSizing = 'border-box';
        card.style.width = '800px';
        card.style.padding = '14px';
        card.style.borderRadius = '12px';
        card.style.background = '#ffffff';
        card.style.boxShadow = '0 8px 24px rgba(16,24,40,0.06)';
        card.style.marginBottom = '12px';
        const header = document.createElement('div'); header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center';
        const left = document.createElement('div'); left.style.display='flex'; left.style.flexDirection='column';
        const mood = document.createElement('div'); mood.textContent = (r.mood || '').toUpperCase(); mood.style.fontSize='11px'; mood.style.fontWeight='700'; mood.style.color='#0f172a';
        left.appendChild(mood);
        header.appendChild(left);
        const right = document.createElement('div'); right.style.fontSize='12px'; right.style.color='#64748b'; right.textContent = this.formatDate(r.date || new Date().toISOString());
        header.appendChild(right);
        card.appendChild(header);
        const title = document.createElement('h3'); title.textContent = r.title || ''; title.style.margin='10px 0 6px 0'; title.style.fontSize='16px'; title.style.color='#0f172a';
        card.appendChild(title);
        const content = document.createElement('div'); content.textContent = r.content || ''; content.style.fontSize='13px'; content.style.color='#475569'; content.style.lineHeight='1.5'; content.style.marginTop='8px'; card.appendChild(content);
        if (Array.isArray(r.images) && r.images.length) {
          const row = document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.flexWrap='wrap'; row.style.marginTop='10px';
          r.images.forEach(img => { if (!img || !img.data) return; const im = document.createElement('img'); im.src = img.data; im.style.width='220px'; im.style.height='140px'; im.style.objectFit='cover'; im.style.borderRadius='8px'; im.style.boxShadow='0 6px 18px rgba(16,24,40,0.06)'; row.appendChild(im); });
          card.appendChild(row);
        }
        return card;
      };

      // Create hidden render container
      const renderRoot = document.createElement('div');
      renderRoot.style.position = 'fixed'; renderRoot.style.left='-9999px'; renderRoot.style.top='0'; renderRoot.style.width='820px'; renderRoot.style.zIndex='99999'; renderRoot.style.padding='10px';
      document.body.appendChild(renderRoot);

      // Personal header card
      try {
        const personalInfo = JSON.parse(localStorage.getItem('personalInfo') || '{}');
        const personalCard = document.createElement('div'); personalCard.style.width='800px'; personalCard.style.padding='14px'; personalCard.style.background='#fff'; personalCard.style.borderRadius='12px'; personalCard.style.boxShadow='0 8px 24px rgba(16,24,40,0.06)'; personalCard.style.marginBottom='12px';
        const name = document.createElement('h1'); name.textContent = personalInfo.firstName || document.getElementById('firstName-display')?.textContent || 'Profile'; name.style.margin='0 0 6px 0'; name.style.fontSize='20px'; personalCard.appendChild(name);
        const prof = document.createElement('div'); prof.textContent = personalInfo.title || document.getElementById('title-display')?.textContent || ''; prof.style.color='#64748b'; personalCard.appendChild(prof);
        const bio = document.createElement('p'); bio.textContent = personalInfo.bio || document.getElementById('bio-display')?.textContent || ''; bio.style.marginTop='8px'; bio.style.color='#475569'; personalCard.appendChild(bio);
        renderRoot.appendChild(personalCard);
      } catch (e) { /* ignore */ }

      // Achievements grouped by category with stylish cards
      const categories = ['academic','clinical','extracurricular','research','certification'];
      for (const cat of categories) {
        const items = (this.achievements || []).filter(a => ((a.category||'').toLowerCase() === cat));
        if (!items || items.length === 0) continue;
        const sectionTitle = document.createElement('div'); sectionTitle.style.width='800px'; sectionTitle.style.margin='12px 0'; const h2 = document.createElement('h2'); h2.textContent = cat.charAt(0).toUpperCase() + cat.slice(1); h2.style.fontSize='18px'; h2.style.margin='0 0 8px 0'; sectionTitle.appendChild(h2); renderRoot.appendChild(sectionTitle);
        for (const it of items) {
          const node = createAchievementCardNode(it);
          renderRoot.appendChild(node);
        }
      }

      // Reflections
      if ((this.reflections || []).length) {
        const h2wrap = document.createElement('div'); h2wrap.style.width='800px'; const h2 = document.createElement('h2'); h2.textContent='Reflections'; h2.style.fontSize='18px'; h2.style.margin='12px 0 8px 0'; h2wrap.appendChild(h2); renderRoot.appendChild(h2wrap);
        for (const r of this.reflections) {
          const node = createReflectionCardNode(r);
          renderRoot.appendChild(node);
        }
      }

      // Now render each child (which should be individual cards/sections) and add to PDF, stacking vertically
      const children = Array.from(renderRoot.children);
      let pageIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        // Render node to canvas
        // Use scale 2 for clarity
        // Ensure images are loaded by waiting a tick
        await new Promise(r => setTimeout(r, 50));
        const canvas = await html2canvas(node, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        // compute image size in pdf points
        const pxWidth = canvas.width;
        const pxHeight = canvas.height;
        const pdfImgWidth = contentWidth; // fit to content width
        const pdfImgHeight = (pxHeight * pdfImgWidth) / pxWidth;

        if (cursorY + pdfImgHeight > pageHeight - margin) {
          pdf.addPage(); pageIndex++; cursorY = margin;
        }
        pdf.addImage(imgData, 'JPEG', margin, cursorY, pdfImgWidth, pdfImgHeight);
        cursorY += pdfImgHeight + 12; // small gap
      }

      // Cleanup render root
      document.body.removeChild(renderRoot);
      // Save PDF
      const filename = `portfolio-export-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      this.showToast('Exported portfolio to PDF', 'success');
    } catch (err) {
      console.error('exportToPdf error', err);
      this.showToast('Failed to export PDF', 'error');
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  showToast(message, type = 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'hsl(142 71% 45%)' : 'hsl(210 85% 45%)'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-weight: 500;
      transition: all 0.3s ease;
      transform: translateX(100%);
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Sample Data Loader
  loadSampleData() {
    this.achievements = [
      {
        id: '1',
        title: 'Anatomy Midterm Examination',
        category: 'academic',
        date: '2024-03-15',
        description: 'Successfully completed the anatomy midterm examination with a score of 95%. Demonstrated comprehensive understanding of human anatomical systems.',
        status: 'completed'
      },
      {
        id: '2',
        title: 'Cardiology Rotation',
        category: 'clinical',
        date: '2024-02-01',
        description: 'Completed 6-week rotation in the cardiology department, observing various procedures and patient consultations.',
        status: 'completed'
      },
      {
        id: '3',
        title: 'Research Project on Hypertension',
        category: 'research',
        date: '2024-04-01',
        description: 'Currently conducting research on the effects of lifestyle modifications on hypertension management in young adults.',
        status: 'in-progress'
      },
      {
        id: '4',
        title: 'CPR Certification',
        category: 'certification',
        date: '2024-01-20',
        description: 'Obtained CPR certification from the American Heart Association, valid for 2 years.',
        status: 'completed'
      }
    ];

    this.reflections = [
      {
        id: '1',
        title: 'First Day in Cardiology',
        date: '2024-02-01',
        mood: 'positive',
        content: 'Today marked the beginning of my cardiology rotation, and I couldn\'t be more excited. The attending physician was incredibly welcoming and took time to explain the different types of cases we might encounter. I observed my first echocardiogram and was amazed by the technology that allows us to see the heart in real-time. This experience reinforced my interest in cardiology as a potential specialty.',
        linkedAchievement: '2'
      },
      {
        id: '2',
        title: 'Challenging Patient Case',
        date: '2024-02-15',
        mood: 'challenging',
        content: 'Today I encountered a complex case involving a patient with multiple comorbidities. It was challenging to understand how all the conditions interacted with each other, and I felt overwhelmed at first. However, working through the case with the resident helped me understand the importance of taking a holistic approach to patient care. This experience taught me that medicine is not just about treating individual symptoms but understanding the patient as a whole.',
        linkedAchievement: null
      },
      {
        id: '3',
        title: 'Research Progress Update',
        date: '2024-03-20',
        mood: 'positive',
        content: 'Made significant progress on my hypertension research project today. Successfully recruited 25 participants and completed baseline measurements. The preliminary data is looking promising, and I\'m excited to see how the intervention affects blood pressure readings over the next few months. This research is giving me valuable experience in clinical research methodology.',
        linkedAchievement: '3'
      }
    ];
  }
}

// Initialize the application
const app = new PortfolioApp();
// Expose the instance to the global scope so inline handlers and other
// scripts can reliably reference it as `app`. Top-level `const` does not
// always create a `window` property in all environments, so set it here.
window.app = app;

// -----------------------------------------------------------------------------
// GitHub / Repository JSON Auto-Loader
// -----------------------------------------------------------------------------
// Behavior requested by user:
// - When someone opens the site, the script should attempt to load a JSON file
//   that you manually upload to the same repository/directory as `portfolio.html`.
// - You will keep exactly one JSON file in the repo; this loader expects the
//   file to be named `portfolio-data.json` and placed next to the HTML file.
// - The loader will NOT modify, rename, or touch any files on Google Drive.
// -----------------------------------------------------------------------------

PortfolioApp.prototype.loadFromRepoIfPresent = async function() {
  const repoFilename = './portfolio-data.json';
  try {
    const resp = await fetch(repoFilename, { cache: 'no-store' });
    if (!resp.ok) {
      // File not present or HTTP error - keep sample/local data
      console.log(`Repo JSON not found at ${repoFilename} (status ${resp.status}). Using local data.`);
      return false;
    }
  const data = await resp.json();
  // Normalize older JSON shapes so legacy files won't break the app
  const normalized = (this && typeof this.normalizeLoadedData === 'function') ? this.normalizeLoadedData(data) : data;
    if (!data) {
      console.warn('Repo JSON fetched but empty / invalid.');
      return false;
    }
    // Apply normalized data to the instance (use safe instance reference)
    const inst = (this && typeof this.renderAchievements === 'function') ? this : (window.app || this);
    inst.achievements = Array.isArray(normalized.achievements) ? normalized.achievements : [];
    inst.reflections = Array.isArray(normalized.reflections) ? normalized.reflections : [];
    // Restore personal info and profile photo if present
    try {
      if (normalized.personalInfo) localStorage.setItem('personalInfo', JSON.stringify(normalized.personalInfo));
      if (normalized.profilePhoto) localStorage.setItem('profilePhoto', normalized.profilePhoto);
    } catch (e) { console.warn('Failed to persist personal info from repo JSON', e); }
    if (typeof inst.loadPersonalInfo === 'function') inst.loadPersonalInfo();
    // Re-render UI now that data is replaced
    if (typeof inst.renderAchievements === 'function') inst.renderAchievements();
    if (typeof inst.renderReflections === 'function') inst.renderReflections();
    if (typeof inst.updateLinkedAchievements === 'function') inst.updateLinkedAchievements();
    console.log('Loaded portfolio data from repository JSON.');
    return true;
  } catch (err) {
    console.error('Error loading repo JSON', err);
    return false;
  }
}

// Attempt to load repo JSON immediately on page open. If absent, keep sample data.
;(async function() {
  // Wait a tick for DOM to be ready (PortfolioApp constructor already ran)
  if (window.app && typeof window.app.loadFromRepoIfPresent === 'function') {
    const loaded = await window.app.loadFromRepoIfPresent();
    if (!loaded) {
      console.log('Using built-in/sample data. To publish live data, upload `portfolio-data.json` to the same directory as your site.');
    }
  }
})();

// Drive persistence methods added to app prototype
PortfolioApp.prototype.findDriveFile = async function(filename) {
  try {
    const res = await gapi.client.request({
      path: 'https://www.googleapis.com/drive/v3/files',
      method: 'GET',
      params: { q: `name='${filename.replace(/'/g, "\\'")}' and trashed=false`, fields: 'files(id,name)'}
    });
    return (res.result.files && res.result.files[0]) || null;
  } catch (e) {
    console.error('findDriveFile error', e);
    throw e;
  }
}

PortfolioApp.prototype.saveToDrive = async function() {
  try {
    // Guard: ensure gapi and gapi.client exist to avoid ReferenceError when Drive is not initialized
    if (typeof gapi === 'undefined' || !gapi || !gapi.client) {
      this.showToast('Google API not loaded. Initialize Drive integration first.', 'error');
      return;
    }
    if (!gapi.client.getToken || !gapi.client.getToken().access_token) {
      this.showToast('Not authenticated with Drive', 'info');
      return;
    }
    const filename = 'portfolio-data.json';
    const existing = await this.findDriveFile(filename).catch(()=>null);
    const metadata = { name: filename, mimeType: 'application/json' };
  // Include personalInfo and profilePhoto (if any) from localStorage in the saved JSON
  const personalInfo = JSON.parse(localStorage.getItem('personalInfo') || '{}');
  const profilePhoto = localStorage.getItem('profilePhoto') || null;
  const content = JSON.stringify({ achievements: this.achievements, reflections: this.reflections, personalInfo, profilePhoto }, null, 2);

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      close_delim;

    let path = 'https://www.googleapis.com/upload/drive/v3/files';
    if (existing && existing.id) {
      path += '/' + existing.id + '?uploadType=multipart';
    } else {
      path += '?uploadType=multipart';
    }

    const resp = await gapi.client.request({
      path,
      method: existing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
      body: multipartRequestBody
    });
    console.log('Drive save response', resp);
    // Use safe instance reference
    const inst = (this && typeof this.loadFromDrive === 'function') ? this : (window.app || this);
    if (inst && typeof inst.showToast === 'function') inst.showToast('Saved portfolio to Google Drive', 'success');
    // After a successful save, reload the file from Drive so the in-memory
    // representation exactly matches what was saved.
    try {
      if (inst && typeof inst.loadFromDrive === 'function') await inst.loadFromDrive();
    } catch (e) {
      console.warn('Saved to Drive but failed to reload immediately', e);
    }
  } catch (e) {
    console.error('saveToDrive error', e);
    this.showToast('Failed to save to Drive', 'error');
  }
}

PortfolioApp.prototype.loadFromDrive = async function() {
  try {
    // Guard: ensure gapi is available before attempting to use it
    if (typeof gapi === 'undefined' || !gapi || !gapi.client) {
      this.showToast('Google API not loaded. Initialize Drive integration first.', 'error');
      return;
    }
    const filename = 'portfolio-data.json';
    const file = await this.findDriveFile(filename);
    if (!file) { this.showToast('No portfolio-data.json found in Drive', 'info'); return; }
    const res = await gapi.client.request({ path: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, method: 'GET' });
    const data = res.result;
    if (data) {
      const inst = (this && typeof this.renderAchievements === 'function') ? this : (window.app || this);
      inst.achievements = data.achievements || [];
      inst.reflections = data.reflections || [];
      // Restore personal info and profile photo to localStorage and UI
      try {
        if (data.personalInfo) localStorage.setItem('personalInfo', JSON.stringify(data.personalInfo));
        if (data.profilePhoto) localStorage.setItem('profilePhoto', data.profilePhoto);
      } catch (e) { console.warn('Failed to persist personal info from Drive', e); }
      if (typeof inst.loadPersonalInfo === 'function') inst.loadPersonalInfo();
      if (typeof inst.renderAchievements === 'function') inst.renderAchievements();
      if (typeof inst.renderReflections === 'function') inst.renderReflections();
      if (typeof inst.updateLinkedAchievements === 'function') inst.updateLinkedAchievements();
      if (typeof inst.showToast === 'function') inst.showToast('Loaded portfolio from Google Drive', 'success');
    } else {
      this.showToast('Failed to load portfolio data', 'error');
    }
  } catch (e) {
    console.error('loadFromDrive error', e);
    this.showToast('Failed to load from Drive', 'error');
  }
}

// Upload a Blob to Drive and make it shareable (anyone with the link). Returns a public URL.
PortfolioApp.prototype._uploadBlobToDriveAndShare = async function(blob, filename, mimeType) {
  try {
    if (typeof gapi === 'undefined' || !gapi || !gapi.client) throw new Error('Google API not initialized');
    // Defensive token extraction. If no token, attempt to sign the user in (non-invasive).
    let tokenObj = null;
    try { tokenObj = (typeof gapi.client.getToken === 'function') ? gapi.client.getToken() : null; } catch (e) { tokenObj = null; }
    let accessToken = tokenObj && tokenObj.access_token ? tokenObj.access_token : null;
    if (!accessToken) {
      // Attempt to sign in the user interactively using gapi.auth2 if available.
      try {
        this.showToast('Please sign in to Google to allow uploading to Drive...', 'info');
        if (gapi.auth2 && typeof gapi.auth2.getAuthInstance === 'function') {
          let authInst = gapi.auth2.getAuthInstance();
          if (!authInst && gapi.auth2.init && window.GOOGLE_CLIENT_ID) {
            try { authInst = await gapi.auth2.init({ client_id: window.GOOGLE_CLIENT_ID, scope: 'https://www.googleapis.com/auth/drive.file' }); } catch (e) { /* ignore */ }
          }
          if (authInst) {
            const user = await authInst.signIn({ scope: 'https://www.googleapis.com/auth/drive.file' });
            const authResp = user && user.getAuthResponse ? user.getAuthResponse() : null;
            accessToken = (authResp && (authResp.access_token || authResp.accessToken)) || null;
            // Also update gapi.client token if possible
            try { if (accessToken && gapi.client && gapi.client.setToken) gapi.client.setToken({ access_token: accessToken }); } catch (e) {}
          }
        }
      } catch (e) {
        console.warn('Interactive Google sign-in failed or was cancelled', e);
      }
    }
    if (!accessToken) throw new Error('Not authenticated');

    // Create multipart request body for simple upload
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: filename,
      mimeType: mimeType || 'application/vnd.ms-powerpoint'
    };

    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + mimeType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      dataUrl +
      close_delim;

    // Use fetch to upload via Drive REST endpoint because gapi.client.request with raw multipart can be awkward
    const uploadResp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'multipart/related; boundary="' + boundary + '"' }),
      body: multipartRequestBody
    });
    if (!uploadResp.ok) throw new Error('Upload failed: ' + uploadResp.status + ' ' + uploadResp.statusText);
    const fileObj = await uploadResp.json();

    // Set permission to anyone with the link can read
    const permResp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileObj.id}/permissions`, {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });
    if (!permResp.ok) {
      // Not fatal — viewer may still be able to open depending on link
      console.warn('Setting permission failed', await permResp.text());
    }

    // Get file metadata to obtain webViewLink
    const metaResp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileObj.id}?fields=webViewLink,webContentLink`, {
      method: 'GET',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken })
    });
    if (!metaResp.ok) throw new Error('Failed to fetch file metadata');
    const meta = await metaResp.json();
    // Prefer webViewLink if present, otherwise fallback to webContentLink or drive file export URL
    return meta.webViewLink || meta.webContentLink || `https://www.googleapis.com/drive/v3/files/${fileObj.id}?alt=media`;
  } catch (e) {
    console.error('_uploadBlobToDriveAndShare error', e);
    return null;
  }
};

// Upload to anonymous public hosts (best-effort). Returns a public URL or null.
PortfolioApp.prototype._uploadBlobToAnonymousHost = async function(blob, filename, mimeType) {
  // We'll attempt a small list of public upload endpoints that return a direct file URL.
  // Note: these services may impose CORS or rate limits; this helper is best-effort.
  const attempts = [
    async () => {
      // 0x0.st - accepts PUT and returns URL in body
      try {
        const resp = await fetch('https://0x0.st', { method: 'POST', body: blob });
        if (!resp.ok) throw new Error('0x0.st upload failed');
        const text = await resp.text();
        const url = text.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) return url;
      } catch (e) { /* ignore */ }
      return null;
    },
    async () => {
      // file.io - but file.io returns JSON with link; note: file expires
      try {
        const form = new FormData();
        form.append('file', blob, filename);
        const resp = await fetch('https://file.io/?expires=1w', { method: 'POST', body: form });
        if (!resp.ok) throw new Error('file.io upload failed');
        const j = await resp.json();
        if (j && j.link) return j.link;
      } catch (e) { /* ignore */ }
      return null;
    },
    async () => {
      // transfer.sh supports PUT with filename
      try {
        const url = 'https://transfer.sh/' + encodeURIComponent(filename || 'file.bin');
        const resp = await fetch(url, { method: 'PUT', body: blob });
        if (!resp.ok) throw new Error('transfer.sh upload failed');
        const text = await resp.text();
        const link = text.trim();
        if (link && (link.startsWith('http://') || link.startsWith('https://'))) return link;
      } catch (e) { /* ignore */ }
      return null;
    }
  ];

  for (const fn of attempts) {
    try {
      const res = await fn();
      if (res) return res;
    } catch (e) { /* ignore and try next */ }
  }
  return null;
};

// Open an intermediate helper tab that embeds Office Online viewer and offers an explicit
// 'Add to OneDrive' instruction. This avoids Office's immediate sign-in redirect and
// gives the user a clear action (and context) if they need to sign in.
PortfolioApp.prototype._openOfficeHelperTab = function(publicUrl, filename) {
  try {
    const w = window.open('', '_blank');
    if (!w) {
      this.showToast('Popup blocked — please allow popups for this site', 'error');
      return;
    }
    const safeUrl = encodeURIComponent(publicUrl);
    const viewerUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + safeUrl;
    // Basic HTML that shows filename, a button to open Office viewer, and instructions to save to OneDrive
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Open in Office Online</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,system-ui,Arial;margin:0;padding:20px;background:#f7fafc;color:#0f172a}header{display:flex;align-items:center;gap:12px}h1{font-size:18px;margin:0}button{background:#2b8aef;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600}a.small{display:inline-block;margin-left:12px;color:#334155}</style></head><body><header><h1>${this._escapeHtml(filename || 'file')}</h1></header><p style="margin-top:16px;color:#334155">Your file is ready. You can open it directly in Office Online or add it to your OneDrive (requires Microsoft sign-in).</p><div style="margin-top:18px"><button id="open">Open in Office Online</button><a class="small" id="onedrive-link" href="#">Add to OneDrive & Open</a></div><iframe id="viewer" src="${viewerUrl}" style="width:100%;height:70vh;border:1px solid #e2e8f0;margin-top:18px;border-radius:8px"></iframe><script>document.getElementById('open').addEventListener('click',function(){window.open('${viewerUrl}','_blank');});document.getElementById('onedrive-link').addEventListener('click',async function(e){e.preventDefault(); try{ const a=document.createElement('a'); a.href='${publicUrl}'; a.download='${filename || 'file'}'; document.body.appendChild(a); a.click(); a.remove(); alert('A download has started. After saving the file to your device, sign in to OneDrive and upload it there to open in PowerPoint Online.'); }catch(err){alert('Failed to trigger download: '+err);}});</script></body></html>`;
    // Write the helper HTML to the new window
    w.document.open(); w.document.write(html); w.document.close();
  } catch (e) {
    console.error('Failed to open Office helper tab', e);
    this.showToast('Failed to open helper tab for Office', 'error');
  }
};

// Minimal HTML-escape helper
PortfolioApp.prototype._escapeHtml = function(s) { if (!s) return ''; return String(s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]; }); };

// -----------------------------------------------------------------------------
// Drive Auto-Loader (monitor)
// -----------------------------------------------------------------------------
// When a Drive access token becomes available (user signs in via GIS),
// automatically load `portfolio-data.json` from Drive and apply it to the
// current session. This does not rename or change any Drive files; it only
// reads and applies the content so signed-in users see their Drive-saved
// portfolio immediately.
// -----------------------------------------------------------------------------

;(function setupDriveAutoLoad() {
  // Helper: check token presence
  function hasDriveToken() {
    try {
      return !!(gapi && gapi.client && gapi.client.getToken && gapi.client.getToken().access_token);
    } catch (e) { return false; }
  }

  // Poll for token for a short period after page load/sign-in events.
  // If detected, call app.loadFromDrive().
  let polled = false;
  function pollTokenAndLoad() {
    if (polled) return;
    polled = true;
    const start = Date.now();
    const maxMs = 10_000; // poll up to 10s
    const interval = 500;
    const timer = setInterval(async () => {
      if (hasDriveToken()) {
        clearInterval(timer);
        try {
          console.log('Drive token detected — auto-loading portfolio from Drive.');
          await window.app.loadFromDrive();
        } catch (e) {
          console.warn('Drive auto-load failed', e);
        }
      } else if (Date.now() - start > maxMs) {
        clearInterval(timer);
      }
    }, interval);
  }

  // If GIS token client or gapi initialization code triggers a global event
  // you can hook here. For now, attempt an initial poll (covers page loads
  // where user already signed in) and also listen for focus events which often
  // follow the OAuth popup flow.
  try { pollTokenAndLoad(); } catch (e) { /* ignore */ }
  window.addEventListener('focus', () => {
    // When window regains focus after an OAuth popup, re-check token quickly
    try { pollTokenAndLoad(); } catch (e) { /* ignore */ }
  });
})();

// Initialize Google API client for Drive usage (non-invasive). This will load gapi
// if it exists on the page and initialize the client with the Drive scopes so
// uploads can use gapi.client.getToken() and related helpers. If your page already
// sets up Google Sign-In, this will be a no-op.
PortfolioApp.prototype.initGoogleDriveClient = function() {
  // Required scopes for Drive upload and permission modification
  const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.photos.readonly';
  // Use global keys if provided by the page (optional)
  const CLIENT_ID = window.GOOGLE_CLIENT_ID || null;
  const API_KEY = window.GOOGLE_API_KEY || null;

  // If gapi is not available, don't attempt to load it automatically here (page likely already loads it)
  if (typeof gapi === 'undefined' || !gapi) {
    console.debug('gapi not present; skipping Drive client init');
    return;
  }

  // If already initialized, skip
  try { if (gapi.client && gapi.client.init && gapi.client._initialized) return; } catch (e) {}

  // Try to init client; note: this won't sign the user in automatically.
  try {
    gapi.load('client:auth2', async () => {
      try {
        const initObj = { discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'] };
        if (API_KEY) initObj.apiKey = API_KEY;
        if (CLIENT_ID) initObj.clientId = CLIENT_ID;
        await gapi.client.init(initObj);
        // Also initialize auth2 if available and we have a client id
        if (CLIENT_ID && gapi.auth2 && !gapi.auth2.getAuthInstance()) {
          try { await gapi.auth2.init({ client_id: CLIENT_ID, scope: SCOPES }); } catch (e) { /* ignore */ }
        }
        // mark initialized so we don't re-init
        gapi.client._initialized = true;
        console.debug('gapi.client initialized for Drive (no sign-in performed)');
      } catch (err) {
        console.warn('gapi.client.init failed', err);
      }
    });
  } catch (e) {
    console.warn('gapi.load failed', e);
  }
};
