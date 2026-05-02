'use client';

import { useEffect, useRef } from 'react';
import { buildScene, DEFAULT_PARAMS, type Scene } from '@/lib/animation';
import type { UniverseParams } from '@/lib/types';
import styles from './UniverseCanvas.module.css';

interface Props {
  params: UniverseParams | null;
  transitioning: boolean;
}

export default function UniverseCanvas({ params, transitioning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef  = useRef<Scene | null>(null);
  const animRef   = useRef<number>(0);

  // 애니메이션 루프 — 마운트 시 1회만 실행
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const p = sceneRef.current?.params ?? DEFAULT_PARAMS;
      sceneRef.current = buildScene(p, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    function loop() {
      animRef.current = requestAnimationFrame(loop);
      const scene = sceneRef.current;
      if (!scene || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      const { params: p, stars, nebulae, shootingStars } = scene;

      ctx.fillStyle = p.backgroundColor;
      ctx.fillRect(0, 0, W, H);

      nebulae.forEach(n => { n.update(); n.draw(ctx); });
      stars.forEach(s   => { s.update(); s.draw(ctx); });

      const freq = p.shootingStarFrequency * p.animationSpeed;
      shootingStars.forEach(ss => {
        if (!ss.active && Math.random() < freq) ss.activate(W, H);
        ss.update(W, H);
        ss.draw(ctx);
      });
    }

    loop();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // params가 바뀔 때마다 씬 재구성
  useEffect(() => {
    if (!params) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    sceneRef.current = buildScene(params, canvas.width, canvas.height);
  }, [params]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={`${styles.overlay} ${transitioning ? styles.fading : ''}`} />
    </>
  );
}
