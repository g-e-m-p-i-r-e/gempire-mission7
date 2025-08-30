'use client';
import Image from 'next/image';
import styles from './GameHUD.module.css';
import { useAppSelector } from '@/app/store/hooks';

export default function GameHUD() {
  const { lives, level, score, isVisible } = useAppSelector(s => s.game);
  if (!isVisible) return null;

  const maxLives = 3;

  const lifeIcons = Array.from({ length: maxLives }, (_, i) => {
    const alive = i < lives;
    return (
      <Image
        key={i}
        src={alive ? '/icons/live.svg' : '/icons/no-live.svg'}
        alt={alive ? 'life' : 'no life'}
        width={20}
        height={20}
        className={styles.lifeIcon}
        priority
      />
    );
  });

  return (
    <div className={styles.wrapper} role="banner" aria-label="Game HUD">
      <div className={styles.bg}>
        <Image
          src="/assets/header.png"
          alt="HUD background"
          fill
          priority
          sizes="550px"
          className={styles.bgImg}
        />
      </div>
      <div className={styles.slots}>
        <div className={`${styles.slot} ${styles.lives}`} aria-label="Lives">
          <div className={styles.lifeRow}>{lifeIcons}</div>
        </div>
        <div className={styles.slot} aria-label="Level">
          <span className={styles.label}>Level</span>
          <span className={styles.value}>{level}</span>
        </div>
        <div className={`${styles.slot} ${styles.score}`} aria-label="Score">
          <span className={styles.value}>{score}</span>
        </div>
      </div>
    </div>
  );
}