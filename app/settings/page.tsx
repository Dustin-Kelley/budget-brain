import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DarkModeToggle } from '../../components/app/DarkModeToggle';
import LogoutButton from '@/components/app/LogoutButton';
import { ResetBudgetButton } from '../components/ResetBudgetButton';
import { HouseHold } from './components/HouseHold';
import { ManageSubscriptionCard } from './components/ManageSubscriptionCard';
import { Profile } from './components/Profile';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  return (
    <div className='container mx-auto py-8'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-bold'>Profile & Settings</h1>
            <p className='text-muted-foreground'>
              Manage your account settings and preferences
            </p>
          </div>
          <DarkModeToggle />
        </div>
        <Separator />
        <ResetBudgetButton month={month} />
        <HouseHold />
        <Profile />
        <ManageSubscriptionCard />

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Change Password</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter new password'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='confirm-password'>Confirm Password</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  placeholder='Confirm new password'
                />
              </div>
            </div>
            <Button className='mt-4'>Update Password</Button>
          </CardContent>
        </Card>

        <LogoutButton />
      </div>
    </div>
  );
}
