'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlashCard } from './FlashCard';
import { shuffle } from '@/utils/shuffle';
import type { Card, Playlist } from '@/types';

type CardResult = 'got-it' | 'review';
type AnimDir = 'next' | 'prev' | null;
type StackPos = 'top' | 'mid' | 'back' | 'exit-next' | 'exit-prev';

const ANIM_MS = 380;

interface StackItem {
  cardIdx: number;
  pos: StackPos;
  enterAnim: boolean; // play cardEnterPrev keyframe (newly mounted top card when going prev)
}

function stackStyle(pos: StackPos): React.CSSProperties {
  switch (pos) {
    case 'top':
      return { transform: 'translateY(0px) scale(1)', opacity: 1, zIndex: 30 };
    case 'mid':
      return { transform: 'translateY(12px) translateX(6px) scale(0.95)', opacity: 1, zIndex: 20 };
    case 'back':
      return { transform: 'translateY(22px) translateX(12px) scale(0.90)', opacity: 1, zIndex: 10 };
    case 'exit-next':
      return { transform: 'translateY(34px) translateX(18px) scale(0.82) rotate(4deg)', opacity: 0, zIndex: 5 };
    case 'exit-prev':
      return { transform: 'translateY(34px) translateX(18px) scale(0.82) rotate(-4deg)', opacity: 0, zIndex: 5 };
  }
}

interface StudySessionProps {
  playlists: Playlist[];
  title: string;
  onExit?: () => void;
}

