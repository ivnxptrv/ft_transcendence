import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";

import { routing } from "./routing";
import en from "./messages/en";
import th from "./messages/th";
import ru from "./messages/ru";
import fr from "./messages/fr";

const dictionaries = { en, th, ru, fr };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: dictionaries[locale],
  };
});
