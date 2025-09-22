// Portfolio JavaScript - Vanilla JS Implementation

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
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
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

    // Export to PDF button (non-invasive): uses html2canvas + jsPDF
    const exportBtn = document.getElementById('export-pdf');
    if (exportBtn) exportBtn.addEventListener('click', (e) => { e.preventDefault(); this.exportToPdf(); });

    // Personal Info Edit Controls
    document.getElementById('edit-personal').addEventListener('click', () => this.toggleEditPersonal(true));
    document.getElementById('save-personal').addEventListener('click', () => this.savePersonal());
    document.getElementById('cancel-personal').addEventListener('click', () => this.toggleEditPersonal(false));
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
      if (achievement.pdf && achievement.pdf.data) {
        fileHtml += `<div><a href="${achievement.pdf.data}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">View PDF</a></div>`;
      }
      if (achievement.ppt && achievement.ppt.data) {
        // Office Online viewer link
        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(achievement.ppt.data)}`;
        fileHtml += `<div><a href="${officeUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">View PPT (Office Online)</a></div>`;
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
      if (reflection.pdf && reflection.pdf.data) {
        fileHtml += `<div><a href="${reflection.pdf.data}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">View PDF</a></div>`;
      }
      if (reflection.ppt && reflection.ppt.data) {
        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(reflection.ppt.data)}`;
        fileHtml += `<div><a href="${officeUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">View PPT (Office Online)</a></div>`;
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
