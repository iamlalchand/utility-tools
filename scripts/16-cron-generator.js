const cronTemplateFields = document.getElementById("cronTemplateFields");
const cronTabButtons = Array.from(document.querySelectorAll(".cron-tab"));
const cronGenerateBtn = document.getElementById("cronGenerateBtn");
const cronExpressionInput = document.getElementById("cronExpressionInput");
const cronCalcBtn = document.getElementById("cronCalcBtn");
const cronStartDate = document.getElementById("cronStartDate");
const cronStartHour = document.getElementById("cronStartHour");
const cronStartMinute = document.getElementById("cronStartMinute");
const cronBuiltExpression = document.getElementById("cronBuiltExpression");
const cronNextCount = document.getElementById("cronNextCount");
const cronNextList = document.getElementById("cronNextList");
const cronSummary = document.getElementById("cronSummary");

const createCronGeneratorModule = window.UtilitySuiteModules?.createCronGeneratorModule;

if (typeof createCronGeneratorModule === "function") {
  const cronModule = createCronGeneratorModule({
    templateFields: cronTemplateFields,
    tabButtons: cronTabButtons,
    generateBtn: cronGenerateBtn,
    expressionInput: cronExpressionInput,
    calcBtn: cronCalcBtn,
    startDate: cronStartDate,
    startHour: cronStartHour,
    startMinute: cronStartMinute,
    builtExpression: cronBuiltExpression,
    nextCount: cronNextCount,
    nextList: cronNextList,
    summary: cronSummary,
  });

  cronModule.init();
}
