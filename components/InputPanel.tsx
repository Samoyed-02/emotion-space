'use client';

import { useState, useRef } from 'react';
import styles from './InputPanel.module.css';

const PRESETS = [
  { label: '😊 행복', value: '행복해' },
  { label: '😢 슬픔', value: '슬퍼' },
  { label: '😠 분노', value: '화가 나' },
  { label: '💓 설렘', value: '설레' },
  { label: '😌 평온', value: '평온해' },
  { label: '🌙 외로움', value: '외로워' },
  { label: '😰 불안', value: '불안해' },
  { label: '❤️ 사랑', value: '사랑에 빠졌어' },
  { label: '🌟 희망', value: '희망차' },
  { label: '🕳️ 공허', value: '공허해' },
];

interface Props {
  open: boolean;
  hasServerKey: boolean;
  hasBackground: boolean;
  onGenerate: (emotion: string, apiKey?: string) => Promise<void>;
  onClose: () => void;
}

export default function InputPanel({
  open,
  hasServerKey,
  hasBackground,
  onGenerate,
  onClose,
}: Props) {
  const [emotion, setEmotion] = useState('');
  const [apiKey, setApiKey]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    const trimmed = emotion.trim();
    if (!trimmed) { setError('감정을 입력해주세요.'); return; }
    if (!hasServerKey && !apiKey.trim()) { setError('API 키를 입력해주세요.'); return; }

    setError('');
    setLoading(true);
    try {
      await onGenerate(trimmed, hasServerKey ? undefined : apiKey.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleGenerate();
  }

  return (
    <div className={`${styles.panel} ${open ? styles.open : styles.closed}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>✦ 감정 우주</h1>
        {hasBackground && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        )}
      </div>
      <p className={styles.subtitle}>당신의 감정을 우주로 표현합니다</p>

      {!hasServerKey && (
        <div className={styles.field}>
          <label className={styles.label}>ANTHROPIC API KEY</label>
          <input
            type="password"
            className={styles.input}
            placeholder="sk-ant-api03-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>지금 어떤 감정인가요?</label>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="예: 행복해, 슬프다, 설레, 화가 나..."
          value={emotion}
          onChange={e => setEmotion(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.presets}>
          {PRESETS.map(p => (
            <button
              key={p.value}
              className={styles.chip}
              onClick={() => setEmotion(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className={styles.genBtn}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            우주를 생성하는 중...
          </>
        ) : (
          '🚀 우주 생성하기'
        )}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
