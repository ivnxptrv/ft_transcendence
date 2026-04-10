import { getOrderById, getResponsesForOrder } from '@/lib/mock-data'
import type { ResponseCard } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function CredDots({ score }: { score: number }) {
  const filled = Math.round(score)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: i <= filled ? '#c4882a' : '#1e1e1e',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: '#555' }}>{score.toFixed(1)}</span>
    </div>
  )
}

function ResponseCardView({ card }: { card: ResponseCard }) {
  return (
    <div
      style={{
        background: card.isUnlocked ? '#141a10' : '#111',
        border: `0.5px solid ${card.isUnlocked ? '#1e2e18' : '#222'}`,
        borderRadius: 12,
      }}
      className="p-3.5"
    >
      <div className="flex items-start justify-between gap-2.5 mb-2.5">
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, fontStyle: 'italic' }} className="flex-1">
          {card.insiderLegend}
        </p>
        <span style={{ fontSize: 14, color: '#e4e4e4' }} className="font-medium whitespace-nowrap">
          ฿{card.price}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <CredDots score={card.credibilityScore} />
        {card.isUnlocked ? (
          <span style={{ fontSize: 10, background: '#1e2e18', color: '#4a9e5a', borderRadius: 20 }} className="font-medium px-2 py-0.5">
            Unlocked
          </span>
        ) : (
          <button style={{ fontSize: 11, background: '#e4e4e4', color: '#0f0f0f', borderRadius: 20 }} className="font-medium px-3 py-1">
            Unlock
          </button>
        )}
      </div>

      {card.isUnlocked && card.insiderInsight && (
        <p
          style={{
            fontSize: 13,
            color: '#9ac888',
            lineHeight: 1.65,
            borderTop: '0.5px solid #1e2e18',
          }}
          className="mt-3 pt-3"
        >
          {card.insiderInsight}
        </p>
      )}
    </div>
  )
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [order, responses] = await Promise.all([
    getOrderById(id),
    getResponsesForOrder(id),
  ])

  if (!order) notFound()

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh' }}>
      <nav style={{ background: '#0f0f0f', borderBottom: '0.5px solid #1f1f1f' }} className="px-4 h-11 flex items-center gap-2.5">
        <Link href="/dashboard" style={{ fontSize: 12, color: '#444' }}>
          ← Requests
        </Link>
        <span style={{ fontSize: 13, color: '#888' }}>Request detail</span>
      </nav>

      <div className="px-4 pt-5 pb-8 max-w-2xl mx-auto">
        <p style={{ fontSize: 15, color: '#ccc', lineHeight: 1.6 }} className="mb-1.5">
          {order.clientQuery}
        </p>
        <p style={{ fontSize: 11, color: '#3a3a3a' }} className="mb-6">
          Submitted {order.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {order.responseCount} responses
        </p>

        <p style={{ fontSize: 11, color: '#444', letterSpacing: '0.1em' }} className="font-medium uppercase mb-3">
          Responses
        </p>

        <div className="flex flex-col gap-2.5">
          {responses.map(card => (
            <ResponseCardView key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  )
}
