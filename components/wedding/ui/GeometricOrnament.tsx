/**
 * components/wedding/ui/GeometricOrnament.tsx
 *
 * A restrained eight-point Islamic star (two interlaced squares inside a
 * double ring). Used by the preloader and as the subtle geometry behind the
 * couple names. Stroke colour follows `currentColor`.
 */

type Props = {
  className?: string;
  strokeWidth?: number;
};

export function GeometricOrnament({ className, strokeWidth = 0.6 }: Props) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      <circle cx="50" cy="50" r="48" />
      <circle cx="50" cy="50" r="45.5" strokeDasharray="0.6 2.4" />
      <rect x="20" y="20" width="60" height="60" />
      <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="22" />
      <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" />
    </svg>
  );
}
