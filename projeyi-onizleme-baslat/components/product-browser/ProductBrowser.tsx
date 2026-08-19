"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useCertificates } from "@/lib/contexts/CertificatesContext"
import { familyLabels, FAMILY_ORDER } from "@/lib/constants"
import type { ProductFamily } from "@/lib/types"
import { CertificatePanel } from "@/components/certificate-panel/CertificatePanel"

export function ProductBrowser() {
  const { products, families } = useCertificates()
  const [familyFilter, setFamilyFilter] = useState<ProductFamily | "all">("all")
  const [query, setQuery] = useState("")
  const [selectedCode, setSelectedCode] = useState<string | null>(products[0]?.code ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesFamily = familyFilter === "all" || p.family === familyFilter
      const matchesQuery = q === "" || p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      return matchesFamily && matchesQuery
    })
  }, [products, familyFilter, query])

  const selected = useMemo(
    () => products.find((p) => p.code === selectedCode) ?? null,
    [products, selectedCode],
  )

  return (
    <div id="products-browser" className="w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1">
          <FamilyTab active={familyFilter === "all"} onClick={() => setFamilyFilter("all")}>
            All products
          </FamilyTab>
          {FAMILY_ORDER.map((f) => (
            <FamilyTab key={f} active={familyFilter === f} onClick={() => setFamilyFilter(f)}>
              {familyLabels[f] ?? f}
            </FamilyTab>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product code…"
            aria-label="Search product code"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Pill grid */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Products ({filtered.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p) => {
              const active = p.code === selectedCode
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => setSelectedCode(p.code)}
                  aria-pressed={active}
                  className={`flex flex-col items-center justify-center rounded-full border-2 px-3 py-3 text-center transition-all ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-primary/50 bg-background text-foreground hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <span className="text-sm font-bold">{p.code}</span>
                  <span
                    className={`mt-0.5 text-[10px] font-medium ${
                      active ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {p.certificates.length} cert{p.certificates.length === 1 ? "" : "s"}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="col-span-full rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                No products match your search.
              </p>
            )}
          </div>
        </div>

        {/* Certificate panel */}
        <CertificatePanel product={selected} />
      </div>
    </div>
  )
}

function FamilyTab({
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
      className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:py-2 ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-foreground/70 hover:bg-muted/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
