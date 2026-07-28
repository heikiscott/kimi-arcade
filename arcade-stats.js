(function () {
  const statsKey = "kimiArcadeGlobalStatsV1";
  const playerKey = "kimiArcadeGlobalPlayerId";
  const accountKey = "kimiArcadeAccountV1";
  const pendingKey = "kimiArcadePendingGame";

  function getPlayerId() {
    try {
      let id = localStorage.getItem(playerKey);
      if (!id) {
        id = `arcade-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem(playerKey, id);
      }
      return id;
    } catch {
      return "arcade-private";
    }
  }

  function defaultStats() {
    return {
      playerId: getPlayerId(),
      hallVisits: 0,
      totalGameOpens: 0,
      uniqueGames: {},
      playLog: [],
      firstPlayedAt: "",
      lastPlayedAt: "",
      lastGame: ""
    };
  }

  function loadStats() {
    try {
      return { ...defaultStats(), ...JSON.parse(localStorage.getItem(statsKey) || "{}") };
    } catch {
      return defaultStats();
    }
  }

  function saveStats(stats) {
    try {
      localStorage.setItem(statsKey, JSON.stringify(stats));
    } catch {
      // Private browsers may block localStorage; the game still works.
    }
  }

  function shortId(id) {
    return (id || "local").split("-").slice(-1)[0] || "local";
  }

  function defaultAccount() {
    return {
      method: "guest",
      value: "",
      displayName: "游客试玩",
      createdAt: "",
      lastLoginAt: ""
    };
  }

  function loadAccount() {
    try {
      return { ...defaultAccount(), ...JSON.parse(localStorage.getItem(accountKey) || "{}") };
    } catch {
      return defaultAccount();
    }
  }

  function saveAccount(account) {
    try {
      localStorage.setItem(accountKey, JSON.stringify(account));
    } catch {
      // If localStorage is unavailable, keep the page playable as a guest.
    }
  }

  function maskValue(method, value) {
    const clean = String(value || "").trim();
    if (!clean) return "游客试玩";
    if (method === "phone") {
      const digits = clean.replace(/\D/g, "");
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
    }
    if (method === "email") {
      const [name, domain] = clean.split("@");
      if (!domain) return clean;
      return `${name.slice(0, 2)}***@${domain}`;
    }
    return clean;
  }

  function methodName(method) {
    if (method === "phone") return "手机";
    if (method === "email") return "邮箱";
    if (method === "name") return "自取名";
    return "游客";
  }

  function accountText(account = loadAccount()) {
    return `当前：${methodName(account.method)}账号 ${maskValue(account.method, account.value || account.displayName)}`;
  }

  function normalizeAccount(mode, value) {
    const clean = String(value || "").trim();
    if (mode === "phone") {
      const digits = clean.replace(/\D/g, "");
      if (digits.length < 5) return { ok: false, message: "手机号太短啦，再检查一下。" };
      return { ok: true, value: digits, displayName: maskValue("phone", digits) };
    }
    if (mode === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false, message: "邮箱格式不对，要像 name@example.com。" };
      return { ok: true, value: clean, displayName: maskValue("email", clean) };
    }
    if (clean.length < 1) return { ok: false, message: "自己注册要先写一个名字。" };
    return { ok: true, value: clean.slice(0, 18), displayName: clean.slice(0, 18) };
  }

  function pageFile() {
    const file = location.pathname.split("/").pop() || "arcade.html";
    return file.split("?")[0].split("#")[0] || "arcade.html";
  }

  function isArcadePage() {
    return Boolean(document.querySelector(".arcade-shell .game-grid"));
  }

  function gameNameFromPage() {
    const pending = readPendingGame();
    if (pending && Date.now() - pending.time < 8000) return pending.name;
    const h1 = document.querySelector("h1")?.textContent?.trim();
    const strong = document.querySelector(".game-title strong, .hero strong")?.textContent?.trim();
    const title = document.title?.replace(/ · .*/, "").trim();
    return h1 || strong || title || pageFile().replace(/\.html$/, "");
  }

  function readPendingGame() {
    try {
      return JSON.parse(sessionStorage.getItem(pendingKey) || "null");
    } catch {
      return null;
    }
  }

  function clearPendingGame() {
    try {
      sessionStorage.removeItem(pendingKey);
    } catch {
      // Ignore unavailable sessionStorage.
    }
  }

  function sendSharedEvent(name, props = {}) {
    if (window.goatcounter?.count) {
      window.goatcounter.count({
        path: `/arcade/${name}/${encodeURIComponent(props.game || "hall")}`,
        title: `小游戏大厅 ${name} ${props.game || "hall"}`,
        event: true
      });
    }
  }

  function recordHallVisit() {
    const stats = loadStats();
    stats.hallVisits += 1;
    saveStats(stats);
    sendSharedEvent("hall-visit");
    return stats;
  }

  function recordGameOpen(name) {
    const stats = loadStats();
    const game = name || gameNameFromPage();
    stats.totalGameOpens += 1;
    stats.uniqueGames[game] = (stats.uniqueGames[game] || 0) + 1;
    stats.lastGame = game;
    stats.lastPlayedAt = new Date().toISOString();
    if (!stats.firstPlayedAt) stats.firstPlayedAt = stats.lastPlayedAt;
    stats.playLog = [{ game, at: stats.lastPlayedAt }, ...(stats.playLog || [])].slice(0, 12);
    saveStats(stats);
    clearPendingGame();
    sendSharedEvent("game-open", { game });
    return stats;
  }

  function summaryText() {
    const stats = loadStats();
    const account = loadAccount();
    const uniqueCount = Object.keys(stats.uniqueGames || {}).length;
    const top = Object.entries(stats.uniqueGames || {}).sort((a, b) => b[1] - a[1])[0];
    const topText = top ? `${top[0]} ${top[1]} 次` : "还没有";
    const played = stats.totalGameOpens > 0 ? "已经至少玩过 1 个游戏" : "还没有点进任何游戏";
    return `${accountText(account)}。这台设备访问大厅 ${stats.hallVisits} 次，打开游戏 ${stats.totalGameOpens} 次，玩过 ${uniqueCount} 种游戏，${played}。玩家编号：${shortId(stats.playerId)}。最常玩：${topText}。公开总人数需要接 GoatCounter 或 Google Analytics 这类统计服务，GitHub Pages 自己不能保存所有手机的总数据库。`;
  }

  function renderRecords() {
    const text = document.querySelector("#arcadeGlobalRecordsText");
    if (text) text.textContent = summaryText();
    const accountStatus = document.querySelector("#arcadeAccountStatus");
    if (accountStatus) accountStatus.textContent = accountText();
    const list = document.querySelector("#arcadeRecentGames");
    if (list) {
      const stats = loadStats();
      const items = (stats.playLog || []).slice(0, 5);
      list.textContent = items.length ? items.map((item) => item.game).join("、") : "还没有打开过游戏";
    }
  }

  function bindArcadeClicks() {
    document.querySelectorAll(".game-card, .hero-entry").forEach((link) => {
      link.addEventListener("click", () => {
        const name = link.querySelector("strong")?.textContent?.trim() || link.textContent.trim().split(/\s+/)[0] || link.getAttribute("href");
        try {
          sessionStorage.setItem(pendingKey, JSON.stringify({ name, href: link.getAttribute("href"), time: Date.now() }));
        } catch {
          // Ignore unavailable sessionStorage.
        }
      });
    });
    document.querySelector("#arcadeRecordsRefresh")?.addEventListener("click", renderRecords);
  }

  function bindAccountForm() {
    const form = document.querySelector("#arcadeAccountForm");
    const mode = document.querySelector("#arcadeAccountMode");
    const value = document.querySelector("#arcadeAccountValue");
    const guest = document.querySelector("#arcadeGuestLogin");
    if (!form || !mode || !value) return;

    function syncFields(clearValue = true) {
      const selected = mode.value;
      if (clearValue) value.value = "";
      if (selected === "phone") {
        value.type = "tel";
        value.autocomplete = "tel";
        value.placeholder = "输入手机号";
      } else if (selected === "email") {
        value.type = "email";
        value.autocomplete = "email";
        value.placeholder = "输入邮箱";
      } else {
        value.type = "text";
        value.autocomplete = "nickname";
        value.placeholder = "输入自己取的名字";
      }
    }

    const account = loadAccount();
    mode.value = account.method === "guest" ? "phone" : account.method;
    if (account.method !== "guest") value.value = account.value || "";

    mode.addEventListener("change", () => syncFields(true));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = normalizeAccount(mode.value, value.value);
      if (!result.ok) {
        const accountStatus = document.querySelector("#arcadeAccountStatus");
        if (accountStatus) accountStatus.textContent = result.message;
        value.focus();
        return;
      }
      const now = new Date().toISOString();
      const previousAccount = loadAccount();
      saveAccount({
        method: mode.value,
        value: result.value,
        displayName: result.displayName,
        createdAt: previousAccount.createdAt || now,
        lastLoginAt: now
      });
      renderRecords();
    });

    guest?.addEventListener("click", () => {
      saveAccount({ ...defaultAccount(), lastLoginAt: new Date().toISOString() });
      value.value = "";
      renderRecords();
    });

    syncFields(false);
  }

  function init() {
    if (isArcadePage()) {
      recordHallVisit();
      bindArcadeClicks();
      bindAccountForm();
      renderRecords();
      return;
    }
    recordGameOpen(gameNameFromPage());
  }

  window.KimiArcadeStats = {
    load: loadStats,
    loadAccount,
    recordGameOpen,
    summaryText,
    renderRecords
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
