'use client';

import { useId, useRef } from 'react';
import { Icon } from '@/components/shell/Icon';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import {
  TransactionForm,
  type TransactionEditor,
} from './TransactionFormDialog';
import type {
  BudgetAccount,
  BudgetGroup,
} from '@/lib/budget/types';

export function AddTransactionFab({
  open,
  editor,
  onOpenChange,
  onClose,
  groups,
  accounts,
  accountsLinked,
  monthParam,
}: {
  open: boolean;
  editor: TransactionEditor | null;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  groups: BudgetGroup[];
  accounts: BudgetAccount[];
  accountsLinked: boolean;
  monthParam: string;
}) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const titleId = useId();
  const descriptionId = useId();
  const latest = useRef<TransactionEditor | null>(null);
  if (editor) latest.current = editor;
  const shown = editor ?? latest.current;

  const form = shown ? (
    <TransactionForm
      key={shown.token}
      initial={shown.draft}
      groups={groups}
      accounts={accounts}
      accountsLinked={accountsLinked}
      monthParam={monthParam}
      onClose={onClose}
      surface={isMobile ? 'drawer' : 'popover'}
      titleId={titleId}
      descriptionId={descriptionId}
    />
  ) : null;

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        autoFocus
      >
        <DrawerTrigger asChild>
          <FabButton />
        </DrawerTrigger>
        <DrawerContent className='data-[vaul-drawer-direction=bottom]:max-h-[min(92dvh,760px)]!'>
          <div className='max-h-[min(84dvh,700px)] overflow-y-auto overscroll-contain px-4 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]'>
            {form}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger asChild>
        <FabButton />
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='end'
        sideOffset={12}
        collisionPadding={16}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className='w-[min(420px,calc(100vw-2rem))] max-h-[min(36rem,70vh)] overflow-y-auto overscroll-contain rounded-2xl border-[var(--bb-line)] bg-[var(--bb-surface)] p-5 text-[var(--bb-text)] shadow-none'
        style={{ boxShadow: 'var(--bb-fab-shadow)' }}
      >
        {form}
      </PopoverContent>
    </Popover>
  );
}

function FabButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      {...props}
      type='button'
      aria-label='Add transaction'
      className={cn('bb-fab', className)}
    >
      <Icon
        name='plus'
        size={22}
        aria-hidden
      />
    </button>
  );
}
