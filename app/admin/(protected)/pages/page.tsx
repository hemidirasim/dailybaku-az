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
import dynamic from 'next/dynamic';

// Client komponentini dinamik olaraq import edin
const DeleteButton = dynamic(() => import('@/components/admin/DeleteButton'), { ssr: false });

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    include: {
      translations: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Statik Səhifələr</h1>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Səhifə
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlıq (AZ)</TableHead>
              <TableHead>Başlıq (EN)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page: typeof pages[0]) => {
              const azTranslation = page.translations.find((t: { locale: string }) => t.locale === 'az');
              const enTranslation = page.translations.find((t: { locale: string }) => t.locale === 'en');

              return (
                <TableRow key={page.id}>
                  <TableCell>{azTranslation?.title || '-'}</TableCell>
                  <TableCell>{enTranslation?.title || '-'}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {page.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.isActive ? 'default' : 'secondary'}>
                      {page.isActive ? 'Aktiv' : 'Deaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/pages/${page.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteButton
                        id={page.id}
                        endpoint={`/api/admin/pages/${page.id}`}
                        redirectUrl="/admin/pages"
                        title={azTranslation?.title}
                      />
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

