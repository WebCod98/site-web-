/**
 * SCULPT'AURA — B&W PDF invoice generator.
 *
 * Produces a sleek, monochrome invoice with PDFKit that matches the house
 * charter: an italic serif wordmark, wide-tracked uppercase labels, hairline
 * rules, and amounts in the native currency (XAF). No colour is used anywhere.
 *
 * The function streams the PDF into a Buffer so the caller (an Express route)
 * can send it directly or upload it to storage. It has no network dependency,
 * so invoices can be generated offline.
 */

'use strict';

const PDFKit = require('pdfkit');

// Charter palette — black ink on white, one grey for hairlines.
const INK = '#171717';
const HAIRLINE = '#E5E5E5';
const MUTED = '#9CA3AF';

/** Format an integer XAF amount with French grouping. */
function formatXAF(amount) {
  const n = Number.isFinite(amount) ? Math.trunc(amount) : 0;
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)} XAF`;
}

/**
 * @typedef {Object} InvoiceLine
 * @property {string} name       Product name.
 * @property {number} quantity   Units ordered.
 * @property {number} unitPriceXAF Unit price in XAF.
 *
 * @typedef {Object} InvoiceData
 * @property {string} reference          Order reference (e.g. "SA-2026-0148").
 * @property {string} date               ISO date string.
 * @property {Object} customer           { name, email, address, city, country }.
 * @property {InvoiceLine[]} items       Line items.
 * @property {number} subtotalXAF        Sum of the lines.
 * @property {number} shippingXAF        Shipping fee (0 when free).
 * @property {number} totalXAF           Grand total.
 */

/**
 * Generate the invoice PDF.
 * @param {InvoiceData} data
 * @returns {Promise<Buffer>} the PDF bytes.
 */
function generateInvoice(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKit({ size: 'A4', margin: 56 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageLeft = doc.page.margins.left;
    const pageRight = doc.page.width - doc.page.margins.right;
    const contentWidth = pageRight - pageLeft;

    // Small helper for a full-width hairline at the current y.
    const hairline = (y) => {
      doc
        .moveTo(pageLeft, y)
        .lineTo(pageRight, y)
        .lineWidth(0.5)
        .strokeColor(HAIRLINE)
        .stroke();
    };

    // Small helper for a wide-tracked uppercase label.
    const label = (text, x, y, options = {}) => {
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(options.muted ? MUTED : INK)
        .text(String(text).toUpperCase(), x, y, {
          characterSpacing: 1.6,
          ...options,
        });
    };

    // ---- Header --------------------------------------------------------------
    doc
      .font('Times-Italic')
      .fontSize(26)
      .fillColor(INK)
      .text("SCULPT'AURA", pageLeft, 56);

    label('Facture', pageLeft, 92, { muted: true });

    // Invoice meta, right-aligned.
    const metaTop = 58;
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(MUTED)
      .text('RÉFÉRENCE', pageLeft, metaTop, {
        width: contentWidth,
        align: 'right',
        characterSpacing: 1.4,
      });
    doc
      .font('Times-Roman')
      .fontSize(13)
      .fillColor(INK)
      .text(data.reference, pageLeft, metaTop + 12, {
        width: contentWidth,
        align: 'right',
      });
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(MUTED)
      .text(`Date : ${data.date}`, pageLeft, metaTop + 34, {
        width: contentWidth,
        align: 'right',
      });

    hairline(130);

    // ---- Billed to -----------------------------------------------------------
    let y = 152;
    label('Facturé à', pageLeft, y, { muted: true });
    y += 16;
    doc
      .font('Times-Roman')
      .fontSize(13)
      .fillColor(INK)
      .text(data.customer.name, pageLeft, y);
    y += 18;
    doc.font('Helvetica').fontSize(9).fillColor(MUTED);
    const addressLines = [
      data.customer.email,
      data.customer.address,
      [data.customer.city, data.customer.country].filter(Boolean).join(', '),
    ].filter(Boolean);
    addressLines.forEach((line) => {
      doc.text(line, pageLeft, y);
      y += 13;
    });

    // ---- Items table ---------------------------------------------------------
    let tableTop = y + 30;

    // Column x positions.
    const colName = pageLeft;
    const colQty = pageLeft + contentWidth * 0.58;
    const colUnit = pageLeft + contentWidth * 0.7;
    const colTotalRight = pageRight;

    label('Produit', colName, tableTop, { muted: true });
    label('Qté', colQty, tableTop, { muted: true, width: 40 });
    label('P.U.', colUnit, tableTop, { muted: true });
    label('Total', colName, tableTop, {
      muted: true,
      width: contentWidth,
      align: 'right',
    });

    tableTop += 16;
    hairline(tableTop);
    tableTop += 12;

    doc.font('Times-Roman').fontSize(11).fillColor(INK);
    data.items.forEach((item) => {
      const lineTotal = item.unitPriceXAF * item.quantity;
      doc
        .font('Times-Roman')
        .fontSize(11)
        .fillColor(INK)
        .text(item.name, colName, tableTop, { width: contentWidth * 0.55 });
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(INK)
        .text(String(item.quantity), colQty, tableTop, { width: 40 });
      doc.text(formatXAF(item.unitPriceXAF), colUnit, tableTop, {
        width: contentWidth * 0.14,
      });
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(formatXAF(lineTotal), colName, tableTop, {
          width: contentWidth,
          align: 'right',
        });
      tableTop += 24;
    });

    hairline(tableTop);
    tableTop += 18;

    // ---- Totals --------------------------------------------------------------
    const totalsLabelX = colUnit - 40;
    const rowGap = 18;

    const totalRow = (name, value, opts = {}) => {
      doc
        .font('Helvetica')
        .fontSize(opts.strong ? 10 : 9)
        .fillColor(opts.strong ? INK : MUTED)
        .text(name.toUpperCase(), totalsLabelX, tableTop, {
          characterSpacing: 1.2,
        });
      doc
        .font(opts.strong ? 'Times-Italic' : 'Helvetica')
        .fontSize(opts.strong ? 14 : 10)
        .fillColor(INK)
        .text(value, colName, tableTop - (opts.strong ? 3 : 0), {
          width: contentWidth,
          align: 'right',
        });
      tableTop += opts.strong ? rowGap + 6 : rowGap;
    };

    totalRow('Sous-total', formatXAF(data.subtotalXAF));
    totalRow(
      'Livraison',
      data.shippingXAF === 0 ? 'Offerte' : formatXAF(data.shippingXAF),
    );
    hairline(tableTop);
    tableTop += 12;
    totalRow('Total', formatXAF(data.totalXAF), { strong: true });

    // ---- Footer --------------------------------------------------------------
    const footerY = doc.page.height - 96;
    hairline(footerY);
    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor(MUTED)
      .text(
        "SCULPT'AURA — Cosmétique de prestige · Douala, Cameroun · Devise : XAF",
        pageLeft,
        footerY + 12,
        { characterSpacing: 1, width: contentWidth, align: 'center' },
      );
    doc
      .font('Times-Italic')
      .fontSize(10)
      .fillColor(INK)
      .text('Merci pour votre confiance.', pageLeft, footerY + 28, {
        width: contentWidth,
        align: 'center',
      });

    doc.end();
  });
}

module.exports = { generateInvoice, formatXAF };
