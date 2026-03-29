'use client';
import ReactMarkdown from 'react-markdown';
import type { Card } from '@/types';
import { CARD_FRONT_GRADIENTS, CARD_BACK_GRADIENTS } from '@/lib/colors';

interface FlashCardProps {
  card: Card;
  colorIndex: number;
  cardNumber: number;
  totalCards: number;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ card, colorIndex, cardNumber, totalCards, isFlipped, onFlip }: FlashCardProps) {
  const frontGrad = CARD_FRONT_GRADIENTS[colorIndex % CARD_FRONT_GRADIENTS.length];
  const backGrad = CARD_BACK_GRADIENTS[colorIndex % CARD_BACK_GRADIENTS.length];

  return (
    <div
      className="perspective-1200 w-full cursor-pointer select-none"
      style={{ height: '52vh', minHeight: '280px', maxHeight: '440px' }}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Answer shown — click to see question' : 'Click to reveal answer'}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div
        className={`relative w-full h-full preserve-3d transition-transform duration-500 ease-in-out${isFlipped ? ' rotate-y-180' : ''}`}
      >
        {/* Front face */}
        <div
          className={`absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br ${frontGrad} shadow-xl`}
        >
          <div className="flex flex-col h-full p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Question
              </span>
              <span className="text-[11px] font-bold text-white/70 bg-white/15 px-2.5 py-0.5 rounded-full">
                {cardNumber} / {totalCards}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center py-3 overflow-y-auto">
              <div className="text-white text-xl sm:text-2xl font-semibold leading-relaxed prose prose-invert prose-sm sm:prose-base max-w-none [&_*]:text-white [&_code]:bg-white/20 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-white/20 [&_pre]:rounded-xl [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                <ReactMarkdown>{card.front}</ReactMarkdown>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pb-1">
              <div className="w-6 h-px bg-white/20" />
              <span className="text-white/35 text-[10px] tracking-wide">tap to flip</span>
              <div className="w-6 h-px bg-white/20" />
            </div>
          </div>
        </div>

        {/* Back face */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br ${backGrad} shadow-xl`}
        >
          <div className="flex flex-col h-full p-6 sm:p-8 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex-shrink-0">
              Answer
            </span>

            {/* Answer — shrinks when explanation is present */}
            <div
              className={`flex items-center justify-center py-2 ${card.explanation ? 'flex-shrink-0 pt-3 pb-2 overflow-y-auto max-h-[40%]' : 'flex-1 py-3 overflow-y-auto'}`}
            >
              <div
                className={`text-white font-semibold text-center leading-relaxed prose prose-invert max-w-none [&_*]:text-white [&_code]:bg-white/20 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-white/20 [&_pre]:rounded-xl [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 ${card.explanation ? 'prose-sm sm:prose-base' : 'prose-base sm:prose-lg'}`}
              >
                <ReactMarkdown>{card.back}</ReactMarkdown>
              </div>
            </div>

            {/* Explanation panel */}
            {card.explanation && (
              <div className="flex-1 overflow-y-auto mt-1">
                <div className="bg-white/15 rounded-2xl px-4 py-3 h-full">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                    Explanation
                  </p>
                  <div className="text-white/90 text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&_*]:text-white/90 [&_code]:bg-white/20 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-white/20 [&_pre]:rounded-xl [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                    <ReactMarkdown>{card.explanation}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Hint (shown when no explanation, or below explanation) */}
            {card.hint && (
              <div className="flex-shrink-0 mt-2 bg-white/10 rounded-2xl px-4 py-2 text-center">
                <div className="text-white/60 text-xs prose prose-invert prose-xs max-w-none [&_*]:text-white/60 [&_p]:m-0">
                  💡 <ReactMarkdown>{card.hint}</ReactMarkdown>
                </div>
              </div>
            )}

            {!card.explanation && !card.hint && <div className="h-5 flex-shrink-0" />}
          </div>
        </div>
      </div>
    </div>
  );
}
