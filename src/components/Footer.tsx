
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Trophy, Calendar, PenTool, Pen, MessageSquare, Info } from 'lucide-react';

const Footer = () => {
  // Get Community Cypher icon with priority: PenTool > Pen > MessageSquare
  const CypherIcon = PenTool || Pen || MessageSquare;

  return (
    <footer className="bg-black border-t border-rap-gold/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
                alt="Logo" 
                className="h-8 w-auto mr-3" 
              />
              <span className="text-rap-gold font-ceviche text-xl tracking-wider">
                Spit Hierarchy
              </span>
            </div>
            <p className="text-white/90 font-merienda text-sm">
              The ultimate destination for ranking and discovering the greatest rappers of all time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-rap-gold font-mogra text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/rankings" 
                  className="flex items-center text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Rankings
                </Link>
              </li>
              <li>
                <Link 
                  to="/all-rappers" 
                  className="flex items-center text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Music className="w-4 h-4 mr-2" />
                  All Rappers
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="flex items-center text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Slick Talk
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="flex items-center text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-rap-gold font-mogra text-lg mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/community-cypher" 
                  className="flex items-center text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <CypherIcon className="w-4 h-4 mr-2" />
                  Community Cypher
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth" 
                  className="text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Join Spit Hierarchy
                </Link>
              </li>
              <li>
                <Link 
                  to="/analytics" 
                  className="text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-rap-gold font-mogra text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-white/90 hover:text-rap-gold transition-colors font-merienda"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-rap-gold/30 mt-8 pt-8 text-center">
          <p className="text-white/80 font-merienda text-sm">
            © 2025 Spit Hierarchy. All rights reserved. Keep the culture alive.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
