
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AdminRapperManagement from "@/components/admin/AdminRapperManagement";

const Admin = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-purple-300 hover:text-purple-200">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-300">Admin: {user.email}</span>
                <Button onClick={signOut} variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
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
          <h2 className="text-3xl font-bold text-white mb-2">
            Rapper Management
          </h2>
          <p className="text-gray-300">
            Add, edit, and manage rappers in the database
          </p>
        </div>

        <AdminRapperManagement />
      </main>
    </div>
  );
};

export default Admin;
