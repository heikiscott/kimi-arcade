(function () {
  const STORAGE_KEY = "kimiTransitPeople";
  const channels = {
    home: { label: "家里频道", url: "home-play.html" },
    mall: { label: "商场频道", url: "mall.html" },
    park: { label: "超级游乐园频道", url: "amusement.html" }
  };
  const defaultPeople = [
    { id: 1, label: "1号", location: "home" },
    { id: 2, label: "2号", location: "home" },
    { id: 3, label: "3号", location: "home" },
    { id: 4, label: "4号", location: "home" }
  ];

  function readPeople() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === 4) {
        return defaultPeople.map((person) => {
          const match = saved.find((item) => Number(item.id) === person.id);
          return {
            ...person,
            location: channels[match?.location] ? match.location : "home"
          };
        });
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return defaultPeople.map((person) => ({ ...person }));
  }

  function savePeople(people) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  }

  function getCounts() {
    return readPeople().reduce(
      (counts, person) => {
        counts[person.location] += 1;
        return counts;
      },
      { home: 0, mall: 0, park: 0 }
    );
  }

  function currentChannel() {
    const page = location.pathname.split("/").pop();
    if (page === "mall.html") return "mall";
    if (page === "amusement.html") return "park";
    return "home";
  }

  function movePerson(id, to, fromFallback) {
    const people = readPeople();
    let person = people.find((item) => item.id === id);
    if (!person || (fromFallback && person.location !== fromFallback)) {
      person = people.find((item) => item.location === fromFallback);
    }
    if (!person || !channels[to]) return null;
    person.location = to;
    savePeople(people);
    render();
    return person;
  }

  function moveOne(from, to) {
    const people = readPeople();
    const person = people.find((item) => item.location === from);
    if (!person || !channels[to]) return null;
    person.location = to;
    savePeople(people);
    render();
    return person;
  }

  function personLocation(id) {
    return readPeople().find((person) => person.id === id)?.location || "home";
  }

  function count(channel) {
    return getCounts()[channel] || 0;
  }

  function render() {
    let shell = document.querySelector(".channel-switcher");
    if (!shell) {
      shell = document.createElement("nav");
      shell.className = "channel-switcher";
      shell.setAttribute("aria-label", "频道切换");
      document.body.prepend(shell);
    }
    const counts = getCounts();
    const active = currentChannel();
    shell.innerHTML = `
      <strong>频道切换 · 人数跟着地铁走</strong>
      <div class="channel-row">
        ${Object.entries(channels).map(([key, channel]) => `
          <a class="channel-link ${key === active ? "active" : ""}" href="${channel.url}">
            <em>${channel.label}</em>
            <span>${counts[key]} 人</span>
          </a>
        `).join("")}
      </div>
      <button class="channel-reset" type="button">重置：4 人回家</button>
    `;
    shell.querySelector(".channel-reset").addEventListener("click", () => {
      savePeople(defaultPeople.map((person) => ({ ...person })));
      render();
      window.dispatchEvent(new CustomEvent("transitchange"));
    });
  }

  window.TransitChannel = {
    channels,
    count,
    currentChannel,
    getCounts,
    moveOne,
    movePerson,
    personLocation,
    readPeople,
    render
  };

  render();
})();
