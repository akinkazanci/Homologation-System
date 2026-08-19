"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Building2, ExternalLink, Files } from "lucide-react"
import { Button } from "@/components/ui/button"
import daiichiHero from "@/app/assets/daiichi png.jpg"
import { companyCertificateLogos } from "@/lib/constants"
import { useCertificates } from "@/lib/contexts/CertificatesContext"
import type { CompanyCertificate } from "@/lib/types"

function openCompanyDocument(cert: CompanyCertificate): boolean {
  // Prefer server-hosted URL if available
  if (cert.storedFileUrl) {
    try {
      window.open(cert.storedFileUrl, "_blank", "noopener,noreferrer")
      return true
    } catch {
      // fall through to base64/blob fallback
    }
  }

  if (!cert.fileData) return false
  const mimeType = cert.mimeType ?? "application/octet-stream"

  try {
    // Try to open using a Blob object URL which is more reliable than data: URLs for large files
    const binary = atob(cert.fileData)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const w = window.open(url, "_blank", "noopener,noreferrer")
    // Revoke after a short delay to allow the new window to load the blob
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    return Boolean(w)
  } catch (err) {
    // Last resort fallback to data URL
    try {
      const dataUrl = `data:${mimeType};base64,${cert.fileData}`
      window.open(dataUrl, "_blank", "noopener,noreferrer")
      return true
    } catch (e) {
      return false
    }
  }
}

export function CompanyCertificates() {
  const { companyCertificates } = useCertificates()
  const [selectedId, setSelectedId] = useState(companyCertificates[0]?.id ?? "")

  const selected = useMemo(
    () => companyCertificates.find((cert) => cert.id === selectedId) ?? companyCertificates[0] ?? null,
    [companyCertificates, selectedId],
  )

  function handleLogoClick(cert: CompanyCertificate) {
    setSelectedId(cert.id)
    openCompanyDocument(cert)
  }

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <Image
          src={daiichiHero}
          alt="Daiichi corporate background"
          priority
          sizes="100vw"
          className="h-56 w-full object-cover sm:h-64 md:h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Company Certificates</p>
            <h1 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Corporate certifications in a clean, focused company view.
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm text-white/80 sm:text-base">
              Browse company-level certifications and review each standard from a single responsive page built to stay
              aligned with the portal&apos;s existing design language.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {companyCertificates.map((cert) => {
              const logo = companyCertificateLogos[cert.id as keyof typeof companyCertificateLogos]
              const active = cert.id === selected?.id
              return (
                <article
                  key={cert.id}
                  className={`rounded-2xl border bg-card p-4 shadow-sm transition-all ${
                    active ? "border-primary/40 ring-2 ring-primary/10" : "border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleLogoClick(cert)}
                    className="group w-full rounded-2xl border border-border bg-muted/30 p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/30"
                    aria-label={`${cert.standard} logosunu aç`}
                  >
                    <div className="relative flex min-h-44 items-center justify-center">
                      <Image
                        src={logo}
                        alt={cert.logoAlt}
                        placeholder="blur"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="h-auto max-h-40 w-auto max-w-full object-contain"
                      />
                    </div>
                  </button>

                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                        {cert.standard}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {cert.issuer}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">{cert.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{cert.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        Company level
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5 xl:sticky xl:top-24">
            {selected && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Selected</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{selected.standard}</h2>
                <p className="mt-1 text-sm font-medium text-primary">{selected.issuer}</p>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{selected.description}</p>

                <div className="mt-5 flex flex-col gap-2">
                  {selected.storedFileUrl ? (
                    <Link
                      href={selected.storedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-background border border-border hover:bg-muted"
                      title="Sunucudaki sertifika dosyasını yeni sekmede aç"
                    >
                      <ExternalLink />
                      Belgeyi aç
                    </Link>
                  ) : selected.fileData ? (
                    <Button onClick={() => handleLogoClick(selected)}>
                      <ExternalLink />
                      Belgeyi aç
                    </Button>
                  ) : null}
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Files />
                    Products alanına dön
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
