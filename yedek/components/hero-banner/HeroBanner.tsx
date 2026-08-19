export function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src="/hero-network.png"
        alt=""
        aria-hidden="true"
        className="h-56 w-full object-cover sm:h-64 md:h-72"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Homologation Portal
          </p>
          <h1 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Daiichi Homologation Websites
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-sm text-white/80 sm:text-base">
            Select a product below to browse and download its homologation certificates
            by region and certification type.
          </p>
        </div>
      </div>
    </section>
  )
}
