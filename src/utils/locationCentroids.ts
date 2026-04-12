export interface Centroid {
  lat: number;
  lng: number;
}

// US state centroids
export const US_STATE_CENTROIDS: Record<string, Centroid> = {
  "Alabama": { lat: 32.806671, lng: -86.791130 },
  "Alaska": { lat: 61.370716, lng: -152.404419 },
  "Arizona": { lat: 33.729759, lng: -111.431221 },
  "Arkansas": { lat: 34.969704, lng: -92.373123 },
  "California": { lat: 36.116203, lng: -119.681564 },
  "Colorado": { lat: 39.059811, lng: -105.311104 },
  "Connecticut": { lat: 41.597782, lng: -72.755371 },
  "Delaware": { lat: 39.318523, lng: -75.507141 },
  "District of Columbia": { lat: 38.897438, lng: -77.026817 },
  "Florida": { lat: 27.766279, lng: -81.686783 },
  "Georgia": { lat: 33.040619, lng: -83.643074 },
  "Hawaii": { lat: 21.094318, lng: -157.498337 },
  "Idaho": { lat: 44.240459, lng: -114.478828 },
  "Illinois": { lat: 40.349457, lng: -88.986137 },
  "Indiana": { lat: 39.849426, lng: -86.258278 },
  "Iowa": { lat: 42.011539, lng: -93.210526 },
  "Kansas": { lat: 38.526600, lng: -96.726486 },
  "Kentucky": { lat: 37.668140, lng: -84.670067 },
  "Louisiana": { lat: 31.169546, lng: -91.867805 },
  "Maine": { lat: 44.693947, lng: -69.381927 },
  "Maryland": { lat: 39.063946, lng: -76.802101 },
  "Massachusetts": { lat: 42.230171, lng: -71.530106 },
  "Michigan": { lat: 43.326618, lng: -84.536095 },
  "Minnesota": { lat: 45.694454, lng: -93.900192 },
  "Mississippi": { lat: 32.741646, lng: -89.678696 },
  "Missouri": { lat: 38.456085, lng: -92.288368 },
  "Montana": { lat: 46.921925, lng: -110.454353 },
  "Nebraska": { lat: 41.125370, lng: -98.268082 },
  "Nevada": { lat: 38.313515, lng: -117.055374 },
  "New Hampshire": { lat: 43.452492, lng: -71.563896 },
  "New Jersey": { lat: 40.298904, lng: -74.521011 },
  "New Mexico": { lat: 34.840515, lng: -106.248482 },
  "New York": { lat: 42.165726, lng: -74.948051 },
  "North Carolina": { lat: 35.630066, lng: -79.806419 },
  "North Dakota": { lat: 47.528912, lng: -99.784012 },
  "Ohio": { lat: 40.388783, lng: -82.764915 },
  "Oklahoma": { lat: 35.565342, lng: -96.928917 },
  "Oregon": { lat: 44.572021, lng: -122.070938 },
  "Pennsylvania": { lat: 40.590752, lng: -77.209755 },
  "Rhode Island": { lat: 41.680893, lng: -71.511780 },
  "South Carolina": { lat: 33.856892, lng: -80.945007 },
  "South Dakota": { lat: 44.299782, lng: -99.438828 },
  "Tennessee": { lat: 35.747845, lng: -86.692345 },
  "Texas": { lat: 31.054487, lng: -97.563461 },
  "Utah": { lat: 40.150032, lng: -111.862434 },
  "Vermont": { lat: 44.045876, lng: -72.710686 },
  "Virginia": { lat: 37.769337, lng: -78.169968 },
  "Washington": { lat: 47.400902, lng: -121.490494 },
  "West Virginia": { lat: 38.491226, lng: -80.954453 },
  "Wisconsin": { lat: 44.268543, lng: -89.616508 },
  "Wyoming": { lat: 42.755966, lng: -107.302490 },
};

