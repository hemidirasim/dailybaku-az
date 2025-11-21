import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
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

const DeleteButton = dynamic(() => import('@/components/admin/DeleteButton'), {
  ssr: false,
});

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: {
      deletedAt: null, // Yalnız silinməmiş xəbərləri göstər
    },
    include: {
      translations: true,
      category: {
        include: {
          translations: true,
        },
      },
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Xəbərlər</h1>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Xəbər
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlıq (AZ)</TableHead>
              <TableHead>Başlıq (EN)</TableHead>
              <TableHead>Bölmə</TableHead>
              <TableHead>Şəkillər</TableHead>
              <TableHead>Baxış</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => {
              const azTranslation = article.translations.find((t) => t.locale === 'az');
              const enTranslation = article.translations.find((t) => t.locale === 'en');
              const categoryAz = article.category?.translations.find((t) => t.locale === 'az');

              return (
                <TableRow key={article.id}>
                  <TableCell className="max-w-xs truncate">
                    {azTranslation?.title || '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {enTranslation?.title || '-'}
                  </TableCell>
                  <TableCell>
                    {categoryAz?.name ? (
                      <Badge variant="outline">{categoryAz.name}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{article.images.length} şəkil</Badge>
                  </TableCell>
                  <TableCell>{article.views}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {article.featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                      {article.publishedAt ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/articles/${article.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteButton
                        id={article.id}
                        endpoint={`/api/admin/articles/${article.id}`}
                        redirectUrl="/admin/articles"
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

