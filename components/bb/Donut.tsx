const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export type DonutSlice = {
  name: string;
  amount: number;
  color: string;
};

/**
 * The allocation donut. Hand-rolled SVG rather than a chart library: the design
 * specifies exact geometry (r=80, 24px stroke, rotated -90°) and this renders
 * on the server with no client JS.
 */
export function Donut({
  slices,
  total,
  caption,
  label = 'Spent',
  size = 236,
}: {
  slices: DonutSlice[];
  /** Pre-formatted centre figure. */
  total: string;
  caption?: string;
  label?: string;
  size?: number;
}) {
  const sum = slices.reduce((acc, slice) => acc + slice.amount, 0);

  let offset = 0;
  const arcs = slices.map((slice) => {
    const length = sum > 0 ? (slice.amount / sum) * CIRCUMFERENCE : 0;
    const arc = { ...slice, length, offset };
    offset += length;
    return arc;
  });

  return (
    <div
      className='relative flex-none'
      style={{ width: size, height: size }}
    >
      <svg
        viewBox='0 0 200 200'
        className='block h-full w-full'
        role='img'
        aria-label={`${label}: ${caption ?? ''}`}
      >
        <g
          transform='rotate(-90 100 100)'
          fill='none'
          strokeWidth='24'
        >
          <circle
            cx='100'
            cy='100'
            r={RADIUS}
            stroke='var(--bb-track)'
          />
          {arcs.map((arc) => (
            <circle
              key={arc.name}
              cx='100'
              cy='100'
              r={RADIUS}
              stroke={arc.color}
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE}`}
              strokeDashoffset={-arc.offset}
            />
          ))}
        </g>
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
        <div className='text-[10.5px] tracking-[0.14em] text-[var(--bb-dim)] uppercase'>
          {label}
        </div>
        <div className='mt-0.5 text-[30px] leading-[1.05] font-semibold tracking-[-0.02em]'>
          {total}
        </div>
        {caption && (
          <div className='mt-1 text-[11.5px] text-[var(--bb-sub)]'>
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
