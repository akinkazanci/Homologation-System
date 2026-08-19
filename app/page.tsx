import { HeroBanner } from "@/components/hero-banner/HeroBanner"
import { ProductBrowser } from "@/components/product-browser/ProductBrowser"
import { SiteFooter } from "@/components/site-footer/SiteFooter"
import { SiteHeader } from "@/components/site-header/SiteHeader"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroBanner />
        <ProductBrowser />
      </main>
      <SiteFooter />
    </div>
  )
}
