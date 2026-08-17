import type { Product, ProductFamily } from "./types"

/**
 * Static demo data based on Daiichi's real homologation catalogue.
 * Structured so it can later be replaced by a real database + blob
 * storage layer without changing the UI components.
 *
 * Products are grouped into six families (see FAMILY_ORDER / familyLabels).
 */

/** Human-readable family names shown in tabs and headings. */
export const familyLabels: Record<ProductFamily, string> = {
  "radio-dab": "Radio",
  "series-250": "250 Series (SPS / MCA / MY250)",
  a7: "Multimedia & Navigation",
  "smart-audio": "Smart Audio Systems",
  multimedia: "In-Vehicle Multimedia",
  antenna: "Antenna Systems",
}

/** Short badge labels shown on product cards. */
export const familyShort: Record<ProductFamily, string> = {
  "radio-dab": "DAB",
  "series-250": "250",
  a7: "A7",
  "smart-audio": "AUDIO",
  multimedia: "M&P",
  antenna: "GNSS",
}

/** Display order of families. */
export const FAMILY_ORDER: ProductFamily[] = [
  "radio-dab",
  "series-250",
  "a7",
  "smart-audio",
  "multimedia",
  "antenna",
]

let certSeq = 0
function cert(
  name: string,
  region: string,
  type: Product["certificates"][number]["type"],
  issueDate: string,
  expiryDate: string,
  fileSize: string,
) {
  certSeq += 1
  const fileName = `${name.replace(/[^\w-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")}.pdf`
  return { id: `cert-${certSeq}`, name, region, type, issueDate, expiryDate, fileName, fileSize }
}

// Shared certificate set for the three Radio DAB MY24 variants.
function dabVariantCerts(variant: string) {
  return [
    cert(`EU Declaration of Conformity — Radio DAB MY24 ${variant}`, "EU", "EU DoC", "2024-02-05", "2029-02-04", "1.3 MB"),
    cert(`Supplier's Declaration of Conformity — Radio DAB MY24 ${variant}`, "EU", "SDoC", "2024-02-05", "2029-02-04", "0.9 MB"),
    cert(`CE Certificate — Radio DAB MY24 ${variant}`, "EU", "CE", "2024-02-08", "2029-02-07", "1.1 MB"),
    cert(`E Mark Certificate — Radio DAB MY24 ${variant}`, "UNECE", "E Mark", "2024-02-10", "2029-02-09", "0.8 MB"),
    cert(`RED Certificate — Radio DAB MY24 ${variant}`, "EU", "RED", "2024-02-12", "2029-02-11", "1.0 MB"),
    cert(`WEEE Certificate — Radio DAB MY24 ${variant}`, "EU", "WEEE", "2024-02-12", "2029-02-11", "0.5 MB"),
  ]
}

