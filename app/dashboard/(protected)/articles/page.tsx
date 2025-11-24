import { redirect } from 'next/navigation';

export default async function ArticlesPage() {
  // Default olaraq Azərbaycan dilinə yönləndir
  redirect('/dashboard/articles/az');
}
