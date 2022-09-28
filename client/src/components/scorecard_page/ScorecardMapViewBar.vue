<template>
  <div class='container'>
    <div class='container' v-if='enableViewToggling'>
      <p v-if='options.length > 0'>View by:</p>
      <div class='zoom-options'>
        <search-bar-option
          v-for='option in options'
          :key='GeoDataUtil.getLabelForGeographicView(option)'
          :text-content='GeoDataUtil.getLabelForGeographicView(option)'
          :selected='getSelected(option)'
          @click='setSelected(option)'
        />
      </div>
    </div>
    <!--    TODO add more descriptive placeholder.-->
    <map-geocoder-wrapper
      :acceptedTypes='acceptedTypes'
      :baseUrl='SCORECARD_BASE'
      v-model:expandSearch='showSearch'
    />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { SCORECARD_BASE } from '../../router';
import SearchBarOption from '../SearchBarOption.vue';
import MapGeocoderWrapper from '../MapGeocoderWrapper.vue';
import { dispatch, useSelector } from '../../model/store';
import { GeoDataState } from '../../model/states/geo_data_state';
import { MapDataState } from '../../model/states/map_data_state';
import { setGeographicView } from '../../model/slices/map_data_slice';
import { GeoType } from '../../model/states/model/geo_data';
import { GeoDataUtil } from '../../util/geo_data_util';
import { GeographicLevel } from '../../model/data_layer';

/**
 * The zoom and search bar for the scorecard map.
 */
export default defineComponent({
  name: 'ScorecardMapViewBar',
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
  props: {
    enableViewToggling: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      acceptedTypes: [GeoType.address, GeoType.postcode],
      options: [] as GeographicLevel[],
      selectedOption: null as GeographicLevel | null,
      showSearch: false,
      SCORECARD_BASE,
      GeoDataUtil,
    };
  },
  beforeMount() {
    this.options = GeoDataUtil.getGeographicViewOptionsForGeoIds(this.geoState?.geoids);
    this.selectedOption = this.mapState?.mapData?.geographicView ?? null;
  },
  methods: {
    /**
     * Returns whether {@code option} is the selected option.
     *
     * @param option
     */
    getSelected(option: GeographicLevel): boolean {
      return option === this.selectedOption;
    },

    /**
     * Updates the selected option to {@code option} from a click on an option button.
     *
     * @param option
     */
    setSelected(option: GeographicLevel): void {
      dispatch(setGeographicView(option));
    },
  },
  watch: {
    'mapState.mapData.geographicView': function() {
      this.selectedOption = this.mapState?.mapData?.geographicView ?? null;
    },
    'geoState.geoids': function() {
      this.options = GeoDataUtil.getGeographicViewOptionsForGeoIds(this.geoState?.geoids);
    },
  },
});
</script>

<style scoped lang='scss'>
@import 'src/assets/styles/global';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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