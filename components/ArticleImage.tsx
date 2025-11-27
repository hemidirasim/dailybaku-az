'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageModal from './ImageModal';

interface ArticleImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

export default function ArticleImageClient({ imageUrl, alt, className = '' }: ArticleImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Image clicked, opening modal');
    setIsModalOpen(true);
  };

  const handleClose = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={`relative w-full h-[250px] md:h-[300px] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${className}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        aria-label="Click to zoom image"
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
      </div>
      {isModalOpen && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={handleClose}
          imageUrl={imageUrl}
          alt={alt}
        />
      )}
    </>
  );
}

