const sqlInput = document.getElementById("sqlInput");
const sqlFormatBtn = document.getElementById("sqlFormatBtn");
const sqlMinifyBtn = document.getElementById("sqlMinifyBtn");
const sqlParseBtn = document.getElementById("sqlParseBtn");
const sqlCopyBtn = document.getElementById("sqlCopyBtn");
const sqlClearBtn = document.getElementById("sqlClearBtn");
const sqlOutput = document.getElementById("sqlOutput");
const sqlStatus = document.getElementById("sqlStatus");

const sqlKeywords = [
  "UNION ALL", "DELETE FROM", "INSERT INTO", "GROUP BY", "ORDER BY", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
  "SELECT", "FROM", "WHERE", "HAVING", "LIMIT", "OFFSET", "VALUES", "UPDATE", "SET", "JOIN", "ON", "AND", "OR", "CASE",
  "WHEN", "THEN", "ELSE", "END", "AS", "IN", "LIKE",
];

const sqlClauseOrder = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET"];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uppercaseSqlKeywords(text) {
  return sqlKeywords
    .sort((a, b) => b.length - a.length)
    .reduce((result, keyword) => {
      const pattern = keyword.split(" ").map((part) => escapeRegex(part)).join("\\s+");
      const regex = new RegExp(`\\b${pattern}\\b`, "gi");
      return result.replace(regex, keyword);
    }, text);
}

function stripSqlComments(query) {
  return query
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n\r]*/g, " ");
}

function splitSqlStatements(rawQuery) {
  const source = rawQuery || "";
  const statements = [];

  let start = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let depth = 0;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (inSingleQuote) {
      if (ch === "'" && next === "'") {
        i += 1;
        continue;
      }
      if (ch === "'") inSingleQuote = false;
      continue;
    }

    if (inDoubleQuote) {
      if (ch === '"' && next === '"') {
        i += 1;
        continue;
      }
      if (ch === '"') inDoubleQuote = false;
      continue;
    }

    if (inBacktick) {
      if (ch === "`") inBacktick = false;
      continue;
    }

    if (ch === "'") {
      inSingleQuote = true;
      continue;
    }

    if (ch === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (ch === "`") {
      inBacktick = true;
      continue;
    }

    if (ch === "(") {
      depth += 1;
      continue;
    }

    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (ch === ";" && depth === 0) {
      const text = source.slice(start, i).trim();
      if (text) statements.push({ text, terminated: true });
      start = i + 1;
    }
  }

  const tail = source.slice(start).trim();
  if (tail) statements.push({ text: tail, terminated: false });

  return statements;
}

function getLineNumberFromIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function readWordAt(sourceUpper, startIndex) {
  let i = startIndex;
  while (i < sourceUpper.length && /\s/.test(sourceUpper[i])) i += 1;
  const begin = i;
  while (i < sourceUpper.length && /[A-Z_]/.test(sourceUpper[i])) i += 1;
  return {
    word: sourceUpper.slice(begin, i),
    nextIndex: i,
  };
}

function findTopLevelClauses(statement) {
  const text = statement || "";
  const upper = text.toUpperCase();
  const clauses = [];

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let depth = 0;

  for (let i = 0; i < upper.length; i += 1) {
    const ch = upper[i];
    const next = upper[i + 1];

    if (inSingleQuote) {
      if (ch === "'" && next === "'") {
        i += 1;
        continue;
      }
      if (ch === "'") inSingleQuote = false;
      continue;
    }

    if (inDoubleQuote) {
      if (ch === '"' && next === '"') {
        i += 1;
        continue;
      }
      if (ch === '"') inDoubleQuote = false;
      continue;
    }

    if (inBacktick) {
      if (ch === "`") inBacktick = false;
      continue;
    }

    if (ch === "'") {
      inSingleQuote = true;
      continue;
    }

    if (ch === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (ch === "`") {
      inBacktick = true;
      continue;
    }

    if (ch === "(") {
      depth += 1;
      continue;
    }

    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth > 0 || !/[A-Z]/.test(ch)) continue;

    const first = readWordAt(upper, i);
    if (!first.word) continue;

    const second = readWordAt(upper, first.nextIndex);
    let clause = first.word;

    if (first.word === "GROUP" && second.word === "BY") clause = "GROUP BY";
    if (first.word === "ORDER" && second.word === "BY") clause = "ORDER BY";
    if (first.word === "LEFT" && second.word === "JOIN") clause = "LEFT JOIN";
    if (first.word === "RIGHT" && second.word === "JOIN") clause = "RIGHT JOIN";
    if (first.word === "INNER" && second.word === "JOIN") clause = "INNER JOIN";
    if (first.word === "FULL" && second.word === "JOIN") clause = "FULL JOIN";

    const supported = new Set([
      "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET",
      "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN", "ON",
      "INSERT", "UPDATE", "DELETE", "VALUES", "SET",
    ]);

    if (supported.has(clause)) {
      clauses.push({
        clause,
        index: i,
        line: getLineNumberFromIndex(text, i),
      });
    }
  }

  return clauses;
}

