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
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        this.showSection(section);
      });
    });

    // Personal Info Edit Controls
    document.getElementById('edit-personal').addEventListener('click', () => this.toggleEditPersonal(true));
    document.getElementById('save-personal').addEventListener('click', () => this.savePersonal());
    document.getElementById('cancel-personal').addEventListener('click', () => this.toggleEditPersonal(false));

    // Achievement Modal
    document.getElementById('add-achievement').addEventListener('click', () => this.openAchievementModal());
    document.getElementById('achievement-form').addEventListener('submit', (e) => this.saveAchievement(e));

    // Reflection Modal
    document.getElementById('add-reflection').addEventListener('click', () => this.openReflectionModal());
    document.getElementById('reflection-form').addEventListener('submit', (e) => this.saveReflection(e));

    // Modal Close Events
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModals();
      });
    });

    // Search and Filter
    document.getElementById('search-descriptive').addEventListener('input', (e) => {
      this.filterAchievements(e.target.value, document.getElementById('filter-descriptive').value);
    });

    document.getElementById('filter-descriptive').addEventListener('change', (e) => {
      this.filterAchievements(document.getElementById('search-descriptive').value, e.target.value);
    });

    document.getElementById('search-reflective').addEventListener('input', (e) => {
      this.filterReflections(e.target.value, document.getElementById('filter-reflective').value);
    });

    document.getElementById('filter-reflective').addEventListener('change', (e) => {
      this.filterReflections(document.getElementById('search-reflective').value, e.target.value);
    });
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
      'firstName', 'lastName', 'title', 'bio', 'email', 'phone', 'location', 'linkedin', 'github', 'website'
    ];
    fields.forEach(id => {
      const input = document.getElementById(id);
      const display = document.getElementById(id + '-display');
      if (input && display) {
        if (editing) {
          input.style.display = 'inline-block';
          display.style.display = 'none';
        } else {
          input.style.display = 'none';
          display.style.display = 'inline';
        }
      }
    });
  }

  savePersonal() {
    // Update display spans with new values
    const fields = [
      'firstName', 'lastName', 'title', 'bio', 'email', 'phone', 'location', 'linkedin', 'github', 'website'
    ];
    fields.forEach(id => {
      const input = document.getElementById(id);
      const display = document.getElementById(id + '-display');
      if (input && display) {
        display.textContent = input.value;
      }
    });
    // Update avatar initials
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    document.querySelector('.avatar-fallback').textContent = 
      (firstName[0] || '') + (lastName[0] || '');
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
    } else {
      title.textContent = 'Add Achievement';
      document.getElementById('achievement-form').reset();
      document.getElementById('achievement-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
  }

  saveAchievement(e) {
    e.preventDefault();
    const getFileData = (inputId) => {
      const fileInput = document.getElementById(inputId);
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = function(e) {
            resolve({
              name: file.name,
              type: file.type,
              data: e.target.result
            });
          };
          if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
          } else {
            reader.readAsDataURL(file);
          }
        });
      }
      return Promise.resolve(null);
    };

    Promise.all([
      getFileData('achievement-image'),
      getFileData('achievement-ppt'),
      getFileData('achievement-pdf')
    ]).then(([image, ppt, pdf]) => {
      const formData = {
        id: this.editingAchievement?.id || Date.now().toString(),
        title: document.getElementById('achievement-title').value,
        category: document.getElementById('achievement-category').value,
        date: document.getElementById('achievement-date').value,
        description: document.getElementById('achievement-description').value,
        status: document.getElementById('achievement-status').value,
        image,
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
      if (achievement.image && achievement.image.data) {
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
      <div class="achievement-card">
        <div class="achievement-header">
          <span class="achievement-category ${achievement.category}">${achievement.category}</span>
          <span class="achievement-status ${achievement.status.replace('-', '')}">${achievement.status.replace('-', ' ')}</span>
        </div>
        <h3 class="achievement-title">${achievement.title}</h3>
        <div class="achievement-date">${this.formatDate(achievement.date)}</div>
        <p class="achievement-description">${achievement.description}</p>
        ${fileHtml}
        <div class="achievement-actions">
          <button class="btn btn-outline btn-sm" onclick="app.openAchievementModal(${JSON.stringify(achievement).replace(/\"/g, '&quot;')})">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 a2.828 2.828 0 1 1 4 4L12 16l-4 1 1-4 10.5-10.5z"/>
            </svg>
            Edit
          </button>
          <button class="btn btn-outline btn-sm" onclick="app.deleteAchievement('${achievement.id}')">
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
    } else {
      title.textContent = 'Add Reflection';
      document.getElementById('reflection-form').reset();
      document.getElementById('reflection-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
  }

  saveReflection(e) {
    e.preventDefault();
    const getFileData = (inputId) => {
      const fileInput = document.getElementById(inputId);
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = function(e) {
            resolve({
              name: file.name,
              type: file.type,
              data: e.target.result
            });
          };
          if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
          } else {
            reader.readAsDataURL(file);
          }
        });
      }
      return Promise.resolve(null);
    };

    Promise.all([
      getFileData('reflection-image'),
      getFileData('reflection-ppt'),
      getFileData('reflection-pdf')
    ]).then(([image, ppt, pdf]) => {
      const formData = {
        id: this.editingReflection?.id || Date.now().toString(),
        title: document.getElementById('reflection-title').value,
        date: document.getElementById('reflection-date').value,
        mood: document.getElementById('reflection-mood').value,
        content: document.getElementById('reflection-content').value,
        linkedAchievement: document.getElementById('reflection-linked').value || null,
        image,
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

  deleteReflection(id) {
    if (confirm('Are you sure you want to delete this reflection?')) {
      this.reflections = this.reflections.filter(r => r.id !== id);
      this.renderReflections();
      this.showToast('Reflection deleted successfully', 'success');
    }
  }

  filterReflections(search, mood) {
    const reflections = document.querySelectorAll('.reflection-card');
    
    reflections.forEach(card => {
      const title = card.querySelector('.reflection-title').textContent.toLowerCase();
      const content = card.querySelector('.reflection-content').textContent.toLowerCase();
      const cardMood = card.querySelector('.reflection-mood').textContent.toLowerCase();
      
      const matchesSearch = title.includes(search.toLowerCase()) || 
                           content.includes(search.toLowerCase());
      const matchesMood = !mood || cardMood.includes(mood.toLowerCase());
      
      card.style.display = matchesSearch && matchesMood ? 'block' : 'none';
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
      if (reflection.image && reflection.image.data) {
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
              <button class="btn btn-outline btn-sm" onclick="app.openReflectionModal(${JSON.stringify(reflection).replace(/\"/g, '&quot;')})">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 a2.828 2.828 0 1 1 4 4L12 16l-4 1 1-4 10.5-10.5z"/>
                </svg>
                Edit
              </button>
              <button class="btn btn-outline btn-sm" onclick="app.deleteReflection('${reflection.id}')">
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
    if (!data) {
      console.warn('Repo JSON fetched but empty / invalid.');
      return false;
    }
    // Apply data exactly as stored in the JSON file
    // Use a safe reference to the instance in case `this` is not bound
    const inst = (this && typeof this.renderAchievements === 'function') ? this : (window.app || this);
    inst.achievements = Array.isArray(data.achievements) ? data.achievements : [];
    inst.reflections = Array.isArray(data.reflections) ? data.reflections : [];
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
    if (!gapi.client.getToken || !gapi.client.getToken().access_token) {
      this.showToast('Not authenticated with Drive', 'info');
      return;
    }
    const filename = 'portfolio-data.json';
    const existing = await this.findDriveFile(filename).catch(()=>null);
    const metadata = { name: filename, mimeType: 'application/json' };
    const content = JSON.stringify({ achievements: this.achievements, reflections: this.reflections }, null, 2);

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
    const filename = 'portfolio-data.json';
    const file = await this.findDriveFile(filename);
    if (!file) { this.showToast('No portfolio-data.json found in Drive', 'info'); return; }
    const res = await gapi.client.request({ path: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, method: 'GET' });
    const data = res.result;
    if (data) {
      const inst = (this && typeof this.renderAchievements === 'function') ? this : (window.app || this);
      inst.achievements = data.achievements || [];
      inst.reflections = data.reflections || [];
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
