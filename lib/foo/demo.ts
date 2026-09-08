/**
 * Static FOO (Financial Order of Operations) chrome for the home shell.
 *
 * Step names match the Product Concept. This is demo content only — it is
 * not a diagnosis of the household's accounts or debt.
 */

export const FOO_STEP_COUNT = 9;

export const FOO_STEPS = [
  {
    number: 1,
    title: 'Deductibles covered',
    blurb: 'Fund insurance deductibles so a claim does not become new debt.',
  },
  {
    number: 2,
    title: 'Employer match',
    blurb: 'Take the free money in your workplace plan before anything else.',
  },
  {
    number: 3,
    title: 'High-Interest Debt',
    blurb: 'Pay this down before building a full emergency fund.',
  },
  {
    number: 4,
    title: 'Emergency reserves',
    blurb: 'Three to six months of expenses, parked somewhere you can reach.',
  },
  {
    number: 5,
    title: 'Roth IRA & HSA',
    blurb: 'Fill the tax-advantaged accounts that compound first.',
  },
  {
    number: 6,
    title: 'Max employer retirement',
    blurb: 'Go up to the yearly limit on your workplace plan.',
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
    title: 'Low-interest debt',
    blurb: 'Mortgage and other cheap debt, last on the list.',
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
