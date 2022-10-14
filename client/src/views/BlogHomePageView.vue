<template>
  <div class='section'>
    <div class='h1-header-large has-text-centered'>
      {{ BlogPageMessages.BLOG_HEADER }}
    </div>
    <div class='section '>
      <div class='blog-posts is-flex'>
        <div v-for='post in posts' :key='post.route' class='post is-flex'>
          <img class='is-hidden-mobile'
               :src='require(`@/assets/media/${post.image}`)' />
          <div class='preview'>
            <div class='h2-header-large'>{{ post.title }}</div>
            <div>
              <span v-html='getPreview(post.content)'></span>
              <a :href='post.route'>
                {{ BlogPageMessages.READ_MORE }}
              </a></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { BlogPageMessages } from '../assets/messages/blog_messages';
import { BlogPost } from '../assets/blog/blog_post';
import { nextSteps } from '../assets/blog/next_steps';
import { understandLead } from '../assets/blog/understand_lead_status';
import { historyOfLead } from '../assets/blog/history_of_lead';
import { leadHealthEffects } from '../assets/blog/lead_health_effects';
import { selectWaterFilter } from '../assets/blog/select_water_filter';

/**
 * Very simple blog home page.
 */
export default defineComponent({
  name: 'BlogHomePageView',
  data() {
    const posts: Array<BlogPost> = [
      nextSteps,
      historyOfLead,
      understandLead,
      leadHealthEffects,
      selectWaterFilter,
    ];
    return {
      BlogPageMessages,
      posts,
    };
  },
  methods: {
    /**
     * Clip string to preview of blog post
     */
    getPreview(content: string): string {
      // First 3 chars are <p> tag.
      return content.split('</p>')[0] + '</p>';
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.blog-posts {
  @include container-column;
  gap: $spacing-lg;
}

.post {
  gap: $spacing-lg;
}

.preview {
  @include container-column;
}

img {
  max-width: 250px;
}

</style>