import React from "react";
import { Composition, registerRoot } from "remotion";
import { PravaahFilm, pravaahDuration, pravaahPieces } from "./PravaahFilm";

// Standalone entry so rendering this film does not load the other
// compositions' web fonts.
const PravaahRoot: React.FC = () => (
  <Composition
    id="PravaahFilm"
    component={PravaahFilm}
    durationInFrames={pravaahDuration(pravaahPieces.length)}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ pieces: pravaahPieces, music: "pravaah/ambient.m4a" }}
  />
);

registerRoot(PravaahRoot);
