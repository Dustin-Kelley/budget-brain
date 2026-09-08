/**
 * Static FOO (Financial Order of Operations) chrome for the home shell.
 *
 * This is demo content only — it is not a diagnosis of the household's
 * accounts or debt. Live FOO logic is a later product step.
 */

export const FOO_STEP_COUNT = 9;

export const FOO_STEPS = [
  {
    number: 1,
    title: 'Starter emergency fund',
    blurb: 'Set aside $1,000–$2,000 so a small surprise does not become new debt.',
  },
  {
    number: 2,
    title: 'Employer match',
    blurb: 'Take the free money in your workplace plan before anything else.',
  },
  {
    number: 3,
    title: 'High-interest debt',
    blurb: 'Pay this down before building a full emergency fund.',
  },
  {
    number: 4,
    title: 'Full emergency fund',
    blurb: 'Three to six months of expenses, parked somewhere you can reach.',
  },
  {
    number: 5,
    title: 'The rest of your debt',
    blurb: 'Clear remaining consumer debt once the emergency fund is in place.',
  },
  {
    number: 6,
    title: 'Max-out retirement',
    blurb: 'Fill tax-advantaged accounts up to the yearly limits.',
  },
  {
    number: 7,
    title: 'Hyper-accumulation',
    blurb: 'Invest extra once retirement accounts are full.',
  },
  {
    number: 8,
    title: 'Prepaid future expenses',
    blurb: 'College, a house, or a big purchase you can see coming.',
  },
  {
    number: 9,
    title: 'Generous living',
    blurb: 'Give with a plan once the earlier steps are solid.',
  },
] as const;

/** Sample current step — matches the home mock. Not computed from data. */
export const DEMO_FOO_STEP = 3;

export const DEMO_NEXT_UP = {
  title: 'Put an extra $400 toward your Visa this month',
  whyTitle: 'Why this step?',
  whyBody:
    'High-interest cards cost more than a full emergency fund can earn. An extra $400 this month is a concrete move on step 3 — sample copy for the home shell, not a reading of your accounts. Live FOO diagnosis comes later.',
  markLabel: 'Mark progress',
  markedLabel: 'Progress marked',
  demoNote: 'Demo only. Nothing is saved, and this is not a live diagnosis.',
} as const;

export function getDemoFooStep(step = DEMO_FOO_STEP) {
  return FOO_STEPS[step - 1] ?? FOO_STEPS[DEMO_FOO_STEP - 1];
}
