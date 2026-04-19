import PDFDocument from "pdfkit";

function formatCurrency(value) {
  return `Rs.${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDateTime(value) {
  const date = new Date(value || Date.now());

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatStatus(value) {
  return String(value || "placed")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildAddress(order) {
  if (order?.addressText) {
    return String(order.addressText);
  }

  return [
    order?.address?.line1,
    order?.address?.line2,
    order?.address?.city,
    order?.address?.state,
    order?.address?.postalCode,
    order?.customer?.addressLine1,
    order?.customer?.addressLine2,
    order?.customer?.city,
    order?.customer?.state,
    order?.customer?.postalCode
  ]
    .filter(Boolean)
    .join(", ");
}

export function generateInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const customerName = order?.customerName || "Customer";
      const customerPhone = order?.phone || order?.customer?.phone || "-";
      const customerEmail = order?.email || order?.customer?.email || "-";
      const address = buildAddress(order);
      const invoiceId = order?.orderId || order?.orderNumber || "-";
      const invoiceDate = formatDateTime(order?.createdAt);
      const trackingId = order?.trackingId || "-";
      const paymentMethod = order?.paymentMethod || "COD";
      const paymentStatus = order?.paymentStatus || "PENDING";
      const orderStatus = formatStatus(order?.orderStatus);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const left = 40;
      const right = pageWidth - 40;
      const width = right - left;

      const palette = {
        brand: "#2F2017",
        accent: "#A66031",
        headerBg: "#F6ECDD",
        sectionBg: "#FFF9F0",
        tableHeaderBg: "#2F2017",
        tableHeaderText: "#F7F2E8",
        border: "#E2D3BE",
        text: "#2E2018",
        muted: "#6E5747",
        rowAlt: "#FCF6ED"
      };

      const colItemX = left + 14;
      const colItemW = 286;
      const colQtyX = left + 312;
      const colQtyW = 46;
      const colPriceX = left + 362;
      const colPriceW = 84;
      const colTotalX = left + 448;
      const colTotalW = right - colTotalX - 12;

      const drawTableHeader = (tableY) => {
        doc.roundedRect(left, tableY, width, 28, 8).fillAndStroke(palette.tableHeaderBg, palette.tableHeaderBg);
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(palette.tableHeaderText)
          .text("Item", colItemX, tableY + 9, { width: colItemW })
          .text("Qty", colQtyX, tableY + 9, { width: colQtyW, align: "center" })
          .text("Price", colPriceX, tableY + 9, { width: colPriceW, align: "right" })
          .text("Total", colTotalX, tableY + 9, { width: colTotalW, align: "right" });
      };

      doc.roundedRect(left, 40, width, 94, 14).fillAndStroke(palette.headerBg, palette.border);

      doc
        .font("Helvetica-Bold")
        .fontSize(26)
        .fillColor(palette.brand)
        .text("HOFO", left + 16, 58);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(palette.muted)
        .text("Handcrafted Wood Atelier", left + 16, 88)
        .text("Premium solid wood essentials", left + 16, 103);

      doc
        .font("Helvetica-Bold")
        .fontSize(19)
        .fillColor(palette.brand)
        .text("INVOICE", right - 170, 56, { width: 154, align: "right" });

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(palette.text)
        .text(`Invoice #: ${invoiceId}`, right - 190, 84, { width: 174, align: "right" })
        .text(`Tracking ID: ${trackingId}`, right - 190, 100, { width: 174, align: "right" });

      doc.roundedRect(left, 148, 320, 116, 12).fillAndStroke(palette.sectionBg, palette.border);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(palette.brand)
        .text("Bill To", left + 14, 162);
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(palette.text)
        .text(customerName, left + 14, 180)
        .text(customerPhone, left + 14, 195)
        .text(customerEmail, left + 14, 210)
        .text(address || "Address unavailable", left + 14, 225, { width: 292, lineGap: 2 });

      doc.roundedRect(374, 148, right - 374, 116, 12).fillAndStroke(palette.sectionBg, palette.border);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(palette.brand)
        .text("Order Info", 388, 162);
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(palette.text)
        .text(`Date: ${invoiceDate}`, 388, 180, { width: right - 402 })
        .text(`Payment: ${paymentMethod}`, 388, 198, { width: right - 402 })
        .text(`Payment Status: ${paymentStatus}`, 388, 216, { width: right - 402 })
        .text(`Order Status: ${orderStatus}`, 388, 234, { width: right - 402 });

      const tableTop = 286;
      drawTableHeader(tableTop);

      let y = tableTop + 34;
      const items = Array.isArray(order?.items) ? order.items : [];

      if (items.length === 0) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(palette.muted)
          .text("No line items were added to this order.", colItemX, y, { width: width - 28 });
        y += 28;
      }

      items.forEach((item, index) => {
        const itemName = item?.name || "Item";
        const qty = Number(item?.qty || item?.quantity || 0);
        const price = Number(item?.price || 0);
        const lineTotal = Number(item?.lineTotal || qty * price);

        doc.font("Helvetica").fontSize(10);
        const rowTextHeight = doc.heightOfString(itemName, { width: colItemW, lineGap: 2 });
        const rowHeight = Math.max(24, rowTextHeight + 6);

        if (y + rowHeight > pageHeight - 190) {
          doc.addPage();
          drawTableHeader(52);
          y = 86;
        }

        if (index % 2 === 1) {
          doc.roundedRect(left, y - 3, width, rowHeight + 5, 6).fillAndStroke(palette.rowAlt, palette.rowAlt);
        }

        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(palette.text)
          .text(itemName, colItemX, y, { width: colItemW, lineGap: 2 })
          .text(String(qty), colQtyX, y, { width: colQtyW, align: "center" })
          .text(formatCurrency(price), colPriceX, y, { width: colPriceW, align: "right" })
          .text(formatCurrency(lineTotal), colTotalX, y, { width: colTotalW, align: "right" });

        y += rowHeight + 6;
      });

      doc.moveTo(left, y + 3).lineTo(right, y + 3).strokeColor(palette.border).stroke();

      const subtotal = Number(order?.subtotal || 0);
      const shipping = Number(order?.shippingAmount || 0);
      const total = Number(order?.totalAmount || subtotal + shipping);
      const notes = String(order?.notes || "").trim();

      let summaryTop = y + 16;

      if (summaryTop + 150 > pageHeight - 80) {
        doc.addPage();
        summaryTop = 60;
      }

      const summaryWidth = 220;
      const summaryX = right - summaryWidth;
      const summaryHeight = 98;

      doc.roundedRect(summaryX, summaryTop, summaryWidth, summaryHeight, 12).fillAndStroke(palette.sectionBg, palette.border);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(palette.text)
        .text("Subtotal", summaryX + 14, summaryTop + 16, { width: 98 })
        .text(formatCurrency(subtotal), summaryX + 110, summaryTop + 16, { width: 96, align: "right" })
        .text("Shipping", summaryX + 14, summaryTop + 35, { width: 98 })
        .text(formatCurrency(shipping), summaryX + 110, summaryTop + 35, { width: 96, align: "right" });

      doc.moveTo(summaryX + 14, summaryTop + 56).lineTo(summaryX + summaryWidth - 14, summaryTop + 56).strokeColor(palette.border).stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(palette.brand)
        .text("Grand Total", summaryX + 14, summaryTop + 67, { width: 110 })
        .text(formatCurrency(total), summaryX + 110, summaryTop + 67, { width: 96, align: "right" });

      if (notes) {
        const notesWidth = width - summaryWidth - 16;
        const notesX = left;
        const notesY = summaryTop;
        const notesHeight = Math.max(56, doc.heightOfString(notes, { width: notesWidth - 24, lineGap: 2 }) + 28);

        doc.roundedRect(notesX, notesY, notesWidth, notesHeight, 12).fillAndStroke("#FFFFFF", palette.border);
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(palette.brand)
          .text("Order Notes", notesX + 12, notesY + 12);
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(palette.muted)
          .text(notes, notesX + 12, notesY + 27, { width: notesWidth - 24, lineGap: 2, height: notesHeight - 36 });
      }

      const footerY = pageHeight - 52;

      doc.moveTo(left, footerY - 12).lineTo(right, footerY - 12).strokeColor(palette.border).stroke();

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(palette.muted)
        .text("Thank you for shopping with HOFO. For support: support@hofo.in | +91 63560 83197", left, footerY, {
          align: "center",
          width
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#9A8471")
        .text(`Generated on ${formatDateTime(Date.now())}`, left, footerY + 14, {
          align: "center",
          width
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
