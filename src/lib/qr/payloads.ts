import type { QrPayload } from "./schema";

/** Escapa los caracteres reservados del formato WIFI: (\ ; , : "). */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/** Escapa los caracteres reservados de vCard 3.0 (\ ; ,). */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Construye la cadena estándar que se codifica en el QR para cada tipo. */
export function buildPayload(payload: QrPayload): string {
  switch (payload.type) {
    case "text":
      return payload.text;

    case "url":
      return payload.url;

    case "email": {
      const params = new URLSearchParams();
      if (payload.subject) params.set("subject", payload.subject);
      if (payload.body) params.set("body", payload.body);
      const query = params.toString();
      return `mailto:${payload.to}${query ? `?${query}` : ""}`;
    }

    case "phone":
      return `tel:${payload.number.replace(/[\s\-().]/g, "")}`;

    case "sms": {
      const number = payload.number.replace(/[\s\-().]/g, "");
      return payload.message
        ? `SMSTO:${number}:${payload.message}`
        : `SMSTO:${number}`;
    }

    case "wifi": {
      const parts = [
        `WIFI:T:${payload.security};`,
        `S:${escapeWifi(payload.ssid)};`,
        payload.security !== "nopass" && payload.password
          ? `P:${escapeWifi(payload.password)};`
          : "",
        payload.hidden ? "H:true;" : "",
        ";",
      ];
      return parts.join("");
    }

    case "vcard": {
      const first = escapeVCard(payload.firstName);
      const last = payload.lastName ? escapeVCard(payload.lastName) : "";
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${last};${first};;;`,
        `FN:${[first, last].filter(Boolean).join(" ")}`,
        payload.organization && `ORG:${escapeVCard(payload.organization)}`,
        payload.title && `TITLE:${escapeVCard(payload.title)}`,
        payload.phone && `TEL;TYPE=CELL:${payload.phone}`,
        payload.email && `EMAIL:${payload.email}`,
        payload.website && `URL:${payload.website}`,
        payload.address && `ADR;TYPE=WORK:;;${escapeVCard(payload.address)};;;;`,
        "END:VCARD",
      ];
      return lines.filter(Boolean).join("\n");
    }

    case "crypto": {
      const amount =
        payload.amount !== undefined ? `?amount=${payload.amount}` : "";
      return `${payload.currency}:${payload.address}${amount}`;
    }
  }
}
