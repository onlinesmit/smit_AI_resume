/**
 * Supabase Integration Service for Smit_AI_resume_builder
 */

class SupabaseService {
  constructor() {
    this.client = null;
    this.user = null;
    this.currentResumeId = localStorage.getItem("sb_active_resume_id") || null;
    this.authListeners = [];

    this.init();
  }

  getCredentials() {
    // 1. Check window.SUPABASE_CONFIG from config.js
    const config = window.SUPABASE_CONFIG || {};
    let url = (config.url || "").trim();
    let anonKey = (config.anonKey || "").trim();

    // 2. Override with localStorage if saved by user in the UI
    const savedUrl = localStorage.getItem("sb_url");
    const savedKey = localStorage.getItem("sb_key");

    if (savedUrl && savedKey) {
      url = savedUrl.trim();
      anonKey = savedKey.trim();
    }

    return { url, anonKey };
  }

  init() {
    const { url, anonKey } = this.getCredentials();

    if (url && anonKey && window.supabase && typeof window.supabase.createClient === "function") {
      try {
        this.client = window.supabase.createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });

        // Listen for auth state changes
        this.client.auth.onAuthStateChange((event, session) => {
          this.user = session ? session.user : null;
          this.notifyAuthListeners(event, session);
        });

        // Check current session
        this.client.auth.getSession().then(({ data }) => {
          this.user = data && data.session ? data.session.user : null;
          this.notifyAuthListeners("INITIAL_SESSION", data ? data.session : null);
        });
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
      }
    }
  }

  isConnected() {
    return !!this.client;
  }

  isAuthenticated() {
    return !!this.user;
  }

  getUserEmail() {
    return this.user ? this.user.email : null;
  }

  onAuthStateChange(callback) {
    this.authListeners.push(callback);
  }

  notifyAuthListeners(event, session) {
    this.authListeners.forEach(cb => {
      try {
        cb(event, session, this.user);
      } catch (e) {
        console.error("Auth listener error:", e);
      }
    });
  }

  async setCredentials(url, anonKey) {
    const cleanUrl = (url || "").trim();
    const cleanKey = (anonKey || "").trim();

    if (!cleanUrl || !cleanKey) {
      throw new Error("Both Supabase URL and Anon Key are required.");
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      throw new Error("Supabase URL must start with https://");
    }

    // Test connection with lightweight query
    if (!window.supabase) {
      throw new Error("Supabase JS library not loaded. Please ensure an active internet connection.");
    }

    const testClient = window.supabase.createClient(cleanUrl, cleanKey);
    // Simple test ping: fetch auth settings or public data
    const { error } = await testClient.auth.getSession();
    if (error) {
      throw new Error("Connection test failed: " + error.message);
    }

    // Persist credentials
    localStorage.setItem("sb_url", cleanUrl);
    localStorage.setItem("sb_key", cleanKey);

    // Re-initialize service
    this.init();
    return true;
  }

  clearCredentials() {
    localStorage.removeItem("sb_url");
    localStorage.removeItem("sb_key");
    localStorage.removeItem("sb_active_resume_id");
    this.client = null;
    this.user = null;
    this.currentResumeId = null;
    this.notifyAuthListeners("DISCONNECTED", null);
  }

  // --- Authentication ---

  async signUp(email, password) {
    if (!this.client) throw new Error("Supabase is not connected.");
    const { data, error } = await this.client.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signIn(email, password) {
    if (!this.client) throw new Error("Supabase is not connected.");
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    this.user = data.user;
    return data;
  }

  async signOut() {
    if (!this.client) return;
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
    this.user = null;
    this.currentResumeId = null;
    localStorage.removeItem("sb_active_resume_id");
  }

  // --- Resume Cloud Operations ---

  async saveResume({ title, data, template, accentColor, isPublic = false, resumeId = null }) {
    if (!this.client) throw new Error("Supabase is not connected.");
    if (!this.user) throw new Error("Please log in or sign up to save your resume to the cloud.");

    const idToSave = resumeId || this.currentResumeId;

    const payload = {
      user_id: this.user.id,
      title: title || (data.personal && data.personal.fullName ? `${data.personal.fullName}'s Resume` : "My Resume"),
      template: template || "plain",
      accent_color: accentColor || "#2563eb",
      data: data,
      is_public: isPublic
    };

    if (idToSave) {
      // Update existing
      const { data: updated, error } = await this.client
        .from("resumes")
        .update(payload)
        .eq("id", idToSave)
        .select()
        .single();

      if (error) throw error;
      this.currentResumeId = updated.id;
      localStorage.setItem("sb_active_resume_id", updated.id);
      return updated;
    } else {
      // Insert new
      const { data: inserted, error } = await this.client
        .from("resumes")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      this.currentResumeId = inserted.id;
      localStorage.setItem("sb_active_resume_id", inserted.id);
      return inserted;
    }
  }

  async listResumes() {
    if (!this.client || !this.user) return [];

    const { data, error } = await this.client
      .from("resumes")
      .select("id, title, template, accent_color, is_public, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async loadResume(id) {
    if (!this.client) throw new Error("Supabase is not connected.");

    const { data, error } = await this.client
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    this.currentResumeId = data.id;
    localStorage.setItem("sb_active_resume_id", data.id);
    return data;
  }

  async deleteResume(id) {
    if (!this.client) throw new Error("Supabase is not connected.");

    const { error } = await this.client
      .from("resumes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    if (this.currentResumeId === id) {
      this.currentResumeId = null;
      localStorage.removeItem("sb_active_resume_id");
    }
    return true;
  }

  unlinkActiveResume() {
    this.currentResumeId = null;
    localStorage.removeItem("sb_active_resume_id");
  }
}

window.supabaseService = new SupabaseService();
