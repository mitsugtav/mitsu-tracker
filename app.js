const storageKey = "rpTrackerData";

const rankRanges = [
  { rank: 1, min: 0, max: 260 },
  { rank: 2, min: 260, max: 670 },
  { rank: 3, min: 670, max: 1210 },
  { rank: 4, min: 1210, max: 2425 },
  { rank: 5, min: 2425, max: 3880 },
  { rank: 6, min: 3880, max: 5770 },
  { rank: 7, min: 5770, max: 9650 },
  { rank: 8, min: 9650, max: 14280 },
  { rank: 9, min: 14280, max: Infinity }
];

const defaultData = {
  balances: { cash: 0, card: 0 },
  operations: [],
  contracts: [],
  expenses: [],
  goals: [],
  exp: 0,
  theme: "dark",
  backups: []
};

const ui = {
  cashBalance: document.getElementById("cashBalance"),
  cardBalance: document.getElementById("cardBalance"),
  totalBalance: document.getElementById("totalBalance"),
  totalBalanceChip: document.getElementById("totalBalanceChip"),
  cashStart: document.getElementById("cashStart"),
  cardStart: document.getElementById("cardStart"),
  applyBalanceButton: document.getElementById("applyBalanceButton"),
  depositAmount: document.getElementById("depositAmount"),
  depositButton: document.getElementById("depositButton"),
  incomeAmount: document.getElementById("incomeAmount"),
  incomeButton: document.getElementById("incomeButton"),
  expenseAmountQuick: document.getElementById("expenseAmountQuick"),
  expenseQuickButton: document.getElementById("expenseQuickButton"),
  operationsList: document.getElementById("operationsList"),
  operationsCount: document.getElementById("operationsCount"),
  contractAmount: document.getElementById("contractAmount"),
  contractTime: document.getElementById("contractTime"),
  contractExp: document.getElementById("contractExp"),
  contractNote: document.getElementById("contractNote"),
  addContractButton: document.getElementById("addContractButton"),
  contractsList: document.getElementById("contractsList"),
  contractsCount: document.getElementById("contractsCount"),
  rankChip: document.getElementById("rankChip"),
  currentExp: document.getElementById("currentExp"),
  expToNext: document.getElementById("expToNext"),
  rankProgress: document.getElementById("rankProgress"),
  expInput: document.getElementById("expInput"),
  rankSelect: document.getElementById("rankSelect"),
  applyRankButton: document.getElementById("applyRankButton"),
  dayIncome: document.getElementById("dayIncome"),
  weekIncome: document.getElementById("weekIncome"),
  allIncome: document.getElementById("allIncome"),
  rankIncome: document.getElementById("rankIncome"),
  rankIncomeAmount: document.getElementById("rankIncomeAmount"),
  incomeChart: document.getElementById("incomeChart"),
  chartRange: document.getElementById("chartRange"),
  expenseAmount: document.getElementById("expenseAmount"),
  expenseCategory: document.getElementById("expenseCategory"),
  expenseDate: document.getElementById("expenseDate"),
  expenseNote: document.getElementById("expenseNote"),
  addExpenseButton: document.getElementById("addExpenseButton"),
  expensesList: document.getElementById("expensesList"),
  expensesCount: document.getElementById("expensesCount"),
  goalName: document.getElementById("goalName"),
  goalTarget: document.getElementById("goalTarget"),
  goalSaved: document.getElementById("goalSaved"),
  addGoalButton: document.getElementById("addGoalButton"),
  goalsList: document.getElementById("goalsList"),
  goalsCount: document.getElementById("goalsCount"),
  exportButton: document.getElementById("exportButton"),
  importInput: document.getElementById("importInput"),
  backupButton: document.getElementById("backupButton"),
  backupList: document.getElementById("backupList"),
  lastBackup: document.getElementById("lastBackup"),
  resetButton: document.getElementById("resetButton"),
  themeToggle: document.getElementById("themeToggle"),
  quickContract: document.getElementById("quickContract")
};

const state = {
  data: loadData()
};

function loadData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return structuredClone(defaultData);
  }
  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultData),
      ...parsed,
      balances: { ...defaultData.balances, ...parsed.balances }
    };
  } catch (error) {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(state.data));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
}

function getRank(exp) {
  const range = rankRanges.find((item) => exp >= item.min && exp < item.max) || rankRanges[rankRanges.length - 1];
  return range;
}

function expForContract(rank) {
  if ([1, 4, 7].includes(rank)) {
    return 10;
  }
  if ([2, 5, 8].includes(rank)) {
    return 15;
  }
  return 20;
}

