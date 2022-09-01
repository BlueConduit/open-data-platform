<template>
  <div class='container' :style='cssVars'>
    <div id='map-container'></div>
    <MapLegend :style='legendStyle' />
  </div>
</template>

<script lang='ts'>
import mapboxgl, { LngLatBounds, LngLatLike, MapLayerMouseEvent } from 'mapbox-gl';
import MapLegend from './MapLegend.vue';
import MapPopupContent from './MapPopupContent.vue';
import { createApp, defineComponent, nextTick, PropType } from 'vue';
import { DataLayer, FeatureProperty, GeographicLevel, MapLayer } from '../model/data_layer';
import { router, SCORECARD_BASE } from '../router';
import { dispatch, useSelector } from '../model/store';
import { GeoDataState } from '../model/states/geo_data_state';
import { MapDataState } from '../model/states/map_data_state';
import { ALL_DATA_LAYERS, setCurrentDataLayer, setZoom } from '../model/slices/map_data_slice';
import { GeoType } from '../model/states/model/geo_data';

const DEFAULT_LNG_LAT = [-98.5556199, 39.8097343];

const POPUP_CONTENT_BASE_ID = 'popup-content';
const POPUP_CONTENT_BASE_HTML = `<div id='${POPUP_CONTENT_BASE_ID}'></div>`;
const VISIBILITY = 'visibility';
const VISIBLE = 'visible';

const PARCEL_ZOOM_LEVEL = 16;
const DEFAULT_ZOOM_LEVEL = 4;

// Define Toledo geometry bounding box to restrict parcel data layer to Toledo.
// This is needed because we only have parcel-level predictions for Toledo, so this data layer will
// be empty outside of these boundaries.
const TOLEDO_BOUNDS: [LngLatLike, LngLatLike] = [
  [-84.3995471043526, 41.165751],
  [-82.711584, 41.742764],
];

/**
 * A browsable map of nationwide lead data.
 */
