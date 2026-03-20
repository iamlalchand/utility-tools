const emiTypeSelect = document.getElementById("emiTypeSelect");
const emiAmountInput = document.getElementById("emiAmountInput");
const emiRateInput = document.getElementById("emiRateInput");
const emiMonthsInput = document.getElementById("emiMonthsInput");
const emiCalcBtn = document.getElementById("emiCalcBtn");
const emiSummary = document.getElementById("emiSummary");
const emiMonthlyValue = document.getElementById("emiMonthlyValue");
const emiInterestValue = document.getElementById("emiInterestValue");
const emiTotalValue = document.getElementById("emiTotalValue");
const emiScheduleList = document.getElementById("emiScheduleList");

function calculateEmiValues(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    const monthly = principal / months;
    return { monthly, totalPayment: monthly * months, totalInterest: 0, monthlyRate };
  }
  const factor = (1 + monthlyRate) ** months;
  const monthly = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  return { monthly, totalPayment, totalInterest, monthlyRate };
}

function renderEmiSchedule(principal, monthly, monthlyRate, months) {
  if (!emiScheduleList) return;
  emiScheduleList.innerHTML = "";
  const rows = Math.min(months, 12);
  let balance = principal;
  for (let month = 1; month <= rows; month += 1) {
    const interestPart = monthlyRate ? balance * monthlyRate : 0;
    let principalPart = monthly - interestPart;
    if (month === rows || principalPart > balance) principalPart = balance;
    balance = Math.max(balance - principalPart, 0);
    const row = document.createElement("div");
    row.className = "output-item";
    row.textContent =
      `Month ${month}: EMI ${formatMoneyText(monthly)} | Principal ${formatMoneyText(principalPart)} | Interest ${formatMoneyText(interestPart)} | Balance ${formatMoneyText(balance)}`;
    emiScheduleList.appendChild(row);
  }
}

if (emiCalcBtn) {
  emiCalcBtn.addEventListener("click", () => {
    const principal = Number(emiAmountInput?.value);
    const annualRate = Number(emiRateInput?.value);
    const months = Number(emiMonthsInput?.value);
    const emiTypeLabel = emiTypeSelect?.value === "credit" ? "Credit Card EMI" : "Loan EMI";

    if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isInteger(months) || months < 1) {
      if (emiSummary) emiSummary.textContent = "EMI Calculator: Enter valid amount, rate and tenure";
      return;
    }

    const emi = calculateEmiValues(principal, annualRate, months);
    if (emiMonthlyValue) emiMonthlyValue.textContent = formatMoneyText(emi.monthly);
    if (emiInterestValue) emiInterestValue.textContent = formatMoneyText(emi.totalInterest);
    if (emiTotalValue) emiTotalValue.textContent = formatMoneyText(emi.totalPayment);
    if (emiSummary) emiSummary.textContent = `${emiTypeLabel}: Calculated for ${months} month(s)`;
    renderEmiSchedule(principal, emi.monthly, emi.monthlyRate, months);
  });
}

if (emiTypeSelect && emiSummary) {
  emiTypeSelect.addEventListener("change", () => {
    emiSummary.textContent = emiTypeSelect.value === "credit"
      ? "EMI Calculator: Credit card EMI mode selected"
      : "EMI Calculator: Loan EMI mode selected";
  });
}

