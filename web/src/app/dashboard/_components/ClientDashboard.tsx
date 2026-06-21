import type { Order } from "@/lib/types";
import type { Result } from "@/lib/errors";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/orders";
import ClientNav from "./ClientNav";
import NewOrderButton from "./NewOrderButton";
import { SectionError } from "@/app/_components/SectionError";

export default function ClientDashboard({
  orders,
  userName,
}: {
  orders: Result<Order[]>;
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <ClientNav />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-2">
              Client Profile
            </p>
            <h1 className="text-4xl font-bold bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              {userName}
            </h1>
          </div>
          <NewOrderButton />
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Active Orders
            </h2>
            {orders.ok && (
              <span className="text-[10px] text-zinc-700">{orders.data.length} total</span>
            )}
          </div>

          {orders.ok ? (
            <div className="grid gap-3">
              {orders.data.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6 mb-2">
                    <p className="text-base text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                      {order.title}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap shrink-0 border border-white/5 ${STATUS_VARIANT[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                    {order.text}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-medium">
                    <span className="text-zinc-600">{formatDate(new Date(order.createdAt))}</span>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span>responses</span>
                    </div>
                  </div>

                  {/* Subtle Hover Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-white/1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Link>
              ))}
            </div>
          ) : (
            <SectionError code={orders.error.code} op="interaction.orders" tone="dark" />
          )}
        </section>
      </main>
    </div>
  );
}
