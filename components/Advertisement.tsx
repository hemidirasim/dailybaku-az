'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AdvertisementProps {
  position: string;
  locale?: string;
  className?: string;
}

interface AdvertisementData {
  type: string;
  imageUrl: string | null;
  htmlCode: string | null;
  linkUrl: string | null;
}

export function Advertisement({ position, locale = 'az', className = '' }: AdvertisementProps) {
  const [advertisement, setAdvertisement] = useState<AdvertisementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdvertisement() {
      try {
        const response = await fetch(`/api/advertisements?position=${position}`);
        if (response.ok) {
          const data = await response.json();
          setAdvertisement(data);
        }
      } catch (error) {
        console.error('Error fetching advertisement:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdvertisement();
  }, [position]);

  if (loading || !advertisement) {
    return null;
  }

  if (advertisement.type === 'image' && advertisement.imageUrl) {
    const content = advertisement.linkUrl ? (
      <Link href={advertisement.linkUrl} target="_blank" rel="noopener noreferrer">
        <Image
          src={advertisement.imageUrl}
          alt="Advertisement"
          width={300}
          height={250}
          className="w-full h-auto object-contain"
        />
      </Link>
    ) : (
      <Image
        src={advertisement.imageUrl}
        alt="Advertisement"
        width={300}
        height={250}
        className="w-full h-auto object-contain"
      />
    );

    return (
      <div className={`my-4 flex justify-center ${className}`}>
        {content}
      </div>
    );
  }

  if (advertisement.type === 'html' && advertisement.htmlCode) {
    return (
      <div
        className={`my-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: advertisement.htmlCode }}
      />
    );
  }

  return null;
}

