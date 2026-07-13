import PDFDocument from "pdfkit";

/* ============================================================
                        CONSTANTS
============================================================ */

const PAGE = {
  WIDTH: 595.28,
  HEIGHT: 841.89,

  MARGIN: 50,

  CONTENT_WIDTH: 495.28,
};

const COLORS = {
  PRIMARY: "#1E3A8A",
  SECONDARY: "#64748B",

  LIGHT: "#F8FAFC",

  BORDER: "#CBD5E1",

  TEXT: "#1E293B",

  SUCCESS: "#16A34A",

  DANGER: "#DC2626",
};

const FONT = {
  TITLE: 24,

  SUBTITLE: 18,

  HEADING: 15,

  BODY: 11,

  SMALL: 9,
};

/* ============================================================
                    FORMAT HELPERS
============================================================ */

const formatCurrency = (amount) => {
  const doc = new PDFDocument();

  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-IN");
};

/* ============================================================
                    DRAW HELPERS
============================================================ */

const drawSeparator = (doc) => {
  doc
    .save()
    .dash(4, { space: 3 })
    .strokeColor(COLORS.BORDER)
    .lineWidth(1)
    .moveTo(PAGE.MARGIN, doc.y)
    .lineTo(PAGE.WIDTH - PAGE.MARGIN, doc.y)
    .stroke()
    .undash()
    .restore();

  doc.moveDown();
};

/* ---------------------------------------------------------- */

const drawBox = (doc, x, y, width, height) => {
  doc
    .save()
    .roundedRect(x, y, width, height, 5)
    .lineWidth(1)
    .strokeColor(COLORS.BORDER)
    .stroke()
    .restore();
};

/* ---------------------------------------------------------- */

const fillBox = (doc, x, y, width, height, color) => {
  doc
    .save()
    .roundedRect(x, y, width, height, 5)
    .fillColor(color)
    .fill()
    .restore();
};

/* ============================================================
                    PAGE MANAGEMENT
============================================================ */

const checkPageBreak = (doc, neededHeight = 50) => {
  if (doc.y + neededHeight > doc.page.height - PAGE.MARGIN) {
    doc.addPage();

    return true;
  }

  return false;
};

/* ============================================================
                    TEXT HELPERS
============================================================ */

const writeLabel = (doc, label, value, x, y) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(FONT.BODY)
    .fillColor(COLORS.TEXT)
    .text(`${label}:`, x, y);

  doc.font("Helvetica").text(value, x + 90, y);
};

/* ---------------------------------------------------------- */

const centerTitle = (doc, text) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(FONT.TITLE)
    .fillColor(COLORS.PRIMARY)
    .text(text, {
      align: "center",
    });
};

/* ---------------------------------------------------------- */

const sectionHeading = (doc, text, options = {}) => {
  doc
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .fontSize(FONT.HEADING)
    .fillColor(COLORS.PRIMARY)
    .text(text, PAGE.MARGIN, doc.y, {
      width: PAGE.CONTENT_WIDTH,
      ...options,
    });

  doc.moveDown(0.5);
};

/* ============================================================
                    COMPANY HEADER
============================================================ */

const drawCompanyHeader = (doc) => {
  // Background

  doc.save().rect(0, 0, PAGE.WIDTH, 120).fill(COLORS.PRIMARY).restore();

  // Company Name

  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text("SOHAM SUNGLASSES", PAGE.MARGIN, 35);

  doc.font("Helvetica").fontSize(12).text("Premium Eyewear & Accessories");

  // Contact

  doc
    .fontSize(10)
    .text("Email : support@sunglasses.com")
    .text("Website : www.sunglasses.vercel.app")
    .text("Phone : +91 9876543210");

  // Invoice title (right)

  doc.font("Helvetica-Bold").fontSize(30).text("INVOICE", 380, 40);

  doc.font("Helvetica").fontSize(11).text("Original Copy", 430);

  doc.moveDown(4);
};

/* ============================================================
                    INVOICE INFORMATION
============================================================ */

const drawInvoiceMeta = (doc, order) => {
  const startY = doc.y;

  drawBox(doc, PAGE.MARGIN, startY, PAGE.CONTENT_WIDTH, 105);

  writeLabel(
    doc,
    "Invoice No",
    `INV-${order._id.toString().slice(-6)}`,
    65,
    startY + 18,
  );

  writeLabel(doc, "Order ID", order._id.toString(), 65, startY + 40);

  writeLabel(doc, "Order Date", formatDate(order.createdAt), 65, startY + 62);

  writeLabel(
    doc,
    "Invoice Time",
    formatTime(order.createdAt),
    315,
    startY + 18,
  );

  writeLabel(doc, "Payment", order.paymentMethod, 315, startY + 40);

  writeLabel(doc, "Status", order.paymentStatus, 315, startY + 62);

  doc.y = startY + 125;
};

