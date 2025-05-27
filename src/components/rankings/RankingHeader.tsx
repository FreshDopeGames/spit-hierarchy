
interface RankingHeaderProps {
  title: string;
  description: string;
}

const RankingHeader = ({ title, description }: RankingHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
        {title}
      </h1>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default RankingHeader;
