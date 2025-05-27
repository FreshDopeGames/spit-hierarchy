
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AdminRapperManagement from "@/components/admin/AdminRapperManagement";

const Admin = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      {/* Background overlay for future custom backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-xl flex items-center justify-center shadow-lg">
                <Music className="w-6 h-6 text-rap-silver" />
              </div>
              <h1 className="text-2xl font-mogra bg-gradient-to-r from-rap-gold to-rap-silver bg-clip-text text-transparent animate-text-glow">
                Admin Panel
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-rap-platinum font-kaushan">Admin: {user.email}</span>
                  <Button 
                    onClick={signOut} 
                    variant="outline" 
                    className="border-rap-burgundy/50 text-rap-burgundy hover:bg-rap-burgundy/20 hover:border-rap-burgundy font-kaushan"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-mogra text-rap-gold mb-2 animate-text-glow">
              Rapper Management
            </h2>
            <p className="text-rap-platinum font-kaushan">
              Add, edit, and manage rappers in the database
            </p>
          </div>

          <AdminRapperManagement />
        </main>
      </div>
    </div>
  );
};

export default Admin;
