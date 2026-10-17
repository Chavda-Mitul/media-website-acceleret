"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { preload } from "react-dom";
import { gsap, useGSAP } from "@/lib/gsap";
import { media } from "@/lib/media";
import { EASE_REVEAL, onIntroCue } from "@/lib/motion";
import { Button, PlayGlyph } from "@/components/ui/Button";
import { MaskedWords } from "@/components/ui/MaskedWords";
import { ReelDialog } from "@/components/ui/ReelDialog";

type Stat = { value: string; suffix?: string; label: string };

type ParticleHeroProps = {
  /** Logo in /public. Its first block of ink from the top (the mark, above any wordmark) is sampled in its own colours.
   * Defaults to the mark cropped out of /AM.png. */
  src?: string;
  /** Accessible name for the particle logo. */
  logoLabel?: string;
  heading?: string;
  /** What the studio makes: the line beside the headline. */
  tagline?: string;
  stats?: Stat[];
  /** Stream the mark away as the page scrolls over this section (the homepage's opening stage). */
  recede?: boolean;
};

// Placeholder copy — replace with your own.
const DEFAULT_HEADING = "Independent media, made to move.";
const DEFAULT_TAGLINE = "We build films, campaigns and social stories audiences can’t scroll past.";
const DEFAULT_STATS: Stat[] = [
  { value: "150", suffix: "+", label: "Projects" },
  { value: "12", suffix: "+", label: "Years" },
  { value: "40", suffix: "+", label: "Brands" },
];

/*
 * The opening stage is a sheet of paper with the Acceleret mark on it in particles, in the logo's own colours.
 * The mark's play triangle is the brand's play button, so the hero borrows from video. On load the mark plays
 * out of a timeline: a playhead runs along a thin bar and the particles rise out of it into the logo. The
 * triangle lights up and opens the reel. Scrolling away fast-forwards the mark off to the right.
 */

/* -------------------------------------------------------------------------------------------------
 * Tuning. Distances are CSS px; rates are per 60fps frame (the simulation is scaled by real frame time).
 * -----------------------------------------------------------------------------------------------*/

/** Logo-slot area (px²) per particle, so density stays even across screen sizes. Dark ink on paper only reads
 * as solid when the grains nearly touch, so this is denser than a glow on black would need. */
const DENSITY = 5.5;
const MIN_PARTICLES = 6000;
const MAX_PARTICLES = 30000;
/** Lower cap on touch devices, which tend to have weaker GPUs. */
const MAX_PARTICLES_TOUCH = 16000;

const PHYSICS = {
  /** Pull towards home. Each particle varies ±40%, so the logo re-forms in soft waves, not in lockstep. */
  spring: 0.012,
  /** Share of velocity kept each frame. */
  friction: 0.87,
  /** Cursor radius as a fraction of the logo size, clamped to [radiusMin, radiusMax]. */
  radius: 0.24,
  radiusMin: 70,
  radiusMax: 170,
  /** Outward push at the cursor (px/frame²). */
  repel: 2.6,
  /** Share of the cursor's velocity handed to particles it sweeps through: the wake. */
  stir: 0.2,
  /** Sideways push, so scattered particles curl around the cursor instead of fanning straight out. */
  swirl: 0.4,
  maxSpeed: 40,
  /** While the play is lit, the cursor's push drops to this share, so the triangle holds together under it. */
  playCalm: 0,
};

const AMBIENT = {
  /** Whole-logo scale swing and vertical float (fractions of the logo size). */
  breathe: 0.012,
  float: 0.008,
  /** Per-particle drift (px), and the share of loose particles that stray further. */
  drift: 0.9,
  strayShare: 0.05,
  strayDrift: 10,
};

/** The intro: the mark plays out of a timeline bar under it as a playhead runs along. */
const INTRO = {
  /** Wait after the "nav" cue, so the loader's curtain has lifted off the mark first (ms). */
  delay: 350,
  /** The playhead's run across the mark (ms). */
  sweep: 1300,
  /** Its fade-out once it reaches the end (ms). */
  fade: 450,
  /** Gap between the mark and the bar, and the bar's thickness (fractions of the logo size). */
  barGap: 0.07,
  barHeight: 0.012,
};

/** The lit play: a glint runs left to right through the triangle, once per this long (ms). */
const SHEEN_MS = 1400;

/** Scrolling away streams the mark off in the play direction, rising slightly, and fades it to `fadeTo`. */
const STREAM = { rise: 0.25, fadeTo: 0.15 };

/** Soft "ink bleed" under the particles, in their own colours, so the grain reads as a solid mark. */
const BLEED = { size: 9, alpha: 0.55, count: 10000 };

/** Long side (px) the mark is sampled at. */
const SAMPLE_SIZE = 720;

