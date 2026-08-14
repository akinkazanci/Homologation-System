import iso9001Logo from "@/app/assets/ISO-9001-470x470_c.jpg"
import iso14001Logo from "@/app/assets/iso14001-470x470_c.jpg"
import iatf16949Logo from "@/app/assets/iatf16949_2-470x470_c.jpg"
import iso27001Logo from "@/app/assets/27001-470x470_c.jpg"
import tisaxLogo from "@/app/assets/tisax1-370x206_c.jpg"
import type { CompanyCertificateSeed } from "./types"

export const companyCertificateSeeds: CompanyCertificateSeed[] = [
  {
    id: "iso-9001",
    title: "Quality Management System Certificate",
    standard: "ISO 9001",
    issuer: "SGS",
    description: "Corporate quality management certification for audited operational processes.",
    logoAlt: "ISO 9001 SGS certification logo",
  },
  {
    id: "iso-14001",
    title: "Environmental Management System Certificate",
    standard: "ISO 14001",
    issuer: "SGS",
    description: "Environmental management certification covering sustainability and compliance controls.",
    logoAlt: "ISO 14001 SGS certification logo",
  },
  {
    id: "iatf-16949",
    title: "Automotive Quality Management Certificate",
    standard: "IATF 16949",
    issuer: "SGS",
    description: "Automotive quality certification for production and service part workflows.",
    logoAlt: "IATF 16949 SGS certification logo",
  },
  {
    id: "iso-27001",
    title: "Information Security Management Certificate",
    standard: "ISO 27001",
    issuer: "Denetik Belgelendirme",
    description: "Information security certification for corporate data protection and governance practices.",
    logoAlt: "ISO 27001 Denetik certification logo",
  },
  {
    id: "tisax",
    title: "Trusted Information Security Assessment Exchange",
    standard: "TISAX",
    issuer: "ENX Association",
    description: "Automotive industry information security assessment recognized by ENX Association.",
    logoAlt: "TISAX ENX Association logo",
  },
]

export const companyCertificateLogos = {
  "iso-9001": iso9001Logo,
  "iso-14001": iso14001Logo,
  "iatf-16949": iatf16949Logo,
  "iso-27001": iso27001Logo,
  tisax: tisaxLogo,
} as const
