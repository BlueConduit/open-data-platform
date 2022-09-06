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
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { LeadDataUtil } from '../util/lead_data_util';
import { LeadDataState } from '../model/states/lead_data_state';

/**
 * Side panel containing extra contexts for Geo IDs in the scorecard view.
 */
export default defineComponent({
  name: 'SidePanel',
  components: { GeoIdSection },
  setup() {
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const mapState = useSelector((state) => state.mapData) as MapDataState;
    const leadState = useSelector((state) => state.leadData) as LeadDataState;
    return {
      geoState,
      leadState,
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
    /**
     * Returns the geo ID value corresponding to the given zoom level.
     */
    getGeoIdForZoomLevel(level: ZoomLevel): string | undefined {
      const geoIds: GeoData | undefined = this.geoState?.geoids;
      if (GeoDataUtil.isNullOrEmpty(geoIds)) return;

      switch (level) {
        case ZoomLevel.parcel:
          return geoIds?.address?.id;
        case ZoomLevel.waterSystem:
          return geoIds?.pwsId?.id;
        case ZoomLevel.zipCode:
          return geoIds?.zipCode?.id;
        default:
          return '';
      }
    },

    /**
     * Returns the geo ID description corresponding to the given zoom level.
     */
    getGeoIdInfoForZoomLevel(level: ZoomLevel): string | undefined {
      switch (level) {
        case ZoomLevel.parcel:
          return ScorecardMessages.PREDICTION_DESCRIPTION(
            LeadDataUtil.formatPredictionAsLikelihood(
              this.leadState?.data?.publicLeadLowPrediction),
            'parcel',
          );
        case ZoomLevel.waterSystem:
          return ScorecardMessages.WATER_SYSTEM_DESCRIPTION;
        case ZoomLevel.zipCode:
          return ScorecardMessages.PREDICTION_DESCRIPTION(
            LeadDataUtil.formatPredictionAsLikelihood(
              LeadDataUtil.waterSystemsPercentLead(this.leadState?.data)),
            'zip code');
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


.side-panel {
  @include container-column;
  display: flex;
  flex-direction: column;
  padding: $spacing-lg $spacing-xl;
  justify-content: space-between;
  row-gap: $spacing-lg;
}

</style>