
export const rarityOrder = {
  'common': 1,
  'rare': 2,
  'epic': 3,
  'legendary': 4
} as const;

export const sortAchievementsByRarity = (achievements: any[]) => {
  return achievements.sort((a, b) => {
    const rarityA = rarityOrder[a.rarity as keyof typeof rarityOrder] || 5;
    const rarityB = rarityOrder[b.rarity as keyof typeof rarityOrder] || 5;
    
    // Primary sort: rarity (least to most rare)
    if (rarityA !== rarityB) {
      return rarityA - rarityB;
    }
    
    // Secondary sort: points (ascending for same rarity)
    return a.points - b.points;
  });
};
