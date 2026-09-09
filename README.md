You can visit my portfolio at https://tvpian.github.io

## Local preview

Run `node scripts/serve.mjs`, then open http://127.0.0.1:4173. The preview server supplies the MIME types and byte-range responses required for the portfolio videos; generic Ruby/WEBrick file servers may send MP4 files as `application/octet-stream`, which prevents browser playback.

## Research interactions

The four opening research questions link to the corresponding direction by ID. `portfolio.js` centers and temporarily spotlights the selected direction while preserving a shareable URL hash.

Video labels describe illustrative system loops; they are deliberately independent of playback time and should not be presented as timestamp-aligned events without supporting annotations or logs.
