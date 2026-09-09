import Link from "next/link";
import { ArrowUpRight, ClipboardList, MessageCircle, PackageSearch } from "lucide-react";

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I'd like an update on my order.");

const STEPS = [
  {
    icon: ClipboardList,
    title: "Order Confirmed",
    description: "You'll get an email confirmation as soon as your payment goes through.",
  },
  {
    icon: PackageSearch,
    title: "Packed & Dispatched",
    description: "Your order is handcrafted-checked, packed, and handed to Delhivery from our Pune workshop.",
  },
  {
    icon: MessageCircle,
    title: "On Its Way to You",
    description: "Delhivery carries it pan-India to your delivery address, based on the timeline for your pincode.",
  },
];

const SamoraTrackOrder = () => {
  return (
    <main className="bg-[#fbf6ef]">
      <section className="mx-auto max-w-[820px] px-5 py-14 md:px-10 md:py-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          Track My Order
        </p>
        <h1 className="font-samora-display mt-4 text-[32px] leading-[1.15] text-[#2b2420] sm:text-[38px] md:text-[44px]">
          Where&apos;s My Order?
        </h1>
        <p className="mt-5 text-[16.5px] leading-[1.75] text-[#5c5344] md:text-[18px]">
          Every Samora order is placed through your Artace account, so your full order history
          and current status live in one place &mdash; your account dashboard.
        </p>

        <div className="mt-8 rounded-[20px] border border-[#2b2420]/10 bg-[#f3ead9] p-6 md:p-8">
          <h2 className="font-samora-display text-[21px] text-[#2b2420]">
            Check Your Order Status
          </h2>
          <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[#5c5344]">
            Sign in to see every order you&apos;ve placed with Samora, its current status, and the
            details of what&apos;s inside.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#2b2420] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#1c1712]"
          >
            View My Orders
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="font-samora-display text-[21px] text-[#2b2420]">How Your Order Travels</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#c1683d]">
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </span>
                <h3 className="font-samora-display mt-4 text-[17px] text-[#2b2420]">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[#5c5344]">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-[20px] border border-[#2b2420]/10 bg-[#fbf6ef] p-6 md:p-8">
          <h2 className="font-samora-display text-[19px] text-[#2b2420]">
            Need a Faster Answer?
          </h2>
          <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[#5c5344]">
            Message us directly with your order number and we&apos;ll check the status for you.
          </p>
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#2b2420]/20 px-6 py-3 text-[14.5px] font-medium text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
          >
            WhatsApp Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SamoraTrackOrder;
