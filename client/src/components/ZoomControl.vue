<template>
  <div class='control-container'>
    <div class='zoom-in-control-button'>
      <img src='@/assets/icons/zoom_in.svg' />
    </div>
    <div class='zoom-out-control-button'>
      <img src='@/assets/icons/zoom_out.svg' />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ZoomControl',
});
</script>

<style scoped>

.control-container {
  position: absolute;
  top: 120px;
  right: 0;
  background: #fff;
  margin-right: 20px;
  overflow: auto;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 20px;
  padding: 10px;
}

.zoom-in-control-button {
  border-bottom: 1px solid #E5E5E5;
}

</style>