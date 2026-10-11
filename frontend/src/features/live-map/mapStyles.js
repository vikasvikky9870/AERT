/**
 * AERT 3.0 Dark Tactical MapLibre Style Schema
 * Sector: Srikakulam District, Andhra Pradesh, India
 * 
 * Powered by ESRI World Dark Gray Canvas with maxzoom: 16 overscaling
 * Esri World Dark Gray Canvas raster basemap. Operational overlays are
 * maintained separately and must be marked with their own provenance.
 */

export const TACTICAL_DARK_STYLE = {
  version: 8,
  name: 'AERT Tactical Dark GIS',
  sources: {
    'esri-dark-base': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 16,
      attribution: 'Tiles &copy; Esri, TomTom, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors, and the GIS User Community.'
    }
  },
  layers: [
    {
      id: 'esri-dark-base-layer',
      type: 'raster',
      source: 'esri-dark-base',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-opacity': 1.0,
        'raster-contrast': 0.25,
        'raster-brightness-min': 0.0,
        'raster-brightness-max': 0.95
      }
    }
  ]
};

export const DARK_TACTICAL_STYLE = TACTICAL_DARK_STYLE;
