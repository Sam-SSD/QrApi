import qrcode from "qrcode";
import type { QrConfig } from "./schema";

export interface QrMatrix {
  /** Módulos por lado (sin quiet zone). */
  size: number;
  /** true = módulo oscuro. Índice: row * size + col. */
  modules: Uint8Array;
}

/** Genera la matriz de módulos del QR. Lanza si los datos no caben. */
export function createMatrix(
  data: string,
  ecLevel: QrConfig["ecLevel"],
): QrMatrix {
  const qr = qrcode.create(data, { errorCorrectionLevel: ecLevel });
  return {
    size: qr.modules.size,
    modules: Uint8Array.from(qr.modules.data),
  };
}

export function isDark(matrix: QrMatrix, row: number, col: number): boolean {
  if (row < 0 || col < 0 || row >= matrix.size || col >= matrix.size) {
    return false;
  }
  return matrix.modules[row * matrix.size + col] === 1;
}

/**
 * Zonas de los tres finder patterns (7×7 en las esquinas).
 * El renderer las dibuja aparte con los estilos de esquina.
 */
export function isFinderZone(size: number, row: number, col: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= size - 7;
  const inBottomLeft = row >= size - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}
