
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
  const sign = getZodiacSign(month, day);
  if (!sign) return '';

  // Fire signs
  if (sign.includes('Aries') || sign.includes('Leo') || sign.includes('Sagittarius')) return 'Fire';
  // Earth signs  
  if (sign.includes('Taurus') || sign.includes('Virgo') || sign.includes('Capricorn')) return 'Earth';
  // Air signs
  if (sign.includes('Gemini') || sign.includes('Libra') || sign.includes('Aquarius')) return 'Air';
  // Water signs
  if (sign.includes('Cancer') || sign.includes('Scorpio') || sign.includes('Pisces')) return 'Water';
  
  return '';
};

// Helper function to get zodiac compatibility description
export const getZodiacDescription = (month: number | null, day: number | null): string => {
  const sign = getZodiacSign(month, day);
  if (!sign) return '';

  const descriptions: { [key: string]: string } = {
    'Aries ♈': 'Bold, pioneering, and energetic - natural leaders in hip-hop',
    'Taurus ♉': 'Steady, reliable, and strong-willed - masters of their craft',
    'Gemini ♊': 'Versatile, witty, and communicative - wordplay wizards',
    'Cancer ♋': 'Emotional, intuitive, and protective - storytellers of the streets',
    'Leo ♌': 'Confident, dramatic, and generous - born performers and entertainers',
    'Virgo ♍': 'Analytical, perfectionist, and detail-oriented - technical masters',
    'Libra ♎': 'Balanced, diplomatic, and artistic - smooth flow and harmony',
    'Scorpio ♏': 'Intense, passionate, and mysterious - deep, transformative lyrics',
    'Sagittarius ♐': 'Adventurous, philosophical, and honest - truth-telling artists',
    'Capricorn ♑': 'Ambitious, disciplined, and practical - business-minded moguls',
    'Aquarius ♒': 'Independent, innovative, and humanitarian - revolutionary voices',
    'Pisces ♓': 'Creative, empathetic, and intuitive - emotional and artistic souls'
  };

  return descriptions[sign] || '';
};
