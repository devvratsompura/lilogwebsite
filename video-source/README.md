# Pravaah sample film

A 31-second, 1920×1080 motion study for **PRAVAAH — Collection 01**, built as a
Remotion composition inside [OpenMontage](https://github.com/calesthio/OpenMontage)'s
`remotion-composer`. The rendered file is `assets/video/pravaah-sample.mp4`, with a poster frame at
`assets/video/pravaah-sample-poster.jpg`.

It is a capability sample, not the final brand film. It contains no product photography.
Each piece is shown by its name, category, its line from the lookbook, and an abstract
line motif that suggests the idea behind it without depicting the object:

| Piece | Motif |
| --- | --- |
| Nira | closely spaced vertical cord weave |
| Sahaj | one sculptural line flowing around a seated form |
| Spand | ripples spreading across still water under a glass ellipse |
| Laya | a pendulum that swings and settles back to stillness |
| Anvay | three lines that meet and continue as one |

The palette follows the site (`#F2EEE6` plaster). Type is set in Cormorant Garamond and Jost.
The soundtrack is a synthesized ambient pad (generated with ffmpeg, no samples).

## Running order

| Time | Scene |
| --- | --- |
| 0–4 s | Title: Li'l Log Objects / Pravaah / Collection 01 |
| 4–8 s | "Pravaah, meaning flow." |
| 8–24 s | Nira, Sahaj, Spand, Laya, Anvay at 3.2 s each |
| 24–27.5 s | All five pieces together |
| 27.5–31 s | End card |

## Re-rendering

```bash
git clone https://github.com/calesthio/OpenMontage.git
cd OpenMontage/remotion-composer && npm install
cp /path/to/lilogwebsite/video-source/*.tsx src/
cp -r /path/to/lilogwebsite/video-source/public/pravaah public/
npx remotion render src/pravaah-entry.tsx PravaahFilm out/pravaah-sample.mp4
```

`npx remotion studio src/pravaah-entry.tsx` opens a live preview for editing.
To change the copy or the order, edit `pravaahPieces` at the bottom of `PravaahFilm.tsx`.
To change scene lengths, edit `PRAVAAH_TIMING`, which is measured in frames at 30 fps.

## Swapping in the real photography

Once the lookbook images are available, a photo layer can go behind or beside each
motif in `PieceScene`, for example `<Img src={staticFile("pravaah/nira-back.jpg")} />`
with a slow Ken Burns scale. The motifs then work as overlays.
