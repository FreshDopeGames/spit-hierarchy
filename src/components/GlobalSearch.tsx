import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Loader2, X } from 'lucide-react';
import { useRapperAutocomplete } from '@/hooks/useRapperAutocomplete';
import { ThemedInput } from '@/components/ui/themed-input';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    hasMinLength,
  } = useRapperAutocomplete();

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    return () => {
      if (isOpen) {
        handleClose();
      }
    };
  }, [navigate]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleRapperSelect = (slug: string) => {
    navigate(`/rapper/${slug}`);
    handleClose();
  };

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={handleToggle}
        className="transition-opacity hover:opacity-80"
        aria-label="Search rappers"
      >
        <Search className="w-6 h-6 text-white font-bold" strokeWidth={2.5} />
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleClickOutside}
        >

          {/* Search Container */}
          <div className="fixed left-0 right-0 top-20 z-[51] px-4 py-2">
            <div
              ref={searchContainerRef}
              className="max-w-2xl mx-auto bg-[hsl(var(--theme-surface))] rounded-lg shadow-2xl border-2 border-[hsl(var(--theme-primary))] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input Header */}
              <div className="relative p-4 border-b border-[hsl(var(--theme-border))]">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: 'hsl(var(--theme-textMuted))' }}
                  />
                  <ThemedInput
                    ref={inputRef}
                    type="text"
                    placeholder="Search for rappers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 pr-20"
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {isSearching && (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                    )}
                    <button
                      onClick={handleClose}
                      className="hover:opacity-70 transition-opacity"
                      aria-label="Close search"
                    >
                      <X className="w-5 h-5" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Container */}
              <div className="max-h-96 overflow-y-auto">
                {!hasMinLength && searchTerm.length > 0 && (
                  <div
                    className="text-center py-8 px-4"
                    style={{
                      color: 'hsl(var(--theme-textMuted))',
                      fontFamily: 'var(--theme-font-body)'
                    }}
                  >
                    <p className="text-sm">Type at least 2 characters to search</p>
                  </div>
                )}

                {hasMinLength && isSearching && searchResults.length === 0 && (
                  <div
                    className="text-center py-8 px-4"
                    style={{
                      color: 'hsl(var(--theme-textMuted))',
                      fontFamily: 'var(--theme-font-body)'
                    }}
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Searching...</p>
                  </div>
                )}

                {hasMinLength && !isSearching && searchResults.length === 0 && (
                  <div
                    className="text-center py-8 px-4"
                    style={{
                      color: 'hsl(var(--theme-textMuted))',
                      fontFamily: 'var(--theme-font-body)'
                    }}
                  >
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No rappers found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="divide-y divide-[hsl(var(--theme-border))]">
                    {searchResults.map((rapper) => (
                      <div
                        key={rapper.id}
                        onClick={() => handleRapperSelect(rapper.slug)}
                        className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer transition-colors hover:bg-[hsl(var(--theme-surfaceSecondary))] min-h-[60px]"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleRapperSelect(rapper.slug);
                          }
                        }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 flex-shrink-0"
                          style={{
                            backgroundColor: 'hsl(var(--theme-surface))',
                            borderColor: 'hsl(var(--theme-border))'
                          }}
                        >
                          {rapper.image_url ? (
                            <img
                              src={rapper.image_url}
                              alt={rapper.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                            </div>
                          )}
                        </div>

                        {/* Name and Real Name */}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm sm:text-base font-medium truncate"
                            style={{
                              color: 'hsl(var(--theme-text))',
                              fontFamily: 'var(--theme-font-heading)'
                            }}
                          >
                            {rapper.name}
                          </div>
                          {rapper.real_name && (
                            <div
                              className="text-xs sm:text-sm truncate"
                              style={{
                                color: 'hsl(var(--theme-textMuted))',
                                fontFamily: 'var(--theme-font-body)'
                              }}
                            >
                              {rapper.real_name}
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5"
                            style={{ color: 'hsl(var(--theme-textMuted))' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Results count footer */}
                {searchResults.length > 0 && (
                  <div
                    className="text-center py-2 px-4 text-xs border-t border-[hsl(var(--theme-border))]"
                    style={{
                      color: 'hsl(var(--theme-textMuted))',
                      fontFamily: 'var(--theme-font-body)',
                      backgroundColor: 'hsl(var(--theme-surfaceSecondary))'
                    }}
                  >
                    Showing {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
