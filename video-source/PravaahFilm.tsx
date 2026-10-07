import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
// Fonts are vendored in public/pravaah/ so rendering works offline.
const serif = "Cormorant Garamond";
const sans = "Jost";
const FONT_FILES: [string, string, string, string][] = [
  [serif, "normal", "300", "pravaah/CormorantGaramond-300-normal.woff2"],
  [serif, "normal", "400", "pravaah/CormorantGaramond-400-normal.woff2"],
  [serif, "italic", "400", "pravaah/CormorantGaramond-400-italic.woff2"],
  [sans, "normal", "300", "pravaah/Jost-300-normal.woff2"],
];
const fontHandle = delayRender("Loading Pravaah fonts");
Promise.all(
  FONT_FILES.map(([family, style, weight, file]) =>
    new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { style, weight })
      .load()
      .then((face) => document.fonts.add(face)),
  ),
)
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

const C = {
  plaster: "#F2EEE6",
  wall: "#E8E1D4",
  ink: "#2B2621",
  muted: "#7A6F62",
  timber: "#9A6B43",
  stone: "#B9AE9C",
};

export interface PravaahPiece {
  name: string;
  category: string;
  line: string;
  motif: "weave" | "curve" | "swing" | "ripple" | "join";
}

export interface PravaahFilmProps {
  [key: string]: unknown;
  pieces: PravaahPiece[];
  music?: string;
}

const ease = Easing.bezier(0.33, 0, 0.2, 1);

