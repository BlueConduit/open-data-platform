const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');
const syntheticsConfiguration = synthetics.getConfiguration();

exports.handler = async function () {
  // TODO: cycle through several addresses
  const addresses = ['5607 HOME LN, TOLEDO OH 43623'];
  const address = addresses[0];

  const url = 'https://leadout-dev.blueconduit.com/';

  syntheticsConfiguration.setConfig({
    includeRequestHeaders: true, // Enable if headers should be displayed in HAR
    includeResponseHeaders: true, // Enable if headers should be displayed in HAR
    restrictedHeaders: [], // Value of these headers will be redacted from logs and reports
    restrictedUrlParameters: [], // Values of these url parameters will be redacted from logs and reports
  });
  let page = await synthetics.getPage();

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
    // This selects the first button with this class.
    // TODO: add and use element IDs.
    const searchButton = await page.waitForSelector('.gold-button');
    await searchButton.click();
  });

  await synthetics.executeStep('viewScorecard', async function () {
    // Check for prediction presence.
    await page.waitForFunction(
      'document.querySelector("body").innerText.includes("Low likelihood")',
    );
    // Check for side panel presence.
    await page.waitForSelector('.geoid-section');
  });
};
