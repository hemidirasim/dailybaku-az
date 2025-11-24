import { prisma } from '@/lib/prisma';
import MenuForm from '@/components/admin/MenuForm';

export default async function NewMenuPage() {
  const [parentMenus, categories, pages] = await Promise.all([
    prisma.menu.findMany({
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni Menu</h1>
      <MenuForm parentMenus={parentMenus} categories={categories} pages={pages} />
    </div>
  );
}

