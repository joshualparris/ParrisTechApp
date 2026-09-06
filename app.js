// ParrisTechApp core (vanilla JS, offline, no deps)
const STORAGE_KEY = "parristechapp_state_v1";
const LEGACY_STORAGE_KEY = "parristechapp-state";
const DEFAULT_CLIENTS = ["Guest", "Alex Example", "Sam Remote"];

// Embedded rules to avoid fetch issues (file:// CORS). Custom modules merge onto this list.
const EMBEDDED_RULES = [
  {
    "id": "windows-health",
    "title": "Windows: Updates & Health",
    "devices": ["windows"],
    "goals": [],
    "timebox": "10-15 mins",
    "riskNote": "May require a restart; confirm timing with the client.",
    "quickQuestions": [
      "Any recent update failures or blue screens?",
      "Does the device stay plugged in during updates?"
    ],
    "steps": [
      "Open Settings → Windows Update; install pending updates or pause if mid-visit risk.",
      "Check Windows Security quick scan status; run if older than 7 days.",
      "Review Device Manager for obvious driver warnings."
    ]
  },
  {
    "id": "windows-performance",
    "title": "Windows: Startup & Performance",
    "devices": ["windows"],
    "goals": ["runs-faster", "mystery-issues"],
    "timebox": "8-12 mins",
    "riskNote": "Disabling startup apps can change client expectations.",
    "quickQuestions": [
      "Which apps feel slow to open?",
      "Any software they must keep at startup?"
    ],
    "steps": [
      "Task Manager → Startup apps: disable unneeded items; keep security/backup tools.",
      "Check power plan set to Balanced (or Better Performance when plugged in).",
      "Run Disk Cleanup (temp files, recycle bin)."
    ]
  },
  {
    "id": "windows-storage",
    "title": "Windows: Storage Cleanup",
    "devices": ["windows"],
    "goals": ["more-space", "backup"],
    "timebox": "10-15 mins",
    "riskNote": "Confirm before deleting downloads or uninstalling apps.",
    "quickQuestions": [
      "Where do they store big files (Desktop/Downloads)?",
      "Any apps they never use?"
    ],
    "steps": [
      "Settings → System → Storage: run Storage Sense/cleanup recommendations.",
      "Check installed apps by size; uninstall obvious bloat with consent.",
      "Inspect OneDrive sync status if enabled to avoid duplicate storage hits."
    ]
  },
  {
    "id": "windows-browser",
    "title": "Windows: Browser Cleanup",
    "devices": ["windows"],
    "goals": ["security-check", "runs-faster", "mystery-issues"],
    "timebox": "8-10 mins",
    "riskNote": "Removing extensions or changing homepage needs consent.",
    "quickQuestions": [
      "Which browser do they live in?",
      "Any pop-ups or redirect complaints?"
    ],
    "steps": [
      "Check default browser; confirm they agree.",
      "Review extensions; remove adware/toolbars.",
      "Clear cache only if performance is suffering."
    ]
  },
  {
    "id": "windows-security",
    "title": "Windows: Malware & Backups",
    "devices": ["windows"],
    "goals": ["security-check", "backup", "business-client"],
    "timebox": "10-12 mins",
    "riskNote": "Scans or backup changes can slow the machine temporarily.",
    "quickQuestions": [
      "Any antivirus other than Defender?",
      "Do they have an external drive for backups?"
    ],
    "steps": [
      "Confirm Microsoft Defender real-time protection on; run quick scan.",
      "Check Backup/History or OneDrive for Documents/Pictures sync.",
      "Verify disk free space >15% to keep backups and updates healthy."
    ]
  },
  {
    "id": "mac-updates",
    "title": "macOS: Updates & Health",
    "devices": ["mac"],
    "goals": [],
    "timebox": "8-12 mins",
    "riskNote": "OS updates may require restart; check client timing.",
    "quickQuestions": [
      "Any recent crash or beachballing?",
      "Is FileVault already on?"
    ],
    "steps": [
      "System Settings → General → Software Update; install if safe.",
      "Verify FileVault and firewall status.",
      "Run Disk Utility first aid if recent crashes."
    ]
  },
  {
    "id": "mac-startup",
    "title": "macOS: Login & Performance",
    "devices": ["mac"],
    "goals": ["runs-faster", "mystery-issues"],
    "timebox": "8-10 mins",
    "riskNote": "Disabling login items can change expected launches.",
    "quickQuestions": [
      "Which apps must open automatically?",
      "Any menu bar clutter bothering them?"
    ],
    "steps": [
      "System Settings → Login Items & Allow in Background: remove nonessential.",
      "Activity Monitor: check CPU/memory hogs; note runaway processes.",
      "Empty Trash and clear Downloads if approved."
    ]
  },
  {
    "id": "mac-storage",
    "title": "macOS: Storage & Browser Hygiene",
    "devices": ["mac"],
    "goals": ["more-space", "security-check", "runs-faster"],
    "timebox": "10-15 mins",
    "riskNote": "Deleting files/extensions requires consent.",
    "quickQuestions": [
      "Using iCloud Drive/Desktop & Documents?",
      "Primary browser of choice?"
    ],
    "steps": [
      "About This Mac → Storage: manage large files and recommendations.",
      "Review Safari/Chrome/Firefox extensions; remove adware.",
      "Confirm iCloud Photos optimization status if space is tight."
    ]
  },
  {
    "id": "mac-backup",
    "title": "macOS: Backup & Security",
    "devices": ["mac"],
    "goals": ["backup", "security-check", "business-client"],
    "timebox": "8-12 mins",
    "riskNote": "Mounting new drives or changing iCloud may prompt logins.",
    "quickQuestions": [
      "Any Time Machine drive available?",
      "Do they pay for extra iCloud storage?"
    ],
    "steps": [
      "Check Time Machine recency; start backup if drive present.",
      "Verify iCloud backup of Photos/Documents where applicable.",
      "Review Security & Privacy: admin password known, unlock prompt timing."
    ]
  },
  {
    "id": "ios-storage",
    "title": "iPhone/iPad: Storage & Health",
    "devices": ["iphone"],
    "goals": ["more-space", "photos", "runs-faster"],
    "timebox": "6-10 mins",
    "riskNote": "Deleting apps/photos needs clear consent.",
    "quickQuestions": [
      "iCloud Photos on? Optimize storage enabled?",
      "Any apps safe to offload?"
    ],
    "steps": [
      "Settings → General → iPhone Storage: identify large/offloadable apps.",
      "Enable Optimize iPhone Storage for Photos if agreed.",
      "Confirm iCloud Backup recently succeeded."
    ]
  },
  {
    "id": "ios-safety",
    "title": "iPhone/iPad: Updates & Safety",
    "devices": ["iphone"],
    "goals": ["security-check", "teach-basics", "mystery-issues"],
    "timebox": "6-8 mins",
    "riskNote": "Permission changes alter app behavior; confirm first.",
    "quickQuestions": [
      "Any spam calls/texts recently?",
      "Comfortable with Face ID/Touch ID?"
    ],
    "steps": [
      "Check for iOS/iPadOS updates; install if time allows.",
      "Privacy → Tracking/Location: disable extras; review microphone/camera.",
      "Enable Silence Unknown Callers / spam filtering if requested."
    ]
  },
  {
    "id": "android-storage",
    "title": "Android: Storage & Cleanup",
    "devices": ["android"],
    "goals": ["more-space", "photos", "runs-faster"],
    "timebox": "6-10 mins",
    "riskNote": "Cleaning caches may log out users; warn first.",
    "quickQuestions": [
      "Is Google Photos backing up?",
      "Any apps safe to uninstall?"
    ],
    "steps": [
      "Settings → Storage: clear obvious cache hogs; remove unused apps.",
      "Confirm Google Photos backup status and upload quality.",
      "Check Downloads folder for large files to archive/delete."
    ]
  },
  {
    "id": "android-security",
    "title": "Android: Updates & Safety",
    "devices": ["android"],
    "goals": ["security-check", "teach-basics", "mystery-issues"],
    "timebox": "6-8 mins",
    "riskNote": "Permission changes alter notifications and access.",
    "quickQuestions": [
      "Any sideloaded apps?",
      "Using screen lock and fingerprint?"
    ],
    "steps": [
      "Check system and Play Store updates; enable auto-updates.",
      "Review app permissions; revoke unnecessary location/camera/mic.",
      "Confirm Play Protect on and scanning regularly."
    ]
  },
  {
    "id": "wifi-basics",
    "title": "Wi-Fi / Router Basics",
    "devices": ["router"],
    "goals": ["wifi", "runs-faster", "mystery-issues"],
    "timebox": "8-12 mins",
    "riskNote": "Reboots interrupt service; confirm OK before power cycling.",
    "quickQuestions": [
      "Where is the router located?",
      "Do they know the admin/password?",
      "Any IoT devices that might drop offline?"
    ],
    "steps": [
      "Check placement/obstructions; suggest moving away from metal walls.",
      "Power cycle modem then router in order; note lights behavior.",
      "Confirm strong Wi-Fi password; suggest guest network and WPA3 if available.",
      "Run/record quick speed note near main work area.",
      "Walk main rooms with a quick signal note (2.4/5GHz), recommend mesh if weak."
    ]
  },
  {
    "id": "education-files",
    "title": "Education: Files & Cloud",
    "devices": [],
    "goals": ["teach-basics", "backup", "photos"],
    "timebox": "5-8 mins",
    "riskNote": "Avoid moving files mid-session; keep examples only.",
    "quickQuestions": [
      "Where do they save most work?",
      "Do they already use cloud storage?"
    ],
    "steps": [
      "Show difference between local files and cloud sync folders.",
      "Demonstrate safe Desktop/Downloads cleanup and folder basics.",
      "Confirm at least one backup path: cloud or external drive."
    ]
  },
  {
    "id": "education-security",
    "title": "Education: Passwords & 2FA",
    "devices": [],
    "goals": ["security-check", "teach-basics"],
    "timebox": "4-6 mins",
    "riskNote": "Never store passwords in notes; encourage manager adoption.",
    "quickQuestions": [
      "Do they already use a password manager?",
      "Have they turned on 2FA for email/banking?"
    ],
    "steps": [
      "Recommend a password manager and unique passwords per site.",
      "Walk through enabling 2FA on primary email if time allows.",
      "Show how to recognize MFA prompts vs phishing."
    ]
  },
  {
    "id": "education-scams",
    "title": "Education: Scam Avoidance",
    "devices": [],
    "goals": ["security-check", "mystery-issues"],
    "timebox": "4-6 mins",
    "riskNote": "Do not reset passwords without client approval.",
    "quickQuestions": [
      "Any recent suspicious emails/calls?",
      "Do they know how to report spam?"
    ],
    "steps": [
      "Review examples of phishing patterns and unsafe attachments.",
      "Enable/report spam filtering in email provider.",
      "Set expectation: never share codes or approve unknown login prompts."
    ]
  },
  {
    "id": "new-device-setup",
    "title": "New Device Setup",
    "devices": [],
    "goals": ["new-device-setup"],
    "timebox": "8-12 mins",
    "riskNote": "Account sign-ins may trigger security alerts.",
    "quickQuestions": [
      "Primary accounts to sign in (email, cloud, app stores)?",
      "Any data to migrate today?"
    ],
    "steps": [
      "Sign into primary accounts and ensure sync/backup enabled.",
      "Apply OS updates and verify device encryption/lock enabled.",
      "Install must-have apps and set default browser/email."
    ]
  },
  {
    "id": "windows-printing",
    "title": "Windows: Printing Basics",
    "devices": ["windows"],
    "goals": ["printing"],
    "timebox": "6-10 mins",
    "riskNote": "Driver changes may require admin rights/restarts.",
    "quickQuestions": [
      "USB or Wi-Fi printer? Model handy?",
      "Any specific apps that fail to print?"
    ],
    "steps": [
      "Settings → Bluetooth & devices → Printers: ensure correct default, remove stale queues.",
      "Run built-in troubleshooter; reinstall driver/queue if corrupted.",
      "Test print; confirm on same Wi-Fi band if wireless."
    ]
  },
  {
    "id": "mac-printing",
    "title": "macOS: Printing Basics",
    "devices": ["mac"],
    "goals": ["printing"],
    "timebox": "6-10 mins",
    "riskNote": "Removing printers deletes queues; warn before reset.",
    "quickQuestions": [
      "USB or Wi-Fi printer? Model handy?",
      "Any app-specific issues?"
    ],
    "steps": [
      "System Settings → Printers & Scanners: delete/re-add printer; set default.",
      "Reset printing system if drivers jam; reinstall manufacturer driver if needed.",
      "Test print; confirm printer on same network; note IP for future reconnects."
    ]
  },
  {
    "id": "data-migration",
    "title": "Data Migration",
    "devices": [],
    "goals": ["data-migration"],
    "timebox": "10-15 mins",
    "riskNote": "Moves risk duplicates/deletes; confirm source/destination and backups.",
    "quickQuestions": [
      "What data moves today (docs/photos/email)?",
      "Is a backup taken already?"
    ],
    "steps": [
      "Confirm backup exists (cloud or external) before moving.",
      "Identify source/target accounts/devices; test small sample copy first.",
      "Outline post-move checks: app logins, default save locations, cleanup plan."
    ]
  },
  {
    "id": "business-baseline",
    "title": "Business Baseline Security",
    "devices": [],
    "goals": ["business-client", "security-check", "backup"],
    "timebox": "8-12 mins",
    "riskNote": "May require account owner approval for changes.",
    "quickQuestions": [
      "Who approves security changes today?",
      "Do they use shared credentials anywhere?"
    ],
    "steps": [
      "Verify OS updates and antivirus active on all in-scope devices.",
      "Ensure backups are running (cloud or external) and test a recent restore spot.",
      "Recommend password manager/SSO and enable 2FA on primary email/admin accounts."
    ]
  },
  {
    "id": "email-help",
    "title": "Email Help",
    "devices": [],
    "goals": ["email-help"],
    "timebox": "6-8 mins",
    "riskNote": "Credential changes can lock out other devices; confirm before edits.",
    "quickQuestions": [
      "Which email provider and apps are in use?",
      "Any sync or spam complaints?"
    ],
    "steps": [
      "Verify inbox sync on primary device; check storage/quota if applicable.",
      "Set sender name/signature and spam rules; clear obvious filters.",
      "Show how to report spam/phishing in their client."
    ]
  },
  {
    "id": "printing-check",
    "title": "Printing Check",
    "devices": [],
    "goals": ["printing"],
    "timebox": "5-8 mins",
    "riskNote": "Driver installs may require admin rights/restarts.",
    "quickQuestions": [
      "USB or Wi-Fi printer? Model handy?",
      "Any specific apps that fail to print?"
    ],
    "steps": [
      "Confirm printer is online and default; run test page.",
      "Check driver/firmware updates; reinstall queue if corrupt.",
      "Ensure same network as printer; document how to reconnect."
    ]
  }
];

