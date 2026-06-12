import httpx
import asyncio

BASE_URL = "http://localhost:4013/api/v1"

orders_data = [
    {
        "client_id": "client_01",
        "title": "Looking for a growth equity partner in SE Asia",
        "text": "We are a mid-market fintech scaling into Thailand and Vietnam. Need someone who knows the regulatory landscape, has local investor relationships, and can advise on partnership strategy. Experience in digital payments preferred.",
    },
    {
        "client_id": "client_02",
        "title": "Need a mentor for first-time founder",
        "text": "Just launched my first SaaS product (B2B inventory management). Looking for an experienced founder who can help me think through go-to-market, pricing, and early hires. Weekly 1:1 calls for 3 months.",
    },
    {
        "client_id": "client_03",
        "title": "Seeking historian for family research project",
        "text": "Trying to trace my grandmother's family lineage from rural Poland pre-WWII. Have some documents and letters but need someone who can read old Polish script and navigate archives. Flexible budget.",
    },
    {
        "client_id": "client_04",
        "title": "Freelance writer for tech blog launch",
        "text": "Starting a newsletter about decentralized infrastructure. Need 4 long-form articles per month on topics like edge computing, mesh networks, and open-source governance. Strong voice and ability to explain technical concepts to a general audience required.",
    },
    {
        "client_id": "client_05",
        "title": "Statistical consultant for marathon training study",
        "text": "Conducting a small n=30 study on heart rate variability and recovery periods in amateur marathoners. Need help with study design, statistical analysis in R, and interpreting results for a paper. Previous sports science experience a plus.",
    },
]

insiders = [
    "insider_01",
    "insider_02",
    "insider_03",
    "insider_04",
    "insider_05",
    "insider_06",
    "insider_07",
    "insider_08",
    "insider_09",
    "insider_10",
]

matches_data = [
    {"order_idx": 0, "insider_id": "insider_01", "score": 0.94},
    {"order_idx": 0, "insider_id": "insider_05", "score": 0.88},
    {"order_idx": 0, "insider_id": "insider_10", "score": 0.82},
    {"order_idx": 0, "insider_id": "insider_03", "score": 0.71},
    {"order_idx": 1, "insider_id": "insider_04", "score": 0.96},
    {"order_idx": 1, "insider_id": "insider_10", "score": 0.91},
    {"order_idx": 1, "insider_id": "insider_06", "score": 0.85},
    {"order_idx": 2, "insider_id": "insider_03", "score": 0.97},
    {"order_idx": 2, "insider_id": "insider_08", "score": 0.79},
    {"order_idx": 3, "insider_id": "insider_02", "score": 0.93},
    {"order_idx": 3, "insider_id": "insider_04", "score": 0.87},
    {"order_idx": 3, "insider_id": "insider_06", "score": 0.76},
    {"order_idx": 4, "insider_id": "insider_05", "score": 0.95},
    {"order_idx": 4, "insider_id": "insider_08", "score": 0.84},
]

