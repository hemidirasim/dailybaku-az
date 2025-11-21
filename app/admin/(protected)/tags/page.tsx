import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
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
        <h1 className="text-3xl font-bold">Taglar</h1>
        <Link href="/admin/tags/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Tag
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slug</TableHead>
              <TableHead>Ad (AZ)</TableHead>
              <TableHead>Ad (EN)</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Heç bir tag yoxdur
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag: typeof tags[0]) => {
                const azName = tag.translations.find((t: { locale: string }) => t.locale === 'az')?.name;
                const enName = tag.translations.find((t: { locale: string }) => t.locale === 'en')?.name;
                return (
                  <TableRow key={tag.id}>
                    <TableCell className="font-mono text-sm">{tag.slug}</TableCell>
                    <TableCell>{azName || '-'}</TableCell>
                    <TableCell>{enName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/tags/${tag.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={`/admin/tags/${tag.id}/delete`} method="POST">
                          <Button variant="destructive" size="sm" type="submit">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
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

