import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { ChefHat } from 'lucide-react';
import SidebarNav from './sidebar-nav';

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2" data-testid="sidebar-header-content">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="size-5" />
          </div>
          <span className='font-headline text-lg font-semibold'>RentSmart</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarNav />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here */}
      </SidebarFooter>
    </Sidebar>
  );
}
