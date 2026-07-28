(function () {
  const statsKey = "kimiArcadeGlobalStatsV1";
  const playerKey = "kimiArcadeGlobalPlayerId";
  const accountKey = "kimiArcadeCurrentVisitorV1";
  const visitorsKey = "kimiArcadeVisitorsV1";
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
      method: "visitor",
      value: "游客试玩",
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

  function accountText(account = loadAccount()) {
    return `当前访客：${account.displayName || account.value || "游客试玩"}`;
  }

  function normalizeVisitor(value) {
    const clean = String(value || "").trim();
    if (clean.length < 1) return { ok: false, message: "先输入访客名字。" };
    return { ok: true, value: clean.slice(0, 18), displayName: clean.slice(0, 18) };
  }

  function visitorId(name) {
    return String(name || "游客试玩").trim().toLowerCase().replace(/\s+/g, "-").slice(0, 32) || "guest";
  }

  function defaultVisitors() {
    return {};
  }

  function loadVisitors() {
    try {
      return { ...defaultVisitors(), ...JSON.parse(localStorage.getItem(visitorsKey) || "{}") };
    } catch {
      return defaultVisitors();
    }
  }

  function saveVisitors(visitors) {
    try {
      localStorage.setItem(visitorsKey, JSON.stringify(visitors));
    } catch {
      // Keep playing even if private mode blocks storage.
    }
  }

  function ensureVisitor(name = loadAccount().displayName) {
    const displayName = String(name || "游客试玩").trim().slice(0, 18) || "游客试玩";
    const id = visitorId(displayName);
    const visitors = loadVisitors();
    const now = new Date().toISOString();
    visitors[id] = {
      id,
      name: displayName,
      hallVisits: visitors[id]?.hallVisits || 0,
      gameOpens: visitors[id]?.gameOpens || 0,
      uniqueGames: visitors[id]?.uniqueGames || {},
      createdAt: visitors[id]?.createdAt || now,
      lastSeenAt: now
    };
    saveVisitors(visitors);
    return visitors[id];
  }

  function recordVisitor(kind, game = "") {
    const account = loadAccount();
    const visitor = ensureVisitor(account.displayName || account.value);
    const visitors = loadVisitors();
    const item = visitors[visitor.id] || visitor;
    if (kind === "hall") item.hallVisits += 1;
    if (kind === "game") {
      item.gameOpens += 1;
      item.uniqueGames[game] = (item.uniqueGames[game] || 0) + 1;
    }
    item.lastSeenAt = new Date().toISOString();
    visitors[visitor.id] = item;
    saveVisitors(visitors);
  }

  function renderVisitorTable() {
    const body = document.querySelector("#arcadeVisitorTable");
    if (!body) return;
    const visitors = Object.values(loadVisitors()).sort((a, b) => (b.gameOpens + b.hallVisits) - (a.gameOpens + a.hallVisits));
    body.innerHTML = "";
    if (!visitors.length) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="4">还没有访客记录</td>';
      body.appendChild(row);
      return;
    }
    visitors.forEach((visitor) => {
      const row = document.createElement("tr");
      const uniqueCount = Object.keys(visitor.uniqueGames || {}).length;
      [visitor.name, visitor.hallVisits, visitor.gameOpens, `${uniqueCount} 个`].forEach((cellText) => {
        const cell = document.createElement("td");
        cell.textContent = String(cellText);
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
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
    recordVisitor("hall");
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
    recordVisitor("game", game);
    clearPendingGame();
    sendSharedEvent("game-open", { game });
    return stats;
  }

  function summaryText() {
    const stats = loadStats();
    const account = loadAccount();
    const visitorCount = Object.keys(loadVisitors()).length;
    const uniqueCount = Object.keys(stats.uniqueGames || {}).length;
    const top = Object.entries(stats.uniqueGames || {}).sort((a, b) => b[1] - a[1])[0];
    const topText = top ? `${top[0]} ${top[1]} 次` : "还没有";
    const played = stats.totalGameOpens > 0 ? "已经至少玩过 1 个游戏" : "还没有点进任何游戏";
    return `${accountText(account)}。访客表里一共有 ${visitorCount} 个人。这台设备访问大厅 ${stats.hallVisits} 次，打开游戏 ${stats.totalGameOpens} 次，玩过 ${uniqueCount} 种游戏，${played}。玩家编号：${shortId(stats.playerId)}。最常玩：${topText}。公开总人数需要接 GoatCounter 或 Google Analytics 这类统计服务，GitHub Pages 自己不能保存所有手机的总数据库。`;
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
    renderVisitorTable();
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
    const value = document.querySelector("#arcadeAccountValue");
    const guest = document.querySelector("#arcadeGuestLogin");
    if (!form || !value) return;

    const account = loadAccount();
    if (account.displayName !== "游客试玩") value.value = account.displayName || "";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = normalizeVisitor(value.value);
      if (!result.ok) {
        const accountStatus = document.querySelector("#arcadeAccountStatus");
        if (accountStatus) accountStatus.textContent = result.message;
        value.focus();
        return;
      }
      const now = new Date().toISOString();
      const previousAccount = loadAccount();
      saveAccount({
        method: "visitor",
        value: result.value,
        displayName: result.displayName,
        createdAt: previousAccount.createdAt || now,
        lastLoginAt: now
      });
      ensureVisitor(result.displayName);
      renderRecords();
    });

    guest?.addEventListener("click", () => {
      saveAccount({ ...defaultAccount(), lastLoginAt: new Date().toISOString() });
      value.value = "";
      ensureVisitor("游客试玩");
      renderRecords();
    });
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