function applyTheme() {
  if (state.data.theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function addOperation(type, amount, note, meta = {}) {
  const rank = getRank(state.data.exp).rank;
  state.data.operations.unshift({
    id: crypto.randomUUID(),
    type,
    amount,
    note,
    date: new Date().toISOString(),
    rank,
    ...meta
  });
}

function updateBalances() {
  const total = state.data.balances.cash + state.data.balances.card;
  ui.cashBalance.textContent = formatCurrency(state.data.balances.cash);
  ui.cardBalance.textContent = formatCurrency(state.data.balances.card);
  ui.totalBalance.textContent = formatCurrency(total);
  ui.totalBalanceChip.textContent = formatCurrency(total);
}

function renderOperations() {
  ui.operationsList.innerHTML = "";
  state.data.operations.slice(0, 30).forEach((op) => {
    const item = document.createElement("div");
    item.className = "history-item";
    const sign = op.type === "expense" ? "-" : "+";
    const title = {
      deposit: "Перевод на карту",
      income: "Доход",
      expense: "Расход",
      contract: "Контракт"
    }[op.type];
    item.innerHTML = `
      <strong>${title}</strong>
      <div class="muted">${new Date(op.date).toLocaleString("ru-RU")}</div>
      <div>${sign} ${formatCurrency(op.amount)}</div>
      <div class="muted">${op.note || "Без комментария"}</div>
    `;
    ui.operationsList.appendChild(item);
  });
  ui.operationsCount.textContent = `${state.data.operations.length} записей`;
}

function renderContracts() {
  ui.contractsList.innerHTML = "";
  state.data.contracts.slice(0, 10).forEach((contract) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <strong>${formatCurrency(contract.amount)}</strong>
      <div class="muted">${contract.time || "Без времени"} · +${contract.exp} опыта</div>
      <div class="muted">${contract.note || "Без комментария"}</div>
    `;
    ui.contractsList.appendChild(item);
  });
  ui.contractsCount.textContent = state.data.contracts.length;
}

function renderExpenses() {
  ui.expensesList.innerHTML = "";
  state.data.expenses.slice(0, 10).forEach((expense) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <strong>${formatCurrency(expense.amount)}</strong>
      <div class="muted">${expense.category || "Без категории"} · ${new Date(expense.date).toLocaleDateString("ru-RU")}</div>
      <div class="muted">${expense.note || "Без комментария"}</div>
    `;
    ui.expensesList.appendChild(item);
  });
  ui.expensesCount.textContent = state.data.expenses.length;
}

function renderGoals() {
  ui.goalsList.innerHTML = "";
  state.data.goals.forEach((goal) => {
    const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100) || 0);
    const item = document.createElement("div");
    item.className = "goal-item";
    item.innerHTML = `
      <strong>${goal.name}</strong>
      <div class="muted">${formatCurrency(goal.saved)} из ${formatCurrency(goal.target)}</div>
      <div class="goal-progress"><span style="width:${progress}%"></span></div>
      <div class="muted">Осталось ${formatCurrency(Math.max(0, goal.target - goal.saved))}</div>
    `;
    ui.goalsList.appendChild(item);
  });
  ui.goalsCount.textContent = state.data.goals.length;
}

function renderRank() {
  const rankInfo = getRank(state.data.exp);
  ui.rankChip.textContent = `Ранг ${rankInfo.rank}`;
  ui.currentExp.textContent = state.data.exp;
  const next = rankInfo.max === Infinity ? null : rankInfo.max;
  if (next === null) {
    ui.expToNext.textContent = "Максимум";
    ui.rankProgress.style.width = "100%";
  } else {
    const toNext = Math.max(0, next - state.data.exp);
    ui.expToNext.textContent = toNext;
    const progress = Math.min(100, ((state.data.exp - rankInfo.min) / (rankInfo.max - rankInfo.min)) * 100);
    ui.rankProgress.style.width = `${progress}%`;
  }
  ui.rankSelect.value = String(rankInfo.rank);
}

function getDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function renderStats() {
  const now = new Date();
  const todayKey = getDateKey(now);
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 6);
  const weekKey = getDateKey(weekAgo);

  const incomeOps = state.data.operations.filter((op) => op.type === "income" || op.type === "contract");
  let dayTotal = 0;
  let weekTotal = 0;
  let allTotal = 0;
  const currentRank = getRank(state.data.exp).rank;
  let rankTotal = 0;

  incomeOps.forEach((op) => {
    allTotal += op.amount;
    const key = getDateKey(op.date);
    if (key === todayKey) {
      dayTotal += op.amount;
    }
    if (key >= weekKey) {
      weekTotal += op.amount;
    }
    if (op.rank === currentRank) {
      rankTotal += op.amount;
    }
  });

  ui.dayIncome.textContent = formatCurrency(dayTotal);
  ui.weekIncome.textContent = formatCurrency(weekTotal);
  ui.allIncome.textContent = formatCurrency(allTotal);
  ui.rankIncome.textContent = `Ранг ${currentRank}`;
  ui.rankIncomeAmount.textContent = formatCurrency(rankTotal);
}