/** Particle kinds: the A, and the play triangle (the logo's saturated blue). */
const KIND_A = 0;
const KIND_PLAY = 1;

/* -------------------------------------------------------------------------------------------------
 * Logo sampling
 * -----------------------------------------------------------------------------------------------*/

type LogoSample = {
  count: number;
  /** Home positions as xy pairs, centred on the mark's ink bounds and normalised to their longer side. */
  home: Float32Array;
  /** rgba per particle, in the logo's own colours. */
  color: Uint8ClampedArray;
  /** KIND_A or KIND_PLAY per particle. */
  kind: Float32Array;
  /** Ink bounds width and height as fractions of their longer side. */
  extent: [number, number];
  /** The play triangle's bounds in home space: left, top, right, bottom. */
  play: [number, number, number, number];
};

type Pixels = { px: Uint8ClampedArray; w: number; h: number };
type Background = { transparent: boolean; rgb: number[] };

/** Draws the `[x, y, w, h]` region of an image at `scale` and reads its pixels back. */
function readPixels(img: HTMLImageElement, [sx, sy, sw, sh]: number[], scale: number): Pixels {
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return { px: ctx.getImageData(0, 0, w, h).data, w, h };
}

/** The corners tell us what "background" is. */
function backgroundOf({ px, w, h }: Pixels): Background {
  const corners = [0, w - 1, (h - 1) * w, h * w - 1].map((i) => i * 4);
  return {
    transparent: corners.some((o) => px[o + 3] < 16),
    rgb: [0, 1, 2].map((c) => corners.reduce((sum, o) => sum + px[o + c], 0) / corners.length),
  };
}

/** Ink weight (0–1) per pixel: by alpha on a transparent image, by distance from the background on an opaque one. */
function inkOf({ px, w, h }: Pixels, { transparent, rgb }: Background) {
  const ink = new Float32Array(w * h);
  for (let i = 0, o = 0; i < w * h; i++, o += 4) {
    const alpha = px[o + 3] / 255;
    const distance = Math.max(Math.abs(px[o] - rgb[0]), Math.abs(px[o + 1] - rgb[1]), Math.abs(px[o + 2] - rgb[2]));
    ink[i] = transparent ? alpha : alpha * Math.min(1, Math.max(0, (distance - 24) / 60));
  }
  return ink;
}

async function sampleLogo(src: string, budget: number): Promise<LogoSample> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const { naturalWidth: nw, naturalHeight: nh } = img;

  // Find the mark: the first block of ink rows from the top. A wordmark below it, after a gap, is left out.
  const probeScale = Math.min(1, 256 / Math.max(nw, nh));
  const probe = readPixels(img, [0, 0, nw, nh], probeScale);
  const background = backgroundOf(probe);
  const probeInk = inkOf(probe, background);
  const inked = (x: number, y: number) => probeInk[y * probe.w + x] > 0.5;
  const minGap = Math.max(2, Math.round(probe.h * 0.015));
  let top = -1;
  let bottom = -1;
  for (let y = 0, blank = 0; y < probe.h; y++) {
    let any = false;
    for (let x = 0; x < probe.w && !any; x++) any = inked(x, y);
    if (any) {
      if (top < 0) top = y;
      bottom = y;
      blank = 0;
    } else if (top >= 0 && ++blank >= minGap) {
      break;
    }
  }
  if (top < 0) throw new Error(`ParticleHero: no logo pixels found in ${src}`);
  let left = probe.w;
  let right = 0;
  for (let y = top; y <= bottom; y++) {
    for (let x = 0; x < probe.w; x++) {
      if (!inked(x, y)) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }

  // Sample that block (plus a probe pixel of margin, for antialiased edges) in detail.
  const sx = Math.max(0, left - 1) / probeScale;
  const sy = Math.max(0, top - 1) / probeScale;
  const sw = Math.min(probe.w, right + 2) / probeScale - sx;
  const sh = Math.min(probe.h, bottom + 2) / probeScale - sy;
  const scan = readPixels(img, [sx, sy, sw, sh], Math.min(2, SAMPLE_SIZE / Math.max(sw, sh)));
  const { px, w, h } = scan;
  const ink = inkOf(scan, background);

  // Bounds of solid ink.
  let inkCount = 0;
  let [minX, minY, maxX, maxY] = [w, h, 0, 0];
  for (let i = 0; i < w * h; i++) {
    if (ink[i] <= 0.5) continue;
    const x = i % w;
    const y = (i / w) | 0;
    inkCount++;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  if (!inkCount) throw new Error(`ParticleHero: no logo pixels found in ${src}`);

  // Stratified jitter: one random candidate per grid cell, kept with probability = ink weight,
  // so the spread looks organic and antialiased edges thin out instead of forming a hard rim.
  const step = Math.max(1, Math.sqrt(inkCount / budget));
  const size = Math.max(maxX - minX, maxY - minY) + 1;
  const cx = (minX + maxX + 1) / 2;
  const cy = (minY + maxY + 1) / 2;
  const home: number[] = [];
  const color: number[] = [];
  const kind: number[] = [];
  const play = [Infinity, Infinity, -Infinity, -Infinity];
  for (let gy = minY; gy <= maxY; gy += step) {
    for (let gx = minX; gx <= maxX; gx += step) {
      const x = gx + Math.random() * step;
      const y = gy + Math.random() * step;
      const i = Math.min(h - 1, y | 0) * w + Math.min(w - 1, x | 0);
      if (Math.random() >= ink[i]) continue;
      const [r, g, b] = [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]];
      const hx = (x - cx) / size;
      const hy = (y - cy) / size;
      // The play is the logo's saturated blue; the A is a near-neutral slate.
      const isPlay = Math.max(r, g, b) - Math.min(r, g, b) > 60;
      if (isPlay) {
        play[0] = Math.min(play[0], hx);
        play[1] = Math.min(play[1], hy);
        play[2] = Math.max(play[2], hx);
        play[3] = Math.max(play[3], hy);
      }
      home.push(hx, hy);
      color.push(r, g, b, 255 * (0.9 + Math.random() * 0.1));
      kind.push(isPlay ? KIND_PLAY : KIND_A);
    }
  }

  // Shuffle, so any prefix (the bleed pass draws one) is an even sample of the whole mark.
  const count = kind.length;
  for (let i = count - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    for (let c = 0; c < 2; c++) [home[i * 2 + c], home[j * 2 + c]] = [home[j * 2 + c], home[i * 2 + c]];
    for (let c = 0; c < 4; c++) [color[i * 4 + c], color[j * 4 + c]] = [color[j * 4 + c], color[i * 4 + c]];
    [kind[i], kind[j]] = [kind[j], kind[i]];
  }

  return {
    count,
    home: new Float32Array(home),
    color: new Uint8ClampedArray(color),
    kind: new Float32Array(kind),
    extent: [(maxX - minX + 1) / size, (maxY - minY + 1) / size],
    play: Number.isFinite(play[0]) ? (play as LogoSample["play"]) : [0, 0, 0, 0],
  };
}

