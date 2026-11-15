# Family World by OSMAR — Original Artwork Integration

## Approved visual source
The three artwork files supplied by the project owner on 15 November 2026 are the visual source of truth for this release. Do not replace them with newly invented character designs, stock imagery, generic AI mascots, or emoji substitutes.

## Required production asset paths
Place the exact supplied originals (no character redesign, face replacement, or unapproved crop) at:

- `public/assets/brand/family-world-cover.webp` — primary Family World cover / home hub.
- `public/assets/brand/family-world-character-board.webp` — character and card reference board.
- `public/assets/brand/family-world-game-board.webp` — full game experience reference board.

Keep the original source files and a lossless archival copy outside the optimized web exports. WebP exports may be resized/compressed for delivery, but must preserve the same artwork and characters. Record source, date, dimensions, and export settings in the asset register.

## Usage rules
- The home hub uses the cover as its main visual anchor.
- Character Studio displays the two supplied boards as the character/card and gameplay visual references.
- Individual character cards must use approved individual character source art. Do not crop faces from the composite boards to fabricate individual avatars.
- Keep the same character identity, proportions, outfit cues, THIMMY mascot, and white robot across product surfaces.
- All image elements have descriptive alt text and hide gracefully until the corresponding approved file is present.

## Release gate
This code change wires the official asset paths into the app. It is not visually complete until all three exact artwork files are committed to the paths above and checked in desktop/mobile builds.
