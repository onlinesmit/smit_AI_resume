/**
 * Main Application Controller for Resume Builder
 */

class ResumeApp {
  constructor() {
    this.storageKey = "resumecraft_data_v1";
    this.templateKey = "resumecraft_template_v1";
    this.colorKey = "resumecraft_accent_v1";

    this.activeTemplate = localStorage.getItem(this.templateKey) || "plain";
    this.accentColor = localStorage.getItem(this.colorKey) || "#2563eb";
    this.zoom = 1.0;

    // Load data from local storage or initialize with sample data
    this.data = this.loadData();

    this.initDOM();
    this.bindEvents();
    this.populateForm();
    this.renderResume();
    this.initSupabase();
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    // Deep clone sample data
    return JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA));
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  initDOM() {
    // Form inputs
    this.fullNameInput = document.getElementById("input-fullName");
    this.jobTitleInput = document.getElementById("input-jobTitle");
    this.emailInput = document.getElementById("input-email");
    this.phoneInput = document.getElementById("input-phone");
    this.locationInput = document.getElementById("input-location");
    this.websiteInput = document.getElementById("input-website");
    this.linkedinInput = document.getElementById("input-linkedin");
    this.githubInput = document.getElementById("input-github");
    this.twitterInput = document.getElementById("input-twitter");
    this.photoInput = document.getElementById("input-photo");
    this.showPhotoCheckbox = document.getElementById("input-showPhoto");
    this.photoPreview = document.getElementById("photo-preview-thumb");
    this.removePhotoBtn = document.getElementById("btn-remove-photo");

    this.summaryInput = document.getElementById("input-summary");

    // Dynamic containers
    this.experienceContainer = document.getElementById("experience-list");
    this.educationContainer = document.getElementById("education-list");
    this.skillsContainer = document.getElementById("skills-list");
    this.projectsContainer = document.getElementById("projects-list");
    this.certificationsContainer = document.getElementById("certifications-list");
    this.languagesContainer = document.getElementById("languages-list");

    // Preview
    this.previewContainer = document.getElementById("resume-preview-container");
    this.templateBadge = document.getElementById("preview-template-badge");
    this.colorPickerContainer = document.getElementById("attractive-color-options");

    // Mobile tabs
    this.tabEdit = document.getElementById("tab-edit");
    this.tabPreview = document.getElementById("tab-preview");
    this.panelForm = document.getElementById("panel-form");
    this.panelPreview = document.getElementById("panel-preview");
  }

  bindEvents() {
    // Top action buttons
    document.getElementById("btn-generate").addEventListener("click", () => this.handleGenerate());
    document.getElementById("btn-generate-top").addEventListener("click", () => this.handleGenerate());
    document.getElementById("btn-download-pdf").addEventListener("click", () => this.handleDownloadPDF());
    document.getElementById("btn-print-pdf").addEventListener("click", () => window.pdfExporter.printPDF());
    document.getElementById("btn-load-sample").addEventListener("click", () => this.handleLoadSample());
    document.getElementById("btn-clear-form").addEventListener("click", () => this.handleClearForm());

    // Template selection cards
    document.querySelectorAll(".template-card").forEach(card => {
      card.addEventListener("click", (e) => {
        const template = card.getAttribute("data-template");
        this.setTemplate(template);
      });
    });

    // Accent color chips
    document.querySelectorAll(".color-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const color = chip.getAttribute("data-color");
        this.setAccentColor(color);
      });
    });

    const customColorInput = document.getElementById("custom-color-input");
    if (customColorInput) {
      customColorInput.addEventListener("input", (e) => {
        this.setAccentColor(e.target.value);
      });
    }

    // Photo upload
    if (this.photoInput) {
      this.photoInput.addEventListener("change", (e) => this.handlePhotoUpload(e));
    }
    if (this.showPhotoCheckbox) {
      this.showPhotoCheckbox.addEventListener("change", (e) => {
        this.data.personal.showPhoto = e.target.checked;
        this.saveData();
        this.renderResume();
      });
    }
    if (this.removePhotoBtn) {
      this.removePhotoBtn.addEventListener("click", () => {
        this.data.personal.photoUrl = "";
        this.photoPreview.src = "";
        this.photoPreview.style.display = "none";
        this.removePhotoBtn.style.display = "none";
        if (this.photoInput) this.photoInput.value = "";
        this.saveData();
        this.renderResume();
      });
    }

    // Dynamic repeater add buttons
    document.getElementById("btn-add-experience").addEventListener("click", () => this.addExperienceItem());
    document.getElementById("btn-add-education").addEventListener("click", () => this.addEducationItem());
    document.getElementById("btn-add-skill-category").addEventListener("click", () => this.addSkillCategoryItem());
    document.getElementById("btn-add-project").addEventListener("click", () => this.addProjectItem());
    document.getElementById("btn-add-certification").addEventListener("click", () => this.addCertificationItem());
    document.getElementById("btn-add-language").addEventListener("click", () => this.addLanguageItem());

    // Live update on input change for smooth experience
    document.getElementById("resume-form").addEventListener("input", (e) => {
      // Debounce slight re-render
      clearTimeout(this.liveSyncTimer);
      this.liveSyncTimer = setTimeout(() => {
        this.collectFormData();
        this.renderResume();
      }, 300);
    });

    // Zoom controls
    document.getElementById("btn-zoom-in").addEventListener("click", () => this.changeZoom(0.1));
    document.getElementById("btn-zoom-out").addEventListener("click", () => this.changeZoom(-0.1));
    document.getElementById("btn-zoom-reset").addEventListener("click", () => this.setZoom(1.0));

    // Mobile tabs
    if (this.tabEdit && this.tabPreview) {
      this.tabEdit.addEventListener("click", () => {
        this.tabEdit.classList.add("active");
        this.tabPreview.classList.remove("active");
        this.panelForm.classList.add("active-panel");
        this.panelPreview.classList.remove("active-panel");
      });
      this.tabPreview.addEventListener("click", () => {
        this.tabPreview.classList.add("active");
        this.tabEdit.classList.remove("active");
        this.panelPreview.classList.add("active-panel");
        this.panelForm.classList.remove("active-panel");
        this.renderResume();
      });
    }

    // Accordion expand/collapse for form sections
    document.querySelectorAll(".form-section-header").forEach(header => {
      header.addEventListener("click", () => {
        const section = header.closest(".form-section");
        section.classList.toggle("collapsed");
      });
    });
  }

  setTemplate(templateName) {
    this.activeTemplate = templateName;
    localStorage.setItem(this.templateKey, templateName);

    // Update active UI card
    document.querySelectorAll(".template-card").forEach(c => {
      if (c.getAttribute("data-template") === templateName) {
        c.classList.add("active");
      } else {
        c.classList.remove("active");
      }
    });

    // Toggle color picker visibility (only relevant for Attractive template)
    if (this.colorPickerContainer) {
      if (templateName === "attractive") {
        this.colorPickerContainer.style.display = "flex";
      } else {
        this.colorPickerContainer.style.display = "none";
      }
    }

    // Update template badge text
    if (this.templateBadge) {
      this.templateBadge.textContent = templateName === "plain" 
        ? "Template: Classic Plain (No Colors)" 
        : "Template: Modern Attractive";
    }

    this.renderResume();
    window.pdfExporter.showToast(`Switched to ${templateName === "plain" ? "Classic Plain (No Colors)" : "Modern Attractive"} template`, "info");
  }

  setAccentColor(colorHex) {
    this.accentColor = colorHex;
    localStorage.setItem(this.colorKey, colorHex);

    document.querySelectorAll(".color-chip").forEach(chip => {
      if (chip.getAttribute("data-color").toLowerCase() === colorHex.toLowerCase()) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });

    const customInput = document.getElementById("custom-color-input");
    if (customInput) customInput.value = colorHex;

    this.renderResume();
  }

  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      alert("Please select an image smaller than 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.data.personal.photoUrl = dataUrl;
      this.data.personal.showPhoto = true;
      if (this.showPhotoCheckbox) this.showPhotoCheckbox.checked = true;

      this.photoPreview.src = dataUrl;
      this.photoPreview.style.display = "block";
      this.removePhotoBtn.style.display = "inline-flex";

      this.saveData();
      this.renderResume();
      window.pdfExporter.showToast("Profile photo uploaded!", "success");
    };
    reader.readAsDataURL(file);
  }

  populateForm() {
    const p = this.data.personal || {};
    this.fullNameInput.value = p.fullName || "";
    this.jobTitleInput.value = p.jobTitle || "";
    this.emailInput.value = p.email || "";
    this.phoneInput.value = p.phone || "";
    this.locationInput.value = p.location || "";
    this.websiteInput.value = p.website || "";
    this.linkedinInput.value = p.linkedin || "";
    this.githubInput.value = p.github || "";
    if (this.twitterInput) this.twitterInput.value = p.twitter || "";

    if (this.showPhotoCheckbox) {
      this.showPhotoCheckbox.checked = !!p.showPhoto;
    }
    if (p.photoUrl) {
      this.photoPreview.src = p.photoUrl;
      this.photoPreview.style.display = "block";
      this.removePhotoBtn.style.display = "inline-flex";
    } else {
      this.photoPreview.style.display = "none";
      this.removePhotoBtn.style.display = "none";
    }

    this.summaryInput.value = this.data.summary || "";

    // Render repeaters
    this.renderExperienceList();
    this.renderEducationList();
    this.renderSkillsList();
    this.renderProjectsList();
    this.renderCertificationsList();
    this.renderLanguagesList();

    // Set template and color
    this.setTemplate(this.activeTemplate);
    this.setAccentColor(this.accentColor);
  }

  collectFormData() {
    this.data.personal = {
      fullName: this.fullNameInput.value.trim(),
      jobTitle: this.jobTitleInput.value.trim(),
      email: this.emailInput.value.trim(),
      phone: this.phoneInput.value.trim(),
      location: this.locationInput.value.trim(),
      website: this.websiteInput.value.trim(),
      linkedin: this.linkedinInput.value.trim(),
      github: this.githubInput.value.trim(),
      twitter: this.twitterInput ? this.twitterInput.value.trim() : "",
      photoUrl: this.data.personal.photoUrl || "",
      showPhoto: this.showPhotoCheckbox ? this.showPhotoCheckbox.checked : false
    };

    this.data.summary = this.summaryInput.value.trim();

    // Collect experience
    this.data.experience = [];
    document.querySelectorAll(".experience-item-card").forEach(card => {
      this.data.experience.push({
        id: card.dataset.id,
        title: card.querySelector(".exp-title").value.trim(),
        company: card.querySelector(".exp-company").value.trim(),
        location: card.querySelector(".exp-location").value.trim(),
        startDate: card.querySelector(".exp-start").value.trim(),
        endDate: card.querySelector(".exp-end").value.trim(),
        current: card.querySelector(".exp-current").checked,
        description: card.querySelector(".exp-desc").value.trim()
      });
    });

    // Collect education
    this.data.education = [];
    document.querySelectorAll(".education-item-card").forEach(card => {
      this.data.education.push({
        id: card.dataset.id,
        degree: card.querySelector(".edu-degree").value.trim(),
        school: card.querySelector(".edu-school").value.trim(),
        location: card.querySelector(".edu-location").value.trim(),
        startDate: card.querySelector(".edu-start").value.trim(),
        endDate: card.querySelector(".edu-end").value.trim(),
        details: card.querySelector(".edu-details").value.trim()
      });
    });

    // Collect skills
    this.data.skills = [];
    document.querySelectorAll(".skill-category-card").forEach(card => {
      this.data.skills.push({
        category: card.querySelector(".skill-cat-name").value.trim(),
        items: card.querySelector(".skill-cat-items").value.trim()
      });
    });

    // Collect projects
    this.data.projects = [];
    document.querySelectorAll(".project-item-card").forEach(card => {
      this.data.projects.push({
        id: card.dataset.id,
        name: card.querySelector(".proj-name").value.trim(),
        tech: card.querySelector(".proj-tech").value.trim(),
        link: card.querySelector(".proj-link").value.trim(),
        description: card.querySelector(".proj-desc").value.trim()
      });
    });

    // Collect certifications
    this.data.certifications = [];
    document.querySelectorAll(".cert-item-card").forEach(card => {
      this.data.certifications.push({
        id: card.dataset.id,
        name: card.querySelector(".cert-name").value.trim(),
        issuer: card.querySelector(".cert-issuer").value.trim(),
        date: card.querySelector(".cert-date").value.trim()
      });
    });

    // Collect languages
    this.data.languages = [];
    document.querySelectorAll(".lang-item-card").forEach(card => {
      this.data.languages.push({
        name: card.querySelector(".lang-name").value.trim(),
        level: card.querySelector(".lang-level").value.trim()
      });
    });

    this.saveData();
  }

  // --- Repeater Rendering & Management ---

  addExperienceItem(expData = null) {
    const item = expData || {
      id: "exp-" + Date.now(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    if (!expData) this.data.experience.push(item);

    const card = document.createElement("div");
    card.className = "repeatable-card experience-item-card";
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="card-top-bar">
        <span class="card-badge">Position</span>
        <button type="button" class="btn-delete-card" title="Delete position">✕</button>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" class="exp-title" placeholder="e.g. Lead Software Engineer" value="${escapeHtml(item.title)}" />
        </div>
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" class="exp-company" placeholder="e.g. Acme Corporation" value="${escapeHtml(item.company)}" />
        </div>
      </div>
      <div class="form-grid-3">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="exp-location" placeholder="e.g. San Francisco, CA" value="${escapeHtml(item.location)}" />
        </div>
        <div class="form-group">
          <label>Start Date</label>
          <input type="text" class="exp-start" placeholder="e.g. 2021 or Jan 2021" value="${escapeHtml(item.startDate)}" />
        </div>
        <div class="form-group">
          <label>End Date</label>
          <div class="end-date-wrapper">
            <input type="text" class="exp-end" placeholder="e.g. Present" value="${escapeHtml(item.endDate)}" ${item.current ? "disabled" : ""} />
            <label class="checkbox-inline">
              <input type="checkbox" class="exp-current" ${item.current ? "checked" : ""} /> Present
            </label>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Responsibilities &amp; Achievements (One bullet point per line)</label>
        <textarea rows="3" class="exp-desc" placeholder="• Led team of 5 engineers...\n• Increased conversion rate by 20%...">${escapeHtml(item.description)}</textarea>
      </div>
    `;

    // Events
    card.querySelector(".btn-delete-card").addEventListener("click", () => {
      card.remove();
      this.collectFormData();
      this.renderResume();
    });

    const currentCheckbox = card.querySelector(".exp-current");
    const endInput = card.querySelector(".exp-end");
    currentCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        endInput.value = "Present";
        endInput.disabled = true;
      } else {
        endInput.disabled = false;
        if (endInput.value === "Present") endInput.value = "";
      }
      this.collectFormData();
      this.renderResume();
    });

    this.experienceContainer.appendChild(card);
    if (!expData) {
      const firstInput = card.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  renderExperienceList() {
    this.experienceContainer.innerHTML = "";
    (this.data.experience || []).forEach(item => this.addExperienceItem(item));
  }

  addEducationItem(eduData = null) {
    const item = eduData || {
      id: "edu-" + Date.now(),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      details: ""
    };
    if (!eduData) this.data.education.push(item);

    const card = document.createElement("div");
    card.className = "repeatable-card education-item-card";
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="card-top-bar">
        <span class="card-badge">Degree / School</span>
        <button type="button" class="btn-delete-card" title="Delete education">✕</button>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Degree / Field of Study</label>
          <input type="text" class="edu-degree" placeholder="e.g. B.S. in Computer Science" value="${escapeHtml(item.degree)}" />
        </div>
        <div class="form-group">
          <label>School / University</label>
          <input type="text" class="edu-school" placeholder="e.g. Stanford University" value="${escapeHtml(item.school)}" />
        </div>
      </div>
      <div class="form-grid-3">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="edu-location" placeholder="e.g. Stanford, CA" value="${escapeHtml(item.location)}" />
        </div>
        <div class="form-group">
          <label>Start Year</label>
          <input type="text" class="edu-start" placeholder="e.g. 2016" value="${escapeHtml(item.startDate)}" />
        </div>
        <div class="form-group">
          <label>Graduation Year</label>
          <input type="text" class="edu-end" placeholder="e.g. 2020" value="${escapeHtml(item.endDate)}" />
        </div>
      </div>
      <div class="form-group">
        <label>Honors / GPA / Notes (Optional)</label>
        <input type="text" class="edu-details" placeholder="e.g. Magna Cum Laude, GPA: 3.8/4.0" value="${escapeHtml(item.details)}" />
      </div>
    `;

    card.querySelector(".btn-delete-card").addEventListener("click", () => {
      card.remove();
      this.collectFormData();
      this.renderResume();
    });

    this.educationContainer.appendChild(card);
    if (!eduData) {
      const firstInput = card.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  renderEducationList() {
    this.educationContainer.innerHTML = "";
    (this.data.education || []).forEach(item => this.addEducationItem(item));
  }

  addSkillCategoryItem(skillData = null) {
    const item = skillData || {
      category: "Technical Skills",
      items: ""
    };
    if (!skillData) this.data.skills.push(item);

    const card = document.createElement("div");
    card.className = "repeatable-card skill-category-card";
    card.innerHTML = `
      <div class="card-top-bar">
        <span class="card-badge">Skill Category</span>
        <button type="button" class="btn-delete-card" title="Delete skill category">✕</button>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Category Name</label>
          <input type="text" class="skill-cat-name" placeholder="e.g. Frameworks &amp; Tools" value="${escapeHtml(item.category)}" />
        </div>
        <div class="form-group">
          <label>Skills (Comma-separated)</label>
          <input type="text" class="skill-cat-items" placeholder="e.g. React, Node.js, Python, Docker" value="${escapeHtml(item.items)}" />
        </div>
      </div>
    `;

    card.querySelector(".btn-delete-card").addEventListener("click", () => {
      card.remove();
      this.collectFormData();
      this.renderResume();
    });

    this.skillsContainer.appendChild(card);
    if (!skillData) {
      const firstInput = card.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  renderSkillsList() {
    this.skillsContainer.innerHTML = "";
    (this.data.skills || []).forEach(item => this.addSkillCategoryItem(item));
  }

  addProjectItem(projData = null) {
    const item = projData || {
      id: "proj-" + Date.now(),
      name: "",
      tech: "",
      link: "",
      description: ""
    };
    if (!projData) this.data.projects.push(item);

    const card = document.createElement("div");
    card.className = "repeatable-card project-item-card";
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="card-top-bar">
        <span class="card-badge">Project</span>
        <button type="button" class="btn-delete-card" title="Delete project">✕</button>
      </div>
      <div class="form-grid-3">
        <div class="form-group">
          <label>Project Name</label>
          <input type="text" class="proj-name" placeholder="e.g. CloudSync Platform" value="${escapeHtml(item.name)}" />
        </div>
        <div class="form-group">
          <label>Tech Stack</label>
          <input type="text" class="proj-tech" placeholder="e.g. React, Go, Redis" value="${escapeHtml(item.tech)}" />
        </div>
        <div class="form-group">
          <label>Project URL / Repo</label>
          <input type="text" class="proj-link" placeholder="e.g. github.com/user/project" value="${escapeHtml(item.link)}" />
        </div>
      </div>
      <div class="form-group">
        <label>Description / Key Outcomes</label>
        <textarea rows="2" class="proj-desc" placeholder="Developed high-throughput data sync system supporting 50k concurrent users.">${escapeHtml(item.description)}</textarea>
      </div>
    `;

    card.querySelector(".btn-delete-card").addEventListener("click", () => {
      card.remove();
      this.collectFormData();
      this.renderResume();
    });

    this.projectsContainer.appendChild(card);
    if (!projData) {
      const firstInput = card.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  renderProjectsList() {
    this.projectsContainer.innerHTML = "";
    (this.data.projects || []).forEach(item => this.addProjectItem(item));
  }

  addCertificationItem(certData = null) {
    const item = certData || {
      id: "cert-" + Date.now(),
      name: "",
      issuer: "",
      date: ""
    };
    if (!certData) this.data.certifications.push(item);

    const card = document.createElement("div");
    card.className = "repeatable-card cert-item-card";
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="card-top-bar">
        <span class="card-badge">Certification</span>
        <button type="button" class="btn-delete-card" title="Delete certification">✕</button>
      </div>
      <div class="form-grid-3">
        <div class="form-group">
          <label>Certification Name</label>
          <input type="text" class="cert-name" placeholder="e.g. AWS Certified Developer" value="${escapeHtml(item.name)}" />
        </div>
        <div class="form-group">
          <label>Issuing Organization</label>
          <input type="text" class="cert-issuer" placeholder="e.g. Amazon Web Services" value="${escapeHtml(item.issuer)}" />
        </div>
        <div class="form-group">
          <label>Year / Date</label>
          <input type="text" class="cert-date" placeholder="e.g. 2023" value="${escapeHtml(item.date)}" />
        </div>
      </div>
    `;

    card.querySelector(".btn-delete-card").addEventListener("click", () => {
      card.remove();
      this.collectFormData();
      this.renderResume();
    });

    this.certificationsContainer.appendChild(card);
    if (!certData) {
      const firstInput = card.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  renderCertificationsList() {
    this.certificationsContainer.innerHTML = "";
    (this.data.certifications || []).forEach(item => this.addCertificationItem(item));
  }

  addLanguageItem(langData = null) {
    const item = langData || {
      name: "",
      level: "Professional"
    };
    if (!langData) this.data.languages.push(item);

    const card = document.createElement("div");
    card.className = "repeatable-card lang-item-card";
    card.innerHTML = `
      <div class="card-top-bar">
        <span class="card-badge">Language</span>
        <button type="button" class="btn-delete-card" title="Delete language">✕</button>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Language</label>
          <input type="text" class="lang-name" placeholder="e.g. English, Spanish" value="${escapeHtml(item.name)}" />
        </div>
        <div class="form-group">
          <label>Proficiency</label>
          <input type="text" class="lang-level" placeholder="e.g. Native, Fluent, Intermediate" value="${escapeHtml(item.level)}" />
        </div>
      </div>
    `;

    card.querySelector(".btn-delete-card").addEventListener("click", () => {
      card.remove();
      this.collectFormData();
      this.renderResume();
    });

    this.languagesContainer.appendChild(card);
    if (!langData) {
      const firstInput = card.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  renderLanguagesList() {
    this.languagesContainer.innerHTML = "";
    (this.data.languages || []).forEach(item => this.addLanguageItem(item));
  }

  // --- Render Resume ---

  renderResume() {
    // Generate HTML according to active template
    let html = "";
    if (this.activeTemplate === "attractive") {
      html = renderAttractiveResume(this.data);
    } else {
      html = renderPlainResume(this.data);
    }

    this.previewContainer.innerHTML = html;

    // Apply accent color CSS custom properties
    const resumeSheet = document.getElementById("resume-sheet");
    if (resumeSheet) {
      resumeSheet.style.setProperty("--accent-color", this.accentColor);
      resumeSheet.style.setProperty("--accent-light", this.hexToRgba(this.accentColor, 0.09));
      resumeSheet.style.setProperty("--accent-border", this.hexToRgba(this.accentColor, 0.22));
    }

    // Maintain active zoom scale
    this.setZoom(this.zoom);
  }

  hexToRgba(hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",")},${alpha})`;
    }
    return `rgba(37,99,235,${alpha})`;
  }

  handleGenerate() {
    this.collectFormData();
    this.renderResume();

    // Trigger visual pulse animation on resume sheet
    const sheet = document.getElementById("resume-sheet");
    if (sheet) {
      sheet.classList.remove("pulse-updated");
      void sheet.offsetWidth; // Trigger reflow
      sheet.classList.add("pulse-updated");
    }

    // Switch to preview tab on mobile
    if (window.innerWidth < 1024 && this.tabPreview) {
      this.tabPreview.click();
    }

    window.pdfExporter.showToast("✨ Resume generated and updated successfully!", "success");
  }

  handleDownloadPDF() {
    this.collectFormData();
    this.renderResume();
    window.pdfExporter.downloadPDF(this.data, this.activeTemplate);
  }

  handleLoadSample() {
    if (confirm("Replace current inputs with sample professional resume data?")) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA));
      this.saveData();
      this.populateForm();
      this.renderResume();
      window.pdfExporter.showToast("Loaded sample resume data!", "success");
    }
  }

  handleClearForm() {
    if (confirm("Are you sure you want to clear all form fields?")) {
      this.data = JSON.parse(JSON.stringify(EMPTY_RESUME_DATA));
      this.saveData();
      this.populateForm();
      this.renderResume();
      window.pdfExporter.showToast("Form cleared.", "info");
    }
  }

  // --- Zoom Controls ---

  changeZoom(delta) {
    this.setZoom(Math.max(0.5, Math.min(1.5, this.zoom + delta)));
  }

  setZoom(val) {
    this.zoom = parseFloat(val.toFixed(2));
    const paper = document.getElementById("resume-sheet");
    const zoomText = document.getElementById("zoom-level-text");
    if (paper) {
      paper.style.transform = `scale(${this.zoom})`;
      paper.style.transformOrigin = "top center";
    }
    if (zoomText) {
      zoomText.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  // --- Supabase Cloud Sync Methods ---

  initSupabase() {
    this.sbModalBtn = document.getElementById("btn-supabase-modal");
    this.sbSaveCloudBtn = document.getElementById("btn-save-cloud");
    this.sbStatusDot = document.getElementById("sb-status-dot");
    this.sbBtnText = document.getElementById("sb-btn-text");
    this.sbModal = document.getElementById("supabase-modal");
    this.sbCloseBtn = document.getElementById("btn-close-sb-modal");

    // Modal tabs
    this.sbTabResumes = document.getElementById("tab-btn-resumes");
    this.sbTabAuth = document.getElementById("tab-btn-auth");
    this.sbTabConfig = document.getElementById("tab-btn-config");

    // Config tab elements
    this.sbInputUrl = document.getElementById("sb-input-url");
    this.sbInputKey = document.getElementById("sb-input-key");
    this.btnSaveSbConfig = document.getElementById("btn-save-sb-config");
    this.btnClearSbConfig = document.getElementById("btn-clear-sb-config");
    this.sbStatusText = document.getElementById("sb-status-text");
    this.sbStatusIcon = document.getElementById("sb-status-icon");

    // Auth tab elements
    this.sbAuthEmail = document.getElementById("sb-auth-email");
    this.sbAuthPassword = document.getElementById("sb-auth-password");
    this.btnSbSignin = document.getElementById("btn-sb-signin");
    this.btnSbSignup = document.getElementById("btn-sb-signup");
    this.btnSbSignout = document.getElementById("btn-sb-signout");
    this.sbUserEmailDisplay = document.getElementById("sb-user-email-display");
    this.sbAuthLoggedIn = document.getElementById("sb-auth-logged-in");
    this.sbAuthLoggedOut = document.getElementById("sb-auth-logged-out");

    // Resumes tab elements
    this.sbResumesContainer = document.getElementById("sb-resumes-container");
    this.sbResumesAuthNotice = document.getElementById("sb-resumes-auth-notice");
    this.sbResumesList = document.getElementById("sb-resumes-list");
    this.btnRefreshResumes = document.getElementById("btn-refresh-resumes");
    this.btnSaveAsNewModal = document.getElementById("btn-save-as-new-modal");
    this.btnGotoAuth = document.getElementById("btn-goto-auth");

    // Populate credentials if already saved
    if (window.supabaseService) {
      const creds = window.supabaseService.getCredentials();
      if (this.sbInputUrl) this.sbInputUrl.value = creds.url || "";
      if (this.sbInputKey) this.sbInputKey.value = creds.anonKey || "";

      window.supabaseService.onAuthStateChange(() => {
        this.updateSupabaseUI();
      });
    }

    this.bindSupabaseEvents();
    this.updateSupabaseUI();
  }

  bindSupabaseEvents() {
    // Open/Close modal
    if (this.sbModalBtn) {
      this.sbModalBtn.addEventListener("click", () => this.openSupabaseModal());
    }
    if (this.sbCloseBtn) {
      this.sbCloseBtn.addEventListener("click", () => this.closeSupabaseModal());
    }
    if (this.sbModal) {
      this.sbModal.addEventListener("click", (e) => {
        if (e.target === this.sbModal) this.closeSupabaseModal();
      });
    }

    // Modal Tabs
    document.querySelectorAll(".sb-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.tab;
        this.switchSupabaseTab(targetId);
      });
    });

    if (this.btnGotoAuth) {
      this.btnGotoAuth.addEventListener("click", () => {
        if (!window.supabaseService.isConnected()) {
          this.switchSupabaseTab("sb-tab-config");
        } else {
          this.switchSupabaseTab("sb-tab-auth");
        }
      });
    }

    // Save cloud button in top bar
    if (this.sbSaveCloudBtn) {
      this.sbSaveCloudBtn.addEventListener("click", () => this.handleSaveCloud(false));
    }

    // Save as new in modal
    if (this.btnSaveAsNewModal) {
      this.btnSaveAsNewModal.addEventListener("click", () => this.handleSaveCloud(true));
    }

    // Refresh resumes
    if (this.btnRefreshResumes) {
      this.btnRefreshResumes.addEventListener("click", () => this.fetchCloudResumes());
    }

    // Config Save & Test
    if (this.btnSaveSbConfig) {
      this.btnSaveSbConfig.addEventListener("click", async () => {
        const url = this.sbInputUrl.value.trim();
        const key = this.sbInputKey.value.trim();
        try {
          this.btnSaveSbConfig.disabled = true;
          this.btnSaveSbConfig.textContent = "Connecting...";
          await window.supabaseService.setCredentials(url, key);
          window.pdfExporter.showToast("✓ Connected to Supabase!", "success");
          this.updateSupabaseUI();
          this.switchSupabaseTab("sb-tab-auth");
        } catch (err) {
          alert("Connection Error: " + err.message);
        } finally {
          this.btnSaveSbConfig.disabled = false;
          this.btnSaveSbConfig.textContent = "Test & Connect";
        }
      });
    }

    // Config Clear
    if (this.btnClearSbConfig) {
      this.btnClearSbConfig.addEventListener("click", () => {
        if (confirm("Disconnect and clear saved Supabase credentials?")) {
          window.supabaseService.clearCredentials();
          if (this.sbInputUrl) this.sbInputUrl.value = "";
          if (this.sbInputKey) this.sbInputKey.value = "";
          this.updateSupabaseUI();
          window.pdfExporter.showToast("Supabase disconnected.", "info");
        }
      });
    }

    // Auth Sign In
    if (this.btnSbSignin) {
      this.btnSbSignin.addEventListener("click", async () => {
        const email = this.sbAuthEmail.value.trim();
        const pass = this.sbAuthPassword.value;
        if (!email || !pass) return alert("Please enter both email and password.");

        try {
          this.btnSbSignin.disabled = true;
          this.btnSbSignin.textContent = "Signing In...";
          await window.supabaseService.signIn(email, pass);
          window.pdfExporter.showToast(`Welcome back, ${email}!`, "success");
          this.switchSupabaseTab("sb-tab-resumes");
        } catch (err) {
          alert("Sign In Error: " + err.message);
        } finally {
          this.btnSbSignin.disabled = false;
          this.btnSbSignin.textContent = "Sign In";
        }
      });
    }

    // Auth Sign Up
    if (this.btnSbSignup) {
      this.btnSbSignup.addEventListener("click", async () => {
        const email = this.sbAuthEmail.value.trim();
        const pass = this.sbAuthPassword.value;
        if (!email || !pass) return alert("Please enter both email and password.");
        if (pass.length < 6) return alert("Password must be at least 6 characters.");

        try {
          this.btnSbSignup.disabled = true;
          this.btnSbSignup.textContent = "Creating...";
          const data = await window.supabaseService.signUp(email, pass);
          if (data && data.user && data.user.identities && data.user.identities.length === 0) {
            alert("An account with this email already exists. Please Sign In.");
          } else {
            window.pdfExporter.showToast("Account created successfully!", "success");
            this.switchSupabaseTab("sb-tab-resumes");
          }
        } catch (err) {
          alert("Sign Up Error: " + err.message);
        } finally {
          this.btnSbSignup.disabled = false;
          this.btnSbSignup.textContent = "Create Account";
        }
      });
    }

    // Auth Sign Out
    if (this.btnSbSignout) {
      this.btnSbSignout.addEventListener("click", async () => {
        try {
          await window.supabaseService.signOut();
          window.pdfExporter.showToast("Signed out.", "info");
          this.updateSupabaseUI();
        } catch (err) {
          alert("Sign out error: " + err.message);
        }
      });
    }
  }

  updateSupabaseUI() {
    const isConn = window.supabaseService && window.supabaseService.isConnected();
    const isAuth = window.supabaseService && window.supabaseService.isAuthenticated();
    const userEmail = isAuth ? window.supabaseService.getUserEmail() : null;

    // Header buttons
    if (this.sbStatusDot) {
      this.sbStatusDot.className = "sb-status-dot " + (isAuth ? "dot-connected" : (isConn ? "dot-needs-auth" : "dot-disconnected"));
    }

    if (this.sbBtnText) {
      if (isAuth) {
        this.sbBtnText.textContent = userEmail.split("@")[0];
      } else if (isConn) {
        this.sbBtnText.textContent = "Sign In (Cloud)";
      } else {
        this.sbBtnText.textContent = "Supabase Cloud";
      }
    }

    if (this.sbSaveCloudBtn) {
      this.sbSaveCloudBtn.style.display = isAuth ? "inline-flex" : "none";
    }

    // Status banner in connection tab
    if (this.sbStatusText && this.sbStatusIcon) {
      if (isConn) {
        this.sbStatusIcon.textContent = "🟢";
        this.sbStatusText.textContent = "Connected to Supabase project";
      } else {
        this.sbStatusIcon.textContent = "⚪";
        this.sbStatusText.textContent = "Not connected";
      }
    }

    // Auth tab state
    if (this.sbAuthLoggedIn && this.sbAuthLoggedOut) {
      if (isAuth) {
        this.sbAuthLoggedIn.style.display = "block";
        this.sbAuthLoggedOut.style.display = "none";
        if (this.sbUserEmailDisplay) this.sbUserEmailDisplay.textContent = userEmail;
      } else {
        this.sbAuthLoggedIn.style.display = "none";
        this.sbAuthLoggedOut.style.display = "block";
      }
    }

    // Resumes tab state
    if (this.sbResumesContainer && this.sbResumesAuthNotice) {
      if (isAuth) {
        this.sbResumesContainer.style.display = "block";
        this.sbResumesAuthNotice.style.display = "none";
        this.fetchCloudResumes();
      } else {
        this.sbResumesContainer.style.display = "none";
        this.sbResumesAuthNotice.style.display = "block";
        const noticeText = document.getElementById("sb-auth-notice-text");
        if (noticeText) {
          noticeText.innerHTML = isConn 
            ? "Please <strong>Sign In</strong> to your Supabase account to view and sync your cloud resumes."
            : "Please <strong>Connect your Supabase project</strong> to enable cloud saving.";
        }
      }
    }
  }

  openSupabaseModal(targetTab = null) {
    if (!this.sbModal) return;
    this.sbModal.classList.add("active");
    if (targetTab) {
      this.switchSupabaseTab(targetTab);
    } else {
      if (window.supabaseService && window.supabaseService.isAuthenticated()) {
        this.switchSupabaseTab("sb-tab-resumes");
      } else if (window.supabaseService && window.supabaseService.isConnected()) {
        this.switchSupabaseTab("sb-tab-auth");
      } else {
        this.switchSupabaseTab("sb-tab-config");
      }
    }
  }

  closeSupabaseModal() {
    if (this.sbModal) this.sbModal.classList.remove("active");
  }

  switchSupabaseTab(tabId) {
    document.querySelectorAll(".sb-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".sb-tab-content").forEach(content => {
      content.classList.toggle("active", content.id === tabId);
    });
  }

  async handleSaveCloud(asNew = false) {
    if (!window.supabaseService || !window.supabaseService.isConnected()) {
      this.openSupabaseModal("sb-tab-config");
      window.pdfExporter.showToast("Please connect your Supabase project first.", "info");
      return;
    }

    if (!window.supabaseService.isAuthenticated()) {
      this.openSupabaseModal("sb-tab-auth");
      window.pdfExporter.showToast("Please sign in to save your resume to the cloud.", "info");
      return;
    }

    this.collectFormData();

    const defaultTitle = (this.data.personal && this.data.personal.fullName)
      ? `${this.data.personal.fullName}'s Resume`
      : "My Resume";

    const title = prompt("Enter a title for this resume:", defaultTitle);
    if (!title) return;

    try {
      window.pdfExporter.showToast("Saving to Supabase Cloud...", "info");
      const saved = await window.supabaseService.saveResume({
        title,
        data: this.data,
        template: this.activeTemplate,
        accentColor: this.accentColor,
        resumeId: asNew ? null : window.supabaseService.currentResumeId
      });

      window.pdfExporter.showToast(`☁️ Saved "${saved.title}" to Supabase!`, "success");
      this.fetchCloudResumes();
    } catch (err) {
      alert("Error saving to Supabase: " + err.message);
    }
  }

  async fetchCloudResumes() {
    if (!this.sbResumesList || !window.supabaseService || !window.supabaseService.isAuthenticated()) return;

    this.sbResumesList.innerHTML = `<div class="sb-empty-state">Loading resumes...</div>`;

    try {
      const resumes = await window.supabaseService.listResumes();
      if (resumes.length === 0) {
        this.sbResumesList.innerHTML = `<div class="sb-empty-state">No resumes saved in Supabase yet.<br>Click "Save Current as New" above!</div>`;
        return;
      }

      this.sbResumesList.innerHTML = resumes.map(r => {
        const isCurrent = window.supabaseService.currentResumeId === r.id;
        const updatedDate = new Date(r.updated_at).toLocaleDateString(undefined, {
          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
        const isAttractive = r.template === "attractive";

        return `
          <div class="sb-resume-item ${isCurrent ? 'active-cloud' : ''}" data-id="${r.id}">
            <div class="sb-resume-info">
              <div class="sb-resume-title-wrap">
                <span class="sb-resume-title">${escapeHtml(r.title)}</span>
                <span class="sb-resume-tag ${isAttractive ? 'sb-tag-attractive' : 'sb-tag-plain'}">
                  ${isAttractive ? 'Attractive' : 'Plain'}
                </span>
                ${isCurrent ? '<span class="card-badge">Active</span>' : ''}
              </div>
              <div class="sb-resume-meta">
                <span>Updated: ${updatedDate}</span>
              </div>
            </div>
            <div class="sb-resume-actions">
              <button type="button" class="btn btn-secondary btn-sm btn-load-cloud" data-id="${r.id}">
                Open
              </button>
              <button type="button" class="btn btn-danger-outline btn-sm btn-delete-cloud" data-id="${r.id}" title="Delete">
                ✕
              </button>
            </div>
          </div>
        `;
      }).join("");

      // Bind actions
      this.sbResumesList.querySelectorAll(".btn-load-cloud").forEach(btn => {
        btn.addEventListener("click", () => this.handleLoadCloudResume(btn.dataset.id));
      });

      this.sbResumesList.querySelectorAll(".btn-delete-cloud").forEach(btn => {
        btn.addEventListener("click", () => this.handleDeleteCloudResume(btn.dataset.id));
      });

    } catch (err) {
      this.sbResumesList.innerHTML = `<div class="sb-empty-state" style="color: #f87171;">Failed to load: ${escapeHtml(err.message)}</div>`;
    }
  }

  async handleLoadCloudResume(id) {
    if (!confirm("Load this resume into the editor? Any unsaved local edits will be replaced.")) return;

    try {
      const resume = await window.supabaseService.loadResume(id);
      this.data = resume.data;
      this.saveData();
      this.populateForm();

      if (resume.template) {
        this.setTemplate(resume.template);
      }
      if (resume.accent_color) {
        this.setAccentColor(resume.accent_color);
      }

      this.renderResume();
      this.closeSupabaseModal();
      window.pdfExporter.showToast(`Loaded "${resume.title}" from Supabase!`, "success");
    } catch (err) {
      alert("Error loading resume: " + err.message);
    }
  }

  async handleDeleteCloudResume(id) {
    if (!confirm("Are you sure you want to delete this resume from Supabase?")) return;

    try {
      await window.supabaseService.deleteResume(id);
      window.pdfExporter.showToast("Resume deleted from cloud.", "info");
      this.fetchCloudResumes();
    } catch (err) {
      alert("Error deleting resume: " + err.message);
    }
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new ResumeApp();
});