/* ============================================================
                    CUSTOMER + PAYMENT
============================================================ */

const drawCustomerSection = (doc, order) => {
  const startY = doc.y;

  drawBox(doc, PAGE.MARGIN, startY, 230, 140);

  drawBox(doc, 315, startY, 230, 140);

  // Left Heading

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(COLORS.PRIMARY)
    .text("BILL TO", 65, startY + 18);

  // Right Heading

  doc.text("PAYMENT DETAILS", 335, startY + 18);

  // Customer

  doc.fillColor(COLORS.TEXT).font("Helvetica").fontSize(11);

  doc.text(`Name : ${order.user.name}`, 65, startY + 48);

  doc.text(`Email : ${order.user.email}`, 65, startY + 70);

  doc.text(`Customer ID : ${order.user._id}`, 65, startY + 92);

  // Payment

  doc.text(`Method : ${order.paymentMethod}`, 335, startY + 48);

  doc.text(`Payment : ${order.paymentStatus}`, 335, startY + 70);

  doc.text(`Order : ${order.orderStatus}`, 335, startY + 92);

  doc.y = startY + 165;
};

/* ============================================================
                    TABLE HEADER
============================================================ */

const drawTableHeader = (doc) => {
  const y = doc.y;

  fillBox(doc, PAGE.MARGIN, y, PAGE.CONTENT_WIDTH, 28, COLORS.PRIMARY);

  doc.fillColor("white").font("Helvetica-Bold").fontSize(11);

  doc.text("Product", 60, y + 9);

  doc.text("Qty", 285, y + 9, {
    width: 40,
    align: "center",
  });

  doc.text("Unit Price", 350, y + 9, {
    width: 80,
    align: "center",
  });

  doc.text("Amount", 455, y + 9, {
    width: 70,
    align: "right",
  });

  doc.y = y + 32;
};

/* ============================================================
                    TABLE BORDERS
============================================================ */

const drawTableBorder = (doc, startY, height) => {
  doc.save().lineWidth(0.5).strokeColor(COLORS.BORDER);

  doc.rect(PAGE.MARGIN, startY, PAGE.CONTENT_WIDTH, height);

  doc.stroke();

  doc.moveTo(270, startY);
  doc.lineTo(270, startY + height);

  doc.moveTo(335, startY);
  doc.lineTo(335, startY + height);

  doc.moveTo(440, startY);
  doc.lineTo(440, startY + height);

  doc.stroke();

  doc.restore();
};

/* ============================================================
                    PRODUCT ROW
============================================================ */

const drawProductRow = (doc, item, index) => {
  checkPageBreak(doc, 35);

  const y = doc.y;

  if (index % 2 === 0) {
    fillBox(doc, PAGE.MARGIN, y, PAGE.CONTENT_WIDTH, 30, "#F8FAFC");
  }

  const amount = item.quantity * item.price;

  doc.fontSize(14).fillColor(COLORS.TEXT).font("Helvetica").fontSize(10);

  doc.fontSize(14).text(item.product.name, 60, y + 9, {
    width: 190,
  });

  doc.fontSize(14).text(item.quantity.toString(), 285, y + 9, {
    width: 40,
    align: "center",
  });

  doc.fontSize(14).text(formatCurrency(item.price), 350, y + 9, {
    width: 80,
    align: "center",
  });

  doc.fontSize(14).text(formatCurrency(amount), 455, y + 9, {
    width: 70,
    align: "right",
  });

  drawTableBorder(doc, y, 30);

  doc.y = y + 30;
};

/* ============================================================
                    PRODUCTS TABLE
============================================================ */

const drawProductsTable = (doc, order) => {
  sectionHeading(doc, "PRODUCT DETAILS", { align: "center" });

  drawTableHeader(doc);

  order.items.forEach((item, index) => {
    drawProductRow(doc, item, index);
  });

  doc.moveDown();
};

/* ============================================================
                    TOTALS BOX
============================================================ */

