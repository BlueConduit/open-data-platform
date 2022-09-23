const synthetics = require('Synthetics');
const syntheticsConfiguration = synthetics.getConfiguration();
const log = require('SyntheticsLogger');

// This is implicitly imported in synthetics.ts. TS doesn't like that, so ignore the error that this
// doesn't exist.
// @ts-ignore
const scorecardMessages = ScorecardMessages;

/**
 * Helper function for searching the entire page for a string. Returns if the string was found
 * within the default 30s timeout, else times out.
 * TODO: Figure out a way to reference strings from the messages files. This runs in a lambda, which
 * doesn't have access to any other files in the project.
 * @param page - The page object returned by Synthetics.
 * @param s - String to search
 * @returns
 */
const waitForString = async (page: { waitForFunction: (arg0: string) => any }, s: string) =>
  await page.waitForFunction(`document.querySelector("body").innerText.includes("${s}")`);

exports.handler = async function () {
  // TODO: cycle through several addresses, including:
  //   * Other addresses with parcel-level data.
  //   * Address w/ water system data + no parcel.
  //   * Address w/ no data.
  //   * Random, brief string (e.g. 'eq') and let autofill pick an address.
  const addresses = ['5607 HOME LN, TOLEDO OH 43623'];
  const address = addresses[0];

  const url = `https://${process.env.DOMAIN}/`;

  syntheticsConfiguration.setConfig({
    includeRequestHeaders: true, // Enable if headers should be displayed in HAR
    includeResponseHeaders: true, // Enable if headers should be displayed in HAR
    restrictedHeaders: [], // Value of these headers will be redacted from logs and reports
    restrictedUrlParameters: [], // Values of these url parameters will be redacted from logs and reports
  });
  const page = await synthetics.getPage();

  // TODO: map these steps to CUJs.

  // Navigate to the initial url
  await synthetics.executeStep('navigateToUrl', async function (timeoutInMillis = 30000) {
    await page.goto(url, { waitUntil: ['load', 'networkidle0'], timeout: timeoutInMillis });
  });

  // Fill and search for an address.
  await synthetics.executeStep('searchAddress', async function () {
    await page.waitForSelector("[id='app']", { timeout: 30000 });
    await page.screenshot();
    const searchInput = await page.waitForSelector('input.mapboxgl-ctrl-geocoder--input');
    await searchInput.type(address);
    const suggestion = await page.waitForSelector('.mapboxgl-ctrl-geocoder--suggestion-title');
    await page.screenshot();
    await suggestion.click();
    const searchButton = await page.waitForSelector('#scorecard-search-button');
    await searchButton.click();
  });

  await synthetics.executeStep('viewScorecard', async function () {
    // Check for prediction presence.
    await waitForString(page, scorecardMessages.LOW_LIKELIHOOD);
    // Check for side panel presence.
    await page.waitForSelector('.geoid-section');
    // Check for CTA presence.
    await waitForString(page, scorecardMessages.RESEARCH_WATER_FILTERS);
    await waitForString(page, scorecardMessages.COPY_TO_CLIPBOARD);
    // Check for score details presence.
    await waitForString(page, scorecardMessages.SCORECARD_SUMMARY_PANEL_HEADER(null));
    await page.screenshot();
  });
};
