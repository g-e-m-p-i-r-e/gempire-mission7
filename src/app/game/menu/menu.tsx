import styles from './menu.module.css';
import Image from 'next/image';

export default function Menu({ setSelectedGame }: { setSelectedGame: (game: string) => void }) {
  return (
    <>
      <div className={styles.content}>
        <Image src="/assets/logo.png" alt="Gempire icon" width="86" height="86" />
        <Image
          src="/assets/duckman.png"
          alt="Gempire icon"
          className={styles.btn}
          width="328"
          height="70"
          onClick={() => setSelectedGame('duckman')}
        />
        <Image
          src="/assets/invaders.png"
          alt="Gempire icon"
          className={styles.btn}
          width="328"
          height="70"
          onClick={() => setSelectedGame('invaders')}
        />
      </div>
    </>
  );
}
