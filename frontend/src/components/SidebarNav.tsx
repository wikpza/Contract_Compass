
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ShoppingBasket,
  Briefcase,
  Settings,
  CreditCard,
  Ruler,
  Link2,
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  
  const menuItems = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      path: '/applicants', 
      name: 'Applicants', 
      icon: Users 
    },
    { 
      path: '/purchasers', 
      name: 'Purchasers', 
      icon: Users 
    },
    { 
      path: '/companies', 
      name: 'Companies', 
      icon: Building2 
    },
    { 
      path: '/products', 
      name: 'Products', 
      icon: ShoppingBasket 
    },
    { 
      path: '/units', 
      name: 'Units', 
      icon: Ruler 
    },
    { 
      path: '/projects', 
      name: 'Projects', 
      icon: Briefcase 
    },
    { 
      path: '/links', 
      name: 'Links', 
      icon: Link2 
    },
    { 
      path: '/currencies', 
      name: 'Currencies', 
      icon: CreditCard 
    }
  ];

  const isPathActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    // Close the mobile sidebar after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="max-h-screen">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-business-600" />
          <span className="text-lg font-bold text-business-800">Contract Compass</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild={!isMobile}
                    className={cn(
                      isPathActive(item.path) ? "bg-business-100 text-business-800" : "text-business-600 hover:bg-business-50"
                    )}
                    onClick={isMobile ? () => handleMenuItemClick(item.path) : undefined}
                  >
                    {isMobile ? (
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                    ) : (
                      <Link to={item.path} className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-business-500">v1.0.0</span>
          <Settings className="h-4 w-4 text-business-500" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default SidebarNav;
