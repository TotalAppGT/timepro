import {
  PDFDocument,
  PDFFont,
  PDFPage,
  PDFImage,
  rgb,
  StandardFonts,
} from "pdf-lib";
import { formatQ } from "@/lib/plans";
import { dataUrlToBuffer } from "@/lib/uploads";

export type DocType = "COTIZACION" | "ORDEN_TRABAJO" | "ACTA_ENTREGA" | "ACTA_ACEPTACION" | "PARTE_TRABAJO" | "FACTURA" | "CUSTOM";

export interface DocItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface DocSignature {
  name: string;
  role: string;
  imageUrl?: string;
  signedAt?: string;
}

export interface DocData {
  code: string;
  date: string;
  city?: string;
  dueDate?: string;
  title?: string;
  description?: string;
  notes?: string;
  terms?: string;
  items?: DocItem[];
  subtotal?: number;
  taxRate?: number;
  tax?: number;
  total?: number;
  clientName?: string;
  clientNit?: string;
  clientAddress?: string;
  clientPhone?: string;
  projectName?: string;
  projectCode?: string;
  assignedTo?: string;
  scheduledAt?: string;
  checklist?: { text: string; done: boolean }[];
  technicians?: string[];
  photos?: string[];
  signatures?: DocSignature[];
}

export interface OrgHeader {
  id: string;
  name: string;
  nit?: string;
  address?: string;
  phone?: string;
  brandColor?: string;
  logoUrl?: string;
  invoicePrefix?: string;
}

const PAGE = { width: 595.28, height: 841.89 }; // A4

