'use client';

import { Facebook, Twitter, Linkedin, Link as LinkIcon, Copy, Check, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title: string;
  url: string;
  locale?: string;
}

export default function ShareButtons({ title, url, locale = 'az' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = locale === 'az' 
    ? `${title} - Daily Baku`
    : `${title} - Daily Baku`;

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}`
    : url;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success(locale === 'az' ? 'Link kopyalandı' : 'Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(locale === 'az' ? 'Link kopyalanmadı' : 'Failed to copy link');
    }
  };

  const handlePrint = () => {
    // Print CSS avtomatik olaraq yalnız article elementi göstərəcək
    window.print();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap no-print">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        {locale === 'az' ? 'Paylaş:' : 'Share:'}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="gap-2"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="gap-2"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="gap-2"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">{locale === 'az' ? 'Kopyalandı' : 'Copied'}</span>
          </>
        ) : (
          <>
            <LinkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{locale === 'az' ? 'Link' : 'Link'}</span>
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">{locale === 'az' ? 'Çap et' : 'Print'}</span>
      </Button>
    </div>
  );
}
