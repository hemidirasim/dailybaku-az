'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'az';

  const translations = {
    az: {
      title: '404',
      heading: 'Səhifə tapılmadı',
      message: 'Axtardığınız səhifə mövcud deyil və ya silinib.',
      backHome: 'Ana səhifəyə qayıt',
      back: 'Geri qayıt',
    },
    en: {
      title: '404',
      heading: 'Page Not Found',
      message: 'The page you are looking for does not exist or has been removed.',
      backHome: 'Back to Home',
      back: 'Go Back',
    },
  };

  const t = translations[locale as 'az' | 'en'] || translations.az;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-600 mb-4">{t.title}</h1>
          <h2 className="text-4xl font-bold mb-4">{t.heading}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.message}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            {t.backHome}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
}

