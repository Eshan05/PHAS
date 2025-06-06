import { Footer7 } from "@/components/footer";
import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import type { Metadata, Viewport } from "next";
import { ModeToggle } from "@/components/mode-toggle";
import { GradientTop } from "@/components/gradientTop";

const metadata: Metadata = {
  title: "CareSphere | Symptom Search",
  description: "Input your symptoms and get instant medical advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="overflow-x-hidden">
      <AppSidebar />
      <SidebarInset className="max-w-full group-has[[data-collapsible=icon]]/sidebar-wrapper:w-10 ">
        <section className="transition-[margin] ease-linear">
          <header className="flex bg-zinc-50 dark:bg-[#09090b] h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 group-has-[[data-collapsible=icon]]/sidebar-wrapper:ml-0 md:ml-[13.5rem] group-has-[[data-collapsible=icon]]/sidebar-wrapper:w-full">
            <div className="flex items-center gap-2 px-4 justify-between w-full">
              <aside className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <h1 className="text-lg font-semibold leading-none tracking-tight">
                  CareSphere
                </h1>
              </aside>
              <aside>
                <ModeToggle />
              </aside>
            </div>
          </header>
          <main className="relative group-has-[[data-collapsible=icon]]/sidebar-wrapper:ml-0 md:ml-[13.75rem] ml-0">
            {children}
            <footer className="w-full mx-auto relative">
              <Footer7 />
            </footer>
          </main>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
