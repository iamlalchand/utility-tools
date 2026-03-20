const budgetIncomeInput = document.getElementById("budgetIncomeInput");
const setBudgetIncomeBtn = document.getElementById("setBudgetIncomeBtn");
const budgetExpenseLabel = document.getElementById("budgetExpenseLabel");
const budgetExpenseAmount = document.getElementById("budgetExpenseAmount");
const addBudgetExpenseBtn = document.getElementById("addBudgetExpenseBtn");
const budgetSummary = document.getElementById("budgetSummary");
const budgetList = document.getElementById("budgetList");
const clearBudgetBtn = document.getElementById("clearBudgetBtn");
const budgetKey = "ssBudgetBoxData";

function loadBudgetData() {
  const raw = localStorage.getItem(budgetKey);
  if (!raw) return { income: 0, expenses: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      income: Number(parsed.income) || 0,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch {
    return { income: 0, expenses: [] };
  }
}

function saveBudgetData(data) {
  localStorage.setItem(budgetKey, JSON.stringify(data));
}

let budgetData = loadBudgetData();

function renderBudget() {
  if (!budgetList || !budgetSummary) return;
  const totalExpense = budgetData.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = budgetData.income - totalExpense;
  budgetSummary.textContent = `Income: ${budgetData.income.toFixed(2)} | Expense: ${totalExpense.toFixed(2)} | Balance: ${balance.toFixed(2)}`;

  budgetList.innerHTML = "";
  if (!budgetData.expenses.length) {
    const empty = document.createElement("div");
    empty.className = "output-item";
    empty.textContent = "No expenses yet.";
    budgetList.appendChild(empty);
    return;
  }

  budgetData.expenses.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "output-item";
    row.innerHTML = `${item.label}: ${Number(item.amount).toFixed(2)} <button class="ghost" data-remove-expense="${index}">Remove</button>`;
    budgetList.appendChild(row);
  });
}

if (setBudgetIncomeBtn) {
  setBudgetIncomeBtn.addEventListener("click", () => {
    const income = Number(budgetIncomeInput.value);
    if (Number.isNaN(income) || income < 0) {
      budgetSummary.textContent = "Budget Box: Enter valid income amount";
      return;
    }
    budgetData.income = income;
    saveBudgetData(budgetData);
    renderBudget();
  });
}

if (addBudgetExpenseBtn) {
  addBudgetExpenseBtn.addEventListener("click", () => {
    const label = budgetExpenseLabel.value.trim();
    const amount = Number(budgetExpenseAmount.value);
    if (!label || Number.isNaN(amount) || amount <= 0) {
      budgetSummary.textContent = "Budget Box: Enter valid expense label and amount";
      return;
    }

    budgetData.expenses.push({ label, amount });
    saveBudgetData(budgetData);
    budgetExpenseLabel.value = "";
    budgetExpenseAmount.value = "";
    renderBudget();
  });
}

if (budgetList) {
  budgetList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const indexValue = target.dataset.removeExpense;
    if (indexValue === undefined) return;

    const index = Number(indexValue);
    if (Number.isInteger(index) && index >= 0 && index < budgetData.expenses.length) {
      budgetData.expenses.splice(index, 1);
      saveBudgetData(budgetData);
      renderBudget();
    }
  });
}

if (clearBudgetBtn) {
  clearBudgetBtn.addEventListener("click", () => {
    budgetData = { income: 0, expenses: [] };
    saveBudgetData(budgetData);
    budgetIncomeInput.value = "";
    budgetExpenseLabel.value = "";
    budgetExpenseAmount.value = "";
    renderBudget();
  });
}

