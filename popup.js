const DEFAULT_CONFIG = {
  enabled: true,
  names: true,
  messages: true,
  avatars: true,
  reveal: "hover",
  siteMode: "chat",
  extraSites: []
};

function getEl(id) {
  return document.getElementById(id);
}

function load() {
  chrome.storage.sync.get(DEFAULT_CONFIG, (cfg) => {
    if (chrome.runtime.lastError) cfg = DEFAULT_CONFIG;
    getEl("enabled").checked = cfg.enabled !== false;
    getEl("names").checked = cfg.names !== false;
    getEl("messages").checked = cfg.messages !== false;
    getEl("avatars").checked = cfg.avatars !== false;
    getEl(cfg.reveal === "click" ? "reveal-click" : "reveal-hover").checked = true;
    getEl(cfg.siteMode === "all" ? "site-all" : "site-chat").checked = true;
  });
}

function save() {
  chrome.storage.sync.set({
    enabled: getEl("enabled").checked,
    names: getEl("names").checked,
    messages: getEl("messages").checked,
    avatars: getEl("avatars").checked,
    reveal: getEl("reveal-click").checked ? "click" : "hover",
    siteMode: getEl("site-all").checked ? "all" : "chat"
  });
}

function setStatus(text) {
  getEl("site-status").textContent = text;
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  document.querySelectorAll("input").forEach((el) => {
    el.addEventListener("change", save);
  });

  getEl("add-site").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || !tabs.length || !tabs[0].url) {
        setStatus("Tidak bisa mengakses situs saat ini.");
        return;
      }
      let host;
      try {
        host = new URL(tabs[0].url).hostname;
      } catch (e) {
        setStatus("Situs ini tidak valid.");
        return;
      }
      chrome.storage.sync.get(DEFAULT_CONFIG, (cfg) => {
        const list = cfg.extraSites || [];
        if (!list.includes(host)) list.push(host);
        chrome.storage.sync.set({ extraSites: list }, () => {
          setStatus("Ditambahkan: " + host);
        });
      });
    });
  });
});
