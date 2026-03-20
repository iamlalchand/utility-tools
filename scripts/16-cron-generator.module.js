(function registerCronGeneratorModule(global) {
  const modules = (global.UtilitySuiteModules = global.UtilitySuiteModules || {});

  modules.createCronGeneratorModule = function createCronGeneratorModule(elements) {
    const {
      templateFields,
      tabButtons,
      generateBtn,
      expressionInput,
      calcBtn,
      startDate,
      startHour,
      startMinute,
      builtExpression,
      nextCount,
      nextList,
      summary,
    } = elements;

    const cronWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const cronMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const cronTemplateState = {
      minutes: { every: 1 },
      hourly: { minute: 0, every: 1 },
      daily: { hour: 0, minute: 0, every: 1 },
      weekly: { weekday: 1, hour: 0, minute: 0 },
      monthly: { day: 1, hour: 0, minute: 0 },
      yearly: { month: 1, day: 1, hour: 0, minute: 0 },
    };

    let activeCronTab = "minutes";
    let lastCalculatedCronExpression = "";

    function clampInt(value, min, max, fallback) {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed)) return fallback;
      return Math.min(max, Math.max(min, parsed));
    }

    function toTwoDigits(value) {
      return String(value).padStart(2, "0");
    }

    function formatDateForInput(date) {
      return `${date.getFullYear()}-${toTwoDigits(date.getMonth() + 1)}-${toTwoDigits(date.getDate())}`;
    }

    function renderCronTemplateFields() {
      if (!templateFields) return;
      const state = cronTemplateState[activeCronTab];

      if (activeCronTab === "minutes") {
        templateFields.innerHTML = `
          <div class="cron-template-row">
            <span>Every</span>
            <input data-cron-field="every" type="number" min="1" max="59" value="${state.every}">
            <span>minute(s)</span>
          </div>
        `;
      }

      if (activeCronTab === "hourly") {
        templateFields.innerHTML = `
          <div class="cron-template-row">
            <span>Every</span>
            <input data-cron-field="every" type="number" min="1" max="23" value="${state.every}">
            <span>hour(s) at minute</span>
            <input data-cron-field="minute" type="number" min="0" max="59" value="${state.minute}">
          </div>
        `;
      }

      if (activeCronTab === "daily") {
        templateFields.innerHTML = `
          <div class="cron-template-row">
            <span>Every</span>
            <input data-cron-field="every" type="number" min="1" max="31" value="${state.every}">
            <span>day(s) at</span>
            <input data-cron-field="hour" type="number" min="0" max="23" value="${state.hour}">
            <span>:</span>
            <input data-cron-field="minute" type="number" min="0" max="59" value="${state.minute}">
          </div>
        `;
      }

      if (activeCronTab === "weekly") {
        templateFields.innerHTML = `
          <div class="cron-template-row">
            <span>Every</span>
            <select data-cron-field="weekday">
              ${cronWeekdays.map((day, index) => `<option value="${index}" ${index === state.weekday ? "selected" : ""}>${day}</option>`).join("")}
            </select>
            <span>at</span>
            <input data-cron-field="hour" type="number" min="0" max="23" value="${state.hour}">
            <span>:</span>
            <input data-cron-field="minute" type="number" min="0" max="59" value="${state.minute}">
          </div>
        `;
      }

      if (activeCronTab === "monthly") {
        templateFields.innerHTML = `
          <div class="cron-template-row">
            <span>Day</span>
            <input data-cron-field="day" type="number" min="1" max="31" value="${state.day}">
            <span>of every month at</span>
            <input data-cron-field="hour" type="number" min="0" max="23" value="${state.hour}">
            <span>:</span>
            <input data-cron-field="minute" type="number" min="0" max="59" value="${state.minute}">
          </div>
        `;
      }

      if (activeCronTab === "yearly") {
        templateFields.innerHTML = `
          <div class="cron-template-row">
            <span>On</span>
            <select data-cron-field="month">
              ${cronMonths.map((monthName, index) => `<option value="${index + 1}" ${index + 1 === state.month ? "selected" : ""}>${monthName}</option>`).join("")}
            </select>
            <span>day</span>
            <input data-cron-field="day" type="number" min="1" max="31" value="${state.day}">
            <span>at</span>
            <input data-cron-field="hour" type="number" min="0" max="23" value="${state.hour}">
            <span>:</span>
            <input data-cron-field="minute" type="number" min="0" max="59" value="${state.minute}">
          </div>
        `;
      }

      templateFields.querySelectorAll("[data-cron-field]").forEach((input) => {
        input.addEventListener("input", () => {
          const field = input.dataset.cronField;
          if (!field) return;
          cronTemplateState[activeCronTab][field] = input.value;
        });

        input.addEventListener("change", () => {
          const field = input.dataset.cronField;
          if (!field) return;
          cronTemplateState[activeCronTab][field] = input.value;
        });
      });
    }

    function setActiveCronTab(tabKey) {
      activeCronTab = tabKey;
      tabButtons.forEach((button) => {
        const active = button.dataset.cronTab === tabKey;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderCronTemplateFields();
    }

    function buildCronExpressionFromTemplate() {
      const state = cronTemplateState[activeCronTab];

      if (activeCronTab === "minutes") {
        const every = clampInt(state.every, 1, 59, 1);
        return `*/${every} * * * *`;
      }

      if (activeCronTab === "hourly") {
        const every = clampInt(state.every, 1, 23, 1);
        const minute = clampInt(state.minute, 0, 59, 0);
        return `${minute} */${every} * * *`;
      }

      if (activeCronTab === "daily") {
        const every = clampInt(state.every, 1, 31, 1);
        const hour = clampInt(state.hour, 0, 23, 0);
        const minute = clampInt(state.minute, 0, 59, 0);
        return `${minute} ${hour} */${every} * *`;
      }

      if (activeCronTab === "weekly") {
        const weekday = clampInt(state.weekday, 0, 6, 1);
        const hour = clampInt(state.hour, 0, 23, 0);
        const minute = clampInt(state.minute, 0, 59, 0);
        return `${minute} ${hour} * * ${weekday}`;
      }

      if (activeCronTab === "monthly") {
        const day = clampInt(state.day, 1, 31, 1);
        const hour = clampInt(state.hour, 0, 23, 0);
        const minute = clampInt(state.minute, 0, 59, 0);
        return `${minute} ${hour} ${day} * *`;
      }

      if (activeCronTab === "yearly") {
        const month = clampInt(state.month, 1, 12, 1);
        const day = clampInt(state.day, 1, 31, 1);
        const hour = clampInt(state.hour, 0, 23, 0);
        const minute = clampInt(state.minute, 0, 59, 0);
        return `${minute} ${hour} ${day} ${month} *`;
      }

      return "* * * * *";
    }

    function expandCronPart(part, min, max, options) {
      const settings = options || {};
      const normalizedPart = (part || "*").trim();
      if (!normalizedPart || normalizedPart === "*" || normalizedPart === "?") {
        return null;
      }

      const allowedValues = new Set();
      const chunks = normalizedPart.split(",");

      chunks.forEach((chunkRaw) => {
        const chunk = chunkRaw.trim();
        if (!chunk) throw new Error(`Invalid cron part "${part}"`);

        const split = chunk.split("/");
        const base = split[0].trim();
        const step = split[1] === undefined ? 1 : clampInt(split[1], 1, max - min + 1, NaN);
        if (!Number.isFinite(step) || step <= 0) throw new Error(`Invalid step "${chunk}"`);

        let rangeStart = min;
        let rangeEnd = max;

        if (base !== "*") {
          if (base.includes("-")) {
            const rangeParts = base.split("-");
            rangeStart = clampInt(rangeParts[0], min, max, NaN);
            rangeEnd = clampInt(rangeParts[1], min, max, NaN);
            if (!Number.isFinite(rangeStart) || !Number.isFinite(rangeEnd) || rangeStart > rangeEnd) {
              throw new Error(`Invalid range "${chunk}"`);
            }
          } else {
            rangeStart = clampInt(base, min, max, NaN);
            rangeEnd = rangeStart;
            if (!Number.isFinite(rangeStart)) throw new Error(`Invalid value "${chunk}"`);
          }
        }

        for (let value = rangeStart; value <= rangeEnd; value += step) {
          let normalizedValue = value;
          if (settings.isWeekday && normalizedValue === 7) normalizedValue = 0;
          allowedValues.add(normalizedValue);
        }
      });

      return allowedValues;
    }

    function parseCronExpression(expression) {
      const parts = (expression || "").trim().split(/\s+/).filter(Boolean);
      if (!parts.length) throw new Error("Enter cron expression first");

      let fields = parts;
      if (parts.length === 6) fields = parts.slice(1);
      if (parts.length === 7) fields = parts.slice(1, 6);
      if (fields.length !== 5) throw new Error("Use 5-field cron format: m h dom mon dow");

      const minuteRaw = fields[0];
      const hourRaw = fields[1];
      const dayRaw = fields[2];
      const monthRaw = fields[3];
      const weekdayRaw = fields[4];

      const minuteSet = expandCronPart(minuteRaw, 0, 59);
      const hourSet = expandCronPart(hourRaw, 0, 23);
      const daySet = expandCronPart(dayRaw, 1, 31);
      const monthSet = expandCronPart(monthRaw, 1, 12);
      const weekdaySet = expandCronPart(weekdayRaw, 0, 7, { isWeekday: true });

      const domWildcard = dayRaw === "*" || dayRaw === "?";
      const dowWildcard = weekdayRaw === "*" || weekdayRaw === "?";

      return (date) => {
        if (minuteSet && !minuteSet.has(date.getMinutes())) return false;
        if (hourSet && !hourSet.has(date.getHours())) return false;
        if (monthSet && !monthSet.has(date.getMonth() + 1)) return false;

        const domMatch = daySet ? daySet.has(date.getDate()) : true;
        const dowMatch = weekdaySet ? weekdaySet.has(date.getDay()) : true;

        let dayMatches = true;
        if (!domWildcard && !dowWildcard) dayMatches = domMatch || dowMatch;
        else if (!domWildcard) dayMatches = domMatch;
        else if (!dowWildcard) dayMatches = dowMatch;

        return dayMatches;
      };
    }

    function computeNextCronDates(expression, startDateValue, count) {
      const matches = parseCronExpression(expression);
      const nextDates = [];
      const cursor = new Date(startDateValue.getTime());
      cursor.setSeconds(0, 0);
      cursor.setMinutes(cursor.getMinutes() + 1);

      const maxIterations = 60 * 24 * 366 * 5;
      for (let i = 0; i < maxIterations && nextDates.length < count; i += 1) {
        if (matches(cursor)) nextDates.push(new Date(cursor.getTime()));
        cursor.setMinutes(cursor.getMinutes() + 1);
      }

      return nextDates;
    }

    function formatScheduledDate(date) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return `${date.getFullYear()}-${toTwoDigits(date.getMonth() + 1)}-${toTwoDigits(date.getDate())} ${dayNames[date.getDay()]} ${toTwoDigits(date.getHours())}:${toTwoDigits(date.getMinutes())}:00`;
    }

    function getCronStartDateTime() {
      if (!startDate) return new Date();
      const dateValue = startDate.value;
      if (!dateValue) throw new Error("Select start date");
      const hour = clampInt(startHour ? startHour.value : "", 0, 23, 0);
      const minute = clampInt(startMinute ? startMinute.value : "", 0, 59, 0);
      const parts = dateValue.split("-").map((value) => Number.parseInt(value, 10));
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      if (!year || !month || !day) throw new Error("Invalid start date");
      return new Date(year, month - 1, day, hour, minute, 0, 0);
    }

    function renderCronNextDates(expression) {
      if (!nextList || !summary || !builtExpression) return;
      const normalizedExpression = (expression || "").trim();
      if (!normalizedExpression) {
        summary.textContent = "Cron Generator: Enter cron expression";
        return;
      }

      try {
        const start = getCronStartDateTime();
        const limit = clampInt(nextCount ? nextCount.value : "", 1, 30, 5);
        const nextDates = computeNextCronDates(normalizedExpression, start, limit);
        builtExpression.textContent = normalizedExpression;
        nextList.innerHTML = "";

        if (!nextDates.length) {
          summary.textContent = "Cron Generator: No matching next dates found";
          return;
        }

        nextDates.forEach((date) => {
          const li = document.createElement("li");
          li.textContent = formatScheduledDate(date);
          nextList.appendChild(li);
        });
        lastCalculatedCronExpression = normalizedExpression;
        summary.textContent = `Cron Generator: ${nextDates.length} next date(s) calculated`;
      } catch (error) {
        nextList.innerHTML = "";
        summary.textContent = `Cron Generator: ${(error && error.message) || "Invalid cron expression"}`;
      }
    }

    function init() {
      if (!(templateFields && summary)) return;

      const now = new Date();
      if (startDate) startDate.value = formatDateForInput(now);
      if (startHour) startHour.value = toTwoDigits(now.getHours());
      if (startMinute) startMinute.value = toTwoDigits(now.getMinutes());
      setActiveCronTab(activeCronTab);

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const tab = button.dataset.cronTab;
          if (!tab || tab === activeCronTab) return;
          setActiveCronTab(tab);
        });
      });

      if (generateBtn) {
        generateBtn.addEventListener("click", () => {
          const expression = buildCronExpressionFromTemplate();
          if (expressionInput) expressionInput.value = expression;
          if (builtExpression) builtExpression.textContent = expression;
          renderCronNextDates(expression);
        });
      }

      if (calcBtn) {
        calcBtn.addEventListener("click", () => {
          renderCronNextDates(expressionInput ? expressionInput.value : "");
        });
      }

      if (nextCount) {
        nextCount.addEventListener("change", () => {
          if (lastCalculatedCronExpression) renderCronNextDates(lastCalculatedCronExpression);
        });
      }

      const initialExpression = buildCronExpressionFromTemplate();
      if (expressionInput) expressionInput.value = initialExpression;
      if (builtExpression) builtExpression.textContent = initialExpression;
      renderCronNextDates(initialExpression);
    }

    return {
      init,
      renderCronNextDates,
      buildCronExpressionFromTemplate,
    };
  };
})(window);
