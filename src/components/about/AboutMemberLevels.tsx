import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Crown, Star } from "lucide-react";

const levels = [
  { name: "Bronze", minXP: 0, maxXP: 499, color: "from-amber-700 to-amber-600", textColor: "text-amber-600", multiplier: "1x" },
  { name: "Silver", minXP: 500, maxXP: 1499, color: "from-gray-400 to-gray-300", textColor: "text-gray-400", multiplier: "2x" },
  { name: "Gold", minXP: 1500, maxXP: 3499, color: "from-yellow-500 to-yellow-400", textColor: "text-yellow-500", multiplier: "3x" },
  { name: "Platinum", minXP: 3500, maxXP: 6999, color: "from-slate-300 to-white", textColor: "text-slate-300", multiplier: "4x" },
  { name: "Diamond", minXP: 7000, maxXP: null, color: "from-cyan-400 to-cyan-300", textColor: "text-cyan-400", multiplier: "5x" },
];

const AboutMemberLevels = () => {
  const totalXP = 7000;
  
  return (
    <ThemedCard variant="dark">
      <ThemedCardHeader>
        <ThemedCardTitle className="text-5xl font-normal flex items-center gap-3">
          <Crown className="w-10 h-10 text-[var(--theme-primary)]" />
          Member Levels
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent className="space-y-6">
        <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
          Earn experience points (XP) by participating in the community. As you level up, your vote power increases!
        </p>

        {/* Segmented Progress Bar */}
        <div className="space-y-3">
          <div className="flex h-8 rounded-lg overflow-hidden border-2 border-[hsl(var(--theme-primary))]/30">
            {levels.map((level, index) => {
              const width = level.maxXP 
                ? ((level.maxXP - level.minXP + 1) / totalXP) * 100
                : 15; // Diamond gets extra visual space
              
              return (
                <div
                  key={level.name}
                  className={`bg-gradient-to-r ${level.color} flex items-center justify-center relative group`}
                  style={{ width: `${width}%` }}
                >
                  <span className="text-xs font-bold text-black/80 hidden sm:block">
                    {level.name}
                  </span>
                  {index < levels.length - 1 && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-black/30" />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* XP Markers */}
          <div className="flex justify-between text-xs text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
            <span>0 XP</span>
            <span>500</span>
            <span>1,500</span>
            <span>3,500</span>
            <span>7,000+</span>
          </div>
        </div>

        {/* Level Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          {levels.map((level) => (
            <div
              key={level.name}
              className="bg-[hsl(var(--theme-surface))] border border-[hsl(var(--theme-primary))]/20 rounded-lg p-3 text-center"
            >
              <div className={`font-[var(--theme-font-heading)] font-bold ${level.textColor} mb-1`}>
                {level.name}
              </div>
              <div className="text-xs text-[var(--theme-textMuted)] font-[var(--theme-font-body)] mb-2">
                {level.maxXP ? `${level.minXP.toLocaleString()} - ${level.maxXP.toLocaleString()}` : `${level.minXP.toLocaleString()}+`} XP
              </div>
              <div className="flex items-center justify-center gap-1 text-[var(--theme-primary)]">
                <Star className="w-3 h-3" />
                <span className="text-sm font-bold">{level.multiplier} Vote Power</span>
              </div>
            </div>
          ))}
        </div>

        {/* How to Earn XP */}
        <div className="mt-6 p-4 bg-[hsl(var(--theme-surface))] rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <h3 className="font-[var(--theme-font-heading)] text-[var(--theme-textLight)] mb-3">Ways to Earn XP</h3>
          <ul className="space-y-2 text-[var(--theme-text)] font-[var(--theme-font-body)] text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)]" />
              <span><strong>+10 XP</strong> for each session visit</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)]" />
              <span><strong>+5-50 XP</strong> for unlocking achievements</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)]" />
              <span><strong>+100-4,000 XP</strong> for milestone achievements</span>
            </li>
          </ul>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default AboutMemberLevels;
