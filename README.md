# LI'L LOG OBJECTS

**Furniture shaped by space.**

A static, build-free site for **PRAVAAH — Collection 01** — eleven pages, one stylesheet,
 three JavaScript modules, real photography from the lookbook, and an interactive
 360-degree object showroom on the home page.

## Running it

ES modules are blocked over `file://`, so the site needs to be served:

```bash
node serve.js
```

Then open <http://localhost:4321>. Any other static server works equally well.

## Pages

```
index.html        Home — 360 object hero, collection, spaces, philosophy, material, journal
collection.html   The five pieces, filterable by category
nira.html         Nira — sofa
sahaj.html        Sahaj — armchair
spand.html        Spand — center table
laya.html         Laya — swing
anvay.html        Anvay — dining set
spaces.html       Living, dining and lounge, as an architecture portfolio
studio.html       Philosophy, design, material, process
journal.html      Notes drawn from the lookbook
contact.html      Details and an enquiry form
```

## Content source

Everything — piece names, categories, descriptions and photography — comes from
`Pravaah Collection lookbook_4.pdf`.

| Piece | Type | From lookbook page |
| --- | --- | --- |
| Nira | Sofa | 4–5 |
| Sahaj | Armchair | 6–7 |
| Spand | Center table | 8–10 |
| Laya | Swing | 12–13 |
| Anvay | Dining set | 14–17 |

