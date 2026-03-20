const ipLookupInput = document.getElementById("ipLookupInput");
const runIpLookupBtn = document.getElementById("runIpLookupBtn");
const ipLookupOutput = document.getElementById("ipLookupOutput");
const dnsLookupInput = document.getElementById("dnsLookupInput");
const dnsTypeSelect = document.getElementById("dnsTypeSelect");
const runDnsLookupBtn = document.getElementById("runDnsLookupBtn");
const dnsLookupOutput = document.getElementById("dnsLookupOutput");
const metaUrlInput = document.getElementById("metaUrlInput");
const runMetaLookupBtn = document.getElementById("runMetaLookupBtn");
const metaLookupOutput = document.getElementById("metaLookupOutput");

if (
  ipLookupInput &&
  runIpLookupBtn &&
  ipLookupOutput &&
  dnsLookupInput &&
  dnsTypeSelect &&
  runDnsLookupBtn &&
  dnsLookupOutput &&
  metaUrlInput &&
  runMetaLookupBtn &&
  metaLookupOutput
) {
  function prettyJson(data) {
    return JSON.stringify(data, null, 2);
  }

  runIpLookupBtn.addEventListener("click", async () => {
    const inputIp = ipLookupInput.value.trim();
    ipLookupOutput.textContent = "Loading IP details...";
    try {
      const endpoint = inputIp ? `https://ipwho.is/${encodeURIComponent(inputIp)}` : "https://ipwho.is/";
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("IP lookup failed");
      const payload = await response.json();
      if (payload?.success === false) throw new Error(payload?.message || "Invalid IP");
      ipLookupOutput.textContent = prettyJson({
        ip: payload.ip,
        type: payload.type,
        city: payload.city,
        region: payload.region,
        country: payload.country,
        latitude: payload.latitude,
        longitude: payload.longitude,
        isp: payload.connection?.isp,
        org: payload.connection?.org,
        timezone: payload.timezone?.id,
      });
    } catch (error) {
      ipLookupOutput.textContent = `IP Lookup Error: ${error.message}`;
    }
  });

  runDnsLookupBtn.addEventListener("click", async () => {
    const domain = dnsLookupInput.value.trim();
    const type = dnsTypeSelect.value || "A";
    if (!domain) {
      dnsLookupOutput.textContent = "Enter a domain first.";
      return;
    }

    dnsLookupOutput.textContent = "Resolving DNS records...";
    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
      );
      if (!response.ok) throw new Error("DNS API unavailable");
      const payload = await response.json();
      const answers = Array.isArray(payload?.Answer)
        ? payload.Answer.map((item) => ({
            name: item.name,
            type: item.type,
            ttl: item.TTL,
            data: item.data,
          }))
        : [];
      dnsLookupOutput.textContent = prettyJson({
        status: payload.Status,
        question: payload.Question?.[0] || null,
        answers,
      });
    } catch (error) {
      dnsLookupOutput.textContent = `DNS Lookup Error: ${error.message}`;
    }
  });

  runMetaLookupBtn.addEventListener("click", async () => {
    const url = metaUrlInput.value.trim();
    if (!url) {
      metaLookupOutput.textContent = "Enter a URL first.";
      return;
    }

    metaLookupOutput.textContent = "Fetching URL metadata...";
    try {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error("Metadata API unavailable");
      const payload = await response.json();
      if (payload?.status !== "success") throw new Error(payload?.message || "Could not fetch metadata");
      const data = payload.data || {};
      metaLookupOutput.textContent = prettyJson({
        title: data.title,
        description: data.description,
        publisher: data.publisher,
        author: data.author,
        image: data.image?.url || "",
        logo: data.logo?.url || "",
        url: data.url,
        lang: data.lang,
      });
    } catch (error) {
      metaLookupOutput.textContent = `URL Metadata Error: ${error.message}`;
    }
  });
}

