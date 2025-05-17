const map = new maplibregl.Map({
  container: "map",
  hash: 'map',
  center: [12, 50],
  zoom: 6,
  style: {
      version: 8,
      sources: {},
      layers: []
    }
});

const geocoderApi = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
      const response = await fetch(request, {
        headers: {
          Referer: "fossgis-hackweekend-development :-)",
        },
      });
      const geojson = await response.json();
      for (const feature of geojson.features) {
        const center = [
          feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
          feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
        ];
        const point = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: center,
          },
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ["place"],
          center,
        };
        features.push(point);
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    return {
      features,
    };
  },
};
map.addControl(
  new MaplibreGeocoder(geocoderApi, {
    maplibregl,
  }),
  "top-left"
);

map.addControl(
  new MaplibreGLBasemapsControl({
    basemaps: [
      {
        id: "osm-tiles-de",
        tiles: [
          "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
        ],
        sourceExtraParams: {
          tileSize: 256,
          attribution: "Kartendaten von OpenStreetMap",
          minzoom: 0,
          maxzoom: 20,
        },
      },
      {
        id: "OpenStreetMap",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        sourceExtraParams: {
          tileSize: 256,
          attribution: "&copy; OpenStreetMap Contributors",
          minzoom: 0,
          maxzoom: 20,
        },
      },
    ],
    initialBasemap: "OpenStreetMap",
    expandDirection: "top",
  }),
  "top-right"
);

const scale = new maplibregl.ScaleControl();
map.addControl(scale);

const nav = new maplibregl.NavigationControl(
  {showCompass: false}
);
map.addControl(nav, 'top-left');

map.dragRotate.disable();               
map.touchZoomRotate.disableRotation(); 
