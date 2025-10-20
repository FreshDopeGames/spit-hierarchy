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
import { ArrowLeft } from "lucide-react";
import CommentBubble from "@/components/CommentBubble";

const AlbumDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rapperSlug, albumSlug } = useParams<{
    rapperSlug: string;
    albumSlug: string;
  }>();

  if (!rapperSlug || !albumSlug) {
    return <div>Invalid album URL</div>;
  }

  const { data: album, isLoading, error } = useAlbumDetail(rapperSlug, albumSlug);
  const { toggleVote, isSubmitting } = useTrackVoting(rapperSlug, albumSlug);

  if (isLoading) {
    return (
      <>
        <HeaderNavigation isScrolled={false} />
        <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--theme-black))] via-[hsl(var(--theme-background))] to-[hsl(var(--theme-black))]">
          <div className="container mx-auto px-4 pt-20 pb-16 space-y-12">
            <div className="flex flex-col items-center space-y-8">
              <Skeleton className="w-80 h-80 md:w-96 md:h-96 rounded-lg" />
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-12 w-96" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <div className="space-y-2 max-w-4xl mx-auto">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
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
          <AlbumHeader
            rapperId={album.rapper_id}
            albumTitle={album.album_title}
            rapperName={album.rapper_name}
            rapperSlug={album.rapper_slug}
            coverArtUrl={album.cover_art_url}
            releaseDate={album.release_date}
            releaseType={album.release_type}
            trackCount={album.track_count}
          />

          {/* Track Listing Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--theme-font-heading)" }}>
              Tracks
            </h2>
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
