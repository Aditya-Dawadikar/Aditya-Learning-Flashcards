'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FlashCard } from './FlashCard';
import { shuffle } from '@/utils/shuffle';
import type { Card, Playlist } from '@/types';

type CardResult = 'got-it' | 'review';

interface StudySessionProps {
  playlists: Playlist[];
  title: string;
  onExit?: () => void;
}

export function StudySession({ playlists, title, onExit }: StudySessionProps) {
  const router = useRouter();
  const [sessionKey, setSessionKey] = useState(0);

  const { cards, colorMap } = useMemo(() => {
    const pairs: Array<{ card: Card; colorIndex: number }> = [];
    for (const pl of playlists) {
      for (const card of pl.cards) {
        pairs.push({ card, colorIndex: pl.colorIndex });
      }
    }
    const shuffled = shuffle(pairs);
    return {
      cards: shuffled.map(p => p.card),
      colorMap: shuffled.map(p => p.colorIndex),
    };
    // sessionKey forces a re-shuffle on restart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlists, sessionKey]);

  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<(CardResult | null)[]>(() =>
    Array(cards.length).fill(null),
  );
  const [isComplete, setIsComplete] = useState(false);

  const handleFlip = useCallback(() => setIsFlipped(f => !f), []);

  const advance = useCallback(
    (result: CardResult) => {
      setResults(prev => {
        const next = [...prev];
        next[index] = result;
        return next;
      });
      if (index < cards.length - 1) {
        setIndex(i => i + 1);
        setIsFlipped(false);
      } else {
        setIsComplete(true);
      }
    },
    [index, cards.length],
  );

  const handleRestart = useCallback(() => {
    setSessionKey(k => k + 1);
    setIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setResults(Array(cards.length).fill(null));
  }, [cards.length]);

  const handleExit = useCallback(() => {
    if (onExit) onExit();
    else router.push('/');
  }, [onExit, router]);

  const gotItCount = results.filter(r => r === 'got-it').length;
  const reviewCount = results.filter(r => r === 'review').length;
  const progress = ((index + (isComplete ? 1 : 0)) / cards.length) * 100;

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <span className="text-5xl">😅</span>
        <h2 className="text-xl font-bold text-stone-800">No cards found</h2>
        <p className="text-stone-500 text-sm">This playlist appears to be empty.</p>
        <button
          onClick={handleExit}
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isComplete) {
    const pct = Math.round((gotItCount / cards.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-6 max-w-sm mx-auto">
        <span className="text-7xl">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖'}</span>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800">Session Complete!</h2>
          <p className="text-stone-400 text-sm mt-1 truncate max-w-xs">{title}</p>
        </div>

        <div className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-50">
            <span className="text-stone-500 text-sm">Total Cards</span>
            <span className="font-bold text-stone-800">{cards.length}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-50">
            <span className="text-stone-500 text-sm">Got It ✓</span>
            <span className="font-bold text-emerald-600">{gotItCount}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-50">
            <span className="text-stone-500 text-sm">Need Review ↺</span>
            <span className="font-bold text-amber-600">{reviewCount}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-stone-500 text-sm font-medium">Score</span>
            <span
              className={`text-lg font-bold ${
                pct >= 80
                  ? 'text-emerald-600'
                  : pct >= 50
                    ? 'text-amber-600'
                    : 'text-rose-500'
              }`}
            >
              {pct}%
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleRestart}
            className="w-full py-3.5 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 active:scale-[0.98] transition-transform"
          >
            ↺ Study Again
          </button>
          <button
            onClick={handleExit}
            className="w-full py-3.5 bg-white text-stone-600 rounded-2xl font-medium border border-stone-200 active:scale-[0.98] transition-transform"
          >
            ← Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[index];

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-2">
        <button
          onClick={handleExit}
          className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-sm active:scale-95 transition-transform"
          aria-label="Exit study session"
        >
          <svg
            className="w-4 h-4 text-stone-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stone-400 truncate">{title}</p>
          <p className="text-sm font-bold text-stone-700">
            {index + 1} / {cards.length}
          </p>
        </div>
        <span className="text-xs font-semibold bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card + actions */}
      <div className="flex-1 flex flex-col px-4 py-5 gap-5">
        <FlashCard
          card={currentCard}
          colorIndex={colorMap[index]}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />

        {/* Rating buttons (shown after flip) */}
        {isFlipped ? (
          <div className="flex gap-3">
            <button
              onClick={() => advance('review')}
              className="flex-1 py-4 bg-white border-2 border-rose-200 text-rose-500 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-sm"
            >
              <span>↺</span> Still Learning
            </button>
            <button
              onClick={() => advance('got-it')}
              className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-lg shadow-emerald-100"
            >
              <span>✓</span> Got It!
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            {index > 0 && (
              <button
                onClick={() => {
                  setIndex(i => i - 1);
                  setIsFlipped(false);
                }}
                className="py-4 px-5 bg-white text-stone-500 border border-stone-200 rounded-2xl font-medium text-sm active:scale-[0.98] transition-transform shadow-sm"
              >
                ← Prev
              </button>
            )}
            <button
              onClick={handleFlip}
              className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-violet-200"
            >
              Reveal Answer
            </button>
          </div>
        )}

        {/* Progress dots for short decks */}
        {cards.length <= 24 && (
          <div className="flex justify-center flex-wrap gap-1.5 px-2">
            {cards.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-5 bg-violet-500'
                    : results[i] === 'got-it'
                      ? 'w-1.5 bg-emerald-400'
                      : results[i] === 'review'
                        ? 'w-1.5 bg-amber-400'
                        : 'w-1.5 bg-stone-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
