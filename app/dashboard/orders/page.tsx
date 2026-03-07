"use client";

import React, { useState } from "react";
import Link from "next/link";

type DashboardOrderItem = {
  id: number;
  name: string;
  quantity: number;
  total: string;
};

type DashboardOrder = {
  id: number;
  number: string;
  status: string;
  dateCreated: string;
  total: string;
  currency: string;
  paymentMethodTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: DashboardOrderItem[];
};

const formatDateTime = (rawValue: string) => {
  if (!rawValue) return "-";
  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) return rawValue;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const OrdersDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");
  const [orders, setOrders] = useState<DashboardOrder[]>([]);

  const checkAuthAndLoad = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
      const mePayload = (await meResponse.json()) as {
        authenticated?: boolean;
        user?: { name?: string };
      };

      if (!meResponse.ok || !mePayload.authenticated) {
        setIsAuthenticated(false);
        setOrders([]);
        return;
      }

      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        orders?: DashboardOrder[];
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Could not load orders.");
      }

      setIsAuthenticated(true);
      setUserName(mePayload.user?.name || "Customer");
      setOrders(payload.orders || []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not load orders right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    setUserName("");
    setOrders([]);
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Dashboard</p>
          <h1 className="mt-2 font-display text-5xl text-[#222]">Orders</h1>
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="border border-[#222] px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#222] hover:bg-[#222] hover:text-white"
          >
            Logout
          </button>
        )}
      </div>

      {isAuthenticated === false && (
        <section className="mb-8 border border-[#1f1f1f]/10 bg-white p-5">
          <p className="text-sm text-[#444]">Please login to view your order history.</p>
          <Link
            href="/dashboard/login"
            className="mt-4 inline-flex bg-[#222] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.06em] text-white hover:bg-black"
          >
            Login
          </Link>
        </section>
      )}

      {isAuthenticated && (
        <section className="mb-8 border border-[#1f1f1f]/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#444]">
              Signed in as <span className="font-semibold text-[#222]">{userName}</span>
            </p>
            <button
              type="button"
              onClick={checkAuthAndLoad}
              disabled={isLoading}
              className="bg-[#222] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Loading..." : "Refresh Orders"}
            </button>
          </div>
        </section>
      )}

      {error && <p className="mb-4 text-sm text-[#b42318]">{error}</p>}

      {isAuthenticated && orders.length === 0 && !isLoading ? (
        <div className="border border-[#1f1f1f]/10 bg-white px-6 py-8 text-[#5f5a52]">
          <p className="font-semibold text-[#222]">No Orders Yet</p>
          <p className="mt-2 text-sm">Your placed orders will appear here.</p>
        </div>
      ) : (
        isAuthenticated && <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="border border-[#1f1f1f]/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl text-[#222]">Order #{order.number}</h2>
                  <p className="mt-1 text-sm text-[#666]">{formatDateTime(order.dateCreated)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.08em] text-[#666]">Status</p>
                  <p className="text-sm font-semibold text-[#222]">{order.status}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[#444] md:grid-cols-3">
                <p>
                  <span className="font-semibold text-[#222]">Customer:</span>{" "}
                  {order.customerName || "-"}
                </p>
                <p>
                  <span className="font-semibold text-[#222]">Email:</span>{" "}
                  {order.customerEmail || "-"}
                </p>
                <p>
                  <span className="font-semibold text-[#222]">Phone:</span>{" "}
                  {order.customerPhone || "-"}
                </p>
                <p>
                  <span className="font-semibold text-[#222]">Total:</span>{" "}
                  {order.currency} {order.total}
                </p>
                <p>
                  <span className="font-semibold text-[#222]">Payment:</span>{" "}
                  {order.paymentMethodTitle || "-"}
                </p>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border border-[#1f1f1f]/10 text-sm">
                  <thead>
                    <tr className="bg-[#f7f5f0] text-left text-[#444]">
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t border-[#1f1f1f]/10">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">
                          {order.currency} {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default OrdersDashboardPage;
