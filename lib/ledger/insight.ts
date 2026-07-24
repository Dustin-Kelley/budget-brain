import { formatCurrency } from './constants';
import { ALLOCATION_TARGETS } from './targets';
import type { CashFlowSummary } from '@/app/queries/getCashFlowSummary';

export type Insight = {
  icon: 'lightbulb' | 'warning';
  title: string;
  body: string;
  action?: { label: string; href: string };
};

/**
 * The Overview banner. Rules run in priority order and the first match wins —
 * the point is one clear next move, not a list of observations.
 */
export function deriveInsight(summary: CashFlowSummary): Insight | null {
  if (summary.uncategorizedCount > 0) {
    return {
      icon: 'warning',
      title: `${summary.uncategorizedCount} transaction${
        summary.uncategorizedCount === 1 ? '' : 's'
      } still need a category`,
      body: `${formatCurrency(
        summary.uncategorizedOutflow,
      )} of spend is not counted in any allocation slice yet.`,
      action: { label: 'Sort them out', href: '/transactions?bucket=uncategorized' },
    };
  }

  if (summary.inflow === 0 && summary.lifestyleOutflow === 0) {
    return {
      icon: 'lightbulb',
      title: 'Nothing recorded for this period yet',
      body: 'Import a CSV, OFX, or QFX file to see cash flow and allocation.',
      action: { label: 'Import a file', href: '/accounts' },
    };
  }

  if (summary.net < 0) {
    return {
      icon: 'warning',
      title: `You are ${formatCurrency(Math.abs(summary.net))} down this period`,
      body: `Lifestyle spend of ${formatCurrency(
        summary.lifestyleOutflow,
      )} is running ahead of ${formatCurrency(summary.inflow)} in.`,
      action: { label: 'See where it went', href: '/allocation' },
    };
  }

  if (summary.inflow > 0 && summary.savingsRate < ALLOCATION_TARGETS.savings) {
    const gap =
      (ALLOCATION_TARGETS.savings / 100) * summary.inflow -
      summary.wealthMoveVolume;
    return {
      icon: 'lightbulb',
      title: `${formatCurrency(gap)} short of your ${
        ALLOCATION_TARGETS.savings
      }% savings floor`,
      body: `You kept ${formatCurrency(
        summary.net,
      )} this period — moving ${formatCurrency(
        gap,
      )} across would close the gap.`,
      action: { label: 'Review the plan', href: '/plan' },
    };
  }

  return {
    icon: 'lightbulb',
    title: `You are ${formatCurrency(summary.net)} ahead this period`,
    body: `Savings rate is ${summary.savingsRate.toFixed(0)}%, at or above your ${
      ALLOCATION_TARGETS.savings
    }% floor.`,
    action: { label: 'See the breakdown', href: '/allocation' },
  };
}
