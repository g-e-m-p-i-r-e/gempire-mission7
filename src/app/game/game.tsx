'use client';

import styles from './game.module.css';
import { useState } from 'react';
import Menu from '@/app/game/menu/menu';
import InvadersGame from '@/app/game/invaders/InvadersGame';
import DuckmanGame from '@/app/game/duck-man/DuckmanGame';
import LoginForm from '@/app/game/login/login';

export default function GameMain() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');

  const onMenuAction = () => setSelectedGame(null);
  return (
    <>
      <div className={styles.container}>
        {address === '' && <LoginForm onAddressChange={setAddress} />}
        {address !== '' && (
          <>
            {!selectedGame && <Menu setSelectedGame={setSelectedGame} />}
            {selectedGame === 'duckman' && <DuckmanGame onMenuAction={onMenuAction} userAddress={address} />}
            {selectedGame === 'invaders' && <InvadersGame onMenuAction={onMenuAction} userAddress={address} />}
          </>
        )}
      </div>
    </>
  );
}
