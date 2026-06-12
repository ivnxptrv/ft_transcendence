import httpx
import asyncio

orders = [
  {
    "client_id": "20",
    "order_id": 5,
    "text": "I need help with billing reconciliation and duplicate transaction processing. My payment went through twice for the same transaction, please issue a refund for the duplicate charge."
  },
  {
    "client_id": "21",
    "order_id": 12,
    "text": "I need help with REST API authentication protocols and endpoint validation. The API documentation seems to have an error in the authentication endpoint example, getting a 401 consistently."
  },
  {
    "client_id": "22",
    "order_id": 3,
    "text": "I need help with logistics modification and pending shipment routing. I need to update the shipping address on my pending order before it leaves the warehouse."
  },
  {
    "client_id": "23",
    "order_id": 8,
    "text": "I need help with application error diagnostics and server-side stack traces. The dashboard keeps throwing a 500 internal server error whenever I try to export my monthly analytics report."
  },
  {
    "client_id": "24",
    "order_id": 1,
    "text": "I need help with subscription lifecycle management and account tier extensions. Can I get an extension on my trial period? Our team needs another week to fully evaluate the software integration."
  },
  {
    "client_id": "25",
    "order_id": 19,
    "text": "I need help with network firewall configurations and webhook ingress rules. Our corporate network is blocking your webhooks; can you provide a static list of IP addresses for whitelisting?"
  },
  {
    "client_id": "26",
    "order_id": 7,
    "text": "I need help with hardware damage claims and transit quality assurance. The package arrived today but two of the main components are completely shattered in the box."
  },
  {
    "client_id": "27",
    "order_id": 14,
    "text": "I need help with Identity and Access Management (IAM) token expiration policies. I am unable to reset my password because the verification email link expires immediately upon clicking it."
  },
  {
    "client_id": "28",
    "order_id": 2,
    "text": "I need help with corporate tax documentation and international VAT compliance. Requesting a formal corporate invoice with our specific VAT number added for tax compliance purposes."
  },
  {
    "client_id": "29",
    "order_id": 11,
    "text": "I need help with hardware firmware regression and peripheral connectivity protocols. The latest firmware update broke the bluetooth syncing feature on all our deployed devices."
  },
  {
    "client_id": "30",
    "order_id": 6,
    "text": "I need help with SaaS subscription tiering and contract downgrades. I need to downgrade my subscription plan to the basic tier starting next billing cycle."
  },
  {
    "client_id": "31",
    "order_id": 22,
    "text": "I need help with API rate-limiting thresholds and enterprise traffic scaling. Our automated scripts are hitting a rate limit roadblock, what are the pricing tiers for higher API thresholds?"
  },
  {
    "client_id": "32",
    "order_id": 9,
    "text": "I need help with inventory fulfillment audits and missing hardware components. The item description says it comes with a power adapter, but my package only contained the core unit."
  },
  {
    "client_id": "33",
    "order_id": 15,
    "text": "I need help with database access security auditing and anomalous query detection. We noticed unauthorized database queries originating from an unknown service account linked to our profile."
  },
  {
    "client_id": "34",
    "order_id": 4,
    "text": "I need help with third-party carrier sync tracking and transit status APIs. The tracking number provided keeps displaying an invalid status on the carrier website."
  },
  {
    "client_id": "35",
    "order_id": 17,
    "text": "I need help with regional infrastructure availability and network latency diagnostics. Is there an outage affecting the US-East server cluster right now? Our latency skyrocketed ten minutes ago."
  },
  {
    "client_id": "36",
    "order_id": 13,
    "text": "I need help with Multi-Factor Authentication (MFA) lockout overrides. I accidentally locked myself out of my account after entering the wrong 2FA token multiple times."
  },
  {
    "client_id": "37",
    "order_id": 8,
    "text": "I need help with compliance documentation procurement and SOC2 IT auditing. Where can I download the current SOC2 security compliance report for our internal IT audit team?"
  },
  {
    "client_id": "38",
    "order_id": 5,
    "text": "I need help with pre-order merchant policies and credit card merchant reversals. I want to cancel my pre-order entirely and have the funds credited back to my original credit card."
  },
  {
    "client_id": "39",
    "order_id": 20,
    "text": "I need help with data ingestion validation and character encoding parsing errors. The batch CSV upload tool is silently skipping rows containing special characters without throwing any error flags."
  }
]

async def seed_db():
    async with httpx.AsyncClient(timeout=60.0) as client:
        for order in orders:
            response = await client.post("http://localhost:4012/api/v1/inquiries", json=order)
            print(f"Created {order['client_id']}: Status {response.status_code}")
            
asyncio.run(seed_db())