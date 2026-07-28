(function () {
  const statsKey = "kimiArcadeGlobalStatsV1";
  const playerKey = "kimiArcadeGlobalPlayerId";
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
    const uniqueCount = Object.keys(stats.uniqueGames || {}).length;
    const top = Object.entries(stats.uniqueGames || {}).sort((a, b) => b[1] - a[1])[0];
    const topText = top ? `${top[0]} ${top[1]} 次` : "还没有";
    const played = stats.totalGameOpens > 0 ? "已经至少玩过 1 个游戏" : "还没有点进任何游戏";
    return `这台设备访问大厅 ${stats.hallVisits} 次，打开游戏 ${stats.totalGameOpens} 次，玩过 ${uniqueCount} 种游戏，${played}。玩家编号：${shortId(stats.playerId)}。最常玩：${topText}。公开总人数需要接 GoatCounter 或 Google Analytics 这类统计服务，GitHub Pages 自己不能保存所有手机的总数据库。`;
  }

  function renderRecords() {
    const text = document.querySelector("#arcadeGlobalRecordsText");
    if (text) text.textContent = summaryText();
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

  function init() {
    if (isArcadePage()) {
      recordHallVisit();
      bindArcadeClicks();
      renderRecords();
      return;
    }
    recordGameOpen(gameNameFromPage());
  }

  window.KimiArcadeStats = {
    load: loadStats,
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
