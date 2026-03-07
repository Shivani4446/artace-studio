import Link from "next/link";

export default function OrdersDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-[980px] px-6 py-14 md:px-12">
      <section className="border border-[#1f1f1f]/10 bg-white p-8">
        <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Dashboard</p>
        <h1 className="mt-2 font-display text-5xl text-[#222]">Orders</h1>
        <p className="mt-4 text-sm text-[#444]">
          Account login and signup have been removed from this storefront.
        </p>
        <p className="mt-2 text-sm text-[#444]">
          For order help, please contact support.
        </p>
        <Link
          href="/contact-us"
          className="mt-6 inline-flex bg-[#222] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.06em] text-white hover:bg-black"
        >
          Contact Support
        </Link>
      </section>
    </main>
  );
}
