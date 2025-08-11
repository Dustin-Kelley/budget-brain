import { cache } from 'react';
import { getCategories } from './getCategories';

export const getTotalPlannedAmount = cache(
  async ({ date }: { date: string | undefined }) => {
    const { categories, error } = await getCategories({ date });

    if (error || !categories) {
      return {
        totalPlanned: 0,
        categories: null,
        error: error || 'No budget categories found',
      };
    }

    const totalPlanned = categories.reduce(
      (total, category) =>
        total +
        category.line_items.reduce(
          (categoryTotal, lineItem) =>
            categoryTotal + (lineItem.planned_amount ?? 0),
          0
        ),
      0
    );

    return {
      totalPlanned,
      categories,
      totalPlannedError: null,
    };
  }
);
