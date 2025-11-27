'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  useEffect(() => {
    console.log('ImageModal mounted, isOpen:', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // ESC düyməsi ilə bağla
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    console.log('ImageModal not rendering, isOpen is false');
    return null;
  }

  console.log('ImageModal rendering with imageUrl:', imageUrl);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image modal"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
        aria-label="Close"
      >
        <X className="h-8 w-8" />
      </button>
      <div
        className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center p-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
              style={{ maxWidth: '100%', maxHeight: '90vh' }}
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', imageUrl);
              }}
            />
          ) : (
            <div className="text-white">Loading image...</div>
          )}
        </div>
      </div>
    </div>
  );
}

