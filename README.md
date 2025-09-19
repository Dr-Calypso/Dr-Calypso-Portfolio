<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Abdul Haseeb Ahmad - Medical Portfolio</title>
    <meta name="description" content="Professional medical portfolio of Abdul Haseeb Ahmad, MBBS student specializing in internal medicine and cardiology.">
    <link rel="stylesheet" href="portfolio.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="nav-brand">
                <h1>Medical Portfolio</h1>
                <p>Abdul Haseeb Ahmad</p>
            </div>
            <nav class="nav-menu">
                <button class="nav-item active" data-section="personal">Personal Info</button>
                <button class="nav-item" data-section="descriptive">Descriptive Portfolio</button>
                <button class="nav-item" data-section="reflective">Reflective Portfolio</button>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <!-- Personal Information Section -->
        <section id="personal" class="section active">
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Personal Profile</h2>
                        <p class="card-description">Your professional identity, contact details, and links</p>
                        <div class="edit-controls">
                            <button id="edit-personal" class="btn btn-outline">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="m18.5 2.5 a2.828 2.828 0 1 1 4 4L12 16l-4 1 1-4 10.5-10.5z"/>
                                </svg>
                                Edit
                            </button>
                            <button id="save-personal" class="btn btn-success hidden">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                    <polyline points="17,21 17,13 7,13 7,21"/>
                                    <polyline points="7,3 7,8 15,8"/>
                                </svg>
                                Save
                            </button>
                            <button id="cancel-personal" class="btn btn-outline hidden">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="profile-section">
                            <div class="profile-image-container">
                                <div class="avatar">
                                    <div class="avatar-fallback">AH</div>
                                </div>
                                <button id="change-photo" class="btn btn-outline btn-sm hidden">
                                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
                                    </svg>
                                    Change Photo
                                </button>
                            </div>
                            <div class="profile-info">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>First Name</label>
                                        <span id="firstName-display">Abdul Haseeb</span>
                                        <input type="text" id="firstName" value="Abdul Haseeb" style="display:none;">
                                        <style>#personal input, #personal textarea { display: none; }</style>
                                    </div>
                                    <div class="form-group">
                                        <label>Last Name</label>
                                        <span id="lastName-display">Ahmad</span>
                                        <input type="text" id="lastName" value="Ahmad" style="display:none;">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Professional Title</label>
                                    <span id="title-display">MBBS RMU 52 Student | Year 1</span>
                                    <input type="text" id="title" value="MBBS RMU 52 Student | Year 1" style="display:none;">
                                </div>
                                <div class="form-group">
                                    <label>Professional Bio</label>
                                    <span id="bio-display">Passionate medical student dedicated 1. To impart evidence based research oriented medical education. 2. To provide best possible patient care. 3. To inculcate the values of mutual respect and ethical practice of medicine
