from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app import crud, schemas

from sentence_transformers import SentenceTransformer, util

router = APIRouter()


@router.post("/")
async def get_score():
    # Load any of the free models mentioned above
    model = SentenceTransformer("BAAI/bge-m3")

    # request = """
    # When do taxi drivers end their shifts in Bangkok?
    # """

    request = """
    Hello, I am going to move to Bangkok to live couple of years. So I need to know local secrets like: how to buy groceries, how to make local sim card and etc"
    """

    # request = """
    # How does aviation work in Saint-Petersburg in Russia"
    # """

    # legend = """
    # I have lived and worked in the heart of Bangkok my entire life, and I know this city's streets better than anyone. For the last eight years, my main job has been working as a taxi driver. I work 10-hour shifts, navigating the crazy traffic, dodging motorbikes, and finding shortcuts through the narrow sois (alleys) that GPS apps don't even know exist.
    # Because of my job, I have to be an expert on the city's public transport system. I constantly track the schedules and breakdowns of the BTS Skytrain, the MRT subway, and the local bus routes so I know exactly where the crowds will be and when a station might be flooded with commuters needing a ride. I even take the river ferries on my days off to beat the gridlock.
    # Driving all day means I talk to hundreds of locals and discover the city's best authentic places. I know exactly which hidden neighborhood stalls serve the best authentic boat noodles, which night markets haven't been ruined by tourist traps, and the quiet community temples that guidebooks ignore.
    # When I am not driving, I help my family run a small, independent groceries store out of our townhouse. I handle the inventory, deal with local wholesale suppliers, and do the early morning runs to Khlong Toei fresh market to stock up on produce before my driving shift begins. It gives me a really clear view of local food prices and neighborhood economics.
    # To unwind from the noise and stress of the city, my biggest passion is music. I have been playing the acoustic guitar since I was a teenager. I am mostly self-taught, playing a mix of 90s rock and traditional Thai folk music, and I usually spend my Sunday evenings just sitting on my porch playing for my neighbors.
    # """

    legend = """
    Local expat living in Bangkok. I work as a tour guide. I know all tourist hot spots in a city as well as hidden gems.
    """

    # Generate the vector for your "Inquiry" node
    query_vector = model.encode(request)

    # Generate the vector for your "Soul" node
    soul_vector = model.encode(legend)

    similarity_score = util.cos_sim(query_vector, soul_vector)

    print(f"Similarity Score: {similarity_score.item():.4f}")

    return {"Score": f"{similarity_score.item():.4f}"}
