'use client';
import { useRef, useState } from 'react';
import '@/app/game/invaders/invaders.module.css';
import GameOverModal from '@/app/game/modals/GameOverModal';
import GamePage from '@/app/game/duck-man/game';
import { TransactionQueue } from '@/app/lib/score-api';
import toast from 'react-hot-toast';

export default function DuckmanGame({ onMenuAction, userAddress }: { onMenuAction: () => void, userAddress: string }) {
  const [isInGameModalOpen, setIsInGameModalOpen] = useState(false);
  const [gameResultScore, setGameResultScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const transactionQueueRef = useRef<TransactionQueue>(new TransactionQueue());

  const postEndGame = (score: number, isWin: boolean) => {
    setGameResultScore(score);
    setIsInGameModalOpen(true);
    submitScore(score).then((res) => {
      console.log(res);
    }).catch((e) => {
      console.error(e);
    });
  };

  const submitScore = async (score: number) => {
    if (userAddress && transactionQueueRef.current) {
      transactionQueueRef.current.enqueue(
        userAddress,
        score,
        1,
        {
          onSuccess: (result) => {
            toast.success(
              `Transaction confirmed! +${score} points`,
              {
                duration: 3000,
                icon: '🚀',
              }
            );
            if (result.transactionHash) {
              toast.success(
                `TX: ${result.transactionHash.slice(0, 10)}...`,
                {
                  duration: 5000,
                  icon: '📝',
                  style: {
                    fontSize: '12px',
                  },
                }
              );
            }
          },
          onFailure: (error) => {
            const isPriorityError = error.includes('Another transaction has higher priority') ||
              error.includes('higher priority');

            toast.error(
              isPriorityError
                ? `Transaction congestion: ${score} points will retry with higher priority`
                : `Transaction failed permanently: ${error}`,
              {
                duration: isPriorityError ? 4000 : 6000,
                icon: isPriorityError ? '⚡' : '💀',
              }
            );
          },
          onRetry: (attempt) => {
            toast(
              `Retrying transaction... (${attempt}/5)`,
              {
                duration: 2000,
                icon: '🔄',
                style: {
                  background: '#f59e0b',
                  color: '#fff',
                },
              }
            );
          },
        }
      );

      toast(
        `Queuing +${score} points (batching for efficiency)`,
        {
          duration: 2500,
          icon: '📦',
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        }
      );

    }
  }

  const handleRestart = () => {
    setIsInGameModalOpen(false);
    setGameResultScore(0);
    setGameKey((k) => k + 1);
  };

  return (
    <>
      <div className={`game-wrapper ${isInGameModalOpen ? 'blurred' : ''}`}>
        <GamePage key={gameKey} postEndGame={postEndGame} />
      </div>
      {isInGameModalOpen && <GameOverModal score={gameResultScore} onRestartAction={handleRestart} onMenuAction={onMenuAction} />}
    </>
  );
}
