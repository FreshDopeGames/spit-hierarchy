const BlogCarouselSkeleton = () => {
  return (
    <section className="mb-16">
      <div className="h-12 sm:h-16 bg-[hsl(var(--theme-surface))] rounded-lg w-80 mx-auto mb-6 sm:mb-8 animate-pulse" />
      
      <div className="flex justify-center">
        <div className="relative max-w-4xl w-full overflow-hidden rounded-xl bg-[hsl(var(--theme-surface))] border-4 border-[hsl(var(--theme-primary))]/30 shadow-lg shadow-[hsl(var(--theme-primary))]/20">
          <div className="aspect-[3/2] sm:aspect-[16/9] md:aspect-[16/10] relative">
            {/* Animated gradient placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--theme-surface))] via-[hsl(var(--theme-background))] to-[hsl(var(--theme-surface))] animate-pulse" />
            
            {/* Top title skeleton */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="h-8 sm:h-10 md:h-12 bg-white/20 rounded-lg w-3/4 animate-pulse" />
            </div>
            
            {/* Bottom metadata skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="h-5 w-32 bg-white/20 rounded animate-pulse" />
                <div className="h-6 w-20 bg-white/20 rounded-full animate-pulse" />
              </div>
              <div className="h-4 sm:h-5 bg-white/20 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 sm:h-5 bg-white/20 rounded w-2/3 animate-pulse" />
            </div>
            
            {/* Navigation button skeletons */}
            <div className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2">
              <div className="h-10 w-10 sm:h-24 sm:w-24 rounded-full bg-black/40 animate-pulse" />
            </div>
            <div className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2">
              <div className="h-10 w-10 sm:h-24 sm:w-24 rounded-full bg-black/40 animate-pulse" />
            </div>
            
            {/* Dot indicators skeleton */}
            <div className="absolute bottom-5 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full bg-white/30 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Button skeleton */}
      <div className="text-center mt-6">
        <div className="h-12 w-48 bg-gradient-to-r from-[hsl(var(--theme-burgundy))]/30 to-[hsl(var(--theme-gold))]/30 rounded-lg mx-auto animate-pulse" />
      </div>
    </section>
  );
};

export default BlogCarouselSkeleton;
