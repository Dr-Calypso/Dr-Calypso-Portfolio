[portfolio.css](https://github.com/user-attachments/files/22431088/portfolio.css)
/* CSS Variables - Design System */
:root {
  /* Colors */
  --background: 220 40% 98%;
  --foreground: 224 71% 4%;
  --card: 0 0% 100%;[portfolio.js](https://github.com/user-attachments/files/22431091/portfolio.js)
[portfolio.html](https://github.com/user-attachments/files/22431090/portfolio.html)

  --card-foreground: 224 71% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 224 71% 4%;
  --primary: 210 85% 45%;
  --primary-foreground: 210 40% 98%;
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 9% 46%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  --accent: 220 14% 96%;
  --accent-foreground: 220 9% 46%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;
  --success: 142 71% 45%;
  --success-foreground: 210 40% 98%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 210 85% 45%;
  --radius: 0.5rem;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(210 85% 45%) 0%, hsl(210 85% 65%) 100%);
  --gradient-subtle: linear-gradient(180deg, hsl(220 40% 98%) 0%, hsl(220 14% 96%) 100%);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-medium: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-elegant: 0 10px 30px -10px hsl(210 85% 45% / 0.3);

  /* Animations */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  --background: 224 71% 4%;
  --foreground: 210 40% 98%;
  --card: 224 71% 4%;
  --card-foreground: 210 40% 98%;
  --popover: 224 71% 4%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 85% 65%;
  --primary-foreground: 224 71% 4%;
  --secondary: 215 28% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 215 28% 17%;
  --muted-foreground: 217 11% 65%;
  --accent: 215 28% 17%;
  --accent-foreground: 210 40% 98%;
  --border: 215 28% 17%;
  --input: 215 28% 17%;
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  line-height: 1.6;
  font-size: 14px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
.header {
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--primary));
  margin-bottom: 0.25rem;
}

.nav-brand p {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  background: transparent;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition-smooth);
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

.nav-item:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.nav-item.active {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}

/* Main Content */
.main {
  padding: 2rem 0;
  min-height: calc(100vh - 80px);
}

.section {
  display: none;
}

.section.active {
  display: block;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.section-header p {
  color: hsl(var(--muted-foreground));
  font-size: 1rem;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Cards */
.card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) * 2);
  box-shadow: var(--shadow-medium);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.card-description {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

.card-content {
  padding: 1.5rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
  border: 1px solid transparent;
  text-decoration: none;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}

.btn-primary:hover {
  background: hsl(var(--primary) / 0.9);
}

.btn-success {
  background: hsl(var(--success));
  color: hsl(var(--success-foreground));
  border-color: hsl(var(--success));
}

.btn-success:hover {
  background: hsl(var(--success) / 0.9);
}

.btn-outline {
  background: transparent;
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

.btn-outline:hover {
  background: hsl(var(--muted));
}

.icon {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

/* Edit Controls */
.edit-controls {
  display: flex;
  gap: 0.5rem;
}

/* Profile Section */
.profile-section {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.profile-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  border: 4px solid hsl(var(--primary) / 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  background: var(--gradient-primary);
  color: hsl(var(--primary-foreground));
  font-size: 2rem;
  font-weight: 600;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  flex: 1;
  min-width: 300px;
}

/* Forms */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--card));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  transition: var(--transition-smooth);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
}

.form-group input[readonly] {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 1rem;
  font-weight: 500;
}

.form-group textarea[readonly] {
  background: transparent;
  border: none;
  padding: 0;
  resize: none;
}

.display-value {
  font-size: 1rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  line-height: 1.5;
}

.title-display {
  color: hsl(var(--primary));
}

.bio-display {
  color: hsl(var(--muted-foreground));
  font-weight: 400;
}

/* Contact Grid */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: calc(var(--radius) * 1.5);
  transition: var(--transition-smooth);
}

.contact-item:hover {
  background: hsl(var(--muted) / 0.7);
}

.contact-icon {
  padding: 0.5rem;
  background: hsl(var(--primary) / 0.1);
  border-radius: var(--radius);
  flex-shrink: 0;
}

.contact-icon .icon {
  color: hsl(var(--primary));
}

.contact-content {
  flex: 1;
}

.contact-content label {
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.contact-content .display-value {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  font-weight: 400;
}

.contact-content input {
  margin-top: 0.25rem;
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: calc(var(--radius) * 1.5);
  transition: var(--transition-smooth);
}

.social-item:hover {
  background: hsl(var(--muted) / 0.7);
}

.social-icon {
  padding: 0.5rem;
  background: hsl(var(--secondary) / 0.1);
  border-radius: var(--radius);
  flex-shrink: 0;
}

.social-icon .icon {
  color: hsl(var(--secondary-foreground));
}

.social-content {
  flex: 1;
}

.social-content label {
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.social-content .display-value {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.social-content input {
  margin-top: 0.25rem;
}

/* Search and Filter */
.search-container {
  position: relative;
}

.search-input {
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--card));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  width: 250px;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--card));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  cursor: pointer;
}

