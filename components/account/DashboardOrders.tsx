"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardOrder } from "@/utils/woocommerce-orders";

const formatCurrency = (value: string, currency: string) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value || "Price on Request";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  } catch {
    return `${currency || "INR"} ${amount.toFixed(2)}`;
  }
};

const formatDate = (value: string) => {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const statusLabel = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const OrderCard = ({ order }: { order: DashboardOrder }) => (
  <article className="rounded-[16px] border border-black/8 bg-white p-4 sm:p-5 md:p-6">
    <div className="flex flex-col gap-3 border-b border-black/8 pb-5 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-[13px] uppercase tracking-[0.08em] text-[#7a7368]">
          Order #{order.number}
        </p>
        <h3 className="mt-2 font-display text-[24px] leading-[1.05] text-[#1f1f1f] sm:text-[28px]">
          {statusLabel(order.status)}
        </h3>
      </div>

      <div className="inline-flex w-fit rounded-full bg-[#f4efe7] px-4 py-2 text-[13px] font-medium text-[#1f1f1f]">
        {formatDate(order.dateCreated)}
      </div>
    </div>

    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <p className="text-[13px] uppercase tracking-[0.08em] text-[#7a7368]">Total</p>
        <p className="mt-2 text-[16px] font-medium text-[#1f1f1f]">
          {formatCurrency(order.total, order.currency)}
        </p>
      </div>
      <div>
        <p className="text-[13px] uppercase tracking-[0.08em] text-[#7a7368]">
          Payment Method
        </p>
        <p className="mt-2 text-[16px] font-medium text-[#1f1f1f]">
          {order.paymentMethodTitle || "Not available"}
        </p>
      </div>
      <div>
        <p className="text-[13px] uppercase tracking-[0.08em] text-[#7a7368]">
          Contact
        </p>
        <p className="mt-2 text-[16px] font-medium text-[#1f1f1f]">
          {order.customerEmail || "Not available"}
        </p>
      </div>
    </div>

    <div className="mt-6">
      <p className="text-[13px] uppercase tracking-[0.08em] text-[#7a7368]">Items</p>
      <ul className="mt-3 space-y-3">
        {order.items.map((item) => (
          <li
            key={`${order.id}-${item.id}`}
            className="flex flex-col gap-2 rounded-[12px] bg-[#fcfaf7] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div>
              <p className="text-[15px] font-medium text-[#1f1f1f]">{item.name}</p>
              <p className="mt-1 text-[14px] text-[#666]">Quantity: {item.quantity}</p>
            </div>
            <p className="text-[15px] font-medium text-[#1f1f1f]">
              {formatCurrency(item.total, order.currency)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export default function DashboardOrders() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        error?: string;
        orders?: DashboardOrder[];
      };

      if (!isActive) {
        return;
      }

      if (!response.ok) {
        setError(payload.error || "Unable to load your orders right now.");
        setIsLoading(false);
        return;
      }

      setOrders(payload.orders || []);
      setIsLoading(false);
    };

    void loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="rounded-[18px] border border-black/8 bg-white p-5 sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
            Order Tracking
          </p>
          <h2 className="mt-3 font-display text-[30px] leading-[1.05] text-[#1f1f1f] sm:text-[34px]">
            Your orders
          </h2>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.75] text-[#5b5b5b]">
            Track live order history, review purchased items, and contact Artace
            support if you need help with shipping or delivery updates.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex w-full items-center justify-center rounded-[10px] border border-black/10 px-5 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8] md:w-auto"
        >
          Continue Shopping
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-[16px] bg-[#fcfaf7] px-5 py-8 text-center md:px-8 md:py-10">
          <p className="text-[15px] leading-[1.75] text-[#5b5b5b]">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-[16px] bg-[#f7ebe8] px-5 py-5 text-[15px] leading-[1.7] text-[#9a3d2f]">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-[16px] bg-[#fcfaf7] px-5 py-8 text-center md:px-8 md:py-10">
          <h3 className="font-display text-[24px] leading-[1.08] text-[#1f1f1f] sm:text-[28px]">
            No orders found yet
          </h3>
          <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-[1.75] text-[#5b5b5b]">
            Once you place an order while logged into your account, it will appear here
            for easy tracking.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-[10px] bg-[#1f1f1f] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
            >
              Explore Art
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center rounded-[10px] border border-black/10 px-5 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}