const drawTotals = (doc, order) => {
  checkPageBreak(doc, 180);

  const startY = doc.y;

  const BOX_WIDTH = doc.page.width - 100;
  const BOX_HEIGHT = 150;

  const boxX = PAGE.WIDTH - PAGE.MARGIN - BOX_WIDTH;

  drawBox(doc, boxX, startY, BOX_WIDTH, BOX_HEIGHT);

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.PRIMARY)
    .text("Order Summary", boxX + 15, startY + 15);

  const labelX = boxX + 15;
  const valueX = boxX + BOX_WIDTH - 15;

  let y = startY + 45;

  const row = (label, value, bold = false) => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(14)
      .fillColor(COLORS.TEXT);

    doc.text(label, labelX, y);

    doc.text(value, valueX - 60, y, {
      width: 60,
      align: "right",
    });

    y += 22;
  };

  row("Total Items", order.totalItems.toString());

  row("Subtotal", formatCurrency(order.totalPrice));

  row("Shipping", formatCurrency(0));

  row("Discount", formatCurrency(0));

  row("GST", formatCurrency(0));

  doc
    .moveTo(labelX, y - 5)
    .lineTo(valueX, y - 5)
    .stroke();

  row("Grand Total", formatCurrency(order.totalPrice), true);

  doc.y = startY + BOX_HEIGHT + 20;
};

/* ============================================================
                        NOTES
============================================================ */

const drawNotes = (doc) => {
  checkPageBreak(doc, 140);

  sectionHeading(doc, "NOTES", { align: "left" });

  const startY = doc.y;

  drawBox(doc, PAGE.MARGIN, startY, PAGE.CONTENT_WIDTH, 95);

  doc.font("Helvetica").fontSize(10).fillColor(COLORS.TEXT);

  doc.text("• Thank you for shopping with Soham Sunglasses.", 65, startY + 18);

  doc.text("• This invoice serves as proof of purchase.", 65, startY + 38);

  doc.text(
    "• Please retain this document for warranty and returns.",
    65,
    startY + 58,
  );

  doc.y = startY + 110;
};

/* ============================================================
                TERMS & CONDITIONS
============================================================ */

const drawTerms = (doc) => {
  checkPageBreak(doc, 150);

  sectionHeading(doc, "TERMS & CONDITIONS");

  const startY = doc.y;

  drawBox(doc, PAGE.MARGIN, startY, PAGE.CONTENT_WIDTH, 115);

  doc.font("Helvetica").fontSize(9);

  doc.text(
    "1. Goods once sold are subject to the return policy.",
    65,
    startY + 18,
  );

  doc.text(
    "2. Warranty applies only against manufacturing defects.",
    65,
    startY + 38,
  );

  doc.text("3. Keep this invoice for future reference.", 65, startY + 58);

  doc.text("4. For support contact support@sunglasses.com", 65, startY + 78);

  doc.y = startY + 130;
};

/* ============================================================
                    SIGNATURE
============================================================ */

const drawSignature = (doc) => {
  checkPageBreak(doc, 100);

  const startY = doc.y;

  doc
    .moveTo(PAGE.WIDTH - 180, startY + 40)
    .lineTo(PAGE.WIDTH - 60, startY + 40)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(11)
    .text("Authorized Signature", PAGE.WIDTH - 185, startY + 48);

  doc.y = startY + 90;
};

/* ============================================================
                        FOOTER
============================================================ */

const drawFooter = (doc) => {
  const y = doc.page.height - 90;

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.SECONDARY)
    .text("Thank you for shopping with Soham Sunglasses.", PAGE.MARGIN, y, {
      align: "center",
    });

  doc.text("support@sunglasses.com | www.sunglasses.vercel.app", {
    align: "center",
  });
};

/* ============================================================
                    DOCUMENT CREATION
============================================================ */

const generateInvoice = (res, order) => {
  const doc = new PDFDocument({
    size: "A4",

    margin: PAGE.MARGIN,

    bufferPages: true,

    info: {
      Title: `Invoice-${order._id}`,

      Author: "Soham Sunglasses",

      Subject: "Tax Invoice",

      Keywords: "Invoice, Order, Sunglasses",

      Creator: "PDFKit",
    },
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Invoice-${order._id}.pdf`,
  );

  doc.pipe(res);

  drawCompanyHeader(doc);

  drawInvoiceMeta(doc, order);

  drawCustomerSection(doc, order);

  drawProductsTable(doc, order);

  drawTotals(doc, order);

  drawNotes(doc);

  drawTerms(doc);

  drawSignature(doc);
  drawFooter(doc);

  doc.end();
};

export default generateInvoice;
