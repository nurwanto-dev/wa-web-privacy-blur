(() => {
  const CLASS_BLUR = "pb-blur";
  const CLASS_REVEALED = "pb-revealed";

  const DEFAULT_CONFIG = {
    enabled: true,
    names: true,
    messages: true,
    avatars: true,
    reveal: "hover",
    siteMode: "chat",
    extraSites: []
  };

  const CHAT_SITES = [
    "web.whatsapp.com",
    "web.telegram.org",
    "discord.com",
    "web.facebook.com",
    "messenger.com"
  ];

  let config = { ...DEFAULT_CONFIG };

  const SELECTOR_GROUPS = {
    names: [
      '[class*="name"]',
      '[class*="contact"]',
      '[class*="username"]',
      '[class*="user-name"]',
      '[class*="display-name"]',
      '[class*="profile-name"]',
      '[class*="chat-title"]',
      '[class*="chat-name"]',
      '[class*="contact-name"]',
      '[class*="author"]',
      '[class*="sender"]',
      '[data-testid*="name"]',
      '[data-testid*="contact"]'
    ],
    messages: [
      '[class*="message"]',
      '[class*="bubble"]',
      '[class*="preview"]',
      '[class*="chat-preview"]',
      '[class*="copyable-text"]',
      '[class*="selectable-text"]',
      '[class*="chat-message"]',
      '[data-testid*="message"]'
    ],
    avatars: [
      '[class*="avatar"]',
      '[class*="profile-pic"]',
      '[class*="profile-image"]',
      '[class*="user-photo"]',
      'img[class*="avatar"]',
      '[data-testid*="avatar"]'
    ]
  };

  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "LINK", "META", "TITLE", "HEAD", "HTML", "BODY", "BR"
  ]);

  let styleEl = null;
  let scanQueue = new Set();
  let scanTimer = null;
  let lastFullScan = 0;

  function isChatSite() {
    const host = location.hostname.toLowerCase();
    const list = [...CHAT_SITES, ...(config.extraSites || [])];
    return list.some((s) => host === s || host.endsWith("." + s));
  }

  function isWhatsApp() {
    return location.hostname === "web.whatsapp.com";
  }

  function shouldRun() {
    return config.enabled && (config.siteMode === "all" || isChatSite());
  }

  function buildGroups() {
    const groups = {
      names: [...SELECTOR_GROUPS.names],
      messages: [...SELECTOR_GROUPS.messages],
      avatars: [...SELECTOR_GROUPS.avatars],
      containers: []
    };
    if (isWhatsApp()) {
      groups.containers = [
        '[data-testid^="list-item-"]',
        '[data-testid="message-yourself-row"]'
      ];
      groups.names.push('[data-testid="conversation-title"]');
    }
    return groups;
  }

  function buildActiveSelector(groups) {
    const parts = [];
    if (config.names) parts.push(...groups.names);
    if (config.messages) parts.push(...groups.messages);
    if (config.avatars) parts.push(...groups.avatars);
    if ((config.names || config.messages) && groups.containers.length) {
      parts.push(...groups.containers);
    }
    return parts.join(",");
  }

  function detectGroup(el, groups) {
    if (groups.containers.length && el.matches(groups.containers.join(","))) return "containers";
    if (config.names && el.matches(groups.names.join(","))) return "names";
    if (config.messages && el.matches(groups.messages.join(","))) return "messages";
    if (config.avatars && el.matches(groups.avatars.join(","))) return "avatars";
    return null;
  }

  function isEligible(el, group) {
    if (SKIP_TAGS.has(el.tagName)) return false;
    if (el.isContentEditable) return false;
    if (el.closest("input, textarea, select")) return false;

    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 && h === 0) return false;
    if (w > 1200 && h > 500) return false;

    if (group === "names" || group === "messages") {
      const text = (el.textContent || "").trim();
      if (!text) return false;
      if (text.length > 3000) return false;
      if (group === "names" && text.length > 200) return false;
    }

    return true;
  }

  function runScanOn(root) {
    if (!shouldRun()) return;
    if (root.nodeType !== 1) return;

    const groups = buildGroups();
    const selector = buildActiveSelector(groups);
    if (!selector) return;

    const candidates = [root, ...root.querySelectorAll(selector)];
    for (const el of candidates) {
      if (!el.classList || el.classList.contains(CLASS_BLUR)) continue;
      const group = detectGroup(el, groups);
      if (!group) continue;
      if (!isEligible(el, group)) continue;
      el.classList.add(CLASS_BLUR);
    }
  }

  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = null;
      const roots = [...scanQueue];
      scanQueue.clear();
      roots.forEach(runScanOn);
    }, 200);
  }

  function queueScan(root) {
    if (!shouldRun()) return;
    scanQueue.add(root);
    scheduleScan();
  }

  function scheduleFullScan() {
    const now = Date.now();
    if (now - lastFullScan < 600) return;
    lastFullScan = now;
    runScanOn(document.documentElement);
  }

  function resetAndScan() {
    document.querySelectorAll("." + CLASS_BLUR).forEach((el) => {
      el.classList.remove(CLASS_BLUR, CLASS_REVEALED);
    });
    runScanOn(document.documentElement);
  }

  function isBlurred(el) {
    return !!(el && el.nodeType === 1 && el.classList && el.classList.contains(CLASS_BLUR));
  }

  function withinBlurred(el) {
    if (!el) return false;
    let node = el;
    while (node && node !== document) {
      if (isBlurred(node)) return true;
      node = node.parentElement;
    }
    return false;
  }

  function revealChain(el) {
    let node = el;
    while (node && node !== document) {
      if (isBlurred(node)) node.classList.add(CLASS_REVEALED);
      node = node.parentElement;
    }
  }

  function clearRevealed() {
    document.querySelectorAll("." + CLASS_REVEALED).forEach((n) => {
      n.classList.remove(CLASS_REVEALED);
    });
  }

  function buildCss() {
    return `
      .${CLASS_BLUR} {
        filter: blur(8px) !important;
        -webkit-filter: blur(8px) !important;
        transition: filter 0.18s ease !important;
      }
      .${CLASS_BLUR}.${CLASS_REVEALED},
      .${CLASS_BLUR}.${CLASS_REVEALED} * {
        filter: none !important;
        -webkit-filter: none !important;
      }
    `;
  }

  function syncStyles() {
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "pb-style";
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = buildCss();
  }

  function handleMouseOver(e) {
    if (!config.enabled || config.reveal !== "hover") return;
    if (withinBlurred(e.target)) revealChain(e.target);
  }

  function handleMouseOut(e) {
    if (!config.enabled || config.reveal !== "hover") return;
    if (!withinBlurred(e.relatedTarget)) clearRevealed();
  }

  function handleClick(e) {
    if (!config.enabled || config.reveal !== "click") return;
    let el = e.target;
    while (el && el !== document) {
      if (isBlurred(el)) {
        const wasOn = el.classList.contains(CLASS_REVEALED);
        clearRevealed();
        if (!wasOn) revealChain(e.target);
        return;
      }
      el = el.parentElement;
    }
  }

  function loadConfig(cb) {
    chrome.storage.sync.get(DEFAULT_CONFIG, (cfg) => {
      if (chrome.runtime.lastError) cfg = DEFAULT_CONFIG;
      config = { ...DEFAULT_CONFIG, ...cfg };
      cb();
    });
  }

  loadConfig(() => {
    syncStyles();
    resetAndScan();

    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);
    document.addEventListener("click", handleClick);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1) queueScan(n);
        }
      }
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });

    setInterval(() => {
      if (document.hidden) return;
      scheduleFullScan();
    }, 1200);

    document.addEventListener("scroll", scheduleFullScan, {
      capture: true,
      passive: true
    });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    loadConfig(() => {
      syncStyles();
      resetAndScan();
    });
  });
})();