const fade = (f: number, start: number, end: number, len = 18) =>
  interpolate(f, [start, start + len, end - len, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ---------------------------------------------------------------------------
// Backdrop: plaster wall, warm floor band, a slowly travelling shaft of light
// ---------------------------------------------------------------------------
const Room: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const shaft = interpolate(frame, [0, durationInFrames], [-260, 260]);
  return (
    <AbsoluteFill style={{ background: C.plaster }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.plaster} 0%, ${C.wall} 72%, #DCD2C1 72.2%, #D3C7B3 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(115deg, transparent 38%, rgba(255,250,238,0.75) 46%, rgba(255,250,238,0.75) 54%, transparent 62%)",
          transform: `translateX(${shaft}px)`,
          mixBlendMode: "soft-light",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(60,45,30,0.16) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Flow lines — the "Pravaah" motif, drawn on and drifting continuously
// ---------------------------------------------------------------------------
const FlowLines: React.FC<{ opacity?: number; y?: number }> = ({ opacity = 1, y = 0 }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 70], [1, 0], { extrapolateRight: "clamp", easing: ease });
  const lines = Array.from({ length: 7 }, (_, i) => {
    const phase = frame / 45 + i * 0.55;
    const amp = 26 + i * 5;
    const base = 540 + y + (i - 3) * 22;
    let d = `M -40 ${base}`;
    for (let x = -40; x <= 1960; x += 40) {
      const yy = base + Math.sin(x / 260 + phase) * amp * Math.sin(x / 900 + 0.6);
      d += ` L ${x} ${yy.toFixed(1)}`;
    }
    return (
      <path
        key={i}
        d={d}
        fill="none"
        stroke={i % 3 === 0 ? C.timber : C.stone}
        strokeWidth={i === 3 ? 1.8 : 1.1}
        strokeOpacity={0.55 - Math.abs(i - 3) * 0.08}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw}
      />
    );
  });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", opacity }}>
      {lines}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 40 } });
  return (
    <div style={{ opacity: s, transform: `translateY(${(1 - s) * 28}px)`, filter: `blur(${(1 - s) * 6}px)`, ...style }}>
      {children}
    </div>
  );
};

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 24, letterSpacing: "0.42em", textTransform: "uppercase", color: C.muted }}>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Per-piece motion motifs (abstract — they evoke the idea, not the object)
// ---------------------------------------------------------------------------
const Motif: React.FC<{ kind: PravaahPiece["motif"] }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const grow = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const stroke = { fill: "none", stroke: C.timber, strokeWidth: 2, strokeLinecap: "round" as const };

  if (kind === "weave") {
    // Nira — closely spaced vertical cord weave
    return (
      <svg width={520} height={520} viewBox="0 0 520 520">
        {Array.from({ length: 23 }, (_, i) => {
          const x = 40 + i * 20;
          const h = 380 * interpolate(frame, [i * 1.5, i * 1.5 + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          const sway = Math.sin(t * 1.4 + i * 0.35) * 6;
          return <path key={i} d={`M ${x} 450 Q ${x + sway} ${450 - h / 2} ${x} ${450 - h}`} {...stroke} strokeWidth={1.6} stroke={i % 4 === 0 ? C.timber : C.stone} />;
        })}
        <line x1={30} x2={30 + 460 * grow} y1={452} y2={452} {...stroke} strokeWidth={3} />
      </svg>
    );
  }
  if (kind === "curve") {
    // Sahaj — one sculptural line that flows around a seated form
    return (
      <svg width={520} height={520} viewBox="0 0 520 520">
        <path d="M 80 430 C 60 250, 120 110, 260 100 S 470 230, 440 430" {...stroke} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
        <path d="M 130 430 C 120 300, 170 190, 260 185 S 400 290, 390 430" {...stroke} stroke={C.stone} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
        <circle cx={260} cy={100 + Math.sin(t * 2) * 4} r={6 * grow} fill={C.timber} />
      </svg>
    );
  }
  if (kind === "swing") {
    // Laya — a pendulum that swings and settles back to stillness
    const angle = 28 * Math.exp(-t * 0.55) * Math.cos(t * 2.4);
    return (
      <svg width={520} height={520} viewBox="0 0 520 520">
        <line x1={60} x2={460} y1={40} y2={40} {...stroke} strokeWidth={3} />
        <g transform={`rotate(${angle} 260 40)`} opacity={grow}>
          <line x1={190} y1={40} x2={190} y2={380} {...stroke} stroke={C.stone} />
          <line x1={330} y1={40} x2={330} y2={380} {...stroke} stroke={C.stone} />
          <path d="M 160 380 Q 260 420 360 380" {...stroke} strokeWidth={3} />
        </g>
        <path d="M 120 470 A 200 60 0 0 0 400 470" {...stroke} stroke={C.stone} strokeOpacity={0.5} />
      </svg>
    );
  }
  if (kind === "ripple") {
    // Spand — a pulse across still water, like the glass top over a pond
    return (
      <svg width={520} height={520} viewBox="0 0 520 520">
        {Array.from({ length: 5 }, (_, i) => {
          const p = ((t * 0.45 + i / 5) % 1);
          return <ellipse key={i} cx={260} cy={260} rx={40 + p * 210} ry={(40 + p * 210) * 0.42} {...stroke} strokeWidth={1.6} strokeOpacity={(1 - p) * grow} />;
        })}
        <ellipse cx={260} cy={260} rx={150} ry={63} fill="rgba(255,255,255,0.35)" stroke={C.timber} strokeWidth={2.5} opacity={grow} />
      </svg>
    );
  }
  // Anvay — separate lines that meet and continue as one
  return (
    <svg width={520} height={520} viewBox="0 0 520 520">
      {[-1, 0, 1].map((k) => (
        <path
          key={k}
          d={`M ${260 + k * 180} 60 C ${260 + k * 180} 220, 260 220, 260 300 L 260 470`}
          {...stroke}
          strokeWidth={k === 0 ? 3 : 2}
          stroke={k === 0 ? C.timber : C.stone}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - grow}
        />
      ))}
      <circle cx={260} cy={300} r={10 * grow} fill={C.timber} />
      <line x1={100} x2={420} y1={470} y2={470} {...stroke} strokeWidth={3} opacity={grow} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------
const Title: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade(frame, 0, len, 20), alignItems: "center", justifyContent: "center" }}>
      <FlowLines y={290} />
      <Rise delay={10}><Kicker>Li'l Log Objects</Kicker></Rise>
      <Rise delay={22}>
        <div style={{ fontFamily: serif, fontWeight: 300, fontSize: 210, color: C.ink, letterSpacing: "0.04em", lineHeight: 1.05, marginTop: 24 }}>
          Pravaah
        </div>
      </Rise>
      <Rise delay={40}><Kicker>Collection 01</Kicker></Rise>
    </AbsoluteFill>
  );
};

const Statement: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade(frame, 0, len), alignItems: "center", justifyContent: "center", padding: "0 260px", textAlign: "center" }}>
      <FlowLines opacity={0.5} y={260} />
      <Rise delay={4}>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 92, color: C.ink }}>Pravaah, meaning flow.</div>
      </Rise>
      <Rise delay={26}>
        <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 36, lineHeight: 1.55, color: C.muted, marginTop: 34 }}>
          Movement shapes form without force,
          <br />
          and stillness exists within the flow.
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

