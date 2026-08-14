import { CompanyCertificates } from "@/components/company-certificates"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "Company — Daiichi Infotainment Systems",
}

export default function CompanyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <CompanyCertificates />
      </main>
      <SiteFooter />
    </div>
  )
}
