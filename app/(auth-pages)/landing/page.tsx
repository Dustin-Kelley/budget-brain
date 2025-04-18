import Link from 'next/link'

export default function page() {
  return (
    <div>
      <Link href="/sign-in">Sign in</Link>
      <Link href="/sign-up">Sign up</Link>
    </div>
  )
}
