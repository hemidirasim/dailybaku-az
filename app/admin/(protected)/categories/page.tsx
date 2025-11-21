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

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Bölmələr</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Bölmə
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad (AZ)</TableHead>
              <TableHead>Ad (EN)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category: typeof categories[0]) => {
              const azTranslation = category.translations.find((t: { locale: string }) => t.locale === 'az');
              const enTranslation = category.translations.find((t: { locale: string }) => t.locale === 'en');

              return (
                <TableRow key={category.id}>
                  <TableCell>{azTranslation?.name || '-'}</TableCell>
                  <TableCell>{enTranslation?.name || '-'}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Aktiv' : 'Deaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>{category.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={`/admin/categories/${category.id}/delete`} method="POST">
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