// Country centroids (ISO 2-letter code -> centroid)
export const COUNTRY_CENTROIDS: Record<string, Centroid> = {
  "US": { lat: 39.8283, lng: -98.5795 },
  "CA": { lat: 56.1304, lng: -106.3468 },
  "MX": { lat: 23.6345, lng: -102.5528 },
  "GB": { lat: 55.3781, lng: -3.4360 },
  "DE": { lat: 51.1657, lng: 10.4515 },
  "FR": { lat: 46.2276, lng: 2.2137 },
  "ES": { lat: 40.4637, lng: -3.7492 },
  "IT": { lat: 41.8719, lng: 12.5674 },
  "PT": { lat: 39.3999, lng: -8.2245 },
  "NL": { lat: 52.1326, lng: 5.2913 },
  "BE": { lat: 50.5039, lng: 4.4699 },
  "SE": { lat: 60.1282, lng: 18.6435 },
  "NO": { lat: 60.4720, lng: 8.4689 },
  "DK": { lat: 56.2639, lng: 9.5018 },
  "FI": { lat: 61.9241, lng: 25.7482 },
  "PL": { lat: 51.9194, lng: 19.1451 },
  "AT": { lat: 47.5162, lng: 14.5501 },
  "CH": { lat: 46.8182, lng: 8.2275 },
  "IE": { lat: 53.1424, lng: -7.6921 },
  "RU": { lat: 61.5240, lng: 105.3188 },
  "UA": { lat: 48.3794, lng: 31.1656 },
  "TR": { lat: 38.9637, lng: 35.2433 },
  "BR": { lat: -14.2350, lng: -51.9253 },
  "AR": { lat: -38.4161, lng: -63.6167 },
  "CO": { lat: 4.5709, lng: -74.2973 },
  "CL": { lat: -35.6751, lng: -71.5430 },
  "PE": { lat: -9.1900, lng: -75.0152 },
  "JP": { lat: 36.2048, lng: 138.2529 },
  "KR": { lat: 35.9078, lng: 127.7669 },
  "CN": { lat: 35.8617, lng: 104.1954 },
  "IN": { lat: 20.5937, lng: 78.9629 },
  "AU": { lat: -25.2744, lng: 133.7751 },
  "NZ": { lat: -40.9006, lng: 174.8860 },
  "ZA": { lat: -30.5595, lng: 22.9375 },
  "NG": { lat: 9.0820, lng: 8.6753 },
  "KE": { lat: -0.0236, lng: 37.9062 },
  "EG": { lat: 26.8206, lng: 30.8025 },
  "GH": { lat: 7.9465, lng: -1.0232 },
  "PH": { lat: 12.8797, lng: 121.7740 },
  "ID": { lat: -0.7893, lng: 113.9213 },
  "MY": { lat: 4.2105, lng: 101.9758 },
  "TH": { lat: 15.8700, lng: 100.9925 },
  "VN": { lat: 14.0583, lng: 108.2772 },
  "SG": { lat: 1.3521, lng: 103.8198 },
  "SA": { lat: 23.8859, lng: 45.0792 },
  "AE": { lat: 23.4241, lng: 53.8478 },
  "IL": { lat: 31.0461, lng: 34.8516 },
  "PK": { lat: 30.3753, lng: 69.3451 },
  "BD": { lat: 23.6850, lng: 90.3563 },
  "JM": { lat: 18.1096, lng: -77.2975 },
  "TT": { lat: 10.6918, lng: -61.2225 },
  "PR": { lat: 18.2208, lng: -66.5901 },
  "CU": { lat: 21.5218, lng: -77.7812 },
  "DO": { lat: 18.7357, lng: -70.1627 },
  "HT": { lat: 18.9712, lng: -72.2852 },
  "GR": { lat: 39.0742, lng: 21.8243 },
  "RO": { lat: 45.9432, lng: 24.9668 },
  "CZ": { lat: 49.8175, lng: 15.4730 },
  "HU": { lat: 47.1625, lng: 19.5033 },
};

/**
 * Resolve a location to its centroid coordinates.
 * For US users, tries state name first. For all, tries country code.
 */
export function getLocationCentroid(
  countryCode: string | null,
  region: string | null
): Centroid | null {
  // For US users, try state-level centroid
  if (countryCode === "US" && region) {
    const stateCentroid = US_STATE_CENTROIDS[region];
    if (stateCentroid) return stateCentroid;
  }

  // Fall back to country centroid
  if (countryCode) {
    const countryCentroid = COUNTRY_CENTROIDS[countryCode];
    if (countryCentroid) return countryCentroid;
  }

  return null;
}
