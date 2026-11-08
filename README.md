# Smit_AI_resume_builder

A modern, responsive, zero-dependency web application for building, customizing, and downloading professional resumes in PDF format.

👉 **Live Demo:** [https://onlinesmit.github.io/smit_AI_resume/](https://onlinesmit.github.io/smit_AI_resume/)

---

## 🚀 How to Run

1. Open the project folder:
   ```
   c:\Users\Admin\Desktop\Project\Resume
   ```
2. Double-click **`index.html`** or right-click and select **Open with Google Chrome** (or Microsoft Edge / Brave / Firefox).
3. That's it! No build steps, `npm`, Node.js, or server setup required. It runs instantly and completely client-side.

---

## ✨ Features

### 1. Complete Resume Details Entry
- **Personal Information:** Full Name, Professional Title / Headline, Email, Phone, Location, Portfolio/Website, LinkedIn, GitHub, and Profile Photo upload with preview and toggle.
- **Professional Summary:** Career objective / executive summary.
- **Work Experience:** Dynamic repeater — add, delete, and reorder jobs. Includes Company, Job Title, Location, Start Date, End Date, "Present" checkbox, and formatted bullet points.
- **Education:** Degree / Major, School / University, Location, Graduation Year, and Honors / GPA.
- **Skills & Expertise:** Add multiple custom categories (Languages, Frameworks, Cloud, etc.) with comma-separated tags.
- **Featured Projects:** Project Name, Tech Stack, Live/Repo URL, and key accomplishments.
- **Certifications & Awards:** Certification Name, Issuing Organization, and Date.
- **Languages:** Language Name and Proficiency level.

### 2. Two Distinct Resume Templates
Users can switch between two styles with 1 click:

1. **📄 Classic Plain (Zero Colors):**
   - Strictly black & white / monochrome layout.
   - Clean, formal serif typography (Georgia / Times style).
   - ATS-friendly standard 1-column hierarchy with clean solid rules.
   - Perfect for traditional industries (Law, Finance, Government, Academia, strict ATS screening).
   - Zero background colors, zero badges, zero colored icons.

2. **🎨 Modern Attractive:**
   - Sleek executive two-column layout (Contact, Skills, Education on the sidebar; Summary, Experience, Projects on the main column).
   - Beautiful accent color palette with 6 curated presets (Royal Blue, Modern Indigo, Teal Cyan, Emerald Green, Slate Executive, Crimson Ruby) plus a custom color picker!
   - Modern inline SVG icons for email, phone, location, links, calendar, and briefcase.
   - Rounded skill badge pills and project tech tags.
   - Interactive vertical timeline for work experience.
   - Optional profile avatar image.

### 3. "Generate Resume" Button & Live Preview
- Prominent **Generate Resume** button compiles all fields, validates data, triggers a smooth glowing pulse animation on the paper preview, and updates the resume sheet.
- Live debounced sync ensures changes are reflected seamlessly as you type.
- Zoom controls: zoom out, zoom in, reset (Fit).

### 4. PDF Download Options
- **⬇ Download PDF:** High-resolution direct `.pdf` export using `html2pdf.js` with 2x canvas scaling and A4 pagination.
- **🖨️ Print to PDF:** Dedicated vector print stylesheet (`css/print.css`) that strips all web app chrome and formats the resume for crisp, selectable-text vector PDF generation via browser's native print dialog.

### 5. Supabase Cloud Sync & Account Management
- **⚡ Connect Supabase:** Connect your own Supabase project in seconds by pasting your Project URL & Anon Public Key in the in-app modal (or in `js/config.js`).
- **👤 User Authentication:** Secure email/password login and account creation powered by Supabase Auth with Row Level Security (RLS).
- **☁️ Save to Cloud:** Save current resumes to your remote PostgreSQL database.
- **📁 Multiple Resumes:** Manage, name, duplicate, open, and delete multiple resumes from anywhere.
- **📜 Schema Included:** A turnkey SQL script (`supabase_schema.sql`) is ready to run in the Supabase SQL Editor.

### 6. Convenience & Persistence
- **Auto-Save:** All entered details are safely saved to browser `localStorage` even when offline.
- **⚡ Load Sample Data:** 1-click button to immediately fill the form with a realistic senior engineer resume for instant demonstration.
- **🗑️ Clear Form:** Reset form fields with confirmation.
- **Mobile Responsive:** Adaptive tabbed navigation on smaller screens ([Edit Details] / [View Resume]).

---

## 📁 File Structure

```
Resume/
├── index.html           # Main HTML5 application shell & layout
├── supabase_schema.sql  # Database table schema and RLS security policies
├── css/
│   ├── style.css        # Application UI, modals, cloud sync badges, repeaters
│   ├── templates.css    # Distinct template styling (Plain B&W and Modern Attractive)
│   └── print.css        # @media print rules for flawless vector PDF export
├── js/
│   ├── data.js          # Default state and pre-loaded sample resume data
│   ├── config.js        # Supabase project URL & anonKey config file
│   ├── supabase.js      # Supabase client, authentication & cloud sync service
│   ├── templates.js     # Pure HTML rendering engines for Plain & Attractive styles
│   ├── pdf.js           # PDF export & vector print orchestration
│   └── app.js           # Main controller, state management, repeaters, cloud UI
└── README.md            # Documentation & user guide
```
