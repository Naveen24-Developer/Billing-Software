import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import AppHeader from '@/components/layout/header';
import { CustomerProvider } from '@/contexts/customer-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CustomerProvider>
  );
}
