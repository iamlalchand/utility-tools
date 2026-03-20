const splitFriendsInput = document.getElementById("splitFriendsInput");
const splitLoadFriendsBtn = document.getElementById("splitLoadFriendsBtn");
const splitNoteInput = document.getElementById("splitNoteInput");
const splitAmountInput = document.getElementById("splitAmountInput");
const splitPaidBySelect = document.getElementById("splitPaidBySelect");
const splitAddExpenseBtn = document.getElementById("splitAddExpenseBtn");
const splitSummary = document.getElementById("splitSummary");
const splitExpenseList = document.getElementById("splitExpenseList");
const splitSettlementList = document.getElementById("splitSettlementList");
const splitClearBtn = document.getElementById("splitClearBtn");
const splitStorageKey = "ssSplitExpenseData";

function loadSplitData() {
  const raw = localStorage.getItem(splitStorageKey);
  if (!raw) return { friends: [], expenses: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      friends: Array.isArray(parsed.friends) ? parsed.friends.map((name) => String(name || "").trim()).filter(Boolean) : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch {
    return { friends: [], expenses: [] };
  }
}

function saveSplitData(data) {
  localStorage.setItem(splitStorageKey, JSON.stringify(data));
}

function parseFriendsList(text) {
  const items = String(text || "")
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
  const seen = new Set();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatMoneyText(value) {
  return Number(value || 0).toFixed(2);
}

let splitData = loadSplitData();

function updateSplitPaidByOptions() {
  if (!splitPaidBySelect) return;
  splitPaidBySelect.innerHTML = "";
  if (!splitData.friends.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Load friends first";
    splitPaidBySelect.appendChild(option);
    return;
  }
  splitData.friends.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    splitPaidBySelect.appendChild(option);
  });
}

function computeSplitSettlement() {
  const friends = splitData.friends;
  const expenses = splitData.expenses;
  const paidMap = new Map(friends.map((name) => [name, 0]));
  let total = 0;

  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    if (amount <= 0 || !paidMap.has(expense.paidBy)) return;
    total += amount;
    paidMap.set(expense.paidBy, (paidMap.get(expense.paidBy) || 0) + amount);
  });

  if (!friends.length || total <= 0) {
    return { total: 0, perPerson: 0, settlements: [] };
  }

  const perPerson = total / friends.length;
  const creditors = [];
  const debtors = [];

  friends.forEach((name) => {
    const balance = (paidMap.get(name) || 0) - perPerson;
    if (balance > 0.009) creditors.push({ name, amount: balance });
    if (balance < -0.009) debtors.push({ name, amount: -balance });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let cIndex = 0;
  let dIndex = 0;
  while (cIndex < creditors.length && dIndex < debtors.length) {
    const creditor = creditors[cIndex];
    const debtor = debtors[dIndex];
    const payAmount = Math.min(creditor.amount, debtor.amount);
    if (payAmount > 0.009) {
      settlements.push({ from: debtor.name, to: creditor.name, amount: payAmount });
    }
    creditor.amount -= payAmount;
    debtor.amount -= payAmount;
    if (creditor.amount <= 0.009) cIndex += 1;
    if (debtor.amount <= 0.009) dIndex += 1;
  }

  return { total, perPerson, settlements };
}

function renderSplitExpense() {
  if (!(splitSummary && splitExpenseList && splitSettlementList && splitFriendsInput)) return;
  splitFriendsInput.value = splitData.friends.join(", ");
  updateSplitPaidByOptions();

  splitExpenseList.innerHTML = "";
  splitSettlementList.innerHTML = "";

  if (!splitData.friends.length) {
    splitSummary.textContent = "Split Expense: Add at least 2 friends";
    const empty = document.createElement("div");
    empty.className = "output-item";
    empty.textContent = "No friends loaded yet.";
    splitExpenseList.appendChild(empty);
    splitSettlementList.appendChild(empty.cloneNode(true));
    return;
  }

  if (!splitData.expenses.length) {
    const emptyExpense = document.createElement("div");
    emptyExpense.className = "output-item";
    emptyExpense.textContent = "No expenses added yet.";
    splitExpenseList.appendChild(emptyExpense);
  } else {
    splitData.expenses.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "output-item";
      const text = document.createElement("span");
      const note = item.note ? `${item.note} | ` : "";
      text.textContent = `${note}${item.paidBy}: ${formatMoneyText(item.amount)} `;
      const removeBtn = document.createElement("button");
      removeBtn.className = "ghost";
      removeBtn.type = "button";
      removeBtn.dataset.removeSplitExpense = String(index);
      removeBtn.textContent = "Remove";
      row.appendChild(text);
      row.appendChild(removeBtn);
      splitExpenseList.appendChild(row);
    });
  }

  const settlementResult = computeSplitSettlement();
  splitSummary.textContent =
    `Total: ${formatMoneyText(settlementResult.total)} | Per Person: ${formatMoneyText(settlementResult.perPerson)} | Friends: ${splitData.friends.length}`;

  if (!settlementResult.settlements.length) {
    const even = document.createElement("div");
    even.className = "output-item";
    even.textContent = "All settled. No pending transfers.";
    splitSettlementList.appendChild(even);
    return;
  }

  settlementResult.settlements.forEach((item) => {
    const row = document.createElement("div");
    row.className = "output-item";
    row.textContent = `${item.from} pays ${item.to} ${formatMoneyText(item.amount)}`;
    splitSettlementList.appendChild(row);
  });
}

if (splitLoadFriendsBtn) {
  splitLoadFriendsBtn.addEventListener("click", () => {
    const friends = parseFriendsList(splitFriendsInput?.value || "");
    if (friends.length < 2) {
      if (splitSummary) splitSummary.textContent = "Split Expense: Add at least 2 valid friend names";
      return;
    }
    splitData.friends = friends;
    splitData.expenses = splitData.expenses.filter((expense) => friends.includes(expense.paidBy));
    saveSplitData(splitData);
    renderSplitExpense();
  });
}

if (splitAddExpenseBtn) {
  splitAddExpenseBtn.addEventListener("click", () => {
    if (splitData.friends.length < 2) {
      if (splitSummary) splitSummary.textContent = "Split Expense: Load friends first";
      return;
    }
    const amount = Number(splitAmountInput?.value);
    const paidBy = splitPaidBySelect?.value || "";
    const note = (splitNoteInput?.value || "").trim();
    if (!paidBy || Number.isNaN(amount) || amount <= 0) {
      if (splitSummary) splitSummary.textContent = "Split Expense: Enter valid amount and payer";
      return;
    }
    splitData.expenses.push({ note, amount, paidBy });
    saveSplitData(splitData);
    if (splitAmountInput) splitAmountInput.value = "";
    if (splitNoteInput) splitNoteInput.value = "";
    renderSplitExpense();
  });
}

if (splitExpenseList) {
  splitExpenseList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const indexValue = target.dataset.removeSplitExpense;
    if (indexValue === undefined) return;
    const index = Number(indexValue);
    if (!Number.isInteger(index) || index < 0 || index >= splitData.expenses.length) return;
    splitData.expenses.splice(index, 1);
    saveSplitData(splitData);
    renderSplitExpense();
  });
}

if (splitClearBtn) {
  splitClearBtn.addEventListener("click", () => {
    splitData = { friends: [], expenses: [] };
    saveSplitData(splitData);
    if (splitFriendsInput) splitFriendsInput.value = "";
    if (splitAmountInput) splitAmountInput.value = "";
    if (splitNoteInput) splitNoteInput.value = "";
    renderSplitExpense();
  });
}

renderSplitExpense();

