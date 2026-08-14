import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Image
          src="/daiichi-logo.png"
          alt="Daiichi Infotainment Systems"
          width={180}
          height={28}
          className="h-6 w-auto"
        />
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} Daiichi Infotainment Systems. Homologation &amp; certificate management portal.
          Demo data.
        </p>
      </div>
    </footer>
  )
}
