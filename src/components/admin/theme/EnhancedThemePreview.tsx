import React, { useState } from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedInput } from "@/components/ui/themed-input";
import { Badge } from "@/components/ui/badge";
import { EnhancedThemeConfig } from "@/config/enhancedTheme";
import { cn } from "@/lib/utils";
import { Menu, User, Home, Trophy, Users, BarChart3, LogOut } from "lucide-react";

interface EnhancedThemePreviewProps {
  theme: EnhancedThemeConfig;
}

const EnhancedThemePreview = ({ theme }: EnhancedThemePreviewProps) => {
  const [inputValue, setInputValue] = useState("Sample input text");

  return (
    <ThemedCard className="relative">
      <ThemedCardHeader>
        <ThemedCardTitle>Theme Preview</ThemedCardTitle>
        <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
          See how your theme looks with different components
        </p>
      </ThemedCardHeader>
      <ThemedCardContent className="space-y-8">
        {/* Global Header Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Global Header</h3>
          <div
            className="flex items-center justify-between transition-all duration-200 p-4 border rounded-lg"
            style={{
              background: `hsl(${theme.colors.surface})`,
              color: `hsl(${theme.colors.text})`,
              borderColor: `hsl(${theme.colors.border})`
            }}
          >
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded font-bold text-sm flex items-center justify-center"
                style={{ 
                  background: `hsl(${theme.colors.primary})`, 
                  color: `hsl(${theme.colors.background})` 
                }}
              >
                RL
              </div>
              <span className="text-xl font-[var(--theme-font-heading)] font-bold">RapperLegends</span>
            </div>

            {/* Mobile Menu & User Actions */}
            <div className="flex items-center space-x-4">
              <button
                className="p-2 rounded-lg transition-opacity hover:opacity-80 lg:hidden"
                style={{ background: `hsl(${theme.colors.primary})/20` }}
              >
                <Menu size={20} />
              </button>
              <button
                className="px-4 py-2 rounded-lg transition-opacity hover:opacity-80 text-sm font-medium"
                style={{ 
                  background: `hsl(${theme.colors.primary})`, 
                  color: `hsl(${theme.colors.background})` 
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Navigation</h3>
          <div
            className="transition-all duration-200 p-4 border rounded-lg"
            style={{
              background: `hsl(${theme.colors.surface})`,
              color: `hsl(${theme.colors.text})`,
              borderColor: `hsl(${theme.colors.border})`
            }}
          >
            <nav className="flex flex-wrap gap-6">
              <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Home size={18} />
                <span>Home</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Trophy size={18} />
                <span>Rankings</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Users size={18} />
                <span>All Rappers</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <BarChart3 size={18} />
                <span>Analytics</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <User size={18} />
                <span>Profile</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Typography Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Typography</h3>
          <div className="space-y-3">
            <h1 
              className="font-[var(--theme-font-heading)] text-[var(--theme-primary)]"
              style={{
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight,
                lineHeight: theme.typography.h1.lineHeight,
                letterSpacing: theme.typography.h1.letterSpacing,
                textTransform: theme.typography.h1.textTransform
              }}
            >
              Main Heading (H1)
            </h1>
            <h2 
              className="font-[var(--theme-font-heading)] text-[var(--theme-text)]"
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                lineHeight: theme.typography.h2.lineHeight,
                letterSpacing: theme.typography.h2.letterSpacing,
                textTransform: theme.typography.h2.textTransform
              }}
            >
              Secondary Heading (H2)
            </h2>
            <h3
              className="font-[var(--theme-font-heading)] text-[var(--theme-text)]"
              style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                lineHeight: theme.typography.h3.lineHeight
              }}
            >
              Section Heading (H3)
            </h3>
            <p 
              className="font-[var(--theme-font-body)] text-[var(--theme-text)]"
              style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: theme.typography.body.fontWeight,
                lineHeight: theme.typography.body.lineHeight
              }}
            >
              Body text using the body font. This is how regular content will appear throughout the application.
            </p>
            <p 
              className="font-[var(--theme-font-display)] text-[var(--theme-primary)]"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600'
              }}
            >
              Display text for special emphasis and branding.
            </p>
            <code 
              className="font-[var(--theme-font-code)] text-[var(--theme-textMuted)] bg-[var(--theme-surface)] px-2 py-1 rounded inline-block"
              style={{
                fontSize: theme.typography.code.fontSize,
                fontWeight: theme.typography.code.fontWeight,
                lineHeight: theme.typography.code.lineHeight
              }}
            >
              Code font for technical content
            </code>
          </div>
        </div>

        {/* Button Elements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Button Elements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemedButton variant="default">
              Primary Button
            </ThemedButton>
            <ThemedButton variant="secondary">
              Secondary Button
            </ThemedButton>
            <ThemedButton variant="accent">
              Accent Button
            </ThemedButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemedButton variant="outline">
              Outline Button
            </ThemedButton>
            <ThemedButton variant="gradient">
              Gradient Button
            </ThemedButton>
          </div>
        </div>

        {/* Card Element */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Card Element</h3>
          <ThemedCard>
            <ThemedCardHeader>
              <ThemedCardTitle>Sample Card</ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <p className="text-sm opacity-90 mb-3">
                This is a sample card component showing how cards will appear with your theme settings.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Tag 1</Badge>
                <Badge variant="outline" className="text-xs">Tag 2</Badge>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </div>

        {/* Input Element */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Input Element</h3>
          <ThemedInput
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full"
            placeholder="Sample input field"
          />
        </div>

        {/* Footer Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Footer</h3>
          <div
            className="transition-all duration-200 p-6 border rounded-lg"
            style={{
              background: `hsl(${theme.colors.background})`,
              color: `hsl(${theme.colors.text})`,
              borderColor: `hsl(${theme.colors.border})`
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3 font-[var(--theme-font-heading)]">RapperLegends</h4>
                <p className="text-sm opacity-80">The ultimate destination for ranking your favorite rap artists.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 font-[var(--theme-font-heading)]">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:opacity-80 transition-opacity">About</a></li>
                  <li><a href="#" className="hover:opacity-80 transition-opacity">Privacy Policy</a></li>
                  <li><a href="#" className="hover:opacity-80 transition-opacity">Terms of Use</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 font-[var(--theme-font-heading)]">Community</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:opacity-80 transition-opacity">Rankings</a></li>
                  <li><a href="#" className="hover:opacity-80 transition-opacity">All Rappers</a></li>
                  <li><a href="#" className="hover:opacity-80 transition-opacity">VS Matches</a></li>
                </ul>
              </div>
            </div>
            <div 
              className="mt-6 pt-6 border-t text-center text-sm opacity-60" 
              style={{ borderColor: `hsl(${theme.colors.border})` }}
            >
              © 2024 RapperLegends. All rights reserved.
            </div>
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default EnhancedThemePreview;