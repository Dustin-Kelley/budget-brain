/** Unauthenticated and marketing routes render without the app chrome. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='flex min-h-screen flex-col'>{children}</div>;
}