export const products: Product[] = [
  // 1. Radio DAB MY24 Series
  {
    code: "DAB Daily",
    family: "radio-dab",
    description: "Radio DAB MY24 — Daily Variant",
    certificates: dabVariantCerts("Daily Variant"),
  },
  {
    code: "DAB Eurocargo",
    family: "radio-dab",
    description: "Radio DAB MY24 — Eurocargo Variant",
    certificates: dabVariantCerts("Eurocargo Variant"),
  },
  {
    code: "DAB S-Way",
    family: "radio-dab",
    description: "Radio DAB MY24 — S-Way Variant",
    certificates: dabVariantCerts("S-Way Variant"),
  },

  // 2. 250 Series (SPS, MCA & MY250)
  {
    code: "250 Series",
    family: "series-250",
    description: "250 Series — SPS, MCA & MY250",
    certificates: [
      cert("EU Declaration of Conformity — 250 SPS (Smart Audio 2.0)", "EU", "EU DoC", "2023-09-01", "2028-08-31", "1.2 MB"),
      cert("EU Declaration of Conformity — 250 SPS A7+ (332BEV & 965 Tonale, VQC1006)", "EU", "EU DoC", "2023-09-15", "2028-09-14", "1.4 MB"),
      cert("EU Declaration of Conformity — 250MCA (250MY24, ICS0707)", "EU", "EU DoC", "2024-01-20", "2029-01-19", "1.3 MB"),
      cert("Self Declaration — MY250", "Global", "Self Declaration", "2024-02-01", "2029-01-31", "0.7 MB"),
      cert("UKCA Certification — MY250", "UK", "UKCA", "2024-02-10", "2029-02-09", "1.0 MB"),
      cert("E Mark Certificate — MY250", "UNECE", "E Mark", "2024-02-12", "2029-02-11", "0.8 MB"),
      cert("RED Certificate — MY250", "EU", "RED", "2024-02-14", "2029-02-13", "1.0 MB"),
      cert("WEEE Certificate — MY250", "EU", "WEEE", "2024-02-14", "2029-02-13", "0.5 MB"),
    ],
  },

  // 3. A7 Multimedia & Navigation Devices
  {
    code: "D715AF",
    family: "a7",
    description: "225TR A7 Device",
    certificates: [
      cert("Self Declaration — D715AF (225TR A7 Device)", "Global", "Self Declaration", "2023-06-01", "2028-05-31", "0.7 MB"),
      cert("CE Certificate — D715AF Car Navigation (English)", "EU", "CE", "2023-06-10", "2028-06-09", "1.1 MB"),
      cert("CE Certificate — D715AF Car Navigation (Ukrainian)", "Ukraine", "Ukraine", "2023-06-10", "2028-06-09", "1.1 MB"),
    ],
  },
  {
    code: "D716AF",
    family: "a7",
    description: "250 A7 Device",
    certificates: [
      cert("Self Declaration — D716AF (A7 Device)", "Global", "Self Declaration", "2023-07-01", "2028-06-30", "0.7 MB"),
      cert("CE Certificate — D716AF 250 (A7 Device)", "EU", "CE", "2023-07-10", "2028-07-09", "1.1 MB"),
      cert("E Mark Certificate — D716AF (A7 Device)", "UNECE", "E Mark", "2023-07-12", "2028-07-11", "0.8 MB"),
      cert("UKCA Certification — D716AF", "UK", "UKCA", "2023-07-15", "2028-07-14", "1.0 MB"),
    ],
  },
  {
    code: "D719AF",
    family: "a7",
    description: "225EU A7 Device",
    certificates: [
      cert("Self Declaration — D719AF (225EU A7 Device)", "Global", "Self Declaration", "2023-08-01", "2028-07-31", "0.7 MB"),
      cert("CE Certificate — D719AF (225EU A7 Device)", "EU", "CE", "2023-08-10", "2028-08-09", "1.1 MB"),
      cert("E Mark Certificate — D719AF (225EU A7 Device)", "UNECE", "E Mark", "2023-08-12", "2028-08-11", "0.8 MB"),
      cert("UKCA Certification — D719AF", "UK", "UKCA", "2023-08-15", "2028-08-14", "1.0 MB"),
    ],
  },
  {
    code: "D721AL",
    family: "a7",
    description: "A7 Device",
    certificates: [
      cert("Self Declaration — D721AL (A7 Device)", "Global", "Self Declaration", "2023-10-01", "2028-09-30", "0.7 MB"),
      cert("CE Certificate — D721AL (A7 Device)", "EU", "CE", "2023-10-10", "2028-10-09", "1.1 MB"),
      cert("E Mark Certificate — D721AL (A7 Device)", "UNECE", "E Mark", "2023-10-12", "2028-10-11", "0.8 MB"),
    ],
  },
  {
    code: "D723AF",
    family: "a7",
    description: "Car Media Player Navigation System",
    certificates: [
      cert("Self Declaration — D723AF (Car Media Player Navigation System)", "Global", "Self Declaration", "2024-03-01", "2029-02-28", "0.7 MB"),
      cert("CE Certificate — D723AF (Car Media Player Navigation System)", "EU", "CE", "2024-03-10", "2029-03-09", "1.1 MB"),
      cert("E Mark Certificate — D723AF (Car Media Player Navigation System)", "UNECE", "E Mark", "2024-03-12", "2029-03-11", "0.8 MB"),
      cert("UKCA Declaration — D723AF (EMC)", "UK", "UKCA", "2024-03-15", "2029-03-14", "1.0 MB"),
      cert("UKCA Declaration — D723AF (RED)", "UK", "UKCA", "2024-03-15", "2029-03-14", "1.0 MB"),
    ],
  },

  // 4. Smart Audio Systems
  {
    code: "D001SF",
    family: "smart-audio",
    description: "Smart Audio Device",
    certificates: [
      cert("CE Certificate — D001SF (Smart Audio Device)", "EU", "CE", "2023-04-10", "2028-04-09", "1.1 MB"),
      cert("SII Certificate — D001SF (Smart Audio Device)", "Israel", "SII", "2023-04-15", "2028-04-14", "0.9 MB"),
      cert("E Mark Certificate — D001SF (Smart Audio Device)", "UNECE", "E Mark", "2023-04-12", "2028-04-11", "0.8 MB"),
      cert("UKCA Certification — D001SF", "UK", "UKCA", "2023-04-18", "2028-04-17", "1.0 MB"),
    ],
  },
  {
    code: "846DAB",
    family: "smart-audio",
    description: "846DAB Audio",
    certificates: [
      cert("Self Declaration — 846DAB Audio", "Global", "Self Declaration", "2023-05-01", "2028-04-30", "0.7 MB"),
      cert("CE Certificate — 846DAB Audio", "EU", "CE", "2023-05-10", "2028-05-09", "1.1 MB"),
      cert("E Mark Certificate — 846DAB Audio", "UNECE", "E Mark", "2023-05-12", "2028-05-11", "0.8 MB"),
    ],
  },
  {
    code: "139LE",
    family: "smart-audio",
    description: "139LE Panda (ICS0705)",
    certificates: [
      cert("EU Declaration of Conformity — 139LE Panda (ICS0705)", "EU", "EU DoC", "2023-03-01", "2028-02-29", "1.2 MB"),
    ],
  },

  // 5. In-Vehicle Multimedia Systems
  {
    code: "M&P 3000",
    family: "multimedia",
    description: "M&P 3000 Series — M3001, M3002, M3003, M3004, P3000 A5",
    certificates: [
      cert("M&P 3000 Series Car Multimedia System Devices", "Global", "Self Declaration", "2023-11-01", "2028-10-31", "1.5 MB"),
      cert("Ukraine Certificate — M&P 3000 Series Devices", "Ukraine", "Ukraine", "2023-11-10", "2028-11-09", "1.2 MB"),
    ],
  },

  // 6. Antenna Systems (GPS / GNSS)
  {
    code: "GPS Antenna",
    family: "antenna",
    description: "CAR GPS Antenna",
    certificates: [
      cert("CAR GPS Antenna Document", "Global", "Self Declaration", "2023-02-01", "2028-01-31", "0.6 MB"),
    ],
  },
  {
    code: "GNSS Antenna",
    family: "antenna",
    description: "GNSS Antenna",
    certificates: [
      cert("Self Declaration — GNSS Antenna (English)", "Global", "Self Declaration", "2023-02-05", "2028-02-04", "0.6 MB"),
      cert("Self Declaration — GNSS Antenna (Ukrainian)", "Ukraine", "Ukraine", "2023-02-05", "2028-02-04", "0.6 MB"),
    ],
  },
]
