"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Download, FileText, Globe, Check, AlertCircle, ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CertificateType, Product } from "@/lib/types"

const typeStyles: Record<CertificateType, string> = {
  "EU DoC": "bg-primary/10 text-primary",
  SDoC: "bg-primary/10 text-primary",
  CE: "bg-accent text-accent-foreground",
  "E Mark": "bg-secondary text-secondary-foreground",
  RED: "bg-primary/10 text-primary",
  WEEE: "bg-muted text-foreground",
  "Self Declaration": "bg-muted text-foreground",
  UKCA: "bg-secondary text-secondary-foreground",
  SII: "bg-muted text-foreground",
  Ukraine: "bg-accent text-accent-foreground",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type PreviewHintKind = "idle" | "success" | "error"

interface PreviewHint {
  kind: PreviewHintKind
  message?: string
  isFallback?: boolean
}

const idleHint: PreviewHint = { kind: "idle" }

export function CertificatePanel({ product }: { product: Product | null }) {
  const [typeFilter, setTypeFilter] = useState<CertificateType | "all">("all")
  const [hints, setHints] = useState<Record<string, PreviewHint>>({})

  const types = useMemo<CertificateType[]>(() => {
    if (!product) return []
    return Array.from(new Set(product.certificates.map((c) => c.type)))
  }, [product])

  const visible = useMemo(() => {
    if (!product) return []
    return typeFilter === "all"
      ? product.certificates
      : product.certificates.filter((c) => c.type === typeFilter)
  }, [product, typeFilter])

  function setHint(certId: string, hint: PreviewHint, timeoutMs?: number) {
    setHints((prev) => ({ ...prev, [certId]: hint }))
    if (typeof timeoutMs === "number") {
      window.setTimeout(() => {
        setHints((prev) => {
          const next = { ...prev }
          delete next[certId]
          return next
        })
      }, timeoutMs)
    }
  }

  function previewPath(code: string, certId: string): string {
    return `/certificates/${encodeURIComponent(code)}/${encodeURIComponent(certId)}`
  }

  function effectiveHref(
    cert: (typeof visible)[number],
  ): { href: string; originalOpen: boolean } {
    if (!product) return { href: previewPath("X", cert.id), originalOpen: false }
    if (cert.storedFileUrl) {
      return { href: cert.storedFileUrl, originalOpen: true }
    }
    return { href: previewPath(product.code, cert.id), originalOpen: false }
  }

  function handlePreviewClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    cert: (typeof visible)[number],
  ) {
    if (!product) {
      e.preventDefault()
      setHint(cert.id, { kind: "error", message: "Ürün bulunamadı." }, 5000)
      return
    }
    const strategy = effectiveHref(cert)
    setHint(
      cert.id,
      {
        kind: "success",
        message: strategy.originalOpen
          ? "Orijinal sertifika yeni sekmede açılıyor..."
          : "Önizleme sayfası açılıyor...",
        isFallback: !strategy.originalOpen,
      },
      3500,
    )
  }

  if (!product) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <FileText className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">No product selected</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a product code on the left to view its certificates.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            {product.family}
          </span>
          <h2 className="text-lg font-bold tracking-tight text-foreground">{product.code}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
      </div>

      {types.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
          <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
            All ({product.certificates.length})
          </FilterChip>
          {types.map((t) => (
            <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {t}
            </FilterChip>
          ))}
        </div>
      )}

      <ul className="divide-y divide-border">
        {visible.map((cert) => {
          const hint = hints[cert.id] ?? idleHint
          const hasUploadedFile = Boolean(cert.fileData)
          const variant: "default" | "outline" = hasUploadedFile ? "default" : "outline"
          const linkClassName = cn(buttonVariants({ size: "sm", variant }), "shrink-0")
          return (
            <li
              key={cert.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                      typeStyles[cert.type] ?? "bg-muted text-foreground",
                    )}
                  >
                    {cert.type}
                  </span>
                  <p className="truncate text-sm font-semibold text-foreground">{cert.name}</p>
                  {hasUploadedFile && (
                    <Check
                      className="size-3.5 shrink-0 text-emerald-500"
                      aria-label="Sertifika dosyası mevcut"
                    />
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Globe className="size-3.5" /> {cert.region}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="size-3.5" /> {cert.fileName} · {cert.fileSize}
                  </span>
                </div>
                {hint.kind === "success" && hint.message && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="size-3.5" />
                    <span>{hint.message}</span>
                  </div>
                )}
                {hint.kind === "error" && hint.message && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3.5" />
                    <span>{hint.message}</span>
                  </div>
                )}
              </div>
              <Link
                href={effectiveHref(cert).href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handlePreviewClick(e, cert)}
                className={linkClassName}
                title={
                  effectiveHref(cert).originalOpen
                    ? "Sunucudaki sertifika dosyasını yeni sekmede aç"
                    : "Önizleme sayfasını yeni sekmede aç"
                }
              >
                <Download />
                <span className="ml-2">Önizle</span>
                <ExternalLink className="size-3 opacity-70" />
              </Link>
            </li>
          )
        })}
        {visible.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">
            No certificates for this filter.
          </li>
        )}
      </ul>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground/70 hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
