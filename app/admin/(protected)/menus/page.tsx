import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function MenusPage() {
  const menus = await prisma.menu.findMany({
    include: {
      translations: true,
      parent: {
        include: {
          translations: true,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Menular</h1>
        <Link href="/admin/menus/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Menu
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlıq (AZ)</TableHead>
              <TableHead>Başlıq (EN)</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Ana Menu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Header</TableHead>
              <TableHead>Footer</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.map((menu) => {
              const azTranslation = menu.translations.find((t) => t.locale === 'az');
              const enTranslation = menu.translations.find((t) => t.locale === 'en');
              const parentAz = menu.parent?.translations.find((t) => t.locale === 'az');

              return (
                <TableRow key={menu.id}>
                  <TableCell>{azTranslation?.title || '-'}</TableCell>
                  <TableCell>{enTranslation?.title || '-'}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {azTranslation?.url || '-'}
                    </code>
                  </TableCell>
                  <TableCell>{parentAz?.title || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                      {menu.isActive ? 'Aktiv' : 'Deaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={menu.showInHeader ? 'default' : 'secondary'}>
                      {menu.showInHeader ? 'Bəli' : 'Xeyr'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={menu.showInFooter ? 'default' : 'secondary'}>
                      {menu.showInFooter ? 'Bəli' : 'Xeyr'}
                    </Badge>
                  </TableCell>
                  <TableCell>{menu.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/menus/${menu.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={`/admin/menus/${menu.id}/delete`} method="POST">
                        <Button variant="destructive" size="sm" type="submit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

