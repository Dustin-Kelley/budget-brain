import { Brain } from "lucide-react"
import Link from "next/link"
import { SignUpForm } from "../components/SignUpForm"
import Image from "next/image"

export default function Page() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/welcome" className="flex items-center gap-2 font-medium">
          <div className='flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground'>
          <Brain className='size-8' />
            </div>
           Budget Brain
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          width={1376}
          height={1376}
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
