/* Reference rates: verify category and fiscal territory before use. */
(function(root){
const countries=[
  {
    "code": "ES",
    "name": "España",
    "currency": "EUR",
    "standardRate": 21,
    "taxName": "IVA",
    "cities": [
      "Madrid",
      "Barcelona",
      "Valencia",
      "Sevilla",
      "Málaga"
    ],
    "otherRates": [
      10,
      4
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "FR",
    "name": "Francia",
    "currency": "EUR",
    "standardRate": 20,
    "taxName": "TVA",
    "cities": [
      "París",
      "Lyon",
      "Marsella",
      "Niza"
    ],
    "otherRates": [
      10,
      5.5,
      2.1
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "IT",
    "name": "Italia",
    "currency": "EUR",
    "standardRate": 22,
    "taxName": "IVA",
    "cities": [
      "Roma",
      "Milán",
      "Florencia",
      "Venecia",
      "Nápoles"
    ],
    "otherRates": [
      10,
      5,
      4
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "DE",
    "name": "Alemania",
    "currency": "EUR",
    "standardRate": 19,
    "taxName": "MwSt",
    "cities": [
      "Berlín",
      "Múnich",
      "Hamburgo",
      "Fráncfort"
    ],
    "otherRates": [
      7
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "PT",
    "name": "Portugal",
    "currency": "EUR",
    "standardRate": 23,
    "taxName": "IVA",
    "cities": [
      "Lisboa",
      "Oporto",
      "Faro"
    ],
    "otherRates": [
      13,
      6
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "NL",
    "name": "Países Bajos",
    "currency": "EUR",
    "standardRate": 21,
    "taxName": "BTW",
    "cities": [
      "Ámsterdam",
      "Róterdam",
      "La Haya"
    ],
    "otherRates": [
      9
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "BE",
    "name": "Bélgica",
    "currency": "EUR",
    "standardRate": 21,
    "taxName": "TVA / BTW",
    "cities": [
      "Bruselas",
      "Brujas",
      "Amberes"
    ],
    "otherRates": [
      12,
      6
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "AT",
    "name": "Austria",
    "currency": "EUR",
    "standardRate": 20,
    "taxName": "USt",
    "cities": [
      "Viena",
      "Salzburgo",
      "Innsbruck"
    ],
    "otherRates": [
      13,
      10
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "GR",
    "name": "Grecia",
    "currency": "EUR",
    "standardRate": 24,
    "taxName": "ΦΠΑ",
    "cities": [
      "Atenas",
      "Tesalónica",
      "Heraclión"
    ],
    "otherRates": [
      17,
      13,
      6,
      4
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "IE",
    "name": "Irlanda",
    "currency": "EUR",
    "standardRate": 23,
    "taxName": "VAT",
    "cities": [
      "Dublín",
      "Cork",
      "Galway"
    ],
    "otherRates": [
      13.5,
      9
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "DK",
    "name": "Dinamarca",
    "currency": "DKK",
    "standardRate": 25,
    "taxName": "Moms",
    "cities": [
      "Copenhague",
      "Aarhus",
      "Odense"
    ],
    "otherRates": [
      0
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "SE",
    "name": "Suecia",
    "currency": "SEK",
    "standardRate": 25,
    "taxName": "Moms",
    "cities": [
      "Estocolmo",
      "Gotemburgo",
      "Malmö"
    ],
    "otherRates": [
      12,
      6
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "PL",
    "name": "Polonia",
    "currency": "PLN",
    "standardRate": 23,
    "taxName": "VAT",
    "cities": [
      "Varsovia",
      "Cracovia",
      "Gdansk"
    ],
    "otherRates": [
      8,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "CZ",
    "name": "Chequia",
    "currency": "CZK",
    "standardRate": 21,
    "taxName": "DPH",
    "cities": [
      "Praga",
      "Brno",
      "Karlovy Vary"
    ],
    "otherRates": [
      12,
      0
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "HU",
    "name": "Hungría",
    "currency": "HUF",
    "standardRate": 27,
    "taxName": "ÁFA",
    "cities": [
      "Budapest",
      "Debrecen",
      "Szeged"
    ],
    "otherRates": [
      18,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "FI",
    "name": "Finlandia",
    "currency": "EUR",
    "standardRate": 25.5,
    "taxName": "ALV",
    "cities": [
      "Helsinki",
      "Turku",
      "Tampere"
    ],
    "otherRates": [
      13.5,
      10
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "HR",
    "name": "Croacia",
    "currency": "EUR",
    "standardRate": 25,
    "taxName": "PDV",
    "cities": [
      "Zagreb",
      "Split",
      "Dubrovnik"
    ],
    "otherRates": [
      13,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "SI",
    "name": "Eslovenia",
    "currency": "EUR",
    "standardRate": 22,
    "taxName": "DDV",
    "cities": [
      "Liubliana",
      "Maribor",
      "Bled"
    ],
    "otherRates": [
      9.5,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "SK",
    "name": "Eslovaquia",
    "currency": "EUR",
    "standardRate": 23,
    "taxName": "DPH",
    "cities": [
      "Bratislava",
      "Košice",
      "Žilina"
    ],
    "otherRates": [
      19,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "RO",
    "name": "Rumanía",
    "currency": "RON",
    "standardRate": 21,
    "taxName": "TVA",
    "cities": [
      "Bucarest",
      "Cluj-Napoca",
      "Brașov"
    ],
    "otherRates": [
      11
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "BG",
    "name": "Bulgaria",
    "currency": "EUR",
    "standardRate": 20,
    "taxName": "ДДС",
    "cities": [
      "Sofía",
      "Plovdiv",
      "Varna"
    ],
    "otherRates": [
      9
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "EE",
    "name": "Estonia",
    "currency": "EUR",
    "standardRate": 24,
    "taxName": "KM",
    "cities": [
      "Tallin",
      "Tartu",
      "Pärnu"
    ],
    "otherRates": [
      9
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "LV",
    "name": "Letonia",
    "currency": "EUR",
    "standardRate": 21,
    "taxName": "PVN",
    "cities": [
      "Riga",
      "Jūrmala",
      "Liepāja"
    ],
    "otherRates": [
      12,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "LT",
    "name": "Lituania",
    "currency": "EUR",
    "standardRate": 21,
    "taxName": "PVM",
    "cities": [
      "Vilna",
      "Kaunas",
      "Klaipėda"
    ],
    "otherRates": [
      12,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "LU",
    "name": "Luxemburgo",
    "currency": "EUR",
    "standardRate": 17,
    "taxName": "TVA",
    "cities": [
      "Luxemburgo",
      "Vianden",
      "Echternach"
    ],
    "otherRates": [
      14,
      8,
      3
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "MT",
    "name": "Malta",
    "currency": "EUR",
    "standardRate": 18,
    "taxName": "VAT",
    "cities": [
      "La Valeta",
      "Sliema",
      "Mdina"
    ],
    "otherRates": [
      12,
      7,
      5
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "CY",
    "name": "Chipre",
    "currency": "EUR",
    "standardRate": 19,
    "taxName": "ΦΠΑ",
    "cities": [
      "Nicosia",
      "Limasol",
      "Pafos"
    ],
    "otherRates": [
      9,
      5,
      3
    ],
    "eu": true,
    "source": "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": "2026-07-13"
  },
  {
    "code": "GB",
    "name": "Reino Unido",
    "currency": "GBP",
    "standardRate": 20,
    "taxName": "VAT",
    "cities": [
      "Londres",
      "Edimburgo",
      "Manchester",
      "Belfast"
    ],
    "otherRates": [
      5,
      0
    ],
    "eu": false,
    "source": "https://www.gov.uk/vat-rates",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": null
  },
  {
    "code": "CH",
    "name": "Suiza",
    "currency": "CHF",
    "standardRate": 8.1,
    "taxName": "MWST / TVA / IVA",
    "cities": [
      "Zúrich",
      "Ginebra",
      "Berna",
      "Lucerna"
    ],
    "otherRates": [
      3.8,
      2.6
    ],
    "eu": false,
    "source": "https://www.estv.admin.ch/en/vat-rates-switzerland",
    "checkedAt": "2026-10-02",
    "sourceCheckedAt": null
  }
];
const api={countries, country:code=>countries.find(c=>c.code===code)};
root.TaxEuropeData=api; if(typeof module!=="undefined")module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
