import { getTransactions } from '@/app/queries/getTransactions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import type { Transaction } from '@/types/types';
import { Separator } from '@/components/ui/separator';

// Type for transaction with nested line_items and categories
interface TransactionWithLineItem extends Transaction {
  line_items?: {
    name?: string | null;
    categories?: {
      name?: string | null;
    } | null;
  } | null;
}

// Utility to group transactions by date (YYYY-MM-DD)
function groupTransactionsByDate(transactions: TransactionWithLineItem[]) {
  return transactions.reduce(
    (groups: Record<string, TransactionWithLineItem[]>, transaction) => {
      const dateKey = transaction.date
        ? format(new Date(transaction.date), 'yyyy-MM-dd')
        : 'Unknown Date';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
      return groups;
    },
    {}
  );
}

export async function TransactionsTab({
  month,
}: {
  month: string | undefined;
}) {
  const { transactions } = await getTransactions({ date: month });

  // Group transactions by date
  const grouped = transactions ? groupTransactionsByDate(transactions) : {};
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest spending activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4'>
          {sortedDates.length === 0 && (
            <div className='text-muted-foreground'>No transactions found.</div>
          )}
          {sortedDates.map((date) => (
            <div key={date}>
              <div className='flex text-lg items-center gap-2 font-bold'>
                {date !== 'Unknown Date'
                  ? format(new Date(date), 'EEEE, MMMM dd')
                  : 'Unknown Date'}
                <Separator className='flex-1' />
              </div>
              <div className='flex flex-col gap-4'>
                {grouped[date].map((transaction) => {
                  const lineItem = transaction.line_items;
                  return (
                  
                      <div
                        key={transaction.id}
                        className='flex flex-col'
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-medium'>{lineItem?.name}</div>
                            {transaction.description && (
                              <div className='text-muted-foreground text-sm'>
                                {transaction.description}
                              </div>
                            )}
                          </div>
                          <div>${transaction.amount?.toFixed(2)}</div>
                        </div>
                      </div>
                    
                  );
                })}
              </div>
            
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
