# Progress Pebble marketing website

The public website for Progress Pebble, an illustrated habit tracker for iPhone and iPad. GitHub Pages publishes `main` at https://prodottopeak.github.io/pebble/. The native app repository remains separate and private.

## Pages and assets

English is at the root. French, German, Spanish (Spain), Italian, Japanese, Korean, Portuguese (Portugal), Portuguese (Brazil), and Traditional Chinese have dedicated pages at `fr/`, `de/`, `es/`, `it/`, `ja/`, `ko/`, `pt-pt/`, `pt-br/`, and `zh-hant/`. Each page uses matching approved screenshots, a localized thirty-second preview, and a 1200 × 630 share image. Artwork, fonts and videos are self-hosted. The Plus Jakarta Sans licence is in `assets/fonts/OFL.txt`.

The marketing pages are complete static HTML and work without executable JavaScript. The JSON-LD script blocks contain structured data only, with matching Content Security Policy hashes. Native HTML supplies the language menu, video controls and expandable questions. Videos do not autoplay or preload; screenshots below the first section load lazily. There are no analytics scripts, forms, advertising or tracking cookies.

Support and privacy retain their existing Jekyll Markdown content and URLs. Keep Jekyll enabled; do not add `.nojekyll`. Legal-page navigation uses the same current brand and retains readable phone wrapping.

## Launch state

The public App Store URL returned 404 and the US lookup returned zero results when checked on 4 November 2026. The page therefore says the app is coming to the App Store and invites visitors to watch the preview. It does not send people to a dead download URL or present a nonfunctional waiting list. When the listing is public, verify the actual App Store destination, add the appropriate download action to all ten pages, and keep free/paid boundaries and availability consistent with the released app. Do not change price claims based on historical drafts. One active activity is free; Pro is a one-time purchase without a subscription. Weekly and monthly goals require Pro.

## Search and sharing

Each localized page has one H1, a category-focused title and description, a self-canonical URL, reciprocal `hreflang` links including itself and the English `x-default`, Open Graph and large-card metadata, and MobileApplication structured data. `sitemap.xml` contains the ten marketing URLs and existing support/privacy URLs. Update the sitemap and reciprocal language links together when adding a locale. Do not redirect people automatically by IP or browser language.

There are no invented ratings or reviews, public pricing, download counts, or guaranteed ranking claims. The app markup describes the product; it does not establish eligibility for a Google software-app rich result, which requires additional genuine offer/review information. The FAQ is useful page content, not a promise of FAQ rich results. Do not add a meta-keyword list.

Search Console: verify the URL-prefix property `https://prodottopeak.github.io/pebble/`, submit `https://prodottopeak.github.io/pebble/sitemap.xml`, inspect the published home and language URLs, and monitor indexing and actual query impressions over time. No Search Console verification or indexing has been claimed. A robots.txt in this repository would live below `/pebble/`; crawlers require it at the host root, so do not add an ineffective project-level file.

## Maintenance

Use the public studio Git author identity and GitHub no-reply email. Publish only website files, approved artwork and marketing media. Do not copy credentials, internal evidence, app source, private records or personal Git metadata into this public repository. Keep support/privacy content unchanged unless a separate product or policy change requires an update. Translations have source alignment and rendered QA; independent native-speaker review remains separate.
