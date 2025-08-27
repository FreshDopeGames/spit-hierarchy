
import { useTheme } from "@/hooks/useTheme";

interface RankingHeaderProps {
  title: string;
  description: string;
}

const RankingHeader = ({
  title,
  description
}: RankingHeaderProps) => {
  const { theme } = useTheme();

  return (
    <div className="text-center mb-8 sm:mb-10 lg:mb-12">
      <h1 
        className="font-ceviche sm:text-4xl md:text-6xl mb-6 font-normal leading-tight lg:text-8xl text-4xl"
        style={{ color: theme.colors.primary }}
      >
        {title}
      </h1>
      <p className="text-lg sm:text-xl text-[var(--theme-textMuted)] max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default RankingHeader;
