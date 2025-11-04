import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
  canonicalUrl?: string;
  structuredData?: any;
  robots?: string;
  ogType?: string;
}

const SEOHead = ({
  title = "Spit Hierarchy - The Ultimate Rap Rankings",
  description = "Join the ultimate rapper ranking platform. Vote, rank, and discover the best in hip-hop culture.",
  keywords = [],
  ogImage = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/Logo_Rect_02.png",
  ogImageAlt = "Spit Hierarchy - The Ultimate Rap Rankings Logo",
  canonicalUrl,
  structuredData,
  robots,
  ogType = "website"
}: SEOHeadProps) => {
  const defaultKeywords = ['rap rankings', 'hip hop', 'rapper voting', 'music rankings', 'hip hop culture'];
  const allKeywords = [...defaultKeywords, ...keywords];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      {robots && <meta name="robots" content={robots} />}
      
      {/* Critical Image Preload for LCP */}
      <link rel="preload" as="image" href="https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/placeholder-thumb.jpg" fetchPriority="high" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
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