<template>
  <!-- Vue wants only one root element and v-for can have many, so wrap in a parent div. -->
  <div>
    <div class='columns is-centered' v-for='option in options' :key='option'>
      <div class='column'>
        <geo-id-section
          :geoId='getGeoIdForZoomLevel(option)'
          :geoIdInfo='getGeoIdInfoForZoomLevel(option)'
          :selected='getSelected(option)'
          @click='setSelected(option)'
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import GeoIdSection from './GeoIdSection.vue';
import { dispatch, useSelector } from '../../model/store';
import { GeoDataState } from '../../model/states/geo_data_state';
import { MapDataState } from '../../model/states/map_data_state';
import { GeoDataUtil } from '../../util/geo_data_util';
import { GeoData } from '../../model/states/model/geo_data';
import { setGeographicView } from '../../model/slices/map_data_slice';
import { ScorecardMessages } from '../../assets/messages/scorecard_messages';
import { LeadDataUtil } from '../../util/lead_data_util';
import { LeadDataState } from '../../model/states/lead_data_state';
import { GeographicLevel } from '../../model/data_layer';

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
      options: [] as GeographicLevel[],
      selectedOption: null as GeographicLevel | null,
      geographicView: GeographicLevel,
    };
  },
  beforeMount() {
    this.options = GeoDataUtil.getGeographicViewOptionsForGeoIds(this.geoState?.geoids);
    this.selectedOption = this.mapState?.mapData?.geographicView ?? null;
  },
  methods: {
    /**
     * Returns the geo ID value corresponding to the given zoom level.
     */
    getGeoIdForZoomLevel(level: GeographicLevel): string | undefined {
      const waterSystemName: string | undefined = this.leadState?.data?.pwsName?.toLowerCase();
      const geoIds: GeoData | undefined = this.geoState?.geoids;
      if (GeoDataUtil.isNullOrEmpty(geoIds)) return;

      switch (level) {
        case GeographicLevel.Parcel:
          return this.formatAddress(geoIds?.address?.id);
        // Prefer human-readable water system name but fall back on required water system ID.
        case GeographicLevel.WaterSystem:
          return waterSystemName == null || waterSystemName == ''
            ? geoIds?.pwsId?.id
            : waterSystemName;
        case GeographicLevel.ZipCode:
          return geoIds?.zipCode?.id;
        default:
          return '';
      }
    },

    /**
     * Takes address and capitalizes the state USPS code.
     *
     * Example:
     *
     * 5150 riviera dr, toledo oh 43611 -> 5150 riviera dr, toledo OH 43611.
     */
    formatAddress(rawAddress: string | undefined): string | undefined {
      const city = this.leadState?.data?.city?.toLowerCase();
      if (!city || !rawAddress) return rawAddress;

      const address = rawAddress.toLowerCase();
      const stateUspsIndex = address.lastIndexOf(city) + city.length + 1;
      const stateAbbreviation = address.substring(stateUspsIndex, stateUspsIndex + 2);
      return address.replace(stateAbbreviation, stateAbbreviation.toUpperCase());
    },

    /**
     * Returns the geo ID description corresponding to the given zoom level.
     */
    getGeoIdInfoForZoomLevel(level: GeographicLevel): string | undefined {
      switch (level) {
        case GeographicLevel.Parcel:
          return ScorecardMessages.PREDICTION_DESCRIPTION(
            LeadDataUtil.formatPredictionAsLikelihood(
              this.leadState?.data?.publicLeadLowPrediction,
            ),
            'parcel',
          );
        case GeographicLevel.WaterSystem:
          return ScorecardMessages.WATER_SYSTEM_DESCRIPTION;
        case GeographicLevel.ZipCode:
          return ScorecardMessages.PREDICTION_DESCRIPTION(
            LeadDataUtil.formatPredictionAsLikelihood(
              LeadDataUtil.waterSystemsPercentLead(this.leadState?.data),
            ),
            'zip code',
          );
        default:
          return '';
      }
    },

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
@import 'bulma/sass/helpers/spacing';
</style>
