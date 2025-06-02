interface RankingHeaderProps {
  title: string;
  description: string;
}
const RankingHeader = ({
  title,
  description
}: RankingHeaderProps) => {
  return <div className="text-center mb-12">
      <h1 className="font-ceviche text-5xl mb-6 font-normal text-amber-400 md:text-8xl">
        {title}
      </h1>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>;
};
export default RankingHeader;