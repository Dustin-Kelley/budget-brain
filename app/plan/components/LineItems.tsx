'use client';

import { useState } from 'react';
import { DeleteItemButton } from './DeleteItemButton';
import { MoreHorizontal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { EditLineItemForm } from './EditLineItemForm';
import { LineItem } from '@/types/types';

export const LineItems = ({ lineItems }: { lineItems: LineItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      key={lineItems.id}
      className='flex items-center justify-between text-sm'
    >
      <span className='text-muted-foreground'>{lineItems.name}</span>
      <div className='flex items-center gap-2'>
        <span className='font-medium'>${lineItems.planned_amount}</span>
        <Popover
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
            >
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='flex gap-2 flex-col'>
            <DeleteItemButton lineItemId={lineItems.id} />
            <EditLineItemForm lineItem={lineItems} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
