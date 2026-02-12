import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Loader2, X, Disc3 } from 'lucide-react';
import { useRapperAutocomplete } from '@/hooks/useRapperAutocomplete';
import { useAlbumSearch } from '@/hooks/useAlbumSearch';
import { useCanSuggestRappers } from '@/hooks/useCanSuggestRappers';
import { ThemedInput } from '@/components/ui/themed-input';
import { ThemedButton } from '@/components/ui/themed-button';
import RapperSuggestionModal from '@/components/RapperSuggestionModal';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchTerm,
    setSearchTerm,
    searchResults: rapperResults,
    isSearching: rapperSearching,
    hasMinLength,
  } = useRapperAutocomplete();

  const albumSearch = useAlbumSearch();
  const albumResults = albumSearch.searchResults;
  const albumSearching = albumSearch.isSearching;

  // Sync search term to album search
  useEffect(() => {
    albumSearch.setSearchTerm(searchTerm);
  }, [searchTerm]);

  const isSearching = rapperSearching || albumSearching;
  const totalResults = rapperResults.length + albumResults.length;

  const { canSuggest } = useCanSuggestRappers();

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

  const handleAlbumSelect = (rapperSlug: string, albumSlug: string) => {
    navigate(`/rapper/${rapperSlug}/${albumSlug}`);
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
                    placeholder="Search rappers and albums..."
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
                    style={{ color: 'hsl(var(--theme-textMuted))', fontFamily: 'var(--theme-font-body)' }}
                  >
                    <p className="text-sm">Type at least 2 characters to search</p>
                  </div>
                )}

                {hasMinLength && isSearching && totalResults === 0 && (
                  <div
                    className="text-center py-8 px-4"
                    style={{ color: 'hsl(var(--theme-textMuted))', fontFamily: 'var(--theme-font-body)' }}
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Searching...</p>
                  </div>
                )}

                {hasMinLength && !isSearching && totalResults === 0 && (
                  <div
                    className="text-center py-8 px-4"
                    style={{ color: 'hsl(var(--theme-textMuted))', fontFamily: 'var(--theme-font-body)' }}
                  >
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results found</p>
                    <p className="text-xs mt-1">Try a different search term</p>

                    {canSuggest && (
                      <ThemedButton
                        variant="outline"
                        onClick={() => setSuggestionModalOpen(true)}
                        className="mt-4"
                      >
                        <span className="text-lg font-bold" style={{ color: 'hsl(var(--theme-primary))' }}>
                          ⚠️ Suggest a Rapper to Admins
                        </span>
                      </ThemedButton>
                    )}
                  </div>
                )}

                {/* Rapper Results */}
                {rapperResults.length > 0 && (
                  <>
                    <div
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b border-[hsl(var(--theme-border))]"
                      style={{ color: 'hsl(var(--theme-textMuted))', backgroundColor: 'hsl(var(--theme-surfaceSecondary))', fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Rappers
                    </div>
                    <div className="divide-y divide-[hsl(var(--theme-border))]">
                      {rapperResults.map((rapper) => (
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
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 flex-shrink-0"
                            style={{ backgroundColor: 'hsl(var(--theme-surface))', borderColor: 'hsl(var(--theme-border))' }}
                          >
                            {rapper.image_url ? (
                              <img src={rapper.image_url} alt={rapper.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm sm:text-base font-medium truncate" style={{ color: 'hsl(var(--theme-text))', fontFamily: 'var(--theme-font-heading)' }}>
                              {rapper.name}
                            </div>
                            {rapper.real_name && (
                              <div className="text-xs sm:text-sm truncate" style={{ color: 'hsl(var(--theme-textMuted))', fontFamily: 'var(--theme-font-body)' }}>
                                {rapper.real_name}
                              </div>
                            )}
                          </div>
                          <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--theme-textMuted))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Album Results */}
                {albumResults.length > 0 && (
                  <>
                    <div
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b border-[hsl(var(--theme-border))]"
                      style={{ color: 'hsl(var(--theme-textMuted))', backgroundColor: 'hsl(var(--theme-surfaceSecondary))', fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Albums
                    </div>
                    <div className="divide-y divide-[hsl(var(--theme-border))]">
                      {albumResults.map((album) => (
                        <div
                          key={album.id}
                          onClick={() => handleAlbumSelect(album.rapper_slug, album.slug)}
                          className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer transition-colors hover:bg-[hsl(var(--theme-surfaceSecondary))] min-h-[60px]"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAlbumSelect(album.rapper_slug, album.slug);
                            }
                          }}
                        >
                          {/* Album Cover Thumbnail */}
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden border-2 flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: 'hsl(var(--theme-surface))', borderColor: 'hsl(var(--theme-border))' }}
                          >
                            {(album.cached_cover_url || album.cover_art_url) ? (
                              <img
                                src={album.cached_cover_url || album.cover_art_url!}
                                alt={album.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Disc3 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base font-medium truncate" style={{ color: 'hsl(var(--theme-text))', fontFamily: 'var(--theme-font-heading)' }}>
                                {album.title}
                              </span>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full uppercase font-semibold flex-shrink-0"
                                style={{
                                  backgroundColor: album.release_type === 'album' ? 'hsl(var(--theme-primary) / 0.15)' : 'hsl(var(--theme-secondary) / 0.15)',
                                  color: album.release_type === 'album' ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-secondary))',
                                }}
                              >
                                {album.release_type}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm truncate" style={{ color: 'hsl(var(--theme-textMuted))', fontFamily: 'var(--theme-font-body)' }}>
                              {album.rapper_name}
                            </div>
                          </div>
                          <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--theme-textMuted))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Results count footer */}
                {totalResults > 0 && (
                  <div
                    className="text-center py-2 px-4 text-xs border-t border-[hsl(var(--theme-border))]"
                    style={{ color: 'hsl(var(--theme-textMuted))', fontFamily: 'var(--theme-font-body)', backgroundColor: 'hsl(var(--theme-surfaceSecondary))' }}
                  >
                    Showing {totalResults} result{totalResults !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <RapperSuggestionModal
        open={suggestionModalOpen}
        onOpenChange={setSuggestionModalOpen}
        defaultRapperName={searchTerm}
      />
    </>
  );
};

export default GlobalSearch;
