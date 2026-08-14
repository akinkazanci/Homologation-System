import { AdminDashboard } from "@/components/admin-dashboard"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "Admin — Daiichi Infotainment Systems",
}

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <SiteFooter />
    </div>
  )
}
