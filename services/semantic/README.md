# Sematic

## Vocaburary:

- legend — raw text from an insider describing his expertise
- soul — a legend represented as an embedding
- order — raw text from a client describing his interest
- inquiry — an order represented as an embedding
- score — similarity between an inquiry and a soul from 0 to 1
- embedding — vector, tensor; text semantically represented as an array of floats

## How it works: 

Sematic will receive a request from Interaction service, either to create a `soul` or `order`. Once received, it will create an object in it's database, and embed the raw text into `embedding`. 

If the creation is successful, it returns `200` status code. `400` otherwise.

When the service receive a new `order`, it will calculate `score` for each `soul`, then post an object that contains the top 5 `soul`s to Interaction service.

## Tranforming : 

We use `sentence_transformers` framework to transform and compare embeddings.

Sentence-transformers is a Python framework for state-of-the-art text, image, and audio embeddings. It is widely used for semantic search, retrieval-augmented generation (RAG), clustering, and paraphrase mining. 

Model used is "BAAI/bge-m3"

Once a `legend` or `order` is created, we transform it into an `embedding` and store it as JSON dump in the database using the `model.encode()` function.


Upon receiving an `inquiry`, a background task is triggered, and it compares all the `soul`s with the `inquiry`. 

Prior to the calculation, the JSON dump is cast back as Numphy array before using `util.cos_sim()` function.

Once the calculation is done, the background task creates a `POST` request to Interaction service with the top 5 `soul`s. 
```
{
  "inquiry_id": inquiry_id,
  "order_id": inquiry.order_id,
  "query_text": inquiry.inquiry_text,
  "top_5" : [    // ranking from the highest score
    			{
                    "soul_id": soul.id,
                    "uid": soul.uid,
                    "score": score_value
                },
    			{
                    "soul_id": soul.id,
                    "uid": soul.uid,
                    "score": score_value
                },
    			{
                    "soul_id": soul.id,
                    "uid": soul.uid,
                    "score": score_value
                },
    			{
                    "soul_id": soul.id,
                    "uid": soul.uid,
                    "score": score_value
                },
  				{
                    "soul_id": soul.id,
                    "uid": soul.uid,
                    "score": score_value
                }
  ]
}
```

