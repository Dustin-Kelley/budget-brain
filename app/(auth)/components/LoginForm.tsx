'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sendOtp, verifyOtp } from '../login/actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Spinner } from '@/components/app/Spinner';
import { useState } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  token: z.string().min(6, 'Please enter the 6-digit code'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  });

  const onSendOtp = async (data: EmailFormValues) => {
    const { error } = await sendOtp(data.email);
    if (error) {
      toast.error(error);
      return;
    }
    setEmail(data.email);
    setStep('otp');
    toast.success('Check your email for a verification code');
  };

  const onVerifyOtp = async (data: OtpFormValues) => {
    const { error } = await verifyOtp(email, data.token);
    if (error) {
      toast.error(error);
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card className=''>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>
            {step === 'email' ? 'Welcome' : 'Enter verification code'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Enter your email to sign in or create an account'
              : `We sent a code to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onSendOtp)}
                className='grid gap-6'
              >
                <FormField
                  control={emailForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='m@example.com'
                          type='email'
                          autoComplete='email'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full'>
                  {emailForm.formState.isSubmitting ? <Spinner /> : 'Continue'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(onVerifyOtp)}
                className='grid gap-6'
                autoComplete='off'
              >
                <FormField
                  control={otpForm.control}
                  name='token'
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-center'>
                      <FormControl>
                        <InputOTP maxLength={6} autoComplete='off' name='otp-code' inputMode='numeric' value={field.value} onChange={field.onChange}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full'>
                  {otpForm.formState.isSubmitting ? <Spinner /> : 'Verify'}
                </Button>
                <div className='flex justify-center gap-4 text-sm'>
                  <button
                    type='button'
                    className='text-muted-foreground hover:text-foreground underline underline-offset-4'
                    onClick={() => {
                      setStep('email');
                      otpForm.reset();
                    }}
                  >
                    Use a different email
                  </button>
                  <button
                    type='button'
                    className='text-muted-foreground hover:text-foreground underline underline-offset-4'
                    onClick={async () => {
                      const { error } = await sendOtp(email);
                      if (error) {
                        toast.error(error);
                      } else {
                        toast.success('New code sent');
                      }
                    }}
                  >
                    Resend code
                  </button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
