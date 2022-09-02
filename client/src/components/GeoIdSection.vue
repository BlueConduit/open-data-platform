<template>
  <div class='selected' v-if='selected'>
    <div class='h2-header'>{{ this.geoId }}</div>
    <div class='body'>{{ this.geoIdInfo }}</div>
  </div>
  <div class='unselected' v-else>
    <div class='h2-header'>{{ this.geoId }}</div>
    <div class='body'>{{ this.geoIdInfo }}</div>
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

.selected, .unselected {
  width: 230px;
  height: 222px;
  border: 1px solid $gold;
  border-radius: 4px;
}

.selected {
  background-color: $light-gold;
}
</style>