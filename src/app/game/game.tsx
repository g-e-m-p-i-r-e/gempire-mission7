'use client';

import styles from './game.module.css';
import { useState } from 'react';
import Menu from '@/app/game/menu/menu';
import InvadersGame from '@/app/game/invaders/InvadersGame';
import DuckmanGame from '@/app/game/duck-man/DuckmanGame';
import LoginForm from '@/app/game/login/login';
import { setIsVisible } from '@/app/store/gameSlice';
import { useAppDispatch } from '@/app/store/hooks';

export default function GameMain() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('test');

  const dispatch = useAppDispatch();

  const selectGame = (game: string) => {
    setSelectedGame(game);
    dispatch(setIsVisible(true));
  };

  const onMenuAction = () => {
    setSelectedGame(null);
    dispatch(setIsVisible(false));
  }

  return (
    <>
      <div className={styles.container}>
        {address === '' && <LoginForm onAddressChange={setAddress} />}
        {address !== '' && (
          <>
            {!selectedGame && <Menu setSelectedGame={selectGame} />}
            {selectedGame === 'duckman' && <DuckmanGame onMenuAction={onMenuAction} userAddress={address} />}
            {selectedGame === 'invaders' && <InvadersGame onMenuAction={onMenuAction} userAddress={address} />}
          </>
        )}
      </div>
    </>
  );
}
