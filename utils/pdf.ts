import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "@/types/order";
import { formatDate } from "@/utils/format";

function formatCurrencyPdf(amount: number) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F CFA";
}

export function generateInvoicePdf(order: Order) {
  // Format Ticket de caisse (80mm)
  const estimatedHeight = 140 + (order.items.length * 15);
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, estimatedHeight]
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = 15;

  // Header - Centré
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("KHIDMA SHOP", pageWidth / 2, y, { align: "center" });
  
  y += 7;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Rufisque, Tally Bou Bess", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text("près Usine vinaigre", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text("+221 77 862 70 52", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.text("-".repeat(45), pageWidth / 2, y, { align: "center" });

  // Order Info
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`REÇU DE CAISSE`, pageWidth / 2, y, { align: "center" });
  
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`ID: ${order.id.substring(0, 12).toUpperCase()}`, pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text(`DATE: ${formatDate(order.createdAt)}`, pageWidth / 2, y, { align: "center" });

  y += 5;
  doc.text("-".repeat(45), pageWidth / 2, y, { align: "center" });

  // Client Info
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text(`CLIENT:`, margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.text(order.customerName, margin, y);
  y += 4;
  doc.text(order.phone, margin, y);
  if (order.address) {
    const addressLines = doc.splitTextToSize(order.address, pageWidth - (2 * margin));
    doc.text(addressLines.slice(0, 2), margin, y + 4);
    y += (addressLines.length > 1 ? 8 : 4);
  }

  y += 6;
  doc.text("-".repeat(45), pageWidth / 2, y, { align: "center" });

  // Table Data
  y += 4;
  const tableData = order.items.map(item => [
    item.productSnapshot.name + (item.size ? ` (${item.size})` : ''),
    item.quantity.toString(),
    (item.productSnapshot.price * item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  ]);

  autoTable(doc, {
    startY: y,
    head: [['DESIGNATION', 'QTE', 'TOTAL']],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' },
    },
    theme: 'plain',
    styles: {
      cellPadding: 1,
    }
  });

  // Totals
  y = (doc as any).lastAutoTable.finalY + 6;
  doc.text("-".repeat(45), pageWidth / 2, y, { align: "center" });
  
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL À PAYER", margin, y);
  
  doc.setFontSize(11);
  const total = formatCurrencyPdf(order.total);
  doc.text(total, pageWidth - margin, y, { align: "right" });

  // Footer
  y += 15;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Merci de votre confiance !", pageWidth / 2, y, { align: "center" });
  
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("KHIDMA SHOP - Rufisque", pageWidth / 2, y, { align: "center" });

  // Sauvegarde
  doc.save(`recu-${order.id.substring(0, 8).toUpperCase()}.pdf`);
}