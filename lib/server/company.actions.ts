import fsPromises from "fs/promises"
import path from "path"
import crypto from "crypto"

const DATA_DIR = path.join(process.cwd(), "data")
const COMPANY_CERTS_FILE = path.join(DATA_DIR, "company-certificates.json")
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

async function ensureDataDir() {
  try {
    await fsPromises.mkdir(DATA_DIR, { recursive: true })
  } catch (e) {
    // ignore
  }
}

async function ensureUploadsDir() {
  try {
    await fsPromises.mkdir(UPLOADS_DIR, { recursive: true })
  } catch (e) {
    // ignore
  }
}

async function readCompanyCertificates(): Promise<Record<string, any>> {
  try {
    await ensureDataDir()
    const fs = await import("fs")
    if (!fs.existsSync(COMPANY_CERTS_FILE)) {
      return {}
    }
    const raw = await fsPromises.readFile(COMPANY_CERTS_FILE, "utf8")
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" ? parsed : {}
  } catch (e) {
    console.warn("Failed reading company certificates, starting fresh:", e)
    return {}
  }
}

async function writeCompanyCertificates(certs: Record<string, any>) {
  await ensureDataDir()
  await fsPromises.writeFile(COMPANY_CERTS_FILE, JSON.stringify(certs, null, 2), "utf8")
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function uploadCompanyCertificateFileAction(form: FormData) {
  try {
    const certId = String(form.get("certId") || "")
    const file = form.get("file") as any

    if (!certId || !file) {
      return { ok: false, error: "Eksik form verisi.", result: null }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hash = crypto.createHash("sha256").update(buffer).digest("hex")

    await ensureUploadsDir()

    const originalName = (file.name && String(file.name)) || `${certId}.bin`
    const ext = path.extname(originalName) || ""
    const storedFileName = `${certId}-${Date.now()}${ext}`
    const storedPath = path.join(UPLOADS_DIR, storedFileName)

    await fsPromises.writeFile(storedPath, buffer)

    const companyCerts = await readCompanyCertificates()
    companyCerts[certId] = {
      certId,
      fileName: originalName,
      mimeType: file.type || "application/octet-stream",
      fileSize: formatFileSize(buffer.length),
      uploadedAt: new Date().toISOString(),
      storedFileId: storedFileName,
      storedFileUrl: `/uploads/${storedFileName}`,
      storedFileHash: hash,
    }
    await writeCompanyCertificates(companyCerts)

    return {
      ok: true,
      result: companyCerts[certId],
    }
  } catch (e) {
    return { ok: false, error: String(e), result: null }
  }
}

export async function fetchCompanyCertificatesAction() {
  try {
    return await readCompanyCertificates()
  } catch (e) {
    console.error("Failed to fetch company certificates:", e)
    return {}
  }
}

export async function removeCompanyCertificateAction(certId: string) {
  try {
    const companyCerts = await readCompanyCertificates()
    delete companyCerts[certId]
    await writeCompanyCertificates(companyCerts)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
