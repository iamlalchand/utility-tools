function buildToolHashUrl(toolKey) {
  const url = new URL(window.location.href);
  url.hash = `#tool/${encodeURIComponent(toolKey)}`;
  return url.toString();
}

function escapeHtml(rawValue) {
  return `${rawValue ?? ""}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getToolDirectoryData() {
  return dashboardToolCards
    .map((card) => {
      const key = card.dataset.openTool || "";
      const title = card.querySelector("h3")?.textContent?.trim() || toolMeta[key]?.title || key;
      const description = card.querySelector("p:not(.tool-icon)")?.textContent?.trim() || toolMeta[key]?.description || "";
      if (!key || !title) return null;
      return { key, title, description };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function inferToolCategory(tool) {
  const text = `${tool.key} ${tool.title} ${tool.description}`.toLowerCase();
  if (/(calc|emi|budget|split|pin|pass|crypto)/.test(text)) return "Finance & Calculation";
  if (/(json|sql|regex|cron|encode|decode|case|dev|api|diff)/.test(text)) return "Developer Utilities";
  if (/(note|contact|time|clock|weather|news|qr|pdf|file|share)/.test(text)) return "Productivity";
  if (/(game|love|fun|wallpaper)/.test(text)) return "Fun & Lifestyle";
  return "General";
}

function summarizeToolCategories(tools) {
  const bucket = new Map();
  tools.forEach((tool) => {
    const category = inferToolCategory(tool);
    bucket.set(category, (bucket.get(category) || 0) + 1);
  });
  return Array.from(bucket.entries()).sort((a, b) => b[1] - a[1]);
}

function renderCategoryBadges(summary) {
  return summary
    .map(([name, count]) => `<span class="chip">${escapeHtml(name)} <strong>${count}</strong></span>`)
    .join("");
}

function renderToolDirectory(tools) {
  return tools
    .map((tool) => {
      const link = buildToolHashUrl(tool.key);
      return `
        <article class="tool-row">
          <div>
            <h3>${escapeHtml(tool.title)}</h3>
            <p>${escapeHtml(tool.description)}</p>
          </div>
          <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Open</a>
        </article>
      `;
    })
    .join("");
}

function renderFooterDocShell({ title, subtitle, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Utility Suite</title>
  <style>
    :root {
      --bg: #f8f5f2;
      --card: #ffffff;
      --text: #2f2932;
      --muted: #6f6574;
      --border: #e6d8d2;
      --primary: #d04d30;
      --primary2: #f17855;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 86% 4%, rgba(208, 77, 48, 0.08), transparent 35%),
        radial-gradient(circle at 8% 0%, rgba(241, 120, 85, 0.08), transparent 28%),
        var(--bg);
    }
    .wrap {
      width: min(1100px, 92vw);
      margin: 34px auto 42px;
    }
    .hero {
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      background: linear-gradient(155deg, #fffdfc, #fff8f5);
      box-shadow: 0 18px 32px rgba(80, 40, 35, 0.08);
    }
    .kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 6px 11px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
      background: #fff;
    }
    .kicker::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--primary), var(--primary2));
    }
    h1 {
      margin: 14px 0 8px;
      font-size: clamp(1.55rem, 3.2vw, 2.25rem);
      line-height: 1.2;
    }
    .subtitle {
      margin: 0;
      color: var(--muted);
      font-size: 1.02rem;
      line-height: 1.55;
    }
    .meta {
      margin-top: 10px;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .section {
      margin-top: 18px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: var(--card);
      padding: 18px;
    }
    .section h2 {
      margin: 0 0 10px;
      font-size: 1.08rem;
    }
    .grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    }
    .stat {
      border: 1px solid var(--border);
      border-radius: 14px;
      background: #fff;
      padding: 12px;
    }
    .stat p { margin: 0; color: var(--muted); font-size: 0.88rem; }
    .stat strong { display: block; margin-top: 4px; font-size: 1.4rem; color: var(--primary); }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }
    .chip {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 8px 12px;
      background: #fff9f6;
      font-size: 0.86rem;
      color: var(--text);
    }
    .chip strong { color: var(--primary); margin-left: 4px; }
    .tool-list {
      display: grid;
      gap: 10px;
    }
    .tool-row {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      background: #fff;
    }
    .tool-row h3 {
      margin: 0;
      font-size: 1rem;
    }
    .tool-row p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
      max-width: 760px;
    }
    .tool-row a {
      text-decoration: none;
      color: #fff;
      background: linear-gradient(135deg, var(--primary), var(--primary2));
      padding: 8px 12px;
      border-radius: 10px;
      font-weight: 700;
      border: 1px solid color-mix(in srgb, var(--primary) 65%, #0000);
      white-space: nowrap;
    }
    ul {
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
      line-height: 1.6;
    }
    a.inline {
      color: var(--primary);
      text-decoration: none;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <span class="kicker">Utility Suite</span>
      <h1>${escapeHtml(title)}</h1>
      <p class="subtitle">${escapeHtml(subtitle)}</p>
      <p class="meta">Auto-generated from current app data. Opened: ${escapeHtml(new Date().toLocaleString())}</p>
    </section>
    ${body}
  </main>
</body>
</html>`;
}

