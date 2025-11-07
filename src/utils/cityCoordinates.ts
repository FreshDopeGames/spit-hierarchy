// City coordinate lookup for mapping rapper origins
export interface CityCoordinate {
  lat: number;
  lng: number;
}

export const cityCoordinates: Record<string, CityCoordinate> = {
  // New York
  "Brooklyn, NY": { lat: 40.6782, lng: -73.9442 },
  "Queens, NY": { lat: 40.7282, lng: -73.7949 },
  "Harlem, NY": { lat: 40.8116, lng: -73.9465 },
  "Manhattan, NY": { lat: 40.7831, lng: -73.9712 },
  "Bronx, NY": { lat: 40.8448, lng: -73.8648 },
  "Staten Island, NY": { lat: 40.5795, lng: -74.1502 },
  "New York, NY": { lat: 40.7128, lng: -74.0060 },
  
  // California
  "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
  "Compton, CA": { lat: 33.8958, lng: -118.2201 },
  "Oakland, CA": { lat: 37.8044, lng: -122.2712 },
  "San Francisco, CA": { lat: 37.7749, lng: -122.4194 },
  "Long Beach, CA": { lat: 33.7701, lng: -118.1937 },
  "Sacramento, CA": { lat: 38.5816, lng: -121.4944 },
  "San Diego, CA": { lat: 32.7157, lng: -117.1611 },
  "Vallejo, CA": { lat: 38.1041, lng: -122.2566 },
  "Inglewood, CA": { lat: 33.9617, lng: -118.3531 },
  
  // Georgia
  "Atlanta, GA": { lat: 33.7490, lng: -84.3880 },
  "Decatur, GA": { lat: 33.7748, lng: -84.2963 },
  "East Point, GA": { lat: 33.6793, lng: -84.4394 },
  
  // Illinois
  "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
  
  // Michigan
  "Detroit, MI": { lat: 42.3314, lng: -83.0458 },
  "Flint, MI": { lat: 43.0125, lng: -83.6875 },
  
  // Texas
  "Houston, TX": { lat: 29.7604, lng: -95.3698 },
  "Dallas, TX": { lat: 32.7767, lng: -96.7970 },
  "San Antonio, TX": { lat: 29.4241, lng: -98.4936 },
  "Austin, TX": { lat: 30.2672, lng: -97.7431 },
  
  // Florida
  "Miami, FL": { lat: 25.7617, lng: -80.1918 },
  "Miami Beach, FL": { lat: 25.7907, lng: -80.1300 },
  "Jacksonville, FL": { lat: 30.3322, lng: -81.6557 },
  "Tampa, FL": { lat: 27.9506, lng: -82.4572 },
  "Orlando, FL": { lat: 28.5383, lng: -81.3792 },
  
  // Pennsylvania
  "Philadelphia, PA": { lat: 39.9526, lng: -75.1652 },
  "Pittsburgh, PA": { lat: 40.4406, lng: -79.9959 },
  
  // Louisiana
  "New Orleans, LA": { lat: 29.9511, lng: -90.0715 },
  "Baton Rouge, LA": { lat: 30.4515, lng: -91.1871 },
  
  // Maryland
  "Baltimore, MD": { lat: 39.2904, lng: -76.6122 },
  
  // Tennessee
  "Memphis, TN": { lat: 35.1495, lng: -90.0490 },
  "Nashville, TN": { lat: 36.1627, lng: -86.7816 },
  
  // North Carolina
  "Charlotte, NC": { lat: 35.2271, lng: -80.8431 },
  "Raleigh, NC": { lat: 35.7796, lng: -78.6382 },
  
  // Ohio
  "Cleveland, OH": { lat: 41.4993, lng: -81.6944 },
  "Cincinnati, OH": { lat: 39.1031, lng: -84.5120 },
  "Columbus, OH": { lat: 39.9612, lng: -82.9988 },
  
  // Washington
  "Seattle, WA": { lat: 47.6062, lng: -122.3321 },
  "Tacoma, WA": { lat: 47.2529, lng: -122.4443 },
  
  // Missouri
  "St. Louis, MO": { lat: 38.6270, lng: -90.1994 },
  "Kansas City, MO": { lat: 39.0997, lng: -94.5786 },
  
  // Virginia
  "Virginia Beach, VA": { lat: 36.8529, lng: -75.9780 },
  "Richmond, VA": { lat: 37.5407, lng: -77.4360 },
  
  // Massachusetts
  "Boston, MA": { lat: 42.3601, lng: -71.0589 },
  
  // Minnesota
  "Minneapolis, MN": { lat: 44.9778, lng: -93.2650 },
  
  // Wisconsin
  "Milwaukee, WI": { lat: 43.0389, lng: -87.9065 },
  
  // Canada
  "Toronto, ON": { lat: 43.6532, lng: -79.3832 },
  "Montreal, QC": { lat: 45.5017, lng: -73.5673 },
  "Vancouver, BC": { lat: 49.2827, lng: -123.1207 },
  "Calgary, AB": { lat: 51.0447, lng: -114.0719 },
  "Ottawa, ON": { lat: 45.4215, lng: -75.6972 },
};

export const getCityCoordinate = (cityName: string): CityCoordinate | null => {
  return cityCoordinates[cityName] || null;
};