const PieceScene: React.FC<{ piece: PravaahPiece; index: number; total: number; len: number }> = ({ piece, index, total, len }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, len], [24, -24]);
  return (
    <AbsoluteFill style={{ opacity: fade(frame, 0, len, 14), flexDirection: "row", alignItems: "center", padding: "0 180px" }}>
      <div style={{ flex: 1 }}>
        <Rise delay={2}><Kicker>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {piece.category}</Kicker></Rise>
        <Rise delay={10}>
          <div style={{ fontFamily: serif, fontWeight: 300, fontSize: 190, color: C.ink, lineHeight: 1, margin: "18px 0 28px" }}>{piece.name}</div>
        </Rise>
        <Rise delay={22}>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 36, lineHeight: 1.5, color: C.muted, maxWidth: 760 }}>{piece.line}</div>
        </Rise>
      </div>
      <div style={{ transform: `translateX(${drift}px)` }}>
        <Motif kind={piece.motif} />
      </div>
    </AbsoluteFill>
  );
};

const Roster: React.FC<{ pieces: PravaahPiece[]; len: number }> = ({ pieces, len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade(frame, 0, len), alignItems: "center", justifyContent: "center" }}>
      <FlowLines opacity={0.6} y={0} />
      <div style={{ display: "flex", gap: 70, background: "rgba(242,238,230,0.85)", padding: "20px 50px" }}>
        {pieces.map((p, i) => (
          <Rise key={p.name} delay={6 + i * 7}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: 88, fontWeight: 400, color: C.ink }}>{p.name}</div>
              <div style={{ fontFamily: sans, fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginTop: 6 }}>{p.category}</div>
            </div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [len - 20, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Rise delay={4}><Kicker>Furniture shaped by space</Kicker></Rise>
      <Rise delay={16}>
        <div style={{ fontFamily: serif, fontWeight: 300, fontSize: 120, color: C.ink, margin: "26px 0" }}>Li'l Log Objects</div>
      </Rise>
      <Rise delay={30}>
        <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 30, color: C.timber, letterSpacing: "0.12em" }}>Discover the Pravaah collection</div>
      </Rise>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const PRAVAAH_TIMING = { title: 120, statement: 120, piece: 96, roster: 105, end: 105 };

export const pravaahDuration = (n: number) =>
  PRAVAAH_TIMING.title + PRAVAAH_TIMING.statement + PRAVAAH_TIMING.piece * n + PRAVAAH_TIMING.roster + PRAVAAH_TIMING.end;

export const PravaahFilm: React.FC<PravaahFilmProps> = ({ pieces, music }) => {
  const { durationInFrames } = useVideoConfig();
  const T = PRAVAAH_TIMING;
  let at = 0;
  const seq = (len: number, node: React.ReactNode, key: string) => {
    const from = at;
    at += len;
    return (
      <Sequence key={key} from={from} durationInFrames={len}>
        {node}
      </Sequence>
    );
  };
  return (
    <AbsoluteFill>
      <Room />
      {seq(T.title, <Title len={T.title} />, "title")}
      {seq(T.statement, <Statement len={T.statement} />, "statement")}
      {pieces.map((p, i) => seq(T.piece, <PieceScene piece={p} index={i} total={pieces.length} len={T.piece} />, p.name))}
      {seq(T.roster, <Roster pieces={pieces} len={T.roster} />, "roster")}
      {seq(T.end, <EndCard len={T.end} />, "end")}
      {music && (
        <Audio
          src={staticFile(music)}
          volume={(f) =>
            interpolate(f, [0, 45, durationInFrames - 60, durationInFrames], [0, 0.8, 0.8, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      )}
    </AbsoluteFill>
  );
};

export const pravaahPieces: PravaahPiece[] = [
  { name: "Nira", category: "Sofa", line: "Calm on the surface, carrying an effortless sense of movement within.", motif: "weave" },
  { name: "Sahaj", category: "Armchair", line: "Effortless and natural — a sculptural frame that flows around the body.", motif: "curve" },
  { name: "Spand", category: "Center table", line: "A pulse of glass, held between sculptural timber forms.", motif: "ripple" },
  { name: "Laya", category: "Swing", line: "Rhythm held in balance; motion that returns to stillness.", motif: "swing" },
  { name: "Anvay", category: "Dining set", line: "Connection and continuity, set in stone and warm timber.", motif: "join" },
];
