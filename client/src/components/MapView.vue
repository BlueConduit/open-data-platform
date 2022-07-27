<template>
  <div id='map-container'></div>
  <MapLegend />
</template>

<script lang='ts'>
import mapboxgl from 'mapbox-gl';
import mapbox, { LngLatLike, MapLayerMouseEvent } from 'mapbox-gl';
import MapLegend from '@/components/MapLegend.vue';
import MapPopupContent from '@/components/MapPopupContent.vue';
import { createApp, defineComponent, inject, nextTick, PropType } from 'vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';
import { DataLayer, FeatureProperty, MapLayer } from '../model/data_layer';
import router from '../router';
import { leadServiceLinesByParcelLayer } from '../data_layer_configs/lead_service_lines_by_parcel_config';
import { leadServiceLinesByWaterSystemLayer } from '../data_layer_configs/lead_service_lines_by_water_systems_config';

const DEFAULT_LNG_LAT = [-98.5556199, 39.8097343];

const POPUP_CONTENT_BASE_ID = 'popup-content';
const POPUP_CONTENT_BASE_HTML = `<div id='${POPUP_CONTENT_BASE_ID}'></div>`;

const PARCEL_ZOOM_LEVEL = 12;

export default defineComponent({
  name: 'MapView',
  components: {
    MapLegend,
  },
  setup() {
    // TODO: Hide access tokens. For now, this is MapBox's public API token.
    mapbox.accessToken = process.env.VUE_APP_MAP_BOX_API_TOKEN ?? '';

    const state: State = inject(stateKey, State.default());

    return {
      state,
    };
  },
  data() {
    return {
      map: null as mapboxgl.Map | null,
      popup: null as mapboxgl.Popup | null,
    };
  },
  computed: {
    /**
     * Represents the current layer that should be shown based on the url
     * query parameter.
     */
    routerLayer() {
      return router.currentRoute.value.query.layer ?? null;
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
  },
  methods: {
    /**
     * Sets the visibility of the layer with the given styleLayerId.
     */
    setDataLayerVisibility(styleLayerId: string, visible: boolean): void {
      if (this.map == null) return;

      this.map.setLayoutProperty(styleLayerId, 'visibility', visible ? 'visible' : 'none');

      // Update the router params when toggling layers to visible. Do not update
      // for leadServiceLinesByParcelLayer, which is not a visible layer.
      const shouldUpdateRouterParam = visible &&
        router.currentRoute.value.query.layer != styleLayerId &&
        styleLayerId != leadServiceLinesByParcelLayer.styleLayer.id;
      if (shouldUpdateRouterParam) {
        router.push({ query: Object.assign({}, router.currentRoute.value.query, { layer: styleLayerId }) });
      }
    },

    /**
     * Updates layer visibility based on current data layer.
     */
    toggleLayerVisibility(newDataLayer: DataLayer | null, oldDataLayer: DataLayer | null): void {
      if (this.map == null) return;
      if (this.popup != null) {
        this.popup.remove();
      }

      if (newDataLayer != null) {
        this.setDataLayerVisibility(newDataLayer.styleLayer.id, true);
      }
      if (oldDataLayer != null) {
        this.setDataLayerVisibility(oldDataLayer.styleLayer.id, false);
      }
    },

    /**
     * Updates map when injected State's currentDataLayer changes.
     *
     * This will create a map if it does not exist and there is new data, or change the visual
     * layer if the currentDataLayer changes.
     */
    updateMapOnDataLayerChange(newDataLayer: DataLayer | null, oldDataLayer: DataLayer | null): void {
      if (this.map == null) {
        this.createMap();
      } else {
        this.toggleLayerVisibility(newDataLayer, oldDataLayer);
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
      this.popup = new mapbox.Popup(
        { className: 'mapbox-popup' })
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
      for (const layer of this.state.dataLayers) {
        // Use MapBox's custom click handler, which takes the style layer that we
        // want to set up a handler for as a parameter.
        this.map?.on('click', layer.styleLayer.id,
          async (e: MapLayerMouseEvent): Promise<void> => {
            if (e.features != undefined) {
              const clickedFeatureProperties: { [name: string]: any; } = e.features[0].properties as {};
              const popupInfo = this.state?.currentDataLayer?.popupInfo;
              
              this.createMapPopup(e.lngLat, /* popupData= */
                {
                  title: popupInfo?.title ?? '',
                  subtitle: popupInfo?.subtitle ?? '',
                  detailsTitle: popupInfo?.detailsTitle ?? '',
                  featureProperties: popupInfo?.featureProperties ?? [] as FeatureProperty[],
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

      // Add geolocate control to the map.
      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            // If enabled, gets the best possible results. Can result in slower response times or
            // increased power consumption so set to false for now.
            enableHighAccuracy: false,
          },
          // Receive updates to the device's location as it changes.
          trackUserLocation: true,
        }),
      );

      // Add zoom in / zoom out buttons to map.
      this.map.addControl(new mapboxgl.NavigationControl());
    },

    /**
     * Set up listener on the zoom level. This is needed to toggle the data
     * source for the Lead Connections layer.
     */
    setUpZoomListener(): void {
      this.map?.on('zoom', () => {
        if (this.map == null) return;

        // If zoomed past parcel zoom level, switch to parcel-level data source.
        // Otherwise, switch to water system level.
        if (this.map.getZoom() >= PARCEL_ZOOM_LEVEL
          && this.state?.currentDataLayer?.id == MapLayer.LeadServiceLineByWaterSystem) {
          this.state?.setCurrentDataLayer(leadServiceLinesByParcelLayer);
        } else if (this.map.getZoom() < PARCEL_ZOOM_LEVEL
          && this.state?.currentDataLayer?.id == MapLayer.LeadServiceLineByParcel) {
          this.state?.setCurrentDataLayer(leadServiceLinesByWaterSystemLayer);
        }
      });
    },

    /**
     * Configure data layers and interaction handlers on the map.
     */
    configureMap(): void {
      if (this.map == null) return;

      this.state.map = this.map;
      for (const layer of this.state.dataLayers) {
        this.map?.addSource(layer.id, layer.source);
        this.map?.addLayer(layer.styleLayer);
      }

      this.setUpInteractionHandlers();
      this.setUpControls();
      this.setUpZoomListener();

      // Check whether there's a layer selected in the router.
      this.state.setCurrentDataLayer(this.state.dataLayers.find(layer => layer.styleLayer.id == router.currentRoute.value.query?.layer)
        ?? leadServiceLinesByWaterSystemLayer);
    },

    /**
     * Creates base Mapbox map and configures interactions and styles for
     * layers.
     */
    async createMap(): Promise<void> {
      try {
        this.map = new mapbox.Map({
          // Removes watermark by Mapbox.
          attributionControl: false,
          center: this.center,
          container: 'map-container',
          style: 'mapbox://styles/blueconduit/cl4ymcdgy000414pd5v1ggem5?optimize=true',
          zoom: 4,
        });

        this.map.on('load', this.configureMap);
      } catch (err) {
        // TODO: Add error handling.
        console.log('Error: ', err);
      }
    },
  },
  mounted() {
    this.createMap();
  },
  watch: {
    // Listens to app state to toggle layers.
    'state.currentDataLayer': function(newDataLayer: DataLayer, oldDataLayer: DataLayer) {
      this.updateMapOnDataLayerChange(newDataLayer, oldDataLayer);
    },
    // Listens to query param to toggle layers.
    'routerLayer': function(newLayer: string) {
      this.setDataLayerVisibility(newLayer, true);
    },
  },
});
</script>

<style>
#map-container {
  height: 100vh;
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