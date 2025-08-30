'use client';
import styles from './page.module.css';
import GameMain from '@/app/game/game';
import { useState } from 'react';
import GameHUD from '@/app/components/GameHUD';
export default function Home() {
  const [address, setAddress] = useState<string>('');
  return (
    <>
      <div className={styles.topCenter}>
        <GameHUD/>
        <div className={styles.frame}>
          <div className={styles.frameContent}>
            <GameMain />
          </div>
        </div>
      </div>
    </>
  );
}
