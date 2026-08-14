import fs from "fs"
import fsPromises from "fs/promises"
import path from "path"
import crypto from "crypto"
import { products as seedProducts } from "@/lib/data"
import type { Product, Certificate } from "@/lib/types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "products.json")
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

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

async function readStoredProducts(): Promise<Product[]> {
  try {
    await ensureDataDir()
    if (!fs.existsSync(DATA_FILE)) {
      // initialize from seed
      await fsPromises.writeFile(DATA_FILE, JSON.stringify(seedProducts, null, 2), "utf8")
      return clone(seedProducts)
    }
    const raw = await fsPromises.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Product[]
    return clone(seedProducts)
  } catch (e) {
    console.warn("Failed reading stored products, falling back to seed:", e)
    return clone(seedProducts)
  }
}

async function writeStoredProducts(products: Product[]) {
  await ensureDataDir()
  await fsPromises.writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf8")
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function makeId(prefix = "cert"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function fetchProductsAction(): Promise<Product[]> {
  return await readStoredProducts()
}

export async function addProductAction(product: { code: string; family: string; description: string }) {
  try {
    const products = await readStoredProducts()
    const exists = products.find((p) => p.code === product.code)
    if (exists) return { ok: false, error: "Ürün zaten mevcut.", products }
    const next: Product = { code: product.code, family: product.family as any, description: product.description, certificates: [] }
    products.unshift(next)
    await writeStoredProducts(products)
    return { ok: true, products }
  } catch (e) {
    return { ok: false, error: String(e), products: [] }
  }
}

export async function removeProductAction(code: string) {
  try {
    const products = await readStoredProducts()
    const next = products.filter((p) => p.code !== code)
    await writeStoredProducts(next)
    return { ok: true, products: next }
  } catch (e) {
    return { ok: false, error: String(e), products: [] }
  }
}

export async function addCertificateAction({ productCode, cert }: { productCode: string; cert: Omit<Certificate, "id"> }) {
  try {
    const products = await readStoredProducts()
    const p = products.find((x) => x.code === productCode)
    if (!p) return { ok: false, error: "Ürün bulunamadı.", products }
    const id = makeId("cert")
    const nextCert: Certificate = {
      id,
      name: cert.name,
      region: cert.region,
      type: cert.type,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      fileName: cert.fileName,
      fileSize: cert.fileSize,
    }
    p.certificates.push(nextCert)
    await writeStoredProducts(products)
    return { ok: true, products }
  } catch (e) {
    return { ok: false, error: String(e), products: [] }
  }
}

export async function removeCertificateAction({ productCode, certId }: { productCode: string; certId: string }) {
  try {
    const products = await readStoredProducts()
    const p = products.find((x) => x.code === productCode)
    if (!p) return { ok: false, error: "Ürün bulunamadı.", products }
    p.certificates = p.certificates.filter((c) => c.id !== certId)
    await writeStoredProducts(products)
    return { ok: true, products }
  } catch (e) {
    return { ok: false, error: String(e), products: [] }
  }
}

export async function uploadCertificateFileAction(form: FormData) {
  try {
    const productCode = String(form.get("productCode") || "")
    const certId = String(form.get("certId") || "")
    const file = form.get("file") as any

    if (!productCode || !certId || !file) {
      return { ok: false, error: "Eksik form verisi.", products: [] }
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

    const products = await readStoredProducts()
    const p = products.find((x) => x.code === productCode)
    if (!p) return { ok: false, error: "Ürün bulunamadı.", products }

    p.certificates = p.certificates.map((c) => {
      if (c.id !== certId) return c
      return {
        ...c,
        mimeType: file.type || c.mimeType,
        fileName: originalName || c.fileName,
        fileSize: formatFileSize(buffer.length),
        uploadedAt: new Date().toISOString(),
        storedFileId: storedFileName,
        storedFileUrl: `/uploads/${storedFileName}`,
        storedFileHash: hash,
      }
    })

    await writeStoredProducts(products)

    return { ok: true, products }
  } catch (e) {
    return { ok: false, error: String(e), products: [] }
  }
}
