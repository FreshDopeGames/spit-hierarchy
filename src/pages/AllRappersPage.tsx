import HeaderNavigation from "@/components/HeaderNavigation";
import BlogPageHeader from "@/components/blog/BlogPageHeader";
import AllRappersFilters from "@/components/AllRappersFilters";
import AllRappersGrid from "@/components/AllRappersGrid";
import AllRappersLoadingSkeleton from "@/components/AllRappersLoadingSkeleton";
import AllRappersEmptyState from "@/components/AllRappersEmptyState";
import AllRappersInlineLoader from "@/components/AllRappersInlineLoader";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { useAllRappers } from "@/hooks/useAllRappers";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useEffect } from "react";
import SEOHead from "@/components/seo/SEOHead";

const AllRappersPage = () => {
  const { getScrollPosition, setScrollPosition, getAllFilters } = useNavigationState();

  const {
    sortBy,
    sortOrder,
    searchInput,
    searchTerm,
    locationInput,
    locationFilter,
    ratedFilter,
    allRappers,
    rappersData,
    isLoading,
    isFetching,
    itemsPerPage,
    handleSortChange,
    handleOrderChange,
    handleSearchInput,
    handleLocationInput,
    handleRatedFilterChange,
    handleLoadMore,
    currentPage,
  } = useAllRappers({
    itemsPerPage: 20,
  });

  // Capture scroll position periodically
  useEffect(() => {
    let timeoutId: number;

    const handleScroll = () => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout to save scroll position after user stops scrolling
      timeoutId = window.setTimeout(() => {
        const scrollPos = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const cappedScrollPos = Math.min(scrollPos, maxScroll - 100); // -100px safety margin
        setScrollPosition(cappedScrollPos);
      }, 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [setScrollPosition]);

  // Restore scroll position after data loads
  useEffect(() => {
    const savedPage = getAllFilters().page || 0;
    const expectedMinimumRappers = (savedPage + 1) * itemsPerPage;

    // Only restore scroll when we have enough rappers loaded for the saved page
    if (allRappers.length >= expectedMinimumRappers && !isLoading) {
      const savedScrollPos = getScrollPosition();
      if (savedScrollPos > 0) {
        requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const safeScrollPos = Math.min(savedScrollPos, maxScroll);
          console.log(
            `[Page] Restoring scroll to ${safeScrollPos}px (requested ${savedScrollPos}px, max ${maxScroll}px, have ${allRappers.length} rappers)`,
          );
          window.scrollTo({ top: safeScrollPos, behavior: "instant" });
        });
      }
    }
  }, [allRappers.length, isLoading, getScrollPosition, getAllFilters, itemsPerPage]);

  const total = rappersData?.total || 0;
  const hasMore = rappersData?.hasMore || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col overflow-x-hidden">
      <SEOHead
        title="All Rappers Directory - Complete Hip-Hop Artist Database | Spit Hierarchy"
        description="Explore our comprehensive database of rap artists from all eras and regions. Search, filter by location, discover new talent, and vote on your favorite MCs."
        keywords={['rapper directory', 'hip hop artists', 'rap database', 'all rappers', 'mc list', 'hip hop encyclopedia']}
        canonicalUrl="/all-rappers"
      />
      <HeaderNavigation isScrolled={false} />
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 pt-20 overflow-x-hidden min-w-0">
        <BlogPageHeader title="All Rappers" />

        <p className="text-center text-rap-smoke text-lg sm:text-xl font-kaushan mb-6 sm:mb-8 px-2 break-words">
          {total} legendary rappers • Showing {allRappers.length}
        </p>

        <AllRappersFilters
          searchInput={searchInput}
          searchTerm={searchTerm}
          locationInput={locationInput}
          locationFilter={locationFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          ratedFilter={ratedFilter}
          onSearchInput={handleSearchInput}
          onLocationInput={handleLocationInput}
          onSortChange={handleSortChange}
          onOrderChange={handleOrderChange}
          onRatedFilterChange={handleRatedFilterChange}
        />

        {isLoading && currentPage === 0 ? (
          <AllRappersLoadingSkeleton />
        ) : allRappers.length === 0 ? (
          <AllRappersEmptyState />
        ) : (
          <>
            {isFetching && <AllRappersInlineLoader />}
            <AllRappersGrid
              rappers={allRappers}
              total={total}
              hasMore={hasMore}
              isFetching={isFetching}
              itemsPerPage={itemsPerPage}
              onLoadMore={handleLoadMore}
              currentPage={currentPage}
            />
          </>
        )}
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default AllRappersPage;
