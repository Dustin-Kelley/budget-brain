import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Offline',
};

const OFFLINE_CSS = `
.bb-offline {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding:
    calc(24px + env(safe-area-inset-top, 0px))
    calc(24px + env(safe-area-inset-right, 0px))
    calc(24px + env(safe-area-inset-bottom, 0px))
    calc(24px + env(safe-area-inset-left, 0px));
  background: #ffffff;
  color: #0a0a0a;
  text-align: center;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.bb-offline h1 {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.03em;
}
.bb-offline p {
  margin: 0;
  max-width: 28rem;
  color: #5c5c5c;
  font-size: 15px;
  line-height: 1.45;
}
.bb-offline a {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: #0a0a0a;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}
@media (prefers-color-scheme: dark) {
  .bb-offline { background: #0a0a0a; color: #fafafa; }
  .bb-offline p { color: #a3a3a3; }
  .bb-offline a { background: #ffffff; color: #0a0a0a; }
}
.dark .bb-offline { background: #0a0a0a; color: #fafafa; }
.dark .bb-offline p { color: #a3a3a3; }
.dark .bb-offline a { background: #ffffff; color: #0a0a0a; }
`;

export default function OfflinePage() {
  return (
    <main className='bb-offline'>
      <style>{OFFLINE_CSS}</style>
      <Logo size={48} />
      <h1>You&apos;re offline</h1>
      <p>
        Budget Brain needs a connection to load your household. Reconnect,
        then try again.
      </p>
      <Link
        className='bb-offline-action'
        href='/'
        prefetch={false}
      >
        Try again
      </Link>
    </main>
  );
}
