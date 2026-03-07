import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[900px] flex-col items-center justify-center px-6 py-20 text-center md:px-12">
      <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Checkout</p>
      <h1 className="mt-2 font-display text-4xl text-[#222] md:text-5xl">
        Order Placed Successfully
      </h1>
      <p className="mt-4 max-w-xl text-base text-[#555] md:text-lg">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-flex bg-[#222] px-6 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black"
      >
        Continue Shopping
      </Link>
    </main>
  );
}
