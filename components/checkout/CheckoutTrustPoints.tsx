import { type LucideIcon, Receipt, Star, BadgeCheck, ShieldCheck, Paintbrush } from "lucide-react";

type TrustPoint = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const TRUST_POINTS: TrustPoint[] = [
  {
    icon: Receipt,
    title: "No Surprise Fees",
    description:
      "No surprise charges or fees. The price you pay at checkout is final. Guaranteed.",
  },
  {
    icon: Star,
    title: "Thousands Of Five-Star Reviews",
    description: "We deliver world-class customer service to all of our art buyers.",
  },
  {
    icon: BadgeCheck,
    title: "Satisfaction Guaranteed",
    description: "Our 15-day satisfaction guarantee allows you to buy with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure Shopping",
    description: "All payments and transactions are secure and encrypted.",
  },
  {
    icon: Paintbrush,
    title: "Support An Artist With Every Purchase",
    description: "We pay our artists more on every sale than other galleries.",
  },
];

export default function CheckoutTrustPoints() {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {TRUST_POINTS.map((point) => {
        const Icon = point.icon;
        return (
          <div key={point.title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#2f2f2f]" />
            <div>
              <p className="text-sm font-semibold text-[#1f1f1f]">{point.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-[#666]">{point.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