function validateBalancedTokens(statement, statementNo, errors) {
  const text = statement || "";
  let singleQuotes = 0;
  let doubleQuotes = 0;
  let backticks = 0;
  let depth = 0;
  const tokenIssues = {
    unclosedSingleQuote: false,
    unclosedDoubleQuote: false,
    unclosedBacktick: false,
    unclosedParentheses: false,
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "'" && next === "'") {
      i += 1;
      continue;
    }

    if (ch === '"' && next === '"') {
      i += 1;
      continue;
    }

    if (ch === "'" && doubleQuotes % 2 === 0 && backticks % 2 === 0) singleQuotes += 1;
    if (ch === '"' && singleQuotes % 2 === 0 && backticks % 2 === 0) doubleQuotes += 1;
    if (ch === "`" && singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) backticks += 1;

    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) continue;

    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;

    if (depth < 0) {
      errors.push(`Statement ${statementNo}: Extra closing parenthesis ')' near line ${getLineNumberFromIndex(text, i)}.`);
      depth = 0;
    }
  }

  if (singleQuotes % 2 !== 0) {
    tokenIssues.unclosedSingleQuote = true;
    errors.push(`Statement ${statementNo}: Unclosed single quote.`);
  }
  if (doubleQuotes % 2 !== 0) {
    tokenIssues.unclosedDoubleQuote = true;
    errors.push(`Statement ${statementNo}: Unclosed double quote.`);
  }
  if (backticks % 2 !== 0) {
    tokenIssues.unclosedBacktick = true;
    errors.push(`Statement ${statementNo}: Unclosed identifier quote (\`).`);
  }
  if (depth > 0) {
    tokenIssues.unclosedParentheses = true;
    errors.push(`Statement ${statementNo}: Missing ${depth} closing parenthesis ')' .`);
  }

  return tokenIssues;
}

function validateSelectCommas(statement, statementNo, errors, warnings) {
  const clauses = findTopLevelClauses(statement);
  const selectClause = clauses.find((item) => item.clause === "SELECT");
  const fromClause = clauses.find((item) => item.clause === "FROM");

  if (!selectClause || !fromClause || fromClause.index <= selectClause.index) return;

  const selectSegment = statement.slice(selectClause.index + 6, fromClause.index);
  const lines = selectSegment
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    errors.push(`Statement ${statementNo}: SELECT list is empty.`);
    return;
  }

  if (/[,\s]*$/.test(selectSegment) && /,\s*$/.test(selectSegment)) {
    errors.push(`Statement ${statementNo}: Trailing comma found before FROM clause.`);
  }

  if (lines.length > 1) {
    const missingCommaLines = [];
    for (let i = 0; i < lines.length - 1; i += 1) {
      const line = lines[i];
      if (line.endsWith(",")) continue;
      if (/[+\-*/(]$/.test(line)) continue;
      if (/\b(AND|OR|WHEN|THEN|ELSE|CASE)\b$/i.test(line)) continue;
      missingCommaLines.push(i + 1);
    }

    if (missingCommaLines.length) {
      errors.push(`Statement ${statementNo}: Possible missing comma in SELECT list (line(s): ${missingCommaLines.join(", ")}).`);
    }
  } else {
    const compact = selectSegment.replace(/\s+/g, " ").trim();
    if (!compact.includes(",") && /\b[A-Za-z_][\w$.]*\s+[A-Za-z_][\w$.]*\s+[A-Za-z_][\w$.]*\b/.test(compact)) {
      warnings.push(`Statement ${statementNo}: SELECT list may be missing commas.`);
    }
  }
}

