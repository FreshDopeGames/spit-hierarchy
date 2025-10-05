
import HeaderNavigation from "@/components/HeaderNavigation";
import BlogPageHeader from "@/components/blog/BlogPageHeader";
import AllRappersFilters from "@/components/AllRappersFilters";
import AllRappersGrid from "@/components/AllRappersGrid";
import AllRappersLoadingSkeleton from "@/components/AllRappersLoadingSkeleton";
import AllRappersEmptyState from "@/components/AllRappersEmptyState";
import { useAllRappers } from "@/hooks/useAllRappers";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useEffect } from "react";

const AllRappersPage = () => {
  const { restoreScrollPosition, getCurrentPage, setCurrentPage } = useNavigationState();
  
  // Initialize with URL page parameter
  const initialPage = getCurrentPage();
  
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
    initialPage 
  });

  // Sync URL with current page state
  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage, setCurrentPage]);

  // Restore scroll position on component mount (when returning from detail page)
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  if (isLoading && currentPage === 0) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col overflow-x-hidden">
      <HeaderNavigation isScrolled={false} />
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 pt-28 overflow-x-hidden min-w-0">
          <BlogPageHeader title="All Rappers" />
          <div className="pt-10">
            <AllRappersLoadingSkeleton />
          </div>
        </main>
      </div>
    );
  }

  const total = rappersData?.total || 0;
  const hasMore = rappersData?.hasMore || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col overflow-x-hidden">
      <HeaderNavigation isScrolled={false} />
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 pt-28 overflow-x-hidden min-w-0">
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
        
        {allRappers.length === 0 && !isLoading ? (
          <AllRappersEmptyState />
        ) : (
          <AllRappersGrid
            rappers={allRappers}
            total={total}
            hasMore={hasMore}
            isFetching={isFetching}
            itemsPerPage={itemsPerPage}
            onLoadMore={handleLoadMore}
            currentPage={currentPage}
          />
        )}
      </main>
    </div>
  );
};

export default AllRappersPage;
