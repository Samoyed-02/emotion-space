'use client';

import { useEffect, useState } from 'react';
import styles from './InfoCard.module.css';

interface Props {
  theme: string;
  description: string;
}

export default function InfoCard({ theme, description }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 마운트 직후 fade-in
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`${styles.card} ${visible ? styles.visible : ''}`}>
      {theme && <p className={styles.theme}>{theme}</p>}
      <p className={styles.description}>{description}</p>
    </div>
  );
}
