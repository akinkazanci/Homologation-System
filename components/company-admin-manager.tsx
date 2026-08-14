"use client"

import Image from "next/image"
import { useState } from "react"
import { AlertCircle, Check, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { companyCertificateLogos } from "@/lib/company-data"
import { useCertificates } from "@/lib/certificates-store"

const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png"
const MAX_FILE_SIZE = 10 * 1024 * 1024

type UploadState = {
  status: "idle" | "uploading" | "success" | "error"
  percent: number
  message: string
}

const idleState: UploadState = { status: "idle", percent: 0, message: "" }

export function CompanyAdminManager() {
  const { companyCertificates, uploadCompanyCertificateFile, removeCompanyCertificateFile } = useCertificates()
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({})

  function setUploadState(certId: string, state: Partial<UploadState>) {
    setUploadStates((prev) => ({ ...prev, [certId]: { ...idleState, ...prev[certId], ...state } }))
  }

  async function handleFileSelect(certId: string, event: React.ChangeEvent<HTMLInputElement>) {
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

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Dosya çok büyük. Maksimum 10 MB.")
      }

      await uploadCompanyCertificateFile(certId, file, (percent) => {
        setUploadState(certId, {
          status: percent >= 100 ? "success" : "uploading",
          percent,
          message: percent >= 100 ? "Yükleme tamamlandı." : `%${percent} yükleniyor...`,
        })
      })

      setUploadState(certId, { status: "success", percent: 100, message: "Belge company sayfasına bağlandı." })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dosya yüklenirken bilinmeyen bir hata oluştu."
      setUploadState(certId, { status: "error", percent: 0, message })
    }
  }

  return (
    <section id="company-certificates" className="mt-8 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company certificates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and replace company-level certificate files without changing the logo grid on the public page.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Supported formats: PDF, JPG, PNG · max 10 MB
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {companyCertificates.map((cert) => {
          const logo = companyCertificateLogos[cert.id as keyof typeof companyCertificateLogos]
          const state = uploadStates[cert.id] ?? idleState
          return (
            <article key={cert.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 p-2">
                  <Image
                    src={logo}
                    alt={cert.logoAlt}
                    placeholder="blur"
                    sizes="96px"
                    className="h-auto max-h-20 w-auto max-w-full object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {cert.standard}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {cert.issuer}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-foreground">{cert.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cert.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {cert.fileData ? `Yüklü dosya: ${cert.fileName} · ${cert.fileSize}` : "Henüz dosya yüklenmedi."}
                  </div>
                </div>
              </div>

              {state.status !== "idle" && (
                <div className="mt-4 rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-xs">
                    {state.status === "uploading" && <Upload className="size-3 animate-pulse text-primary" />}
                    {state.status === "success" && <Check className="size-3 text-emerald-500" />}
                    {state.status === "error" && <AlertCircle className="size-3 text-destructive" />}
                    <span
                      className={
                        state.status === "error"
                          ? "font-medium text-destructive"
                          : state.status === "success"
                            ? "font-medium text-emerald-600"
                            : "text-muted-foreground"
                      }
                    >
                      {state.message}
                    </span>
                  </div>
                  {state.status === "uploading" && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-150"
                        style={{ width: `${state.percent}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary ${
                    state.status === "uploading" ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <Upload className="size-4" />
                  {cert.fileData ? "Belgeyi değiştir" : "Belge yükle"}
                  <input
                    type="file"
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={(event) => handleFileSelect(cert.id, event)}
                    disabled={state.status === "uploading"}
                  />
                </label>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeCompanyCertificateFile(cert.id)}
                  disabled={!cert.fileData}
                >
                  <Trash2 />
                  Belgeyi kaldır
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
