"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { companyCertificateLogos, companyCertificateSeeds } from "./company-data"
import { products as seedProducts } from "./data"
import {
  fetchProductsAction,
  addProductAction,
  removeProductAction,
  addCertificateAction,
  removeCertificateAction,
  uploadCertificateFileAction,
} from "@/lib/actions-client"
import type { Certificate, CompanyCertificate, CompanyCertificateUpload, Product, ProductFamily } from "./types"

const PRODUCT_STORAGE_KEY = "homologasyon-certificates-v1"
const COMPANY_STORAGE_KEY = "homologasyon-company-certificates-v1"

interface CertificatesContextValue {
  products: Product[]
  companyCertificates: CompanyCertificate[]
  families: ProductFamily[]
  addProduct: (product: Omit<Product, "certificates">) => void
  removeProduct: (code: string) => void
  addCertificate: (productCode: string, cert: Omit<Certificate, "id">) => void
  removeCertificate: (productCode: string, certId: string) => void
  uploadCertificateFile: (
    productCode: string,
    certId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<void>
  uploadCompanyCertificateFile: (certId: string, file: File, onProgress?: (percent: number) => void) => Promise<void>
  removeCompanyCertificateFile: (certId: string) => void
}

const CertificatesContext = createContext<CertificatesContextValue | null>(null)

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function generateCertId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cert-${crypto.randomUUID()}`
  }
  return `cert-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readFileAsBase64(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(",")[1] || result
      if (onProgress) onProgress(100)
      resolve(base64)
    }

    reader.onerror = () => {
      reject(new Error("Dosya okunurken bir hata oluştu."))
    }

    reader.readAsDataURL(file)
  })
}

function loadProductsFromStorage(): Product[] | null {
  try {
    const raw = localStorage.getItem(PRODUCT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Product[]
    return null
  } catch {
    return null
  }
}

function saveProductsToStorage(products: Product[]) {
  try {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products))
  } catch (err) {
    console.warn("Depolama alanı dolu olabilir – dosya verileri kaydedilemedi:", err)
  }
}

function loadCompanyUploadsFromStorage(): Record<string, CompanyCertificateUpload> {
  try {
    const raw = localStorage.getItem(COMPANY_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? (parsed as Record<string, CompanyCertificateUpload>) : {}
  } catch {
    return {}
  }
}

function saveCompanyUploadsToStorage(companyUploads: Record<string, CompanyCertificateUpload>) {
  try {
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(companyUploads))
  } catch (err) {
    console.warn("Şirket sertifika verileri kaydedilemedi:", err)
  }
}

function mergeProducts(primary: Product[], localCache: Product[] | null): Product[] {
  // Use server (primary) as the source of truth for product + certificate listing.
  // Local cache should only contribute supplemental persistent fields (e.g. fileData)
  // so merge them into the remote certificates by id without losing any remote entries.
  if (!localCache || localCache.length === 0) return primary
  const byCode = new Map(localCache.map((p) => [p.code, p]))
  return primary.map((p) => {
    const cached = byCode.get(p.code)
    if (!cached) return p
    const cachedById = new Map(cached.certificates.map((c) => [c.id, c]))
    const mergedCerts = p.certificates.map((remoteCert) => {
      const local = cachedById.get(remoteCert.id)
      if (!local) return remoteCert
      // Prefer server metadata (remoteCert) but keep local-only fields like fileData
      return {
        ...remoteCert,
        // local may contain fileData, uploadedAt or other client-side cache fields
        ...(
          // only copy fields that don't exist on remote or are specifically client-only
          (local.fileData ? { fileData: local.fileData } : {})
        ),
      }
    })
    return { ...p, certificates: mergedCerts }
  })
}

