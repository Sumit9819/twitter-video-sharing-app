import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  twitterCard?: string;
  twitterPlayer?: string;
  twitterPlayerWidth?: string;
  twitterPlayerHeight?: string;
}

export function useMetaTags({
  title,
  description,
  image,
  url,
  twitterCard = 'summary_large_image',
  twitterPlayer,
  twitterPlayerWidth,
  twitterPlayerHeight,
}: MetaTagsProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to set meta tag
    const setMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) ||
                 document.querySelector(`meta[name="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          meta.setAttribute(property.startsWith('og:') ? 'property' : 'name', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Set meta tags
    if (title) {
      setMetaTag('og:title', title);
      setMetaTag('twitter:title', title);
    }

    if (description) {
      setMetaTag('description', description);
      setMetaTag('og:description', description);
      setMetaTag('twitter:description', description);
    }

    if (image) {
      setMetaTag('og:image', image);
      setMetaTag('twitter:image', image);
    }

    if (url) {
      setMetaTag('og:url', url);
    }

    setMetaTag('twitter:card', twitterCard);

    if (twitterPlayer) {
      setMetaTag('twitter:player', twitterPlayer);
    }

    if (twitterPlayerWidth) {
      setMetaTag('twitter:player:width', twitterPlayerWidth);
    }

    if (twitterPlayerHeight) {
      setMetaTag('twitter:player:height', twitterPlayerHeight);
    }

    setMetaTag('og:type', 'video.other');

    // Cleanup function
    return () => {
      // Note: We don't remove meta tags on cleanup as they might be needed
      // for other components or the default state
    };
  }, [title, description, image, url, twitterCard, twitterPlayer, twitterPlayerWidth, twitterPlayerHeight]);
}