function openFooterGeneratedPage(payload) {
  const html = renderFooterDocShell(payload);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const newTab = window.open("about:blank", "_blank");
  if (!newTab) {
    console.warn("Utility Suite: Popup blocked. Allow popups to open footer pages in a new tab.");
    URL.revokeObjectURL(blobUrl);
    return;
  }
  try {
    newTab.opener = null;
  } catch {
    // Ignore if browser prevents modifying opener.
  }
  newTab.location.replace(blobUrl);
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
}

function openFooterActionPage(action) {
  const tools = getToolDirectoryData();
  const categorySummary = summarizeToolCategories(tools);
  const toolsOpenLink = buildToolHashUrl("contact");
  const totalTools = tools.length;

  if (action === "about") {
    const body = `
      <section class="section">
        <h2>Application Overview</h2>
        <p class="subtitle">Utility Suite is a multi-tool web workspace for daily tasks. Each tool opens in a dedicated panel, with search, themes, and a single dashboard to keep workflows fast and simple.</p>
      </section>
      <section class="section">
        <h2>Core Capabilities</h2>
        <ul>
          <li>One-dashboard workflow with component-wise tool panels.</li>
          <li>Global tool search, theme switching, and quick navigation.</li>
          <li>Persistent utilities like notes, password generation, clocks, converters, and formatter tools.</li>
          <li>Footer quick links that open tools and support pages in new tabs.</li>
        </ul>
      </section>
      <section class="section">
        <h2>Current Snapshot</h2>
        <div class="grid">
          <article class="stat"><p>Total Utilities</p><strong>${totalTools}</strong></article>
          <article class="stat"><p>Available Themes</p><strong>${allowedThemes.size}</strong></article>
          <article class="stat"><p>Primary Entry Mode</p><strong>Dashboard + Tool Panels</strong></article>
        </div>
      </section>
      <section class="section">
        <h2>Utility Categories</h2>
        <div class="chips">${renderCategoryBadges(categorySummary)}</div>
      </section>
      <section class="section">
        <h2>Tool Directory (Live)</h2>
        <div class="tool-list">${renderToolDirectory(tools)}</div>
      </section>
    `;
    openFooterGeneratedPage({
      title: "About Application",
      subtitle: "Full overview of what this app does and what utilities are currently available.",
      body,
    });
    return;
  }

  if (action === "updates") {
    const body = `
      <section class="section">
        <h2>How This Page Stays Updated</h2>
        <ul>
          <li>This page reads utility data directly from the current dashboard cards and tool metadata.</li>
          <li>Whenever tools are added, removed, renamed, or descriptions change, this page reflects those changes automatically.</li>
          <li>No manual content editing is required for core utility listings.</li>
        </ul>
      </section>
      <section class="section">
        <h2>Recent UX Improvements</h2>
        <div class="tool-list">
          <article class="tool-row"><div><h3>Modular Code Structure</h3><p>Large JS/CSS blocks were split into smaller modules to improve maintainability and readability.</p></div></article>
          <article class="tool-row"><div><h3>Footer Quick Link Enhancements</h3><p>Action links open dedicated generated pages in a new tab with live project data.</p></div></article>
          <article class="tool-row"><div><h3>Visual Refinements</h3><p>Hero logo and card icon sizing tuned for clearer visual hierarchy across screen sizes.</p></div></article>
        </div>
      </section>
      <section class="section">
        <h2>Current Distribution</h2>
        <div class="chips">${renderCategoryBadges(categorySummary)}</div>
      </section>
      <section class="section">
        <h2>Current Tools</h2>
        <div class="tool-list">${renderToolDirectory(tools)}</div>
      </section>
    `;
    openFooterGeneratedPage({
      title: "Feature Updates",
      subtitle: "Live status page generated from the current project configuration.",
      body,
    });
    return;
  }

  if (action === "faq") {
    const body = `
      <section class="section">
        <h2>Support & FAQ</h2>
        <div class="tool-list">
          <article class="tool-row"><div><h3>How do I open a utility?</h3><p>Use any dashboard card or sidebar action. Tools open in the workspace panel.</p></div></article>
          <article class="tool-row"><div><h3>Can I open tools in new tabs?</h3><p>Yes. Footer utility links open directly in a new tab using tool-specific hash routes.</p></div></article>
          <article class="tool-row"><div><h3>How many tools are currently available?</h3><p>There are <strong>${totalTools}</strong> active utility cards at the moment.</p></div></article>
          <article class="tool-row"><div><h3>How to contact support?</h3><p>Email: <a class="inline" href="mailto:${escapeHtml(ssContactInfo.email)}">${escapeHtml(ssContactInfo.email)}</a><br>Phone: <a class="inline" href="${escapeHtml(toTelHref(ssContactInfo.phone_india))}">${escapeHtml(ssContactInfo.phone_india)}</a><br>WhatsApp: <a class="inline" href="${escapeHtml(toTelHref(ssContactInfo.whatsapp))}">${escapeHtml(ssContactInfo.whatsapp)}</a></p></div><a href="${escapeHtml(toolsOpenLink)}" target="_blank" rel="noopener noreferrer">Open Contact Tool</a></article>
        </div>
      </section>
      <section class="section">
        <h2>Quick Troubleshooting</h2>
        <ul>
          <li>If a tool seems empty, refresh the page once and open from the dashboard card.</li>
          <li>Allow popups for localhost/browser session so footer support pages open correctly.</li>
          <li>For API-based tools (weather/news/crypto), temporary network/API errors can affect results.</li>
          <li>If data still does not load, share a screenshot + tool name with support for quick resolution.</li>
        </ul>
      </section>
    `;
    openFooterGeneratedPage({
      title: "Support & FAQ",
      subtitle: "Common questions and support details.",
      body,
    });
    return;
  }

  openFooterGeneratedPage({
    title: "Quick Link",
    subtitle: "Requested footer page is not mapped yet.",
    body: `
      <section class="section">
        <h2>Page Under Setup</h2>
        <p class="subtitle">This quick-link action is not mapped to a dedicated page yet. Please use About Application, Feature Updates, or Support & FAQ.</p>
      </section>
    `,
  });
}

function initializeFooterLinkBehavior() {
  footerToolLinks.forEach((link) => {
    const toolKey = link.dataset.footerTool;
    if (!toolKey) return;
    link.href = buildToolHashUrl(toolKey);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  footerActionLinks.forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openFooterActionPage(link.dataset.footerAction || "");
    });
  });
}
