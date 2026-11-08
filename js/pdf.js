/**
 * PDF Export and Print Engine
 */

class PDFExporter {
  constructor() {
    this.isExporting = false;
  }

  /**
   * Primary PDF Download Method (uses html2pdf with high-res canvas)
   */
  async downloadPDF(resumeData, activeTemplate) {
    if (this.isExporting) return;
    this.isExporting = true;

    const resumeElement = document.getElementById("resume-sheet");
    if (!resumeElement) {
      alert("Please generate your resume first before downloading.");
      this.isExporting = false;
      return;
    }

    const fullName = (resumeData.personal && resumeData.personal.fullName) ? resumeData.personal.fullName.trim() : "Resume";
    const cleanFileName = `${fullName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.pdf`;

    this.showLoadingModal(`Preparing high-resolution PDF for "${fullName}"...`);

    // Check if html2pdf is loaded from CDN
    if (typeof window.html2pdf === "function") {
      try {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: cleanFileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2, // High resolution crisp text
            useCORS: true,
            letterRendering: true,
            scrollY: 0,
            windowWidth: 1024
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
          },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            before: ".page-break-before",
            after: ".page-break-after",
            avoid: [".plain-entry", ".attr-timeline-item", ".attr-project-card", ".attr-edu-card", ".attr-sidebar-section"]
          }
        };

        // Temporarily adjust classes if needed
        await window.html2pdf().set(opt).from(resumeElement).save();
        this.hideLoadingModal();
        this.showToast("✓ PDF downloaded successfully!", "success");
      } catch (err) {
        console.error("html2pdf error:", err);
        this.hideLoadingModal();
        this.showFallbackDialog();
      } finally {
        this.isExporting = false;
      }
    } else {
      // If CDN script couldn't be loaded (e.g. offline sandbox or network block), trigger native vector print dialog!
      this.hideLoadingModal();
      this.showFallbackDialog();
      this.isExporting = false;
    }
  }

  /**
   * High-quality Vector Print (Browser native Print to PDF)
   */
  printPDF() {
    this.showToast("Opening Print Dialog — Select 'Save as PDF' for best vector quality.", "info");
    setTimeout(() => {
      window.print();
    }, 250);
  }

  showLoadingModal(msg) {
    let modal = document.getElementById("pdf-loading-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "pdf-loading-modal";
      modal.className = "app-modal-overlay";
      modal.innerHTML = `
        <div class="app-modal-card">
          <div class="modal-spinner"></div>
          <h3 id="pdf-modal-title">Generating PDF</h3>
          <p id="pdf-modal-msg">${escapeHtml(msg)}</p>
          <div class="modal-hint">This usually takes 2–3 seconds...</div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      document.getElementById("pdf-modal-msg").textContent = msg;
      modal.classList.add("active");
    }
    modal.classList.add("active");
  }

  hideLoadingModal() {
    const modal = document.getElementById("pdf-loading-modal");
    if (modal) modal.classList.remove("active");
  }

  showFallbackDialog() {
    let dialog = document.getElementById("pdf-fallback-dialog");
    if (!dialog) {
      dialog = document.createElement("div");
      dialog.id = "pdf-fallback-dialog";
      dialog.className = "app-modal-overlay active";
      dialog.innerHTML = `
        <div class="app-modal-card">
          <div class="modal-icon-badge">🖨️</div>
          <h3>Save Resume as PDF</h3>
          <p>For the sharpest, 100% vector-crisp PDF with selectable text, click <strong>"Open Print Dialog"</strong> and select <strong>"Save as PDF"</strong> as your destination.</p>
          <div class="modal-actions">
            <button id="btn-run-print" class="btn btn-primary">Open Print Dialog (Save as PDF)</button>
            <button id="btn-close-dialog" class="btn btn-secondary">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);

      dialog.querySelector("#btn-run-print").addEventListener("click", () => {
        dialog.classList.remove("active");
        this.printPDF();
      });
      dialog.querySelector("#btn-close-dialog").addEventListener("click", () => {
        dialog.classList.remove("active");
      });
    } else {
      dialog.classList.add("active");
    }
  }

  showToast(message, type = "info") {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `app-toast toast-${type} show`;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }
}

window.pdfExporter = new PDFExporter();
