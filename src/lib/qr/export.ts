import { PDFDocument } from "pdf-lib";

/**
 * Exportación client-side: SVG real, PNG/JPG vía canvas, PDF vía pdf-lib.
 * Todas parten del string SVG del renderer isomorfo.
 */

export type ExportFormat = "png" | "jpg" | "svg" | "pdf";

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

async function svgToCanvas(
  svg: string,
  width: number,
): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.decoding = "async";
  const loaded = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("No se pudo rasterizar el SVG"));
  });
  img.src = svgToDataUrl(svg);
  await loaded;

  const ratio = img.naturalHeight / img.naturalWidth || 1;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round(width * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Exportación fallida")),
      mime,
      quality,
    );
  });
}

export async function exportQr(
  svg: string,
  format: ExportFormat,
  options: { width: number; filename?: string },
): Promise<void> {
  const filename = options.filename ?? "qrapi";

  switch (format) {
    case "svg": {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filename}.svg`);
      URL.revokeObjectURL(url);
      return;
    }
    case "png": {
      const canvas = await svgToCanvas(svg, options.width);
      const blob = await canvasToBlob(canvas, "image/png");
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filename}.png`);
      URL.revokeObjectURL(url);
      return;
    }
    case "jpg": {
      const canvas = await svgToCanvas(svg, options.width);
      // JPG no soporta transparencia: fondo blanco
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filename}.jpg`);
      URL.revokeObjectURL(url);
      return;
    }
    case "pdf": {
      const canvas = await svgToCanvas(svg, options.width);
      const pngBlob = await canvasToBlob(canvas, "image/png");
      const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
      const pdf = await PDFDocument.create();
      const image = await pdf.embedPng(pngBytes);
      // Página A4 en puntos con el QR centrado
      const pageW = 595.28;
      const pageH = 841.89;
      const maxSide = pageW - 120;
      const scale = Math.min(maxSide / image.width, maxSide / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      const page = pdf.addPage([pageW, pageH]);
      page.drawImage(image, {
        x: (pageW - w) / 2,
        y: (pageH - h) / 2,
        width: w,
        height: h,
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filename}.pdf`);
      URL.revokeObjectURL(url);
      return;
    }
  }
}

export async function copyQrToClipboard(
  svg: string,
  width: number,
): Promise<void> {
  const canvas = await svgToCanvas(svg, width);
  const blob = await canvasToBlob(canvas, "image/png");
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}
