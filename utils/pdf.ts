import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "@/types/order";
import { formatDate } from "@/utils/format";

function formatCurrencyPdf(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount).replace(/\//g, "").replace("XOF", "F CFA").trim();
}

export function generateInvoicePdf(order: Order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header noir
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("KHIDMA SHOP", margin, 25);

  // Badge facture
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 55, 15, 40, 15, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", pageWidth - 45, 24, { align: "center" });

  // Reset text color
  doc.setTextColor(60, 60, 60);

  // Info principales
  let y = 55;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Reference et date
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, (pageWidth - 2 * margin) / 3, 20, 'F');
  doc.rect(margin + (pageWidth - 2 * margin) / 3, y, (pageWidth - 2 * margin) / 3, 20, 'F');
  doc.rect(margin + 2 * (pageWidth - 2 * margin) / 3, y, (pageWidth - 2 * margin) / 3, 20, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("RÉFÉRENCE", margin + 5, y + 6);
  doc.text("DATE", margin + (pageWidth - 2 * margin) / 3 + 5, y + 6);
  doc.text("ARTICLES", margin + 2 * (pageWidth - 2 * margin) / 3 + 5, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  doc.text(order.id.substring(0, 12).toUpperCase(), margin + 5, y + 14);
  doc.text(formatDate(order.createdAt), margin + (pageWidth - 2 * margin) / 3 + 5, y + 14);
  doc.text(`${totalItems} article${totalItems > 1 ? 's' : ''}`, margin + 2 * (pageWidth - 2 * margin) / 3 + 5, y + 14);

  // Addresses
  y = 85;
  
  // Emetteur
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, (pageWidth - 2 * margin) / 2 - 3, 45, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("ÉMETTEUR", margin + 5, y + 6);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Khidma Shop", margin + 5, y + 15);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Rufisque, Tally Bou Bess", margin + 5, y + 22);
  doc.text("près Usine vinaigre", margin + 5, y + 28);
  doc.text("+221 77 862 70 52", margin + 5, y + 34);

  // Client
  doc.setFillColor(250, 250, 250);
  doc.rect(margin + (pageWidth - 2 * margin) / 2 + 3, y, (pageWidth - 2 * margin) / 2 - 3, 45, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("CLIENT", margin + (pageWidth - 2 * margin) / 2 + 8, y + 6);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(order.customerName, margin + (pageWidth - 2 * margin) / 2 + 8, y + 15);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(order.phone, margin + (pageWidth - 2 * margin) / 2 + 8, y + 22);
  if (order.address) {
    const addressLines = doc.splitTextToSize(order.address, (pageWidth - 2 * margin) / 2 - 10);
    doc.text(addressLines.slice(0, 2), margin + (pageWidth - 2 * margin) / 2 + 8, y + 28);
  }

  // Tableau produits avec jspdf-autotable
  y = 140;
  
  const tableData = order.items.map(item => [
    item.productSnapshot.name + (item.size ? ` (${item.size})` : '') + (item.color ? ` - ${item.color}` : ''),
    item.quantity.toString(),
    formatCurrencyPdf(item.productSnapshot.price),
    formatCurrencyPdf(item.productSnapshot.price * item.quantity)
  ]);

  autoTable(doc, {
    startY: y,
    head: [['DÉSIGNATION', 'QTE', 'PRIX UNITAIRE', 'TOTAL']],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 90, halign: 'left' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    theme: 'plain',
    styles: {
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(pageWidth - 80, finalY, 65, 25, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("TOTAL", pageWidth - 75, finalY + 10);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(formatCurrencyPdf(order.total), pageWidth - 75, finalY + 20);

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Merci pour votre confiance !", pageWidth / 2, 280, { align: "center" });
  doc.text(`Générée le ${formatDate(new Date())}`, pageWidth / 2, 285, { align: "center" });

  // Sauvegarde
  doc.save(`facture-${order.id.substring(0, 8).toUpperCase()}.pdf`);
}