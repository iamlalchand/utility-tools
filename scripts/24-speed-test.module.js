(function registerSpeedTestModule(global) {
  const modules = (global.UtilitySuiteModules = global.UtilitySuiteModules || {});

  modules.createSpeedTestModule = function createSpeedTestModule(elements) {
    const {
      bytesSelect,
      runButton,
      result,
      meta,
      progressBar,
      finalCard,
      finalDownload,
      finalUpload,
      finalLatency,
      finalServer,
      finalVerdict,
    } = elements;

    const speedDownEndpoint = "https://speed.cloudflare.com/__down?bytes=";
    const speedUpEndpoint = "https://speed.cloudflare.com/__up";
    let speedTestRunId = 0;

    function formatSpeedMbps(value) {
      const safe = Number(value) || 0;
      return `${safe >= 100 ? safe.toFixed(1) : safe.toFixed(2)} Mbps`;
    }

    function formatOptionalSpeedMbps(value) {
      return Number.isFinite(Number(value)) ? formatSpeedMbps(value) : "Unavailable";
    }

    function getSpeedServerLabel() {
      return "Cloudflare Edge (auto)";
    }

    function setSpeedProgress(percent) {
      if (!progressBar) return;
      const safePercent = Math.min(Math.max(percent, 0), 100);
      progressBar.style.width = `${safePercent}%`;
    }

    function setSpeedTestingState(isRunning) {
      if (!runButton) return;
      runButton.disabled = isRunning;
      runButton.textContent = isRunning ? "Testing..." : "Run Speed Test";
    }

    function getSpeedVerdict(downloadMbps, latencyMs) {
      if (!Number.isFinite(downloadMbps) || downloadMbps <= 0) {
        return "Could not measure network speed. Please retry with stable internet.";
      }

      if (Number.isFinite(latencyMs) && downloadMbps >= 100 && latencyMs <= 20) {
        return "Your internet connection is very fast. Streaming, gaming and video calls should be smooth.";
      }
      if (Number.isFinite(latencyMs) && downloadMbps >= 50 && latencyMs <= 35) {
        return "Your internet connection is good for HD streaming, meetings and regular work.";
      }
      if (downloadMbps >= 20) {
        return "Your internet connection is moderate. It should handle daily browsing and streaming.";
      }
      return "Your internet connection is slow. Large downloads and HD streaming may take time.";
    }

    function estimateFallbackSpeed(downloadHint) {
      const fallbackHint = Number.isFinite(downloadHint) ? downloadHint : 0;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const downlink = Number(connection?.downlink);
      const rtt = Number(connection?.rtt);
      const download =
        Number.isFinite(fallbackHint) && fallbackHint > 0
          ? fallbackHint
          : Number.isFinite(downlink) && downlink > 0
            ? downlink
            : null;
      const upload = Number.isFinite(downlink) && downlink > 0 ? downlink * 0.5 : null;
      const latency = Number.isFinite(rtt) && rtt > 0 ? rtt : null;
      return { download, upload, latency };
    }

    function renderSpeedFinal(download, upload, latency, server, note) {
      if (!finalCard) return;
      const messageNote = note || "";
      finalDownload.textContent = formatOptionalSpeedMbps(download);
      finalUpload.textContent = formatOptionalSpeedMbps(upload);
      finalLatency.textContent = Number.isFinite(latency) ? `Latency: ${Math.round(latency)} ms` : "Latency: Unavailable";
      finalServer.textContent = `Server: ${server}`;
      const verdict = getSpeedVerdict(download, latency);
      finalVerdict.textContent = messageNote ? `${verdict} (${messageNote})` : verdict;
      finalCard.classList.remove("hidden");
    }

    async function speedFetch(url, options, timeoutMs) {
      const requestOptions = options || {};
      const timeout = Number.isFinite(timeoutMs) ? timeoutMs : 20000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        return await fetch(url, { cache: "no-store", mode: "cors", ...requestOptions, signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
    }

    async function measureSpeedLatency(sampleCount, runId) {
      const samples = [];
      for (let i = 0; i < sampleCount; i += 1) {
        if (runId !== speedTestRunId) throw new Error("cancelled");
        const started = performance.now();
        const response = await speedFetch(`${speedDownEndpoint}2048&seed=${Date.now()}-${i}`);
        if (!response.ok) throw new Error("latency-request-failed");
        await response.arrayBuffer();
        const elapsed = performance.now() - started;
        samples.push(elapsed);
      }

      const sorted = [...samples].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    }

    async function measureDownloadStream(bytes, runId, streamId, onChunk) {
      const response = await speedFetch(`${speedDownEndpoint}${bytes}&seed=${Date.now()}-${streamId}-${Math.random()}`);
      if (!response.ok) throw new Error("download-request-failed");

      if (!response.body || !response.body.getReader) {
        const buffer = await response.arrayBuffer();
        onChunk(buffer.byteLength);
        return buffer.byteLength;
      }

      const reader = response.body.getReader();
      let streamBytes = 0;

      while (true) {
        if (runId !== speedTestRunId) throw new Error("cancelled");
        const payload = await reader.read();
        if (payload.done) break;
        streamBytes += payload.value.byteLength;
        onChunk(payload.value.byteLength);
      }

      return streamBytes;
    }

    async function measureSpeedUpload(bytes, runId) {
      if (runId !== speedTestRunId) throw new Error("cancelled");

      const streamCount = 2;
      const perStreamBytes = Math.max(500000, Math.floor(bytes / streamCount));
      const totalBytes = perStreamBytes * streamCount;

      const started = performance.now();
      const uploadTasks = Array.from({ length: streamCount }, (_, index) => {
        const payload = new Uint8Array(perStreamBytes);
        return speedFetch(
          `${speedUpEndpoint}?seed=${Date.now()}-${index}-${Math.random()}`,
          {
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/octet-stream" },
          },
          25000,
        );
      });

      const responses = await Promise.all(uploadTasks);
      responses.forEach((response) => {
        if (!response.ok) throw new Error("upload-request-failed");
      });

      await Promise.all(responses.map((response) => response.arrayBuffer().catch(() => null)));
      const elapsedSec = Math.max((performance.now() - started) / 1000, 0.001);
      const mbps = (totalBytes * 8) / (elapsedSec * 1000000);
      return { mbps };
    }

    async function measureSpeedDownload(bytes, runId) {
      const streamCount = bytes >= 25000000 ? 2 : 3;
      const perStreamBytes = Math.max(1000000, Math.floor(bytes / streamCount));
      const expectedBytes = perStreamBytes * streamCount;
      const started = performance.now();
      let totalReceived = 0;
      let lastTickBytes = 0;
      let lastTickAt = started;

      const onChunk = (chunkSize) => {
        totalReceived += chunkSize;
        const now = performance.now();
        const elapsedSec = Math.max((now - started) / 1000, 0.001);
        const avgMbps = (totalReceived * 8) / (elapsedSec * 1000000);
        const tickElapsedSec = Math.max((now - lastTickAt) / 1000, 0.001);
        const tickBytes = totalReceived - lastTickBytes;
        const currentMbps = (tickBytes * 8) / (tickElapsedSec * 1000000);
        lastTickAt = now;
        lastTickBytes = totalReceived;

        if (result) result.textContent = `Current Speed: ${formatSpeedMbps(Math.max(currentMbps, avgMbps))}`;
        if (meta) meta.textContent = `Testing download... ${Math.min((totalReceived / expectedBytes) * 100, 100).toFixed(0)}%`;
        setSpeedProgress((totalReceived / expectedBytes) * 100);
      };

      await Promise.all(
        Array.from({ length: streamCount }, (_, index) => measureDownloadStream(perStreamBytes, runId, index, onChunk)),
      );

      if (runId !== speedTestRunId) throw new Error("cancelled");
      const totalElapsedSec = Math.max((performance.now() - started) / 1000, 0.001);
      const finalMbps = (totalReceived * 8) / (totalElapsedSec * 1000000);
      setSpeedProgress(100);
      return { mbps: finalMbps, bytes: totalReceived };
    }

    async function runSpeedTest() {
      const runId = speedTestRunId + 1;
      speedTestRunId = runId;

      const selectedBytes = Math.max(5000000, Number(bytesSelect.value) || 10000000);
      const uploadBytes = Math.max(1000000, Math.min(Math.floor(selectedBytes / 2), 10000000));
      const serverLabel = getSpeedServerLabel();

      finalCard.classList.add("hidden");
      result.textContent = "Current Speed: 0.00 Mbps";
      meta.textContent = "Preparing speed test...";
      setSpeedProgress(0);
      setSpeedTestingState(true);

      try {
        let latencyMs = null;
        try {
          latencyMs = await measureSpeedLatency(5, runId);
        } catch {
          latencyMs = null;
        }

        if (runId !== speedTestRunId) return;
        meta.textContent = "Testing download throughput...";
        const downloadResult = await measureSpeedDownload(selectedBytes, runId);
        if (runId !== speedTestRunId) return;

        result.textContent = `Current Speed: ${formatSpeedMbps(downloadResult.mbps)}`;
        meta.textContent = "Testing upload throughput...";
        setSpeedProgress(0);

        let uploadMbps = null;
        try {
          const uploadResult = await measureSpeedUpload(uploadBytes, runId);
          uploadMbps = uploadResult.mbps;
        } catch {
          uploadMbps = null;
        }

        if (runId !== speedTestRunId) return;
        const fallback = estimateFallbackSpeed(downloadResult.mbps);
        const finalDownloadValue = downloadResult.mbps;
        const finalUploadValue = uploadMbps;
        const finalLatencyValue = latencyMs ?? fallback.latency;
        const uploadText = formatOptionalSpeedMbps(finalUploadValue);
        const latencyText = Number.isFinite(finalLatencyValue) ? `${Math.round(finalLatencyValue)} ms` : "Unavailable";

        result.textContent = `Final Download: ${formatSpeedMbps(finalDownloadValue)}`;
        meta.textContent = `Final Upload: ${uploadText} | Latency: ${latencyText}`;
        setSpeedProgress(100);
        renderSpeedFinal(
          finalDownloadValue,
          finalUploadValue,
          finalLatencyValue,
          serverLabel,
          uploadMbps ? "" : "Upload could not be measured directly on this network/browser",
        );
      } catch {
        if (runId !== speedTestRunId) return;
        const fallback = estimateFallbackSpeed();
        result.textContent = `Final Download: ${formatOptionalSpeedMbps(fallback.download)}`;
        meta.textContent = `Final Upload: ${formatOptionalSpeedMbps(fallback.upload)} | Latency: ${
          Number.isFinite(fallback.latency) ? `${Math.round(fallback.latency)} ms` : "Unavailable"
        }`;
        setSpeedProgress(100);
        renderSpeedFinal(
          fallback.download,
          fallback.upload,
          fallback.latency,
          serverLabel,
          "Live endpoint unavailable, showing browser network estimate",
        );
      } finally {
        if (runId === speedTestRunId) setSpeedTestingState(false);
      }
    }

    return {
      runSpeedTest,
    };
  };
})(window);
