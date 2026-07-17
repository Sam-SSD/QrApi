"use client";

import { useCallback, useEffect, useState } from "react";
import type { QrConfig, QrPayloadType } from "@/lib/qr/schema";
import type { FieldsMap } from "@/stores/qr-store";

export interface HistoryItem {
  id: string;
  createdAt: number;
  type: QrPayloadType;
  data: string;
  fields: Partial<FieldsMap>;
  config: QrConfig;
}

const STORAGE_KEY = "qrapi:history";
// clave anterior al rebrand: se lee solo si la nueva no existe y se limpia al persistir
const LEGACY_STORAGE_KEY = "qrforge:history";
const MAX_ITEMS = 20;

function readHistory(): HistoryItem[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useQrHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(readHistory());
  }, []);

  const persist = useCallback((next: HistoryItem[]) => {
    setItems(next);
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // cuota llena: descartar el más antiguo y reintentar una vez
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 10)));
      } catch {
        /* sin persistencia */
      }
    }
  }, []);

  const add = useCallback(
    (item: Omit<HistoryItem, "id" | "createdAt">) => {
      const current = readHistory();
      // evita duplicados consecutivos del mismo payload+config
      const fingerprint = JSON.stringify([item.data, item.config]);
      if (
        current[0] &&
        JSON.stringify([current[0].data, current[0].config]) === fingerprint
      ) {
        return;
      }
      const entry: HistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      persist([entry, ...current].slice(0, MAX_ITEMS));
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(readHistory().filter((item) => item.id !== id));
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, remove, clear };
}
