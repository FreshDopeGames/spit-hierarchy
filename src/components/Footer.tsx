import React from "react";
import { Link } from "react-router-dom";
import { Music, Trophy, User, BarChart3, Settings, Info } from "lucide-react";
const Footer = () => {
  return <footer className="bg-rap-carbon border-t border-rap-gold/30 mt-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest"></div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Logo and Brand */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <img src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" alt="Spit Hierarchy Logo" className="w-12 h-8 object-contain animate-glow-pulse" />
            <div>
              <h3 className="font-merienda font-extrabold bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold bg-clip-text text-transparent text-2xl animate-text-glow">
                Spit Hierarchy
              </h3>
              <p className="text-rap-gold/60 font-merienda text-sm tracking-widest">The Realest Spit</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-merienda font-extrabold text-rap-gold text-lg mb-4 tracking-wider">Explore the Realm</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-rap-platinum hover:text-rap-gold font-merienda flex items-center transition-colors">
                  The Throne Room
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-rap-platinum hover:text-rap-gold font-merienda flex items-center transition-colors">
                  <Info className="w-4 h-4 mr-2" />
                  Slick Talk
                </Link>
              </li>
              <li>
                <Link to="/all-rappers" className="text-rap-platinum hover:text-rap-gold font-merienda flex items-center transition-colors">
                  <Music className="w-4 h-4 mr-2" />
                  Ranked Rappers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-merienda font-extrabold  text-rap-gold text-lg mb-4 tracking-wider">Booth</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/rankings" className="text-rap-platinum hover:text-rap-gold font-merienda flex items-center transition-colors">
                  <Trophy className="w-4 h-4 mr-2" />
                  Top Rapper Rankings
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-rap-platinum hover:text-rap-gold font-merienda flex items-center transition-colors">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Community Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-merienda font-extrabold  text-rap-gold text-lg mb-4 tracking-wider">Your World</h4>
            <ul className="space-y-2">
              <li>
                
              </li>
              <li>
                <Link to="/profile" className="text-rap-platinum hover:text-rap-gold font-merienda flex items-center transition-colors">
                  <User className="w-4 h-4 mr-2" />
                  Your Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-merienda font-extrabold  text-rap-gold text-lg mb-4 tracking-wider">High Council</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/admin" className="text-rap-platinum hover:text-rap-gold font-merienda flex items-center transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-rap-gold/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-rap-gold/60 font-merienda text-sm tracking-wide">© 2025 Fresh Dope Biz LLC</p>
            <p className="text-rap-gold/60 font-merienda text-sm mt-2 md:mt-0 tracking-wide">Spit Hierarchy - The Ultimate Rapper Rankings</p>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;