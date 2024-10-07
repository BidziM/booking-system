/**
 * Country Code
 *
 * @enum {string}
 */
export enum Country {
  Andorra = 'AD',
  Austria = 'AT',
  Belgium = 'BE',
  Cyprus = 'CY',
  CzechRepublic = 'CZ',
  Denmark = 'DK',
  Estonia = 'EE',
  Finland = 'FI',
  France = 'FR',
  Greece = 'EL',
  Spain = 'ES',
  Norway = 'NO',
  Poland = 'PL',
  Portugal = 'PT',
  SanMarino = 'SM',
  Slovakia = 'SK',
  Slovenia = 'SI',
  Switzerland = 'CH',
  Sweden = 'SE',
  Hungary = 'HU',
  GreatBritain = 'GB',
  Italy = 'IT',
  Netherland = 'NL',
  Ireland = 'IE',
  Island = 'IS',
  Lithuania = 'LT',
  Latvia = 'LV',
  Luxemburg = 'LU',
  Malta = 'MT',
  USA = 'US',
  Canada = 'CA',
  Japan = 'JP',
  Ukraine = 'UA',
  Belarus = 'BY',
  Russia = 'RU',
}

/**
 * Language
 *
 * @enum {number}
 */
export enum Language {
  PL = 'pl',
  EN = 'en',
  DE = 'de',
  ES = 'es',
  IT = 'it',
}

/**
 * Channels of payment
 *
 * @export
 * @enum {number}
 */
export enum Channel {
  Card = 1,
  Transfer = 2,
  TraditionalTransfer = 4,
  NA = 8,
  All = 16,
  UsePrePayment = 32,
  OnlyPayByLink = 64,
  InstalmentPaymentForms = 128,
  WalletsToActivate = 256,
}

/**
 * Character Encoding
 *
 * @enum {number}
 */
export enum Encoding {
  ISO8859 = 'ISO-8859-2',
  UTF8 = 'UTF-8',
  WINDOWS1250 = 'Windows-1250',
}

/**
 * Currency Type
 *
 * @enum {string}
 */
export enum Currency {
  PLN = 'PLN',
  EUR = 'EUR',
  GBP = 'GPB',
  CZK = 'CZK',
}
