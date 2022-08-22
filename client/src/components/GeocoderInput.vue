<template>
  <div class='geocoder'></div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { GeoType } from '../model/states/model/geo_data';

/**
 * Wrapper for Mapbox Geocoder.
 *
 * See details at https://github.com/mapbox/mapbox-gl-geocoder.
 * And how to use the geocoder outside of a map: https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-no-map/
 */
export default defineComponent({
  name: 'GeocoderInput',
  data() {
    const geocoder = new MapboxGeocoder({
      // @ts-ignore
      accessToken: process.env.VUE_APP_MAP_BOX_API_TOKEN ?? '',
      mapboxgl: undefined,
      marker: false,
      countries: 'US',
    });
    return {
      geocoder,
    };
  },
  props: {
    acceptedTypes: {
      type: Array as PropType<GeoType[]>,
      required: false, // If not provided, defaults to allowing all types.
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
  },
  emits: {
    result: (lat: number, long: number, geoType: GeoType) => true,
  },
  mounted() {
    this.geocoder.addTo('.geocoder');
    this.geocoder.setPlaceholder(this.placeholder);
    
    if (this.acceptedTypes != null) {
      const types = (this.acceptedTypes.join());
      console.log('TYPES: ' + types);
      this.geocoder.setTypes(this.acceptedTypes.join());
    }

    // TODO: replace 'any' here with a meaningful type.
    this.geocoder.on('result', async (result: any) => {
      const place = result.result;
      if (place.place_type.length > 0) {
        const geoType = Object.values(GeoType)
          .find((geo) => geo == place.place_type[0]) as GeoType;

        const long: number = place.center[0];
        const lat: number = place.center[1];
        this.$emit('result', lat, long, geoType);
      }
    });
    this.geocoder.on('clear', () => {
      this.$emit('result', 0, 0, GeoType.unknown);
    });
  },
});
</script>

<style lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.geocoder {
  display: inline-block;
  height: 100%;
}

/** Override geocoder styles. **/
.mapboxgl-ctrl-geocoder {
  box-shadow: none;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mapboxgl-ctrl-geocoder--icon-search {
  visibility: hidden;
  width: 0;
  height: 0;
}

.mapboxgl-ctrl-geocoder--input {
  font-size: 18px;
  font-family: 'IBM Plex Sans';
  color: $warm-grey-600;
  font-weight: 400;
  height: 100%;
  padding: 5 * $spacing-xs;
}

.mapboxgl-ctrl-geocoder--input:focus {
  outline: none;
}
</style>