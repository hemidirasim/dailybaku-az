import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MenuForm from '@/components/admin/MenuForm';

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [menu, parentMenus, categories, pages] = await Promise.all([
    prisma.menu.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    }),
    prisma.menu.findMany({
      where: { id: { not: id } },
      include: {
        translations: true,
      },
    }),
    prisma.category.findMany({
      include: {
        translations: true,
      },
    }),
    prisma.page.findMany({
      include: {
        translations: true,
      },
    }),
  ]);

  if (!menu) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Menu Redaktəsi</h1>
      <MenuForm menu={menu} parentMenus={parentMenus} categories={categories} pages={pages} />
    </div>
  );
}
