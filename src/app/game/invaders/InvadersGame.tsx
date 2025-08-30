'use client';

import Game from '@/app/game/invaders/GameGL';
import { useRef, useState } from 'react';
import '@/app/game/invaders/invaders.module.css';
import GameOverModal from '@/app/game/modals/GameOverModal';
import { TransactionQueue } from '@/app/lib/score-api';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/app/store/hooks';
import { resetGameData, setIsVisible } from '@/app/store/gameSlice';

export default function InvadersGame({ onMenuAction, userAddress }: { onMenuAction: () => void, userAddress: string }) {
  const dispatch = useAppDispatch();

  const [isGameStarted, setIsGameStarted] = useState(true);
  const [isInGameModalOpen, setIsInGameModalOpen] = useState(false);
  const [gameResultScore, setGameResultScore] = useState(0);
  const [isGameInitialized, setIsGameInitialized] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const showGameOverModal = () => {
    setIsInGameModalOpen(true);
    dispatch(setIsVisible(false));
  }

  const transactionQueueRef = useRef<TransactionQueue>(new TransactionQueue());

  const postAddTicket = async () => {};
  const postEndGame = async (score: string) => {
    setIsInGameModalOpen(true);
    dispatch(resetGameData());
    await submitScore(Number(score));
  };

  const handleRestart = () => {
    if (transactionQueueRef.current) {
      transactionQueueRef.current.destroy();
    }
    transactionQueueRef.current = new TransactionQueue();
    setIsInGameModalOpen(false);
    setGameResultScore(0);
    setIsGameStarted(true);
    setGameKey((k) => k + 1);
    dispatch(resetGameData());
    dispatch(setIsVisible(true));
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

  return (
    <>
      <div className={`game-wrapper ${isInGameModalOpen ? 'blurred' : ''}`}>
        <Game
          key={gameKey}
          postEndGame={postEndGame}
          postAddTicket={postAddTicket}
          setGameResultScore={setGameResultScore}
          isGameStarted={isGameStarted}
          setIsInGameModalOpen={showGameOverModal}
          setIsGameInitialized={setIsGameInitialized}
        />
      </div>
      {isInGameModalOpen && <GameOverModal score={gameResultScore} onRestartAction={handleRestart} onMenuAction={onMenuAction} />}
    </>
  );
}

// (If needed) ensure `GameGL` mounts its renderer inside the provided React DOM—NOT document.body.
// Example adjustment inside GameGL (concept):
// const containerRef = useRef<HTMLDivElement>(null);
// useEffect(() => { containerRef.current?.appendChild(renderer.domElement); }, []);
// return <div ref={containerRef} className="three-root" />;
