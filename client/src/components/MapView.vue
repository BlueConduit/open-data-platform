<template>
  <div id='map-container'></div>
  <MapLegend />
</template>

<script lang='ts'>
import mapboxgl from 'mapbox-gl';
import mapbox, { GeoJSONSourceRaw, LngLatLike, MapLayerMouseEvent } from 'mapbox-gl';
import MapLegend from '@/components/MapLegend.vue';
import MapPopupContent from '@/components/MapPopupContent.vue';
import { createApp, defineComponent, inject, nextTick, PropType } from 'vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';

const DEFAULT_LNG_LAT = [-98.5556199, 39.8097343];

const POPUP_CONTENT_BASE_ID = 'popup-content';
const POPUP_CONTENT_BASE_HTML = `<div id='${POPUP_CONTENT_BASE_ID}'></div>`;

export default defineComponent({
  name: 'MapView',
  components: {
    MapLegend,
  },
  setup() {
    // TODO: Hide access tokens. For now, this is MapBox's public API token.
    mapbox.accessToken = process.env.VUE_APP_MAP_BOX_API_TOKEN;

    const state: State = inject(stateKey, State.default());

    return {
      state,
    };
  },
  data() {
    return {
      map: null as mapboxgl.Map | null,
    };
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
     * Updates layer visibility based on current data layer.
     */
    toggleLayerVisibility(updatedState: State): void {
      if (this.map == null) return;
      
      updatedState.dataLayers.forEach(layer => {
        const visibility = layer == updatedState.currentDataLayer ? 'visible' : 'none';
        this.map?.setLayoutProperty(layer.styleLayer.id, 'visibility', visibility);
      });
    },

    /**
     * Updates map when injected State changes.
     *
     * This will create a map if it does not exist and there is new data, or change the visual
     * layer if the currentDataLayer changes.
     */
    updateMapOnStateChange(newState: State): void {
      if (this.map == null) {
        if (newState.currentDataLayer?.data != null) {
          this.createMap();
        }
      } else {
        this.toggleLayerVisibility(newState);
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
      new mapbox.Popup(
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

      this.state.dataLayers?.forEach(layer => {
        // Use MapBox's custom click handler, which takes the style layer that we
        // want to set up a handler for as a parameter.
        this.map?.on('click', layer.styleLayer.id,
          async (e: MapLayerMouseEvent): Promise<void> => {
            if (e.features != undefined) {
              const clickedFeatureProperties: { [name: string]: any; } = e.features[0].properties as {};

              this.createMapPopup(e.lngLat, /* popupData= */
                { properties: new Map(Object.entries(clickedFeatureProperties)) });
            }
          });
      });
    },

    /**
     * Configure data layers and interaction handlers on the map.
     */
    configureMap(): void {
      if (this.map == null) return;

      this.state.map = this.map;
      this.state.dataLayers?.forEach(layer => {
        const source: GeoJSONSourceRaw = {
          type: 'geojson',
          data: layer.data,
        };
        this.map?.addSource(layer.id, source);
        this.map?.addLayer(layer.styleLayer);
      });

      this.setUpInteractionHandlers();
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
          style: 'mapbox://styles/mapbox/streets-v11',
          zoom: 4,
        });

        this.map.on('load', this.configureMap);
      } catch (err) {
        // TODO: Add error handling.
        console.log('Error: ', err);
      }
    },
  },
  watch: {
    state: {
      // TODO(kailamjeter): experiment with watching different properties of state to avoid deep.
      handler(newState: State): void {
        this.updateMapOnStateChange(newState);
      },
      // Make watcher deep, meaning that this will be triggered on a change to any nested field of state.
      deep: true,
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
  width: 258px;
  height: 256px;
  padding: 18px;
}

.mapboxgl-popup-tip {
  visibility: hidden;
}
</style>