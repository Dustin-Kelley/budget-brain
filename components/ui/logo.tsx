/**
 * Budget Brain mark — brain outline with a bolt through it. Inline SVG so it
 * stays crisp at the 25–30px the app chrome uses, and follows the theme via
 * currentColor. Replaces the 1.4MB raster that had a grey gradient baked in.
 */
export function Logo({
  size = 30,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 32 32'
      fill='none'
      className={className}
      role='img'
      aria-label='Budget Brain'
    >
      <g
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        {/* left hemisphere */}
        <path d='M14.2 5.6a3.4 3.4 0 0 0-5.5 2.1 3.3 3.3 0 0 0-3 3.5 3.3 3.3 0 0 0-1.2 5.3 3.4 3.4 0 0 0 1.6 4.8 3.4 3.4 0 0 0 3.5 3.6 3.4 3.4 0 0 0 4.6 1.5' />
        {/* right hemisphere */}
        <path d='M17.8 5.6a3.4 3.4 0 0 1 5.5 2.1 3.3 3.3 0 0 1 3 3.5 3.3 3.3 0 0 1 1.2 5.3 3.4 3.4 0 0 1-1.6 4.8 3.4 3.4 0 0 1-3.5 3.6 3.4 3.4 0 0 1-4.6 1.5' />
        {/* folds */}
        <path
          d='M9.6 10.4a2.2 2.2 0 0 0 2.4 1.9M9.8 18.2a2.2 2.2 0 0 1 2.4 1.7'
          opacity='.55'
        />
        <path
          d='M22.4 10.4a2.2 2.2 0 0 1-2.4 1.9M22.2 18.2a2.2 2.2 0 0 0-2.4 1.7'
          opacity='.55'
        />
      </g>
      {/* bolt */}
      <path
        d='M17.4 4.5 12.2 16h3.6l-1.2 11.5L21 15.4h-3.7l.1-10.9Z'
        fill='currentColor'
      />
    </svg>
  );
}
