import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function Profile() {
  return (
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
  );
}
