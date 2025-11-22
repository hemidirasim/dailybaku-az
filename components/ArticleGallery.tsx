'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface ArticleGalleryProps {
  images: Array<{
    id: string;
    url: string;
    alt?: string | null;
    caption?: string | null;
    isPrimary?: boolean;
  }>;
  title: string;
}

export default function ArticleGallery({ images, title }: ArticleGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Primary image is already shown in article, so filter it out
  // If first image is primary, show all others; otherwise show all
  const primaryImage = images.find(img => img.isPrimary);
  const galleryImages = primaryImage 
    ? images.filter(img => !img.isPrimary || img.id !== primaryImage.id)
    : images.slice(1); // If no primary, show all except first

  // If no gallery images, don't show gallery
  if (galleryImages.length === 0) {
    return null;
  }

  const openSlider = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeSlider = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'unset';
  };

  const [sliderEmblaRef, sliderEmblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: selectedImageIndex || 0,
  });

  // Update slider when selected image changes
  useEffect(() => {
    if (selectedImageIndex !== null && sliderEmblaApi) {
      sliderEmblaApi.scrollTo(selectedImageIndex);
    }
  }, [selectedImageIndex, sliderEmblaApi]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSlider();
      } else if (e.key === 'ArrowLeft') {
        sliderEmblaApi?.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        sliderEmblaApi?.scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, sliderEmblaApi]);

  return (
    <>
      {/* Thumbnail Gallery - Shown after content */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Şəkil Qalereyası</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openSlider(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                  Böyüt
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen Slider Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeSlider}
        >
          <button
            onClick={closeSlider}
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Bağla"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="w-full h-full flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-6xl relative" ref={sliderEmblaRef}>
              <div className="flex">
                {galleryImages.map((image, index) => (
                  <div key={image.id} className="flex-[0_0_100%] min-w-0 relative">
                    <div className="relative aspect-video w-full max-h-[90vh]">
                      <Image
                        src={image.url}
                        alt={image.alt || title}
                        fill
                        className="object-contain"
                        priority={index === selectedImageIndex}
                      />
                    </div>
                    {image.caption && (
                      <div className="mt-4 text-center text-white">
                        <p className="text-sm md:text-base">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sliderEmblaApi?.scrollPrev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                    aria-label="Əvvəlki"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sliderEmblaApi?.scrollNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                    aria-label="Növbəti"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              {(sliderEmblaApi?.selectedScrollSnap() ?? selectedImageIndex) + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
