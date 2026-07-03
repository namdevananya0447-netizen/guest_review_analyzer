from fastapi import FastAPI,HTTPException,Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
from groq import AsyncGroq
from model import Reviews,Review_result,updated_review
import json
from fastapi.middleware.cors import CORSMiddleware
from uuid import UUID
from supabase import create_client
load_dotenv()
client=AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
app=FastAPI()
app.add_middleware(
    CORSMiddleware,allow_origins=["http://localhost:5173"],
    allow_credentials=True,allow_methods=["*"],allow_headers=["*"]
)
@app.exception_handler(Exception)
async def global_exception_handlers(request:Request,exc:Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message":"internal server error",
            "error":str(exc)
        }
    )
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

@app.post("/classify",status_code=201)
async def classify_reviews(review:Reviews):
    
    system_prompt = """You are an expert hospitality analytics assistant. Analyze the provided guest reviews.
    Return a JSON object with a "review" array. Each object in the array must have:
    - "sentiment" (Positive/Neutral/Negative)
    - "theme" (Food/Host/Location/Cleanliness/Value/Experience)
    - "suggested_response" (One-line management reply)
    Do not return any text other than the raw JSON."""
    response = await client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    #From the object named review, get the value stored in its review attribute.
    messages=[{"role":"system","content":system_prompt},{"role":"user","content":review.review}],
    response_format={"type": "json_object"}
    )
    result = json.loads(response.choices[0].message.content)
    new=Review_result(review_text=review.review,
                       sentiment=result["review"][0]["sentiment"],
                       theme=result["review"][0]["theme"],
                       suggested_response=result["review"][0]["suggested_response"],

    )
    supabase.table("review_analyzer").insert(new.model_dump(mode="json")).execute()

    print(result)

    return new

@app.get("/read/{id}",status_code=200)
def read_reviews_id(id:UUID):
    response = supabase.table("review_analyzer").select("*").eq("id", str(id)).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data
@app.get("/read",status_code=200)
def read_reviews():
    response=supabase.table("review_analyzer").select("*").execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data

@app.delete("/delete/{id}",status_code=204)
def delete_review(id:UUID):
    response=supabase.table("review_analyzer").delete().eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return None
    
@app.put("/update/{id}",status_code=200)
def update_review(id:UUID,updated: Review_result):
    response=supabase.table("review_analyzer").update(updated.model_dump(mode="json")).eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data
@app.get("/search",status_code=200)
def filter_reviews(sentiment:str):
    response=supabase.table("review_analyzer").select("*").eq("sentiment", sentiment).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data
    
@app.patch("/update/{id}",status_code=200)
def update(id:UUID,updated: updated_review):
    response = supabase.table("review_analyzer").update(updated.model_dump(mode="json",exclude_unset=True)).eq("id", str(id)).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data
        



    




