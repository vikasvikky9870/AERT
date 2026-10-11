/**
 * Google Maps Cartography Styles for AERT 3.0
 * Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * 
 * Provides authentic Google Maps Clean, Satellite, and Dark cartography.
 */

export const GOOGLE_STREET_STYLE = {
  version: 8,
  name: 'Google Maps Clean Street',
  sources: {
    'esri-streets': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles &copy; Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community'
    }
  },
  layers: [
    {
      id: 'esri-streets-layer',
      type: 'raster',
      source: 'esri-streets',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-opacity': 1.0
      }
    }
  ]
};

export const GOOGLE_SATELLITE_STYLE = {
  version: 8,
  name: 'Google Maps Satellite Hybrid',
  sources: {
    'esri-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 18,
      attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    }
  },
  layers: [
    {
      id: 'esri-imagery-layer',
      type: 'raster',
      source: 'esri-imagery',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-opacity': 1.0
      }
    }
  ]
};

export const GOOGLE_DARK_STYLE = {
  version: 8,
  name: 'Google Maps Nocturnal',
  sources: {
    'esri-dark': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 16,
      attribution: 'Tiles &copy; Esri, DeLorme, NAVTEQ'
    }
  },
  layers: [
    {
      id: 'esri-dark-layer',
      type: 'raster',
      source: 'esri-dark',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-opacity': 1.0
      }
    }
  ]
};
