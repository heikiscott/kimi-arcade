const MIN = 1;
const MAX = 19;
const DEFAULT_COLUMN = 12;

const columnTitle = document.querySelector("#columnTitle");
const columnList = document.querySelector("#columnList");
const columnButtons = document.querySelector("#columnButtons");
const multiplicationTable = document.querySelector("#multiplicationTable");
const autoBtn = document.querySelector("#autoBtn");

let activeColumn = DEFAULT_COLUMN;
let focusRow = 1;
let autoTimer = null;

function makeRange() {
  return Array.from({ length: MAX - MIN + 1 }, (_, index) => index + MIN);
}

function renderButtons() {
  columnButtons.innerHTML = "";
  makeRange().forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `×${value}`;
    button.className = value === activeColumn ? "active" : "";
    button.addEventListener("click", () => {
      stopAuto();
      setColumn(value);
    });
    columnButtons.append(button);
  });
}

function renderColumn() {
  columnTitle.textContent = `×${activeColumn} 一列`;
  columnList.innerHTML = "";
  makeRange().forEach((left) => {
    const item = document.createElement("div");
    item.className = `column-item${left === focusRow ? " is-focus" : ""}`;
    item.textContent = `${left} × ${activeColumn} = ${left * activeColumn}`;
    columnList.append(item);
  });
}

function renderTable() {
  const rows = makeRange();
  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const corner = document.createElement("th");
  corner.textContent = "乘法";
  headerRow.append(corner);

  rows.forEach((right) => {
    const th = document.createElement("th");
    th.textContent = `×${right}`;
    headerRow.append(th);
  });
  header.append(headerRow);

  const body = document.createElement("tbody");
  rows.forEach((left) => {
    const tr = document.createElement("tr");
    const rowHead = document.createElement("td");
    rowHead.textContent = `${left}`;
    tr.append(rowHead);

    rows.forEach((right) => {
      const td = document.createElement("td");
      td.textContent = `${left}×${right}=${left * right}`;
      if (right === activeColumn) td.classList.add("active-column");
      if (right === activeColumn && left === focusRow) td.classList.add("active-cell");
      tr.append(td);
    });
    body.append(tr);
  });

  multiplicationTable.replaceChildren(header, body);
}

function setColumn(value) {
  activeColumn = value;
  focusRow = 1;
  renderButtons();
  renderColumn();
  renderTable();
}

function stepAuto() {
  focusRow += 1;
  if (focusRow > MAX) {
    focusRow = 1;
    activeColumn = activeColumn >= MAX ? MIN : activeColumn + 1;
    renderButtons();
  }
  renderColumn();
  renderTable();
}

function stopAuto() {
  if (!autoTimer) return;
  clearInterval(autoTimer);
  autoTimer = null;
  autoBtn.textContent = "自动背下一列";
  autoBtn.classList.remove("is-running");
}

autoBtn.addEventListener("click", () => {
  if (autoTimer) {
    stopAuto();
    return;
  }
  autoBtn.textContent = "停止自动背";
  autoBtn.classList.add("is-running");
  autoTimer = setInterval(stepAuto, 900);
});

setColumn(DEFAULT_COLUMN);
