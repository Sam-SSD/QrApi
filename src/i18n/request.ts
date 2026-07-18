import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Referencia global para format.relativeTime: un único instante por
    // request, heredado por NextIntlClientProvider (evita el fallback
    // ENVIRONMENT_FALLBACK y desajustes de hidratación).
    now: new Date(),
  };
});
