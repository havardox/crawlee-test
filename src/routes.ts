import { createPlaywrightRouter } from 'crawlee';
import type { Page } from 'playwright';

const router = createPlaywrightRouter();

async function* scrollToBottom(page: Page) {
  await page.locator('[data-test-id*="venueCard"]').first().waitFor({ timeout: 10000 });
  let previousElementsCount = 0;
  let continueScroll = true;

  while (continueScroll) {
    /* eslint-disable no-await-in-loop, @typescript-eslint/no-loop-func */

    // Collect all venueCard elements
    const venueCards = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-test-id*="venueCard"]')).map((element) => {
        return {
          href: element.getAttribute('href'), // Adjust according to how your links are structured
          element, // Store the element reference for later
        };
      });
    });

    const currentElementsCount = venueCards.length;

    // Scroll to the bottom of the page
    await page.evaluate(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    });

    // Wait for new elements to load
    try {
      await page
        .locator(`[data-test-id*="venueCard"] >> nth=${currentElementsCount}`)
        .waitFor({ timeout: 6000, state: 'attached' });
    } catch (error) {
      console.debug(
        `Exception caught: No new elements found after ${currentElementsCount} elements. Stopping scroll.`,
        error,
      );
      continueScroll = false;
    }

    // Collect new links based on the previously counted elements
    const newLinks = venueCards
      .slice(previousElementsCount)
      .map((card: { href: any }) => card.href);
    yield newLinks; // Yield the batch of new links
    // Update previousElementsCount for the next iteration
    previousElementsCount = currentElementsCount;

    await page.screenshot({ path: `scroll_${currentElementsCount}.png` });
  }
}

// Default route to handle the start URL and other labeled URLs
router.addDefaultHandler(async ({ request, page, log }) => {
  log.debug(`Enqueueing from page: ${request.url}`);
  const cookiesBtn = page.locator("[data-test-id='allow-button']");
  try {
    await cookiesBtn.waitFor({ timeout: 6000 });
    await cookiesBtn.click();
  } catch (error) {
    console.debug('Exception caught: No cookie button found.', error);
  }

  let linkCount = 0;
  /* eslint-disable no-restricted-syntax */
  for await (const links of scrollToBottom(page)) {
    for (const link of links) {
      log.debug(`New link found: ${link}`);
      linkCount += 1;
      // Enqueue each new link for further processing
    }
  }

  log.debug(`Found ${linkCount} number of links to restaurants.`);
});

export default router;
