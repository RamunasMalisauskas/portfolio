type Theme = "light" | "dark";

type Rgb = { r: number; g: number; b: number; a: number };

const SPACING = 12;
const HOLD_MS = 160;
const WAVE_MS = 900;
const FADE_MS = 520;

const DOT_COLOR: Record<Theme, Rgb> = {
  light: { r: 36, g: 40, b: 33, a: 0.12 },
  dark: { r: 241, g: 240, b: 233, a: 0.12 },
};

const RIPPLE_COLOR: Record<Theme, Rgb> = {
  light: { r: 36, g: 40, b: 33, a: 0.62 },
  dark: { r: 241, g: 240, b: 233, a: 0.42 },
};

let frame = 0;
let canvas: HTMLCanvasElement | null = null;

function mix(from: Rgb, to: Rgb, amount: number) {
  const t = amount < 0 ? 0 : amount > 1 ? 1 : amount;
  return `rgba(${Math.round(from.r + (to.r - from.r) * t)} ${Math.round(from.g + (to.g - from.g) * t)} ${Math.round(from.b + (to.b - from.b) * t)} / ${from.a + (to.a - from.a) * t})`;
}

function rippleColor(from: Rgb, peak: Rgb, to: Rgb, amount: number) {
  if (amount <= 0.5) return mix(from, peak, amount / 0.5);
  return mix(peak, to, (amount - 0.5) / 0.5);
}

function finishWave() {
  cancelAnimationFrame(frame);
  canvas?.remove();
  canvas = null;
  document.documentElement.classList.remove("dots-waving");
}

export function waveBackgroundDots(from: Theme, to: Theme) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  finishWave();

  const button = document.querySelector(".theme-toggle");
  const rect = button?.getBoundingClientRect();
  const originX = rect
    ? rect.left + window.scrollX + rect.width / 2
    : window.scrollX + window.innerWidth / 2;
  const originY = rect
    ? rect.top + window.scrollY + rect.height / 2
    : window.scrollY;

  const width = document.documentElement.scrollWidth;
  const height = document.documentElement.scrollHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const span = Math.hypot(window.innerWidth, window.innerHeight) || 1;

  const next = document.createElement("canvas");
  next.className = "dot-wave";
  next.width = Math.round(width * dpr);
  next.height = Math.round(height * dpr);
  next.style.width = `${width}px`;
  next.style.height = `${height}px`;

  const context = next.getContext("2d");
  if (!context) return;

  canvas = next;
  document.body.appendChild(next);
  document.documentElement.classList.add("dots-waving");
  context.scale(dpr, dpr);

  const fromColor = DOT_COLOR[from];
  const toColor = DOT_COLOR[to];
  const peakColor = RIPPLE_COLOR[to];
  const started = performance.now();
  const steps = 12;

  function paint(now: number) {
    if (!canvas || !context) return;

    const elapsed = now - started;
    const buckets: Path2D[] = Array.from(
      { length: steps + 1 },
      () => new Path2D(),
    );
    let pending = 0;

    for (let y = SPACING / 2; y < height; y += SPACING) {
      for (let x = SPACING / 2; x < width; x += SPACING) {
        const delay =
          HOLD_MS + (Math.hypot(x - originX, y - originY) / span) * WAVE_MS;
        const progress = (elapsed - delay) / FADE_MS;
        const bucket =
          progress <= 0
            ? 0
            : progress >= 1
              ? steps
              : Math.round(progress * steps);
        const size = bucket === 0 || bucket === steps ? 1 : 1.75;
        buckets[bucket].moveTo(x + size / 2, y);
        buckets[bucket].arc(x, y, size / 2, 0, Math.PI * 2);
        if (progress < 1) pending += 1;
      }
    }

    context.clearRect(0, 0, width, height);
    buckets.forEach((path, step) => {
      context.fillStyle = rippleColor(
        fromColor,
        peakColor,
        toColor,
        step / steps,
      );
      context.fill(path);
    });

    if (pending > 0) {
      frame = requestAnimationFrame(paint);
    } else {
      finishWave();
    }
  }

  frame = requestAnimationFrame(paint);
}
