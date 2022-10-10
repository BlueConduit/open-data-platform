import { afterEach, beforeEach, describe } from 'vitest';
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper';
import AboutUsView from '@/views/AboutUsView.vue';
import { mount } from '@vue/test-utils';
import { aboutUsContent } from '@/assets/messages/about_us_messages';

describe('AboutUsView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(AboutUsView, { props: {} });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Renders correct title', () => {
    expect(wrapper.exists()).toBe(true);
    const header = wrapper.find('.h1-header-xl');
    expect(header.text()).toBe(aboutUsContent.title);
  });

  it('Renders correct content', () => {
    expect(wrapper.exists()).toBe(true);
    const descriptions = wrapper.findAll('.h1-header p');
    expect(descriptions).toHaveLength(3);
  });
});
