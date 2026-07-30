/** Daily-outflow bars on the account cards. Flat when there is no spend. */
export function Sparkline({
  values,
  color = 'var(--bb-n4)',
  height = 52,
}: {
  values: number[];
  color?: string;
  height?: number;
}) {
  if (values.length === 0) return null;

  // Scale to the 90th percentile, not the max. A single rent-sized day would
  // otherwise flatten every other bar to the floor and the shape of ordinary
  // spending — the thing worth seeing — disappears. Outliers simply top out.
  const spend = values.filter((value) => value > 0).sort((a, b) => a - b);
  const max =
    spend.length > 0
      ? spend[Math.min(Math.floor(spend.length * 0.9), spend.length - 1)]
      : 0;

  return (
    <div
      className='flex items-end gap-[3px]'
      style={{ height }}
      aria-hidden
    >
      {values.map((value, index) => (
        <div
          key={index}
          className='flex-1 rounded-[2px]'
          style={{
            background: color,
            // A floor of 4% keeps zero-spend days visible as a baseline.
            height:
              max > 0
                ? `${Math.min(Math.max((value / max) * 100, 4), 100)}%`
                : '4%',
            opacity: value > 0 ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
