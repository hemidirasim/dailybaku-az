import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';
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
import { notFound } from 'next/navigation';

const DeleteButton = dynamic(() => import('@/components/admin/DeleteButton'), {
  ssr: false,
});

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    const { locale } = await params;

    // Yalnız 'az' və 'en' dəstəklənir
    if (locale !== 'az' && locale !== 'en') {
      notFound();
    }

    return (
      <ProtectedRoute permission="articles.view">
        <ArticlesContent locale={locale as 'az' | 'en'} />
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('ArticlesPage error:', error);
    notFound();
  }
}

async function ArticlesContent({ locale }: { locale: 'az' | 'en' }) {
  const allArticles = await prisma.article.findMany({
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

  // Yalnız seçilmiş dilin title-i olan xəbərlər
  const articles = allArticles.filter((article) => {
    const translation = article.translations.find((t) => t.locale === locale);
    return translation && translation.title && translation.title.trim() !== '';
  });

  const localeNames = {
    az: 'Azərbaycan',
    en: 'English',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Xəbərlər</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/articles/az"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                locale === 'az'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Azərbaycan ({allArticles.filter((a) => {
                const t = a.translations.find((tr) => tr.locale === 'az');
                return t && t.title && t.title.trim() !== '';
              }).length})
            </Link>
            <Link
              href="/admin/articles/en"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                locale === 'en'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English ({allArticles.filter((a) => {
                const t = a.translations.find((tr) => tr.locale === 'en');
                return t && t.title && t.title.trim() !== '';
              }).length})
            </Link>
          </div>
        </div>
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
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {locale === 'az' ? 'Azərbaycan dilində xəbər yoxdur' : 'No English articles'}
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => {
                const translation = article.translations.find((t) => t.locale === locale);
                const categoryTranslation = article.category?.translations.find((t) => t.locale === locale);
                
                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {translation?.title || '-'}
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
                          <Link href={`/admin/articles/edit/${article.id}`}>
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
                            redirectUrl={`/admin/articles/${locale}`}
                          />
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

