# Sister Birthday Project

Personalized birthday website by Pratik for his cousin sister Saloni / Sonudi, turning 23 on September 9, 2026.

## Run

Open `index.html` in a browser, or serve this folder locally with any static file server.

## Customize

- Edit `content.js` for names, stats, achievements, and the photo list.
- Drop photos into `assets/photos/`, then add entries to `BIRTHDAY_CONTENT.photos`.

## Included

- `index.html` - static game shell and accessible boot screen
- `game.js` - the central in-memory nine-mission engine, progression, achievements, reset, and final-file unlock
- `game.css` - responsive classified-game visual system with reduced-motion support
- `content.js` - personal content/configuration kept separate from game logic
- `birthday-stickers.png` - retained project artwork
- `assets/photos/` - real photo assets used by the Evidence Locker

The old phase scripts are no longer part of the active runtime. Their behavior was consolidated into `game.js` so mission progression has one state owner and locked missions cannot be skipped.
