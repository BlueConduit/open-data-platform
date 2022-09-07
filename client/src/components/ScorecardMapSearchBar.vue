<template>
  <div class='searchbar-container'>
    <p v-if='options.length > 0'>View by:</p>
    <div class='zoom-options'>
      <search-bar-option
        v-for='option in options'
        :key='option'
        :text-content='option'
        :selected='getSelected(option)'
        @click='setSelected(option)' />
    </div>
    <!--    TODO add more descriptive placeholder.-->
    <map-geocoder-wrapper
      :acceptedTypes='acceptedTypes'
      :baseUrl='SCORECARD_BASE'
      v-model:expandSearch='showSearch' />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { SCORECARD_BASE } from '../router';
import SearchBarOption from './SearchBarOption.vue';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import { dispatch, useSelector } from '../model/store';
import { GeoDataState } from '../model/states/geo_data_state';
import { MapDataState } from '../model/states/map_data_state';
import { ZoomLevel } from '../model/states/model/map_data';
import { setZoomLevel } from '../model/slices/map_data_slice';
import { GeoType } from '../model/states/model/geo_data';
import { GeoDataUtil } from '../util/geo_data_util';

/**
 * The zoom and search bar for the scorecard map.
 */
export default defineComponent({
  name: 'ScorecardMapZoomBar',
  components: {
    MapGeocoderWrapper,
    SearchBarOption,
  },
  setup() {
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const mapState = useSelector((state) => state.mapData) as MapDataState;

    return {
      geoState,
      mapState,
    };
  },
  data() {
    return {
      acceptedTypes: [GeoType.address, GeoType.postcode],
      options: [] as ZoomLevel[],
      selectedOption: null as ZoomLevel | null,
      showSearch: true,
      SCORECARD_BASE,
    };
  },
  methods: {
    /**
     * Returns whether {@code option} is the selected option.
     *
     * @param option
     */
    getSelected(option: ZoomLevel): boolean {
      return option === this.selectedOption;
    },

    /**
     * Updates the selected option to {@code option} from a click on an option button.
     *
     * @param option
     */
    setSelected(option: ZoomLevel): void {
      dispatch(setZoomLevel(option));
    },
  },
  watch: {
    'mapState.mapData.zoomLevel': function() {
      this.selectedOption = this.mapState?.mapData?.zoomLevel ?? null;
    },
    'geoState.geoids': function() {
      this.options = GeoDataUtil.getZoomOptionsForGeoIds(this.geoState?.geoids);
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.searchbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $spacing-xl;
  padding: 0 $spacing-md;
  background-color: $warm-grey-100;
}

.zoom-options {
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: fit-content;
}
</style>