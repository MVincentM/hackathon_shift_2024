# app.py

import os
import json
from google.cloud import storage
from google.auth import compute_engine
from flask import Flask, request
import sys
import vertexai
import requests
from vertexai.generative_models import (
    Content,
    FunctionDeclaration,
    GenerationConfig,
    GenerativeModel,
    Part,
    Tool,
)
from typing import List, Optional
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel
import pandas as pd
from google.cloud import aiplatform_v1

app = Flask(__name__)

API_ENDPOINT = "1517343178.europe-west1-145034832321.vdb.vertexai.goog"
INDEX_ENDPOINT = "projects/145034832321/locations/europe-west1/indexEndpoints/4951646217642704896"
DEPLOYED_INDEX_ID = "jobijobai_vector_index_1717275097441"

client_options = { "api_endpoint": API_ENDPOINT }

def get_neighbors(title, n = 10):
    vector_search_client = aiplatform_v1.MatchServiceClient(client_options = client_options)
    datapoint = aiplatform_v1.IndexDatapoint(feature_vector = job_to_vec(title))
    query = aiplatform_v1.FindNeighborsRequest.Query(datapoint = datapoint, neighbor_count = n)
    request = aiplatform_v1.FindNeighborsRequest(
    index_endpoint = INDEX_ENDPOINT,
    deployed_index_id = DEPLOYED_INDEX_ID,
    queries = [query],
    return_full_datapoint = False
    )
    response = vector_search_client.find_neighbors(request)
    d = v.loc[[n.datapoint.datapoint_id for n in response.nearest_neighbors[0].neighbors]]
    d["score"] = [n.distance for n in response.nearest_neighbors[0].neighbors]
    return d.sort_values("score", ascending = False)

@app.route("/", methods=['POST'])
def get_filters():
    text = request.get_json()
    storage_client = storage.Client.create_anonymous_client()

    return get_neighbors(text)

    bucket = storage_client.bucket("jobijobai_index_data_bucket")
    blob = bucket.blob("vectors.json")
    with blob.open("r") as f:
        vectors = [json.loads(line) for line in f]
    v = pd.DataFrame(vectors)
    v.index = v.id
    v.drop("id", axis = 1, inplace = True)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))