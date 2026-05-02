import type { UniverseParams } from './types';

export function hexRgba(hex: string, a: number): string {
  if (!hex || hex.length < 7) return `rgba(255,255,255,${a})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function rand(min: number, max: number) { return min + Math.random() * (max - min); }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)); }

// ── Star ──────────────────────────────────────────────────────────────────────
export class Star {
  x: number; y: number; r: number;
  maxA: number; ph: number; spd: number;
  col: string; a = 0;

  constructor(p: UniverseParams, W: number, H: number) {
    this.x    = rand(0, W);
    this.y    = rand(0, H);
    this.r    = rand(0.3, p.particleSize);
    this.maxA = rand(0.2, p.starBrightness);
    this.ph   = rand(0, Math.PI * 2);
    this.spd  = rand(0.006, 0.02) * p.starTwinkleSpeed;
    this.col  = Math.random() < 0.65 ? p.primaryColor : p.accentColor;
  }

  update() {
    this.ph += this.spd;
    this.a = this.maxA * (0.35 + 0.65 * Math.abs(Math.sin(this.ph)));
  }

  draw(ctx: CanvasRenderingContext2D) {
    const gr = this.r * 4;
    const g  = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, gr);
    g.addColorStop(0, hexRgba(this.col, this.a * 0.6));
    g.addColorStop(1, hexRgba(this.col, 0));
    ctx.beginPath();
    ctx.arc(this.x, this.y, gr, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = hexRgba(this.col, Math.min(this.a * 2.2, 1));
    ctx.fill();
  }
}

// ── Nebula ────────────────────────────────────────────────────────────────────
export class Nebula {
  x: number; y: number; rx: number; ry: number;
  rot: number; maxA: number; ph: number; spd: number;
  c0: string; c1: string; c2: string; type: number;

  constructor(p: UniverseParams, W: number, H: number) {
    this.x    = rand(0, W);
    this.y    = rand(0, H);
    this.rx   = p.nebulaSize * rand(0.5, 1.2);
    this.ry   = this.rx * rand(0.45, 0.85);
    this.rot  = rand(0, Math.PI);
    this.maxA = p.nebulaOpacity * rand(0.5, 1.0);
    this.ph   = rand(0, Math.PI * 2);
    this.spd  = rand(0.002, 0.008);
    this.c0   = p.primaryColor;
    this.c1   = p.secondaryColor;
    this.c2   = p.accentColor;
    this.type = randInt(0, 2);
  }

  update() { this.ph += this.spd; }

  draw(ctx: CanvasRenderingContext2D) {
    const a = this.maxA * (0.75 + 0.25 * Math.sin(this.ph));
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.scale(1, this.ry / this.rx);

    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.rx);
    if (this.type === 0) {
      g.addColorStop(0,    hexRgba(this.c0, a));
      g.addColorStop(0.4,  hexRgba(this.c1, a * 0.55));
      g.addColorStop(0.75, hexRgba(this.c2, a * 0.2));
      g.addColorStop(1,    hexRgba(this.c2, 0));
    } else if (this.type === 1) {
      g.addColorStop(0,    hexRgba(this.c2, a * 0.9));
      g.addColorStop(0.35, hexRgba(this.c0, a * 0.45));
      g.addColorStop(0.7,  hexRgba(this.c1, a * 0.15));
      g.addColorStop(1,    hexRgba(this.c1, 0));
    } else {
      g.addColorStop(0,    hexRgba(this.c1, a * 0.7));
      g.addColorStop(0.5,  hexRgba(this.c2, a * 0.35));
      g.addColorStop(0.8,  hexRgba(this.c0, a * 0.1));
      g.addColorStop(1,    hexRgba(this.c0, 0));
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.rx, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }
}

// ── ShootingStar ──────────────────────────────────────────────────────────────
export class ShootingStar {
  x = 0; y = 0; angle = 0; spd = 0; maxTr = 0;
  trail: { x: number; y: number }[] = [];
  active = false;

  constructor(private p: UniverseParams) {}

  activate(W: number, H: number) {
    if (Math.random() < 0.55) {
      this.x = rand(0, W);
      this.y = rand(-20, -5);
    } else {
      this.x = rand(-20, -5);
      this.y = rand(0, H * 0.65);
    }
    this.angle  = Math.PI / 4 + rand(-0.5, 0.5);
    this.spd    = this.p.shootingStarSpeed * rand(0.7, 1.3);
    this.maxTr  = Math.floor(this.p.shootingStarTrail * rand(0.6, 1.2));
    this.trail  = [];
    this.active = true;
  }

  update(W: number, H: number) {
    if (!this.active) return;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTr) this.trail.shift();
    this.x += Math.cos(this.angle) * this.spd;
    this.y += Math.sin(this.angle) * this.spd;
    if (this.x > W + 60 || this.y > H + 60) {
      this.active = false;
      this.trail  = [];
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active || this.trail.length < 2) return;
    for (let i = 1; i < this.trail.length; i++) {
      const t = i / this.trail.length;
      ctx.beginPath();
      ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
      ctx.strokeStyle = hexRgba(this.p.accentColor, t * 0.85);
      ctx.lineWidth   = t * 2.8;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
    const hg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 9);
    hg.addColorStop(0, hexRgba(this.p.accentColor, 1));
    hg.addColorStop(1, hexRgba(this.p.accentColor, 0));
    ctx.beginPath();
    ctx.arc(this.x, this.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = hg;
    ctx.fill();
  }
}

// ── Default params (API 호출 전 기본 씬) ─────────────────────────────────────
export const DEFAULT_PARAMS: UniverseParams = {
  theme:                 '',
  description:           '',
  backgroundColor:       '#04040f',
  primaryColor:          '#7788aa',
  secondaryColor:        '#223355',
  accentColor:           '#99bbdd',
  starCount:             180,
  starBrightness:        0.45,
  starTwinkleSpeed:      0.5,
  nebulaCount:           3,
  nebulaOpacity:         0.1,
  nebulaSize:            170,
  shootingStarFrequency: 0.0018,
  shootingStarSpeed:     5,
  shootingStarTrail:     22,
  animationSpeed:        0.7,
  particleSize:          1.4,
};

// ── buildScene helper ─────────────────────────────────────────────────────────
export interface Scene {
  params: UniverseParams;
  stars: Star[];
  nebulae: Nebula[];
  shootingStars: ShootingStar[];
}

export function buildScene(p: UniverseParams, W: number, H: number): Scene {
  return {
    params:        p,
    stars:         Array.from({ length: Math.round(p.starCount) },   () => new Star(p, W, H)),
    nebulae:       Array.from({ length: Math.round(p.nebulaCount) }, () => new Nebula(p, W, H)),
    shootingStars: Array.from({ length: 10 },                        () => new ShootingStar(p)),
  };
}