interface Ctx {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
  color: { r: number; g: number; b: number };
  images: Map<string, PDFImage>;
  y: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  if (h.length !== 6) return { r: 15, g: 118, b: 110 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function wrapText(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.font.widthOfTextAtSize(test, 9) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(ctx: Ctx, text: string, x: number, y: number, size = 9, opts: { font?: PDFFont; color?: { r: number; g: number; b: number }; bold?: boolean } = {}) {
  const font = opts.font ?? (opts.bold ? ctx.bold : ctx.font);
  const color = opts.color ?? { r: 15, g: 23, b: 42 };
  ctx.page.drawText(text, {
    x,
    y,
    size,
    font,
    color: rgb(color.r / 255, color.g / 255, color.b / 255),
  });
}

function drawWrapped(ctx: Ctx, text: string, x: number, y: number, maxWidth: number, size = 9, opts: { bold?: boolean; color?: { r: number; g: number; b: number } } = {}): number {
  const lines = wrapText(ctx, text, maxWidth);
  let cursor = y;
  for (const line of lines) {
    drawText(ctx, line, x, cursor, size, { bold: opts.bold, color: opts.color });
    cursor -= size + 2;
  }
  return cursor;
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < 60) {
    ctx.page = ctx.page.doc.addPage([PAGE.width, PAGE.height]);
    ctx.y = PAGE.height - 50;
  }
}

async function drawHeader(ctx: Ctx, org: OrgHeader, docTitle: string, data: DocData) {
  const color = hexToRgb(org.brandColor || "#0f766e");
  const { width } = PAGE;

  ctx.page.drawRectangle({ x: 0, y: PAGE.height - 90, width, height: 90, color: rgb(color.r / 255, color.g / 255, color.b / 255) });

  // Logo (si existe y es PNG/JPEG)
  if (org.logoUrl) {
    try {
      const parsed = dataUrlToBuffer(org.logoUrl);
      if (parsed) {
        const isPng = parsed.mime.includes("png");
        const isJpg = parsed.mime.includes("jpeg") || parsed.mime.includes("jpg");
        if (isPng || isJpg) {
          const img = isPng ? await ctx.page.doc.embedPng(parsed.buffer) : await ctx.page.doc.embedJpg(parsed.buffer);
          const maxH = 56;
          const scale = maxH / img.height;
          const w = img.width * scale;
          ctx.page.drawImage(img, { x: 36, y: PAGE.height - 30 - maxH, width: w, height: maxH });
        }
      }
    } catch {
      /* sin logo */
    }
  }

  drawText(ctx, org.name, 36, PAGE.height - 34, 16, { bold: true, color: { r: 255, g: 255, b: 255 } });
  let infoY = PAGE.height - 52;
  if (org.nit) { drawText(ctx, `NIT: ${org.nit}`, 36, infoY, 8, { color: { r: 255, g: 255, b: 255 } }); infoY -= 12; }
  if (org.address) { drawText(ctx, org.address, 36, infoY, 8, { color: { r: 255, g: 255, b: 255 } }); infoY -= 12; }
  if (org.phone) { drawText(ctx, `Tel: ${org.phone}`, 36, infoY, 8, { color: { r: 255, g: 255, b: 255 } }); }

  drawText(ctx, docTitle, width - 36, PAGE.height - 34, 15, { bold: true, color: { r: 255, g: 255, b: 255 } });
  drawText(ctx, `No. ${data.code}`, width - 36, PAGE.height - 54, 10, { color: { r: 255, g: 255, b: 255 } });

  ctx.y = PAGE.height - 110;
}

function drawInfoBoxes(ctx: Ctx, data: DocData) {
  const left = 36;
  const right = PAGE.width - 36;
  const boxW = (right - left - 12) / 2;

  ctx.page.drawRectangle({ x: left, y: ctx.y - 52, width: boxW, height: 52, color: rgb(0.97, 0.98, 0.99), borderColor: rgb(0.9, 0.91, 0.94), borderWidth: 1 });
  ctx.page.drawRectangle({ x: left + boxW + 12, y: ctx.y - 52, width: boxW, height: 52, color: rgb(0.97, 0.98, 0.99), borderColor: rgb(0.9, 0.91, 0.94), borderWidth: 1 });

  drawText(ctx, "CLIENTE", left + 8, ctx.y - 16, 7, { bold: true, color: { r: 15, g: 118, b: 110 } });
  let cy = ctx.y - 30;
  const clientLines: string[] = [];
  if (data.clientName) clientLines.push(data.clientName);
  if (data.clientNit) clientLines.push(`NIT: ${data.clientNit}`);
  if (data.clientAddress) clientLines.push(data.clientAddress);
  if (data.clientPhone) clientLines.push(`Tel: ${data.clientPhone}`);
  for (const line of clientLines.slice(0, 4)) {
    drawText(ctx, line, left + 8, cy, 8);
    cy -= 10;
  }

  drawText(ctx, "DATOS DEL DOCUMENTO", left + boxW + 20, ctx.y - 16, 7, { bold: true, color: { r: 15, g: 118, b: 110 } });
  cy = ctx.y - 30;
  const infoLines = [`Fecha: ${data.date}`];
  if (data.dueDate) infoLines.push(`Vence: ${data.dueDate}`);
  if (data.city) infoLines.push(`Lugar: ${data.city}`);
  if (data.projectName) infoLines.push(`Proyecto: ${data.projectName}`);
  for (const line of infoLines.slice(0, 4)) {
    drawText(ctx, line, left + boxW + 20, cy, 8);
    cy -= 10;
  }

  ctx.y -= 70;
}

function drawSectionTitle(ctx: Ctx, title: string) {
  const color = hexToRgb("#0f766e");
  ensureSpace(ctx, 24);
  drawText(ctx, title, 36, ctx.y, 10, { bold: true, color });
  ctx.page.drawRectangle({ x: 36, y: ctx.y - 6, width: PAGE.width - 72, height: 1.5, color: rgb(color.r / 255, color.g / 255, color.b / 255) });
  ctx.y -= 20;
}

function drawChecklist(ctx: Ctx, checklist: { text: string; done: boolean }[]) {
  for (const item of checklist) {
    ensureSpace(ctx, 20);
    const boxSize = 9;
    ctx.page.drawRectangle({ x: 40, y: ctx.y - boxSize, width: boxSize, height: boxSize, borderColor: rgb(0.55, 0.6, 0.66), borderWidth: 1 });
    if (item.done) {
      drawText(ctx, "✓", 41, ctx.y - boxSize - 1, 8, { bold: true, color: { r: 15, g: 118, b: 110 } });
    }
    drawText(ctx, item.text, 56, ctx.y - boxSize + 1, 9);
    ctx.y -= boxSize + 8;
  }
}

function drawItemsTable(ctx: Ctx, items: DocItem[]) {
  const left = 36;
  const right = PAGE.width - 36;
  const colW = {
    desc: right - left - 150,
    qty: 40,
    price: 55,
    amount: 55,
  };
  const headerY = ctx.y;

  ensureSpace(ctx, 28);
  ctx.page.drawRectangle({ x: left, y: ctx.y - 18, width: right - left, height: 18, color: rgb(0.06, 0.46, 0.44) });
  drawText(ctx, "DESCRIPCIÓN", left + 6, ctx.y - 12, 8, { bold: true, color: { r: 255, g: 255, b: 255 } });
  drawText(ctx, "CANT", left + colW.desc + 2, ctx.y - 12, 8, { bold: true, color: { r: 255, g: 255, b: 255 } });
  drawText(ctx, "P. UNITARIO", left + colW.desc + colW.qty + 2, ctx.y - 12, 8, { bold: true, color: { r: 255, g: 255, b: 255 } });
  drawText(ctx, "TOTAL", left + colW.desc + colW.qty + colW.price + 2, ctx.y - 12, 8, { bold: true, color: { r: 255, g: 255, b: 255 } });

  ctx.y -= 24;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    ensureSpace(ctx, 22);
    const lines = wrapText(ctx, item.description, colW.desc - 6);
    const rowH = Math.max(18, lines.length * 10 + 6);
    if (i % 2 === 0) {
      ctx.page.drawRectangle({ x: left, y: ctx.y - rowH, width: right - left, height: rowH, color: rgb(0.985, 0.988, 0.99) });
    }
    drawText(ctx, item.description, left + 6, ctx.y - 12, 8);
    drawText(ctx, String(item.qty), left + colW.desc + 4, ctx.y - 12, 8);
    drawText(ctx, formatQ(item.unitPrice), left + colW.desc + colW.qty + 4, ctx.y - 12, 8);
    drawText(ctx, formatQ(item.amount), left + colW.desc + colW.qty + colW.price + 4, ctx.y - 12, 8);
    ctx.y -= rowH + 2;
  }
  void headerY;
}

function drawTotals(ctx: Ctx, data: DocData) {
  const left = PAGE.width - 36 - 170;
  const col = { label: 100, value: 70 };

  ctx.y -= 8;
  const subtotal = data.subtotal ?? 0;
  const tax = data.tax ?? 0;
  const total = data.total ?? subtotal + tax;

  const rows: [string, string, boolean][] = [
    ["Subtotal", formatQ(subtotal), false],
    [`IVA (${data.taxRate ?? 0}%)`, formatQ(tax), false],
    ["TOTAL", formatQ(total), true],
  ];
  for (const [label, value, isTotal] of rows) {
    ensureSpace(ctx, 20);
    ctx.page.drawRectangle({ x: left, y: ctx.y - 16, width: col.label + col.value, height: 16, color: isTotal ? rgb(0.06, 0.46, 0.44) : rgb(0.97, 0.98, 0.99) });
    drawText(ctx, label, left + 6, ctx.y - 11, 9, { bold: true, color: isTotal ? { r: 255, g: 255, b: 255 } : { r: 15, g: 23, b: 42 } });
    drawText(ctx, value, left + col.label + 4, ctx.y - 11, 9, { bold: true, color: isTotal ? { r: 255, g: 255, b: 255 } : { r: 15, g: 23, b: 42 } });
    ctx.y -= 20;
  }
}

async function drawPhotos(ctx: Ctx, photos: string[]) {
  const startX = 36;
  const size = 72;
  const gap = 10;
  let x = startX;
  for (const photo of photos.slice(0, 8)) {
    try {
      const parsed = dataUrlToBuffer(photo);
      if (!parsed) continue;
      const isPng = parsed.mime.includes("png");
      const isJpg = parsed.mime.includes("jpeg") || parsed.mime.includes("jpg");
      if (!isPng && !isJpg) continue;
      ensureSpace(ctx, size + 10);
      const img = isPng ? await ctx.page.doc.embedPng(parsed.buffer) : await ctx.page.doc.embedJpg(parsed.buffer);
      ctx.page.drawRectangle({ x, y: ctx.y - size, width: size, height: size, color: rgb(0.95, 0.96, 0.97), borderColor: rgb(0.85, 0.87, 0.9), borderWidth: 1 });
      const maxW = size - 8;
      const maxH = size - 8;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.page.drawImage(img, { x: x + (size - w) / 2, y: ctx.y - (size - h) / 2 - h, width: w, height: h });
      x += size + gap;
      if (x + size > PAGE.width - 36) {
        ctx.y -= size + 10;
        x = startX;
      }
    } catch {
      /* foto inválida */
    }
  }
  if (photos.length > 0 && x !== startX) ctx.y -= size + 10;
}

async function drawSignatures(ctx: Ctx, signatures: DocSignature[]) {
  const left = 36;
  const right = PAGE.width - 36;
  const cols = signatures.length || 1;
  const colW = (right - left - 12 * (cols - 1)) / cols;

  ctx.y -= 8;
  for (let i = 0; i < cols; i++) {
    const sig = signatures[i];
    const x = left + i * (colW + 12);
    const lineY = ctx.y - 46;
    ctx.page.drawRectangle({ x, y: lineY, width: colW, height: 0.8, color: rgb(0.4, 0.45, 0.5) });
    if (sig?.imageUrl) {
      try {
        const parsed = dataUrlToBuffer(sig.imageUrl);
        if (parsed) {
          const img = await ctx.page.doc.embedPng(parsed.buffer);
          const maxW = colW - 20;
          const scale = Math.min(maxW / img.width, 34 / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.page.drawImage(img, { x: x + (colW - w) / 2, y: lineY - h - 4, width: w, height: h });
        }
      } catch {
        /* sin firma */
      }
    }
    drawText(ctx, sig?.name ?? "", x, lineY - 14, 9, { bold: true });
    drawText(ctx, sig?.role ?? "", x, lineY - 25, 8);
    if (sig?.signedAt) drawText(ctx, sig.signedAt, x, lineY - 36, 7, { color: { r: 100, g: 116, b: 139 } });
  }
  ctx.y -= 70;
}

export async function generateDocumentPdf(opts: {
  org: OrgHeader;
  docType: DocType;
  data: DocData;
}): Promise<Uint8Array> {
  const { org, docType, data } = opts;

  const doc = await PDFDocument.create();
  doc.setTitle(data.title || `${docType} ${data.code}`);
  doc.setAuthor(org.name);
  doc.setProducer("TimePro");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const boldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

  const page = doc.addPage([PAGE.width, PAGE.height]);
  const ctx: Ctx = { page, font, bold, italic, boldItalic, color: hexToRgb(org.brandColor || "#0f766e"), images: new Map(), y: PAGE.height };

  const TITLES: Record<DocType, string> = {
    COTIZACION: "COTIZACIÓN",
    ORDEN_TRABAJO: "ORDEN DE TRABAJO",
    ACTA_ENTREGA: "ACTA DE ENTREGA / INSTALACIÓN",
    ACTA_ACEPTACION: "ACTA DE ACEPTACIÓN Y APROBACIÓN",
    PARTE_TRABAJO: "PARTE DE TRABAJO",
    FACTURA: "FACTURA",
    CUSTOM: data.title || "DOCUMENTO",
  };

  await drawHeader(ctx, org, TITLES[docType], data);
  drawInfoBoxes(ctx, data);

  if (data.description) {
    drawSectionTitle(ctx, "DETALLE");
    const y = drawWrapped(ctx, data.description, 36, ctx.y, PAGE.width - 72, 9);
    ctx.y = y - 6;
  }

  if (data.assignedTo) {
    drawSectionTitle(ctx, "RESPONSABLE");
    drawText(ctx, data.assignedTo, 36, ctx.y, 9);
    if (data.scheduledAt) {
      drawText(ctx, `Fecha programada: ${data.scheduledAt}`, 260, ctx.y, 9);
    }
    ctx.y -= 18;
  }

  if (data.checklist && data.checklist.length > 0) {
    drawSectionTitle(ctx, "CHECKLIST");
    drawChecklist(ctx, data.checklist);
    ctx.y -= 6;
  }

  if (data.technicians && data.technicians.length > 0) {
    drawSectionTitle(ctx, "EQUIPO ASIGNADO");
    drawText(ctx, data.technicians.join(", "), 36, ctx.y, 9);
    ctx.y -= 18;
  }

  if (data.items && data.items.length > 0) {
    drawSectionTitle(ctx, "DETALLE DE PARTIDAS");
    drawItemsTable(ctx, data.items);
    drawTotals(ctx, data);
    ctx.y -= 10;
  }

  if (data.photos && data.photos.length > 0) {
    drawSectionTitle(ctx, "EVIDENCIA FOTOGRÁFICA");
    await drawPhotos(ctx, data.photos);
    ctx.y -= 6;
  }

  drawSectionTitle(ctx, "FIRMAS");
  const signatures = data.signatures ?? [];
  if (signatures.length === 0) {
    signatures.push({ name: "", role: "Firma del cliente" });
    signatures.push({ name: "", role: "Firma del responsable" });
  }
  await drawSignatures(ctx, signatures);

  if (data.notes) {
    ctx.y -= 10;
    drawSectionTitle(ctx, "OBSERVACIONES");
    const y = drawWrapped(ctx, data.notes, 36, ctx.y, PAGE.width - 72, 9);
    ctx.y = y - 4;
  }
  if (data.terms) {
    drawSectionTitle(ctx, "CONDICIONES");
    drawWrapped(ctx, data.terms, 36, ctx.y, PAGE.width - 72, 8);
  }

  return doc.save();
}
