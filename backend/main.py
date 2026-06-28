from fastapi import FastAPI,HTTPException,Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
from groq import AsyncGroq
from model import Reviews,Review_result,updated_review
import json
from fastapi.middleware.cors import CORSMiddleware
from uuid import UUID
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
review_list=[]
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
    review_list.append(new)

    print(result)

    return result

@app.get("/read/{id}",status_code=200)
def read_reviews(id:UUID):
    for i,review in enumerate(review_list):
        if review.id==id:
            return (review_list[i])
    raise HTTPException(
        status_code=404,detail="not found"
    )
@app.get("/read",status_code=200)
def read_reviews():
    return review_list
@app.delete("/delete/{id}",status_code=204)
def delete_review(id:UUID):
    for i,reviews in enumerate(review_list):
        if reviews.id==id:
            review_list.pop(i)
            
    raise HTTPException(
        status_code=404,detail="not found"
    )
@app.put("/update/{id}",status_code=200)
def update_list(id:UUID,updated:Review_result):
#enumerate() is a built-in Python function that lets you loop through a list while also getting the index (position) of each item.
    for i,review in enumerate(review_list):
        if review.id==id:
            review_list[i]=updated
            return updated
    raise HTTPException(
        status_code=404,detail="not found"
    )
@app.get("/search",status_code=200)
def filter_reviews(sentiment:str):
    filtered = [r for r in review_list if r.sentiment == sentiment]
    if filtered:
        return filtered
    
    raise HTTPException(
        status_code=404,detail="not found"
    )
@app.patch("/update/{id}",status_code=200)
def update(id:UUID,updated:updated_review):
    for i,r in enumerate(review_list):
        if r.id==id:
            updated_data=updated.model_dump(exclude_unset=True)
            review_data=review_list[i].model_dump()
            review_data.update(updated_data)
            review_list[i]=Review_result(**review_data)
            return  review_list[i]
            
    raise HTTPException(
        status_code=404,detail="not found"
    )
        



    




