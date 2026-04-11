import type { Order, OrderStatus } from "@/lib/types";
import Link from "next/link";
import ClientNav from "./ClientNav";
import NewOrderButton from "./NewOrderButton";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Waiting",
  has_responses: "Responses in",
  completed: "Completed",
};

const STATUS_STYLE: Record<OrderStatus, { background: string; color: string }> = {
  pending: { background: "#1e1e1e", color: "#555" },
  has_responses: { background: "#2a1f00", color: "#d4a040" },
  completed: { background: "#0a1f10", color: "#3d9e5f" },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function ClientDashboard({ orders }: { orders: Order[] }) {
  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", color: "#e4e4e4" }}>
      <ClientNav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <p
          style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em" }}
          className="font-medium uppercase mb-0.5"
        >
          Client
        </p>
        <h1 style={{ fontSize: 20, color: "#e4e4e4" }} className="font-medium mb-6">
          Priya Mehta
        </h1>

        <div className="flex items-center justify-between mb-2.5">
          <span style={{ fontSize: 12, color: "#555" }}>Your requests</span>
          <NewOrderButton />
        </div>

        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              style={{ background: "#161616", border: "0.5px solid #2a2a2a", borderRadius: 12 }}
              className="block p-3.5 hover:border-[#333] transition-colors"
            >
              <div className="flex items-start gap-2.5 mb-2.5">
                <p
                  style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5 }}
                  className="flex-1 line-clamp-2"
                >
                  {order.query}
                </p>
                <span
                  style={{ fontSize: 10, borderRadius: 20, ...STATUS_STYLE[order.status] }}
                  className="font-medium px-2 py-0.5 whitespace-nowrap shrink-0"
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 11, color: "#3a3a3a" }}>
                  {formatDate(order.createdAt)}
                </span>
                {order.responseCount > 0 && (
                  <span style={{ fontSize: 11, color: "#555" }}>
                    {order.responseCount} response{order.responseCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
