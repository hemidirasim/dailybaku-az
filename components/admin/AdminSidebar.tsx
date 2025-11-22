'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  Menu as MenuIcon, 
  Image as ImageIcon,
  LogOut,
  Settings,
  Tag,
  Home,
  Megaphone,
  Users,
  File,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string; // Permission key required for this menu item
}

const menuItems: MenuItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { href: '/admin/articles', label: 'Xəbərlər', icon: FileText, permission: 'articles.view' },
  { href: '/admin/categories', label: 'Bölmələr', icon: Folder, permission: 'categories.view' },
  { href: '/admin/tags', label: 'Taglar', icon: Tag, permission: 'tags.view' },
  { href: '/admin/menus', label: 'Menular', icon: MenuIcon, permission: 'menus.view' },
  { href: '/admin/pages', label: 'Statik Səhifələr', icon: File, permission: 'pages.view' },
  { href: '/admin/advertisements', label: 'Reklamlar', icon: Megaphone, permission: 'advertisements.view' },
  { href: '/admin/users', label: 'İstifadəçilər', icon: Users, permission: 'users.view' },
  { href: '/admin/roles', label: 'Rollar', icon: Shield, permission: 'roles.view' },
  { href: '/admin/media', label: 'Media', icon: ImageIcon, permission: 'media.view' },
  { href: '/admin/settings', label: 'Parametrlər', icon: Settings, permission: 'settings.view' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission, loading } = usePermissions();

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) => {
    // If no permission required, show it
    if (!item.permission) return true;
    
    // If loading, don't show yet
    if (loading) return false;
    
    // Check if user has permission
    return hasPermission(item.permission);
  });

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="block">
          <h1 className="text-xl font-bold hover:text-gray-300 transition-colors">Daily Baku</h1>
        </Link>
        <p className="text-sm text-gray-400 mb-3">Admin Panel</p>
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          <Home className="h-3 w-3" />
          <span>Sayta keç</span>
        </a>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Çıxış
        </Button>
      </div>
    </div>
  );
}
