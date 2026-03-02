import React from "react";
import { BadgeCheck, Headphones, Truck } from "lucide-react";

const testimonials = [
  {
    id: 1,
    icon: BadgeCheck,
    title: "A Guarantee of Authenticity",
    description:
      "Every artwork is sourced directly from verified artists and handled with strict quality checks.",
  },
  {
    id: 2,
    icon: Headphones,
    title: "Tailored Personal Support",
    description:
      "Our team helps you choose size, framing, and placement so each piece complements your interior.",
  },
  {
    id: 3,
    icon: Truck,
    title: "Convenient Delivery",
    description:
      "Professionally packed and delivered with tracking so your art arrives safely and ready to display.",
  },
];

const Testimonials = () => {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 py-14 text-center md:px-6 md:py-20">
      <h2 className="font-display text-[30px] text-black md:text-[40px]">
        An Experience People Trust
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-black/60 md:text-sm">
        We blend curatorial expertise, artist collaboration, and careful
        delivery to create a smooth experience from discovery to display.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-7 text-left md:mt-12 md:grid-cols-3 md:gap-8">
        {testimonials.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.id}>
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/20">
                <Icon className="h-4 w-4 text-black/70" />
              </div>
              <h3 className="font-display text-xl text-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/60">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Testimonials;
