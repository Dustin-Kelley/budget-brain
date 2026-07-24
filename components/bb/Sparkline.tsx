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

  const max = Math.max(...values);

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
            height: max > 0 ? `${Math.max((value / max) * 100, 4)}%` : '4%',
            opacity: value > 0 ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
