import useReadingProgress from '@/hooks/useReadingProgress';

const ReadingProgressBar = () => {
  const progress = useReadingProgress();

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[hsl(var(--theme-surface))]">
      <div 
        className="h-full bg-gradient-to-r from-[hsl(var(--theme-primaryLight))] via-[hsl(var(--theme-primary))] to-[hsl(var(--theme-primaryDark))] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;