export function StudySession({ playlists, title, onExit }: StudySessionProps) {
  const router = useRouter();
  const [sessionKey, setSessionKey] = useState(0);

  const { cards, colorMap } = useMemo(() => {
    const pairs: Array<{ card: Card }> = [];
    for (const pl of playlists) {
      for (const card of pl.cards) {
        pairs.push({ card });
      }
    }
    const shuffled = shuffle(pairs);
    return {
      cards: shuffled.map(p => p.card),
      colorMap: shuffled.map((_, i) => i),
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
  const [animDir, setAnimDir] = useState<AnimDir>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up animation timer on unmount
  useEffect(() => () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); }, []);

  const navigate = useCallback(
    (dir: 'next' | 'prev') => {
      if (animDir !== null) return;
      if (dir === 'next' && index >= cards.length - 1) return;
      if (dir === 'prev' && index <= 0) return;
      setIsFlipped(false);
      setAnimDir(dir);
      animTimerRef.current = setTimeout(() => {
        setIndex(i => (dir === 'next' ? i + 1 : i - 1));
        setAnimDir(null);
      }, ANIM_MS);
    },
    [animDir, index, cards.length],
  );

  const handleFlip = useCallback(() => setIsFlipped(f => !f), []);

  const advance = useCallback(
    (result: CardResult) => {
      setResults(prev => {
        const next = [...prev];
        next[index] = result;
        return next;
      });
      if (index < cards.length - 1) {
        navigate('next');
      } else {
        setIsComplete(true);
      }
    },
    [index, cards.length, navigate],
  );

  const handleRestart = useCallback(() => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setAnimDir(null);
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

  // ── Swipe detection ────────────────────────────────────────────
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    didSwipe.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      const isHorizontal = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48;
      if (isHorizontal) {
        didSwipe.current = true;
        if (dx < 0) navigate('next');
        else navigate('prev');
      }
      touchStart.current = null;
    },
    [navigate],
  );

  // Flip only when the gesture was a tap, not a swipe
  const handleFlipGuarded = useCallback(() => {
    if (didSwipe.current || animDir !== null) return;
    handleFlip();
  }, [handleFlip, animDir]);

  // ── Compute which cards to render in the stack ─────────────────
  // next anim:  index(exit-next), index+1(top), index+2(mid), index+3(back)
  // prev anim:  index-1(top+enterAnim), index(mid), index+1(back), index+2(exit-prev)
  // normal:     index(top), index+1(mid), index+2(back)
  const stackItems = useMemo((): StackItem[] => {
    const clamp = (i: number) => i >= 0 && i < cards.length;

    if (animDir === 'next') {
      const items: StackItem[] = [
        { cardIdx: index, pos: 'exit-next', enterAnim: false },
      ];
      const posList: StackPos[] = ['top', 'mid', 'back'];
      for (let off = 1; off <= 3; off++) {
        if (clamp(index + off)) {
          items.push({ cardIdx: index + off, pos: posList[off - 1], enterAnim: false });
        }
      }
      return items;
    }

    if (animDir === 'prev') {
      const items: StackItem[] = [];
      if (clamp(index - 1)) {
        items.push({ cardIdx: index - 1, pos: 'top', enterAnim: true });
      }
      items.push({ cardIdx: index, pos: 'mid', enterAnim: false });
      if (clamp(index + 1)) {
        items.push({ cardIdx: index + 1, pos: 'back', enterAnim: false });
      }
      if (clamp(index + 2)) {
        items.push({ cardIdx: index + 2, pos: 'exit-prev', enterAnim: false });
      }
      return items;
    }

    // Normal (no animation)
    const items: StackItem[] = [
      { cardIdx: index, pos: 'top', enterAnim: false },
    ];
    if (clamp(index + 1)) items.push({ cardIdx: index + 1, pos: 'mid', enterAnim: false });
    if (clamp(index + 2)) items.push({ cardIdx: index + 2, pos: 'back', enterAnim: false });
    return items;
  }, [index, animDir, cards.length]);

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

      {/* Card stack + actions */}
      <div className="flex-1 flex flex-col px-4 py-5 gap-5">

        {/* Stacked card container */}
        <div
          className="relative"
          style={{ height: 'calc(52vh + 24px)', minHeight: '304px', maxHeight: '464px' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {stackItems.map(item => {
            const isInteractive = item.pos === 'top' && !item.enterAnim && animDir === null;
            return (
              <div
                key={item.cardIdx}
                className="absolute inset-x-0 top-0"
                style={{
                  ...stackStyle(item.pos),
                  transition: item.enterAnim
                    ? 'none'
                    : `transform ${ANIM_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${ANIM_MS}ms ease`,
                  animation: item.enterAnim
                    ? `cardEnterPrev ${ANIM_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
                    : undefined,
                  pointerEvents: isInteractive ? 'auto' : 'none',
                }}
              >
                <FlashCard
                  card={cards[item.cardIdx]}
                  colorIndex={colorMap[item.cardIdx]}
                  cardNumber={item.cardIdx + 1}
                  totalCards={cards.length}
                  isFlipped={isInteractive ? isFlipped : false}
                  onFlip={isInteractive ? handleFlipGuarded : () => {}}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation hint */}
        <div className="flex items-center justify-center gap-3 -mt-2">
          <span className={`text-xs ${index > 0 ? 'text-stone-300' : 'invisible'}`}>← prev</span>
          <span className="text-xs text-stone-200">·</span>
          <span className={`text-xs ${index < cards.length - 1 ? 'text-stone-300' : 'invisible'}`}>next →</span>
        </div>

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
          <div className="flex gap-2">
            <button
              onClick={() => navigate('prev')}
              disabled={index === 0 || animDir !== null}
              className="py-4 px-4 bg-white text-stone-500 border border-stone-200 rounded-2xl font-medium text-sm active:scale-[0.98] transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous card"
            >
              ←
            </button>
            <button
              onClick={handleFlip}
              disabled={animDir !== null}
              className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-60"
            >
              Reveal Answer
            </button>
            <button
              onClick={() => navigate('next')}
              disabled={index === cards.length - 1 || animDir !== null}
              className="py-4 px-4 bg-white text-stone-500 border border-stone-200 rounded-2xl font-medium text-sm active:scale-[0.98] transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next card"
            >
              →
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
