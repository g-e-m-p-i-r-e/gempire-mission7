'use client';
import toast from 'react-hot-toast';
import './gameOverModal.css';
import Image from 'next/image';
export default function GameOverModal({
  score,
  onRestartAction,
  onMenuAction,
}: {
  score: number;
  onRestartAction: () => void;
  onMenuAction: () => void;
}) {
  return (
    <div className="game-over-modal" role="dialog" aria-modal="true">
      <div className="game-over-modal__panel">
        <h2 className="game-over-modal__title">GAME OVER</h2>
        <div className="game-over-modal__score score_block">
          <span className="score_label">Your score</span>
          <p className="score">{score}</p>
          <button className="share">
            <Image src="/icons/share.svg" alt="Share icon" className="share__icon" width="22" height="22" />
            Share
          </button>
        </div>
        <button className="restart-btn" onClick={onRestartAction}>
          <span className="text">Restart</span>
        </button>
        <button className="back-btn" onClick={onMenuAction}>
          <span className="text">Back To Menu</span>
        </button>
      </div>
    </div>
  );
}
