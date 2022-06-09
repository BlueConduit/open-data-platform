<template>
<!--  TODO: style buttons to look disabled when they are disabled.-->
  <div class='control-container'>
    <button @click="$emit('zoomIn')" class='zoom-in-control-button'
            :disabled='!this.zoomInEnabled'>
      <img class='button-icon' src='@/assets/icons/zoom_in.svg' />
    </button>
    <div class='disabled-overlay'></div>
    <button @click="$emit('zoomOut')" class='zoom-out-control-button'
            :disabled='!this.zoomOutEnabled'>
      <img class='button-icon' src='@/assets/icons/zoom_out.svg' />
    </button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

/**
 * Zoom controls on map.
 *
 * Contains zoom in and zoom out button.
 */
export default defineComponent({
  name: 'ZoomControl',
  props: {
    zoomInEnabled: {
      type: Boolean,
      default: true,
    },
    zoomOutEnabled: {
      type: Boolean,
      default: true,
    },
  },
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
  border-left: none;
  border-right: none;
  border-top: none;

}

.zoom-out-control-button {
  border: none;
}

.zoom-in-control-button, .zoom-out-control-button {
  background-color: white;
  cursor: pointer;
  width: 100%;
  height: 50%;
}
</style>