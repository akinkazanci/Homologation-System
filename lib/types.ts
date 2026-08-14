export type ProductFamily =
  | "radio-dab"
  | "series-250"
  | "a7"
  | "smart-audio"
  | "multimedia"
  | "antenna"

export type CertificateType =
  | "EU DoC"
  | "SDoC"
  | "CE"
  | "E Mark"
  | "RED"
  | "WEEE"
  | "Self Declaration"
  | "UKCA"
  | "SII"
  | "Ukraine"

export interface Certificate {
  id: string
  name: string
  /** Country or region the homologation applies to, e.g. "EU", "UK", "UNECE" */
  region: string
  type: CertificateType
  issueDate: string // ISO date string
  expiryDate: string // ISO date string
  fileName: string
  /** Approximate file size label for display, e.g. "1.2 MB" */
  fileSize: string
  /** MIME type of the stored file, e.g. "application/pdf", "image/jpeg", "image/png" */
  mimeType?: string
  /** Base64-encoded file content for client-side storage. Used only as offline fallback. */
  fileData?: string
  /** Upload timestamp (ISO string) for audit trail */
  uploadedAt?: string
  /** Stable internal identifier for the stored blob; used for API downloads and preview */
  storedFileId?: string
  /** Public-safe relative URL to download the file (e.g. /api/certificates/.../file) */
  storedFileUrl?: string
  /** Hex hash for change detection and corruption checks */
  storedFileHash?: string
}

export interface Product {
  code: string // e.g. "D715AF"
  family: ProductFamily
  description: string
  certificates: Certificate[]
}

export interface CompanyCertificateUpload {
  fileName: string
  fileSize: string
  mimeType?: string
  fileData?: string
  uploadedAt?: string
}

export interface CompanyCertificateSeed {
  id: string
  title: string
  standard: string
  issuer: string
  description: string
  logoAlt: string
}

export interface CompanyCertificate extends CompanyCertificateSeed, CompanyCertificateUpload {
  href: string
  width: number
  height: number
}
