You can visit my portfolio at https://tvpian.github.io

## Local preview

Run `node scripts/serve.mjs`, then open http://127.0.0.1:4173. The preview server supplies the MIME types and byte-range responses required for the portfolio videos; generic Ruby/WEBrick file servers may send MP4 files as `application/octet-stream`, which prevents browser playback.

## Updating the research notebook

Edit `data/research-log.json`. Each entry accepts `period`, `state`, `stateClass` (`built` or `investigating`), `title`, `summary`, and `topics`. Keep entries limited to public, defensible progress; unpublished protocols and internal implementation details should remain outside the portfolio.

The HTML contains matching fallback entries so the notebook remains readable if JavaScript is unavailable. When changing the JSON, update the fallback entries in `index.html` as well.
