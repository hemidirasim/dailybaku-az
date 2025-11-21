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
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Xəbərlər', icon: FileText },
  { href: '/admin/categories', label: 'Bölmələr', icon: Folder },
  { href: '/admin/tags', label: 'Taglar', icon: Tag },
  { href: '/admin/menus', label: 'Menular', icon: MenuIcon },
  { href: '/admin/pages', label: 'Statik Səhifələr', icon: File },
  { href: '/admin/advertisements', label: 'Reklamlar', icon: Megaphone },
  { href: '/admin/users', label: 'İstifadəçilər', icon: Users },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/settings', label: 'Parametrlər', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

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
        {menuItems.map((item) => {
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

