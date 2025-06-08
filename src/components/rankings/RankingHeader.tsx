
interface RankingHeaderProps {
  title: string;
  description: string;
}

const RankingHeader = ({
  title,
  description
}: RankingHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="font-ceviche text-3xl sm:text-4xl md:text-6xl lg:text-8xl mb-6 font-normal text-amber-400 leading-tight">
        {title}
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default RankingHeader;
