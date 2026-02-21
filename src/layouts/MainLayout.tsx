import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function MainLayout() {
  const location = useLocation();
  const hideSidebarRoutes = ['/chat/', '/forward-message', '/report/', '/call/'];
  const shouldHideSidebar = hideSidebarRoutes.some(route => location.pathname.includes(route));

  if (shouldHideSidebar) {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <header className="sticky top-0 z-10 h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
