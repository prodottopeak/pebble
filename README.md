# Pebble launch website

Public website content only. Native iOS source remains in the private pebble-ios repository.

GitHub Pages publishes main / (Jekyll). No JavaScript, analytics, external font requests, package install, or custom domain required.

- Home: https://prodottopeak.github.io/pebble/
- Support: https://prodottopeak.github.io/pebble/support/
- Privacy: https://prodottopeak.github.io/pebble/privacy/

Content follows the existing Beeper and PhoneAware three-page structure. The layout uses Pebble’s approved warm-white, navy, aqua family and existing icon.

After the App Store listing is public, replace the prelaunch note on index.md with the verified App Store link. Keep price and feature claims aligned with the actual app.

## Search visibility

The pages have descriptive titles, individual descriptions, canonical URLs, semantic headings and share-preview metadata. sitemap.xml lists the three public canonical pages. Keep that list current if adding or removing a page. No fake ratings, keyword lists, tracking scripts or guaranteed ranking claims.

In Google Search Console, add a URL-prefix property for https://prodottopeak.github.io/pebble/ and verify ownership using Google's HTML file or tag. Submit https://prodottopeak.github.io/pebble/sitemap.xml. Inspect the home URL and request indexing, then monitor indexing status and actual search impressions. Search Console setup does not require adding visitor analytics.

Do not place robots.txt in this repository's /pebble/ subdirectory: crawlers look for it at the host root. The host-root robots.txt currently returns 404, which does not block crawling.

Use the public studio Git identity and GitHub no-reply email for website commits. Do not copy personal Git metadata, credentials, records or private app source into this repository.
