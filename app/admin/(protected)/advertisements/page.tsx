import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import DeleteButton from '@/components/admin/DeleteButton';

export default async function AdvertisementsPage() {
  const advertisements = await prisma.advertisement.findMany({
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
        <h1 className="text-3xl font-bold">Reklamlar</h1>
        <Link href="/admin/advertisements/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Reklam
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tip</TableHead>
              <TableHead>Pozisiya</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Heç bir reklam yoxdur
                </TableCell>
              </TableRow>
            ) : (
              advertisements.map((ad: typeof advertisements[0]) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <Badge variant={ad.type === 'image' ? 'default' : 'secondary'}>
                      {ad.type === 'image' ? 'Şəkil' : 'HTML'}
                    </Badge>
                  </TableCell>
                  <TableCell>{ad.position}</TableCell>
                  <TableCell>{ad.order}</TableCell>
                  <TableCell>
                    <Badge variant={ad.isActive ? 'default' : 'outline'}>
                      {ad.isActive ? 'Aktiv' : 'Qeyri-aktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/advertisements/${ad.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteButton
                        id={ad.id}
                        endpoint={`/api/admin/advertisements/${ad.id}`}
                        redirectUrl="/admin/advertisements"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

