const pdfTextInput = document.getElementById("pdfTextInput");
const textToPdfBtn = document.getElementById("textToPdfBtn");
const pdfImageInput = document.getElementById("pdfImageInput");
const imagesToPdfBtn = document.getElementById("imagesToPdfBtn");
const wordToPdfInput = document.getElementById("wordToPdfInput");
const wordToPdfBtn = document.getElementById("wordToPdfBtn");
const pdfToWordInput = document.getElementById("pdfToWordInput");
const pdfToWordBtn = document.getElementById("pdfToWordBtn");
const pdfStatus = document.getElementById("pdfStatus");

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function getJsPdf() {
  return window.jspdf?.jsPDF || null;
}

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsArrayBuffer(file);
  });
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function exportTextToPdf(text, fileName) {
  const JsPdf = getJsPdf();
  if (!JsPdf) {
    throw new Error("PDF library not loaded");
  }

  const doc = new JsPdf({ unit: "pt", format: "a4" });
  const left = 40;
  const top = 50;
  const maxWidth = 515;
  const lines = doc.splitTextToSize(text || " ", maxWidth);
  doc.text(lines, left, top);
  doc.save(fileName);
}

async function extractTextFromWordLikeFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) {
    return file.text();
  }

  const buffer = await readAsArrayBuffer(file);
  if (name.endsWith(".docx")) {
    if (!window.mammoth) {
      throw new Error("Word converter library not loaded");
    }
    const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || "";
  }

  return new TextDecoder().decode(buffer);
}

async function extractTextFromPdf(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF reader library not loaded");
  }

  const buffer = await readAsArrayBuffer(file);
  const pdfDoc = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const pageTexts = [];

  for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo += 1) {
    const page = await pdfDoc.getPage(pageNo);
    const textContent = await page.getTextContent();
    const line = textContent.items.map((item) => item.str).join(" ");
    pageTexts.push(line);
  }

  return pageTexts.join("\n\n");
}

function downloadWordDoc(fileName, content) {
  const docContent = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>${(content || "").replace(/\n/g, "<br>")}</body>
    </html>
  `;
  const blob = new Blob([docContent], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

if (textToPdfBtn) {
  textToPdfBtn.addEventListener("click", () => {
    try {
      const text = pdfTextInput.value.trim();
      if (!text) {
        pdfStatus.textContent = "PDF Hub: Enter text first";
        return;
      }
      exportTextToPdf(text, "text-to-pdf.pdf");
      pdfStatus.textContent = "PDF Hub: Text converted to PDF";
    } catch (error) {
      pdfStatus.textContent = `PDF Hub: ${error.message}`;
    }
  });
}

if (imagesToPdfBtn) {
  imagesToPdfBtn.addEventListener("click", async () => {
    try {
      const files = Array.from(pdfImageInput.files || []);
      if (!files.length) {
        pdfStatus.textContent = "PDF Hub: Select image files first";
        return;
      }

      const JsPdf = getJsPdf();
      if (!JsPdf) {
        throw new Error("PDF library not loaded");
      }

      const doc = new JsPdf({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let i = 0; i < files.length; i += 1) {
        const imageData = await readAsDataURL(files[i]);
        const image = new Image();
        image.src = imageData;
        await new Promise((resolve) => {
          image.onload = resolve;
        });

        const ratio = Math.min(pageWidth / image.width, pageHeight / image.height);
        const renderWidth = image.width * ratio;
        const renderHeight = image.height * ratio;
        const x = (pageWidth - renderWidth) / 2;
        const y = (pageHeight - renderHeight) / 2;
        const format = imageData.startsWith("data:image/png") ? "PNG" : "JPEG";

        if (i > 0) doc.addPage();
        doc.addImage(imageData, format, x, y, renderWidth, renderHeight);
      }

      doc.save("images-to-pdf.pdf");
      pdfStatus.textContent = "PDF Hub: Images converted to PDF";
    } catch (error) {
      pdfStatus.textContent = `PDF Hub: ${error.message}`;
    }
  });
}

if (wordToPdfBtn) {
  wordToPdfBtn.addEventListener("click", async () => {
    try {
      const file = wordToPdfInput.files?.[0];
      if (!file) {
        pdfStatus.textContent = "PDF Hub: Select a Word/TXT file first";
        return;
      }

      const text = await extractTextFromWordLikeFile(file);
      const safeText = text.trim() || "No readable text found in this file.";
      exportTextToPdf(safeText, "word-to-pdf.pdf");
      pdfStatus.textContent = "PDF Hub: File converted to PDF";
    } catch (error) {
      pdfStatus.textContent = `PDF Hub: ${error.message}`;
    }
  });
}

if (pdfToWordBtn) {
  pdfToWordBtn.addEventListener("click", async () => {
    try {
      const file = pdfToWordInput.files?.[0];
      if (!file) {
        pdfStatus.textContent = "PDF Hub: Select PDF file first";
        return;
      }

      const extractedText = await extractTextFromPdf(file);
      downloadWordDoc("pdf-to-word.doc", extractedText || "No text extracted from PDF.");
      pdfStatus.textContent = "PDF Hub: PDF converted to Word (.doc)";
    } catch (error) {
      pdfStatus.textContent = `PDF Hub: ${error.message}`;
    }
  });
}

