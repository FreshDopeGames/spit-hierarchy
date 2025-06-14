
export const getZodiacSign = (month: number | null, day: number | null): string => {
  if (!month || !day) return '';
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces ♓';
  
  return '';
};

// Get just the zodiac name without the symbol
export const getZodiacName = (month: number | null, day: number | null): string => {
  const fullSign = getZodiacSign(month, day);
  return fullSign.split(' ')[0]; // Returns just "Aries", "Taurus", etc.
};

// Get just the zodiac symbol
export const getZodiacSymbol = (month: number | null, day: number | null): string => {
  const fullSign = getZodiacSign(month, day);
  const parts = fullSign.split(' ');
  return parts.length > 1 ? parts[1] : ''; // Returns just "♈", "♉", etc.
};

export const formatBirthdate = (year: number | null, month: number | null, day: number | null): string => {
  if (!month || !day) return '';
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[month - 1];
  const yearText = year ? `, ${year}` : '';
  
  return `${monthName} ${day}${yearText}`;
};

// Helper function to get zodiac element
export const getZodiacElement = (month: number | null, day: number | null): string => {
  const sign = getZodiacName(month, day);
  if (!sign) return '';

  // Fire signs
  if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) return 'Fire';
  // Earth signs  
  if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) return 'Earth';
  // Air signs
  if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) return 'Air';
  // Water signs
  if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) return 'Water';
  
  return '';
};

// Helper function to get zodiac compatibility description
export const getZodiacDescription = (month: number | null, day: number | null): string => {
  const sign = getZodiacName(month, day);
  if (!sign) return '';

  const descriptions: { [key: string]: string } = {
    'Aries': 'Bold, pioneering, and energetic - natural leaders in hip-hop',
    'Taurus': 'Steady, reliable, and strong-willed - masters of their craft',
    'Gemini': 'Versatile, witty, and communicative - wordplay wizards',
    'Cancer': 'Emotional, intuitive, and protective - storytellers of the streets',
    'Leo': 'Confident, dramatic, and generous - born performers and entertainers',
    'Virgo': 'Analytical, perfectionist, and detail-oriented - technical masters',
    'Libra': 'Balanced, diplomatic, and artistic - smooth flow and harmony',
    'Scorpio': 'Intense, passionate, and mysterious - deep, transformative lyrics',
    'Sagittarius': 'Adventurous, philosophical, and honest - truth-telling artists',
    'Capricorn': 'Ambitious, disciplined, and practical - business-minded moguls',
    'Aquarius': 'Independent, innovative, and humanitarian - revolutionary voices',
    'Pisces': 'Creative, empathetic, and intuitive - emotional and artistic souls'
  };

  return descriptions[sign] || '';
};

// Helper function to get zodiac date ranges
export const getZodiacDateRange = (signName: string): string => {
  const dateRanges: { [key: string]: string } = {
    'Aries': 'Mar 21 - Apr 19',
    'Taurus': 'Apr 20 - May 20',
    'Gemini': 'May 21 - Jun 20',
    'Cancer': 'Jun 21 - Jul 22',
    'Leo': 'Jul 23 - Aug 22',
    'Virgo': 'Aug 23 - Sep 22',
    'Libra': 'Sep 23 - Oct 22',
    'Scorpio': 'Oct 23 - Nov 21',
    'Sagittarius': 'Nov 22 - Dec 21',
    'Capricorn': 'Dec 22 - Jan 19',
    'Aquarius': 'Jan 20 - Feb 18',
    'Pisces': 'Feb 19 - Mar 20'
  };
  
  return dateRanges[signName] || '';
};

// Helper function to get all zodiac signs information
export const getAllZodiacSigns = () => {
  return [
    { name: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19', color: 'bg-red-500' },
    { name: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20', color: 'bg-green-500' },
    { name: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20', color: 'bg-yellow-500' },
    { name: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22', color: 'bg-blue-500' },
    { name: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22', color: 'bg-orange-500' },
    { name: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22', color: 'bg-emerald-500' },
    { name: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22', color: 'bg-pink-500' },
    { name: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21', color: 'bg-purple-500' },
    { name: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21', color: 'bg-indigo-500' },
    { name: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19', color: 'bg-gray-500' },
    { name: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18', color: 'bg-cyan-500' },
    { name: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20', color: 'bg-teal-500' }
  ];
};