/* Achievements Grid */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) * 2);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  position: relative;
}

.achievement-card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.achievement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.achievement-category {
  padding: 0.25rem 0.75rem;
  border-radius: calc(var(--radius) * 3);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.achievement-category.academic {
  background: hsl(210 85% 45% / 0.1);
  color: hsl(210 85% 45%);
}

.achievement-category.clinical {
  background: hsl(142 71% 45% / 0.1);
  color: hsl(142 71% 45%);
}

.achievement-category.research {
  background: hsl(280 85% 45% / 0.1);
  color: hsl(280 85% 45%);
}

.achievement-category.certification {
  background: hsl(25 85% 45% / 0.1);
  color: hsl(25 85% 45%);
}

.achievement-status {
  padding: 0.25rem 0.75rem;
  border-radius: calc(var(--radius) * 3);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.achievement-status.completed {
  background: hsl(142 71% 45% / 0.1);
  color: hsl(142 71% 45%);
}

.achievement-status.in-progress {
  background: hsl(45 85% 45% / 0.1);
  color: hsl(45 85% 45%);
}

.achievement-status.planned {
  background: hsl(220 9% 46% / 0.1);
  color: hsl(220 9% 46%);
}

.achievement-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.achievement-date {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1rem;
}

.achievement-description {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  margin-bottom: 1rem;
}

.achievement-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Reflections */
.reflections-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reflection-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) * 2);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
}

.reflection-card:hover {
  box-shadow: var(--shadow-medium);
}

.reflection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.reflection-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.reflection-mood {
  padding: 0.25rem 0.75rem;
  border-radius: calc(var(--radius) * 3);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.reflection-mood.positive {
  background: hsl(142 71% 45% / 0.1);
  color: hsl(142 71% 45%);
}

.reflection-mood.challenging {
  background: hsl(0 84% 60% / 0.1);
  color: hsl(0 84% 60%);
}

.reflection-mood.neutral {
  background: hsl(220 9% 46% / 0.1);
  color: hsl(220 9% 46%);
}

.reflection-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.reflection-date {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1rem;
}

.reflection-content {
  color: hsl(var(--foreground));
  line-height: 1.7;
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.reflection-linked {
  padding: 0.75rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: var(--radius);
  border-left: 4px solid hsl(var(--primary));
  margin-bottom: 1rem;
}

.reflection-linked-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.reflection-linked-title {
  font-weight: 500;
  color: hsl(var(--foreground));
}

.reflection-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Modals */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 1rem;
}

.modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: hsl(var(--card));
  border-radius: calc(var(--radius) * 2);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.modal-close:hover {
  color: hsl(var(--foreground));
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid hsl(var(--border));
}

/* Utilities */
.hidden {
  display: none !important;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.text-muted {
  color: hsl(var(--muted-foreground));
}

.text-primary {
  color: hsl(var(--primary));
}

/* Responsive Design */
@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    width: 100%;
    justify-content: center;
  }

  .profile-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .social-grid {
    grid-template-columns: 1fr;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .search-input {
    width: 100%;
    max-width: 200px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .achievement-header,
  .reflection-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .achievement-actions,
  .reflection-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }

  .card-header,
  .card-content {
    padding: 1rem;
  }

  .section-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
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
