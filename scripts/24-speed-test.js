const speedBytesSelect = document.getElementById("speedBytesSelect");
const runSpeedTestBtn = document.getElementById("runSpeedTestBtn");
const speedTestResult = document.getElementById("speedTestResult");
const speedTestMeta = document.getElementById("speedTestMeta");
const speedProgressBar = document.getElementById("speedProgressBar");
const speedFinalCard = document.getElementById("speedFinalCard");
const speedFinalDownload = document.getElementById("speedFinalDownload");
const speedFinalUpload = document.getElementById("speedFinalUpload");
const speedFinalLatency = document.getElementById("speedFinalLatency");
const speedFinalServer = document.getElementById("speedFinalServer");
const speedFinalVerdict = document.getElementById("speedFinalVerdict");

const createSpeedTestModule = window.UtilitySuiteModules?.createSpeedTestModule;

if (
  typeof createSpeedTestModule === "function" &&
  speedBytesSelect &&
  runSpeedTestBtn &&
  speedTestResult &&
  speedTestMeta &&
  speedProgressBar &&
  speedFinalCard &&
  speedFinalDownload &&
  speedFinalUpload &&
  speedFinalLatency &&
  speedFinalServer &&
  speedFinalVerdict
) {
  const speedModule = createSpeedTestModule({
    bytesSelect: speedBytesSelect,
    runButton: runSpeedTestBtn,
    result: speedTestResult,
    meta: speedTestMeta,
    progressBar: speedProgressBar,
    finalCard: speedFinalCard,
    finalDownload: speedFinalDownload,
    finalUpload: speedFinalUpload,
    finalLatency: speedFinalLatency,
    finalServer: speedFinalServer,
    finalVerdict: speedFinalVerdict,
  });

  runSpeedTestBtn.addEventListener("click", () => speedModule.runSpeedTest());
}
