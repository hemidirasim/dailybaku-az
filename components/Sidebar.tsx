import { Article } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface SidebarProps {
  recentArticles: Article[];
}

export default function Sidebar({ recentArticles }: SidebarProps) {
  return (
    <aside className="space-y-8">
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">Module</span>
          <span className="text-gray-600">ENAMBELAS</span>
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Type your intro for this area. You can insert HTML tag, embedd video
          or GMap.
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Recent Articles</h3>
        <ul className="space-y-4">
          {recentArticles.map((article) => (
            <li key={article.id} className="flex items-start gap-2">
              <span className="text-red-600 text-lg mt-1">•</span>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(article.published_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}{' '}
                  -{' '}
                  {new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <Link
                  href={`/article/${article.slug}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {article.title}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}