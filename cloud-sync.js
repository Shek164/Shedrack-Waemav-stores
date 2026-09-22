/* =========================================================
   SHEDRACK WAEMA STORES - CLOUD DATA + AUTHENTICATION
   Supabase browser client. Safe to publish the anon key when
   Row Level Security (RLS) is enabled using the supplied SQL.
========================================================= */
(function () {
  "use strict";

  const keys = {
    products: "bizmanager_products",
    sales: "bizmanager_sales",
    customers: "bizmanager_customers",
    invoices: "bizmanager_invoices",
    settings: "bizmanager_settings"
  };

  const configured = () => {
    const c = window.SHEDRACK_CONFIG || {};
    return c.supabaseUrl && c.supabaseAnonKey &&
      !c.supabaseUrl.includes("YOUR_") && !c.supabaseAnonKey.includes("YOUR_");
  };

  let client = null;
  let suppress = false;
  let saveTimer = null;

  const status = (text, type = "offline") => {
    const el = document.getElementById("cloudStatus");
    if (!el) return;
    el.textContent = text;
    el.className = `cloud-status ${type}`;
  };

  const authModal = () => document.getElementById("authModal");
  const closeAuth = () => authModal()?.classList.remove("show");
  const openAuth = () => authModal()?.classList.add("show");

  function notify(title, message, icon = "✓") {
    if (typeof window.showToast === "function") window.showToast(title, message, icon);
  }

  function readPayload() {
    const get = (key, fallback) => {
      try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
      catch { return fallback; }
    };
    return {
      products: get(keys.products, []),
      customers: get(keys.customers, []),
      sales: get(keys.sales, []),
      invoices: get(keys.invoices, []),
      settings: get(keys.settings, {})
    };
  }

  async function saveCloud() {
    if (!client || suppress) return;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const payload = readPayload();
    const { error } = await client.from("store_data").upsert({
      user_id: user.id,
      products: payload.products,
      customers: payload.customers,
      sales: payload.sales,
      invoices: payload.invoices,
      settings: payload.settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (error) {
      console.error("Cloud save failed:", error);
      status("Sync error", "error");
      return;
    }
    status("Cloud synced", "online");
  }

  function queueSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCloud, 450);
  }

  function patchStorage() {
    const originalSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      originalSet(key, value);
      if (!suppress && Object.values(keys).includes(key)) queueSave();
    };
  }

  async function hydrateFromCloud() {
    if (!client) return;
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      status("Sign in to sync", "offline");
      openAuth();
      return;
    }

    document.querySelectorAll("[data-user-email]").forEach(el => el.textContent = user.email || "");
    const { data, error } = await client.from("store_data").select("*").eq("user_id", user.id).maybeSingle();
    if (error) {
      console.error(error);
      status("Cloud unavailable", "error");
      return;
    }

    if (data) {
      suppress = true;
      try {
        if (data.products) localStorage.setItem(keys.products, JSON.stringify(data.products));
        if (data.customers) localStorage.setItem(keys.customers, JSON.stringify(data.customers));
        if (data.sales) localStorage.setItem(keys.sales, JSON.stringify(data.sales));
        if (data.invoices) localStorage.setItem(keys.invoices, JSON.stringify(data.invoices));
        if (data.settings) localStorage.setItem(keys.settings, JSON.stringify(data.settings));
      } finally { suppress = false; }
      setTimeout(() => {
        ["renderProducts","renderSales","renderCustomers","renderInvoices","loadBusinessSettings","updateDashboard","updatePremiumAnalytics"]
          .forEach(name => { if (typeof window[name] === "function") { try { window[name](); } catch (e) { console.warn(name, e); } } });
      }, 0);
    } else {
      await saveCloud();
    }
    status("Cloud synced", "online");
    closeAuth();
  }

  async function signIn(email, password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await hydrateFromCloud();
    notify("Welcome back", "Your store data is connected to the cloud.");
  }

  async function signUp(email, password) {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    if (data.session) await hydrateFromCloud();
    else notify("Account created", "Check your email if confirmation is required, then sign in.");
  }

  async function signOut() {
    await client.auth.signOut();
    status("Signed out", "offline");
    openAuth();
  }

  async function init() {
    patchStorage();
    if (!configured()) {
      status("Cloud setup required", "warning");
      return;
    }
    if (!window.supabase?.createClient) {
      status("Cloud library failed", "error");
      return;
    }
    client = window.supabase.createClient(
      window.SHEDRACK_CONFIG.supabaseUrl,
      window.SHEDRACK_CONFIG.supabaseAnonKey
    );

    document.getElementById("cloudAuthForm")?.addEventListener("submit", async e => {
      e.preventDefault();
      const email = document.getElementById("authEmail").value.trim();
      const password = document.getElementById("authPassword").value;
      const mode = document.getElementById("authMode").value;
      const button = e.submitter || document.querySelector("#cloudAuthForm button[type=submit]");
      try {
        if (button) button.disabled = true;
        if (mode === "signup") await signUp(email, password); else await signIn(email, password);
      } catch (err) {
        notify("Authentication failed", err.message || "Please check your details.", "!");
      } finally { if (button) button.disabled = false; }
    });

    document.getElementById("authSwitch")?.addEventListener("click", () => {
      const mode = document.getElementById("authMode");
      const title = document.getElementById("authTitle");
      const submit = document.getElementById("authSubmit");
      const switcher = document.getElementById("authSwitch");
      const signup = mode.value !== "signup";
      mode.value = signup ? "signup" : "signin";
      title.textContent = signup ? "Create your store account" : "Sign in to your store";
      submit.textContent = signup ? "Create Account" : "Sign In";
      switcher.textContent = signup ? "Already have an account? Sign in" : "New here? Create an account";
    });

    document.getElementById("signOutBtn")?.addEventListener("click", signOut);

    client.auth.onAuthStateChange((_event) => {
      setTimeout(hydrateFromCloud, 0);
    });
    await hydrateFromCloud();
  }

  window.ShedrackCloud = { init, save: saveCloud, signOut };
  window.addEventListener("load", init);
})();
