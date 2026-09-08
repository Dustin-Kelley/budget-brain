import { Icon } from '@/components/shell/Icon';

export function FooUnlockBanner() {
  return (
    <aside className='flex items-center gap-3 rounded-[14px] bg-[var(--bb-cy-tint)] px-5 py-3.5 text-[13.5px] text-[var(--bb-cy-text)]'>
      <Icon
        name='lightbulb'
        size={20}
        className='flex-none'
      />
      <p>
        Budgeting tools unlock harder when they serve your current FOO step.
      </p>
    </aside>
  );
}
