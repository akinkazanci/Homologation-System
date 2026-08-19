"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Products", href: "/" },
  { label: "Company", href: "/company" },
  { label: "Admin", href: "/admin" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-primary/95 backdrop-blur-sm">
      <div className="flex h-16 w-full items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Daiichi Infotainment Systems home">
          <Image
            src="/daiichi-logo.png"
            alt="Daiichi Infotainment Systems"
            width={200}
            height={32}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${
                pathname === item.href
                  ? "bg-white text-primary"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
