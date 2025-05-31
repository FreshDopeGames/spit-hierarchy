
import React from "react";
import { Link } from "react-router-dom";
import { Music, Trophy, User, BarChart3, Settings, Info } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-rap-carbon border-t border-rap-gold/30 mt-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest"></div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Logo and Brand */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Spit Hierarchy Logo" 
              className="w-12 h-8 object-contain animate-glow-pulse"
            />
            <div>
              <h3 className="font-mogra bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold bg-clip-text text-transparent text-2xl animate-text-glow">
                Spit Hierarchy
              </h3>
              <p className="text-rap-gold/60 font-kaushan text-sm tracking-widest">The Pharaoh's Cypher</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-mogra text-rap-gold text-lg mb-4 tracking-wider">Explore the Realm</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-rap-platinum hover:text-rap-gold font-kaushan flex items-center transition-colors">
                  The Throne Room
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-rap-platinum hover:text-rap-gold font-kaushan flex items-center transition-colors">
                  <Info className="w-4 h-4 mr-2" />
                  Sacred Scrolls
                </Link>
              </li>
              <li>
                <Link to="/all-rappers" className="text-rap-platinum hover:text-rap-gold font-kaushan flex items-center transition-colors">
                  <Music className="w-4 h-4 mr-2" />
                  Court of Pharaohs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mogra text-rap-gold text-lg mb-4 tracking-wider">Royal Chambers</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/rankings" className="text-rap-platinum hover:text-rap-gold font-kaushan flex items-center transition-colors">
                  <Trophy className="w-4 h-4 mr-2" />
                  Hieroglyphic Rankings
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-rap-platinum hover:text-rap-gold font-kaushan flex items-center transition-colors">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Temple Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mogra text-rap-gold text-lg mb-4 tracking-wider">Your Dynasty</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-rap-platinum hover:text-rap-gold font-kaushan transition-colors">
                  Ascend to Power
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-rap-platinum hover:text-rap-gold font-kaushan flex items-center transition-colors">
                  <User className="w-4 h-4 mr-2" />
                  Royal Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mogra text-rap-gold text-lg mb-4 tracking-wider">High Council</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/admin" className="text-rap-platinum hover:text-rap-gold font-kaushan flex items-center transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  High Priest Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-rap-gold/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-rap-gold/60 font-kaushan text-sm tracking-wide">
              © 2024 Fresh Dope Biz LLC. All dynasties reserved.
            </p>
            <p className="text-rap-gold/60 font-kaushan text-sm mt-2 md:mt-0 tracking-wide">
              Ruling the Culture Since the First Dynasty
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