function renderChart() {
  const days = Number(ui.chartRange.value);
  const now = new Date();
  const dataPoints = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = getDateKey(date);
    const sum = state.data.operations
      .filter((op) => (op.type === "income" || op.type === "contract") && getDateKey(op.date) === key)
      .reduce((acc, op) => acc + op.amount, 0);
    dataPoints.push({ key, sum });
  }

  const max = Math.max(1, ...dataPoints.map((p) => p.sum));
  const width = 600;
  const height = 200;
  const step = width / (dataPoints.length - 1 || 1);
  const pointList = dataPoints.map((p, index) => {
    const x = index * step;
    const y = height - (p.sum / max) * (height - 20) - 10;
    return { x, y };
  });
  const points = pointList.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M 0 ${height} L ${pointList.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${width} ${height} Z`;

  ui.incomeChart.innerHTML = `
    <path d="${areaPath}" fill="url(#area)" opacity="0.35"></path>
    <polyline fill="none" stroke="url(#grad)" stroke-width="4" points="${points}" />
    ${pointList
      .map((p) => {
        return `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#7b5cff"></circle>`;
      })
      .join("")}
    <defs>
      <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#7b5cff" />
        <stop offset="100%" stop-color="#27d3a3" />
      </linearGradient>
      <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#7b5cff" />
        <stop offset="100%" stop-color="transparent" />
      </linearGradient>
    </defs>
  `;
}

function renderBackups() {
  ui.backupList.innerHTML = "";
  const last = state.data.backups[0];
  ui.lastBackup.textContent = last ? new Date(last.date).toLocaleString("ru-RU") : "Нет резервной копии";
  state.data.backups.slice(0, 3).forEach((backup) => {
    const item = document.createElement("div");
    item.className = "backup-item";
    const button = document.createElement("button");
    button.className = "ghost-button";
    button.textContent = "Восстановить";
    button.addEventListener("click", () => {
      state.data = { ...backup.data };
      saveData();
      renderAll();
    });
    item.innerHTML = `
      <strong>Резервная копия</strong>
      <div class="muted">${new Date(backup.date).toLocaleString("ru-RU")}</div>
    `;
    item.appendChild(button);
    ui.backupList.appendChild(item);
  });
}

function renderAll() {
  applyTheme();
  updateBalances();
  renderOperations();
  renderContracts();
  renderExpenses();
  renderGoals();
  renderRank();
  renderStats();
  renderChart();
  renderBackups();
}

function syncAndRender() {
  saveData();
  renderAll();
}

function emphasizeField(field) {
  if (!field) {
    return;
  }
  field.focus();
  if (window.gsap) {
    gsap.fromTo(field, { x: -4 }, { x: 0, duration: 0.2, repeat: 3, yoyo: true });
  }
}

ui.depositButton.addEventListener("click", () => {
  const amount = Number(ui.depositAmount.value);
  if (!amount || amount <= 0) {
    emphasizeField(ui.depositAmount);
    return;
  }
  state.data.balances.cash -= amount;
  state.data.balances.card += amount;
  addOperation("deposit", amount, "Перевод наличных на карту");
  ui.depositAmount.value = "";
  syncAndRender();
});

ui.applyBalanceButton.addEventListener("click", () => {
  const cashRaw = ui.cashStart.value;
  const cardRaw = ui.cardStart.value;
  const cashValue = cashRaw === "" ? null : Number(cashRaw);
  const cardValue = cardRaw === "" ? null : Number(cardRaw);
  if (cashValue === null && cardValue === null) {
    emphasizeField(ui.cashStart);
    return;
  }
  if (cashValue !== null && cashValue >= 0) {
    state.data.balances.cash = cashValue;
  }
  if (cardValue !== null && cardValue >= 0) {
    state.data.balances.card = cardValue;
  }
  ui.cashStart.value = "";
  ui.cardStart.value = "";
  syncAndRender();
});

ui.incomeButton.addEventListener("click", () => {
  const amount = Number(ui.incomeAmount.value);
  if (!amount || amount <= 0) {
    emphasizeField(ui.incomeAmount);
    return;
  }
  state.data.balances.cash += amount;
  addOperation("income", amount, "Доход");
  ui.incomeAmount.value = "";
  syncAndRender();
});

document.querySelectorAll(".quick-income").forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.amount);
    state.data.balances.cash += amount;
    addOperation("income", amount, "Быстрый доход");
    syncAndRender();
  });
});

ui.expenseQuickButton.addEventListener("click", () => {
  const amount = Number(ui.expenseAmountQuick.value);
  if (!amount || amount <= 0) {
    emphasizeField(ui.expenseAmountQuick);
    return;
  }
  state.data.balances.cash -= amount;
  state.data.expenses.unshift({
    id: crypto.randomUUID(),
    amount,
    category: "Быстрый",
    date: new Date().toISOString(),
    note: "Быстрый расход"
  });
  addOperation("expense", amount, "Быстрый расход");
  ui.expenseAmountQuick.value = "";
  syncAndRender();
});

ui.addContractButton.addEventListener("click", () => {
  const amount = Number(ui.contractAmount.value);
  if (!amount || amount <= 0) {
    emphasizeField(ui.contractAmount);
    return;
  }
  const rank = getRank(state.data.exp).rank;
  const expValue = ui.contractExp.value ? Number(ui.contractExp.value) : expForContract(rank);
  const contract = {
    id: crypto.randomUUID(),
    amount,
    time: ui.contractTime.value,
    exp: expValue,
    note: ui.contractNote.value,
    date: new Date().toISOString()
  };
  state.data.contracts.unshift(contract);
  state.data.balances.cash += amount;
  state.data.exp += expValue;
  addOperation("contract", amount, "Контракт", { exp: expValue });
  ui.contractAmount.value = "";
  ui.contractTime.value = "";
  ui.contractExp.value = "";
  ui.contractNote.value = "";
  syncAndRender();
});

ui.quickContract.addEventListener("click", () => {
  ui.addContractButton.click();
});

document.querySelectorAll(".quick-exp").forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.exp);
    state.data.exp += amount;
    syncAndRender();
  });
});

ui.applyRankButton.addEventListener("click", () => {
  const newExp = Number(ui.expInput.value);
  const rank = Number(ui.rankSelect.value);
  if (newExp || newExp === 0) {
    state.data.exp = Math.max(0, newExp);
  } else if (rank) {
    const range = rankRanges.find((item) => item.rank === rank);
    state.data.exp = range ? range.min : state.data.exp;
  }
  ui.expInput.value = "";
  syncAndRender();
});

ui.addExpenseButton.addEventListener("click", () => {
  const amount = Number(ui.expenseAmount.value);
  if (!amount || amount <= 0) {
    emphasizeField(ui.expenseAmount);
    return;
  }
  const date = ui.expenseDate.value ? new Date(ui.expenseDate.value).toISOString() : new Date().toISOString();
  const expense = {
    id: crypto.randomUUID(),
    amount,
    category: ui.expenseCategory.value,
    date,
    note: ui.expenseNote.value
  };
  state.data.expenses.unshift(expense);
  state.data.balances.cash -= amount;
  addOperation("expense", amount, expense.category || "Расход");
  ui.expenseAmount.value = "";
  ui.expenseCategory.value = "";
  ui.expenseDate.value = "";
  ui.expenseNote.value = "";
  syncAndRender();
});

ui.addGoalButton.addEventListener("click", () => {
  const name = ui.goalName.value.trim();
  const target = Number(ui.goalTarget.value);
  if (!name) {
    emphasizeField(ui.goalName);
    return;
  }
  if (!target || target <= 0) {
    emphasizeField(ui.goalTarget);
    return;
  }
  const saved = Number(ui.goalSaved.value) || 0;
  state.data.goals.unshift({
    id: crypto.randomUUID(),
    name,
    target,
    saved
  });
  ui.goalName.value = "";
  ui.goalTarget.value = "";
  ui.goalSaved.value = "";
  syncAndRender();
});

ui.chartRange.addEventListener("change", renderChart);

ui.exportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rp-tracker-data.json";
  link.click();
  URL.revokeObjectURL(url);
});

ui.importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state.data = {
        ...structuredClone(defaultData),
        ...parsed,
        balances: { ...defaultData.balances, ...parsed.balances }
      };
      syncAndRender();
    } catch (error) {
      emphasizeField(ui.importInput);
    }
  };
  reader.readAsText(file);
});

ui.backupButton.addEventListener("click", () => {
  state.data.backups.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    data: structuredClone(state.data)
  });
  state.data.backups = state.data.backups.slice(0, 5);
  syncAndRender();
});

ui.resetButton.addEventListener("click", () => {
  if (!window.confirm("Сбросить все данные?")) {
    return;
  }
  state.data = structuredClone(defaultData);
  syncAndRender();
});

ui.themeToggle.addEventListener("click", () => {
  state.data.theme = state.data.theme === "dark" ? "light" : "dark";
  syncAndRender();
});

renderAll();

if (window.gsap) {
  gsap.from(".card", { opacity: 0, y: 20, duration: 0.6, stagger: 0.08 });
}
