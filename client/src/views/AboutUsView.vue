<template>
  <div class='about-us'>
    <div class='text'>
      <h1>{{ messages.HEADER }}</h1>
      <div class='body'>
        {{ messages.BODY_1 }}
        <p></p>
        {{ messages.BODY_2 }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { AboutUs as messages } from '@/assets/messages/about_us';

/**
 * About Us page component.
 */
export default defineComponent({
  name: 'AboutUsView',
  data() {
    return {
      messages,
    };
  },
});
</script>

<style scoped>
.about-us {
  height: 100%;
  background-color: #0576BD;
  background-image: url('~@/assets/media/about-us-image.png');
  background-size: cover;
  background-repeat: no-repeat;
  color: #FFFFFF;
}

.body {
  width: 675px;
  height: 336px;
  font-size: 27px;
  font-weight: 400;
  line-height: 32px;
}

h1 {
  margin: 0;
  width: 500px;
  height: 60px;
  font-size: 80px;
  font-weight: 600;
  line-height: 60px;
  text-transform: capitalize;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 70px;
  padding: 121px 472px 0 54px;
}
</style>