import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://spithierarchy.com';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  canonicalUrl?: string;
  structuredData?: any;
  robots?: string;
  ogType?: string;
  preloadImages?: string[];
  // Article-specific properties
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
}

const SEOHead = ({
  title = "Spit Hierarchy - The Ultimate Rap Rankings",
  description = "Join the ultimate rapper ranking platform. Vote, rank, and discover the best in hip-hop culture.",
  keywords = [],
  ogImage = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/Logo_Rect_02.png",
  ogImageAlt = "Spit Hierarchy - The Ultimate Rap Rankings Logo",
  ogImageWidth = 1200,
  ogImageHeight = 630,
  canonicalUrl,
  structuredData,
  robots,
  ogType = "website",
  preloadImages = [],
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags = []
}: SEOHeadProps) => {
  const defaultKeywords = ['rap rankings', 'hip hop', 'rapper voting', 'music rankings', 'hip hop culture'];
  const allKeywords = [...defaultKeywords, ...keywords];
  
  // Ensure canonical URL is absolute
  const absoluteCanonicalUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${SITE_URL}${canonicalUrl}`)
    : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      {robots && <meta name="robots" content={robots} />}
      
      {/* Critical Image Preloads for LCP */}
      {preloadImages.map((imageUrl, index) => (
        <link 
          key={index}
          rel="preload" 
          as="image" 
          href={imageUrl} 
          fetchPriority={index === 0 ? "high" : "auto"} 
        />
      ))}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:image:width" content={String(ogImageWidth)} />
      <meta property="og:image:height" content={String(ogImageHeight)} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Spit Hierarchy" />
      {absoluteCanonicalUrl && <meta property="og:url" content={absoluteCanonicalUrl} />}
      
      {/* Article-specific Open Graph tags */}
      {ogType === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === 'article' && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {ogType === 'article' && articleTags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {absoluteCanonicalUrl && <link rel="canonical" href={absoluteCanonicalUrl} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;