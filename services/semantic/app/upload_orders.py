import httpx
import asyncio

orders = [
  {
    "client_id": "20",
    "title": "Billing reconciliation and duplicate transaction processing",
    "text": "I need help with billing reconciliation and duplicate transaction processing. My payment went through twice for the same transaction, please issue a refund for the duplicate charge."
  },
  {
    "client_id": "21",
    "title": "REST API authentication protocols and endpoint validation",
    "text": "I need help with REST API authentication protocols and endpoint validation. The API documentation seems to have an error in the authentication endpoint example, getting a 401 consistently."
  },
  {
    "client_id": "22",
    "title": "Logistics modification and pending shipment routing",
    "text": "I need help with logistics modification and pending shipment routing. I need to update the shipping address on my pending order before it leaves the warehouse."
  },
  {
    "client_id": "23",
    "title": "Application error diagnostics and server-side stack traces",
    "text": "I need help with application error diagnostics and server-side stack traces. The dashboard keeps throwing a 500 internal server error whenever I try to export my monthly analytics report."
  },
  {
    "client_id": "24",
    "title": "Subscription lifecycle management and account tier extensions",
    "text": "I need help with subscription lifecycle management and account tier extensions. Can I get an extension on my trial period? Our team needs another week to fully evaluate the software integration."
  },
  {
    "client_id": "25",
    "title": "Network firewall configurations and webhook ingress rules",
    "text": "I need help with network firewall configurations and webhook ingress rules. Our corporate network is blocking your webhooks; can you provide a static list of IP addresses for whitelisting?"
  },
  {
    "client_id": "26",
    "title": "Hardware damage claims and transit quality assurance",
    "text": "I need help with hardware damage claims and transit quality assurance. The package arrived today but two of the main components are completely shattered in the box."
  },
  {
    "client_id": "27",
    "title": "Identity and Access Management (IAM) token expiration policies",
    "text": "I need help with Identity and Access Management (IAM) token expiration policies. I am unable to reset my password because the verification email link expires immediately upon clicking it."
  },
  {
    "client_id": "28",
    "title": "Corporate tax documentation and international VAT compliance",
    "text": "I need help with corporate tax documentation and international VAT compliance. Requesting a formal corporate invoice with our specific VAT number added for tax compliance purposes."
  },
  {
    "client_id": "29",
    "title": "Hardware firmware regression and peripheral connectivity protocols",
    "text": "I need help with hardware firmware regression and peripheral connectivity protocols. The latest firmware update broke the bluetooth syncing feature on all our deployed devices."
  },
  {
    "client_id": "30",
    "title": "SaaS subscription tiering and contract downgrades",
    "text": "I need help with SaaS subscription tiering and contract downgrades. I need to downgrade my subscription plan to the basic tier starting next billing cycle."
  },
  {
    "client_id": "31",
    "title": "API rate-limiting thresholds and enterprise traffic scaling",
    "text": "I need help with API rate-limiting thresholds and enterprise traffic scaling. Our automated scripts are hitting a rate limit roadblock, what are the pricing tiers for higher API thresholds?"
  },
  {
    "client_id": "32",
    "title": "Inventory fulfillment audits and missing hardware components",
    "text": "I need help with inventory fulfillment audits and missing hardware components. The item description says it comes with a power adapter, but my package only contained the core unit."
  },
  {
    "client_id": "33",
    "title": "Database access security auditing and anomalous query detection",
    "text": "I need help with database access security auditing and anomalous query detection. We noticed unauthorized database queries originating from an unknown service account linked to our profile."
  },
  {
    "client_id": "34",
    "title": "Third-party carrier sync tracking and transit status APIs",
    "text": "I need help with third-party carrier sync tracking and transit status APIs. The tracking number provided keeps displaying an invalid status on the carrier website."
  },
  {
    "client_id": "35",
    "title": "Regional infrastructure availability and network latency diagnostics",
    "text": "I need help with regional infrastructure availability and network latency diagnostics. Is there an outage affecting the US-East server cluster right now? Our latency skyrocketed ten minutes ago."
  },
  {
    "client_id": "36",
    "title": "Multi-Factor Authentication (MFA) lockout overrides",
    "text": "I need help with Multi-Factor Authentication (MFA) lockout overrides. I accidentally locked myself out of my account after entering the wrong 2FA token multiple times."
  },
  {
    "client_id": "37",
    "title": "Compliance documentation procurement and SOC2 IT auditing",
    "text": "I need help with compliance documentation procurement and SOC2 IT auditing. Where can I download the current SOC2 security compliance report for our internal IT audit team?"
  },
  {
    "client_id": "38",
    "title": "Pre-order merchant policies and credit card merchant reversals",
    "text": "I want to cancel my pre-order entirely and have the funds credited back to my original credit card."
  },
  {
    "client_id": "39",
    "title": "Data ingestion validation and character encoding parsing errors",
    "text": "I need help with data ingestion validation and character encoding parsing errors. The batch CSV upload tool is silently skipping rows containing special characters without throwing any error flags."
  }
]

async def seed_db():
    async with httpx.AsyncClient(timeout=60.0) as client:
        for order in orders:
            response = await client.post("http://localhost:4013/api/v1/orders", json=order)
            print(f"Created {order['client_id']}: Status {response.status_code}")
            
asyncio.run(seed_db())