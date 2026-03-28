// Full Tailwind class strings kept as literals so v4 content scanner picks them up

export const STRIP_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-violet-600',
  'from-lime-500 to-emerald-600',
  'from-cyan-500 to-sky-600',
] as const;

export const CARD_FRONT_GRADIENTS = [
  'from-violet-500 to-purple-700',
  'from-rose-500 to-pink-700',
  'from-emerald-500 to-teal-700',
  'from-amber-400 to-orange-600',
  'from-sky-500 to-blue-700',
  'from-fuchsia-500 to-violet-700',
  'from-lime-500 to-emerald-700',
  'from-cyan-500 to-sky-700',
] as const;

export const CARD_BACK_GRADIENTS = [
  'from-indigo-500 to-blue-700',
  'from-orange-400 to-amber-600',
  'from-cyan-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-violet-400 to-indigo-600',
  'from-pink-400 to-rose-600',
  'from-teal-400 to-cyan-600',
  'from-blue-400 to-violet-600',
] as const;
