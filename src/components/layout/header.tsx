'use client';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { CircleUser } from 'lucide-react';

const getTitleForPath = (path: string): string => {
  if (path.startsWith('/orders/new')) return 'Create Order';
  if (path.startsWith('/reports')) return 'Reports';
  if (path.startsWith('/products')) return 'Products';
  if (path.startsWith('/customers')) return 'Customers';
  if (path.startsWith('/dashboard')) return 'Dashboard';
  return 'Dashboard';
};


export default function AppHeader() {
  const pathname = usePathname();
  const title = getTitleForPath(pathname);
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {isMobile && <SidebarTrigger />}
      <div className='flex-1'>
        <h1 className="font-headline text-2xl font-semibold">{title}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
