"use client"

import { useState } from "react"
import { Plus, Trash2, Upload, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompanyAdminManager } from "@/components/admin-dashboard/CompanyAdminManager"
import { useCertificates } from "@/lib/contexts/CertificatesContext"
import type { CertificateType, ProductFamily } from "@/lib/types"
import { FAMILY_ORDER, familyLabels } from "@/lib/constants"

const CERT_TYPES: CertificateType[] = [
  "EU DoC",
  "SDoC",
  "CE",
  "E Mark",
  "RED",
  "WEEE",
  "Self Declaration",
  "UKCA",
  "SII",
  "Ukraine",
]

const FAMILIES: ProductFamily[] = FAMILY_ORDER

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"

const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png"
const MAX_FILE_SIZE = 10 * 1024 * 1024

type UploadState = {
  status: "idle" | "uploading" | "success" | "error"
  percent: number
  message: string
}

const idleState: UploadState = { status: "idle", percent: 0, message: "" }

type Banner = { kind: "success" | "error"; text: string } | null

export function AdminDashboard() {
  const { products, addProduct, removeProduct, addCertificate, removeCertificate, uploadCertificateFile } =
    useCertificates()

  const [family, setFamily] = useState<ProductFamily>(FAMILIES[0])
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [banner, setBanner] = useState<Banner>(null)
  const [busy, setBusy] = useState(false)

  const [selectedCode, setSelectedCode] = useState<string>(products[0]?.code ?? "")

  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({})

  function pushBanner(b: Banner, ttlMs = 5000) {
    setBanner(b)
    if (b) {
      window.setTimeout(() => setBanner((cur) => (cur && cur.text === b.text ? null : cur)), ttlMs)
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || busy) return
    setBusy(true)
    try {
      await addProduct({
        code: code.trim().toUpperCase(),
        family,
        description: description.trim() || `${familyLabels[family] ?? family} product`,
      })
      setCode("")
      setDescription("")
      pushBanner({ kind: "success", text: "Ürün kalıcı olarak kaydedildi." })
    } catch (err) {
      pushBanner({ kind: "error", text: err instanceof Error ? err.message : "Ürün eklenemedi." })
    } finally {
      setBusy(false)
    }
  }

  const selected = products.find((p) => p.code === selectedCode) ?? null

  function setUploadState(certId: string, state: Partial<UploadState>) {
    setUploadStates((prev) => ({ ...prev, [certId]: { ...idleState, ...prev[certId], ...state } }))
  }

  async function handleFileSelect(
    productCode: string,
    certId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.target
    const file = input.files?.[0]

    if (!file) return

    input.value = ""

    setUploadState(certId, { status: "uploading", percent: 0, message: "Dosya yükleniyor..." })

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
      const allowedExt = ["pdf", "jpg", "jpeg", "png"]
      const allowedMime = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      const isValidType = allowedMime.includes(file.type) || allowedExt.includes(ext)

      if (!isValidType) {
        throw new Error("Geçersiz dosya formatı. Sadece PDF, JPG ve PNG kabul edilir.")
      }

      // Allow exception for E Mark Certificate of D723AF (cert-43) which may be larger than 10MB
      if (file.size > MAX_FILE_SIZE) {
        const isAllowedException = productCode === "D723AF" && certId === "cert-43"
        if (!isAllowedException) {
          throw new Error("Dosya çok büyük. Maksimum 10 MB.")
        }
      }

      await uploadCertificateFile(productCode, certId, file, (p) => {
        setUploadState(certId, {
          status: p >= 100 ? "success" : "uploading",
          percent: p,
          message: p >= 100 ? "Yükleme başarılı!" : `%${p} yükleniyor...`,
        })
      })

      setUploadState(certId, { status: "success", percent: 100, message: "Yükleme başarılı! Sertifika kaydedildi." })

      setTimeout(() => {
        setUploadStates((prev) => {
          const next = { ...prev }
          delete next[certId]
          return next
        })
      }, 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Yükleme sırasında bilinmeyen bir hata oluştu."
      setUploadState(certId, { status: "error", percent: 0, message })
      setTimeout(() => {
        setUploadStates((prev) => {
          const next = { ...prev }
          delete next[certId]
          return next
        })
      }, 5000)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin — Certificate Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add products by family and manage their homologation certificates. Uploaded originals are stored on the server and used directly by the product view.
        </p>
        {banner && (
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${
              banner.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {banner.text}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add product */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add product</h2>
          <form onSubmit={handleAddProduct} className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {FAMILIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFamily(f)}
                  className={`flex-1 min-w-[100px] rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    family === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/70 hover:border-primary/40"
                  }`}
                >
                  {familyLabels[f] ?? f}
                </button>
              ))}
            </div>
            <input
              className={fieldClass}
              placeholder="Product code (e.g. D715AF)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Product code"
            />
            <input
              className={fieldClass}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Product description"
            />
            <Button type="submit" disabled={busy}>
                  <Plus />
                  {busy ? "Kaydediliyor..." : "Add product"}
                </Button>
              </form>
            </section>

        {/* Add certificate */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Add certificate
          </h2>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Product</label>
            <select
              className={fieldClass}
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              aria-label="Select product"
            >
              {products.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>
          <CertificateForm
            key={selectedCode}
            disabled={!selected || busy}
            onAdd={async (cert) => {
              if (!selected || busy) return
              setBusy(true)
              try {
                await addCertificate(selected.code, cert)
                pushBanner({ kind: "success", text: "Sertifika kaydedildi." })
              } catch (err) {
                pushBanner({
                  kind: "error",
                  text: err instanceof Error ? err.message : "Sertifika eklenemedi.",
                })
              } finally {
                setBusy(false)
              }
            }}
          />
        </section>
      </div>

      {/* Product list */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Products &amp; certificates
        </h2>
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.code} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      {familyLabels[p.family] ?? p.family}
                    </span>
                    <span className="font-bold text-foreground">{p.code}</span>
                    <span className="text-sm text-muted-foreground">· {p.certificates.length} certs</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      try {
                        await removeProduct(p.code)
                        pushBanner({ kind: "success", text: `${p.code} silindi.` })
                      } catch (err) {
                        pushBanner({
                          kind: "error",
                          text: err instanceof Error ? err.message : "Ürün silinemedi.",
                        })
                      }
                    }}
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              {p.certificates.length > 0 && (
                <ul className="mt-3 divide-y divide-border border-t border-border">
                  {p.certificates.map((c) => {
                    const ustate = uploadStates[c.id] ?? idleState
                    return (
                      <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <div className="min-w-0 flex-1">
                          <span className="min-w-0 truncate text-foreground">
                            <span className="font-medium">{c.type}</span> · {c.name} ({c.region})
                          </span>
                          {c.fileData && (
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Check className="size-3 text-emerald-500" />
                              <span>Dosya yüklü: {c.fileName} · {c.fileSize}</span>
                            </div>
                          )}
                          {ustate.status !== "idle" && (
                            <div className="mt-1.5">
                              <div className="flex items-center gap-2 text-xs">
                                {ustate.status === "uploading" && (
                                  <Upload className="size-3 animate-pulse text-primary" />
                                )}
                                {ustate.status === "success" && (
                                  <Check className="size-3 text-emerald-500" />
                                )}
                                {ustate.status === "error" && (
                                  <AlertCircle className="size-3 text-destructive" />
                                )}
                                <span
                                  className={
                                    ustate.status === "error"
                                      ? "text-destructive font-medium"
                                      : ustate.status === "success"
                                        ? "text-emerald-600 font-medium"
                                        : "text-muted-foreground"
                                  }
                                >
                                  {ustate.message}
                                </span>
                              </div>
                              {ustate.status === "uploading" && (
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all duration-150"
                                    style={{ width: `${ustate.percent}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <label
                            className={`flex size-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-primary hover:text-primary ${
                              ustate.status === "uploading" ? "pointer-events-none opacity-50" : ""
                            }`}
                            aria-label={`Upload certificate file for ${c.name}`}
                            title={c.fileData ? "Yeni dosya yükle / Değiştir" : "Sertifika dosyası yükle"}
                          >
                            <Upload className="size-4" />
                            <input
                              type="file"
                              accept={ACCEPT_ATTR}
                              className="hidden"
                              onChange={(e) => handleFileSelect(p.code, c.id, e)}
                              disabled={ustate.status === "uploading"}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await removeCertificate(p.code, c.id)
                                pushBanner({ kind: "success", text: "Sertifika silindi." })
                              } catch (err) {
                                pushBanner({
                                  kind: "error",
                                  text: err instanceof Error ? err.message : "Sertifika silinemedi.",
                                })
                              }
                            }}
                            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:border hover:border-destructive hover:text-destructive"
                            aria-label={`Remove ${c.name}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <CompanyAdminManager />
    </div>
  )
}

function CertificateForm({
  onAdd,
  disabled,
}: {
  onAdd: (cert: {
    name: string
    region: string
    type: CertificateType
    issueDate: string
    expiryDate: string
    fileName: string
    fileSize: string
  }) => void
  disabled: boolean
}) {
  const [name, setName] = useState("")
  const [region, setRegion] = useState("EU")
  const [type, setType] = useState<CertificateType>("CE")
  const [issueDate, setIssueDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      region: region.trim() || "EU",
      type,
      issueDate: issueDate || new Date().toISOString().slice(0, 10),
      expiryDate: expiryDate || "2030-01-01",
      fileName: `${name.trim().replace(/\s+/g, "_")}.pdf`,
      fileSize: "—",
    })
    setName("")
    setIssueDate("")
    setExpiryDate("")
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <input
        className={fieldClass}
        placeholder="Certificate name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={disabled}
        aria-label="Certificate name"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className={fieldClass}
          placeholder="Region (e.g. EU)"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          disabled={disabled}
          aria-label="Region"
        />
        <select
          className={fieldClass}
          value={type}
          onChange={(e) => setType(e.target.value as CertificateType)}
          disabled={disabled}
          aria-label="Certificate type"
        >
          {CERT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Issue date</label>
          <input
            type="date"
            className={fieldClass}
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={disabled}
            aria-label="Issue date"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Expiry date</label>
          <input
            type="date"
            className={fieldClass}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            disabled={disabled}
            aria-label="Expiry date"
          />
        </div>
      </div>
      <Button type="submit" disabled={disabled}>
        <Plus />
        Add certificate
      </Button>
    </form>
  )
}
