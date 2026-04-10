import { getMatchById } from '@/lib/mock-data'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MatchReplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const match = await getMatchById(id)

  if (!match) notFound()

  return (
    <div style={{ background: '#faf9f7', minHeight: '100vh', color: '#2a2520' }}>
      <nav style={{ background: '#faf9f7', borderBottom: '0.5px solid #e8e5e0' }} className="px-4 h-11 flex items-center gap-2.5">
        <Link href="/dashboard?role=insider" style={{ fontSize: 12, color: '#b0a898' }}>
          ← Matches
        </Link>
        <span style={{ fontSize: 13, color: '#9a9088' }}>Write a response</span>
      </nav>

      <div className="px-4 pt-5 pb-8 max-w-2xl mx-auto">
        <p style={{ fontSize: 10, color: '#b0a898', letterSpacing: '0.12em' }} className="font-medium uppercase mb-2">
          The request
        </p>
        <div style={{ background: '#f2ede6', borderRadius: 10 }} className="p-3.5 mb-6">
          <p style={{ fontSize: 14, color: '#3a3530', lineHeight: 1.6 }} className="mb-2">
            {match.clientQuery}
          </p>
          <span style={{ fontSize: 11, background: '#ede9e3', color: '#8a8078', borderRadius: 20 }} className="inline-block px-2.5 py-0.5">
            {Math.round(match.matchScore * 100)}% match to your profile
          </span>
        </div>

        <p style={{ fontSize: 10, color: '#b0a898', letterSpacing: '0.12em' }} className="font-medium uppercase mb-2">
          Your response
        </p>
        <p style={{ fontSize: 12, color: '#9a9088' }} className="mb-2">
          Write from your actual experience. The client sees nothing until they pay.
        </p>
        <textarea
          style={{
            width: '100%',
            background: '#fff',
            border: '0.5px solid #e8e5e0',
            borderRadius: 10,
            padding: '12px',
            fontSize: 13,
            color: '#3a3530',
            lineHeight: 1.6,
            resize: 'none',
            height: 120,
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          placeholder="What do you know about this that most people don't…"
        />

        <div className="flex items-center gap-2.5 my-4">
          <span style={{ fontSize: 12, color: '#9a9088' }} className="whitespace-nowrap">Your price</span>
          <input
            type="number"
            defaultValue={150}
            min={0}
            step={10}
            style={{
              background: '#fff',
              border: '0.5px solid #e8e5e0',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 15,
              fontWeight: 500,
              color: '#2a2520',
              width: 100,
              fontFamily: 'inherit',
            }}
          />
          <span style={{ fontSize: 11, color: '#c8c0b4' }}>THB · client sees this before unlocking</span>
        </div>

        <div style={{ borderTop: '0.5px solid #e8e5e0' }} className="flex items-center justify-between mt-5 pt-4">
          <button style={{ fontSize: 12, color: '#c8c0b4', background: 'none', border: 'none', cursor: 'pointer' }}>
            Skip this request
          </button>
          <button style={{ fontSize: 13, background: '#2a2520', color: '#faf9f7', borderRadius: 20, border: 'none', cursor: 'pointer' }} className="font-medium px-5 py-2.5">
            Submit response
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#b0a898', background: '#f2ede6', borderRadius: 8 }} className="mt-4 p-3 leading-relaxed">
          When the client unlocks your response, ฿{match.yourPrice ?? 150} goes into your wallet. You can withdraw at any time from Settings.
        </div>
      </div>
    </div>
  )
}
