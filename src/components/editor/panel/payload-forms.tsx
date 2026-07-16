"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQrStore } from "@/stores/qr-store";
import type { QrPayloadType } from "@/lib/qr/schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

interface FormProps {
  issues: Record<string, string>;
}

function TextForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const value = useQrStore((s) => s.fields.text.text);
  const setField = useQrStore((s) => s.setField);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="pf-text">{t("text")}</Label>
      <Textarea
        id="pf-text"
        value={value}
        onChange={(e) => setField("text", "text", e.target.value)}
        placeholder={t("textPlaceholder")}
        rows={4}
        maxLength={2953}
      />
      <FieldError message={issues.text} />
    </div>
  );
}

function UrlForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const value = useQrStore((s) => s.fields.url.url);
  const setField = useQrStore((s) => s.setField);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="pf-url">{t("url")}</Label>
      <Input
        id="pf-url"
        type="url"
        inputMode="url"
        value={value}
        onChange={(e) => setField("url", "url", e.target.value)}
        placeholder={t("urlPlaceholder")}
        spellCheck={false}
      />
      <FieldError message={issues.url} />
    </div>
  );
}

function EmailForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const fields = useQrStore((s) => s.fields.email);
  const setField = useQrStore((s) => s.setField);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-email-to">{t("emailTo")}</Label>
        <Input
          id="pf-email-to"
          type="email"
          value={fields.to}
          onChange={(e) => setField("email", "to", e.target.value)}
          placeholder="hola@ejemplo.com"
        />
        <FieldError message={issues.to} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-email-subject">{t("emailSubject")}</Label>
        <Input
          id="pf-email-subject"
          value={fields.subject}
          onChange={(e) => setField("email", "subject", e.target.value)}
          maxLength={200}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-email-body">{t("emailBody")}</Label>
        <Textarea
          id="pf-email-body"
          value={fields.body}
          onChange={(e) => setField("email", "body", e.target.value)}
          rows={3}
          maxLength={1000}
        />
      </div>
    </div>
  );
}

function PhoneForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const value = useQrStore((s) => s.fields.phone.number);
  const setField = useQrStore((s) => s.setField);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="pf-phone">{t("phoneNumber")}</Label>
      <Input
        id="pf-phone"
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => setField("phone", "number", e.target.value)}
        placeholder="+34 600 111 222"
      />
      <FieldError message={issues.number} />
    </div>
  );
}

function SmsForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const fields = useQrStore((s) => s.fields.sms);
  const setField = useQrStore((s) => s.setField);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-sms-number">{t("smsNumber")}</Label>
        <Input
          id="pf-sms-number"
          type="tel"
          inputMode="tel"
          value={fields.number}
          onChange={(e) => setField("sms", "number", e.target.value)}
          placeholder="+34 600 111 222"
        />
        <FieldError message={issues.number} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-sms-message">{t("smsMessage")}</Label>
        <Textarea
          id="pf-sms-message"
          value={fields.message}
          onChange={(e) => setField("sms", "message", e.target.value)}
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  );
}

function WifiForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const fields = useQrStore((s) => s.fields.wifi);
  const setField = useQrStore((s) => s.setField);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-wifi-ssid">{t("wifiSsid")}</Label>
        <Input
          id="pf-wifi-ssid"
          value={fields.ssid}
          onChange={(e) => setField("wifi", "ssid", e.target.value)}
          maxLength={32}
          spellCheck={false}
        />
        <FieldError message={issues.ssid} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-wifi-security">{t("wifiSecurity")}</Label>
        <Select
          value={fields.security}
          onValueChange={(v) =>
            setField("wifi", "security", v as typeof fields.security)
          }
        >
          <SelectTrigger id="pf-wifi-security" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">{t("wifiNoPass")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {fields.security !== "nopass" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-wifi-password">{t("wifiPassword")}</Label>
          <Input
            id="pf-wifi-password"
            value={fields.password}
            onChange={(e) => setField("wifi", "password", e.target.value)}
            maxLength={63}
            spellCheck={false}
          />
          <FieldError message={issues.password} />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label htmlFor="pf-wifi-hidden">{t("wifiHidden")}</Label>
        <Switch
          id="pf-wifi-hidden"
          checked={fields.hidden}
          onCheckedChange={(v) => setField("wifi", "hidden", v)}
        />
      </div>
    </div>
  );
}

function VCardForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const fields = useQrStore((s) => s.fields.vcard);
  const setField = useQrStore((s) => s.setField);

  const input = (
    key: keyof typeof fields,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`pf-vcard-${key}`}>{label}</Label>
      <Input
        id={`pf-vcard-${key}`}
        value={fields[key]}
        onChange={(e) => setField("vcard", key, e.target.value)}
        {...props}
      />
      <FieldError message={issues[key]} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {input("firstName", t("vcardFirstName"))}
        {input("lastName", t("vcardLastName"))}
      </div>
      {input("organization", t("vcardOrganization"))}
      {input("title", t("vcardTitle"))}
      <div className="grid grid-cols-2 gap-3">
        {input("phone", t("vcardPhone"), { type: "tel" })}
        {input("email", t("vcardEmail"), { type: "email" })}
      </div>
      {input("website", t("vcardWebsite"), { type: "url", spellCheck: false })}
      {input("address", t("vcardAddress"))}
    </div>
  );
}

function CryptoForm({ issues }: FormProps) {
  const t = useTranslations("editor.content.fields");
  const fields = useQrStore((s) => s.fields.crypto);
  const setField = useQrStore((s) => s.setField);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-crypto-currency">{t("cryptoCurrency")}</Label>
        <Select
          value={fields.currency}
          onValueChange={(v) =>
            setField("crypto", "currency", v as typeof fields.currency)
          }
        >
          <SelectTrigger id="pf-crypto-currency" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bitcoin">Bitcoin</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-crypto-address">{t("cryptoAddress")}</Label>
        <Input
          id="pf-crypto-address"
          value={fields.address}
          onChange={(e) => setField("crypto", "address", e.target.value)}
          className="font-mono text-sm"
          spellCheck={false}
        />
        <FieldError message={issues.address} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-crypto-amount">{t("cryptoAmount")}</Label>
        <Input
          id="pf-crypto-amount"
          type="number"
          min="0"
          step="any"
          value={fields.amount}
          onChange={(e) => setField("crypto", "amount", e.target.value)}
        />
        <FieldError message={issues.amount} />
      </div>
    </div>
  );
}

const FORMS: Record<QrPayloadType, React.ComponentType<FormProps>> = {
  text: TextForm,
  url: UrlForm,
  email: EmailForm,
  phone: PhoneForm,
  sms: SmsForm,
  wifi: WifiForm,
  vcard: VCardForm,
  crypto: CryptoForm,
};

export function PayloadForm({
  type,
  issues,
}: {
  type: QrPayloadType;
  issues: Record<string, string>;
}) {
  const Form = FORMS[type];
  return <Form issues={issues} />;
}
