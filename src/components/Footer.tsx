
import React from "react";
import { Link } from "react-router-dom";
import { Mic, Music, Trophy, User, BarChart3, Settings, Info } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-rap-carbon border-t border-rap-gold/30 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Logo and Brand */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-xl w-12 h-12 flex items-center justify-center">
              <Mic className="text-rap-silver w-7 h-7" />
            </div>
            <div>
              <h3 className="font-mogra bg-gradient-to-r from-rap-silver to-rap-platinum bg-clip-text text-transparent text-2xl">
                Spit Hierarchy
              </h3>
              <p className="text-rap-smoke font-kaushan text-sm">Where Bars Meet Rankings</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-mogra text-rap-forest text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-rap-platinum hover:text-rap-silver font-kaushan flex items-center transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-rap-platinum hover:text-rap-silver font-kaushan flex items-center transition-colors">
                  <Info className="w-4 h-4 mr-2" />
                  About
                </Link>
              </li>
              <li>
                <Link to="/all-rappers" className="text-rap-platinum hover:text-rap-silver font-kaushan flex items-center transition-colors">
                  <Music className="w-4 h-4 mr-2" />
                  All Artists
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mogra text-rap-forest text-lg mb-4">Rankings</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/rankings" className="text-rap-platinum hover:text-rap-silver font-kaushan flex items-center transition-colors">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Rankings
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-rap-platinum hover:text-rap-silver font-kaushan flex items-center transition-colors">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mogra text-rap-forest text-lg mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-rap-platinum hover:text-rap-silver font-kaushan transition-colors">
                  Sign In / Join
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-rap-platinum hover:text-rap-silver font-kaushan flex items-center transition-colors">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mogra text-rap-forest text-lg mb-4">Admin</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/admin" className="text-rap-platinum hover:text-rap-silver font-kaushan flex items-center transition-colors">
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
            <p className="text-rap-smoke font-kaushan text-sm">
              © 2024 Fresh Dope Biz LLC. All rights reserved.
            </p>
            <p className="text-rap-smoke font-kaushan text-sm mt-2 md:mt-0">
              The Culture's Voice Since Day One
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