function validateClauseSequence(statement, statementNo, errors, warnings, parser) {
  const clauses = findTopLevelClauses(statement);
  parser.clauses = clauses.map((item) => item.clause);

  const normalized = clauses
    .map((item) => {
      if (item.clause.endsWith("JOIN")) return "JOIN";
      return item.clause;
    });

  if (normalized.includes("SELECT")) {
    if (!normalized.includes("FROM")) {
      errors.push(`Statement ${statementNo}: SELECT query is missing FROM clause.`);
    }

    let lastOrder = -1;
    for (const clause of normalized) {
      const orderIndex = sqlClauseOrder.indexOf(clause);
      if (orderIndex < 0) continue;
      if (orderIndex < lastOrder) {
        errors.push(`Statement ${statementNo}: Clause order appears invalid near '${clause}'.`);
        break;
      }
      lastOrder = orderIndex;
    }

    if (normalized.includes("HAVING") && !normalized.includes("GROUP BY")) {
      warnings.push(`Statement ${statementNo}: HAVING is usually used with GROUP BY.`);
    }

    if (normalized.includes("JOIN") && !normalized.includes("ON")) {
      warnings.push(`Statement ${statementNo}: JOIN found without ON condition.`);
    }
  }
}

function extractStatementType(statement) {
  const cleaned = stripSqlComments(statement).trim().toUpperCase();
  if (!cleaned) return "UNKNOWN";
  if (cleaned.startsWith("SELECT")) return "SELECT";
  if (cleaned.startsWith("INSERT")) return "INSERT";
  if (cleaned.startsWith("UPDATE")) return "UPDATE";
  if (cleaned.startsWith("DELETE")) return "DELETE";
  return "UNKNOWN";
}

function extractTableNames(statement) {
  const tables = new Set();
  const regex = /\b(?:FROM|JOIN|UPDATE|INTO)\s+([A-Za-z_][\w$.]*)/gi;
  let match = regex.exec(statement);
  while (match) {
    tables.add(match[1]);
    match = regex.exec(statement);
  }
  return Array.from(tables);
}

function validateSqlQuery(query) {
  const cleanedQuery = stripSqlComments(query || "");
  const statements = splitSqlStatements(cleanedQuery);
  const queryEndsWithTerminator = /;\s*$/.test((query || "").trim());

  const errors = [];
  const warnings = [];
  const parsedStatements = [];

  if (!statements.length) {
    errors.push("No SQL statement found.");
    return { errors, warnings, statements: parsedStatements };
  }

  statements.forEach((statementObj, index) => {
    const statementNo = index + 1;
    const isLastStatement = index === statements.length - 1;
    const statement = statementObj.text;
    const parserInfo = {
      number: statementNo,
      type: extractStatementType(statement),
      terminated: statementObj.terminated,
      clauses: [],
      tables: extractTableNames(statement),
    };

    const tokenIssues = validateBalancedTokens(statement, statementNo, errors);
    const delimiterDetectionBlocked =
      tokenIssues.unclosedSingleQuote ||
      tokenIssues.unclosedDoubleQuote ||
      tokenIssues.unclosedBacktick ||
      tokenIssues.unclosedParentheses;

    // If source ends with ';' but parser couldn't split because tokens are unbalanced,
    // treat terminator as present and report only the actual token error(s).
    if (isLastStatement && !statementObj.terminated && queryEndsWithTerminator && delimiterDetectionBlocked) {
      parserInfo.terminated = true;
    }

    if (!statementObj.terminated && isLastStatement && !queryEndsWithTerminator && !delimiterDetectionBlocked) {
      errors.push(`Statement ${statementNo}: Missing terminator ';' at end of query.`);
    }

    validateClauseSequence(statement, statementNo, errors, warnings, parserInfo);

    if (parserInfo.type === "SELECT") {
      validateSelectCommas(statement, statementNo, errors, warnings);
    }

    parsedStatements.push(parserInfo);
  });

  return {
    errors,
    warnings,
    statements: parsedStatements,
  };
}

function formatSqlQuery(query) {
  let output = query.replace(/\s+/g, " ").trim();
  output = uppercaseSqlKeywords(output);
  const breakKeywords = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET", "UNION ALL", "UNION", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "JOIN", "ON"];
  breakKeywords.forEach((keyword) => {
    const pattern = keyword.split(" ").join("\\s+");
    const regex = new RegExp(`\\s*\\b${pattern}\\b\\s*`, "g");
    output = output.replace(regex, `\n${keyword} `);
  });
  output = output.replace(/,\s*/g, ",\n  ");
  output = output.replace(/\n{2,}/g, "\n").trim();
  return output;
}

function minifySqlQuery(query) {
  return uppercaseSqlKeywords(query.replace(/\s+/g, " ").trim());
}

function renderValidationIssues(validation) {
  const rows = ["SQL Validation Failed:", ""];
  validation.errors.forEach((item) => rows.push(`- ${item}`));
  if (validation.warnings.length) {
    rows.push("", "Warnings:");
    validation.warnings.forEach((item) => rows.push(`- ${item}`));
  }
  if (sqlOutput) sqlOutput.textContent = rows.join("\n");
  if (sqlStatus) sqlStatus.textContent = `SQL Formatter: Validation failed (${validation.errors.length} issue(s))`;
}

