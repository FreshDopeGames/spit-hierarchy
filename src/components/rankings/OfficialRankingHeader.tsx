
import { Badge } from "@/components/ui/badge";

interface OfficialRankingHeaderProps {
  title: string;
  description: string;
  category: string;
}

const OfficialRankingHeader = ({ title, description, category }: OfficialRankingHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl md:text-5xl font-bold text-rap-platinum mb-4 leading-tight font-ceviche">
        {title}
      </h1>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-platinum border-rap-burgundy/30 font-kaushan">
          {category}
        </Badge>
      </div>
      
      <p className="text-xl text-rap-smoke mb-6 leading-relaxed font-merienda">
        {description}
      </p>
    </div>
  );
};

export default OfficialRankingHeader;
