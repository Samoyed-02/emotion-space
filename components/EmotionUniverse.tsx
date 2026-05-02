'use client';

import { useState, useCallback } from 'react';
import UniverseCanvas from './UniverseCanvas';
import InputPanel from './InputPanel';
import InfoCard from './InfoCard';
import type { UniverseParams } from '@/lib/types';
import styles from './EmotionUniverse.module.css';

interface Props {
  hasServerKey: boolean;
}

export default function EmotionUniverse({ hasServerKey }: Props) {
  const [params, setParams]           = useState<UniverseParams | null>(null);
  const [panelOpen, setPanelOpen]     = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const handleGenerate = useCallback(async (emotion: string, apiKey?: string) => {
    setTransitioning(true);
    try {
      // API 호출과 최소 전환 시간(650ms)을 병렬 실행
      const [result] = await Promise.all([
        fetch('/api/universe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emotion, apiKey }),
        }).then(async r => {
          if (!r.ok) {
            const err = await r.json() as { error?: string };
            throw new Error(err.error ?? `오류 ${r.status}`);
          }
          return r.json() as Promise<UniverseParams>;
        }),
        new Promise<void>(r => setTimeout(r, 650)),
      ]);

      setParams(result);
      // 새 씬이 렌더링된 뒤 오버레이 제거
      await new Promise(r => setTimeout(r, 80));
      setTransitioning(false);
      setPanelOpen(false);
    } catch (e) {
      setTransitioning(false);
      throw e; // InputPanel이 받아서 에러 표시
    }
  }, []);

  return (
    <>
      <UniverseCanvas params={params} transitioning={transitioning} />

      <InputPanel
        open={panelOpen}
        hasServerKey={hasServerKey}
        hasBackground={params !== null}
        onGenerate={handleGenerate}
        onClose={() => setPanelOpen(false)}
      />

      {params !== null && !panelOpen && (
        <>
          <InfoCard theme={params.theme} description={params.description} />
          <button
            className={styles.settingsBtn}
            onClick={() => setPanelOpen(true)}
          >
            ⚙ 설정
          </button>
        </>
      )}
    </>
  );
}
