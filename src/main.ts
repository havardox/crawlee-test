import { PlaywrightCrawler, log } from 'crawlee';
import router from './routes';

// This is better set with CRAWLEE_LOG_LEVEL env var
// or a configuration option. This is just for show 😈
log.setLevel(log.LEVELS.DEBUG);

log.debug('Setting up crawler.');
const crawler = new PlaywrightCrawler({
  // Instead of the long requestHandler with
  // if clauses we provide a router instance.
  requestHandler: router,
  requestHandlerTimeoutSecs: 600,
});

await crawler.run(['https://wolt.com/et/est/tallinn/restaurants']);
