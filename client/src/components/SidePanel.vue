<template>
  <span class='side-panel' v-if='options.length > 0'>
    <geo-id-section
      v-for='option in options'
      :key='option'
      :geoId='getGeoIdForZoomLevel(option)'
      :geoIdInfo='getGeoIdInfoForZoomLevel(option)'
      :selected='getSelected(option)'
      @click='setSelected(option)' />
  </span>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import GeoIdSection from './GeoIdSection.vue';
import { dispatch, useSelector } from '../model/store';
import { GeoDataState } from '../model/states/geo_data_state';
import { MapDataState } from '../model/states/map_data_state';
import { ZoomLevel } from '../model/states/model/map_data';
import { GeoDataUtil } from '../util/geo_data_util';
import { GeoData } from '../model/states/model/geo_data';
import { setZoomLevel } from '../model/slices/map_data_slice';

export default defineComponent({
  name: 'SidePanel',
  components: { GeoIdSection },
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
      options: [] as ZoomLevel[],
      selectedOption: null as ZoomLevel | null,
      ZoomLevel,
    };
  },
  methods: {
    getGeoIdForZoomLevel(level: ZoomLevel): string | undefined {
      const geoIds: GeoData | undefined = this.geoState?.geoids;
      if (GeoDataUtil.isNullOrEmpty(geoIds)) return;

      // TODO add address?
      switch (level) {
        case ZoomLevel.waterSystem:
          return geoIds?.pwsId?.id;
        case ZoomLevel.zipCode:
          return geoIds?.zipCode?.id;
        default:
          return '';
      }
    },

    getGeoIdInfoForZoomLevel(level: ZoomLevel): string | undefined {
      const waterSystemDescription = 'This is the Water system which owns the service lines that provide water to this area.';
      const zipDescription = 'Homes in this zip code has a high likelihoood of  lead service lines. Individual homes may or may not have lead pipes present.';
      // TODO make constants file with blurbs and index here.
      switch (level) {
        case ZoomLevel.waterSystem:
          return waterSystemDescription;
        case ZoomLevel.zipCode:
          return zipDescription;
        default:
          return '';
      }
    },

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

    /**
     * Sets zoom level options based on the present geo IDs.
     */
    setOptions() {
      const geoIds = this.geoState?.geoids;
      this.options = [];
      if (geoIds?.pwsId?.id) {
        this.options.push(ZoomLevel.waterSystem);
      }
      if (geoIds?.zipCode?.id) {
        this.options.push(ZoomLevel.zipCode);
      }
    },
  },
  watch: {
    'mapState.mapData.zoomLevel': function() {
      this.selectedOption = this.mapState?.mapData?.zoomLevel ?? null;
    },
    'geoState.geoids': function() {
      this.setOptions();
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';

.side-panel {
  @include container-column;
  display: flex;
  flex-direction: column;
  padding: 40px 48px;
  justify-content: space-between;
  row-gap: 24px;
}

</style>