import Image from "next/image"

export function Logo() {
  return (
    <Image
      src="https://gsilpsppthrhhqcuwzjw.supabase.co/storage/v1/object/public/logos//budget-brain-transparent.png"
      alt="Budget Brain Logo"
      width={100}
      height={100}
      className="h-14 w-14"
      priority
    />
  )
} 