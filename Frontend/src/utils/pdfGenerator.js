import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ← Changed
import {
  formatDate,
  formatCurrency,
  formatPaymentMethodLabel,
  getBankNameByCode,
} from "./helpers";

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();

  // Defensive check for items
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  // Company Header
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Rizwan Engineering Works", 14, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("123 Street, Multan, Pakistan", 14, 28);
  doc.text("Email: example@gmail.com", 14, 33);
  doc.text("Phone: +92-302-1440949", 14, 38);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  let invoiceTitle = "SALES INVOICE";
  if (invoice.invoiceType === "buying") {
    invoiceTitle = "PURCHASE INVOICE";
  } else if (invoice.invoiceType === "quotation") {
    invoiceTitle = "QUOTATION";
  } else if (invoice.invoiceType === "dropshipping") {
    invoiceTitle = "DROPSHIPPING INVOICE";
  }
  doc.text(invoiceTitle, 14, 55);

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 65);
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, 14, 71);

  // Bill To or Supplier (left side)
  doc.setFont(undefined, "bold");
  if (invoice.invoiceType === "buying" && invoice.name) {
    doc.text("Supplier:", 14, 90);
    doc.setFont(undefined, "normal");
    doc.text(invoice.name || "", 14, 96);
    doc.text(invoice.phoneNumber || "", 14, 102);
    doc.text(invoice.address || "", 14, 108);
  } else {
    doc.text("Bill To:", 14, 90, { align: "left" });
    doc.setFont(undefined, "normal");
    doc.text(invoice.name || "", 14, 96, { align: "left" });
    doc.text(invoice.phoneNumber || "", 14, 102, { align: "left" });
    doc.text(invoice.address || "", 14, 108, { align: "left" });
  }

  // Right side - Customer or Company info
  // doc.setFont(undefined, "bold");
  // doc.text(invoice.invoiceType === "buying" ? "Company:" : "Ship To:", 120, 90);
  // doc.setFont(undefined, "normal");
  // doc.text(invoice.name || "", 120, 96);
  // doc.text(invoice.phoneNumber || "", 120, 102);
  // doc.text(invoice.address || "", 120, 108);

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(14, 115, 196, 115);

  // Items Table
  const tableData = items.map((item) => {
    const productName = item.productName || item.description || "Item";
    const size = item.size ? `(${item.size})` : "";
    const qty = item.quantity || 1;
    const unitPrice = item.unitPrice || item.rate || 0;
    const lineTotal = item.lineTotal || qty * unitPrice || 0;

    return [
      `${productName} ${size}`.trim(),
      String(qty),
      formatCurrency(unitPrice),
      formatCurrency(lineTotal),
    ];
  });

  autoTable(doc, {
    startY: 120,
    head: [["Product", "Qty", "Unit Price", "Line Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [14, 165, 233],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFont(undefined, "normal");
  doc.text("Subtotal:", 140, finalY);
  doc.text(formatCurrency(invoice.subtotal), 180, finalY, { align: "right" });

  let currentY = finalY + 7;

  if (invoice.tax) {
    doc.text(`Tax (${invoice.taxRate || 0}%):`, 140, currentY);
    doc.text(formatCurrency(invoice.tax), 180, currentY, { align: "right" });
    currentY += 7;
  }

  if (invoice.discount) {
    doc.text(`Discount (${invoice.discountRate || 0}%):`, 130, currentY);
    doc.text(`-${formatCurrency(invoice.discount)}`, 180, currentY, {
      align: "right",
    });
    currentY += 7;
  }

  // Shipping Cost (for dropshipping invoices)
  if (invoice.invoiceType === "dropshipping" && invoice.shippingCost) {
    doc.text(`Shipping Cost:`, 140, currentY);
    doc.text(formatCurrency(invoice.shippingCost), 180, currentY, {
      align: "right",
    });
    currentY += 7;
  }

  // Loss Warning (for selling invoices)
  // if (
  //   invoice.invoiceType === "selling" &&
  //   invoice.total < invoice.subtotal &&
  //   invoice.total > 0
  // ) {
  //   doc.setTextColor(220, 38, 38); // Red warning color
  //   doc.setFont(undefined, "bold");
  //   doc.text("⚠ Selling at loss!", 140, currentY);
  //   doc.setTextColor(0, 0, 0);
  //   currentY += 7;
  // }

  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("Total:", 140, currentY + 3);
  doc.text(formatCurrency(invoice.total), 180, currentY + 3, {
    align: "right",
  });

  // Payment Status (hidden for quotations)
  let paymentStatusY = currentY + 15;
  if (invoice.invoiceType !== "quotation") {
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(
      `Payment Status: ${invoice.paymentStatus || "pending"}`,
      14,
      paymentStatusY
    );

    // Payment Details if paid
    if (invoice.paymentStatus === "paid") {
      if (invoice.paymentDate) {
        doc.text(
          `Payment Date: ${formatDate(invoice.paymentDate)}`,
          14,
          paymentStatusY + 14
        );
      }
      if (invoice.bankUsed) {
        doc.text(
          `Bank: ${getBankNameByCode(invoice.bankUsed)}`,
          14,
          paymentStatusY + 21
        );
      }
    }
  }

  // supplier Information (for dropshipping invoices)
  if (invoice.invoiceType === "dropshipping" && invoice.supplierName) {
    let supplierY =
      paymentStatusY + (invoice.paymentStatus === "paid" ? 35 : 15);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("supplier Information:", 14, supplierY);
    doc.setFont(undefined, "normal");
    doc.text(`Name: ${invoice.supplierName}`, 14, supplierY + 6);
  }

  // Notes
  if (invoice.notes) {
    const notesStartY =
      paymentStatusY + (invoice.paymentStatus === "paid" ? 35 : 15);
    doc.setFontSize(9);
    doc.setFont(undefined, "italic");
    doc.text("Notes:", 14, notesStartY);
    const splitNotes = doc.splitTextToSize(invoice.notes, 180);
    doc.text(splitNotes, 14, notesStartY + 6);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("Thank you for your business!", 105, pageHeight - 20, {
    align: "center",
  });
  doc.text("This is a computer generated invoice.", 105, pageHeight - 15, {
    align: "center",
  });

  return doc;
};

export const downloadInvoicePDF = (invoice) => {
  try {
    const doc = generateInvoicePDF(invoice);
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw new Error("Failed to download PDF");
  }
};

export const previewInvoicePDF = (invoice) => {
  try {
    const doc = generateInvoicePDF(invoice);
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.error("Error previewing PDF:", error);
    throw new Error("Failed to preview PDF");
  }
};

export const printInvoicePDF = (invoice) => {
  try {
    const doc = generateInvoicePDF(invoice);
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = pdfUrl;
    document.body.appendChild(iframe);

    iframe.onload = function () {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    };
  } catch (error) {
    console.error("Error printing PDF:", error);
    throw new Error("Failed to print PDF");
  }
};

export default {
  generateInvoicePDF,
  downloadInvoicePDF,
  previewInvoicePDF,
  printInvoicePDF,
};