The collection statement on `studio.html` and the philosophy section of the home
page are the lookbook's own words. Product descriptions are used essentially
verbatim. The journal entries are written from lookbook passages (the Danish
cord back, the "still flow" pond idea, Anvay's continuity) rather than invented.

**Dimensions are listed as "on request" everywhere.** The lookbook gives no
measurements, so none are stated.

### Images

40 images were extracted from the PDF, then cropped, resized and re-encoded:
**40 MB → 3.3 MB** across 39 published files in `assets/img/`, none larger than
351 KB. Names describe the subject (`nira-back.jpg`, `spand-glass.jpg`,
`anvay-chair-woven.jpg`), so swapping in a new photograph is a file replacement.

## The hero — an object showroom

The home page hero shows one object at a time from the Pravaah collection. It is
still until you drag it. Moving the cursor never turns it — that only drifts the
drawn room behind it.

- **Drag** (mouse or touch) turns the object. Dragging one object-width is one
  full revolution; release carries a little momentum and damps out.
- **Arrows, bottom right** move to the previous or next object. The outgoing
  object travels left as the incoming one enters from the right, 820 ms, no
  page reload and no second viewer running.
- **The label is the link.** The active object's name opens its product page.
- **Keyboard**: focus the stage, then `←`/`→` to turn, `shift + ←/→` to change
  object. The arrow buttons are ordinary focusable buttons.

### Product configuration

Everything the viewer knows lives in `assets/js/collection.js`. Reordering the
array reorders the hero; adding an entry adds an object. No viewer changes.

```js
{
  id, name, category, href,      // identity and where the label links
  path, frames, initialFrame,    // NN.webp sequence, and the frame at rest
  width, height,                 // intrinsic frame size, reserves the box
  scale, maxWidth,               // width as vw, and a ceiling in px
  offsetX, offsetY,              // fine positioning, % of the object's own size
  shadow                         // drawn ground shadow opacity, 0 to omit
}
```

`frames: 1` marks a still object: no rotation, no drag affordance, and the
accessible name drops the 360 wording.

### Why not the KeyShotXR iframe

The supplied player is the reference for the rotation behaviour, and its
settings are honoured — 36 frames, wrapping, front view at frame 18, release
damping `0.96`, and the negative `uMouseSensitivity` that decides which way a
drag turns the piece. The frames themselves are used exactly as rendered.

The iframe itself is not used, because it cannot do three things this hero needs:

- **Transparency.** It paints a solid `backgroundColor` (`#FFFFFF` for Sahaj,
  `#000000` for the dining set) over renders that have alpha. The objects here
  are composited onto the drawn plaster room and carry their own ground shadow.
- **Progressive loading.** It ships `downloadOnInteraction = false`, so all 36
  frames are fetched before first paint. Across three sequences that is 46 MB.
- **Handing off.** Five iframes cannot pass one object to the next inside the
  page without running several players at once.

Frames are composited to a `<canvas>`. Swapping `src` on an `<img>` blanks the
element while the next frame decodes, which reads as a flicker on every step of
a drag; drawing an already-decoded image to a canvas is synchronous.

### Loading order

Only the resting frame is fetched eagerly. Then, during idle time:

1. **Sahaj**, outward from frame 18 — the object you can already see
2. then Nira, Spand, Laya, Anvay, in collection order

Decoded frames are held only for the object on stage and released when it leaves,
so memory does not grow as you move through the collection.

### Assets

The three supplied KeyShot XR sequences were cropped to a single alpha bounding
box per product — shared across all 36 frames, so the object never jumps — and
re-encoded as WebP with alpha. The renders are otherwise untouched.

| Object | Source | Published |
| --- | --- | --- |
| Sahaj | 36 PNG, 13.9 MB | 1.06 MB |
| Laya | 36 PNG, 15.9 MB | 1.23 MB |
| Anvay | 36 PNG, 16.3 MB | 2.51 MB |

**46 MB → 4.8 MB**, roughly 35 KB a frame, in `assets/xr/<id>/`.

### Nira and Spand have no 360 sequence

`G:\SP\Images\360 Images` contains sequences for the Sahaj chair, the swing and
the dining set only. Nira and Spand are shown as **still objects**, cut out of
their lookbook studio shots: the flat backdrop is flood-filled from the frame
edges, and the cast shadow is converted to a soft warm matte rather than being
discarded, so they sit on the floor like the rendered objects do.

To give either one real rotation, drop its frames in `assets/xr/nira/` (or
`spand/`) as `00.webp`…`35.webp` and change `frames: 1` to `frames: 36` with the
right `initialFrame`. Nothing else changes.

## The drawn room

`assets/js/objects.js` draws only the hero backdrop — a plaster wall, a warm
floor, one shaft of daylight and a contact shadow — as a couple of kilobytes of
vector geometry. The turntable frames are cropped so the piece's feet sit on the
bottom edge of the image, and that edge is anchored to the drawn floor line, so
the piece stays planted at any window shape. On narrow screens the floor line
moves up the screen and the piece is centred.

Cursor position also moves the room itself, by depth, so the wall drifts more
slowly than the piece.

## Input and degradation

| Context | Behaviour |
| --- | --- |
| Mouse | Drag the object to turn it; cursor position drifts the room only |
| Touch | Drag to turn. Vertical swipes still scroll; objects change by arrow only |
| Keyboard | Arrows turn, shift+arrows change object, once the stage has focus |
| Reduced motion, or motion off | No entrance or slide transition; rotation still works |

## Accessibility

- Skip link, visible focus rings, real headings, labelled form fields, alt text
  on every image.
- The object stage is focusable, describes itself to screen readers, and announces
  each object change through a live region.
- `prefers-reduced-motion` is honoured, and a **Motion** switch in the footer
  turns off all animation independently, persisted in `localStorage`.
- Usable with JavaScript disabled: a noscript still of Sahaj stands in for the
  viewer, and every page, image, link and form still works.

## Branding

The site is branded **LI'L LOG OBJECTS**, with **PRAVAAH / Collection 01** as the
first collection, matching the lookbook. The enquiry details on the contact page
are the ones the lookbook publishes.

## Not wired up

- The **enquiry form validates locally and confirms in place**; no mail server is
  connected. Point it at an endpoint to deliver enquiries.
- Journal entries link to the relevant product or studio page rather than to
  individual articles.
