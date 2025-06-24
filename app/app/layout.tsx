import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-hidden">
            <div className="container mx-auto p-6 space-y-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
