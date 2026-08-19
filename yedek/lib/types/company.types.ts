export interface CompanyCertificateUpload {
  fileName: string
  fileSize: string
  mimeType?: string
  fileData?: string
  uploadedAt?: string
  storedFileId?: string
  storedFileUrl?: string
  storedFileHash?: string
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
