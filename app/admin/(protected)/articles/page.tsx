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
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import PermissionGate from '@/components/admin/PermissionGate';

const DeleteButton = dynamic(() => import('@/components/admin/DeleteButton'), {
  ssr: false,
});

export default async function ArticlesPage() {
  return (
    <ProtectedRoute permission="articles.view">
      <ArticlesContent />
    </ProtectedRoute>
  );
}

async function ArticlesContent() {
  const articles = await prisma.article.findMany({
    where: {
      deletedAt: null,
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
        <PermissionGate permission="articles.create" showWhileLoading={true}>
          <Link href="/admin/articles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Xəbər
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlıq</TableHead>
              <TableHead>Bölmə</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tarix</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => {
              const translation = article.translations[0];
              const categoryTranslation = article.category?.translations[0];
              
              return (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    {translation?.title || 'Başlıqsız'}
                  </TableCell>
                  <TableCell>
                    {categoryTranslation?.name || article.category?.slug || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status === 'published' ? 'Dərc olunub' : 'Qaralama'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('az-AZ')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PermissionGate permission="articles.edit" showWhileLoading={true}>
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Redaktə
                          </Button>
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission="articles.delete" showWhileLoading={true}>
                        <DeleteButton
                          itemId={article.id}
                          itemName={translation?.title || 'Xəbər'}
                          apiPath={`/api/admin/articles/${article.id}`}
                          redirectUrl="/admin/articles"
                        />
                      </PermissionGate>
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
