import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAlbumDetail } from "@/hooks/useAlbumDetail";
import { useTrackVoting } from "@/hooks/useTrackVoting";
import { AlbumHeader } from "@/components/album/AlbumHeader";
import { AlbumTrackList } from "@/components/album/AlbumTrackList";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/seo/SEOHead";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { ThemedButton } from "@/components/ui/themed-button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import CommentBubble from "@/components/CommentBubble";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { generateExternalAlbumLinks } from "@/utils/albumPlaceholderUtils";

const AlbumDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, isModerator } = useSecurityContext();
  const [isRefreshingTracks, setIsRefreshingTracks] = useState(false);
  const { rapperSlug, albumSlug } = useParams<{
    rapperSlug: string;
    albumSlug: string;
  }>();

  // Guard against invalid slugs
  const isInvalidSlug = !albumSlug || albumSlug === 'undefined' || albumSlug === 'null' || albumSlug.trim().length === 0;

  React.useEffect(() => {
    if (isInvalidSlug && rapperSlug) {
      const scrollPos = searchParams.get('scrollPos');
      navigate(scrollPos ? `/rapper/${rapperSlug}?scrollPos=${scrollPos}` : `/rapper/${rapperSlug}`, { replace: true });
    }
  }, [isInvalidSlug, rapperSlug, navigate, searchParams]);

  if (!rapperSlug || isInvalidSlug) {
    return null; // Will redirect via useEffect
  }

  const { data: album, isLoading, error, isFetchingTracks, refetch } = useAlbumDetail(rapperSlug, albumSlug);
  const { toggleVote, isSubmitting } = useTrackVoting(rapperSlug, albumSlug);

  const isAdminOrModerator = isAdmin || isModerator;

  const handleRefreshTracks = async () => {
    if (!album) return;
    
    setIsRefreshingTracks(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-album-tracks', {
        body: { albumId: album.album_id, forceRefresh: true },
      });

      if (error) {
        toast.error('Failed to refresh tracklist', {
          description: error.message,
        });
      } else if (data.success) {
        toast.success('Tracklist refreshed successfully', {
          description: `${data.track_count} tracks updated`,
        });
        await refetch();
      } else {
        toast.error('Failed to refresh tracklist', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error: any) {
      toast.error('Unexpected error', {
        description: error.message,
      });
    } finally {
      setIsRefreshingTracks(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <HeaderNavigation isScrolled={false} />
        <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--theme-black))] via-[hsl(var(--theme-background))] to-[hsl(var(--theme-black))]">
          <div className="container mx-auto px-4 pt-20 pb-16 space-y-4">
            {/* Back button skeleton */}
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-10 w-48 mb-6" />
            </div>
            
            {/* Album header skeleton - matches AlbumHeader layout */}
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Album Cover Art Skeleton */}
              <Skeleton className="w-80 h-80 md:w-96 md:h-96 rounded-lg" />
              
              {/* Title Skeleton */}
              <Skeleton className="h-10 w-72 md:w-96" />
              
              {/* Artist Row Skeleton - smaller avatar + name + streaming buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </div>
              
              {/* Badge/Metadata Skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            {/* Track List Skeleton */}
            <div className="max-w-4xl mx-auto mt-8">
              <Skeleton className="h-8 w-24 mb-6" /> {/* "Tracks" heading */}
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !album) {
    return (
      <>
        <HeaderNavigation isScrolled={false} />
        <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--theme-black))] via-[hsl(var(--theme-background))] to-[hsl(var(--theme-black))]">
          <div className="container mx-auto px-4 pt-20 pb-16">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
              <p className="text-muted-foreground">The album you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const seoTitle = `${album.album_title} by ${album.rapper_name} - Track Votes & Details`;
  const seoDescription = `Vote on tracks from ${album.album_title} by ${album.rapper_name}. ${
    album.track_count ? `${album.track_count} tracks` : "Full track listing"
  }${album.release_date ? ` released in ${new Date(album.release_date).getFullYear()}` : ""}.`;

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={[album.rapper_name, album.album_title, "hip hop", "rap album", "track voting", album.release_type]}
        ogImage={album.cover_art_url || undefined}
        ogImageAlt={`${album.album_title} album cover`}
        canonicalUrl={`${window.location.origin}/rapper/${rapperSlug}/${albumSlug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "MusicAlbum",
          name: album.album_title,
          byArtist: {
            "@type": "MusicGroup",
            name: album.rapper_name,
          },
          datePublished: album.release_date,
          image: album.cover_art_url,
          numTracks: album.track_count,
          albumReleaseType: album.release_type,
        }}
      />

      <HeaderNavigation isScrolled={false} />

      <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--theme-black))] via-[hsl(var(--theme-background))] to-[hsl(var(--theme-black))] relative">
        <div className="container mx-auto px-4 pt-20 pb-16 space-y-4">
          {/* Back Button - Left Aligned */}
          <div className="max-w-4xl mx-auto">
            <ThemedButton
              variant="default"
              className="font-[var(--theme-font-body)] text-black hover:text-black mb-6"
              onClick={() => {
                const scrollPos = searchParams.get('scrollPos');
                navigate(scrollPos ? `/rapper/${album.rapper_slug}?scrollPos=${scrollPos}` : `/rapper/${album.rapper_slug}`);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {album.rapper_name}
            </ThemedButton>
          </div>

          {/* Centered Album Header */}
          {(() => {
            // Generate streaming links with fallback to search URLs
            const searchLinks = generateExternalAlbumLinks(
              album.album_title,
              album.rapper_name,
              album.release_type as 'album' | 'mixtape' | 'ep' | 'single'
            );
            const directLinks = album.external_cover_links || {};
            const externalLinks = {
              spotify: directLinks.spotify || searchLinks.spotify,
              appleMusic: directLinks.apple_music || searchLinks.appleMusic,
            };
            
            return (
              <AlbumHeader
                rapperId={album.rapper_id}
                albumTitle={album.album_title}
                rapperName={album.rapper_name}
                rapperSlug={album.rapper_slug}
                coverArtUrl={album.cover_art_url}
                releaseDate={album.release_date}
                releaseType={album.release_type}
                trackCount={album.track_count}
                externalLinks={externalLinks}
              />
            );
          })()}

          {/* Track Listing Section */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--theme-font-heading)" }}>
                Tracks
                {isFetchingTracks && (
                  <span className="ml-3 text-sm text-muted-foreground animate-pulse">
                    Loading tracklist from MusicBrainz...
                  </span>
                )}
              </h2>
              {isAdminOrModerator && album && (
                <ThemedButton
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshTracks}
                  disabled={isRefreshingTracks || isFetchingTracks}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingTracks ? 'animate-spin' : ''}`} />
                  Refresh Tracklist
                </ThemedButton>
              )}
            </div>
            <AlbumTrackList
              tracks={album.tracks}
              rapperName={album.rapper_name}
              onVote={toggleVote} 
              isVoting={isSubmitting} 
            />
          </div>
        </div>

        <CommentBubble contentType="album" contentId={album.album_id} />
        <BackToTopButton hasCommentBubble={true} />
      </div>

      <Footer />
    </>
  );
};

export default AlbumDetail;
