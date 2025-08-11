'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserMinus, UserPlus, User, Mail, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface HouseholdMenuItemProps {
  household: {
    users: User[];
  };
  currentUserId: string;
}

export function HouseholdMenuItem({ household, currentUserId }: HouseholdMenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === '/settings';

  return (
    <Card className={cn(
      'transition-colors duration-200',
      isActive && 'ring-2 ring-primary/20 bg-primary/5'
    )}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className={cn(
              'transition-colors duration-200',
              isActive && 'text-primary'
            )}>
              Household Members
            </CardTitle>
            <CardDescription>Manage members of your household</CardDescription>
          </div>
          <Button 
            className={cn(
              'transition-colors duration-200',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <UserPlus className='mr-2 h-4 w-4' />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4'>
          {household.users.map((user, index) => {
            const isOwner = user.id === currentUserId;
            return (
              <div key={user.id}>
                <div className='flex items-center justify-between p-4 rounded-lg border bg-card'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
                      <User className='h-5 w-5 text-primary' />
                    </div>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium'>
                          {user.first_name} {user.last_name}
                        </h3>
                        {isOwner && (
                          <Badge className='text-xs'>
                            <Crown className='h-3 w-3' />
                            You
                          </Badge>
                        )}
                      </div>
                      <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                        <Mail className='h-3 w-3' />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {user.id !== currentUserId && (
                      <Button
                        variant='outline'
                        size='sm'
                      >
                        <UserMinus className='mr-2 h-4 w-4' />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                {index < household.users.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
