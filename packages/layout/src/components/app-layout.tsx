import { Outlet } from "react-router-dom";
import { DualSidebar } from "./dual-sidebar";
import { Header } from "./header";
import { Breadcrumbs } from "./breadcrumbs";

export function AppLayout({ brand }: { brand: string }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Full-width navbar on top */}
      <Header brand={brand} />
      {/* Sidebar sits under the navbar, beside the content */}
      <div className="flex flex-1 overflow-hidden">
        <DualSidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="border-b border-slate-200 bg-white px-6 py-3">
            <Breadcrumbs />
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