export function CertificatesProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => clone(seedProducts))
  const [companyUploads, setCompanyUploads] = useState<Record<string, CompanyCertificateUpload>>(() =>
    loadCompanyUploadsFromStorage(),
  )
  const [hydrated, setHydrated] = useState(false)

  // Provider mount olur olmaz sunucudan ürünleri çek ve state’i güncelle
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cached = loadProductsFromStorage()
        const remote = await fetchProductsAction()
        if (cancelled) return
        if (Array.isArray(remote) && remote.length > 0) {
          const merged = mergeProducts(remote, cached)
          setProducts(merged)
          saveProductsToStorage(merged)
        } else if (cached) {
          setProducts(cached)
        }
      } catch (err) {
        console.warn("Sunucu sertifika kayıtları alınamadı, önbellek kullanılıyor:", err)
        const cached = loadProductsFromStorage()
        if (!cancelled && cached) setProducts(cached)
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (hydrated) saveProductsToStorage(products)
  }, [products, hydrated])

  useEffect(() => {
    saveCompanyUploadsToStorage(companyUploads)
  }, [companyUploads])

  const addProduct = useCallback(async (product: Omit<Product, "certificates">) => {
    const res = await addProductAction(product)
    if (!res.ok) throw new Error(res.error || "Ürün eklenemedi.")
    setProducts(res.products)
  }, [])

  const removeProduct = useCallback(async (code: string) => {
    const res = await removeProductAction(code)
    if (!res.ok) throw new Error(res.error || "Ürün kaldırılamadı.")
    setProducts(res.products)
  }, [])

  const addCertificate = useCallback(async (productCode: string, cert: Omit<Certificate, "id">) => {
    const res = await addCertificateAction({ productCode, cert })
    if (!res.ok) throw new Error(res.error || "Sertifika eklenemedi.")
    setProducts(res.products)
  }, [])

  const removeCertificate = useCallback(async (productCode: string, certId: string) => {
    const res = await removeCertificateAction({ productCode, certId })
    if (!res.ok) throw new Error(res.error || "Sertifika kaldırılamadı.")
    setProducts(res.products)
  }, [])

  const uploadCertificateFile = useCallback(
    async (
      productCode: string,
      certId: string,
      file: File,
      onProgress?: (percent: number) => void,
    ) => {
      const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      const MAX_SIZE = 10 * 1024 * 1024

      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
      const allowedExt = ["pdf", "jpg", "jpeg", "png"]
      const isValidType = ALLOWED_TYPES.includes(file.type) || allowedExt.includes(ext)

      if (!isValidType) {
        throw new Error("Geçersiz dosya formatı. Sadece PDF, JPG ve PNG dosyaları kabul edilir.")
      }
      if (file.size > MAX_SIZE) {
        throw new Error("Dosya boyutu çok büyük. Maksimum 10 MB dosya yüklenebilir.")
      }

      if (onProgress) onProgress(10)
      // Client-side offline fallback için okumaya devam et, ama artık ana akış sunucu
      const base64Promise = readFileAsBase64(file, (p) => {
        const scaled = 10 + Math.round((p * 70) / 100)
        if (onProgress) onProgress(Math.min(80, scaled))
      }).catch(() => "")

      const form = new FormData()
      form.set("productCode", productCode)
      form.set("certId", certId)
      form.set("file", file)
      const res = await uploadCertificateFileAction(form)
      if (!res.ok || !res.products.length) {
        throw new Error(res.error || "Dosya sunucuya yüklenemedi.")
      }
      if (onProgress) onProgress(95)

      const base64 = await base64Promise
      const mergedProducts = res.products.map((p) => {
        if (p.code !== productCode) return p
        return {
          ...p,
          certificates: p.certificates.map((c) =>
            c.id !== certId
              ? c
              : {
                  ...c,
                  fileData: base64 || c.fileData,
                },
          ),
        }
      })
      setProducts(mergedProducts)
      if (onProgress) onProgress(100)
    },
    [],
  )

  const uploadCompanyCertificateFile = useCallback(
    async (certId: string, file: File, onProgress?: (percent: number) => void) => {
      const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      const MAX_SIZE = 10 * 1024 * 1024

      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
      const allowedExt = ["pdf", "jpg", "jpeg", "png"]
      const isValidType = ALLOWED_TYPES.includes(file.type) || allowedExt.includes(ext)

      if (!isValidType) {
        throw new Error("Geçersiz dosya formatı. Sadece PDF, JPG ve PNG dosyaları kabul edilir.")
      }

      if (file.size > MAX_SIZE) {
        throw new Error("Dosya boyutu çok büyük. Maksimum 10 MB dosya yüklenebilir.")
      }

      if (onProgress) onProgress(0)

      const base64 = await readFileAsBase64(file, onProgress)

      const mimeType =
        file.type ||
        (ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "application/pdf")

      setCompanyUploads((prev) => ({
        ...prev,
        [certId]: {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          mimeType,
          fileData: base64,
          uploadedAt: new Date().toISOString(),
        },
      }))
    },
    [],
  )

  const removeCompanyCertificateFile = useCallback((certId: string) => {
    setCompanyUploads((prev) => {
      const next = { ...prev }
      delete next[certId]
      return next
    })
  }, [])

  const families = useMemo<ProductFamily[]>(() => {
    const set = new Set<ProductFamily>()
    products.forEach((p) => set.add(p.family))
    return Array.from(set)
  }, [products])

  const companyCertificates = useMemo<CompanyCertificate[]>(
    () =>
      companyCertificateSeeds.map((cert) => {
        const logo = companyCertificateLogos[cert.id as keyof typeof companyCertificateLogos]
        const upload = companyUploads[cert.id] ?? {}
        return {
          ...cert,
          ...upload,
          href: logo.src,
          width: logo.width,
          height: logo.height,
        }
      }),
    [companyUploads],
  )

  const value = useMemo<CertificatesContextValue>(
    () => ({
      products,
      companyCertificates,
      families,
      addProduct,
      removeProduct,
      addCertificate,
      removeCertificate,
      uploadCertificateFile,
      uploadCompanyCertificateFile,
      removeCompanyCertificateFile,
    }),
    [
      products,
      companyCertificates,
      families,
      addProduct,
      removeProduct,
      addCertificate,
      removeCertificate,
      uploadCertificateFile,
      uploadCompanyCertificateFile,
      removeCompanyCertificateFile,
    ],
  )

  return <CertificatesContext.Provider value={value}>{children}</CertificatesContext.Provider>
}

export function useCertificates() {
  const ctx = useContext(CertificatesContext)
  if (!ctx) throw new Error("useCertificates must be used within a CertificatesProvider")
  return ctx
}
