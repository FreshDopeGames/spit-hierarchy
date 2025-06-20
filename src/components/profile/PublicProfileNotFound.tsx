
import { Link } from "react-router-dom";
import HeaderNavigation from "@/components/HeaderNavigation";

const PublicProfileNotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={false} />
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-rap-platinum mb-4 font-mogra">User Not Found</h1>
          <p className="text-rap-smoke mb-6 font-kaushan">This user profile doesn't exist.</p>
          <Link to="/rankings" className="text-rap-gold hover:text-rap-gold-light font-kaushan">
            ← Back to Rankings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileNotFound;
