import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder, Menu, Eye } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const [articlesCount, categoriesCount, menusCount, totalViews] = await Promise.all([
    prisma.article.count(),
    prisma.category.count(),
    prisma.menu.count(),
    prisma.article.aggregate({
      _sum: {
        views: true,
      },
    }),
  ]);

  const stats = [
    {
      title: 'Xəbərlər',
      value: articlesCount,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Kateqoriyalar',
      value: categoriesCount,
      icon: Folder,
      color: 'text-green-600',
    },
    {
      title: 'Menular',
      value: menusCount,
      icon: Menu,
      color: 'text-purple-600',
    },
    {
      title: 'Ümumi Baxış',
      value: totalViews._sum.views || 0,
      icon: Eye,
      color: 'text-orange-600',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

