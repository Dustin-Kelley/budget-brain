import Image from "next/image"

export function Logo() {
  return (
    <Image
      src="/icons/budget-brain-logo.png"
      alt="Budget Brain Logo"
      width={100}
      height={100}
      className="h-14 w-14"
      priority
    />
  )
} 