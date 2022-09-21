import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper';
import AboutUsView from '@/views/AboutUsView.vue';
import { AboutUsMessages } from '@/assets/messages/about_us_messages';

describe('AboutUsView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(AboutUsView, { props: {} });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Renders correct header', () => {
    expect(wrapper.exists()).toBe(true);
    const header = wrapper.find('.h1-header-xl');
    expect(header.text()).toBe(AboutUsMessages.ABOUT_US_HEADER);
  });

  it('Renders descriptions', () => {
    expect(wrapper.exists()).toBe(true);
    const descriptions = wrapper.findAll('.h1-header div');
    expect(descriptions).toHaveLength(2);

    expect(descriptions[0].text()).toBe(AboutUsMessages.BLUE_CONDUIT_INTRO_TEXT);
    expect(descriptions[1].text()).toBe(AboutUsMessages.BLUE_CONDUIT_IMPACT_TEXT);
  });
});
