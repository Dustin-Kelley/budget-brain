import { headers } from "next/headers";


export default async function CheckoutSuccess() {
  const headersList = await headers();
  const email = headersList.get('email');

  return (
    <section className="flex flex-col gap-4" id="success">
      <p>
        We appreciate your business! A confirmation email will be sent to {email ? email : 'you'}
      </p>

      <p>If you have any questions, please email {' '}
        <a href="mailto:orders@example.com">orders@example.com</a>.
      </p>
    </section>
  )
}