const devices = [
  { id: "windows", label: "Windows laptop/desktop" },
  { id: "mac", label: "MacBook/iMac" },
  { id: "iphone", label: "iPhone / iPad" },
  { id: "android", label: "Android phone / tablet" },
  { id: "router", label: "Router / Wi-Fi" }
];

const goals = [
  { id: "runs-faster", label: "Runs faster" },
  { id: "more-space", label: "More space" },
  { id: "security-check", label: "Security check" },
  { id: "backup", label: "Backup" },
  { id: "email-help", label: "Email help" },
  { id: "photos", label: "Photos" },
  { id: "printing", label: "Printing" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "teach-basics", label: "Teach me basics" },
  { id: "new-device-setup", label: "New device setup" },
  { id: "mystery-issues", label: "Mystery issues" },
  { id: "data-migration", label: "Data migration" },
  { id: "business-client", label: "Business client" }
];

const THEMES = {
  dark: {
    "--bg": "linear-gradient(135deg, #0b1224 0%, #0d1f42 50%, #122c50 100%)",
    "--panel": "#0f172a",
    "--panel-border": "#1e293b",
    "--accent": "#5fe1c4",
    "--accent-2": "#9bc7ff",
    "--text": "#e8edf7",
    "--muted": "#9aa7c2",
    "--danger": "#ff8b6a",
    "--shadow": "0 20px 60px rgba(0, 0, 0, 0.35)",
    "--glow": "0 0 0 3px rgba(95, 225, 196, 0.15)"
  },
  light: {
    "--bg": "linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)",
    "--panel": "#ffffff",
    "--panel-border": "#d9e0ec",
    "--accent": "#2e73ff",
    "--accent-2": "#5c8eff",
    "--text": "#0f172a",
    "--muted": "#6b7280",
    "--danger": "#d94646",
    "--shadow": "0 10px 40px rgba(15, 23, 42, 0.12)",
    "--glow": "0 0 0 3px rgba(46, 115, 255, 0.15)"
  },
  green: {
    "--bg": "linear-gradient(135deg, #0f3b2e 0%, #0c5c3e 100%)",
    "--panel": "#0d2a21",
    "--panel-border": "#16523f",
    "--accent": "#4ade80",
    "--accent-2": "#86efac",
    "--text": "#e8f5ef",
    "--muted": "#9dcfb8",
    "--danger": "#ffb4a4",
    "--shadow": "0 18px 50px rgba(0, 0, 0, 0.35)",
    "--glow": "0 0 0 3px rgba(74, 222, 128, 0.18)"
  },
  blue: {
    "--bg": "linear-gradient(135deg, #0b1224 0%, #102c5c 60%, #0b5fa0 100%)",
    "--panel": "#0f1f3a",
    "--panel-border": "#1d3a62",
    "--accent": "#55c2ff",
    "--accent-2": "#9bd2ff",
    "--text": "#e8f3ff",
    "--muted": "#9bb7dd",
    "--danger": "#ff9b8a",
    "--shadow": "0 18px 50px rgba(3, 18, 43, 0.4)",
    "--glow": "0 0 0 3px rgba(85, 194, 255, 0.2)"
  }
};

let rules = [];
let rulesLoaded = false;
let rulesPromise = null;

let state = {
  clients: [...DEFAULT_CLIENTS],
  sessions: [],
  settings: {
    lastSessionLength: 120,
    clientProfiles: {},
    customModules: [],
    theme: "dark",
    hiddenModules: []
  },
  activeSessionId: null,
  pendingStartTime: null
};

let uiState = {
  hideCompleted: false,
  searchTerm: "",
  isOverrun: false,
  collapseCompleted: false,
  undoStack: [],
  activeItemId: null
};
let timerInterval = null;
let activeItemTimers = {};

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  ensureDefaults();
  renderClientOptions();
  renderClientList();
  renderDeviceGoalOptions();
  attachEvents();
  applyDefaultSessionLength();
  updateClientContext();
  ensureRulesReady();
  restoreActiveSession();
  renderTemplates();
  renderHistory();
  renderCustomRules();
  populateSettingsUI();
  applyTheme(state.settings.theme || "dark");
  renderInvoiceHistory();
});

function embedRules() {
  if (!Array.isArray(EMBEDDED_RULES) || !EMBEDDED_RULES.length) return [];
  return JSON.parse(JSON.stringify(EMBEDDED_RULES));
}

function fetchRules() {
  if (rulesPromise) return rulesPromise;
  rulesPromise = fetch("rules.json")
    .then((res) => {
      if (!res.ok) throw new Error("rules.json fetch failed");
      return res.json();
    })
    .then((data) => {
      const base = data.modules || embedRules();
      const custom = state.settings.customModules || [];
      rules = [...base, ...custom];
      rulesLoaded = true;
      return rules;
    })
    .catch((err) => {
      console.error("Failed to load rules", err);
      const fallback = [...embedRules(), ...(state.settings.customModules || [])];
      rules = fallback;
      rulesLoaded = true;
      return rules;
    });
  return rulesPromise;
}

async function ensureRulesReady() {
  if (rulesLoaded && rules.length) return true;
  rules = [...embedRules(), ...(state.settings.customModules || [])];
  rulesLoaded = true;
  try {
    await fetchRules();
  } catch (e) {
    // already handled
  }
  if (!rules.length) {
    rules = [...embedRules(), ...(state.settings.customModules || [])];
    rulesLoaded = true;
  }
  return rules.length > 0;
}

