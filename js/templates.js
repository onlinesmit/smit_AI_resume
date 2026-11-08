/**
 * Resume HTML Generators for both Plain and Attractive templates
 */

// Safe HTML escaping
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert text with bullets or newlines into clean <li> list items
function formatBulletList(text) {
  if (!text) return "";
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return "";

  const items = lines.map(line => {
    // Strip leading bullet characters if already present
    const cleaned = line.replace(/^[•\-\*–—]\s*/, "");
    return `<li>${escapeHtml(cleaned)}</li>`;
  });

  return `<ul class="bullet-list">${items.join("")}</ul>`;
}

// Inline SVGs for the Attractive template (zero external dependency)
const ICONS = {
  email: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  location: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  globe: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  linkedin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z"/></svg>`,
  github: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  twitter: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  calendar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  briefcase: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  graduation: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  code: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  award: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  externalLink: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
};

/**
 * Intelligent URL beautifier and handle formatter
 */
function formatSocialLink(url, platform) {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;

  let href = raw;
  if (!href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
    href = "https://" + href;
  }

  // Remove protocol, www., and trailing slashes for clean display
  let clean = raw
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");

  let label = "Link";
  let shortDisplay = clean;
  let handle = clean;

  switch (platform) {
    case "github":
      label = "GitHub";
      const ghMatch = clean.match(/^github\.com\/([a-zA-Z0-9_\-\.]+)/i);
      if (ghMatch) {
        handle = ghMatch[1];
        shortDisplay = "github.com/" + handle;
      } else if (clean.startsWith("@")) {
        handle = clean.substring(1);
        shortDisplay = "github.com/" + handle;
        href = "https://github.com/" + handle;
      } else {
        shortDisplay = clean;
      }
      break;

    case "linkedin":
      label = "LinkedIn";
      const liMatch = clean.match(/^linkedin\.com\/in\/([a-zA-Z0-9_\-\.]+)/i);
      if (liMatch) {
        handle = "in/" + liMatch[1];
        shortDisplay = "linkedin.com/in/" + liMatch[1];
      } else {
        shortDisplay = clean;
      }
      break;

    case "twitter":
      label = "X / Twitter";
      const twMatch = clean.match(/^(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i);
      if (twMatch) {
        handle = "@" + twMatch[1];
        shortDisplay = "x.com/" + twMatch[1];
      } else if (clean.startsWith("@")) {
        handle = clean;
        shortDisplay = "x.com/" + clean.substring(1);
        href = "https://x.com/" + clean.substring(1);
      } else {
        shortDisplay = clean;
      }
      break;

    case "website":
      label = "Portfolio";
      shortDisplay = clean;
      handle = clean;
      break;

    default:
      label = "Profile";
      shortDisplay = clean;
      handle = clean;
      break;
  }

  return {
    href,
    clean,
    label,
    handle,
    shortDisplay
  };
}

/**
 * TEMPLATE 1: PLAIN (Zero colors, 100% black and white, ATS friendly)
 */
function renderPlainResume(data) {
  const p = data.personal || {};

  // Parse & format links
  const li = formatSocialLink(p.linkedin, "linkedin");
  const gh = formatSocialLink(p.github, "github");
  const web = formatSocialLink(p.website, "website");
  const tw = formatSocialLink(p.twitter, "twitter");

  // Primary contacts (Line 1)
  const primaryContacts = [];
  if (p.email) primaryContacts.push(`<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>`);
  if (p.phone) primaryContacts.push(`<span>${escapeHtml(p.phone)}</span>`);
  if (p.location) primaryContacts.push(`<span>${escapeHtml(p.location)}</span>`);

  // Digital & Social profiles (Line 2)
  const socialContacts = [];
  if (li) socialContacts.push(`<a href="${escapeHtml(li.href)}" target="_blank"><strong>LinkedIn:</strong> ${escapeHtml(li.shortDisplay)}</a>`);
  if (gh) socialContacts.push(`<a href="${escapeHtml(gh.href)}" target="_blank"><strong>GitHub:</strong> ${escapeHtml(gh.shortDisplay)}</a>`);
  if (web) socialContacts.push(`<a href="${escapeHtml(web.href)}" target="_blank"><strong>Portfolio:</strong> ${escapeHtml(web.shortDisplay)}</a>`);
  if (tw) socialContacts.push(`<a href="${escapeHtml(tw.href)}" target="_blank"><strong>${escapeHtml(tw.label)}:</strong> ${escapeHtml(tw.shortDisplay)}</a>`);

  // Filter valid work experience items
  const validExp = (data.experience || []).filter(e => e.title || e.company || e.description);
  const expHtml = validExp.map(exp => {
    const dates = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
    return `
      <div class="plain-entry">
        <div class="plain-entry-header">
          <div>
            <span class="plain-entry-title">${escapeHtml(exp.title)}</span>
            ${exp.company ? `<span class="plain-entry-subtitle">, ${escapeHtml(exp.company)}</span>` : ""}
          </div>
          <div class="plain-entry-meta">
            ${exp.location ? `<span>${escapeHtml(exp.location)}</span> | ` : ""}
            <span>${escapeHtml(dates)}</span>
          </div>
        </div>
        ${exp.description ? `<div class="plain-entry-desc">${formatBulletList(exp.description)}</div>` : ""}
      </div>
    `;
  }).join("");

  // Filter valid education items
  const validEdu = (data.education || []).filter(e => e.degree || e.school || e.details);
  const eduHtml = validEdu.map(edu => {
    const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
    return `
      <div class="plain-entry">
        <div class="plain-entry-header">
          <div>
            <span class="plain-entry-title">${escapeHtml(edu.degree)}</span>
            ${edu.school ? `<span class="plain-entry-subtitle">, ${escapeHtml(edu.school)}</span>` : ""}
          </div>
          <div class="plain-entry-meta">
            ${edu.location ? `<span>${escapeHtml(edu.location)}</span> | ` : ""}
            <span>${escapeHtml(dates)}</span>
          </div>
        </div>
        ${edu.details ? `<div class="plain-entry-details">${escapeHtml(edu.details)}</div>` : ""}
      </div>
    `;
  }).join("");

  // Filter valid projects
  const validProj = (data.projects || []).filter(p => p.name || p.description);
  const projHtml = validProj.map(proj => {
    const isGithub = proj.link && proj.link.toLowerCase().includes("github");
    const linkDisplay = isGithub ? "github.com/" + proj.link.replace(/^https?:\/\/(www\.)?github\.com\/?/i, "") : proj.link.replace(/^https?:\/\//i, "");

    return `
      <div class="plain-entry">
        <div class="plain-entry-header">
          <div>
            <span class="plain-entry-title">${escapeHtml(proj.name)}</span>
            ${proj.tech ? `<span class="plain-entry-tech"> (${escapeHtml(proj.tech)})</span>` : ""}
          </div>
          ${proj.link ? `<div class="plain-entry-meta"><a href="${escapeHtml(proj.link.startsWith('http') ? proj.link : 'https://' + proj.link)}" target="_blank"><strong>${isGithub ? 'GitHub:' : 'Link:'}</strong> ${escapeHtml(linkDisplay)}</a></div>` : ""}
        </div>
        ${proj.description ? `<div class="plain-entry-desc">${formatBulletList(proj.description)}</div>` : ""}
      </div>
    `;
  }).join("");

  // Skills
  const skillsHtml = (data.skills || []).filter(s => s.items && s.items.trim()).map(s => {
    return `
      <div class="plain-skill-line">
        <strong>${escapeHtml(s.category)}:</strong> ${escapeHtml(s.items)}
      </div>
    `;
  }).join("");

  // Filter valid certifications
  const validCerts = (data.certifications || []).filter(c => c.name || c.issuer);
  const certsHtml = validCerts.map(cert => {
    return `
      <div class="plain-cert-item">
        <span><strong>${escapeHtml(cert.name)}</strong>${cert.issuer ? ` – ${escapeHtml(cert.issuer)}` : ""}</span>
        ${cert.date ? `<span class="plain-cert-date">${escapeHtml(cert.date)}</span>` : ""}
      </div>
    `;
  }).join("");

  // Filter valid languages
  const validLangs = (data.languages || []).filter(l => l.name && l.name.trim());
  const langsHtml = validLangs.map(lang => {
    return `<span><strong>${escapeHtml(lang.name)}</strong>${lang.level ? ` (${escapeHtml(lang.level)})` : ""}</span>`;
  }).join(" • ");

  return `
    <div class="resume-sheet template-plain" id="resume-sheet">
      <!-- Header -->
      <header class="plain-header">
        <h1 class="plain-name">${escapeHtml(p.fullName || "Your Full Name")}</h1>
        ${p.jobTitle ? `<div class="plain-title">${escapeHtml(p.jobTitle)}</div>` : ""}
        ${primaryContacts.length > 0 ? `<div class="plain-contact-line plain-primary-contacts">${primaryContacts.join(" &nbsp;•&nbsp; ")}</div>` : ""}
        ${socialContacts.length > 0 ? `<div class="plain-contact-line plain-social-contacts">${socialContacts.join(" &nbsp;•&nbsp; ")}</div>` : ""}
      </header>

      <!-- Professional Summary -->
      ${data.summary ? `
        <section class="plain-section">
          <h2 class="plain-section-title">PROFESSIONAL SUMMARY</h2>
          <div class="plain-section-divider"></div>
          <p class="plain-summary-text">${escapeHtml(data.summary)}</p>
        </section>
      ` : ""}

      <!-- Work Experience -->
      ${expHtml ? `
        <section class="plain-section">
          <h2 class="plain-section-title">WORK EXPERIENCE</h2>
          <div class="plain-section-divider"></div>
          ${expHtml}
        </section>
      ` : ""}

      <!-- Education -->
      ${eduHtml ? `
        <section class="plain-section">
          <h2 class="plain-section-title">EDUCATION</h2>
          <div class="plain-section-divider"></div>
          ${eduHtml}
        </section>
      ` : ""}

      <!-- Projects -->
      ${projHtml ? `
        <section class="plain-section">
          <h2 class="plain-section-title">PROJECTS</h2>
          <div class="plain-section-divider"></div>
          ${projHtml}
        </section>
      ` : ""}

      <!-- Skills -->
      ${skillsHtml ? `
        <section class="plain-section">
          <h2 class="plain-section-title">TECHNICAL &amp; CORE SKILLS</h2>
          <div class="plain-section-divider"></div>
          <div class="plain-skills-wrapper">
            ${skillsHtml}
          </div>
        </section>
      ` : ""}

      <!-- Certifications -->
      ${certsHtml ? `
        <section class="plain-section">
          <h2 class="plain-section-title">CERTIFICATIONS</h2>
          <div class="plain-section-divider"></div>
          <div class="plain-certs-wrapper">
            ${certsHtml}
          </div>
        </section>
      ` : ""}

      <!-- Languages -->
      ${langsHtml ? `
        <section class="plain-section">
          <h2 class="plain-section-title">LANGUAGES</h2>
          <div class="plain-section-divider"></div>
          <div class="plain-langs-wrapper">${langsHtml}</div>
        </section>
      ` : ""}
    </div>
  `;
}

/**
 * TEMPLATE 2: ATTRACTIVE (Modern, Executive Two-Column, Accent Colors, Badge Pills, Icons, Timeline)
 */
function renderAttractiveResume(data) {
  const p = data.personal || {};

  // Split skills into badge pills
  const skillsSidebarHtml = (data.skills || []).filter(s => s.items && s.items.trim()).map(s => {
    const badges = s.items
      .split(/[,•|]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => `<span class="attr-pill">${escapeHtml(item)}</span>`)
      .join("");

    return `
      <div class="attr-skill-group">
        <h4 class="attr-skill-category">${escapeHtml(s.category)}</h4>
        <div class="attr-pills-container">${badges}</div>
      </div>
    `;
  }).join("");

  // Experience timeline
  const validExp = (data.experience || []).filter(e => e.title || e.company || e.description);
  const expHtml = validExp.map(exp => {
    const dates = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
    return `
      <div class="attr-timeline-item">
        <div class="attr-timeline-dot"></div>
        <div class="attr-timeline-header">
          <div class="attr-exp-title-group">
            <h3 class="attr-item-title">${escapeHtml(exp.title)}</h3>
            ${exp.company ? `<div class="attr-item-company">${escapeHtml(exp.company)}</div>` : ""}
          </div>
          <div class="attr-item-badge-date">
            <span class="attr-calendar-icon">${ICONS.calendar}</span>
            <span>${escapeHtml(dates)}</span>
          </div>
        </div>
        ${exp.location ? `<div class="attr-item-location">${ICONS.location} <span>${escapeHtml(exp.location)}</span></div>` : ""}
        ${exp.description ? `<div class="attr-item-desc">${formatBulletList(exp.description)}</div>` : ""}
      </div>
    `;
  }).join("");

  // Education sidebar
  const validEdu = (data.education || []).filter(e => e.degree || e.school || e.details);
  const eduSidebarHtml = validEdu.map(edu => {
    const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
    return `
      <div class="attr-edu-card">
        <div class="attr-edu-degree">${escapeHtml(edu.degree)}</div>
        <div class="attr-edu-school">${escapeHtml(edu.school)}</div>
        <div class="attr-edu-dates">${escapeHtml(dates)}${edu.location ? ` • ${escapeHtml(edu.location)}` : ""}</div>
        ${edu.details ? `<div class="attr-edu-details">${escapeHtml(edu.details)}</div>` : ""}
      </div>
    `;
  }).join("");

  // Projects in main column
  const validProj = (data.projects || []).filter(p => p.name || p.description);
  const projHtml = validProj.map(proj => {
    const techBadges = proj.tech
      ? proj.tech.split(/[,•|]+/)
          .map(t => t.trim())
          .filter(t => t.length > 0)
          .map(t => `<span class="attr-tech-badge">${escapeHtml(t)}</span>`)
          .join("")
      : "";

    const isGithub = proj.link && proj.link.toLowerCase().includes("github");
    const projLinkDisplay = isGithub ? "GitHub Repo" : "Live Demo";
    const projIcon = isGithub ? ICONS.github : ICONS.externalLink;

    return `
      <div class="attr-project-card">
        <div class="attr-project-header">
          <div class="attr-project-title-row">
            <h3 class="attr-project-title">${escapeHtml(proj.name)}</h3>
            ${proj.link ? `
              <a href="${escapeHtml(proj.link.startsWith('http') ? proj.link : 'https://' + proj.link)}" target="_blank" class="attr-project-link-badge">
                <span class="attr-project-link-icon">${projIcon}</span>
                <span>${projLinkDisplay}</span>
              </a>` : ""}
          </div>
          ${techBadges ? `<div class="attr-project-tech-row">${techBadges}</div>` : ""}
        </div>
        ${proj.description ? `<div class="attr-project-desc">${formatBulletList(proj.description)}</div>` : ""}
      </div>
    `;
  }).join("");

  // Certifications sidebar
  const validCerts = (data.certifications || []).filter(c => c.name || c.issuer);
  const certsSidebarHtml = validCerts.map(cert => {
    return `
      <div class="attr-cert-card">
        <div class="attr-cert-name">${escapeHtml(cert.name)}</div>
        <div class="attr-cert-meta">
          ${cert.issuer ? `<span>${escapeHtml(cert.issuer)}</span>` : ""}
          ${cert.date ? `<span class="attr-cert-date">${escapeHtml(cert.date)}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");

  // Languages sidebar
  const validLangs = (data.languages || []).filter(l => l.name && l.name.trim());
  const langsSidebarHtml = validLangs.map(lang => {
    return `
      <div class="attr-lang-row">
        <span class="attr-lang-name">${escapeHtml(lang.name)}</span>
        <span class="attr-lang-level">${escapeHtml(lang.level)}</span>
      </div>
    `;
  }).join("");

  // Format Social Links for Attractive Template
  const li = formatSocialLink(p.linkedin, "linkedin");
  const gh = formatSocialLink(p.github, "github");
  const web = formatSocialLink(p.website, "website");
  const tw = formatSocialLink(p.twitter, "twitter");

  return `
    <div class="resume-sheet template-attractive" id="resume-sheet">
      <!-- Left Column / Sidebar -->
      <aside class="attr-sidebar">
        <!-- Optional Profile Avatar -->
        ${p.showPhoto && p.photoUrl ? `
          <div class="attr-avatar-container">
            <img src="${escapeHtml(p.photoUrl)}" alt="${escapeHtml(p.fullName)}" class="attr-avatar-img" />
          </div>
        ` : ""}

        <!-- Contact & Profiles Section -->
        <div class="attr-sidebar-section">
          <h3 class="attr-sidebar-heading">CONTACT &amp; PROFILES</h3>
          <div class="attr-contact-cards-container">
            ${p.email ? `
              <a href="mailto:${escapeHtml(p.email)}" class="attr-contact-card" title="Email: ${escapeHtml(p.email)}">
                <div class="attr-card-icon icon-email">${ICONS.email}</div>
                <div class="attr-card-info">
                  <span class="attr-card-label">EMAIL</span>
                  <span class="attr-card-val">${escapeHtml(p.email)}</span>
                </div>
              </a>
            ` : ""}
            ${p.phone ? `
              <div class="attr-contact-card" title="Phone: ${escapeHtml(p.phone)}">
                <div class="attr-card-icon icon-phone">${ICONS.phone}</div>
                <div class="attr-card-info">
                  <span class="attr-card-label">PHONE</span>
                  <span class="attr-card-val">${escapeHtml(p.phone)}</span>
                </div>
              </div>
            ` : ""}
            ${p.location ? `
              <div class="attr-contact-card" title="Location: ${escapeHtml(p.location)}">
                <div class="attr-card-icon icon-location">${ICONS.location}</div>
                <div class="attr-card-info">
                  <span class="attr-card-label">LOCATION</span>
                  <span class="attr-card-val">${escapeHtml(p.location)}</span>
                </div>
              </div>
            ` : ""}
            ${li ? `
              <a href="${escapeHtml(li.href)}" target="_blank" class="attr-contact-card attr-social-card" title="LinkedIn: ${escapeHtml(li.shortDisplay)}">
                <div class="attr-card-icon icon-linkedin">${ICONS.linkedin}</div>
                <div class="attr-card-info">
                  <span class="attr-card-label">LINKEDIN</span>
                  <span class="attr-card-val">${escapeHtml(li.shortDisplay)}</span>
                </div>
                <span class="attr-card-arrow">${ICONS.externalLink}</span>
              </a>
            ` : ""}
            ${gh ? `
              <a href="${escapeHtml(gh.href)}" target="_blank" class="attr-contact-card attr-social-card" title="GitHub: ${escapeHtml(gh.shortDisplay)}">
                <div class="attr-card-icon icon-github">${ICONS.github}</div>
                <div class="attr-card-info">
                  <span class="attr-card-label">GITHUB</span>
                  <span class="attr-card-val">${escapeHtml(gh.shortDisplay)}</span>
                </div>
                <span class="attr-card-arrow">${ICONS.externalLink}</span>
              </a>
            ` : ""}
            ${web ? `
              <a href="${escapeHtml(web.href)}" target="_blank" class="attr-contact-card attr-social-card" title="Portfolio: ${escapeHtml(web.shortDisplay)}">
                <div class="attr-card-icon icon-website">${ICONS.globe}</div>
                <div class="attr-card-info">
                  <span class="attr-card-label">PORTFOLIO</span>
                  <span class="attr-card-val">${escapeHtml(web.shortDisplay)}</span>
                </div>
                <span class="attr-card-arrow">${ICONS.externalLink}</span>
              </a>
            ` : ""}
            ${tw ? `
              <a href="${escapeHtml(tw.href)}" target="_blank" class="attr-contact-card attr-social-card" title="${escapeHtml(tw.label)}: ${escapeHtml(tw.shortDisplay)}">
                <div class="attr-card-icon icon-twitter">${ICONS.twitter}</div>
                <div class="attr-card-info">
                  <span class="attr-card-label">${escapeHtml(tw.label.toUpperCase())}</span>
                  <span class="attr-card-val">${escapeHtml(tw.shortDisplay)}</span>
                </div>
                <span class="attr-card-arrow">${ICONS.externalLink}</span>
              </a>
            ` : ""}
          </div>
        </div>

        <!-- Skills Section -->
        ${skillsSidebarHtml ? `
          <div class="attr-sidebar-section">
            <h3 class="attr-sidebar-heading">SKILLS &amp; EXPERTISE</h3>
            ${skillsSidebarHtml}
          </div>
        ` : ""}

        <!-- Education Section -->
        ${eduSidebarHtml ? `
          <div class="attr-sidebar-section">
            <h3 class="attr-sidebar-heading">EDUCATION</h3>
            ${eduSidebarHtml}
          </div>
        ` : ""}

        <!-- Certifications Section -->
        ${certsSidebarHtml ? `
          <div class="attr-sidebar-section">
            <h3 class="attr-sidebar-heading">CERTIFICATIONS</h3>
            ${certsSidebarHtml}
          </div>
        ` : ""}

        <!-- Languages Section -->
        ${langsSidebarHtml ? `
          <div class="attr-sidebar-section">
            <h3 class="attr-sidebar-heading">LANGUAGES</h3>
            <div class="attr-langs-container">
              ${langsSidebarHtml}
            </div>
          </div>
        ` : ""}
      </aside>

      <!-- Right Main Column -->
      <main class="attr-main">
        <!-- Header Banner -->
        <header class="attr-header">
          <h1 class="attr-name">${escapeHtml(p.fullName || "Your Full Name")}</h1>
          ${p.jobTitle ? `<div class="attr-job-title">${escapeHtml(p.jobTitle)}</div>` : ""}
          <div class="attr-header-accent-line"></div>
        </header>

        <!-- Professional Summary -->
        ${data.summary ? `
          <section class="attr-section">
            <div class="attr-section-header">
              <span class="attr-section-icon">${ICONS.briefcase}</span>
              <h2 class="attr-section-title">PROFILE SUMMARY</h2>
            </div>
            <p class="attr-summary-text">${escapeHtml(data.summary)}</p>
          </section>
        ` : ""}

        <!-- Work Experience Timeline -->
        ${expHtml ? `
          <section class="attr-section">
            <div class="attr-section-header">
              <span class="attr-section-icon">${ICONS.briefcase}</span>
              <h2 class="attr-section-title">WORK EXPERIENCE</h2>
            </div>
            <div class="attr-timeline">
              ${expHtml}
            </div>
          </section>
        ` : ""}

        <!-- Key Projects -->
        ${projHtml ? `
          <section class="attr-section">
            <div class="attr-section-header">
              <span class="attr-section-icon">${ICONS.code}</span>
              <h2 class="attr-section-title">FEATURED PROJECTS</h2>
            </div>
            <div class="attr-projects-list">
              ${projHtml}
            </div>
          </section>
        ` : ""}
      </main>
    </div>
  `;
}
