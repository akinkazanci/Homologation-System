"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  Download,
  FileText,
  Globe,
  Loader2,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Printer,
  X,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCertificates } from "@/lib/certificates-store"
import { downloadCertificate, getDownloadErrorMessage } from "@/lib/download"
import type { Certificate, Product } from "@/lib/types"
import { familyLabels } from "@/lib/data"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateTr(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

type ViewStatusKind = "loading" | "notFound" | "ready"

interface ViewStatusLoading {
  kind: "loading"
}
interface ViewStatusNotFound {
  kind: "notFound"
}
interface ViewStatusReady {
  kind: "ready"
  product: Product
  cert: Certificate
}

type ViewStatus = ViewStatusLoading | ViewStatusNotFound | ViewStatusReady

function base64ToDataUrl(base64: string, mimeType: string): string {
  const mime = mimeType || "application/octet-stream"
  return `data:${mime};base64,${base64}`
}

export default function CertificatePreviewPage() {
  const params = useParams<{ code: string; certId: string }>()
  const router = useRouter()
  const { products } = useCertificates()

  const [downloading, setDownloading] = useState(false)
  const [downloadMsg, setDownloadMsg] = useState<
    | { kind: "success" | "error"; text: string }
    | null
  >(null)
  const [zoom, setZoom] = useState(100)
  const [rotate, setRotate] = useState(0)
  const [panning, setPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [fullscreen, setFullscreen] = useState(false)
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const viewerRef = useRef<HTMLDivElement | null>(null)

  const productCode = decodeURIComponent(params.code)
  const certId = decodeURIComponent(params.certId)

  const status: ViewStatus = useMemo(() => {
    const product = products.find((p) => p.code === productCode)
    if (!product) return { kind: "notFound" }
    const cert = product.certificates.find((c) => c.id === certId)
    if (!cert) return { kind: "notFound" }
    return { kind: "ready", product, cert }
  }, [products, productCode, certId])

  useEffect(() => {
    setZoom(100)
    setRotate(0)
    setPanOffset({ x: 0, y: 0 })
    setDownloadMsg(null)
    if (status.kind === "ready") {
      const { product, cert } = status
      document.title = `${cert.name} · ${product.code} — Certificate Preview`
    } else {
      document.title = "Belge Bulunamadı · Sertifika Önizleme"
    }
  }, [certId, productCode, status])

  async function handleDownload() {
    if (status.kind !== "ready") return
    setDownloading(true)
    setDownloadMsg(null)
    const result = await downloadCertificate(status.product, status.cert)
    if (result.ok) {
      setDownloadMsg({
        kind: "success",
        text: result.usedFallback
          ? "Demo belge indirildi."
          : result.message || "Belge indirildi.",
      })
    } else {
      setDownloadMsg({
        kind: "error",
        text: result.error ? getDownloadErrorMessage(result.error) : "İndirme başarısız.",
      })
    }
    setDownloading(false)
    setTimeout(() => setDownloadMsg(null), 6000)
  }

  function handleWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = -e.deltaY * 0.1
    setZoom((z) => Math.min(400, Math.max(25, z + delta)))
  }

  function handleMouseDown(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) return
    setPanning(true)
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: panOffset.x,
      oy: panOffset.y,
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!panning || !panStart.current) return
    setPanOffset({
      x: panStart.current.ox + (e.clientX - panStart.current.x),
      y: panStart.current.oy + (e.clientY - panStart.current.y),
    })
  }

  function handleMouseUp() {
    setPanning(false)
    panStart.current = null
  }

  function resetView() {
    setZoom(100)
    setRotate(0)
    setPanOffset({ x: 0, y: 0 })
  }

  if (status.kind === "notFound") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Ürünler sayfasına dön
          </Link>
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Belge Bulunamadı
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              İstediğiniz sertifika ya da ürün kaydı bulunamadı. URL'nin doğru olduğundan
              emin olun veya ana sayfaya dönerek listeden seçin.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <ArrowLeft /> Ana Sayfa
              </Link>
              <Button onClick={() => router.back()}>
                <ChevronLeft /> Geri Dön
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { product, cert } = status as Extract<typeof status, { kind: "ready" }>
  const hasStoredUrl = Boolean(cert.storedFileUrl)
  const hasFileData = Boolean(cert.fileData)
  const hasRealFile = hasStoredUrl || hasFileData

  const isPdf = (cert.mimeType || "").toLowerCase().includes("pdf") || cert.fileName.toLowerCase().endsWith(".pdf")
  const isImage =
    (cert.mimeType || "").toLowerCase().startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(cert.fileName)

  const dataUrl = hasFileData ? base64ToDataUrl(cert.fileData!, cert.mimeType || "application/octet-stream") : null

  const isDocx = /\.(docx?)$/i.test(cert.fileName) && !isPdf && !isImage
  const isUnsupported = hasFileData && !isPdf && !isImage

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className={`flex flex-col ${fullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
        {/* Top bar */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              title="Ürünler sayfasına dön"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Ürünlere Dön</span>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                  {familyLabels[product.family] ?? product.family}
                </span>
                <span className="text-sm font-semibold text-foreground">{product.code}</span>
                <span className="text-xs text-muted-foreground">/ {cert.type}</span>
              </div>
              <h1 className="truncate text-[15px] font-semibold text-foreground sm:text-base">
                {cert.name}
              </h1>
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                hasRealFile
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}
            >
              <FileText className="size-3.5" />
              {hasRealFile
                ? isPdf
                  ? "PDF (Orijinal)"
                  : isImage
                    ? "Resim (Orijinal)"
                    : isDocx
                      ? "Word (Orijinal)"
                      : "Dosya (Orijinal)"
                : "Demo"}
            </span>
            </div>
            <Button
              onClick={() => setFullscreen((f) => !f)}
              variant="outline"
              size="icon"
              title={fullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            >
              <Maximize2 className="size-4" />
            </Button>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              size="sm"
              className="shrink-0 font-semibold"
            >
              <Download className={downloading ? "animate-pulse" : ""} />
              {downloading ? "İndiriliyor..." : "İndir"}
            </Button>
          </div>
          {downloadMsg && (
            <div
              className={`mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 lg:px-8 ${
                fullscreen ? "" : ""
              }`}
            >
              <div
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium ${
                  downloadMsg.kind === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-destructive/30 bg-destructive/5 text-destructive"
                }`}
              >
                {downloadMsg.text}
              </div>
            </div>
          )}
        </header>

        {/* Info strip */}
        <section className="border-b border-border bg-card/50">
          <div className="mx-auto grid w-full max-w-7xl gap-x-6 gap-y-2 px-4 py-3 text-[13px] sm:grid-cols-3 sm:px-6 lg:px-8">
            <InfoRow icon={<Globe className="size-3.5" />} label="Bölge" value={cert.region} />
            <InfoRow
              icon={<Calendar className="size-3.5" />}
              label="Son Geçerlilik"
              value={`${formatDate(cert.expiryDate)} · ${formatDateTr(cert.expiryDate)}`}
            />
            <InfoRow
              icon={<FileText className="size-3.5" />}
              label="Dosya"
              value={`${cert.fileName}${cert.fileSize && cert.fileSize !== "—" ? ` · ${cert.fileSize}` : ""}`}
            />
            {cert.uploadedAt && (
              <InfoRow
                icon={<Loader2 className="size-3.5" />}
                label="Yükleme"
                value={new Date(cert.uploadedAt).toLocaleString("tr-TR")}
                className="sm:col-span-3"
              />
            )}
          </div>
        </section>

        {/* Viewer controls */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex items-center overflow-hidden rounded-lg border border-border bg-card">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(25, z - 10))}
                className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Uzaklaştır"
                title="Uzaklaştır"
              >
                <ZoomOut className="size-4" />
              </button>
              <div className="flex min-w-[52px] items-center justify-center border-x border-border px-2 text-xs font-semibold tabular-nums text-foreground">
                {zoom}%
              </div>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(400, z + 10))}
                className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Yakınlaştır"
                title="Yakınlaştır"
              >
                <ZoomIn className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRotate((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              title="90° döndür"
            >
              <RotateCcw className="size-4" /> Döndür
            </button>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              title="Görünümü sıfırla"
            >
              <X className="size-4" /> Sıfırla
            </button>
            {((hasStoredUrl && (isPdf || isImage)) || (hasFileData && (isPdf || isImage) && dataUrl)) ? (
                <a
                  href={hasStoredUrl ? cert.storedFileUrl! : dataUrl!}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  title="Tarayıcının yerleşik görüntüleyicisinde aç (orijinal dosya)"
                >
                  <Maximize2 className="size-4" />
                  Yerleşik Görüntüleyici
                </a>
            ) : null}
            {hasFileData && !isUnsupported && (
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                title="Yazdır"
              >
                <Printer className="size-4" /> Yazdır
              </button>
            )}
          </div>
        </section>

        {/* Viewer area */}
        <div
          className={`flex-1 ${fullscreen ? "h-[calc(100vh-0px)]" : "min-h-[60vh]"} bg-muted/30`}
        >
          <div className="mx-auto h-full w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div
              ref={viewerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative mx-auto flex h-full min-h-[60vh] select-none items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-sm ${
                panning ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {/* Content transform wrapper */}
              <div
                className="absolute inset-0 flex items-center justify-center p-6 transition-transform"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) rotate(${rotate}deg) scale(${zoom / 100})`,
                  transformOrigin: "center center",
                }}
              >
                {/* Case 1a: Stored PDF on disk — always prefer server URL */}
                {hasStoredUrl && isPdf && (
                  <iframe
                    key={cert.id + "-pdf-url"}
                    src={cert.storedFileUrl!}
                    title={cert.name}
                    className="h-[78vh] w-[min(100%,960px)] rounded-lg bg-white shadow-md ring-1 ring-border"
                  />
                )}

                {/* Case 1b: Fallback PDF (client base64) */}
                {!hasStoredUrl && hasFileData && isPdf && dataUrl && (
                  <iframe
                    key={cert.id + "-pdf-b64"}
                    src={dataUrl}
                    title={cert.name}
                    className="h-[75vh] w-[min(100%,900px)] rounded-lg bg-white shadow-md ring-1 ring-border"
                  />
                )}

                {/* Case 2a: Stored image on disk */}
                {hasStoredUrl && isImage && (
                  <img
                    key={cert.id + "-img-url"}
                    src={cert.storedFileUrl!}
                    alt={cert.name}
                    draggable={false}
                    className="max-h-[88vh] max-w-full rounded-lg bg-white object-contain shadow-md ring-1 ring-border"
                  />
                )}

                {/* Case 2b: Fallback image (client base64) */}
                {!hasStoredUrl && hasFileData && isImage && dataUrl && (
                  <img
                    key={cert.id + "-img-b64"}
                    src={dataUrl}
                    alt={cert.name}
                    draggable={false}
                    className="max-h-[85vh] max-w-full rounded-lg bg-white object-contain shadow-md ring-1 ring-border"
                  />
                )}

                {/* Case 3: Real file uploaded but unsupported browser preview (docx etc.) */}
                {hasRealFile && isUnsupported && (
                  <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                      <FileText className="size-7" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">
                      Bu dosya tarayıcıda önizlenemez
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <strong>{cert.fileName}</strong> kaydedilmiş ancak tarayıcı içi önizleme desteklenmiyor.
                      Aşağıdan orijinal belgeyi indirebilirsiniz.
                    </p>
                    <div className="mt-6 flex justify-center gap-2">
                      {hasStoredUrl ? (
                        <Link href={cert.storedFileUrl!} className={buttonVariants()}>Sunucudan İndir</Link>
                      ) : null}
                      <Button onClick={handleDownload} disabled={downloading}>
                        <Download className={downloading ? "animate-pulse" : ""} />
                        {downloading ? "İndiriliyor..." : "Belgeyi İndir"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Case 4: No original uploaded at all — show demo PDF preview with clear banner */}
                {!hasRealFile && (
                  <div className="w-full max-w-3xl">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        <span>
                          Bu sertifika için orijinal belge henüz yüklenmemiş. Aşağıda{" "}
                          <strong className="text-foreground">sadece demo bir önizleme</strong>{" "}
                          gösterilmektedir.
                        </span>
                      </div>
                      <Link href="/admin" className="text-[11px] font-semibold text-primary hover:underline">
                        Admin: Orijinali yükle →
                      </Link>
                    </div>
                    <DemoPdfPreview product={product} cert={cert} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
      <span className="text-muted-foreground/70">{icon}</span>
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}:
      </span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  )
}

function DemoPdfPreview({ product, cert }: { product: Product; cert: Certificate }) {
  return (
    <div className="mx-auto aspect-[595/842] w-full max-w-[595px] overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-border">
      <div className="flex h-full flex-col px-12 py-10 text-slate-900">
        <div className="mb-6 h-0.5 w-16 bg-primary" />
        <h3 className="text-2xl font-bold tracking-tight">HOMOLOGATION CERTIFICATE</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
          Daiichi Infotainment Systems · Document Preview
        </p>
        <div className="mt-8 space-y-3 text-[13px] leading-relaxed">
          <InfoLine label="Certificate" value={cert.name} />
          <InfoLine label="Certificate Type" value={cert.type} />
          <InfoLine label="Product" value={product.code} />
          <InfoLine label="Product Family" value={familyLabels[product.family] ?? product.family} />
          <InfoLine label="Description" value={product.description} />
          <InfoLine label="Region" value={cert.region} />
          <InfoLine label="Issue Date" value={formatDate(cert.issueDate)} />
          <InfoLine label="Valid Until" value={`${formatDate(cert.expiryDate)} (${formatDateTr(cert.expiryDate)})`} />
        </div>
        <div className="mt-auto">
          <div className="h-0.5 w-full bg-slate-200" />
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            Bu belge sadece önizleme amaçlı demo bir çıktıdır. Resmi sertifika metni için
            yönetici panelinden gerçek belgeyi yükleyin.
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-slate-100 pb-2">
      <div className="w-32 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="min-w-0 flex-1 break-words font-medium text-slate-900">{value}</div>
    </div>
  )
}