function loadState() {
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.clients = Array.isArray(parsed.clients)
      ? parsed.clients
      : state.clients;
    state.sessions = Array.isArray(parsed.sessions)
      ? parsed.sessions
      : state.sessions;
    state.settings = { ...state.settings, ...(parsed.settings || {}) };
    state.activeSessionId =
      parsed.activeSessionId !== undefined
        ? parsed.activeSessionId
        : state.activeSessionId;
    state.pendingStartTime = parsed.pendingStartTime || state.pendingStartTime;
  } catch (e) {
    console.warn("State parse error; starting with defaults", e);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureDefaults() {
  if (!Array.isArray(state.clients) || !state.clients.length) {
    state.clients = [...DEFAULT_CLIENTS];
  } else {
    const merged = new Set([...DEFAULT_CLIENTS, ...state.clients]);
    state.clients = Array.from(merged);
  }
  state.settings = state.settings || {};
  state.settings.lastSessionLength =
    typeof state.settings.lastSessionLength === "number"
      ? state.settings.lastSessionLength
      : 120;
  state.settings.clientProfiles = state.settings.clientProfiles || {};
  state.settings.customModules = state.settings.customModules || [];
  state.settings.theme = state.settings.theme || "dark";
  state.settings.hiddenModules = state.settings.hiddenModules || [];
  // session templates stored at top-level for easy access
  state.templates = state.templates || [];
  rules = [...embedRules(), ...(state.settings.customModules || [])];
  rulesLoaded = true;
}

function renderClientOptions() {
  const select = document.getElementById("clientSelect");
  select.innerHTML = "";
  state.clients.forEach((client) => {
    const opt = document.createElement("option");
    opt.value = client;
    opt.textContent = client;
    select.appendChild(opt);
  });

  const historyFilter = document.getElementById("historyClientFilter");
  if (historyFilter) {
    const current = historyFilter.value;
    historyFilter.innerHTML = '<option value="">All clients</option>';
    state.clients.forEach((client) => {
      const opt = document.createElement("option");
      opt.value = client;
      opt.textContent = client;
      historyFilter.appendChild(opt);
    });
    historyFilter.value = current;
  }
}

function renderClientList() {
  const wrap = document.getElementById("clientList");
  if (!wrap) return;
  const list = [...state.clients].sort((a, b) => a.localeCompare(b));
  if (!list.length) {
    wrap.classList.add("muted");
    wrap.textContent = "No clients yet.";
    return;
  }
  wrap.classList.remove("muted");
  wrap.innerHTML = "";
  list.forEach((name) => {
    const profile = getClientProfile(name) || {};
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div>
        <strong>${name}</strong>
        <div class="history-meta">
          ${profile.contact ? `<span>${escapeHtml(profile.contact)}</span>` : ""}
          ${profile.devicesOwned ? `<span>Devices: ${escapeHtml(profile.devicesOwned)}</span>` : ""}
          ${profile.pastIssues ? `<span>Past issues: ${escapeHtml(profile.pastIssues)}</span>` : ""}
        </div>
      </div>
      <div class="history-actions">
        <button class="ghost" data-client="select" data-name="${name}">Use</button>
        <button class="ghost" data-client="profile" data-name="${name}">Profile</button>
        <button class="ghost" data-client="edit" data-name="${name}">Edit</button>
        <button class="ghost" data-client="delete" data-name="${name}">Delete</button>
      </div>
    `;
    wrap.appendChild(card);
  });
  wrap.querySelectorAll("button[data-client]").forEach((btn) => {
    btn.onclick = (e) => {
      const name = e.target.dataset.name;
      if (!name) return;
      const action = e.target.dataset.client;
      if (action === "select") {
        document.getElementById("clientSelect").value = name;
        document.getElementById("newClient").value = "";
        updateClientContext();
      }
      if (action === "profile") {
        showClientProfile(name);
        return;
      }
      if (action === "edit") {
        const profile = ensureClientProfile(name);
        document.getElementById("clientAddName").value = name;
        document.getElementById("clientAddContact").value = profile.contact || "";
        document.getElementById("clientAddDevices").value = profile.devicesOwned || "";
        document.getElementById("clientAddIssues").value = profile.pastIssues || "";
        document.getElementById("clientSelect").value = name;
        document.getElementById("newClient").value = "";
        updateClientContext();
      }
      if (action === "delete") {
        if (!confirm(`Delete client "${name}"? Sessions will remain but profile will be removed.`)) return;
        state.clients = state.clients.filter((c) => c !== name);
        delete state.settings.clientProfiles[name];
        saveState();
        renderClientOptions();
        renderClientList();
        updateClientContext();
      }
    };
  });
}

function renderDeviceGoalOptions() {
  const deviceWrap = document.getElementById("deviceOptions");
  const goalWrap = document.getElementById("goalOptions");
  deviceWrap.innerHTML = "";
  goalWrap.innerHTML = "";

  devices.forEach((d) => {
    deviceWrap.appendChild(buildOption(d.id, d.label, "device"));
  });
  goals.forEach((g) => {
    goalWrap.appendChild(buildOption(g.id, g.label, "goal"));
  });
}

function buildOption(id, label, type) {
  const wrapper = document.createElement("label");
  wrapper.className = "option";
  wrapper.dataset.type = type;
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = id;
  input.name = `${type}-${id}`;
  input.addEventListener("change", () => {
    wrapper.classList.toggle("checked", input.checked);
  });
  wrapper.appendChild(input);
  wrapper.appendChild(document.createTextNode(" " + label));
  return wrapper;
}

// Session templates: render, save, load, delete
function renderTemplates() {
  const sel = document.getElementById("templateSelect");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Select template</option>';
  (state.templates || []).forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  });
  sel.value = current || "";
}

function saveTemplate() {
  const nameInput = document.getElementById("templateName");
  const name = (nameInput?.value || "").trim();
  const selectedDevices = Array.from(document.querySelectorAll("#deviceOptions .option input:checked")).map((i) => i.value);
  const selectedGoals = Array.from(document.querySelectorAll("#goalOptions .option input:checked")).map((i) => i.value);
  const length = parseInt(document.getElementById("sessionLength").value, 10) || state.settings.lastSessionLength;
  const location = document.getElementById("location").value || "onsite";
  const tpl = {
    id: `tmpl-${Date.now()}`,
    name: name || `Template ${new Date().toLocaleString()}`,
    devices: selectedDevices,
    goals: selectedGoals,
    sessionLength: length,
    location
  };
  state.templates = state.templates || [];
  state.templates.push(tpl);
  saveState();
  renderTemplates();
  if (nameInput) nameInput.value = "";
  alert("Template saved.");
}

function applyTemplateToForm(tpl) {
  if (!tpl) return;
  document.getElementById("sessionLength").value = tpl.sessionLength || state.settings.lastSessionLength;
  document.getElementById("location").value = tpl.location || "onsite";
  // devices
  document.querySelectorAll("#deviceOptions .option input").forEach((inp) => {
    inp.checked = (tpl.devices || []).includes(inp.value);
    inp.dispatchEvent(new Event("change"));
  });
  // goals
  document.querySelectorAll("#goalOptions .option input").forEach((inp) => {
    inp.checked = (tpl.goals || []).includes(inp.value);
    inp.dispatchEvent(new Event("change"));
  });
}

function deleteTemplate() {
  const sel = document.getElementById("templateSelect");
  if (!sel) return;
  const id = sel.value;
  if (!id) {
    alert("Select a template to delete.");
    return;
  }
  if (!confirm("Delete selected template?")) return;
  state.templates = (state.templates || []).filter((t) => t.id !== id);
  saveState();
  renderTemplates();
}

// Client profile modal and helpers
function showClientProfile(name) {
  const profile = getClientProfile(name) || {};
  const sessions = (state.sessions || []).filter((s) => s.clientName === name).sort((a,b)=> new Date(b.startTime||b.startISO||0)-new Date(a.startTime||a.startISO||0));
  const content = document.getElementById('clientProfileContent');
  if (!content) return;
  const lines = [];
  lines.push(`<div class="panel-header"><h3>Client: ${escapeHtml(name)}</h3><button id="closeClientProfile" class="ghost">Close</button></div>`);
  lines.push(`<div class="history-meta">${profile.contact?`<div>Contact: ${escapeHtml(profile.contact)}</div>`:''}${profile.devicesOwned?`<div>Devices: ${escapeHtml(profile.devicesOwned)}</div>`:''}${profile.pastIssues?`<div>Notes: ${escapeHtml(profile.pastIssues)}</div>`:''}</div>`);
  lines.push('<h4>Past sessions</h4>');
  if (!sessions.length) {
    lines.push('<div class="muted">No past sessions for this client.</div>');
  } else {
    lines.push('<div class="history-list">');
    sessions.forEach((s)=>{
      const date = new Date(s.startTime||s.startISO||0).toLocaleString();
      lines.push(`<div class="history-card"><div><strong>${escapeHtml(s.clientName)}</strong> — ${date}<div class="history-meta"><span>${escapeHtml((s.location||'onsite'))} • ${s.sessionLength||120} mins</span></div></div><div class="history-actions"><button class="ghost" data-action="open" data-id="${s.id}">Open</button><button class="ghost" data-action="duplicate" data-id="${s.id}">Duplicate</button><button class="ghost" data-action="followup" data-id="${s.id}">Add follow-up</button></div></div>`);
    });
    lines.push('</div>');
  }
  lines.push('<h4>Quick actions</h4>');
  lines.push('<div class="chip-row"><button id="duplicateLatestBtn" class="ghost">Duplicate latest session</button><button id="scheduleFollowUpBtn" class="primary">Schedule follow-up (new)</button></div>');
  content.innerHTML = lines.join('');
  document.getElementById('clientProfileModal').style.display = 'block';

  // attach handlers
  document.getElementById('closeClientProfile').onclick = hideClientProfile;
  document.getElementById('duplicateLatestBtn').onclick = () => {
    if (!sessions.length) return alert('No sessions to duplicate');
    duplicateSession(sessions[0].id, true);
    alert('Session duplicated and opened.');
    hideClientProfile();
    renderHistory();
  };
  document.querySelectorAll('#clientProfileContent button[data-action]').forEach((btn)=>{
    btn.onclick = (e)=>{
      const action = e.target.dataset.action;
      const id = e.target.dataset.id;
      if (action === 'open') {
        state.activeSessionId = id;
        saveState();
        renderChecklist(state.sessions.find(s=>s.id===id));
        renderSummary(state.sessions.find(s=>s.id===id));
        startTimer(state.sessions.find(s=>s.id===id).startTime || state.sessions.find(s=>s.id===id).startISO);
        hideClientProfile();
      }
      if (action === 'duplicate') {
        duplicateSession(id, true);
        hideClientProfile();
      }
      if (action === 'followup') {
        const title = prompt('Follow-up title');
        if (!title) return;
        const due = prompt('Due date (YYYY-MM-DD or leave blank)') || '';
        addFollowUpToSession(id, { title, due, notes: '' });
        alert('Follow-up added.');
        hideClientProfile();
      }
    };
  });
  const scheduleBtn = document.getElementById('scheduleFollowUpBtn');
  if (scheduleBtn) scheduleBtn.onclick = ()=>{
    const title = prompt('Follow-up title');
    if (!title) return;
    const due = prompt('Due date (YYYY-MM-DD or leave blank)') || '';
    // attach to most recent session if exists, otherwise create a lightweight follow-up entry on state
    if (sessions.length) {
      addFollowUpToSession(sessions[0].id, { title, due, notes: '' });
      alert('Follow-up added to latest session.');
    } else {
      state.pendingFollowUps = state.pendingFollowUps || [];
      state.pendingFollowUps.push({ clientName: name, title, due, notes: '' });
      saveState();
      alert('Follow-up saved.');
    }
    hideClientProfile();
  };
}

function hideClientProfile() {
  const modal = document.getElementById('clientProfileModal');
  if (modal) modal.style.display = 'none';
}

// Invoice modal: show, hide, save
function showInvoiceModal(itemId) {
  const modal = document.getElementById('invoiceModal');
  const desc = document.getElementById('invoiceDesc');
  const amt = document.getElementById('invoiceAmount');
  if (!modal || !desc || !amt) return;
  const session = getActiveSession();
  if (!session) return alert('No active session');
  const item = session.items.find((i) => i.id === itemId);
  if (!item) return alert('Item not found');
  modal.dataset.itemId = itemId;
  // support object or legacy string
  if (item.invoice && typeof item.invoice === 'object') {
    desc.value = item.invoice.desc || '';
    amt.value = Number(item.invoice.amount || 0).toFixed(2);
  } else if (item.invoice) {
    desc.value = String(item.invoice || '');
    amt.value = parseInvoiceAmount(item.invoice).toFixed(2);
  } else {
    desc.value = '';
    amt.value = '';
  }
  document.getElementById('invoiceModal').style.display = 'flex';
}

function hideInvoiceModal() {
  const modal = document.getElementById('invoiceModal');
  if (!modal) return;
  modal.style.display = 'none';
  delete modal.dataset.itemId;
  const desc = document.getElementById('invoiceDesc');
  const amt = document.getElementById('invoiceAmount');
  if (desc) desc.value = '';
  if (amt) amt.value = '';
}

function saveInvoiceModal() {
  const modal = document.getElementById('invoiceModal');
  if (!modal) return;
  const itemId = modal.dataset.itemId;
  if (!itemId) return hideInvoiceModal();
  const descEl = document.getElementById('invoiceDesc');
  const amtEl = document.getElementById('invoiceAmount');
  const desc = descEl?.value.trim() || '';
  const amount = parseFloat(amtEl?.value || 0) || 0;
  const session = getActiveSession();
  if (!session) return alert('No active session');
  const item = session.items.find((i) => i.id === itemId);
  if (!item) return alert('Item not found');
  if (!desc && !amount) {
    item.invoice = null;
  } else {
    item.invoice = { desc, amount };
  }
  syncInvoiceLines(session);
  saveState();
  renderChecklist(session);
  renderInvoice(session);
  hideInvoiceModal();
}

function duplicateSession(sessionId, openAfter) {
  const session = state.sessions.find((s)=>s.id===sessionId);
  if (!session) return;
  const duplicate = {
    ...session,
    id: 'sess-' + Date.now(),
    startTime: new Date().toISOString(),
    items: session.items.map((i, idx)=> ({ ...normalizeItemShape({ ...i }), id: `${i.moduleId || 'm'}-${idx}`, status: 'pending', notes: [], flagged: false, invoice: null, timeSpentMs:0, timerStart: null }))
  };
  state.sessions.push(duplicate);
  state.activeSessionId = duplicate.id;
  saveState();
  renderChecklist(duplicate);
  renderSummary(duplicate);
  renderHistory();
  if (openAfter) startTimer(duplicate.startTime);
}

function addFollowUpToSession(sessionId, follow) {
  const session = state.sessions.find((s)=>s.id===sessionId);
  if (!session) return;
  session.followUps = session.followUps || [];
  session.followUps.push(follow);
  saveState();
  renderFollowUps(session);
}

// Theme & appearance helpers
function applyTheme(themeName) {
  const theme = THEMES[themeName] || THEMES.dark;
  Object.entries(theme).forEach(([key, val]) => {
    try {
      document.documentElement.style.setProperty(key, val);
    } catch (e) {
      console.warn('Failed to apply theme variable', key, val, e);
    }
  });
  state.settings.theme = themeName;
  // small visual tweak: update data-theme attribute for stylesheet hooks
  document.documentElement.setAttribute('data-theme', themeName);
}

function populateSettingsUI() {
  const sel = document.getElementById('themeSelect');
  if (sel) sel.value = state.settings.theme || 'dark';
  const hideInput = document.getElementById('hideModulesInput');
  if (hideInput) hideInput.value = (state.settings.hiddenModules || []).join(',');
}

function saveAppearanceSettings() {
  const sel = document.getElementById('themeSelect');
  const hideInput = document.getElementById('hideModulesInput');
  const theme = sel ? sel.value : state.settings.theme || 'dark';
  state.settings.hiddenModules = hideInput && hideInput.value
    ? hideInput.value.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  applyTheme(theme);
  saveState();
  alert('Appearance settings saved.');
}

function currentClientName() {
  const typed = document.getElementById("newClient").value.trim();
  const selected = document.getElementById("clientSelect").value;
  return typed || selected || "Guest";
}

function getClientProfile(name) {
  return state.settings.clientProfiles[name] || null;
}

function ensureClientProfile(name) {
  ensureDefaults();
  if (!state.settings.clientProfiles[name]) {
    state.settings.clientProfiles[name] = {
      note: "",
      contact: "",
      devicesOwned: "",
      pastIssues: "",
      lastDevices: [],
      lastGoals: [],
      lastSessionLength: state.settings.lastSessionLength,
      lastLocation: "onsite",
      lastStartTime: null,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    };
  }
  return state.settings.clientProfiles[name];
}

function getLastSessionForClient(name) {
  const sessions = state.sessions
    .filter((s) => s.clientName === name)
    .sort(
      (a, b) =>
        new Date(b.startTime || b.startISO || 0) -
        new Date(a.startTime || a.startISO || 0)
    );
  return sessions[0] || null;
}

function applyDefaultSessionLength(lengthOverride) {
  const input = document.getElementById("sessionLength");
  const value =
    typeof lengthOverride === "number"
      ? lengthOverride
      : state.settings.lastSessionLength || 120;
  input.value = value;
  const tzInput = document.getElementById("timeZone");
  if (tzInput && !tzInput.value) {
    tzInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  }
}

function setOptionChecked(containerId, value, checked) {
  const input = document.querySelector(
    `#${containerId} input[value="${value}"]`
  );
  if (!input) return;
  input.checked = checked;
  input.closest(".option")?.classList.toggle("checked", checked);
}

function applySelections({ devices: selectedDevices = [], goals: selectedGoals = [] }) {
  document.querySelectorAll("#deviceOptions input").forEach((input) => {
    setOptionChecked("deviceOptions", input.value, false);
  });
  document.querySelectorAll("#goalOptions input").forEach((input) => {
    setOptionChecked("goalOptions", input.value, false);
  });
  selectedDevices.forEach((id) => setOptionChecked("deviceOptions", id, true));
  selectedGoals.forEach((id) => setOptionChecked("goalOptions", id, true));
}

function updateClientContext() {
  const name = currentClientName();
  const box = document.getElementById("clientContext");
  const noteInput = document.getElementById("clientNote");
  const contactInput = document.getElementById("clientContact");
  const devicesOwnedInput = document.getElementById("clientDevicesOwned");
  const issuesInput = document.getElementById("clientIssues");
  const tzInput = document.getElementById("timeZone");
  const profile = getClientProfile(name);
  const lastSession = getLastSessionForClient(name);

  noteInput.value = profile?.note || "";
  contactInput.value = profile?.contact || "";
  devicesOwnedInput.value = profile?.devicesOwned || "";
  issuesInput.value = profile?.pastIssues || "";
  if (profile?.timeZone && tzInput) tzInput.value = profile.timeZone;

  if (lastSession) {
    const date = new Date(lastSession.startTime || lastSession.startISO);
    const deviceText =
      lastSession.devices?.map((d) => deviceLabel(d)).join(", ") || "None";
    const goalText =
      lastSession.goals?.map((g) => goalLabel(g)).join(", ") || "None";
    box.textContent = `Last visit ${date.toLocaleDateString()} • ${lastSession.location} • ${lastSession.sessionLength || lastSession.lengthMins || 120} mins • Devices: ${deviceText} • Goals: ${goalText}`;
    applySelections({
      devices: lastSession.devices || [],
      goals: lastSession.goals || []
    });
    applyDefaultSessionLength(
      profile?.lastSessionLength ||
        lastSession.sessionLength ||
        lastSession.lengthMins
    );
    document.getElementById("location").value = lastSession.location || "onsite";
    return;
  }

  if (profile) {
    box.textContent = profile.note
      ? `Client notes: ${profile.note}`
      : "Returning client. No recent session data.";
    applySelections({
      devices: profile.lastDevices || [],
      goals: profile.lastGoals || []
    });
    applyDefaultSessionLength(profile.lastSessionLength);
    document.getElementById("location").value = profile.lastLocation || "onsite";
    return;
  }

  box.textContent = "New or guest client. No history yet.";
  applySelections({ devices: [], goals: [] });
  applyDefaultSessionLength();
}

function handleAddClient() {
  const name = document.getElementById("clientAddName").value.trim();
  const contact = document.getElementById("clientAddContact").value.trim();
  const devicesOwned = document.getElementById("clientAddDevices").value.trim();
  const issues = document.getElementById("clientAddIssues").value.trim();
  if (!name) {
    alert("Client name is required.");
    return;
  }
  if (!state.clients.includes(name)) {
    state.clients.push(name);
  }
  const profile = ensureClientProfile(name);
  profile.contact = contact;
  profile.devicesOwned = devicesOwned;
  profile.pastIssues = issues;
  saveState();
  renderClientOptions();
  renderClientList();
  document.getElementById("clientSelect").value = name;
  document.getElementById("newClient").value = "";
  updateClientContext();
  ["clientAddName", "clientAddContact", "clientAddDevices", "clientAddIssues"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function attachEvents() {
  document
    .getElementById("clientArrivedBtn")
    .addEventListener("click", handleArrived);
  document
    .getElementById("buildChecklistBtn")
    .addEventListener("click", handleBuildChecklist);
  document.getElementById("summaryBtn").addEventListener("click", () => {
    const session = getActiveSession();
    if (!session) {
      alert("Build a checklist first.");
      return;
    }
    renderSummary(session);
  });
  document.getElementById("printBtn").addEventListener("click", () => {
    const session = getActiveSession();
    if (session) {
      exportSummaryPDF(session.id);
    } else {
      window.print();
    }
  });
  document.getElementById("exportBtn").addEventListener("click", handleExport);
  document.getElementById("exportAllBtn").addEventListener("click", exportAllSessions);
  document.getElementById("importSessionsInput").addEventListener("change", importSessions);
  document.getElementById("resetBtn").addEventListener("click", resetSession);
  document.getElementById("addClientBtn").addEventListener("click", handleAddClient);
  document.getElementById("addRuleBtn").addEventListener("click", handleAddRule);
  document.getElementById("exportRulesBtn").addEventListener("click", downloadRules);
  document.getElementById("finishSessionBtn").addEventListener("click", finishSession);
  const exportInvBtn = document.getElementById("exportInvoicesBtn");
  if (exportInvBtn) exportInvBtn.addEventListener("click", exportInvoices);
  document.getElementById("clientSelect").addEventListener("change", () => {
    document.getElementById("newClient").value = "";
    updateClientContext();
  });
  document.getElementById("newClient").addEventListener("input", () => {
    updateClientContext();
  });
  document.getElementById("onsitePreset").addEventListener("click", () => {
    applyOnsitePreset();
  });
  document.getElementById("remotePreset").addEventListener("click", () => {
    applyRemotePreset();
  });
  document.getElementById("hideCompletedToggle").addEventListener("change", (e) => {
    uiState.hideCompleted = e.target.checked;
    const session = getActiveSession();
    if (session) renderChecklist(session);
  });
  document.getElementById("collapseCompletedToggle").addEventListener("change", (e) => {
    uiState.collapseCompleted = e.target.checked;
    const session = getActiveSession();
    if (session) renderChecklist(session);
  });
  document.getElementById("searchSteps").addEventListener("input", (e) => {
    uiState.searchTerm = e.target.value.toLowerCase();
    const session = getActiveSession();
    if (session) renderChecklist(session);
  });
  document.getElementById("undoBtn").addEventListener("click", handleUndo);
  document.getElementById("taxToggle").addEventListener("change", () => {
    const session = getActiveSession();
    if (session) renderInvoice(session);
  });
  document.getElementById("historySearch").addEventListener("input", renderHistory);
  document.getElementById("historyClientFilter").addEventListener("change", renderHistory);
  const addFollow = document.getElementById("addFollowBtn");
  if (addFollow) addFollow.addEventListener("click", handleAddFollowUp);
  const exportIcsBtn = document.getElementById("exportIcsBtn");
  if (exportIcsBtn) exportIcsBtn.addEventListener("click", exportFollowUpsIcs);
  const emailBtn = document.getElementById("generateEmailBtn");
  if (emailBtn) emailBtn.addEventListener("click", generateEmailDraft);
  const riskNoteEl = document.getElementById("riskNote");
  const consentNameEl = document.getElementById("consentName");
  const consentToggle = document.getElementById("consentCapturedToggle");
  [riskNoteEl, consentNameEl, consentToggle].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", saveConsentInputs);
    el.addEventListener("change", saveConsentInputs);
  });
  const applyThemeBtn = document.getElementById("applyThemeBtn");
  if (applyThemeBtn) {
    applyThemeBtn.addEventListener("click", () => {
      const theme = document.getElementById("themeSelect").value;
      applyTheme(theme);
      saveState();
    });
  }
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  if (saveSettingsBtn) saveSettingsBtn.addEventListener("click", saveAppearanceSettings);
  const exportSessionsCsvBtn = document.getElementById("exportSessionsCsvBtn");
  if (exportSessionsCsvBtn) exportSessionsCsvBtn.addEventListener("click", exportSessionsCsv);
  const exportClientsCsvBtn = document.getElementById("exportClientsCsvBtn");
  if (exportClientsCsvBtn) exportClientsCsvBtn.addEventListener("click", exportClientsCsv);
  const importClientsCsvInput = document.getElementById("importClientsCsvInput");
  if (importClientsCsvInput) importClientsCsvInput.addEventListener("change", importClientsCsv);
  const exportInvoicePdfBtn = document.getElementById("exportInvoicePdfBtn");
  if (exportInvoicePdfBtn) exportInvoicePdfBtn.addEventListener("click", () => {
    const session = getActiveSession();
    if (!session) return alert('No active session to export invoice for.');
    exportInvoicePDF(session.id);
  });
  document.addEventListener("keydown", handleKeyboardShortcuts);
  window.addEventListener("online", updateOfflineBanner);
  window.addEventListener("offline", updateOfflineBanner);
  updateOfflineBanner();

  // Template controls
  const saveTpl = document.getElementById("saveTemplateBtn");
  if (saveTpl) saveTpl.addEventListener("click", saveTemplate);
  const delTpl = document.getElementById("deleteTemplateBtn");
  if (delTpl) delTpl.addEventListener("click", deleteTemplate);
  const tplSelect = document.getElementById("templateSelect");
  if (tplSelect)
    tplSelect.addEventListener("change", (e) => {
      const id = e.target.value;
      const tpl = (state.templates || []).find((t) => t.id === id) || null;
      const nameInput = document.getElementById("templateName");
      if (nameInput) nameInput.value = tpl ? tpl.name : "";
      if (tpl) applyTemplateToForm(tpl);
    });

  // Invoice modal controls
  const invoiceModalClose = document.getElementById('invoiceModalClose');
  if (invoiceModalClose) invoiceModalClose.addEventListener('click', hideInvoiceModal);
  const cancelInvoiceLineBtn = document.getElementById('cancelInvoiceLineBtn');
  if (cancelInvoiceLineBtn) cancelInvoiceLineBtn.addEventListener('click', hideInvoiceModal);
  const saveInvoiceLineBtn = document.getElementById('saveInvoiceLineBtn');
  if (saveInvoiceLineBtn) saveInvoiceLineBtn.addEventListener('click', saveInvoiceModal);
}

function applyOnsitePreset() {
  document.getElementById("location").value = "onsite";
  setOptionChecked("deviceOptions", "router", true);
  setOptionChecked("goalOptions", "wifi", true);
}

function applyRemotePreset() {
  document.getElementById("location").value = "remote";
  setOptionChecked("deviceOptions", "router", false);
}

function handleArrived() {
  const now = new Date();
  document.getElementById(
    "startTimeDisplay"
  ).textContent = `Start time — ${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
  const session = getActiveSession();
  if (session && (session.startTime || session.startISO)) return;
  state.pendingStartTime = now.toISOString();
  saveState();
  startTimer(now);
}

async function handleBuildChecklist() {
  const ready = await ensureRulesReady();
  if (!ready) {
    alert("Rules are still loading. Please wait a moment and try again.");
    return;
  }
  const clientName = currentClientName();
  if (clientName && !state.clients.includes(clientName)) {
    state.clients.push(clientName);
    renderClientOptions();
    document.getElementById("clientSelect").value = clientName;
  }

  const selectedDevices = Array.from(
    document.querySelectorAll("#deviceOptions input:checked")
  ).map((i) => i.value);
  const selectedGoals = Array.from(
    document.querySelectorAll("#goalOptions input:checked")
  ).map((i) => i.value);

  if (!selectedDevices.length && !selectedGoals.length) {
    alert("Pick at least one device or goal to build a checklist.");
    return;
  }

  const startTime =
    getActiveSession()?.startTime ||
    state.pendingStartTime ||
    new Date().toISOString();

  const sessionLength = parseInt(
    document.getElementById("sessionLength").value || "120",
    10
  );
  const location = document.getElementById("location").value;
  const timeZone = document.getElementById("timeZone").value.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clientNote = document.getElementById("clientNote").value.trim();
  const clientContact = document.getElementById("clientContact").value.trim();
  const clientDevicesOwned = document.getElementById("clientDevicesOwned").value.trim();
  const clientIssues = document.getElementById("clientIssues").value.trim();
  const riskNote = document.getElementById("riskNote")?.value.trim() || "";
  const consentName = document.getElementById("consentName")?.value.trim() || "";
  const consentCaptured = document.getElementById("consentCapturedToggle")?.checked || false;
  const chosenModules = selectModules(selectedDevices, selectedGoals);
  const items = expandChecklist(chosenModules);

  const session = {
    id: "sess-" + Date.now(),
    clientName,
    startTime,
    sessionLength,
    location,
    timeZone,
    devices: selectedDevices,
    goals: selectedGoals,
    modules: chosenModules,
    items,
    invoiceLines: [],
    notes: clientNote ? [clientNote] : [],
    followUps: [],
    riskNote,
    consentName,
    consentCaptured,
    consentCapturedAt: consentCaptured ? new Date().toISOString() : null
  };

  state.sessions.push(session);
  state.activeSessionId = session.id;
  state.pendingStartTime = null;
  state.settings.lastSessionLength = sessionLength;

  const profile = ensureClientProfile(clientName);
  profile.note = clientNote;
  profile.contact = clientContact;
  profile.devicesOwned = clientDevicesOwned;
  profile.pastIssues = clientIssues;
  profile.lastDevices = selectedDevices;
  profile.lastGoals = selectedGoals;
  profile.lastSessionLength = sessionLength;
  profile.lastLocation = location;
  profile.lastStartTime = startTime;
  profile.timeZone = timeZone;

  saveState();
  startTimer(new Date(startTime));
  renderChecklist(session);
  renderSummary(session);
  renderHistory();
  renderClientList();
}

function selectModules(selectedDevices, selectedGoals) {
  const hidden = new Set(state.settings.hiddenModules || []);
  return rules.filter((module) => {
    if (hidden.has(module.id)) return false;
    const deviceOk =
      module.devices.length === 0 ||
      module.devices.some((d) => selectedDevices.includes(d));
    const goalOk =
      module.goals.length === 0 ||
      module.goals.some((g) => selectedGoals.includes(g));
    return deviceOk && goalOk;
  });
}

function expandChecklist(modules) {
  const items = [];
  modules.forEach((mod) => {
    const timeboxMs = parseTimeboxMs(mod.timebox);
    mod.steps.forEach((step, idx) => {
      items.push({
        id: `${mod.id}-${idx}`,
        moduleId: mod.id,
        step,
        status: "pending",
        notes: [],
        flagged: false,
        invoice: null,
        timeboxMs,
        timeSpentMs: 0,
        timerStart: null
      });
    });
  });
  return items;
}

function normalizeItemShape(item) {
  if (item.timeboxMs === undefined) item.timeboxMs = 0;
  if (item.timeSpentMs === undefined) item.timeSpentMs = 0;
  if (item.timerStart === undefined) item.timerStart = null;
  if (item.invoice === undefined) item.invoice = null;
  if (!Array.isArray(item.notes)) item.notes = [];
  if (item.flagged === undefined) item.flagged = false;
  return item;
}

function createSession({
  clientName = "Guest",
  devices = [],
  goals = [],
  sessionLength = 120,
  location = "onsite",
  startTime = null
} = {}) {
  ensureRulesReady();
  const chosenModules = selectModules(devices, goals);
  const items = expandChecklist(chosenModules);
  const session = {
    id: "sess-" + Date.now(),
    clientName,
    startTime: startTime || new Date().toISOString(),
    sessionLength,
    location,
    devices,
    goals,
    modules: chosenModules,
    items,
    invoiceLines: [],
    notes: [],
    followUps: [],
    riskNote: "",
    consentName: "",
    consentCaptured: false,
    consentCapturedAt: null
  };
  state.sessions.push(session);
  state.activeSessionId = session.id;
  saveState();
  startTimer(session.startTime);
  renderChecklist(session);
  renderSummary(session);
  renderHistory();
  return session;
}

function renderChecklist(session) {
  const container = document.getElementById("checklistContainer");
  container.innerHTML = "";
  if (!session) {
    container.innerHTML = "<p class='muted'>Build a checklist to see tasks.</p>";
    return;
  }

  const searchTerm = uiState.searchTerm;

  session.modules.forEach((mod) => {
    const moduleItems = session.items
      .filter((i) => i.moduleId === mod.id)
      .map(normalizeItemShape);
    const moduleComplete = moduleItems.length
      ? moduleItems.every((i) => i.status === "done")
      : false;

    const card = document.createElement("div");
    card.className = "module-card";
    if (uiState.isOverrun) card.classList.add("overrun");
    card.innerHTML = `
      <div class="module-heading">
        <div>
          <h3>${mod.title}</h3>
          <div class="meta">
            <span class="tag">Timebox ${mod.timebox}</span>
            ${mod.riskNote ? `<span class="tag risk">Risk: ${mod.riskNote}</span>` : ""}
          </div>
        </div>
        <div class="meta">
          ${
            mod.devices.length
              ? `<span class="tag">${mod.devices
                  .map((d) => deviceLabel(d))
                  .join(", ")}</span>`
              : ""
          }
        </div>
      </div>
      <div class="quick-questions">
        <strong>Quick questions:</strong> ${mod.quickQuestions.join(" • ")}
      </div>
    `;
    if (uiState.collapseCompleted && moduleComplete) {
      const doneNote = document.createElement("div");
      doneNote.className = "muted";
      doneNote.textContent = `Completed (${moduleItems.length} steps).`;
      card.appendChild(doneNote);
      container.appendChild(card);
      return;
    }

    const list = document.createElement("ul");
    list.className = "steps";
    const filteredItems = moduleItems.filter((item) => {
      if (uiState.hideCompleted && item.status === "done") return false;
      if (!searchTerm) return true;
      const haystack = `${item.step} ${mod.title}`.toLowerCase();
      return haystack.includes(searchTerm);
    });

    if (!filteredItems.length) {
      const li = document.createElement("li");
      li.className = "step-item";
      li.innerHTML = "<div class='step-body'><em class='muted'>No steps match current filters.</em></div>";
      list.appendChild(li);
    } else {
      filteredItems.forEach((item) => {
        const li = document.createElement("li");
        li.className = `step-item ${item.status === "done" ? "done" : ""}`;
        li.dataset.itemId = item.id;
        li.tabIndex = 0;
        li.addEventListener("click", () => {
          uiState.activeItemId = item.id;
        });
        li.addEventListener("focus", () => {
          uiState.activeItemId = item.id;
        });
        const notesHtml = item.notes.length
          ? `<div class="note-list">${item.notes
              .map(
                (n, idx) =>
                  `<div class="note"><strong>Note ${idx + 1}:</strong> ${escapeHtml(
                    n
                  )}</div>`
              )
              .join("")}</div>`
          : "";
        li.innerHTML = `
          <div class="step-body">
            <strong>${item.step}</strong>
            ${notesHtml}
            ${item.flagged ? `<div class="tag risk">Flagged for follow-up</div>` : ""}
            ${item.invoice ? `<div class="tag">Invoice: ${item.invoice}</div>` : ""}
            <div class="time-row">${timeRowText(item)}</div>
            <div class="note-editor">
              <textarea data-note-input="${item.id}" placeholder="Add note..."></textarea>
              <button class="ghost" data-action="save-note" data-item="${item.id}">Save note</button>
            </div>
          </div>
          <div class="step-actions">
            <button class="primary" data-action="toggle">${item.status === "done" ? "Mark pending" : "Mark done"}</button>
            <button class="ghost" data-action="flag">${item.flagged ? "Clear flag" : "Flag follow-up"}</button>
            <button class="ghost" data-action="invoice">${item.invoice ? "Edit invoice" : "Add to invoice"}</button>
            <button class="ghost" data-action="timer">${item.timerStart ? "Stop timer" : "Start timer"}</button>
          </div>
        `;
        list.appendChild(li);
      });
    }
    card.appendChild(list);
    container.appendChild(card);
  });
  updateProgress(session);
  bindChecklistActions();
  ensureItemTimers(session);
  renderInvoice(session);
  renderFollowUps(session);
}

function bindChecklistActions() {
  document.querySelectorAll(".step-actions button, .note-editor button").forEach((btn) => {
    btn.onclick = (e) => {
      const action = e.target.dataset.action;
      const li = e.target.closest(".step-item");
      const itemId = li?.dataset.itemId;
      const session = getActiveSession();
      if (!action || !itemId || !session) return;
      uiState.activeItemId = itemId;
      const item = session.items.find((i) => i.id === itemId);
      if (!item) return;
      pushUndo(session, item);
      if (action === "toggle") {
        item.status = item.status === "done" ? "pending" : "done";
        if (item.status === "done") {
          stopItemTimer(item);
        }
      }
      if (action === "flag") {
        item.flagged = !item.flagged;
      }
      if (action === "invoice") {
        // open invoice edit modal to capture description + numeric amount
        showInvoiceModal(itemId);
        return;
      }
      if (action === "save-note") {
        const textarea = li.querySelector(`textarea[data-note-input="${itemId}"]`);
        const note = textarea?.value.trim();
        if (note) {
          item.notes.push(note);
          textarea.value = "";
        }
      }
      if (action === "timer") {
        if (item.timerStart) {
          stopItemTimer(item);
        } else {
          startItemTimer(item, session);
        }
      }
      syncInvoiceLines(session);
      saveState();
      renderChecklist(session);
      renderSummary(session, { silent: true });
      renderHistory();
      renderMetrics();
    };
  });
}

function syncInvoiceLines(session) {
  session.invoiceLines = session.items
    .filter((i) => i.invoice)
    .map((i) => {
      const desc = typeof i.invoice === 'object' ? (i.invoice.desc || '') : i.invoice;
      const amount = parseInvoiceAmount(i.invoice);
      return {
        itemId: i.id,
        description: desc,
        amount
      };
    });
}

function parseInvoiceAmount(text) {
  if (text === null || text === undefined) return 0;
  // support structured invoice objects { desc, amount }
  if (typeof text === 'object') {
    const n = Number(text.amount || 0);
    return Number.isFinite(n) ? n : 0;
  }
  const match = String(text).match(/([0-9]+(\.[0-9]{1,2})?)/);
  if (!match) return 0;
  return parseFloat(match[1]) || 0;
}

function renderInvoice(session) {
  const wrap = document.getElementById("invoiceLines");
  if (!wrap || !session) return;
  const applyTax = document.getElementById("taxToggle")?.checked;
  const lines = session.items.filter((i) => i.invoice);
  if (!lines.length) {
    wrap.classList.add("muted");
    wrap.innerHTML = "No billable items yet.";
  } else {
    wrap.classList.remove("muted");
    wrap.innerHTML = "";
    lines.forEach((line) => {
      const div = document.createElement("div");
      div.className = "invoice-line";
      const amount = parseInvoiceAmount(line.invoice);
      const desc = typeof line.invoice === 'object' ? (line.invoice.desc || '') : line.invoice;
      div.innerHTML = `<strong>${escapeHtml(String(desc))}</strong><span>$${(amount||0).toFixed(2)}</span>`;
      wrap.appendChild(div);
    });
  }
  const subtotal = lines.reduce(
    (sum, l) => sum + parseInvoiceAmount(l.invoice),
    0
  );
  const tax = applyTax ? subtotal * 0.1 : 0;
  const total = subtotal + tax;
  const subEl = document.getElementById("invoiceSubtotal");
  const taxEl = document.getElementById("invoiceTax");
  const totalEl = document.getElementById("invoiceTotal");
  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  renderInvoiceHistory();
}

function pushUndo(session, item) {
  uiState.undoStack.push({
    sessionId: session.id,
    itemId: item.id,
    snapshot: JSON.parse(JSON.stringify(item))
  });
  if (uiState.undoStack.length > 30) {
    uiState.undoStack.shift();
  }
}

function handleUndo() {
  const entry = uiState.undoStack.pop();
  if (!entry) return;
  const session = state.sessions.find((s) => s.id === entry.sessionId);
  if (!session) return;
  const item = session.items.find((i) => i.id === entry.itemId);
  if (!item) return;
  stopItemTimer(item);
  Object.assign(item, entry.snapshot);
  saveState();
  renderChecklist(session);
  renderSummary(session, { silent: true });
  renderHistory();
}

function updateProgress(session) {
  const total = session?.items.length || 0;
  const done = session?.items.filter((i) => i.status === "done").length || 0;
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.getElementById("progressText").textContent = `${done} of ${total} done`;
}

function renderSummary(session, { silent } = {}) {
  if (!session) return;
  populateConsentInputs(session);
  const doneItems = session.items.filter((i) => i.status === "done");
  const clientMode = document.getElementById("clientModeToggle")?.checked;
  const flagged = clientMode ? [] : session.items.filter((i) => i.flagged);
  const remaining = session.items.filter((i) => i.status !== "done");
  const summaryBox = document.getElementById("summaryContent");

  const whatWeDid = doneItems.slice(0, 10).map((i) => `<li>${i.step}</li>`);
  const improvements = session.goals.length
    ? session.goals.map((g) => `<li>${goalLabel(g)} improved</li>`)
    : ["<li>General tune-up and health checks completed.</li>"];
  const nextSteps = [
    ...flagged.map((i) => `<li>Follow-up: ${i.step}</li>`),
    ...remaining.slice(0, 5).map((i) => `<li>Finish: ${i.step}</li>`)
  ];
  const securityReminders = clientMode
    ? []
    : [
        "Keep backups running and verify at least weekly.",
        "Use a password manager + 2FA for email and banking.",
        "Be cautious with unexpected links/codes; call before approving prompts."
      ];

  const consentLine = session.consentCaptured
    ? `Consent captured from ${escapeHtml(session.consentName || "client")} at ${formatDateTime(
        session.consentCapturedAt || session.startTime || session.startISO,
        session.timeZone
      )}`
    : "Consent not captured yet.";
  const riskLine = session.riskNote ? escapeHtml(session.riskNote) : "No risk/consent notes logged.";

  summaryBox.innerHTML = `
    <p><strong>Client:</strong> ${session.clientName} — ${formatDateTime(
    session.startTime || session.startISO,
    session.timeZone
  )}</p>
    <p><strong>Location:</strong> ${session.location} • ${session.sessionLength} mins planned</p>
    <p><strong>Status:</strong> ${session.status || "in-session"}</p>
    ${summaryIntro()}
    ${profileContactLine(session.clientName)}
    <h4>What we did</h4>
    <ul>${whatWeDid.join("") || "<li>In progress</li>"}</ul>
    <h4>What improved</h4>
    <ul>${improvements.join("")}</ul>
    <h4>Recommended next steps</h4>
    <ul>${nextSteps.join("") || "<li>None noted</li>"}</ul>
    ${renderFollowUpsSummary(session)}
    <h4>Risk / Consent</h4>
    <ul>
      <li>${riskLine}</li>
      <li>${consentLine}</li>
    </ul>
    <h4>Security reminders</h4>
    <ul>${securityReminders.map((s) => `<li>${s}</li>`).join("") || "<li>—</li>"}</ul>
    ${summaryOutro()}
  `;

  if (!silent) {
    summaryBox.scrollIntoView({ behavior: "smooth" });
  }
}

function goalLabel(id) {
  return goals.find((g) => g.id === id)?.label || id;
}

function deviceLabel(id) {
  return devices.find((d) => d.id === id)?.label || id;
}

function profileContactLine(clientName) {
  const profile = getClientProfile(clientName);
  if (!profile) return "";
  const bits = [];
  if (profile.contact) bits.push(`Contact: ${escapeHtml(profile.contact)}`);
  if (profile.devicesOwned) bits.push(`Devices: ${escapeHtml(profile.devicesOwned)}`);
  if (profile.pastIssues) bits.push(`Past issues: ${escapeHtml(profile.pastIssues)}`);
  if (!bits.length) return "";
  return `<p><strong>Profile:</strong> ${bits.join(" • ")}</p>`;
}

function renderFollowUpsSummary(session) {
  const items = session.followUps || [];
  if (!items.length) return "";
  const html = items
    .map(
      (f) =>
        `<li>${escapeHtml(f.title)} — due ${f.due ? formatDateTime(f.due, session.timeZone) : "unscheduled"}${f.notes ? ` (${escapeHtml(f.notes)})` : ""}</li>`
    )
    .join("");
  return `<h4>Follow-ups</h4><ul>${html}</ul>`;
}

function summaryIntro() {
  const intro = document.getElementById("summaryIntro")?.value.trim();
  if (!intro) return "";
  return `<p>${escapeHtml(intro)}</p>`;
}

function summaryOutro() {
  const outro = document.getElementById("summaryOutro")?.value.trim();
  if (!outro) return "";
  return `<p>${escapeHtml(outro)}</p>`;
}

function populateConsentInputs(session) {
  const riskEl = document.getElementById("riskNote");
  const consentEl = document.getElementById("consentName");
  const toggle = document.getElementById("consentCapturedToggle");
  if (riskEl) riskEl.value = session.riskNote || "";
  if (consentEl) consentEl.value = session.consentName || "";
  if (toggle) toggle.checked = Boolean(session.consentCaptured);
}

function saveConsentInputs() {
  const session = getActiveSession();
  if (!session) return;
  const riskEl = document.getElementById("riskNote");
  const consentEl = document.getElementById("consentName");
  const toggle = document.getElementById("consentCapturedToggle");
  session.riskNote = riskEl?.value || "";
  session.consentName = consentEl?.value || "";
  session.consentCaptured = toggle?.checked || false;
  if (session.consentCaptured) {
    session.consentCapturedAt = session.consentCapturedAt || new Date().toISOString();
  } else {
    session.consentCapturedAt = null;
  }
  saveState();
  renderSummary(session, { silent: true });
}

function currentTimeSpentMs(item) {
  const base = item.timeSpentMs || 0;
  if (item.timerStart) {
    return base + (Date.now() - new Date(item.timerStart).getTime());
  }
  return base;
}

function parseTimeboxMs(timebox) {
  if (!timebox) return 0;
  const nums = String(timebox)
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n));
  if (!nums.length) return 0;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return avg * 60 * 1000;
}

function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeICS(str) {
  return (str || "")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

function formatDateTime(value, timeZone) {
  if (!value) return "N/A";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  try {
    return new Intl.DateTimeFormat("en-AU", {
      ...options,
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(new Date(value));
  } catch (e) {
    return new Date(value).toLocaleString();
  }
}

function formatDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(s / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const seconds = String(s % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function timeRowText(item) {
  const timeSpentMs = currentTimeSpentMs(item);
  const timeboxText = item.timeboxMs
    ? `${Math.round(item.timeboxMs / 60000)}m target`
    : "No target";
  const spentText = formatDuration(timeSpentMs);
  const timerRunning = Boolean(item.timerStart);
  return `Time: ${spentText} / ${timeboxText} ${timerRunning ? "• running" : ""}`;
}

function startItemTimer(item, session) {
  item.timerStart = new Date().toISOString();
  ensureItemTimerInterval(item, session);
}

function stopItemTimer(item) {
  if (activeItemTimers[item.id]) {
    clearInterval(activeItemTimers[item.id]);
    delete activeItemTimers[item.id];
  }
  if (item.timerStart) {
    const elapsed = Date.now() - new Date(item.timerStart).getTime();
    item.timeSpentMs = (item.timeSpentMs || 0) + elapsed;
    item.timerStart = null;
  }
}

function ensureItemTimerInterval(item, session) {
  if (item.status === "done") {
    stopItemTimer(item);
    return;
  }
  if (!item.timerStart) {
    stopItemTimer(item);
    return;
  }
  if (activeItemTimers[item.id]) return;
  activeItemTimers[item.id] = setInterval(() => {
    const elapsed = currentTimeSpentMs(item);
    const row = document.querySelector(
      `.step-item[data-item-id="${item.id}"] .time-row`
    );
    if (row) row.textContent = timeRowText(item);
    if (item.timeboxMs && elapsed >= item.timeboxMs && item.status !== "done") {
      item.status = "done";
      item.timeSpentMs = item.timeboxMs;
      item.timerStart = null;
      stopItemTimer(item);
      saveState();
      renderChecklist(session);
      renderSummary(session, { silent: true });
      renderHistory();
    }
  }, 1000);
}

function ensureItemTimers(session) {
  if (!session) return;
  clearAllItemTimers();
  session.items.forEach((item) => {
    normalizeItemShape(item);
    if (item.timerStart && item.status !== "done") {
      ensureItemTimerInterval(item, session);
    } else {
      stopItemTimer(item);
    }
  });
  renderInvoice(session);
}

function clearAllItemTimers() {
  Object.values(activeItemTimers).forEach((id) => clearInterval(id));
  activeItemTimers = {};
}

function handleKeyboardShortcuts(e) {
  const targetTag = (e.target.tagName || "").toLowerCase();
  if (["input", "textarea", "select", "button"].includes(targetTag)) return;
  const session = getActiveSession();
  if (!session) return;
  const itemId = uiState.activeItemId;
  if (!itemId) return;
  const item = session.items.find((i) => i.id === itemId);
  if (!item) return;
  if (e.key === "d") {
    item.status = item.status === "done" ? "pending" : "done";
    if (item.status === "done") stopItemTimer(item);
  }
  if (e.key === "f") {
    item.flagged = !item.flagged;
  }
  if (e.key === "n") {
    const textarea = document.querySelector(`.step-item[data-item-id="${itemId}"] textarea[data-note-input="${itemId}"]`);
    if (textarea) {
      textarea.focus();
      e.preventDefault();
    }
  }
  syncInvoiceLines(session);
  saveState();
  renderChecklist(session);
  renderSummary(session, { silent: true });
  renderHistory();
}

function startTimer(startTime) {
  clearInterval(timerInterval);
  if (!startTime) return;
  timerInterval = setInterval(() => {
    const session = getActiveSession();
    if (session?.status === "finished") {
      clearInterval(timerInterval);
      return;
    }
    const length = session?.sessionLength || state.settings.lastSessionLength || 120;
    const start = new Date(startTime);
    const now = new Date();
    const elapsedMs = now - start;
    const end = new Date(start.getTime() + length * 60000);
    const remainingMs = end - now;
    uiState.isOverrun = remainingMs < 0;
    updateRemainingUI(remainingMs);
    document.getElementById("timerDisplay").textContent = formatDuration(elapsedMs);
    highlightOverrunCards(uiState.isOverrun);
  }, 1000);
}

function updateRemainingUI(remainingMs) {
  const remainingEl = document.getElementById("remainingDisplay");
  const statusEl = document.getElementById("remainingStatus");
  if (!remainingEl || !statusEl) return;
  const overdue = remainingMs < 0;
  const abs = Math.abs(remainingMs);
  const minutes = Math.floor(abs / 1000 / 60);
  const seconds = Math.floor((abs / 1000) % 60);
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  remainingEl.textContent = display;
  remainingEl.classList.toggle("remaining-overdue", overdue);
  statusEl.textContent = overdue ? "Over time" : alertLabel(minutes);
}

function alertLabel(minutesLeft) {
  if (minutesLeft <= 0) return "Over time";
  if (minutesLeft <= 5) return "Wrap now (5m)";
  if (minutesLeft <= 15) return "15m remaining";
  if (minutesLeft <= 30) return "30m remaining";
  return "On track";
}

function highlightOverrunCards(isOverrun) {
  document
    .querySelectorAll(".module-card")
    .forEach((card) => card.classList.toggle("overrun", isOverrun));
}

function updateOfflineBanner() {
  const banner = document.getElementById("offlineBanner");
  if (!banner) return;
  if (navigator.onLine) {
    banner.style.display = "none";
  } else {
    banner.style.display = "block";
  }
}

function applyTheme(themeName) {
  const name = THEMES[themeName] ? themeName : "dark";
  const theme = THEMES[name];
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  state.settings.theme = name;
  const select = document.getElementById("themeSelect");
  if (select) select.value = name;
}

function populateSettingsUI() {
  const select = document.getElementById("themeSelect");
  if (select) select.value = state.settings.theme || "dark";
  const hideInput = document.getElementById("hideModulesInput");
  if (hideInput) {
    hideInput.value = (state.settings.hiddenModules || []).join(", ");
  }
}

function saveAppearanceSettings() {
  const theme = document.getElementById("themeSelect")?.value || state.settings.theme || "dark";
  const hideRaw = document.getElementById("hideModulesInput")?.value || "";
  state.settings.hiddenModules = hideRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  applyTheme(theme);
  saveState();
  alert("Settings saved. Hidden modules will be skipped in new checklists.");
}

function handleExport() {
  const session = getActiveSession();
  if (!session) {
    alert("No active session to export.");
    return;
  }
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `parristech-session-${session.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllSessions() {
  if (!state.sessions.length) {
    alert("No sessions to export.");
    return;
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    sessions: state.sessions
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `parristech-sessions-all.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function collectInvoices() {
  return state.sessions
    .filter((s) => (s.invoiceLines && s.invoiceLines.length) || s.items?.some((i) => i.invoice))
    .map((s) => {
      const lines = s.items
        .filter((i) => i.invoice)
        .map((i) => ({
          description: i.invoice,
          moduleId: i.moduleId,
          itemId: i.id,
          amount: parseInvoiceAmount(i.invoice)
        }));
      const subtotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0);
      return {
        sessionId: s.id,
        clientName: s.clientName,
        startTime: s.startTime || s.startISO,
        location: s.location,
        lines,
        subtotal
      };
    });
}

function exportInvoices() {
  const invoices = collectInvoices();
  if (!invoices.length) {
    alert("No invoices to export.");
    return;
  }
  const payload = { exportedAt: new Date().toISOString(), invoices };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "parristech-invoices.json";
  a.click();
  URL.revokeObjectURL(url);
  renderInvoiceHistory(invoices);
}

function renderInvoiceHistory(existing) {
  const wrap = document.getElementById("invoiceHistory");
  if (!wrap) return;
  const invoices = existing || collectInvoices();
  if (!invoices.length) {
    wrap.classList.add("muted");
    wrap.textContent = "No invoices yet.";
    return;
  }
  wrap.classList.remove("muted");
  wrap.innerHTML = "";
  invoices.forEach((inv) => {
    const card = document.createElement("div");
    card.className = "invoice-history-card";
    const date = inv.startTime ? formatDateTime(inv.startTime, inv.timeZone) : "N/A";
    const linesText = inv.lines
      .map((l) => `${escapeHtml(l.description)} ($${(l.amount || 0).toFixed(2)})`)
      .join("<br>");
    card.innerHTML = `
      <div>
        <strong>${inv.clientName}</strong> — ${date}
        <div class="history-meta">
          <span>Session: ${inv.sessionId}</span>
          <span>Subtotal: $${inv.subtotal.toFixed(2)}</span>
        </div>
        <div class="note">${linesText}</div>
      </div>
      <div class="history-actions">
        <button class="ghost" data-history="view" data-id="${inv.sessionId}">Open session</button>
      </div>
    `;
    wrap.appendChild(card);
  });
  wrap.querySelectorAll("button[data-history]").forEach((btn) => {
    btn.onclick = (e) => {
      const sessionId = e.target.dataset.id;
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return;
      state.activeSessionId = session.id;
      saveState();
      renderChecklist(session);
      renderSummary(session);
      startTimer(session.startTime || session.startISO);
    };
  });
}

function importSessions(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const sessions = Array.isArray(data) ? data : data.sessions;
      if (!Array.isArray(sessions)) throw new Error("Invalid format");
      const existingIds = new Set(state.sessions.map((s) => s.id));
      let imported = 0;
      sessions.forEach((s) => {
        if (!s.id) s.id = "sess-" + Date.now() + Math.random();
        if (existingIds.has(s.id)) return;
        state.sessions.push(s);
        existingIds.add(s.id);
        imported += 1;
      });
      saveState();
      renderHistory();
      alert(`Imported ${imported} sessions`);
    } catch (e) {
      alert("Import failed: " + e.message);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function resetSession() {
  clearInterval(timerInterval);
  clearAllItemTimers();
  uiState.undoStack = [];
  document.getElementById("checklistContainer").innerHTML = "";
  document.getElementById("summaryContent").innerHTML =
    "<p>Session cleared. Start a new one.</p>";
  document.getElementById("startTimeDisplay").textContent = "Start time — not set";
  document.getElementById("timerDisplay").textContent = "00:00:00";
  document.getElementById("remainingDisplay").textContent = "--:--";
  document.getElementById("remainingStatus").textContent = "Not started";
  state.activeSessionId = null;
  state.pendingStartTime = null;
  uiState.isOverrun = false;
  saveState();
}

function finishSession() {
  const session = getActiveSession();
  if (!session) {
    alert("No active session to finish.");
    return;
  }
  session.status = "finished";
  clearAllItemTimers();
  clearInterval(timerInterval);
  timerInterval = null;
  saveState();
  renderSummary(session);
  renderHistory();
  alert("Session marked as finished.");
}

function getActiveSession() {
  if (!state.activeSessionId) return null;
  return state.sessions.find((s) => s.id === state.activeSessionId) || null;
}

function restoreActiveSession() {
  const session = getActiveSession();
  if (session) {
    startTimer(session.startTime || session.startISO);
    renderChecklist(session);
    renderSummary(session, { silent: true });
    document.getElementById(
      "startTimeDisplay"
    ).textContent = `Start time — ${new Date(session.startTime || session.startISO).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
    return;
  }
  if (state.pendingStartTime) {
    startTimer(state.pendingStartTime);
    document.getElementById(
      "startTimeDisplay"
    ).textContent = `Start time — ${new Date(state.pendingStartTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  }
}

function renderHistory() {
  const wrap = document.getElementById("historyList");
  if (!wrap) return;
  const search = document.getElementById("historySearch").value.toLowerCase();
  const clientFilter = document.getElementById("historyClientFilter").value;
  const sessions = [...state.sessions].sort(
    (a, b) =>
      new Date(b.startTime || b.startISO || 0) -
      new Date(a.startTime || a.startISO || 0)
  );
  const filtered = sessions.filter((s) => {
    const matchesClient = clientFilter ? s.clientName === clientFilter : true;
    const haystack = `${s.clientName} ${s.goals?.join(" ") || ""}`.toLowerCase();
    const matchesSearch = search ? haystack.includes(search) : true;
    return matchesClient && matchesSearch;
  });
  if (!filtered.length) {
    wrap.classList.add("muted");
    wrap.innerHTML = "No past sessions yet.";
    return;
  }
  wrap.classList.remove("muted");
  wrap.innerHTML = "";
  filtered.forEach((s) => {
    const card = document.createElement("div");
    card.className = "history-card";
    const dateStr = formatDateTime(s.startTime || s.startISO, s.timeZone);
    const goalsText = s.goals?.map((g) => goalLabel(g)).join(", ") || "No goals";
    const devicesText = s.devices?.map((d) => deviceLabel(d)).join(", ") || "No devices";
    card.innerHTML = `
      <div>
        <strong>${s.clientName}</strong> — ${dateStr}
        <div class="history-meta">
          <span>${s.location || "onsite"} • ${s.sessionLength || 120} mins</span>
          <span>Goals: ${goalsText}</span>
          <span>Devices: ${devicesText}</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="ghost" data-history="view" data-id="${s.id}">Open</button>
        <button class="ghost" data-history="duplicate" data-id="${s.id}">Duplicate</button>
      </div>
    `;
    wrap.appendChild(card);
  });
  wrap.querySelectorAll("button[data-history]").forEach((btn) => {
    btn.onclick = (e) => {
      const action = e.target.dataset.history;
      const id = e.target.dataset.id;
      const session = state.sessions.find((sess) => sess.id === id);
      if (!session) return;
      if (action === "view") {
        state.activeSessionId = session.id;
        saveState();
        renderChecklist(session);
        renderSummary(session);
        startTimer(session.startTime || session.startISO);
      }
      if (action === "duplicate") {
        const duplicate = {
          ...session,
          id: "sess-" + Date.now(),
          startTime: new Date().toISOString(),
          items: session.items.map((i, idx) => ({
            ...normalizeItemShape({ ...i }),
            id: `${i.moduleId}-${idx}`,
            status: "pending",
            notes: [],
            flagged: false,
            invoice: null,
            timeSpentMs: 0,
            timerStart: null
          }))
        };
        state.sessions.push(duplicate);
        state.activeSessionId = duplicate.id;
        saveState();
        renderChecklist(duplicate);
        renderSummary(duplicate);
        startTimer(duplicate.startTime);
        renderHistory();
      }
    };
  });
  renderMetrics();
}

// Reports: compute aggregates and render simple dashboard
function computeReports(rangeDays) {
  const now = Date.now();
  const cutoff = rangeDays ? now - rangeDays * 24 * 60 * 60 * 1000 : 0;
  const sessions = (state.sessions || []).filter((s) => {
    const t = new Date(s.startTime || s.startISO || 0).getTime() || 0;
    return t >= cutoff;
  });
  const total = sessions.length;
  const avgLength = total ? Math.round(sessions.reduce((a, b) => a + (b.sessionLength || 0), 0) / total) : 0;
  const goalsCount = {};
  const devicesCount = {};
  const flaggedCount = {};
  sessions.forEach((s) => {
    (s.goals || []).forEach((g) => (goalsCount[g] = (goalsCount[g] || 0) + 1));
    (s.devices || []).forEach((d) => (devicesCount[d] = (devicesCount[d] || 0) + 1));
    (s.items || []).forEach((i) => {
      if (i.flagged) flaggedCount[i.step] = (flaggedCount[i.step] || 0) + 1;
    });
  });
  const topGoals = Object.entries(goalsCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topDevices = Object.entries(devicesCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return { total, avgLength, topGoals, topDevices, flaggedCount };
}

function renderReports() {
  const range = document.getElementById("reportRange").value;
  const days = range === "all" ? 0 : parseInt(range, 10) || 0;
  const data = computeReports(days);
  const wrap = document.getElementById("reportsContent");
  if (!wrap) return;
  if (!data.total) {
    wrap.classList.add("muted");
    wrap.innerHTML = "No sessions in the selected range.";
    return;
  }
  wrap.classList.remove("muted");
  wrap.innerHTML = `
    <div class="history-meta">
      <span>Total sessions: <strong>${data.total}</strong></span>
      <span>Avg length: <strong>${data.avgLength} mins</strong></span>
    </div>
    <h4>Top Goals</h4>
    <ul>${data.topGoals.map((g) => `<li>${goalLabel(g[0])} — ${g[1]}</li>`).join("")}</ul>
    <h4>Top Devices</h4>
    <ul>${data.topDevices.map((d) => `<li>${deviceLabel(d[0])} — ${d[1]}</li>`).join("")}</ul>
  `;
}

function exportReportsCsv() {
  const range = document.getElementById("reportRange").value;
  const days = range === "all" ? 0 : parseInt(range, 10) || 0;
  const data = computeReports(days);
  const rows = [];
  rows.push(["Metric","Value"].join(","));
  rows.push(["Total sessions", data.total].join(","));
  rows.push(["Avg length (mins)", data.avgLength].join(","));
  rows.push([]);
  rows.push(["Top goals","Count"].join(","));
  data.topGoals.forEach((g) => rows.push([goalLabel(g[0]), g[1]].join(",")));
  rows.push([]);
  rows.push(["Top devices","Count"].join(","));
  data.topDevices.forEach((d) => rows.push([deviceLabel(d[0]), d[1]].join(",")));
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `parristech-reports-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// CSV helpers for sessions & clients
function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function exportSessionsCsv() {
  const rows = [];
  rows.push(["id","clientName","startTime","sessionLength","location","devices","goals","modules","itemsCount","flaggedCount","notes"].join(","));
  (state.sessions || []).forEach((s) => {
    const devices = (s.devices || []).join('|');
    const goals = (s.goals || []).join('|');
    const modules = (s.modules || []).map((m) => m.id || m).join('|');
    const itemsCount = (s.items || []).length;
    const flaggedCount = (s.items || []).filter((i) => i.flagged).length;
    const notes = (s.notes || []).join(' || ');
    rows.push([
      csvEscape(s.id),
      csvEscape(s.clientName),
      csvEscape(s.startTime || s.startISO || ''),
      csvEscape(s.sessionLength || ''),
      csvEscape(s.location || ''),
      csvEscape(devices),
      csvEscape(goals),
      csvEscape(modules),
      csvEscape(itemsCount),
      csvEscape(flaggedCount),
      csvEscape(notes)
    ].join(","));
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parristech-sessions-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportClientsCsv() {
  const rows = [];
  rows.push(["name","contact","devicesOwned","pastIssues"].join(","));
  (state.clients || []).forEach((name) => {
    const p = getClientProfile(name) || {};
    rows.push([
      csvEscape(name),
      csvEscape(p.contact || ''),
      csvEscape(p.devicesOwned || ''),
      csvEscape(p.pastIssues || '')
    ].join(","));
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parristech-clients-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  // Basic CSV parser that handles quoted fields with double quotes
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const rows = [];
  lines.forEach((line) => {
    const vals = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i+1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
        } else { cur += ch; }
      } else {
        if (ch === ',') { vals.push(cur); cur = ''; }
        else if (ch === '"') { inQuotes = true; }
        else { cur += ch; }
      }
    }
    vals.push(cur);
    rows.push(vals);
  });
  return rows;
}

function importClientsCsv(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const rows = parseCsv(String(reader.result || ''));
      if (!rows.length) throw new Error('Empty CSV');
      const headers = rows[0].map((h) => String(h || '').trim().toLowerCase());
      const nameIdx = headers.indexOf('name');
      const contactIdx = headers.indexOf('contact');
      const devicesIdx = headers.indexOf('devicesowned');
      const notesIdx = headers.indexOf('pastissues');
      if (nameIdx === -1) throw new Error('CSV missing "name" column');
      let imported = 0;
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const name = (r[nameIdx] || '').trim();
        if (!name) continue;
        if (!state.clients.includes(name)) state.clients.push(name);
        const profile = ensureClientProfile(name);
        if (contactIdx >= 0) profile.contact = (r[contactIdx] || '').trim();
        if (devicesIdx >= 0) profile.devicesOwned = (r[devicesIdx] || '').trim();
        if (notesIdx >= 0) profile.pastIssues = (r[notesIdx] || '').trim();
        imported++;
      }
      saveState();
      renderClientOptions();
      renderClientList();
      alert(`Imported ${imported} clients`);
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}

function parseCsv(input) {
  return String(input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function handleAddRule() {
  const id = document.getElementById("ruleId").value.trim() || `mod-${Date.now()}`;
  const title = document.getElementById("ruleTitle").value.trim() || id;
  const devicesInput = parseCsv(document.getElementById("ruleDevices").value);
  const goalsInput = parseCsv(document.getElementById("ruleGoals").value);
  const timebox = document.getElementById("ruleTimebox").value.trim() || "";
  const riskNote = document.getElementById("ruleRisk").value.trim();
  const quickQuestions = document
    .getElementById("ruleQuestions")
    .value.split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const steps = document
    .getElementById("ruleSteps")
    .value.split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const module = {
    id,
    title,
    devices: devicesInput,
    goals: goalsInput,
    timebox,
    riskNote,
    quickQuestions,
    steps
  };
  state.settings.customModules.push(module);
  saveState();
  rules = [...(rules || []), module];
  renderCustomRules();
  alert("Module added. Rebuild a checklist to include it.");
}

function handleAddFollowUp() {
  const session = getActiveSession();
  if (!session) {
    alert("Start a session first.");
    return;
  }
  const title = document.getElementById("followTitle").value.trim();
  const due = document.getElementById("followDue").value;
  const notes = document.getElementById("followNotes").value.trim();
  if (!title) {
    alert("Follow-up title is required.");
    return;
  }
  session.followUps = session.followUps || [];
  session.followUps.push({ title, due, notes });
  saveState();
  renderFollowUps(session);
  document.getElementById("followTitle").value = "";
  document.getElementById("followDue").value = "";
  document.getElementById("followNotes").value = "";
}

function renderFollowUps(session) {
  const wrap = document.getElementById("followList");
  if (!wrap) return;
  const followUps = session?.followUps || [];
  if (!followUps.length) {
    wrap.classList.add("muted");
    wrap.textContent = "No follow-ups yet.";
    return;
  }
  wrap.classList.remove("muted");
  wrap.innerHTML = "";
  followUps.forEach((f, idx) => {
      const card = document.createElement("div");
      card.className = "history-card";
      card.innerHTML = `
        <div>
          <strong>${escapeHtml(f.title)}</strong>
          <div class="history-meta">
            <span>${f.due ? formatDateTime(f.due, session.timeZone) : "No due date"}</span>
            ${f.notes ? `<span>${escapeHtml(f.notes)}</span>` : ""}
          </div>
        </div>
        <div class="history-actions">
          <button class="ghost" data-follow="delete" data-idx="${idx}">Delete</button>
      </div>
    `;
    wrap.appendChild(card);
  });
  wrap.querySelectorAll("[data-follow='delete']").forEach((btn) => {
    btn.onclick = (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      if (!Number.isInteger(idx)) return;
      session.followUps.splice(idx, 1);
      saveState();
      renderFollowUps(session);
    };
  });
}

function exportFollowUpsIcs() {
  const session = getActiveSession();
  if (!session || !session.followUps || !session.followUps.length) {
    alert("No follow-ups to export for the active session.");
    return;
  }
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ParrisTechApp//FollowUps//EN"
  ];
  session.followUps.forEach((f, idx) => {
    const dt = f.due ? new Date(f.due) : null;
    const dtStr = dt
      ? dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      : null;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${session.id}-${idx}@parristechapp`);
    if (dtStr) lines.push(`DTSTART:${dtStr}`);
    lines.push(`SUMMARY:${escapeICS(f.title)}`);
    if (f.notes) lines.push(`DESCRIPTION:${escapeICS(f.notes)}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `parristech-followups-${session.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function generateEmailDraft() {
  const session = getActiveSession();
  if (!session) {
    alert("No active session.");
    return;
  }
  const followUps = session.followUps || [];
  const doneItems = session.items.filter((i) => i.status === "done");
  const parts = [];
  parts.push(`Hi ${session.clientName || ""},`);
  parts.push("");
  parts.push("Thanks for the session today. Summary:");
  doneItems.slice(0, 5).forEach((i) => parts.push(`- ${i.step}`));
  if (followUps.length) {
    parts.push("");
    parts.push("Follow-ups:");
    followUps.forEach((f) =>
      parts.push(
        `- ${f.title}${f.due ? ` (due ${formatDateTime(f.due, session.timeZone)})` : ""}${f.notes ? ` — ${f.notes}` : ""}`
      )
    );
  }
  const draft = parts.join("\n");
  const box = document.getElementById("emailDraft");
  const pre = document.getElementById("emailDraftText");
  if (box && pre) {
    pre.textContent = draft;
    box.style.display = "block";
  }
}

function renderCustomRules() {
  const wrap = document.getElementById("customRulesList");
  if (!wrap) return;
  const modules = state.settings.customModules || [];
  if (!modules.length) {
    wrap.classList.add("muted");
    wrap.textContent = "No custom modules yet.";
    return;
  }
  wrap.classList.remove("muted");
  wrap.innerHTML = "";
  modules.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "history-card";
    const devicesText = m.devices?.join(", ") || "Any";
    const goalsText = m.goals?.join(", ") || "Any";
    card.innerHTML = `
      <div>
        <strong>${m.title}</strong> (${m.id})
        <div class="history-meta">
          <span>Devices: ${devicesText}</span>
          <span>Goals: ${goalsText}</span>
          <span>Timebox: ${m.timebox || "—"}</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="ghost" data-custom-delete="${idx}">Delete</button>
      </div>
    `;
    wrap.appendChild(card);
  });
  wrap.querySelectorAll("[data-custom-delete]").forEach((btn) => {
    btn.onclick = (e) => {
      const idx = parseInt(e.target.dataset.customDelete, 10);
      if (Number.isInteger(idx)) {
        state.settings.customModules.splice(idx, 1);
        saveState();
        renderCustomRules();
        rules = [...embedRules(), ...(state.settings.customModules || [])];
        rulesLoaded = true;
      }
    };
  });
}

// Build a simple, print-friendly HTML summary for a session
function buildSummaryHtml(session) {
  if (!session) return `<!doctype html><html><body><p>No session</p></body></html>`;
  const clientFacing = Boolean(document.getElementById("clientModeToggle")?.checked);
  const doneItems = (session.items || []).filter((i) => i.status === "done");
  const flagged = (session.items || []).filter((i) => i.flagged);
  const remaining = (session.items || []).filter((i) => i.status !== "done");
  // For client-facing output, omit internal notes/flags — only display the step text
  const whatWeDid = doneItems.length
    ? `<ul>${doneItems
        .map((i) => `<li>${escapeHtml(i.step)}</li>`)
        .join("")}</ul>`
    : `<p>Work in progress — no completed steps yet.</p>`;
  const followUpsHtml = (session.followUps || []).length
    ? `<h4>Follow-ups</h4><ul>${(session.followUps || [])
        .map((f) => `<li>${escapeHtml(f.title)}${f.due ? ` — due ${escapeHtml(f.due)}` : ""}${!clientFacing && f.notes ? ` (${escapeHtml(f.notes)})` : ""}</li>`)
        .join("")}</ul>`
    : "";
  const consentLine = session.consentCaptured
    ? `Consent captured from ${escapeHtml(session.consentName || "client")} at ${formatDateTime(
        session.consentCapturedAt || session.startTime || session.startISO,
        session.timeZone
      )}`
    : "Consent not captured.";
  const riskLine = session.riskNote ? escapeHtml(session.riskNote) : "No risk/consent notes.";
  const riskHtml = `<h4>Risk / Consent</h4><ul><li>${riskLine}</li><li>${consentLine}</li></ul>`;
  const invoiceLines = session.invoiceLines && session.invoiceLines.length
    ? `<h4>Invoice</h4><ul>${session.invoiceLines.map((l) => `<li>${escapeHtml(l.description)} — $${(l.amount||0).toFixed(2)}</li>`).join("")}</ul>`
    : "";
  const intro = escapeHtml((document.getElementById("summaryIntro")?.value) || "");
  const outro = escapeHtml((document.getElementById("summaryOutro")?.value) || "");

  const logoFallback = "https://media.licdn.com/dms/image/v2/D4D03AQGfHHrHga4kOw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1672569901125?e=2147483647&v=beta&t=CXXswp_NGVrloLcStRln-TQxiqgtVxtrz60BVulRBpA";

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>ParrisTechApp — Summary</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:20px}
        .wrap{max-width:800px;margin:0 auto}
        header{display:flex;align-items:center;gap:16px;border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:18px}
        header img{height:56px}
        h1{font-size:20px;margin:0}
        h2{font-size:16px;margin-top:8px}
        ul{margin:8px 0 16px 20px}
        .meta{color:#444;font-size:13px}
        @media print{body{margin:6mm} .no-print{display:none}}
      </style>
    </head>
    <body>
      <div class="wrap">
        <header>
          <img src="assets/logo.svg" alt="ParrisTechApp" onerror="this.onerror=null;this.src='${logoFallback}'" />
          <div>
            <h1>ParrisTechApp — Visit Summary</h1>
            <div class="meta">${escapeHtml(session.clientName || "Client")} — ${formatDateTime(session.startTime || session.startISO || Date.now(), session.timeZone)}</div>
          </div>
        </header>

        ${intro ? `<p>${intro}</p>` : ""}

        <h2>Details</h2>
        <p class="meta">Location: ${escapeHtml(session.location || "")} • Planned: ${escapeHtml(String(session.sessionLength || ""))} mins</p>
        ${profileContactLine(session.clientName)}

        <h2>What we did</h2>
        ${whatWeDid}

        ${followUpsHtml}

        ${riskHtml}

        ${invoiceLines}

        ${outro ? `<p>${outro}</p>` : ""}

        <hr />
        <p class="meta">Generated by ParrisTechApp — ${new Date().toLocaleString()}</p>
      </div>
    </body>
  </html>`;
}

// Open a print-friendly window for a session and trigger the browser print dialog
function exportSummaryPDF(sessionId) {
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) {
    alert("Session not found for printing.");
    return;
  }
  const html = buildSummaryHtml(session);
  const w = window.open('', '_blank', 'noopener');
  if (!w) {
    alert('Unable to open print window — please allow popups for this site.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  // Give the browser a moment to load images and fonts, then trigger print
  setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch (e) {
      console.warn('Print failed', e);
    }
  }, 500);
}

// Build a print-friendly invoice HTML for a session
function buildInvoiceHtml(session) {
  if (!session) return '<!doctype html><html><body><p>No session</p></body></html>';
  const logoFallback = 'https://media.licdn.com/dms/image/v2/D4D03AQGfHHrHga4kOw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1672569901125?e=2147483647&v=beta&t=CXXswp_NGVrloLcStRln-TQxiqgtVxtrz60BVulRBpA';
  const lines = (session.items || [])
    .filter((i) => i.invoice)
    .map((i) => ({
      desc: typeof i.invoice === 'object' ? (i.invoice.desc || '') : i.invoice,
      amount: parseInvoiceAmount(i.invoice)
    }));
  const subtotal = lines.reduce((s, l) => s + (l.amount || 0), 0);
  const applyTax = Boolean(document.getElementById('taxToggle')?.checked);
  const tax = applyTax ? +(subtotal * 0.1) : 0;
  const total = subtotal + tax;

  const invoiceNumber = session.id || `INV-${Date.now()}`;
  const dateStr = formatDateTime(session.startTime || session.startISO || new Date().toISOString(), session.timeZone);

  const lineRows = lines.length
    ? lines.map((l) => `<tr><td>${escapeHtml(l.desc)}</td><td style="text-align:right">$${(l.amount||0).toFixed(2)}</td></tr>`).join('')
    : '<tr><td colspan="2">No billable items</td></tr>';

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Invoice ${escapeHtml(invoiceNumber)}</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:20px}
        .wrap{max-width:800px;margin:0 auto}
        header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:18px}
        header img{height:56px}
        h1{font-size:20px;margin:0}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        td,th{padding:8px;border-bottom:1px solid #eee}
        .right{text-align:right}
        .totals td{border-top:2px solid #ddd}
        @media print{body{margin:6mm} .no-print{display:none}}
      </style>
    </head>
    <body>
      <div class="wrap">
        <header>
          <div style="display:flex;align-items:center;gap:12px">
            <img src="assets/logo.svg" alt="ParrisTechApp" onerror="this.onerror=null;this.src='${logoFallback}'" />
            <div>
              <h1>ParrisTechApp</h1>
              <div class="meta">Invoice for ${escapeHtml(session.clientName || 'Client')}</div>
            </div>
          </div>
          <div class="meta right">
            <div>Invoice: <strong>${escapeHtml(invoiceNumber)}</strong></div>
            <div>Date: ${escapeHtml(dateStr)}</div>
            <div>Location: ${escapeHtml(session.location || '')}</div>
          </div>
        </header>

        <section>
          <h2>Invoice lines</h2>
          <table>
            <thead>
              <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
            </thead>
            <tbody>
              ${lineRows}
            </tbody>
            <tfoot class="totals">
              <tr><td style="text-align:right">Subtotal</td><td style="text-align:right">$${subtotal.toFixed(2)}</td></tr>
              <tr><td style="text-align:right">Tax (10%)</td><td style="text-align:right">$${tax.toFixed(2)}</td></tr>
              <tr><td style="text-align:right"><strong>Total</strong></td><td style="text-align:right"><strong>$${total.toFixed(2)}</strong></td></tr>
            </tfoot>
          </table>
        </section>

        <section style="margin-top:18px">
          <p>Payment terms: Please pay within 14 days. Thank you for your business.</p>
          <p class="meta">Generated by ParrisTechApp — ${new Date().toLocaleString()}</p>
        </section>
      </div>
    </body>
  </html>`;
}

// Open a print-friendly invoice window and trigger print for the session
function exportInvoicePDF(sessionId) {
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) {
    alert('Session not found for invoice export.');
    return;
  }
  const html = buildInvoiceHtml(session);
  const w = window.open('', '_blank', 'noopener');
  if (!w) return alert('Unable to open print window — allow popups for this site.');
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    try { w.focus(); w.print(); } catch (e) { console.warn('Invoice print failed', e); }
  }, 500);
}

function downloadRules() {
  const payload = { modules: [...(state.settings.customModules || []), ...embedRules()] };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rules.json";
  a.click();
  URL.revokeObjectURL(url);
}

function renderMetrics() {
  const wrap = document.getElementById("metricsBox");
  if (!wrap) return;
  const sessions = state.sessions || [];
  if (!sessions.length) {
    wrap.classList.add("muted");
    wrap.textContent = "No data yet.";
    return;
  }
  wrap.classList.remove("muted");
  const totalSessions = sessions.length;
  const avgLength =
    sessions.reduce((sum, s) => sum + (parseInt(s.sessionLength || 0, 10) || 0), 0) /
    totalSessions;
  const allItems = sessions.flatMap((s) => s.items || []);
  const completion =
    allItems.length > 0
      ? Math.round(
          (allItems.filter((i) => i.status === "done").length / allItems.length) * 100
        )
      : 0;
  const goalCounts = {};
  sessions.forEach((s) => (s.goals || []).forEach((g) => (goalCounts[g] = (goalCounts[g] || 0) + 1)));
  const topGoals = Object.entries(goalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g, c]) => `${goals.find((x) => x.id === g)?.label || g} (${c})`)
    .join(", ") || "—";
  const billableCount = sessions.reduce(
    (sum, s) => sum + (s.items || []).filter((i) => i.invoice).length,
    0
  );
  // Module completion stats
  const moduleStats = {};
  allItems.forEach((item) => {
    if (!item.moduleId) return;
    const stat = (moduleStats[item.moduleId] = moduleStats[item.moduleId] || { total: 0, done: 0 });
    stat.total += 1;
    if (item.status === "done") stat.done += 1;
  });
  const topModules = Object.entries(moduleStats)
    .map(([id, stat]) => ({
      id,
      rate: stat.total ? Math.round((stat.done / stat.total) * 100) : 0,
      total: stat.total
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map((m) => `${m.id} (${m.rate}% of ${m.total})`)
    .join(", ") || "—";

  // Per-device completion rate across sessions that include the device
  const deviceStats = {};
  devices.forEach((d) => {
    const matching = sessions.filter((s) => (s.devices || []).includes(d.id));
    if (!matching.length) return;
    const percent =
      matching.reduce((sum, s) => {
        const items = s.items || [];
        const done = items.filter((i) => i.status === "done").length;
        return sum + (items.length ? done / items.length : 0);
      }, 0) / matching.length;
    deviceStats[d.label] = Math.round(percent * 100);
  });
  const deviceLines = Object.entries(deviceStats)
    .sort((a, b) => b[1] - a[1])
    .map(([label, pct]) => `${label}: ${pct}%`)
    .join(" • ") || "—";

  const goalCompletion = {};
  (state.sessions || []).forEach((s) => {
    (s.goals || []).forEach((g) => {
      const items = s.items || [];
      const pct = items.length
        ? (items.filter((i) => i.status === "done").length / items.length) * 100
        : 0;
      const entry = goalCompletion[g] || { total: 0, sum: 0 };
      entry.total += 1;
      entry.sum += pct;
      goalCompletion[g] = entry;
    });
  });
  const goalLines = Object.entries(goalCompletion)
    .map(([g, v]) => ({
      label: goals.find((x) => x.id === g)?.label || g,
      pct: v.total ? Math.round(v.sum / v.total) : 0
    }))
    .sort((a, b) => b.pct - a.pct)
    .map((g) => `${g.label}: ${g.pct}%`)
    .join(" • ") || "—";

  wrap.innerHTML = `
    <div class="history-card">
      <div>
        <strong>Sessions</strong>
        <div class="history-meta">
          <span>Total: ${totalSessions}</span>
          <span>Avg length: ${Math.round(avgLength || 0)} mins</span>
          <span>Completion: ${completion}%</span>
        </div>
        <div class="history-meta">
          <span>Top goals: ${topGoals}</span>
          <span>Billable items: ${billableCount}</span>
        </div>
        <div class="history-meta">
          <span>Modules (top 3): ${topModules}</span>
          <span>By device: ${deviceLines}</span>
        </div>
        <div class="history-meta">
          <span>By goal: ${goalLines}</span>
        </div>
      </div>
    </div>
  `;
}

// Expose Client Risk Acknowledgement, Data Import/Export, and Analytics API
window.captureClientAcknowledgement = function(sessionId, { clientName, signatureText, confirmed = true } = {}) {
  const session = (state.sessions || []).find(s => s.id === sessionId) || getActiveSession();
  if (!session) return false;
  session.clientAck = {
    clientName: clientName || session.clientName || "Client",
    signatureText: signatureText || clientName || "Confirmed",
    signedAt: new Date().toISOString(),
    confirmed: !!confirmed
  };
  saveState();
  return session.clientAck;
};

window.exportAppState = function() {
  return JSON.stringify({
    version: "1.2",
    exportedAt: new Date().toISOString(),
    state: state
  }, null, 2);
};

window.importAppState = function(jsonString, options = {}) {
  try {
    const payload = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    const data = payload.state || payload;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid state container format.");
    }
    if (!Array.isArray(data.clients) || !Array.isArray(data.sessions)) {
      throw new Error("State payload must include clients and sessions arrays.");
    }
    if (options.overwrite) {
      state.clients = data.clients;
      state.sessions = data.sessions;
      state.settings = data.settings || {};
    } else {
      state.clients = Array.from(new Set([...(state.clients || []), ...(data.clients || [])]));
      const existingIds = new Set((state.sessions || []).map(s => s.id));
      (data.sessions || []).forEach(s => {
        if (!existingIds.has(s.id)) state.sessions.push(s);
      });
      state.settings = { ...state.settings, ...(data.settings || {}) };
    }
    saveState();
    return { success: true, clients: state.clients.length, sessions: state.sessions.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

window.getAnalyticsMetrics = function() {
  const sessions = state.sessions || [];
  const totalSessions = sessions.length;
  let totalBilled = 0;
  let totalMinutes = 0;
  const deviceCounts = {};

  sessions.forEach(s => {
    totalMinutes += Number(s.sessionLength) || 0;
    (s.devices || []).forEach(d => {
      deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    });
    (s.items || []).forEach(it => {
      if (it.invoice && typeof it.invoice.amount === "number") {
        totalBilled += it.invoice.amount;
      }
    });
  });

  return {
    totalSessions,
    totalBilled: Math.round(totalBilled * 100) / 100,
    avgDurationMins: totalSessions ? Math.round(totalMinutes / totalSessions) : 0,
    deviceCounts
  };
};

