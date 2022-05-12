<template>
  <div id="map-container"></div>
</template>

<script>
import mapbox from "mapbox-gl";

const DEFAULT_LATITUDE = 39.8097343;
const DEFAULT_LONGITUDE = -98.5556199;

// TODO(kaila): Fetch this via API instead
const PRESIGNED_URL = "https://opendataplatformapistaticdata.s3.us-east-2.amazonaws.com/cleaned_boundary_files_2022-03-18.geojson?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAQRHKTFEHPIPI7P4M%2F20220512%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20220512T162229Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHAaCXVzLWVhc3QtMiJIMEYCIQCrUgCaMLFIaffS5N4IyRZcovs2sqVWoy1gPSK4vpEWHwIhAM1hjCJom4UcUD3Wp1Imad7aQZxXn4RKxquNe%2B2ECQITKpkCCEoQABoMMDM2OTk5MjExMjc4Igw%2B9e4dJQkhbaRRSf0q9gGd2wT1FqcP9qfS59j0ub3MwXC6%2F3dL6Ns3kJai9ZT6grsUpBe6zVR8iyWKQ2nDoaAA2SLOJc2z5FDtV8NHDed9raRvEYOazPcxTClh9OmISDMPkt1rG8AbB54qii7TN9nkzAh8WHHYzZYAcm9X317Wx5k2rFQiZccugNzC%2FN9cy5bG%2F69gSwVppvrH81npDpb%2BySnWHqAyxM%2BpzfWz4XkWK8kh8AQx13kUoyyyanCqEnu8GPhoUi5GYsCgCOkQnTtUUHOEUKrTAcL5sB1zy%2F9IOI6v8M1FjBD1mjyz5v2r43ppGELWXB9mU8GqpvTIxpdiB4sFWEswxOj0kwY6mQE3N0CjTl1NkdVwB7Fg5ZHDZjTJ2K83hN4AuxphJtudakRZqyqA52MgV4iHPpZKmsXv0dFiScQtqIdBWvrHDydhTTX1B1vOJX%2F8oetSl9B9%2B4dWmkMNSGPT0EqquB5gyQf4AyIIZKEQaCwH1w5arnjyoKUpLfL4XQD7yHne%2BeJcI2CMqSkNuyUqaehq%2Bj1kGSwz71XKV7SmDJ0%3D&X-Amz-Signature=29f1ae90206d79081cb72ec510bcab10876ed73064378a1d4ffd2de951a01cc8&X-Amz-SignedHeaders=host"

export default {
  name: "MapView",
  setup() {
    // TODO: Hide access tokens. For now, this is MapBox's public API token.
    mapbox.accessToken = process.env.VUE_APP_MAP_BOX_API_TOKEN
  },
  data() {
    return {
      map: {}
    }
  },
  props: {
    /**
     * Where to load the initial map. Defaults to center of continental US.
     */
    center: {
      type: Array,
      default: function () {
        return [DEFAULT_LONGITUDE, DEFAULT_LATITUDE];
      }
    }
  },
  methods: {
    async createMap() {
      try {
        this.map = new mapbox.Map({
          // Removes watermark by Mapbox.
          attributionControl: false,
          center: this.center,
          container: "map-container",
          style: "mapbox://styles/mapbox/streets-v11",
          zoom: 4,
        });

        this.map.on('load', () => {
          this.map.addSource('water-boundaries', {
            type: 'geojson',
            data: PRESIGNED_URL
          });

          // TODO(kaila): Fix this to map the file correctly
          this.map.addLayer({
            'id': 'water-boundaries-style',
            'source': 'water-boundaries',
            'type': 'line',
            'layout': {
              // Make the layer visible by default.
              'visibility': 'visible'
            },
          });
        });

      } catch (err) {
        // TODO: Add error handling.
        console.log("Error: ", err);
      }
    },
  },
  mounted() {
    this.createMap()
  }
}
</script>

<style scoped>
  #map-container {
    height: 100vh;
  }
</style>