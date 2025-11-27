import { redirect } from 'next/navigation';

export default async function NewArticlePage() {
  // Default olaraq Azərbaycan dilinə yönləndir
  redirect('/dashboard/articles/az/new');
}
