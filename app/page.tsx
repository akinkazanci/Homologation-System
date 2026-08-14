import { HeroBanner } from "@/components/hero-banner"
import { HomologationBrowser } from "@/components/homologation-browser"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroBanner />
        <HomologationBrowser />
      </main>
      <SiteFooter />
    </div>
  )
}
