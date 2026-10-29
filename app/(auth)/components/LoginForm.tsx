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
  token: z
    .string()
    .regex(/^\d{6}$/, 'Please enter the 6-digit code'),
});

function sanitizeOtpValue(value: string) {
  // Autofill often dumps the email into this field; drop that entirely
  if (/[a-zA-Z@]/.test(value)) return '';
  return value.replace(/\D/g, '').slice(0, 6);
}

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
    otpForm.reset({ token: '' });
    setStep('otp');
    toast.success('Check your email for a verification code');
  };

  const onVerifyOtp = async (data: OtpFormValues) => {
    const { error } = await verifyOtp(email, data.token);
    if (error) {
      toast.error(error);
    }
  };

  const otpSlotClass =
    'aspect-square h-auto w-full rounded-xl text-lg sm:text-xl';

  return (
    <div className={cn('flex w-full flex-col', className)} {...props}>
      <Card className='w-full gap-8 py-8 sm:py-10'>
        <CardHeader className='gap-3 px-5 text-center sm:px-8'>
          <CardTitle className='text-2xl font-semibold tracking-tight sm:text-3xl'>
            {step === 'email' ? 'Welcome' : 'Enter verification code'}
          </CardTitle>
          <CardDescription className='text-base leading-relaxed text-balance'>
            {step === 'email'
              ? 'Enter your email to sign in or create an account'
              : `We sent a 6-digit code to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className='px-5 sm:px-8'>
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
                      <FormLabel className='text-base'>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='m@example.com'
                          type='email'
                          autoComplete='email'
                          className='h-11 px-3.5 text-base md:text-base'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='h-11 w-full text-base'>
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
                {/* Hidden decoy so managers fill this instead of the real OTP field */}
                <input
                  type='text'
                  name='username'
                  autoComplete='username'
                  tabIndex={-1}
                  aria-hidden='true'
                  className='sr-only'
                  defaultValue={email}
                  readOnly
                />
                <FormField
                  control={otpForm.control}
                  name='token'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormControl>
                        <InputOTP
                          key={`otp-${email}`}
                          maxLength={6}
                          autoComplete='one-time-code'
                          name='otp'
                          inputMode='numeric'
                          autoCorrect='off'
                          autoCapitalize='off'
                          spellCheck={false}
                          pushPasswordManagerStrategy='none'
                          pasteTransformer={sanitizeOtpValue}
                          containerClassName='w-full'
                          value={field.value}
                          onChange={(value) =>
                            field.onChange(sanitizeOtpValue(value))
                          }
                        >
                          <InputOTPGroup className='grid w-full grid-cols-6 gap-1.5 sm:gap-2.5'>
                            <InputOTPSlot index={0} className={otpSlotClass} />
                            <InputOTPSlot index={1} className={otpSlotClass} />
                            <InputOTPSlot index={2} className={otpSlotClass} />
                            <InputOTPSlot index={3} className={otpSlotClass} />
                            <InputOTPSlot index={4} className={otpSlotClass} />
                            <InputOTPSlot index={5} className={otpSlotClass} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage className='text-center' />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='h-11 w-full text-base'>
                  {otpForm.formState.isSubmitting ? <Spinner /> : 'Verify'}
                </Button>
                <div className='flex flex-col items-center gap-3 text-base sm:flex-row sm:justify-center sm:gap-6'>
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
