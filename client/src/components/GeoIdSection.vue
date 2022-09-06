<template>
  <div class='selected' v-if='selected'>
    <div class='h1-header'>{{ this.geoId }}</div>
    <div class='h2-header description'>{{ this.geoIdInfo }}</div>
  </div>
  <div class='unselected' v-else>
    <div class='h1-header'>{{ this.geoId }}</div>
    <div class='h2-header description'>{{ this.geoIdInfo }}</div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GeoIdSection',
  props: {
    geoId: {
      type: String,
      required: true,
    },
    geoIdInfo: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';

.description {
  color: $warm-grey-600;
  margin-top: 16px;
}

.selected, .unselected {
  width: 230px;
  height: 222px;
  border: 1px solid $gold;
  border-radius: 4px;
  padding: 20px;
}

.selected {
  background-color: $light-gold;
}
</style>