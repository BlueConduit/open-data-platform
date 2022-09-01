<template>
  <div class='searchbar-container'>
    <div class='zoom-options'>
      <search-bar-option
        v-for='option in options'
        :key='option'
        :text-content='option'
        :selected='getSelected(option)'
        @click='setSelected(option)' />
    </div>
    <div class='search-wrapper'>
      <map-geocoder-wrapper class='search'
                            :baseUrl='SCORECARD_BASE'
                            :expandSearch='true' />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { SCORECARD_BASE } from '../router';
import SearchBarOption from './SearchBarOption.vue';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import mapboxgl from 'mapbox-gl';
import { dispatch, useSelector } from '../model/store';
import { GeoDataState } from '../model/states/geo_data_state';
import { MapDataState } from '../model/states/map_data_state';
import { ScorecardZoomLevel } from '../model/states/model/map_data';
import { setScorecardZoom } from '../model/slices/map_data_slice';
import { BoundingBox } from '../model/states/model/geo_data';

export default defineComponent({
  name: 'ScorecardMapZoomBar',
  components: {
    MapGeocoderWrapper,
    SearchBarOption,
  },
  setup() {
    mapboxgl.accessToken = process.env.VUE_APP_MAP_BOX_API_TOKEN ?? '';

    // Listen to geoState updates.
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const mapState = useSelector((state) => state.mapData) as MapDataState;

    return {
      geoState,
      mapState,
    };
  },
  data() {
    return {
      options: [] as ScorecardZoomLevel[],
      selectedOption: null as ScorecardZoomLevel | null,
      SCORECARD_BASE,
    };
  },
  methods: {
    /**
     * Returns whether {@code option} is the selected option.
     *
     * @param option
     */
    getSelected(option: ScorecardZoomLevel): boolean {
      return option === this.selectedOption;
    },

    /**
     * Updates the selected option to {@code option} from a click on an option button.
     *
     * @param option
     */
    setSelected(option: ScorecardZoomLevel): void {
      this.selectedOption = option;
      const bounds = this.getBounds(option);
      if (bounds) {
        dispatch(setScorecardZoom(option, bounds));
      }
    },

    getBounds(level: ScorecardZoomLevel): BoundingBox | null {
      if (level == ScorecardZoomLevel.waterSystem) {
        return this.geoState?.geoids?.pwsId?.boundingBox ?? null;
      }
      if (level == ScorecardZoomLevel.zipCode) {
        return this.geoState?.geoids?.zipCode?.boundingBox ?? null;
      }
      return null;
    },
  },
  watch: {
    'mapState.mapData.scorecardZoom': function() {
      console.log('SETTING SELECTED: ' + this.selectedOption);
      this.selectedOption = this.mapState?.mapData?.scorecardZoom?.level ?? null;
    },
    'geoState.geoids': function() {
      const geoIds = this.geoState?.geoids;
      const options = [];
      if (geoIds?.address) {
        options.push(ScorecardZoomLevel.address);
      }
      if (geoIds?.pwsId) {
        options.push(ScorecardZoomLevel.waterSystem);
      }
      if (geoIds?.zipCode) {
        options.push(ScorecardZoomLevel.zipCode);
      }
      this.options = options;
    },
  },
});
</script>

<style scoped>
.search {
  display: flex;
}

.searchbar-container {
  display: flex;
  height: 54px;
  padding: 0 15px;
  align-items: center;
  justify-content: space-between;
  background-color: #F6F6F6; /* TODO use global css vars for this. */
}

.search-wrapper {
  display: flex;
  padding-left: 15px;
}

.zoom-options {
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: fit-content;
}
</style>