export default defineComponent({
  name: 'NationwideMap',
  components: {
    MapLegend,
  },
  setup() {
    mapboxgl.accessToken = process.env.VUE_APP_MAP_BOX_API_TOKEN ?? '';

    // Listen to geoState updates.
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const mapState = useSelector((state) => state.mapData) as MapDataState;

    return {
      geoState,
      mapState,
      legendStyle: {
        display: 'block',
        position: 'absolute',
        bottom: '0px',
        right: '0px',
      },
    };
  },
  data() {
    return {
      map: null as mapboxgl.Map | null,
      marker: null as mapboxgl.Marker | null,
      popup: null as mapboxgl.Popup | null,
    };
  },
  computed: {
    cssVars() {
      return {
        '--height': this.height,
      };
    },
    currentDataLayerId() {
      return this.mapState?.mapData?.currentDataLayerId;
    },
    visibleLayer() {
      return this.possibleLayers?.find(
        (l) =>
          this.map?.getLayer(l.styleLayer.id) != null &&
          this.map?.getLayoutProperty(l.styleLayer.id, VISIBILITY) == VISIBLE,
      );
    },
    /**
     * Represents the current layer that should be shown based on the url
     * query parameter.
     */
    routerLayer() {
      return router.currentRoute.value.query.layer ?? null;
    },
    // TODO: Replace with only the layers in the map data. Here and everywhere
    // there is reference to ALL_LAYERS.
    possibleLayers() {
      return Array.from(ALL_DATA_LAYERS.values());
    },
  },
  props: {
    /**
     * Where to load the initial map. Defaults to center of continental US.
     */
    center: {
      // There is no constructor function for a Tuple, so use object here and
      // cast to PropType of a tuple.
      // See https://vuejs.org/guide/typescript/options-api.html#typing-component-props.
      type: Object as PropType<[number, number]>,
      default: DEFAULT_LNG_LAT,
    },
    height: { type: String, default: '80vh' },
    /**
     * Whether to disable some controls and animations.
     */
    scorecard: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getLngLatFromState(): LngLatLike | null {
      const lat = this.geoState?.geoids?.lat;
      const long = this.geoState?.geoids?.long;
      if (!lat || !long) return null;
      return { lon: parseFloat(long), lat: parseFloat(lat) };
    },
    zoomToLongLat() {
      const addressBoundingBox = this.geoState?.geoids?.address?.boundingBox;
      const waterSystemBoundingBox = this.geoState?.geoids?.pwsId?.boundingBox;

      const center = this.getLngLatFromState();
      if (!center) return;

      // If there's an address to zoom to, choose that.
      if (addressBoundingBox != null) {
        // TODO: figure out why this sometimes still animates.
        if (this.scorecard) this.map?.jumpTo({
          center,
          zoom: PARCEL_ZOOM_LEVEL,
        });
        else this.map?.flyTo({ center, zoom: PARCEL_ZOOM_LEVEL });

        // Otherwise, default to water system if it's available.
      } else if (waterSystemBoundingBox != null) {
        const sw = new mapboxgl.LngLat(
          waterSystemBoundingBox.minLon,
          waterSystemBoundingBox.minLat,
        );
        const ne = new mapboxgl.LngLat(
          waterSystemBoundingBox.maxLon,
          waterSystemBoundingBox.maxLat,
        );

        this.map?.fitBounds(new LngLatBounds(sw, ne));

        // When there are no bounding boxes available, go to zipcode.
      } else {
        if (this.scorecard) this.map?.jumpTo({
          center,
          zoom: GeographicLevel.Zipcode,
        });
        else this.map?.flyTo({ center, zoom: GeographicLevel.Zipcode });
      }
    },
    /**
     * Sets the visibility of the layer with the given styleLayerId.
     */
    setDataLayerVisible(layerId?: string): void {
      if (this.map == null) return;

      if (this.popup != null) {
        this.popup.remove();
      }

      const layer = ALL_DATA_LAYERS.get(layerId as MapLayer);
      if (layer == null) {
        return;
      }

      const styleLayerId = layer.styleLayer.id;
      this.map.setLayoutProperty(styleLayerId, VISIBILITY, VISIBLE);

      // Hide all other layers.
      const allOtherLayers = Array.from(ALL_DATA_LAYERS.values()).filter((l) => l.id != layerId);
      for (let alternateLayer of allOtherLayers) {
        // Check if layer exists before setting property on it.
        if (this.map.getLayer(alternateLayer.styleLayer.id) != null) {
          this.map.setLayoutProperty(alternateLayer.styleLayer.id, VISIBILITY, 'none');
        }
      }

      // Update the router params when toggling layers to visible. Do not update
      // for leadServiceLinesByParcelLayer, which is not a visible layer.
      const shouldUpdateRouterParam =
        router.currentRoute.value.query.layer != layerId &&
        layerId != MapLayer.LeadServiceLineByParcel;
      if (shouldUpdateRouterParam) {
        router.push({
          query: Object.assign({}, router.currentRoute.value.query, {
            layer: layerId,
          }),
        });
      }
    },

    /**
     * Updates map when injected State's currentDataLayer changes.
     *
     * This will create a map if it does not exist and there is new data, or change the visual
     * layer if the currentDataLayer changes.
     */
    updateMapOnDataLayerChange(newDataLayer?: DataLayer): void {
      if (this.map == null) {
        this.createMap();
      } else {
        this.setDataLayerVisible(newDataLayer?.id);
      }
    },

    /**
     * Creates popup component at the given lngLat.
     *
     * Passes propsData to the MapPopupContent component which is nested in the
     * popup.
     */
    createMapPopup(lngLat: LngLatLike, popupData: Record<string, any>): void {
      if (this.map == null) return;
      this.popup = new mapboxgl.Popup({ className: 'mapbox-popup' })
        .setLngLat(lngLat)
        .setHTML(POPUP_CONTENT_BASE_HTML) // Add basic div to mount to.
        .addTo(this.map);

      // Creates component which extends MapPopupContent and mounts it onto the
      // div passed to the Popup.
      const MapPopup = defineComponent({
        extends: MapPopupContent,
      });
      nextTick((): void => {
        createApp(MapPopup, popupData).mount(`#${POPUP_CONTENT_BASE_ID}`);
      });
    },

    /**
     * Sets up interaction handlers for map.
     */
    setUpInteractionHandlers(): void {
      if (this.map == null) return;
      for (const layer of this.possibleLayers) {
        // Use MapBox's custom click handler, which takes the style layer that we
        // want to set up a handler for as a parameter.
        this.map?.on('click', layer.styleLayer.id, async (e: MapLayerMouseEvent): Promise<void> => {
          if (e.features != null) {
            const clickedFeatureProperties: { [name: string]: any } = e.features[0]
              .properties as {};
            const popupInfo = this.possibleLayers.find(
              (l) => l.id == this.currentDataLayerId,
            )?.popupInfo;

            this.createMapPopup(e.lngLat /* popupData= */, {
              title: popupInfo?.title ?? '',
              subtitle: popupInfo?.subtitle ?? '',
              detailsTitle: popupInfo?.detailsTitle ?? '',
              featureProperties: popupInfo?.featureProperties ?? ([] as FeatureProperty[]),
              properties: new Map(Object.entries(clickedFeatureProperties)),
            });
          }
        });
      }
    },

    /**
     * Set up map controls.
     *
     * This currently consists of the GeolocateControl which sets up
     * functionality to pan to the user's current location.
     */
    setUpControls(): void {
      if (this.map == null) return;

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          // If enabled, gets the best possible results. Can result in slower response times or
          // increased power consumption so set to false for now.
          enableHighAccuracy: false,
        },
        // Receive updates to the device's location as it changes.
        trackUserLocation: true,
      });

      geolocateControl.on('geolocate', (result: any) => {
        console.log('geolocating!');
        console.log(result);
        const lat = result?.coords?.latitude;
        const long = result?.coords?.longitude;

        console.log('CURRENT ROUTE: ' + this.$router?.currentRoute.value);

        this.$router.push(`${SCORECARD_BASE}/${GeoType.address}/${lat},${long}`);
      });

      // Add geolocate control to the map.
      this.map.addControl(geolocateControl);

      // Add zoom in / zoom out buttons to map.
      this.map.addControl(new mapboxgl.NavigationControl());
    },

    /**
     * Set up listener on the zoom level. This is needed to toggle the data
     * source for the Lead Connections layer.
     */
    toggleDataOnZoom(): void {
      if (this.map == null) return;
      dispatch(setZoom(this.map.getZoom()));

      // If zoomed past parcel zoom level, switch to parcel-level data source.
      // Otherwise, switch to water system level.
      if (
        this.map.getZoom() >= PARCEL_ZOOM_LEVEL &&
        this.currentDataLayerId == MapLayer.LeadServiceLineByWaterSystem &&
        this.toledoContainsMap()
      ) {
        dispatch(setCurrentDataLayer(MapLayer.LeadServiceLineByParcel));
      } else if (
        this.map.getZoom() < PARCEL_ZOOM_LEVEL &&
        this.currentDataLayerId == MapLayer.LeadServiceLineByParcel
      ) {
        dispatch(setCurrentDataLayer(MapLayer.LeadServiceLineByWaterSystem));
      }
    },

    /**
     * Whether the map is currently within the bounding box of Toledo.
     *
     * Returns true if the map's northeast and southwest corners fall within the 2D bounding box of
     * Toledo's geometry.
     */
    toledoContainsMap(): boolean {
      if (this.map == null) return false;
      const toledoBounds = new LngLatBounds(TOLEDO_BOUNDS);
      return (
        toledoBounds.contains(this.map.getBounds().getNorthEast()) &&
        toledoBounds.contains(this.map.getBounds().getSouthWest())
      );
    },

    /**
     * Configure data layers and interaction handlers on the map.
     */
    configureMap(): void {
      if (this.map == null) return;

      for (const layer of this.possibleLayers) {
        this.map?.addSource(layer.id, layer.source);
        this.map?.addLayer(layer.styleLayer);
      }

      this.setUpInteractionHandlers();
      this.setUpControls();
      this.map?.on('zoom', this.toggleDataOnZoom);

      // If the map has nothing on it, check the current data layer.
      if (this.visibleLayer == null && this.currentDataLayerId != null) {
        this.updateMapOnDataLayerChange(ALL_DATA_LAYERS.get(this.currentDataLayerId));
      }
    },

    /**
     * Creates base Mapbox map and configures interactions and styles for
     * layers.
     */
    async createMap(): Promise<void> {
      // Start zoomed in for a scorecard to avoid unnecessary tile loads.
      // TODO: pull the zoom level from the geoId in the global state.
      const zoom = this.scorecard ? PARCEL_ZOOM_LEVEL : DEFAULT_ZOOM_LEVEL;
      // The map is created before the state watcher fires, so get the center directly.
      const center = this.getLngLatFromState() ?? this.center;
      this.map = new mapboxgl.Map({
        // Removes watermark by Mapbox.
        attributionControl: false,
        center,
        container: 'map-container',
        style: 'mapbox://styles/blueconduit/cku6hkwe72uzz19s75j1lxw3x?optimize=true',
        zoom,
        dragPan: !this.scorecard,
      });

      this.map?.on('load', this.configureMap);
      this.map?.on('error', (error: any) => {
        console.log(`Error loading tiles: ${error.error} `);
        console.log(error.error.stack);
      });

      this.map?.scrollZoom.disable();
      dispatch(setZoom(zoom));
      this.toggleDataOnZoom();
    },
  },
  mounted() {
    if (this.map == null) this.createMap();
  },
  watch: {
    // Listens to map state to toggle different layers.
    'mapState.mapData.currentDataLayerId': {
      handler: function(newDataLayerId: MapLayer) {
        if (newDataLayerId == null) {
          return;
        }
        this.updateMapOnDataLayerChange(ALL_DATA_LAYERS.get(newDataLayerId));
      },
    },
    // Listen for changes to lat/long to update map location.
    'geoState.geoids': function() {
      // Remove the old marker.
      if (this.marker != null) {
        this.marker.remove();
      }

      const lat = this.geoState?.geoids?.lat;
      const long = this.geoState?.geoids?.long;

      if (lat != null && long != null) {
        this.marker = new mapboxgl.Marker({
          color: '#0b2553',
        });

        if (this.map != null) {
          this.marker.setLngLat([parseFloat(long), parseFloat(lat)]).addTo(this.map);
        }
        this.zoomToLongLat();
      } else {
        // Reset map to full view of U.S. when geo IDs are cleared.
        if (this.map?.isStyleLoaded()) {
          this.map?.jumpTo({
            center: this.center,
            zoom: DEFAULT_ZOOM_LEVEL,
          });
        }
      }
    },
  },
});
</script>

<style>
#map-container {
  height: var(--height);
}

.container {
  position: relative;
}

/** Override Mapbox Popup styles. */

.mapboxgl-popup-content {
  border-radius: 8px;
  min-width: 258px;
  width: fit-content;
  min-height: 256px;
  height: fit-content;
  padding: 18px;
}

.mapboxgl-popup-tip {
  visibility: hidden;
}
</style>
