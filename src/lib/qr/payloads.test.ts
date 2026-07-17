import { describe, expect, it } from "vitest";
import { buildPayload } from "./payloads";

describe("buildPayload", () => {
  it("texto plano pasa sin cambios", () => {
    expect(buildPayload({ type: "text", text: "hola mundo" })).toBe(
      "hola mundo",
    );
  });

  it("url pasa sin cambios", () => {
    expect(buildPayload({ type: "url", url: "https://qrapi.dev" })).toBe(
      "https://qrapi.dev",
    );
  });

  it("email genera mailto con subject y body codificados", () => {
    const result = buildPayload({
      type: "email",
      to: "a@b.com",
      subject: "Hola & adiós",
      body: "línea 1",
    });
    expect(result).toMatch(/^mailto:a@b\.com\?/);
    expect(result).toContain("subject=Hola+%26+adi%C3%B3s");
  });

  it("teléfono limpia separadores", () => {
    expect(buildPayload({ type: "phone", number: "+34 600-111 (222)" })).toBe(
      "tel:+34600111222",
    );
  });

  it("sms usa SMSTO con y sin mensaje", () => {
    expect(
      buildPayload({ type: "sms", number: "+34600111222", message: "hola" }),
    ).toBe("SMSTO:+34600111222:hola");
    expect(buildPayload({ type: "sms", number: "600111222" })).toBe(
      "SMSTO:600111222",
    );
  });

  it("wifi escapa caracteres reservados", () => {
    const result = buildPayload({
      type: "wifi",
      ssid: 'Red;con:carac"teres,raros',
      password: "pa;ss",
      security: "WPA",
      hidden: true,
    });
    expect(result).toBe(
      'WIFI:T:WPA;S:Red\\;con\\:carac\\"teres\\,raros;P:pa\\;ss;H:true;;',
    );
  });

  it("wifi sin contraseña con nopass omite P:", () => {
    const result = buildPayload({
      type: "wifi",
      ssid: "Abierta",
      security: "nopass",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:nopass;S:Abierta;;");
  });

  it("vcard 3.0 completa con escapado", () => {
    const result = buildPayload({
      type: "vcard",
      firstName: "Ana;María",
      lastName: "Pérez",
      organization: "Acme, Inc.",
      phone: "+34600111222",
      email: "ana@acme.com",
    });
    expect(result).toContain("BEGIN:VCARD");
    expect(result).toContain("VERSION:3.0");
    expect(result).toContain("N:Pérez;Ana\\;María;;;");
    expect(result).toContain("FN:Ana\\;María Pérez");
    expect(result).toContain("ORG:Acme\\, Inc.");
    expect(result).toContain("TEL;TYPE=CELL:+34600111222");
    expect(result).toContain("END:VCARD");
  });

  it("crypto genera URI con amount opcional", () => {
    expect(
      buildPayload({
        type: "crypto",
        currency: "bitcoin",
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        amount: 0.5,
      }),
    ).toBe("bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.5");
  });
});