function renderParserSummary(validation) {
  const rows = ["SQL Parser Summary:", ""];

  validation.statements.forEach((stmt) => {
    rows.push(`Statement ${stmt.number}`);
    rows.push(`- Type: ${stmt.type}`);
    rows.push(`- Terminator: ${stmt.terminated ? "Present" : "Missing"}`);
    rows.push(`- Clauses: ${stmt.clauses.length ? stmt.clauses.join(", ") : "Not detected"}`);
    rows.push(`- Tables: ${stmt.tables.length ? stmt.tables.join(", ") : "Not detected"}`);
    rows.push("");
  });

  if (validation.errors.length) {
    rows.push("Errors:");
    validation.errors.forEach((item) => rows.push(`- ${item}`));
    rows.push("");
  }

  if (validation.warnings.length) {
    rows.push("Warnings:");
    validation.warnings.forEach((item) => rows.push(`- ${item}`));
    rows.push("");
  }

  if (sqlOutput) sqlOutput.textContent = rows.join("\n").trim();

  if (validation.errors.length) {
    if (sqlStatus) sqlStatus.textContent = `SQL Formatter: Parser found ${validation.errors.length} error(s)`;
  } else if (validation.warnings.length) {
    if (sqlStatus) sqlStatus.textContent = `SQL Formatter: Parsed with ${validation.warnings.length} warning(s)`;
  } else {
    if (sqlStatus) sqlStatus.textContent = "SQL Formatter: SQL parsed successfully";
  }
}

function runFormatSql() {
  const input = sqlInput ? sqlInput.value : "";
  if (!input.trim()) {
    if (sqlStatus) sqlStatus.textContent = "SQL Formatter: Enter SQL first";
    return;
  }

  const validation = validateSqlQuery(input);
  if (validation.errors.length) {
    renderValidationIssues(validation);
    return;
  }

  const formatted = formatSqlQuery(input);
  if (sqlOutput) sqlOutput.textContent = formatted;

  if (validation.warnings.length) {
    if (sqlStatus) sqlStatus.textContent = `SQL Formatter: Formatted with ${validation.warnings.length} warning(s)`;
  } else if (sqlStatus) {
    sqlStatus.textContent = "SQL Formatter: Formatted successfully";
  }
}

function runMinifySql() {
  const input = sqlInput ? sqlInput.value : "";
  if (!input.trim()) {
    if (sqlStatus) sqlStatus.textContent = "SQL Formatter: Enter SQL first";
    return;
  }

  const validation = validateSqlQuery(input);
  if (validation.errors.length) {
    renderValidationIssues(validation);
    return;
  }

  if (sqlOutput) sqlOutput.textContent = minifySqlQuery(input);

  if (validation.warnings.length) {
    if (sqlStatus) sqlStatus.textContent = `SQL Formatter: Minified with ${validation.warnings.length} warning(s)`;
  } else if (sqlStatus) {
    sqlStatus.textContent = "SQL Formatter: Minified successfully";
  }
}

function runParseSql() {
  const input = sqlInput ? sqlInput.value : "";
  if (!input.trim()) {
    if (sqlStatus) sqlStatus.textContent = "SQL Formatter: Enter SQL first";
    return;
  }

  const validation = validateSqlQuery(input);
  renderParserSummary(validation);
}

if (sqlFormatBtn) {
  sqlFormatBtn.addEventListener("click", runFormatSql);
}

if (sqlMinifyBtn) {
  sqlMinifyBtn.addEventListener("click", runMinifySql);
}

if (sqlParseBtn) {
  sqlParseBtn.addEventListener("click", runParseSql);
}

if (sqlCopyBtn) {
  sqlCopyBtn.addEventListener("click", async () => {
    const output = (sqlOutput ? sqlOutput.textContent : "").trim();
    if (!output) {
      if (sqlStatus) sqlStatus.textContent = "SQL Formatter: No output to copy";
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      if (sqlStatus) sqlStatus.textContent = "SQL Formatter: Output copied";
    } catch {
      if (sqlStatus) sqlStatus.textContent = "SQL Formatter: Copy not allowed";
    }
  });
}

if (sqlClearBtn) {
  sqlClearBtn.addEventListener("click", () => {
    if (sqlInput) sqlInput.value = "";
    if (sqlOutput) sqlOutput.textContent = "Formatted SQL will appear here.";
    if (sqlStatus) sqlStatus.textContent = "SQL Formatter: Ready";
  });
}
