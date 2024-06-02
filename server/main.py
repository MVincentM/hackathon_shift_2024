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
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel, TextGenerationModel
import pandas as pd
from google.cloud import aiplatform_v1

PROMPT_GENERATION_DESCRIPTION = '''
Tu es un chercheur de têtes.
A partir du nom d'un métier, tu es capable d'en déterminer tous les synonymes qui correspondent à ce métier et tout ce qui est pertinent pour trouver le candidat idéal.

GUIDELINES:
La réponse doit etre un objet JSON contenant toutes les informations
La réponse doit contenir un attribut nommé 'search_base' avec maximum 10 des résultats: les plus cohérent pour faire une recherche
Les résultats doivent etre contenus dans un tableau JSON
Les résultats doivent etre le plus succinct possible
Les résultats ne doivent pas contenir de soft skills
Les résultats ne doivent pas etre des phrases mais des mots clés

JSON Format Réponse Object:
- jobTitle: string // Job TItle from the input
- synonyms: string[]
- hardSkills: string[]
- programmingLanguage: string[]
- frameworks: string[] // frameworks and tools
- search_base: string[] // array of the 10 most relevants string from all the other arrays if this object to use
'''

app = Flask(__name__)

API_ENDPOINT = "1517343178.europe-west1-145034832321.vdb.vertexai.goog"
INDEX_ENDPOINT = "projects/145034832321/locations/europe-west1/indexEndpoints/4951646217642704896"
DEPLOYED_INDEX_ID = "jobijobai_vector_index_1717275097441"
PROJECT_ID = "shift-aihack-nantes24-10"
REGION = "europe-west1"
TEXT_MODEL = "gemini-pro"
#TEXT_MODEL = "gemini-1.5-flash-001"

client_options = { "api_endpoint": API_ENDPOINT }

def get_neighbors(title, n = 10):
    vector_search_client = aiplatform_v1.MatchServiceClient(client_options = client_options)

    storage_client = storage.Client.create_anonymous_client()
    bucket = storage_client.bucket("jobijobai_index_data_bucket")
    blob = bucket.blob("vectors.json")
    with blob.open("r") as f:
        vectors = [json.loads(line) for line in f]
    v = pd.DataFrame(vectors)
    v.index = v.id
    v.drop("id", axis = 1, inplace = True)

    job_vec = job_to_vec(title)
    datapoint = aiplatform_v1.IndexDatapoint(feature_vector = job_vec[1])
    query = aiplatform_v1.FindNeighborsRequest.Query(datapoint = datapoint, neighbor_count = 10)
    request = aiplatform_v1.FindNeighborsRequest(
        index_endpoint = INDEX_ENDPOINT,
        deployed_index_id = DEPLOYED_INDEX_ID,
        queries = [query],
        return_full_datapoint = False
    )
    response = vector_search_client.find_neighbors(request)
    d = v.loc[[n.datapoint.datapoint_id for n in response.nearest_neighbors[0].neighbors]]
    d["score"] = [n.distance for n in response.nearest_neighbors[0].neighbors]
    q = d.sort_values("score", ascending = False)
    return job_vec[0], q[q.score > 0.85]
    

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
    print(d)
    return d.sort_values("score", ascending = False).to_dict(index="id")

def job_to_vec(title):
    """Embeds texts with a pre-trained, foundational model."""
    desc = execute_prompt(PROMPT_GENERATION_DESCRIPTION, title)
    print(title, ":", desc)
    model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")
    inputs = [TextEmbeddingInput(title, "RETRIEVAL_QUERY")]
    kwargs = {}
    embeddings = model.get_embeddings(inputs, **kwargs)
    return desc, [embedding.values for embedding in embeddings][0]

def execute_prompt(prompt, input):
    vertexai.init(project=PROJECT_ID, location=REGION)
    model = GenerativeModel(
    TEXT_MODEL,
    generation_config=GenerationConfig(temperature=0.2),
    tools=[],
    system_instruction=prompt
    )
    gen_response = model.generate_content(input)
    
    return gen_response.text.replace("```json", "").replace("```", "")

def format_row(row, original_job_title):
    prompt = """
You are an expert in HR. From a set of verbose skills that describe a job role, write a JSON object (NO MARKDOWN) that contains relevant keywords for a LinkedIn Boolean search in the form of key-array pairs (ex of keys: "programming_languages", "frameworks", "technologies", "degrees", "certifications", "skills", etc. depending on the job)

    Example with a Data Scientist:
    {
        "search_base": ["python", "data science", "machine learning", "master"],
        "synonyms": ["Ingénieur statisticien", "ML Engineer", "Data Analyst", ...]
        "programming_languages": ["python", "java", "javascript"],
        "frameworks": ["django", "flask", "spring"],
        "technologies": ["aws", "azure", "gcp"],
        "degrees": ["license", "master"],
        "certifications": ["certification AWS", "certification Azure", "certification GCP"],
        "skills": ["data science", "machine learning", "deep learning"]
    }

    Notes:
      - All items are Boolean search terms and MUST be very short and concise and in the same language as the verbose skills (eg. 1-2 word max.).
      - Arrays cannot contains more than 12 elements. DO NOT UNDER ANY CIRCUMSTANCES include languages (eg. "french", "english", etc.)
      - Degrees must correspond to a degree name (eg. "master", "licence", etc.)
      - Synonyms are common alternative names for the job title that will provide qualified candidates for the original job title (use French and English).
      - Technologies must correspond to a technology name (eg. "aws", "azure", "gcp", "android", etc.)
      - Certifications must correspond to a certification name (eg. "certification AWS", "certification Azure", etc.)
      - The example given above is a short, simplified version of what you can do, don't hesitate to extract more keywords from the skills description.


"search_base" should contain values coming from the other properties. Take at least 2 from synonyms and at most 10 terms in total.

      
"""
    input = """
    Job title: %s
    Skills: %s """ % (original_job_title, row["skills"][:1000], )

    response = execute_prompt(prompt, input)
    print(response)
    j = {}
    try:
      j = json.loads(response)
      j["job_title_esco"] = row["jobTitle"]
      j["job_title"] = original_job_title
    except Exception as e:
      print("error: ", response, e)
    return j

@app.route("/", methods=['POST'])
def get_filters():
    vertexai.init(project=PROJECT_ID, location=REGION)
    title = request.get_json()

    # generated_description = execute_prompt(PROMPT_GENERATION_DESCRIPTION, text)
    desc, jobs = get_neighbors(title)
    if len(jobs) < 1:
      j = {
          "jobTitle": None,
          "skills": desc
      }
    else:
      j = jobs.iloc[0]
    final_result = format_row(j, title)
    return final_result


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))