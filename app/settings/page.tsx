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
import { UserPlus, UserMinus } from 'lucide-react';
import { DarkModeToggle } from '../components/DarkModeToggle';

export default function SettingsPage() {
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

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  placeholder='John Doe'
                  defaultValue='John Smith'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='john@example.com'
                  defaultValue='john.smith@example.com'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='household'>Household</Label>
                <Input
                  id='household'
                  placeholder='Household Name'
                  defaultValue='Smith Family'
                  disabled
                />
              </div>
            </div>
            <Button className='mt-4'>Save Changes</Button>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Household Members</CardTitle>
                <CardDescription>
                  Manage members of your household
                </CardDescription>
              </div>
              <Button>
                <UserPlus className='mr-2 h-4 w-4' />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <h3 className='font-medium'>John Smith</h3>
                  <p className='text-sm text-muted-foreground'>
                    john.smith@example.com
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>Admin</span>
                  <Button
                    variant='ghost'
                    size='icon'
                  >
                    <UserMinus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <h3 className='font-medium'>Jane Smith</h3>
                  <p className='text-sm text-muted-foreground'>
                    jane.smith@example.com
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>Admin</span>
                  <Button
                    variant='ghost'
                    size='icon'
                  >
                    <UserMinus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
