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
import React from 'react';
import { getHouseHoldById } from '../queries/getHouseHoldById';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { redirect } from 'next/navigation';

export async function HouseHold() {
  const { currentUser } = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }
  const { household, householdError } = await getHouseHoldById({
    householdId: currentUser.household_id,
  });
  if (householdError || !household) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Household Members</CardTitle>
          <CardDescription>Error loading household members</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Household Members</CardTitle>
            <CardDescription>Manage members of your household</CardDescription>
          </div>
          <Button>
            <UserPlus className='mr-2 h-4 w-4' />
            Add Member
          </Button>
        </div>
      </CardHeader> 
      <CardContent>
        <div className='flex flex-col gap-4'>
          {household.users.map((user, index) => {
            const isOwner = user.id === currentUser.id;
            return (
              <div key={user.id}>
                <div className='flex items-center  justify-between p-4 rounded-lg border bg-card'>
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
                            <Crown className=' h-3 w-3' />
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
                    {user.id !== currentUser.id && (
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
