'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ReplaceICharacter() {
  const pathname = usePathname();

  useEffect(() => {
    // Pathname-dən locale-i təyin et
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0] === 'en' ? 'en' : 'az';

    if (locale !== 'en') return;

    // İngilis dilində İ hərfini I ilə əvəz et
    const replaceICharacter = () => {
      // Bütün mətn elementlərini tap və İ hərfini I ilə əvəz et
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.includes('İ')) {
          textNodes.push(node as Text);
        }
      }

      textNodes.forEach((textNode) => {
        if (textNode.nodeValue) {
          textNode.nodeValue = textNode.nodeValue.replace(/İ/g, 'I');
        }
      });
    };

    // İlk yüklənmədə işlə
    replaceICharacter();

    // MutationObserver ilə dinamik məzmunu izlə
    const observer = new MutationObserver(() => {
      replaceICharacter();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

