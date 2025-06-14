
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminRapperPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const AdminRapperPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: AdminRapperPaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    // Reduce visible pages on mobile
    const maxVisible = window.innerWidth < 640 ? 3 : 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
      <div className="text-center text-xs sm:text-sm text-rap-smoke">
        <span className="hidden sm:inline">Showing </span>
        <span className="font-medium">{startItem}-{endItem}</span>
        <span className="hidden sm:inline"> of </span>
        <span className="sm:hidden"> / </span>
        <span className="font-medium">{totalItems}</span>
        <span className="hidden sm:inline"> rappers</span>
      </div>
      
      <Pagination className="justify-center">
        <PaginationContent className="gap-0.5 sm:gap-1">
          <PaginationItem>
            <PaginationPrevious 
              onClick={handlePrevious}
              className={`${
                currentPage === 1 
                  ? 'pointer-events-none opacity-50' 
                  : 'cursor-pointer hover:bg-rap-gold/20 hover:text-rap-gold'
              } text-rap-platinum border-rap-gold/30 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-10`}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </PaginationPrevious>
          </PaginationItem>
          
          {getVisiblePages().map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={page === currentPage}
                className={`cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-10 min-w-[32px] sm:min-w-[40px] ${
                  page === currentPage
                    ? 'bg-rap-gold text-rap-carbon'
                    : 'text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold'
                } border-rap-gold/30`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={handleNext}
              className={`${
                currentPage === totalPages 
                  ? 'pointer-events-none opacity-50' 
                  : 'cursor-pointer hover:bg-rap-gold/20 hover:text-rap-gold'
              } text-rap-platinum border-rap-gold/30 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-10`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default AdminRapperPagination;
