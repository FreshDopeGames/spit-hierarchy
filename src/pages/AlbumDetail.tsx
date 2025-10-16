import { useParams } from "react-router-dom";
import { useAlbumDetail } from "@/hooks/useAlbumDetail";
import { useTrackVoting } from "@/hooks/useTrackVoting";
import { AlbumHeader } from "@/components/album/AlbumHeader";
import { AlbumTrackList } from "@/components/album/AlbumTrackList";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/seo/SEOHead";

const AlbumDetail = () => {
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
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-64 h-64 md:w-80 md:h-80 rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
          <p className="text-muted-foreground">
            The album you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
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
        keywords={[
          album.rapper_name,
          album.album_title,
          "hip hop",
          "rap album",
          "track voting",
          album.release_type,
        ]}
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

      <div className="container mx-auto px-4 py-8 space-y-8">
        <AlbumHeader
          albumTitle={album.album_title}
          rapperName={album.rapper_name}
          rapperSlug={album.rapper_slug}
          coverArtUrl={album.cover_art_url}
          releaseDate={album.release_date}
          releaseType={album.release_type}
          trackCount={album.track_count}
        />

        <div>
          <h2 className="text-2xl font-bold mb-4">Tracks</h2>
          <AlbumTrackList
            tracks={album.tracks}
            onVote={toggleVote}
            isVoting={isSubmitting}
          />
        </div>
      </div>
    </>
  );
};

export default AlbumDetail;
