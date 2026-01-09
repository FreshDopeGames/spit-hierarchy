import React from "react";
import { Link } from "react-router-dom";
import {
  Music,
  Trophy,
  Calendar,
  PenTool,
  Pen,
  MessageSquare,
  Info,
  Zap,
  Instagram,
  BarChart3,
  Brain,
} from "lucide-react";
import { APP_VERSION } from "@/config/version";
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer = () => {
  // Get Community Cypher icon with priority: PenTool > Pen > MessageSquare
  const CypherIcon = PenTool || Pen || MessageSquare;
  return (
    <footer className="bg-[hsl(var(--theme-black))] border-t border-[hsl(var(--theme-primary))] mt-5">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img src="/lovable-uploads/logo-header.png" alt="Logo" className="h-8 w-auto mr-3" />
              <span className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-display)] text-xl tracking-wider">
                Spit Hierarchy
              </span>
            </div>
            <p className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] text-sm">
              The ultimate destination for ranking and discovering the greatest rappers of all time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-[var(--theme-font-heading)] text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/rankings"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Rankings
                </Link>
              </li>
              <li>
                <Link
                  to="/all-rappers"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Music className="w-4 h-4 mr-2" />
                  All Rappers
                </Link>
              </li>
              <li>
                <Link
                  to="/vs"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  VS Matches
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Rapper Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Slick Talk
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
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
            <h3 className="text-white font-[var(--theme-font-heading)] text-lg mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/community-cypher"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <CypherIcon className="w-4 h-4 mr-2" />
                  Community Cypher
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Join Spit Hierarchy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-[var(--theme-font-heading)] text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-[var(--theme-font-heading)] text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com/spithierarchy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/AxQezMVytf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                >
                  <DiscordIcon className="w-4 h-4 mr-2" />
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@spithierarchy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors font-[var(--theme-font-body)]"
                >
                  <TikTokIcon className="w-4 h-4 mr-2" />
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--theme-primary))] mt-8 pt-8 text-center">
          <p className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] text-sm">
            v{APP_VERSION} • © 2025 Fresh Dope Biz LLC • All rights reserved. • Keep the culture alive. Not a lie.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
