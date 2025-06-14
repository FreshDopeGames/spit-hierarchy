
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
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-rap-smoke">
        Showing {startItem}-{endItem} of {totalItems} rappers
      </div>
      
      <Pagination className="justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={handlePrevious}
              className={`${
                currentPage === 1 
                  ? 'pointer-events-none opacity-50' 
                  : 'cursor-pointer hover:bg-rap-gold/20 hover:text-rap-gold'
              } text-rap-platinum border-rap-gold/30`}
            />
          </PaginationItem>
          
          {getVisiblePages().map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={page === currentPage}
                className={`cursor-pointer ${
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
              } text-rap-platinum border-rap-gold/30`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default AdminRapperPagination;
