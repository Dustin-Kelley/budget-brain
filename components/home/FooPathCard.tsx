import { Icon } from '@/components/shell/Icon';
import {
  DEMO_FOO_STEP,
  FOO_STEP_COUNT,
  FOO_STEPS,
  getDemoFooStep,
} from '@/lib/foo/demo';

export function FooPathCard() {
  const current = getDemoFooStep();

  return (
    <section className='bb-card flex flex-col gap-5 px-6 py-[22px]'>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
        <span
          className='flex size-[72px] flex-none items-center justify-center rounded-full bg-[var(--bb-cy-tint)] text-[var(--bb-cy-text)]'
          aria-hidden
        >
          <span className='relative'>
            <Icon
              name='mountains'
              size={36}
            />
            <Icon
              name='flag'
              size={16}
              className='absolute -top-1 -right-2'
            />
          </span>
        </span>

        <div className='min-w-0 flex-1'>
          <p className='bb-kicker'>FOO path · sample</p>
          <h2 className='bb-title mt-1.5'>
            You&apos;re on Step {current.number} of {FOO_STEP_COUNT} —{' '}
            {current.title}
          </h2>
          <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
            {current.blurb}
          </p>
        </div>
      </div>

      <ol className='bb-foo-track'>
        {FOO_STEPS.map((step) => {
          const state =
            step.number < DEMO_FOO_STEP
              ? 'done'
              : step.number === DEMO_FOO_STEP
                ? 'now'
                : 'ahead';

          return (
            <li
              key={step.number}
              className='bb-foo-step'
              data-state={state}
            >
              <span
                className='bb-foo-node'
                aria-current={state === 'now' ? 'step' : undefined}
              >
                {state === 'done' ? (
                  <Icon
                    name='check-circle'
                    size={22}
                    weight='fill'
                  />
                ) : (
                  step.number
                )}
              </span>
              <span className='sr-only'>
                {step.number}. {step.title}
                {state === 'done' ? ' — done' : ''}
                {state === 'now' ? ' — current' : ''}
              </span>
            </li>
          );
        })}
      </ol>

      <p className='text-[12px] text-[var(--bb-dim)]'>
        Sample path for the home shell. Budget Brain is not diagnosing your
        accounts yet.
      </p>
    </section>
  );
}
