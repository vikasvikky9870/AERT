/**
 * AERT 3.0 Map Lab — Dark Operational Google Maps Styling
 * Sector: Srikakulam District, Andhra Pradesh, India
 * 
 * Cinematic nocturnal palette designed for emergency situational awareness.
 */

export const DARK_OPERATIONAL_GOOGLE_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#080d14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#06090e" }, { weight: 2 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#748698" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00f0ff" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#141f2d" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0a111a" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1a324b" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#050b12" }, { weight: 1.5 }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00f0ff" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#162536" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0f1a26" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#021220" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2f506e" }]
  }
];
