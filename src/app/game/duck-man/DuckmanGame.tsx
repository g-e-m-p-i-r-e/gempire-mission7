'use client';
import { useRef, useState, useCallback } from 'react';
import '@/app/game/invaders/invaders.module.css';
import GameOverModal from '@/app/game/modals/GameOverModal';
import GamePage from '@/app/game/duck-man/game';
import { TransactionQueue } from '@/app/lib/score-api';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/app/store/hooks';
import { resetGameData, setIsVisible } from '@/app/store/gameSlice';
import { LEVEL_MAPS } from './core/map';

export default function DuckmanGame({ onMenuAction, userAddress }: { onMenuAction: () => void; userAddress: string }) {
  const [isInGameModalOpen, setIsInGameModalOpen] = useState(false);
  const [gameResultScore, setGameResultScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);

  const dispatch = useAppDispatch();
  const transactionQueueRef = useRef<TransactionQueue>(new TransactionQueue());

  const submitScore = useCallback(async (score: number) => {
    if (!userAddress) return;
    transactionQueueRef.current.enqueue(
      userAddress,
      score,
      1,
      {
        onSuccess: (result) => {
          toast.success(`Transaction confirmed! +${score} points`, { duration: 3000, icon: '🚀' });
          if (result.transactionHash) {
            toast.success(`TX: ${result.transactionHash.slice(0, 10)}...`, {
              duration: 5000,
              icon: '📝',
              style: { fontSize: '12px' },
            });
          }
        },
        onFailure: (error) => {
          const isPriorityError = /higher priority/i.test(error);
          toast.error(
            isPriorityError
              ? `Transaction congestion: ${score} points will retry with higher priority`
              : `Transaction failed permanently: ${error}`,
            { duration: isPriorityError ? 4000 : 6000, icon: isPriorityError ? '⚡' : '💀' }
          );
        },
        onRetry: (attempt) => {
          toast(`Retrying transaction... (${attempt}/5)`, {
            duration: 2000,
            icon: '🔄',
            style: { background: '#f59e0b', color: '#fff' },
          });
        },
      }
    );
    toast(`Queuing +${score} points`, {
      duration: 2500,
      icon: '📦',
      style: { background: '#3b82f6', color: '#fff' },
    });
  }, [userAddress]);

  const postEndGame = (score: number, isWin: boolean) => {
    setGameResultScore(score);
    setIsInGameModalOpen(true);
    dispatch(resetGameData());
    dispatch(setIsVisible(false));
    submitScore(score).catch(console.error);
  };

  const handleLevelWin = (score: number) => {
    submitScore(score).catch(console.error);
    setLevelIndex(idx => (idx + 1) % LEVEL_MAPS.length); // cycle
  };

  const handleRestart = () => {
    setIsInGameModalOpen(false);
    setGameResultScore(0);
    setGameKey(k => k + 1);
    setLevelIndex(0);
    dispatch(resetGameData());
    dispatch(setIsVisible(true));
  };

  return (
    <>
      <div className={`game-wrapper ${isInGameModalOpen ? 'blurred' : ''}`}>
        <GamePage
          key={gameKey}
          postEndGame={postEndGame}
          levelIndex={levelIndex}
          onLevelWin={handleLevelWin}
        />
      </div>
      {isInGameModalOpen && (
        <GameOverModal
          score={gameResultScore}
          onRestartAction={handleRestart}
          onMenuAction={onMenuAction}
        />
      )}
    </>
  );
}