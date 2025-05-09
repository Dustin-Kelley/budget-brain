import { getTransactions } from '@/app/queries/getTransactions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';

export async function TransactionsTab({ month }: { month: string | undefined }) {

  const { transactions } = await getTransactions({ date: month });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest spending activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {transactions?.map((transaction) => {
            const category = transaction.line_items?.categories;
            const lineItem = transaction.line_items;
            return (
              <div
                key={transaction.id}
                className='flex items-center'
              >
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {transaction.description}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {transaction.date ? format(new Date(transaction.date), 'MM/dd/yy') : ''}
                  </p>
                </div>
                <div className='ml-auto flex items-center gap-2'>
                  <div className='rounded-full px-2 py-1 text-xs bg-muted'>
                    {category?.name} / {lineItem?.name}
                  </div>
                  <div className='font-medium'>
                    -${transaction.amount?.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
