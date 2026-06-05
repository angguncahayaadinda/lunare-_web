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

export const generatePDFReport = async () => {
  const element = document.getElementById("pdf-report-content");
  if (!element) {
    throw new Error("Report content element not found");
  }

  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(180, 175, 190);
    pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 8, {
      align: "center",
    });
  }

  pdf.save(`Laporan_Kesehatan_Lunare_${dayjs().format("YYYY-MM-DD")}.pdf`);
};