/* -------------------------------------------------------------------------------------------------
 * WebGL renderer: one point per particle, over a soft "ink bleed" pass in the particles' own colours.
 * -----------------------------------------------------------------------------------------------*/

const VERTEX_SHADER = `
attribute vec2 a_pos;
attribute vec4 a_color;
attribute vec3 a_seed; // point size, phase, drift amplitude
attribute float a_kind; // 0 the A, 1 the play

uniform vec2 u_view;
uniform float u_dpr;
uniform float u_scale;
uniform float u_time;
uniform float u_alpha;     // the whole mark (fades as the page scrolls away)
uniform float u_play;      // 0-1: the play is lit
uniform vec2 u_band;       // the play's left edge and width (CSS px), where the glint runs
uniform float u_sheen;     // the glint's position across the play; below 0 lights the play evenly
uniform float u_glow;      // bleed point size in CSS px; 0 for the particle pass
uniform float u_glowAlpha;

varying vec4 v_color;
varying float v_glow;

void main() {
  float ph = a_seed.y;
  vec2 drift = a_seed.z * u_scale * vec2(
    sin(u_time * (0.5 + fract(ph * 1.7)) + ph),
    cos(u_time * (0.4 + fract(ph * 2.3)) + ph * 1.3)
  );
  vec2 p = a_pos + drift;
  vec2 clip = p / u_view * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  // The lit play: a glint runs through the triangle (lighter, larger points) and the A steps back a little.
  float isPlay = step(0.5, a_kind);
  float across = (p.x - u_band.x) / max(1.0, u_band.y);
  float band = u_sheen < 0.0 ? 1.0 : exp(-pow((across - u_sheen) * 4.0, 2.0));
  float lift = isPlay * u_play * band;
  vec3 rgb = mix(a_color.rgb, vec3(0.62, 0.86, 1.0), 0.7 * lift);

  float twinkle = 0.9 + 0.1 * sin(u_time * (1.0 + fract(ph * 3.1) * 1.5) + ph * 6.2832);
  float alpha = a_color.a * u_alpha * (1.0 - 0.3 * u_play * (1.0 - isPlay)) * (u_glow > 0.0 ? u_glowAlpha : twinkle);
  gl_PointSize = (u_glow > 0.0 ? u_glow : a_seed.x * (1.0 + 0.8 * lift)) * u_scale * u_dpr;
  v_color = vec4(rgb * alpha, alpha);
  v_glow = u_glow > 0.0 ? 1.0 : 0.0;
}`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;
varying float v_glow;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float mask = v_glow > 0.5 ? exp(-4.0 * d * d) : 1.0 - smoothstep(0.5, 1.0, d);
  gl_FragColor = v_color * mask;
}`;

const UNIFORMS = [
  "u_view",
  "u_dpr",
  "u_scale",
  "u_time",
  "u_alpha",
  "u_play",
  "u_band",
  "u_sheen",
  "u_glow",
  "u_glowAlpha",
] as const;

type FrameState = {
  width: number;
  height: number;
  dpr: number;
  scale: number;
  time: number;
  /** The whole mark's opacity. */
  alpha: number;
  /** 0–1: the play is lit. */
  play: number;
  /** Where the glint runs: the play's left edge and width (CSS px). */
  band: [number, number];
  /** The glint's position across the play (below 0: an even highlight). */
  sheen: number;
};

type Renderer = {
  draw(state: FrameState): void;
  dispose(): void;
};

function createRenderer(
  gl: WebGLRenderingContext,
  data: { pos: Float32Array; color: Uint8ClampedArray; seed: Float32Array; kind: Float32Array; count: number },
): Renderer {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX_SHADER],
    [gl.FRAGMENT_SHADER, FRAGMENT_SHADER],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "program");
  gl.useProgram(program);

  const attribute = (name: string, array: ArrayBufferView, size: number, type: number, usage: number) => {
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, usage);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, type, type === gl.UNSIGNED_BYTE, 0, 0);
    return buffer;
  };
  const buffers = [
    attribute("a_color", data.color, 4, gl.UNSIGNED_BYTE, gl.STATIC_DRAW),
    attribute("a_seed", data.seed, 3, gl.FLOAT, gl.STATIC_DRAW),
    attribute("a_kind", data.kind, 1, gl.FLOAT, gl.STATIC_DRAW),
    // Last, so it stays bound for the per-frame upload.
    attribute("a_pos", data.pos, 2, gl.FLOAT, gl.DYNAMIC_DRAW),
  ];
  const u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
    (typeof UNIFORMS)[number],
    WebGLUniformLocation | null
  >;

  // Premultiplied "over" for both passes: dark and blue ink on paper.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const bleedCount = Math.min(data.count, BLEED.count);

  return {
    draw({ width, height, dpr, scale, time, alpha, play, band, sheen }) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.pos);
      gl.uniform2f(u.u_view, width, height);
      gl.uniform1f(u.u_dpr, dpr);
      gl.uniform1f(u.u_scale, scale);
      gl.uniform1f(u.u_time, time);
      gl.uniform1f(u.u_alpha, alpha);
      gl.uniform1f(u.u_play, play);
      gl.uniform2f(u.u_band, band[0], band[1]);
      gl.uniform1f(u.u_sheen, sheen);

      // Ink bleed: soft points behind the particles.
      gl.uniform1f(u.u_glow, BLEED.size);
      gl.uniform1f(u.u_glowAlpha, BLEED.alpha);
      gl.drawArrays(gl.POINTS, 0, bleedCount);

      gl.uniform1f(u.u_glow, 0);
      gl.drawArrays(gl.POINTS, 0, data.count);
    },
    dispose() {
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      gl.deleteProgram(program);
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Particle field: sampling, the timeline intro, physics, input, resize and lifecycle.
 * -----------------------------------------------------------------------------------------------*/

type FieldOptions = {
  canvas: HTMLCanvasElement;
  /** Element the canvas fills; also receives the CSS variables that place the playhead and the play's hit area. */
  stage: HTMLElement;
  /** Box the logo is fitted into. */
  slot: HTMLElement;
  src: string;
  reducedMotion: boolean;
};

type ParticleField = ReturnType<typeof mountParticleField>;

function mountParticleField({ canvas, stage, slot, src, reducedMotion }: FieldOptions) {
  let disposed = false;
  let raf = 0;
  let visible = true;
  let started = false;
  let wantsAssemble = false;
  let born = 0;
  let last = 0;
  /** When the playhead sets off (performance.now()). Particles wait on the bar until it reaches them. */
  let sweepAt = -Infinity;
  /** True while the playhead's CSS variables still change. */
  let sweeping = false;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let layout = { cx: 0, cy: 0, size: 0 };
  let radius = PHYSICS.radiusMin;

  // How far the page has scrolled past the stage (0–1), and the lit play (eased towards its target each frame).
  let receded = 0;
  let playTarget = 0;
  let playGlow = 0;
  let sheenAt = 0;

  let sample: LogoSample | null = null;
  let count = 0;
  let pos = new Float32Array(0);
  let vel = new Float32Array(0);
  let spring = new Float32Array(0);
  let seed = new Float32Array(0);
  /** When each particle leaves the bar: ms after the playhead sets off (it reaches the particle's x then). */
  let release = new Float32Array(0);
  /** Where each particle streams to as the page scrolls away: along the play direction, and across it. */
  let stream = new Float32Array(0);
  let gl: WebGLRenderingContext | null = null;
  let renderer: Renderer | null = null;
  let ctx2d: CanvasRenderingContext2D | null = null;

  // Pointer, in client coordinates. Converted to canvas space every frame, so scrolling under
  // a still cursor stirs the particles too.
  const pointer = { x: -1e5, y: -1e5, active: false, fresh: true };
  let strength = 0;
  let prevX = 0;
  let prevY = 0;
  let pvx = 0;
  let pvy = 0;

  const sizeScale = () => Math.min(1.35, Math.max(0.8, layout.size / 560));
  /** The timeline bar's y, just under the mark. */
  const barY = () => layout.cy + (sample!.extent[1] / 2 + INTRO.barGap) * layout.size;

  // Places the playhead and the play's hit area (the component positions them with these variables).
  function publish() {
    const { cx, cy, size } = layout;
    const [ew, eh] = sample!.extent;
    const [left, top, right, bottom] = sample!.play;
    const vars = {
      "--mark-l": cx - (ew / 2) * size,
      "--mark-t": cy - (eh / 2) * size,
      "--mark-w": ew * size,
      "--bar-y": barY(),
      "--play-l": cx + left * size,
      "--play-t": cy + top * size,
      "--play-w": (right - left) * size,
      "--play-h": (bottom - top) * size,
    };
    for (const [name, value] of Object.entries(vars)) stage.style.setProperty(name, `${value}px`);
  }

  // The playhead: fading in as it sets off, running across the mark, then fading out at the end.
  function sweepTo(run: number) {
    const opacity =
      run < 0 ? 0 : run < INTRO.sweep ? Math.min(1, run / 150) : Math.max(0, 1 - (run - INTRO.sweep) / INTRO.fade);
    stage.style.setProperty("--sweep", `${Math.min(1, Math.max(0, run / INTRO.sweep))}`);
    stage.style.setProperty("--sweep-o", `${opacity}`);
    if (run > INTRO.sweep + INTRO.fade) sweeping = false;
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (!sample) return;

    // Fit the mark's ink bounds inside the slot.
    const box = slot.getBoundingClientRect();
    const next = {
      cx: box.left - rect.left + box.width / 2,
      cy: box.top - rect.top + box.height / 2,
      size: Math.min(box.width / sample.extent[0], box.height / sample.extent[1]),
    };
    // Carry particles with the logo, so a resize doesn't fling them across the screen.
    if (layout.size) {
      const k = next.size / layout.size;
      for (let j = 0; j < pos.length; j += 2) {
        pos[j] = next.cx + (pos[j] - layout.cx) * k;
        pos[j + 1] = next.cy + (pos[j + 1] - layout.cy) * k;
      }
    }
    layout = next;
    radius = Math.min(PHYSICS.radiusMax, Math.max(PHYSICS.radiusMin, layout.size * PHYSICS.radius));
    publish();

    if (ctx2d && started) drawStatic();
    else if (renderer && started && !raf) render(last);
  }

  function render(now: number) {
    const [left, , right] = sample!.play;
    renderer!.draw({
      width,
      height,
      dpr,
      scale: sizeScale(),
      time: reducedMotion ? 0 : (now - born) / 1000,
      alpha: 1 - (1 - STREAM.fadeTo) * receded,
      play: playGlow,
      band: [layout.cx + left * layout.size, (right - left) * layout.size],
      // From just before the triangle's left edge to just past its point, then again.
      sheen: reducedMotion ? -1 : (((now - sheenAt) / SHEEN_MS) % 1) * 1.6 - 0.3,
    });
  }

  // No WebGL: a still logo drawn once per resize.
  function drawStatic() {
    const { home, color, count } = sample!;
    const s = 1.6 * sizeScale();
    ctx2d!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2d!.clearRect(0, 0, width, height);
    for (let i = 0; i < count; i++) {
      ctx2d!.fillStyle = `rgba(${color[i * 4]},${color[i * 4 + 1]},${color[i * 4 + 2]},${color[i * 4 + 3] / 255})`;
      ctx2d!.fillRect(layout.cx + home[i * 2] * layout.size - s / 2, layout.cy + home[i * 2 + 1] * layout.size - s / 2, s, s);
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(3, Math.max(0.1, (now - last) / 16.667));
    last = now;
    const t = reducedMotion ? 0 : (now - born) / 1000;
    const run = now - sweepAt;
    if (sweeping) sweepTo(run);
    playGlow += (playTarget - playGlow) * (1 - 0.86 ** dt);

    // The logo breathes and floats; particles chase these moving homes on their springs.
    const scale = layout.size * (1 + AMBIENT.breathe * Math.sin(t * 1.2));
    const ox = layout.cx;
    const oy = layout.cy + Math.sin(t * 0.8) * layout.size * AMBIENT.float;
    // Scrolling away fast-forwards the mark: it holds at first, then streams off in the play direction.
    const blow = receded ** 2 * layout.size;

    // Cursor position and (smoothed) velocity in canvas space.
    const rect = canvas.getBoundingClientRect();
    const mx = pointer.x - rect.left;
    const my = pointer.y - rect.top;
    if (pointer.fresh) {
      prevX = mx;
      prevY = my;
      pointer.fresh = false;
    }
    const follow = 1 - 0.5 ** dt;
    pvx += (Math.max(-60, Math.min(60, (mx - prevX) / dt)) - pvx) * follow;
    pvy += (Math.max(-60, Math.min(60, (my - prevY) / dt)) - pvy) * follow;
    prevX = mx;
    prevY = my;
    strength += ((pointer.active ? 1 : 0) - strength) * (1 - 0.85 ** dt);
    // The lit play holds together under the cursor.
    const push = strength * (1 - (1 - PHYSICS.playCalm) * playGlow);

    const { home } = sample!;
    const r2 = radius * radius;
    const damp = PHYSICS.friction ** dt;
    const max2 = PHYSICS.maxSpeed ** 2;
    const interact = push > 0.01;

    for (let i = 0, j = 0; i < count; i++, j += 2) {
      // Still on the timeline bar: it rises when the playhead reaches its x.
      if (run < release[i]) continue;
      const x = pos[j];
      const y = pos[j + 1];
      let ax = (ox + home[j] * scale + stream[j] * blow - x) * spring[i];
      let ay = (oy + home[j + 1] * scale + (stream[j + 1] - STREAM.rise * stream[j]) * blow - y) * spring[i];

      if (interact) {
        const dx = x - mx;
        const dy = y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const d = Math.sqrt(d2) + 0.001;
          const falloff = (1 - d / radius) ** 2 * push;
          const nx = dx / d;
          const ny = dy / d;
          ax += (nx * PHYSICS.repel - ny * PHYSICS.swirl + pvx * PHYSICS.stir) * falloff;
          ay += (ny * PHYSICS.repel + nx * PHYSICS.swirl + pvy * PHYSICS.stir) * falloff;
        }
      }

      let vx = (vel[j] + ax * dt) * damp;
      let vy = (vel[j + 1] + ay * dt) * damp;
      const v2 = vx * vx + vy * vy;
      if (v2 > max2) {
        const k = PHYSICS.maxSpeed / Math.sqrt(v2);
        vx *= k;
        vy *= k;
      }
      vel[j] = vx;
      vel[j + 1] = vy;
      pos[j] = x + vx * dt;
      pos[j + 1] = y + vy * dt;
    }

    render(now);
  }

  function play() {
    if (raf || !started || !visible || !renderer) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  // The mark waits on its timeline bar, then plays out of it as the playhead runs along
  // (with reduced motion it is simply in place).
  function begin() {
    started = true;
    if (ctx2d) return drawStatic();
    if (!reducedMotion) {
      // Every particle waits on the bar at its own x, so the bar carries the mark's colours left to right.
      const y = barY();
      const thickness = INTRO.barHeight * layout.size;
      for (let j = 0; j < pos.length; j += 2) {
        pos[j] = layout.cx + sample!.home[j] * layout.size;
        pos[j + 1] = y + (Math.random() - 0.5) * thickness;
        vel[j] = 0;
        vel[j + 1] = 0;
      }
      sweepAt = performance.now() + INTRO.delay;
      sweeping = true;
      sweepTo(-1);
    }
    play();
  }

  function setup(logo: LogoSample) {
    sample = logo;
    count = logo.count;
    pos = new Float32Array(count * 2);
    vel = new Float32Array(count * 2);
    spring = new Float32Array(count);
    seed = new Float32Array(count * 3);
    release = new Float32Array(count);
    stream = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      spring[i] = PHYSICS.spring * (0.6 + Math.random() * 0.8);
      const stray = Math.random() < AMBIENT.strayShare;
      seed[i * 3] = 1.6 + Math.random() ** 2 * 1.8;
      seed[i * 3 + 1] = Math.random() * 100;
      seed[i * 3 + 2] = (stray ? AMBIENT.strayDrift : AMBIENT.drift) * (0.4 + Math.random() * 0.6);
      // The playhead reaches this x at that share of its run (plus a little scatter, so columns don't rise in lockstep).
      release[i] = (logo.home[i * 2] / logo.extent[0] + 0.5) * INTRO.sweep + Math.random() * 60;
      stream[i * 2] = 0.3 + Math.random();
      stream[i * 2 + 1] = (Math.random() - 0.5) * 0.7;
    }

    resize();
    for (let j = 0; j < pos.length; j += 2) {
      pos[j] = layout.cx + logo.home[j] * layout.size;
      pos[j + 1] = layout.cy + logo.home[j + 1] * layout.size;
    }

    gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true });
    try {
      if (gl) renderer = createRenderer(gl, { pos, color: logo.color, seed, kind: logo.kind, count });
    } catch (error) {
      console.error("ParticleHero: WebGL setup failed.", error);
    }
    if (!renderer) ctx2d = canvas.getContext("2d");
    born = performance.now();
    if (wantsAssemble) begin();
  }

  // --- Input -----------------------------------------------------------------------------------
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    if (!pointer.active) pointer.fresh = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  };
  const onPointerOut = (event: PointerEvent) => {
    if (!event.relatedTarget) pointer.active = false; // left the window
  };
  // Touch is tracked separately: pointer events stop (pointercancel) once the page starts scrolling.
  const onTouch = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) {
      pointer.active = false;
      return;
    }
    if (event.type === "touchstart") pointer.fresh = true;
    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
    pointer.active = true;
  };
  const onBlur = () => (pointer.active = false);

  const passive = { passive: true } as const;
  window.addEventListener("pointermove", onPointerMove, passive);
  document.addEventListener("pointerout", onPointerOut, passive);
  window.addEventListener("blur", onBlur);
  for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"] as const) {
    window.addEventListener(type, onTouch, passive);
  }

  // --- Resize, visibility, context loss ---------------------------------------------------------
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  });
  visibilityObserver.observe(stage);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    pause();
    renderer = null;
  };
  const onContextRestored = () => {
    if (!gl || !sample) return;
    renderer = createRenderer(gl, { pos, color: sample.color, seed, kind: sample.kind, count });
    play();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  // --- Load ------------------------------------------------------------------------------------
  const box = slot.getBoundingClientRect();
  const cap = window.matchMedia("(pointer: coarse)").matches ? MAX_PARTICLES_TOUCH : MAX_PARTICLES;
  const budget = Math.round(Math.min(cap, Math.max(MIN_PARTICLES, (box.width * box.height) / DENSITY)));
  sampleLogo(src, budget)
    .then((logo) => !disposed && setup(logo))
    .catch((error) => console.error(error));

  return {
    /** Starts the timeline intro (waits for the logo if it's still loading). */
    assemble() {
      wantsAssemble = true;
      if (sample && !started) begin();
    },
    /** Lights the play up while the reel button, or the triangle itself, is hovered or focused. */
    highlight(on: boolean) {
      // The glint starts from the triangle's left edge each time it lights up.
      if (on && !playTarget) sheenAt = performance.now();
      playTarget = on ? 1 : 0;
    },
    /** How far the page has scrolled past the stage, 0–1. */
    recede(progress: number) {
      receded = progress;
    },
    destroy() {
      disposed = true;
      pause();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", onBlur);
      for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"] as const) {
        window.removeEventListener(type, onTouch);
      }
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      // The context itself is left alone: in dev, Strict Mode re-runs the effect on this same canvas.
      renderer?.dispose();
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------------------------*/

// Placed by the particle field's CSS variables (see publish/sweepTo). Hidden until it sets off.
const PLAYHEAD_STYLE: CSSProperties = {
  left: "calc(var(--mark-l, 0px) + var(--sweep, 0) * var(--mark-w, 0px))",
  top: "calc(var(--mark-t, 0px) - 1rem)",
  height: "calc(var(--bar-y, 0px) - var(--mark-t, 0px) + 1.5rem)",
  opacity: "var(--sweep-o, 0)",
};
const PLAY_AREA_STYLE: CSSProperties = {
  left: "var(--play-l, 0px)",
  top: "var(--play-t, 0px)",
  width: "var(--play-w, 0px)",
  height: "var(--play-h, 0px)",
};

export function ParticleHero({
  src = media.particleMark,
  logoLabel = "Acceleret Media",
  heading = DEFAULT_HEADING,
  tagline = DEFAULT_TAGLINE,
  stats = DEFAULT_STATS,
  recede = false,
}: ParticleHeroProps) {
  // The first screen is this mark, but it's only requested once the particle effect runs: list it in the HTML
  // head so it downloads alongside the scripts.
  preload(src, { as: "image", fetchPriority: "high" });
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const field = useRef<ParticleField | null>(null);
  // Last scroll-away progress, for a field that mounts after the scroll trigger first reports.
  const receded = useRef(0);
  const [reelOpen, setReelOpen] = useState(false);

  // Particle field: browser-only, so it lives entirely in this effect.
  useEffect(() => {
    const instance = mountParticleField({
      canvas: canvasRef.current!,
      stage: root.current!,
      slot: slotRef.current!,
      src,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    field.current = instance;
    instance.recede(receded.current);
    // On the homepage the intro starts as the loader's curtain lifts (the "nav" cue), so the mark is already on
    // its timeline as the page appears; without the loader it fires once fonts load.
    const offCue = onIntroCue("nav", instance.assemble);
    return () => {
      offCue();
      instance.destroy();
      field.current = null;
    };
  }, [src]);

  // Copy rises word by word as the mark plays in (same reveal as the rest of the site).
  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>("[data-particle-word]", root.current);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(words, { y: 0, yPercent: 110 });

        // The stage recedes as the story's first sheet slides up over it: the copy sinks and fades, and the mark
        // streams away. Only the copy moves here. The logo slot must stay put, because the particle field measures
        // it. Opacity rather than autoAlpha keeps the h1 in the accessibility tree.
        if (recede) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  receded.current = self.progress;
                  field.current?.recede(self.progress);
                },
              },
            })
            .to([headingRef.current, asideRef.current], { y: () => window.innerHeight * 0.18, opacity: 0, ease: "none" }, 0);
        }

        const offIntro = onIntroCue("page", () =>
          gsap.to(words, { yPercent: 0, duration: 1.1, ease: EASE_REVEAL, stagger: 0.03, delay: 0.35 }),
        );
        return () => {
          offIntro();
          receded.current = 0;
          field.current?.recede(0);
        };
      });
    },
    { scope: root, dependencies: [recede] },
  );

  return (
    <section
      ref={root}
      aria-label="Introduction"
      className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-tiny-white text-tiny-black lg:h-svh lg:min-h-[44rem]"
    >
      {/* The particle logo, drawn over the whole stage. */}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* The playhead that plays the mark out of its timeline bar on load: a hairline with the logo's ▶ on top. */}
      <div aria-hidden="true" className="pointer-events-none absolute w-px bg-current" style={PLAYHEAD_STYLE}>
        <svg viewBox="0 0 8 10" className="absolute left-1/2 top-0 block size-2 -translate-x-1/2 rotate-90">
          <path d="M0 0L8 5L0 10V0Z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative grid flex-1 grid-rows-[minmax(15rem,1fr)_auto] gap-y-10 px-gutter pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-24 md:pb-12 lg:gap-y-8 lg:pt-20">
        {/* Layout box for the logo: the particle field fits the mark inside it. */}
        <div className="relative">
          <div
            ref={slotRef}
            role="img"
            aria-label={logoLabel}
            className="absolute inset-y-0 left-[16%] right-0 lg:inset-y-[2%] lg:left-[44%] lg:right-[20%]"
          />
        </div>

        <div className="grid gap-y-8 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <h1 ref={headingRef} className="text-display-2 text-balance uppercase lg:col-span-8">
            <MaskedWords text={heading} target="data-particle-word" />
          </h1>

          <div ref={asideRef} className="flex max-w-sm flex-col gap-6 lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            <p className="font-serif text-body text-black/60">
              <MaskedWords text={tagline} target="data-particle-word" />
            </p>

            {/* Padded mask, so the button's focus ring isn't clipped. */}
            <div className="-m-1 overflow-hidden p-1">
              <div data-mask-line="" data-particle-word="">
                <Button
                  tone="ink"
                  icon={<PlayGlyph />}
                  onClick={() => setReelOpen(true)}
                  // The play in the logo lights up with the button.
                  onPointerEnter={() => field.current?.highlight(true)}
                  onPointerLeave={() => field.current?.highlight(false)}
                  onFocus={() => field.current?.highlight(true)}
                  onBlur={() => field.current?.highlight(false)}
                  aria-haspopup="dialog"
                >
                  Play reel
                </Button>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-4 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="order-last mt-1 overflow-hidden text-cap-2 font-medium tracking-tight-1 text-black/45">
                    <span data-mask-word="" data-particle-word="" className="inline-block">
                      {stat.label}
                    </span>
                  </dt>
                  <dd className="overflow-hidden pb-[0.08em] font-display text-display-3 font-semibold">
                    <span data-mask-word="" data-particle-word="" className="inline-block">
                      {stat.value}
                      {stat.suffix}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* The logo's play triangle doubles as the reel's play button. Pointer only: "Play reel" is the accessible control. */}
      <div
        aria-hidden="true"
        onClick={() => setReelOpen(true)}
        onPointerEnter={() => field.current?.highlight(true)}
        onPointerLeave={() => field.current?.highlight(false)}
        className="absolute cursor-pointer"
        style={PLAY_AREA_STYLE}
      />

      <ReelDialog open={reelOpen} onClose={() => setReelOpen(false)} />
    </section>
  );
}