insights_content = [
    {"match_idx": 0, "text": "Having spent a decade building fintech in Bangkok, I can help you navigate the regulatory landscape across Thailand and Vietnam. I have strong relationships with the Bank of Thailand's fintech sandbox team and several family offices in the region. Let's start with a regulatory roadmap and partnership shortlist.", "price": 25000},
    {"match_idx": 1, "text": "I have advised three fintech companies on market entry into SE Asia. The key challenges are licensing fragmentation (each country has its own), talent acquisition, and building trust with local partners. I recommend a phased entry starting with Thailand due to its clearer regulatory framework.", "price": 30000},
    {"match_idx": 2, "text": "As a former founder who scaled a B2B SaaS from 0 to $5M ARR, I can help you avoid the pitfalls I hit. We should focus on ICP definition, pricing experiments, and a repeatable sales motion. Happy to commit to weekly calls and async support via Slack.", "price": 15000},
    {"match_idx": 3, "text": "I exited my own B2B SaaS and now advise early-stage founders. Your inventory management play is interesting but needs clearer differentiation. Let me help you refine your positioning and build a growth model. I offer a 3-month sprint at a flat rate.", "price": 20000},
    {"match_idx": 4, "text": "I have been doing genealogical research for Polish families for 15 years, including archival work in Krakow and Warsaw. I can read old Polish script (including Cyrillic-era records). Send me what you have and I can give you a timeline and budget for the full trace.", "price": 12000},
    {"match_idx": 5, "text": "My research focus is on Polish diaspora records from 1900-1945. I have access to several digitized archives not publicly available. The rural nature of your grandmother's origin makes this more complex but still doable. Expect 4-6 weeks of work.", "price": 18000},
    {"match_idx": 6, "text": "I write about decentralized infrastructure for a living. My work has appeared in Protocol and CoinDesk. I can deliver 4 long-form pieces per month with a strong narrative voice and deep technical understanding. Here are three samples for your review.", "price": 8000},
    {"match_idx": 7, "text": "As a technical writer and former network engineer, I can bridge the gap between protocol-level details and accessible prose. I am particularly interested in mesh networking and edge compute. Let me send you a pilot piece on LoRaWAN mesh topology.", "price": 10000},
    {"match_idx": 8, "text": "I am a biostatistician who has consulted on sports science studies for 8 years. For a small n=30 study, I recommend a Bayesian approach given the limited sample size. I can handle study design, R analysis, and contribute to the methods section of your paper.", "price": 22000},
    {"match_idx": 9, "text": "I worked on HRV research during my PhD and can set up your entire analysis pipeline. For n=30 with repeated measures, linear mixed models will work well. I can also advise on data collection protocols to maximize statistical power given your sample size.", "price": 18000},
]


async def seed_db():
    async with httpx.AsyncClient(timeout=60.0) as client:
        order_ids = []

        print("--- Creating orders ---")
        for order in orders_data:
            resp = await client.post(
                f"{BASE_URL}/orders/",
                json={
                    "client_id": order["client_id"],
                    "title": order["title"],
                    "text": order["text"],
                },
            )
            if resp.status_code == 200:
                created = resp.json()
                order_ids.append(created["id"])
                print(f"  Created order {created['id']}: {order['client_id']} — {order['title'][:50]}...")
            else:
                print(f"  FAILED order {order['client_id']}: {resp.status_code} {resp.text}")

        print()
        print("--- Creating matches ---")
        match_ids = []
        for m in matches_data:
            oid = order_ids[m["order_idx"]]
            resp = await client.post(
                f"{BASE_URL}/matches/",
                json=[{
                    "order_id": oid,
                    "insider_id": m["insider_id"],
                    "score": m["score"],
                }],
            )
            if resp.status_code == 204:
                print(f"  Created match: order={oid} insider={m['insider_id']} score={m['score']}")
            else:
                print(f"  FAILED match order={oid} insider={m['insider_id']}: {resp.status_code} {resp.text}")

        print()
        print("--- Fetching matches to get match IDs ---")
        unique_insiders = list(set(m["insider_id"] for m in matches_data))
        match_map = {}  # (order_id, insider_id) -> match_id
        for insider in unique_insiders:
            resp = await client.get(
                f"{BASE_URL}/matches/",
                params={"insider_id": insider, "limit": 50},
            )
            if resp.status_code == 200:
                for match in resp.json():
                    match_map[(match["order_id"], match["insider_id"])] = match["id"]
                    print(f"  Found match id={match['id']} order={match['order_id']} insider={match['insider_id']}")
        match_ids = []
        for m in matches_data:
            oid = order_ids[m["order_idx"]]
            mid = match_map.get((oid, m["insider_id"]))
            if mid:
                match_ids.append(mid)

        print()
        print("--- Creating insights ---")
        for ins in insights_content:
            if ins["match_idx"] >= len(match_ids):
                print(f"  SKIP insight match_idx={ins['match_idx']}: no match_id available")
                continue
            mid = match_ids[ins["match_idx"]]
            match_info = matches_data[ins["match_idx"]]
            resp = await client.post(
                f"{BASE_URL}/insights/",
                json={
                    "match_id": mid,
                    "insider_id": match_info["insider_id"],
                    "text": ins["text"],
                    "price": ins["price"],
                },
            )
            if resp.status_code == 200:
                insight = resp.json()
                print(f"  Created insight {insight['id']}: match={mid} price={ins['price']}")
            else:
                print(f"  FAILED insight match={mid}: {resp.status_code} {resp.text}")

        print()
        print("Done. Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed_db())
