import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "@/types/order";
import { formatDate } from "@/utils/format";

function formatCurrencyPdf(amount: number) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F CFA";
}

export function generateInvoicePdf(order: Order) {
  // Format Ticket de caisse (80mm)
  const estimatedHeight = 130 + (order.items.length * 18);
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, estimatedHeight]
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10; // Plus de padding sur les côtés
  let y = 15;

  // Header - Centré
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("KHIDMA SHOP", pageWidth / 2, y, { align: "center" });
  
  y += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Rufisque, Tally Bou Bess", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text("près Usine vinaigre", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text("+221 77 862 70 52", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setFontSize(10);
  doc.text("-".repeat(40), pageWidth / 2, y, { align: "center" });

  // Order Info
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`REÇU DE CAISSE`, pageWidth / 2, y, { align: "center" });
  
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`NUMÉRO: ${order.id.substring(0, 12).toUpperCase()}`, margin, y);
  y += 5;
  doc.text(`DATE: ${formatDate(order.createdAt)}`, margin, y);

  y += 6;
  doc.text("-".repeat(40), pageWidth / 2, y, { align: "center" });

  // Client Info
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text(`CLIENT:`, margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(order.customerName, margin, y);
  y += 5;
  doc.text(order.phone, margin, y);
  if (order.address) {
    const addressLines = doc.splitTextToSize(order.address, pageWidth - (2 * margin));
    doc.text(addressLines.slice(0, 2), margin, y + 5);
    y += (addressLines.length > 1 ? 10 : 5);
  }

  y += 8;
  doc.text("-".repeat(40), pageWidth / 2, y, { align: "center" });

  // Table Data
  y += 5;
  const tableData = order.items.map(item => [
    item.productSnapshot.name + (item.size ? ` (${item.size})` : ''),
    item.quantity.toString(),
    formatCurrencyPdf(item.productSnapshot.price * item.quantity)
  ]);

  autoTable(doc, {
    startY: y,
    head: [['ARTICLE', 'QTÉ', 'TOTAL']],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' },
    },
    theme: 'plain',
    styles: {
      cellPadding: 2,
    }
  });

  // Totals
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.text("-".repeat(40), pageWidth / 2, y, { align: "center" });
  
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL À PAYER", margin, y);
  
  doc.setFontSize(11);
  const total = formatCurrencyPdf(order.total);
  doc.text(total, pageWidth - margin, y, { align: "right" });

  // Footer
  y += 20;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Merci de votre achat !", pageWidth / 2, y, { align: "center" });
  
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("KHIDMA SHOP - Qualité & Service", pageWidth / 2, y, { align: "center" });

  // Sauvegarde
  doc.save(`recu-${order.id.substring(0, 8).toUpperCase()}.pdf`);
}