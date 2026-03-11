import Link from "next/link";
import { auth } from "@/utils/auth";
import { fetchWooCommerceOrdersForToken } from "@/utils/woocommerce-orders";

export const runtime = "edge";

export default async function DashboardPage() {
  const session = await auth();
  const orders = session?.accessToken
    ? await fetchWooCommerceOrdersForToken(session.accessToken).catch(() => [])
    : [];

  return (
    <section className="rounded-[18px] border border-black/8 bg-white p-5 sm:p-6 md:p-8">
      <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">Overview</p>
      <h2 className="mt-3 font-display text-[30px] leading-[1.05] text-[#1f1f1f] sm:text-[34px]">
        Good to see you, {session?.user?.name?.split(" ")[0] || "there"}.
      </h2>
      <p className="mt-4 max-w-[760px] text-[16px] leading-[1.75] text-[#5b5b5b]">
        Your Artace account keeps order tracking, support, and future purchases in one
        place.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Orders</p>
          <p className="mt-2 font-display text-[34px] leading-none text-[#1f1f1f]">
            {orders.length}
          </p>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#5b5b5b]">
            Completed and active orders linked to your account.
          </p>
        </article>

        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Account Email</p>
          <p className="mt-2 text-[16px] font-medium text-[#1f1f1f]">
            {session?.user?.email || "Not available"}
          </p>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#5b5b5b]">
            This is the email currently linked to your WordPress customer account.
          </p>
        </article>

        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Need Help?</p>
          <p className="mt-2 text-[16px] font-medium text-[#1f1f1f]">
            We can help with shipping, payments, and custom commissions.
          </p>
          <Link
            href="/contact-us"
            className="mt-4 inline-flex text-[14px] font-medium text-[#1f1f1f] underline"
          >
            Contact support
          </Link>
        </article>
      </div>

      <div className="mt-8 rounded-[14px] border border-black/8 bg-[#faf8f4] p-5 md:p-6">
        <h3 className="font-display text-[26px] leading-[1.08] text-[#1f1f1f]">
          Track your latest orders
        </h3>
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.7] text-[#5b5b5b]">
          Review current order statuses, totals, and item details from your dashboard.
        </p>
        <Link
          href="/dashboard/orders"
          className="mt-5 inline-flex w-full items-center justify-center rounded-[10px] bg-[#1f1f1f] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black sm:w-auto"
        >
          View Orders
        </Link>
      </div>
    </section>
  );
}
