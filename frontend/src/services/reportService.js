import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";

const waitForImages = (element) => {
  const images = element.querySelectorAll("img");
  return Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = resolve;
          img.onerror = resolve;
        })
    )
  );
};

const getSectionElements = (container) => {
  const sections = [];
  const header = container.querySelector("header.pdf-doc-header");
  if (header) sections.push(header);

  const reportSections = Array.from(container.querySelectorAll(".pdf-report-section"));
  sections.push(...reportSections);

  const footer = container.querySelector("footer.pdf-footer");
  if (footer) sections.push(footer);

  return sections;
};

const sliceCanvas = (canvas, sliceHeightPx) => {
  const sliceCanvas = document.createElement("canvas");
  sliceCanvas.width = canvas.width;
  sliceCanvas.height = sliceHeightPx;
  const ctx = sliceCanvas.getContext("2d");
  ctx.drawImage(canvas, 0, 0, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
  return sliceCanvas;
};

export const generatePDFReport = async () => {
  const container = document.getElementById("pdf-report-content");
  if (!container) {
    throw new Error("Report content element not found");
  }

  await waitForImages(container);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const pdfWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    imageTimeout: 15000,
    allowTaint: true,
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const pageHeightPx = Math.floor((printableHeight * imgWidth) / pdfWidth);
  let offsetY = 0;

  while (offsetY < imgHeight) {
    const sliceHeightPx = Math.min(pageHeightPx, imgHeight - offsetY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = imgWidth;
    pageCanvas.height = sliceHeightPx;
    const ctx = pageCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, offsetY, imgWidth, sliceHeightPx, 0, 0, imgWidth, sliceHeightPx);

    const imageData = pageCanvas.toDataURL("image/png");
    const sliceHeightMm = (sliceHeightPx * pdfWidth) / imgWidth;
    pdf.addImage(imageData, "PNG", margin, margin, pdfWidth, sliceHeightMm);

    offsetY += sliceHeightPx;
    if (offsetY < imgHeight) {
      pdf.addPage();
    }
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 113, 146);
    pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  pdf.save(`Laporan_Kesehatan_Lunare_${dayjs().format("YYYY-MM-DD")}.pdf`);
};