.</span>
                                    <textarea id="bio" rows="4" style="display:none;">Passionate medical student dedicated 1. To impart evidence based research oriented medical education. 2. To provide best possible patient care. 3. To inculcate the values of mutual respect and ethical practice of medicine.</textarea>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Email</label>
                                        <span id="email-display">mbbs-52-123@rmur.edu.pk</span>
                                        <input type="email" id="email" value="mbbs-52-123@rmur.edu.pk" style="display:none;">
                                    </div>
                                    <div class="form-group">
                                        <label>Phone</label>
                                        <span id="phone-display">+92 3317735568</span>
                                        <input type="tel" id="phone" value="+92 3317735568" style="display:none;">
                                    </div>
                                    <div class="form-group">
                                        <label>Location</label>
                                        <span id="location-display">Boys Hostel, Rawalpindi Medical University, Tipu Road, Rawalpindi</span>
                                        <input type="text" id="location" value="Boys Hostel, Rawalpindi Medical University, Tipu Road, Rawalpindi" style="display:none;">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>LinkedIn</label>
                                        <span id="linkedin-display">linkedin.com/in/abdul-haseeb-ahmad</span>
                                        <input type="text" id="linkedin" value="linkedin.com/in/abdul-haseeb-ahmad" style="display:none;">
                                    </div>
                                    <div class="form-group">
                                        <label>GitHub</label>
                                        <span id="github-display">github.com/abdulhaseeb</span>
                                        <input type="text" id="github" value="github.com/abdulhaseeb" style="display:none;">
                                    </div>
                                    <div class="form-group">
                                        <label>Website</label>
                                        <span id="website-display">abdulhaseeb.com</span>
                                        <input type="text" id="website" value="abdulhaseeb.com" style="display:none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Descriptive Portfolio Section -->
        <section id="descriptive" class="section">
            <div class="container">
                <div class="section-header">
                    <div>
                        <h2>Descriptive Portfolio</h2>
                        <p>Academic achievements, clinical experiences, and professional development</p>
                    </div>
                    <div class="section-actions">
                        <div class="search-container">
                            <input type="text" id="search-descriptive" placeholder="Search achievements..." class="search-input">
                            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </div>
                        <select id="filter-descriptive" class="filter-select">
                            <option value="">All Categories</option>
                            <option value="academic">Academic</option>
                            <option value="clinical">Clinical</option>
                            <option value="research">Research</option>
                            <option value="certification">Certification</option>
                        </select>
                        <button id="add-achievement" class="btn btn-primary">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add Achievement
                        </button>
                    </div>
                </div>

                <div class="achievements-grid" id="achievements-container">
                    <!-- Achievements will be populated by JavaScript -->
                </div>
            </div>
        </section>

        <!-- Reflective Portfolio Section -->
        <section id="reflective" class="section">
            <div class="container">
                <div class="section-header">
                    <div>
                        <h2>Reflective Portfolio</h2>
                        <p>Personal reflections, learning experiences, and professional growth</p>
                    </div>
                    <div class="section-actions">
                        <div class="search-container">
                            <input type="text" id="search-reflective" placeholder="Search reflections..." class="search-input">
                            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </div>
                        <select id="filter-reflective" class="filter-select">
                            <option value="">All Moods</option>
                            <option value="positive">Positive</option>
                            <option value="challenging">Challenging</option>
                            <option value="neutral">Neutral</option>
                        </select>
                        <button id="add-reflection" class="btn btn-primary">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add Reflection
                        </button>
                    </div>
                </div>

                <div class="reflections-container" id="reflections-container">
                    <!-- Reflections will be populated by JavaScript -->
                </div>
            </div>
        </section>
    </main>

    <!-- Modals -->
    <div id="achievement-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="achievement-modal-title">Add Achievement</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="achievement-form">
                    <div class="form-group">
                        <label for="achievement-title">Title</label>
                        <input type="text" id="achievement-title" required>
                    </div>
                    <div class="form-group">
                        <label for="achievement-category">Category</label>
                        <select id="achievement-category" required>
                            <option value="">Select Category</option>
                            <option value="academic">Academic</option>
                            <option value="clinical">Clinical</option>
                            <option value="research">Research</option>
                            <option value="certification">Certification</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="achievement-date">Date</label>
                        <input type="date" id="achievement-date" required>
                    </div>
                    <div class="form-group">
                        <label for="achievement-description">Description</label>
                        <textarea id="achievement-description" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="achievement-image">Image (optional)</label>
                        <input type="file" id="achievement-image" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label for="achievement-ppt">PowerPoint (PPT, optional)</label>
                        <input type="file" id="achievement-ppt" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation">
                    </div>
                    <div class="form-group">
                        <label for="achievement-pdf">PDF (optional)</label>
                        <input type="file" id="achievement-pdf" accept="application/pdf">
                    </div>
                    <div class="form-group">
                        <label for="achievement-status">Status</label>
                        <select id="achievement-status" required>
                            <option value="completed">Completed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="planned">Planned</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
                <button type="submit" form="achievement-form" class="btn btn-primary">Save Achievement</button>
            </div>
        </div>
    </div>

    <div id="reflection-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="reflection-modal-title">Add Reflection</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="reflection-form">
                    <div class="form-group">
                        <label for="reflection-title">Title</label>
                        <input type="text" id="reflection-title" required>
                    </div>
                    <div class="form-group">
                        <label for="reflection-date">Date</label>
                        <input type="date" id="reflection-date" required>
                    </div>
                    <div class="form-group">
                        <label for="reflection-mood">Mood</label>
                        <select id="reflection-mood" required>
                            <option value="">Select Mood</option>
                            <option value="positive">Positive</option>
                            <option value="challenging">Challenging</option>
                            <option value="neutral">Neutral</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="reflection-content">Reflection Content</label>
                        <textarea id="reflection-content" rows="8" placeholder="Write your thoughts and reflections..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="reflection-image">Image (optional)</label>
                        <input type="file" id="reflection-image" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label for="reflection-ppt">PowerPoint (PPT, optional)</label>
                        <input type="file" id="reflection-ppt" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation">
                    </div>
                    <div class="form-group">
                        <label for="reflection-pdf">PDF (optional)</label>
                        <input type="file" id="reflection-pdf" accept="application/pdf">
                    </div>
                    <div class="form-group">
                        <label for="reflection-linked">Link to Achievement</label>
                        <select id="reflection-linked">
                            <option value="">No linked achievement</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
                <button type="submit" form="reflection-form" class="btn btn-primary">Save Reflection</button>
            </div>
        </div>
    </div>

    <script src="portfolio.js"></script>
</body>
</html>
