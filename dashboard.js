(() => {
  const config = window.OUTBOUND_DASHBOARD_CONFIG || {};
  const storageKey = "emc2ops-outbound-dashboard";
  const stages = {
    all: "All",
    research: "Research",
    contacted: "Contacted",
    replied: "Replied",
    audit_booked: "Audit booked",
    proposal: "Proposal",
    won: "Won",
    nurture: "Nurture"
  };
  const goals = [
    ["touches", "Targeted touches", 500, 800],
    ["calls", "Qualified calls", 10, 20],
    ["clients", "Paying clients", 1, 3],
    ["partners", "Partner conversations", 3, 5]
  ];
  const tasks = [
    ["booking-calendar", "Add the booking calendar", "Start today"],
    ["workflow-demo", "Record the missed-call workflow demo", "Start today"],
    ["first-50", "Build a list of 50 property management companies", "Start today"],
    ["first-20-emails", "Send 20 cold emails", "Start today"],
    ["first-5-calls", "Call 5 companies", "Start today"],
    ["two-looms", "Record 2 Loom audits", "Start today"],
    ["linkedin-breakdown", "Post the missed leasing call LinkedIn breakdown", "Start today"],
    ["week-1-launch", "Week 1: fix booking flow, build 100 prospects, send first 100-150 touches", "Weekly plan"],
    ["week-2-learn", "Week 2: refine replies, ICP, subject lines, Loom audits, and partners", "Weekly plan"],
    ["week-3-close", "Week 3: send proposals within 24 hours and publish a workflow breakdown", "Weekly plan"],
    ["week-4-compound", "Week 4: re-engage, ask for referrals, and turn delivery into proof", "Weekly plan"]
  ];
  const scripts = [
    ["Cold email", "Subject: missed leasing calls at {{company}}\n\nHi {{first_name}},\n\nI noticed {{company}} is actively leasing in {{market}}.\n\nQuick question: when a prospect calls after hours or while your team is busy, do missed callers get an immediate text-back and booking path?\n\nI build a 7-day missed-call recovery workflow for property managers: instant SMS reply, lead qualification, showing request routing, and CRM or team notification.\n\nOpen to a 15-minute audit this week?"],
    ["Follow-up", "Following up because missed leasing calls are usually a small workflow problem with a direct revenue impact.\n\nWould it be useful if I sent a 2-minute teardown of missed call -> text-back -> qualification -> showing request?"],
    ["Call opener", "Hi, quick question. Who owns leasing lead follow-up when a prospect call is missed after hours or while the team is busy?"]
  ];
  const state = { authMode: "signin", mode: "local", session: null, client: null, stage: "all", prospects: [], daily: [], checks: new Set() };
  const $ = (id) => document.getElementById(id);
  const hasCloud = Boolean(config.supabaseUrl && config.supabasePublishableKey && window.supabase);
  const today = () => new Date().toISOString().slice(0, 10);
  const value = (id) => Number($(id).value || 0);

  function escapeHtml(text = "") {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  function status(id, text, tone = "") {
    $(id).textContent = text;
    $(id).dataset.tone = tone;
  }

  function readLocal() {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    state.prospects = saved.prospects || [];
    state.daily = saved.daily || [];
    state.checks = new Set(saved.checks || []);
  }

  function writeLocal() {
    localStorage.setItem(storageKey, JSON.stringify({
      prospects: state.prospects,
      daily: state.daily,
      checks: [...state.checks]
    }));
  }

  function totals() {
    return state.daily.reduce((sum, row) => {
      sum.touches += row.cold_emails + row.followup_emails + row.linkedin_touches + row.phone_calls;
      sum.calls += row.calls_held;
      sum.clients += row.deals_closed;
      sum.partners += row.partner_conversations;
      sum.emails += row.cold_emails;
      sum.replies += row.positive_replies;
      sum.booked += row.calls_booked;
      sum.proposals += row.proposals_sent;
      return sum;
    }, { touches: 0, calls: 0, clients: 0, partners: 0, emails: 0, replies: 0, booked: 0, proposals: 0 });
  }

  function renderTargets(total) {
    $("target-strip").innerHTML = goals.map(([key, label, target, stretch]) => {
      const current = total[key];
      return `<article class="target-card"><small>${label}</small><strong>${current} / ${target}</strong><div class="progress"><span style="width:${Math.min(100, current / target * 100)}%"></span></div><small>Stretch: ${stretch}</small></article>`;
    }).join("");
  }

  function renderStats(total) {
    $("stat-grid").innerHTML = [
      ["Cold emails", total.emails, "Daily target: 30-40"],
      ["Positive replies", total.replies, "Measure relevance"],
      ["Calls booked", total.booked, "Audit pipeline"],
      ["Proposals", total.proposals, "Send same day"]
    ].map(([label, count, note]) => `<article class="stat-card"><small>${label}</small><strong>${count}</strong><div class="metric-row"><small>${note}</small><span class="tag">${state.mode}</span></div></article>`).join("");
  }

  function renderChecklist() {
    $("checklist").innerHTML = tasks.map(([slug, label, group]) => `<label class="check-row"><input type="checkbox" data-check="${slug}" ${state.checks.has(slug) ? "checked" : ""} /><span><strong>${label}</strong><small>${group}</small></span></label>`).join("");
  }

  function renderStages() {
    $("stage-tabs").innerHTML = Object.entries(stages).map(([key, label]) => `<button class="stage-tab ${state.stage === key ? "is-active" : ""}" data-stage="${key}" type="button">${label}</button>`).join("");
  }

  function renderProspects() {
    const rows = state.prospects
      .filter((prospect) => state.stage === "all" || prospect.stage === state.stage)
      .sort((a, b) => (a.next_follow_up || "9999").localeCompare(b.next_follow_up || "9999"))
      .map((prospect) => {
        const signal = prospect.pain_signal || prospect.software_clues || "Add a lead-response clue.";
        const followup = !prospect.next_follow_up ? "Not set" : prospect.next_follow_up < today() ? `Overdue: ${prospect.next_follow_up}` : prospect.next_follow_up;
        return `<tr><td><strong>${escapeHtml(prospect.company)}</strong><br /><small class="muted">${escapeHtml(prospect.market)}${prospect.contact_name ? ` | ${escapeHtml(prospect.contact_name)}` : ""}</small></td><td>${escapeHtml(signal)}</td><td><span class="tag">${escapeHtml(stages[prospect.stage] || prospect.stage)}</span></td><td>${escapeHtml(followup)}</td><td><div class="table-actions"><button class="button" data-edit="${prospect.id}" type="button" title="Edit prospect">Edit</button><button class="button" data-delete="${prospect.id}" type="button" title="Delete prospect">Delete</button></div></td></tr>`;
      }).join("");
    $("prospect-rows").innerHTML = rows || `<tr><td colspan="5" class="muted">No prospects in this stage yet.</td></tr>`;
  }

  function renderScripts() {
    $("script-grid").innerHTML = scripts.map(([title, body]) => `<article class="script"><h3>${title}</h3><pre>${escapeHtml(body)}</pre></article>`).join("");
  }

  function render() {
    const total = totals();
    renderTargets(total);
    renderStats(total);
    renderChecklist();
    renderStages();
    renderProspects();
    renderScripts();
    $("cloud-signout-button").classList.toggle("hidden", state.mode !== "cloud");
    $("local-mode-button").textContent = state.mode === "local" ? "Using local mode" : "Switch to local";
  }

  function dailyPayload() {
    return {
      progress_date: $("progress-date").value,
      accounts_contacted: value("accounts-contacted"),
      cold_emails: value("cold-emails"),
      followup_emails: value("followup-emails"),
      phone_calls: value("phone-calls"),
      linkedin_touches: value("linkedin-touches"),
      loom_audits: value("loom-audits"),
      partner_conversations: value("partner-conversations"),
      positive_replies: value("positive-replies"),
      calls_booked: value("calls-booked"),
      calls_held: value("calls-held"),
      proposals_sent: value("proposals-sent"),
      deals_closed: value("deals-closed"),
      notes: $("daily-notes").value.trim()
    };
  }

  function prospectPayload() {
    return {
      id: $("prospect-id").value || crypto.randomUUID(),
      company: $("company").value.trim(),
      market: $("market").value.trim(),
      contact_name: $("contact-name").value.trim(),
      email: $("prospect-email").value.trim(),
      phone: $("prospect-phone").value.trim(),
      website: $("website").value.trim(),
      stage: $("stage").value,
      next_follow_up: $("next-follow-up").value || null,
      software_clues: $("software-clues").value.trim(),
      pain_signal: $("pain-signal").value.trim(),
      notes: $("prospect-notes").value.trim()
    };
  }

  function resetProspect() {
    $("prospect-form").reset();
    $("prospect-id").value = "";
    $("stage").value = "research";
    $("cancel-edit").classList.add("hidden");
  }

  function fillProspect(prospect) {
    Object.entries({
      "prospect-id": prospect.id, company: prospect.company, market: prospect.market, "contact-name": prospect.contact_name,
      "prospect-email": prospect.email, "prospect-phone": prospect.phone, website: prospect.website, stage: prospect.stage,
      "next-follow-up": prospect.next_follow_up, "software-clues": prospect.software_clues, "pain-signal": prospect.pain_signal,
      "prospect-notes": prospect.notes
    }).forEach(([id, field]) => { $(id).value = field || ""; });
    $("cancel-edit").classList.remove("hidden");
  }

  async function loadCloud() {
    const results = await Promise.all([
      state.client.from("prospects").select("*").order("created_at", { ascending: false }),
      state.client.from("daily_progress").select("*").order("progress_date", { ascending: false }),
      state.client.from("task_checkoffs").select("task_slug")
    ]);
    const error = results.find((result) => result.error)?.error;
    if (error) throw error;
    state.prospects = results[0].data || [];
    state.daily = results[1].data || [];
    state.checks = new Set((results[2].data || []).map((row) => row.task_slug));
  }

  async function useCloud(session) {
    state.session = session;
    state.mode = "cloud";
    await loadCloud();
    $("auth-summary").textContent = `Signed in as ${session.user.email}.`;
    status("auth-status", "Cloud data loaded.", "success");
    render();
  }

  async function saveDaily(event) {
    event.preventDefault();
    const payload = dailyPayload();
    if (state.mode === "cloud") {
      const result = await state.client.from("daily_progress").upsert(payload, { onConflict: "user_id,progress_date" }).select().single();
      if (result.error) return status("daily-status", result.error.message, "error");
      state.daily = [result.data, ...state.daily.filter((row) => row.progress_date !== result.data.progress_date)];
    } else {
      const current = state.daily.find((row) => row.progress_date === payload.progress_date);
      state.daily = [{ ...current, ...payload, id: current?.id || crypto.randomUUID() }, ...state.daily.filter((row) => row.progress_date !== payload.progress_date)];
      writeLocal();
    }
    status("daily-status", "Daily log saved.", "success");
    render();
  }

  async function saveProspect(event) {
    event.preventDefault();
    const payload = prospectPayload();
    if (state.mode === "cloud") {
      const result = await state.client.from("prospects").upsert(payload).select().single();
      if (result.error) return status("prospect-status", result.error.message, "error");
      state.prospects = [result.data, ...state.prospects.filter((row) => row.id !== result.data.id)];
    } else {
      const current = state.prospects.find((row) => row.id === payload.id);
      state.prospects = [{ ...current, ...payload }, ...state.prospects.filter((row) => row.id !== payload.id)];
      writeLocal();
    }
    resetProspect();
    status("prospect-status", "Prospect saved.", "success");
    render();
  }

  async function deleteProspect(id) {
    if (state.mode === "cloud") {
      const result = await state.client.from("prospects").delete().eq("id", id);
      if (result.error) return status("prospect-status", result.error.message, "error");
    }
    state.prospects = state.prospects.filter((prospect) => prospect.id !== id);
    if (state.mode === "local") writeLocal();
    render();
  }

  async function saveCheck(slug, checked) {
    if (checked) state.checks.add(slug);
    else state.checks.delete(slug);
    if (state.mode === "cloud") {
      const query = checked ? state.client.from("task_checkoffs").upsert({ task_slug: slug }, { onConflict: "user_id,task_slug" }) : state.client.from("task_checkoffs").delete().eq("task_slug", slug);
      const result = await query;
      if (result.error) status("daily-status", result.error.message, "error");
    } else {
      writeLocal();
    }
    renderChecklist();
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    $("signin-tab").classList.toggle("is-active", mode === "signin");
    $("signup-tab").classList.toggle("is-active", mode === "signup");
    $("auth-submit").textContent = mode === "signin" ? "Sign in" : "Create account";
    $("auth-password").autocomplete = mode === "signin" ? "current-password" : "new-password";
    status("auth-status", "");
  }

  async function authenticate(event) {
    event.preventDefault();
    if (!hasCloud) return status("auth-status", "Cloud config is not available yet.", "error");
    const credentials = { email: $("auth-email").value, password: $("auth-password").value };
    const method = state.authMode === "signup" ? "signUp" : "signInWithPassword";
    const result = await state.client.auth[method](credentials);
    if (result.error) return status("auth-status", result.error.message, "error");
    if (!result.data.session) return status("auth-status", "Account created. Confirm the email, then sign in here.", "success");
    useCloud(result.data.session);
  }

  async function initCloud() {
    if (!hasCloud) return $("config-notice").classList.remove("hidden");
    state.client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
    const { data } = await state.client.auth.getSession();
    if (data.session) useCloud(data.session).catch((error) => status("auth-status", error.message, "error"));
  }

  function bind() {
    $("progress-date").value = today();
    $("daily-form").addEventListener("submit", saveDaily);
    $("prospect-form").addEventListener("submit", saveProspect);
    $("auth-form").addEventListener("submit", authenticate);
    $("signin-tab").addEventListener("click", () => setAuthMode("signin"));
    $("signup-tab").addEventListener("click", () => setAuthMode("signup"));
    $("cancel-edit").addEventListener("click", resetProspect);
    $("local-mode-button").addEventListener("click", () => { state.mode = "local"; readLocal(); $("auth-summary").textContent = "Local mode keeps progress in this browser until you sign in."; render(); });
    $("cloud-signout-button").addEventListener("click", async () => { await state.client.auth.signOut(); state.mode = "local"; readLocal(); $("auth-summary").textContent = "Signed out. Local mode is active."; render(); });
    $("checklist").addEventListener("change", (event) => { if (event.target.matches("[data-check]")) saveCheck(event.target.dataset.check, event.target.checked); });
    $("stage-tabs").addEventListener("click", (event) => { if (event.target.matches("[data-stage]")) { state.stage = event.target.dataset.stage; renderStages(); renderProspects(); } });
    $("prospect-rows").addEventListener("click", (event) => {
      if (event.target.dataset.edit) fillProspect(state.prospects.find((prospect) => prospect.id === event.target.dataset.edit));
      if (event.target.dataset.delete) deleteProspect(event.target.dataset.delete);
    });
  }

  bind();
  readLocal();
  render();
  initCloud();
})();
