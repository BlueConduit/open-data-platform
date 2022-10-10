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
    const descriptions = wrapper.findAll('.h1-header');
    expect(descriptions).toHaveLength(3);

    const introText =
      'LeadOut is an interactive tool that empowers communities to understand their risk status ' +
      'for lead water pipes and to take action. The tool was designed in a collaboration between ' +
      'BlueConduit, a water analytics company using machine learning to locate lead service ' +
      'lines and a Google.Org fellowship program that matches Google employees with nonprofits ' +
      'and civic entities on full time technical projects.';
    // Replace returns in html text. These newline characters aren't visible, but they are contained
    // within the html string.
    expect(descriptions[0].text().replaceAll('\n      ', '')).toBe(introText);

    const impactText =
      'An estimated 10 million American households are served by a lead service line, which ' +
      'exposes residents, especially children, to serious adverse health effects. By creating ' +
      'awareness of the issue and providing access to personalized, reliable, and digestible ' +
      'information, LeadOut helps communities protect themselves and once again feel secure in ' +
      'their homes.';
    expect(descriptions[1].text().replaceAll('\n      ', '')).toBe(impactText);

    const ctaText = 'Concerned about lead in your water supply? Learn your risk status.';
    expect(descriptions[2].text().replaceAll('\n      ', '')).toBe(ctaText);
  });
});
