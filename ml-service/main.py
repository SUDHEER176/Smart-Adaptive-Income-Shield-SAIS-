from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import time

app = FastAPI()

class Claim(BaseModel):
    worker_id: str
    amount: float
    trigger_type: str
    timestamp: str

@app.get("/")
def read_root():
    return {"message": "SAIS ML Service Running"}

@app.post("/score")
def score_claim(claim: Claim):
    # Simulate some ML processing time
    time.sleep(0.5)
    
    # Simple rule-based "ML" for now
    # High amount + certain weather types might have higher suspect score
    fraud_score = random.uniform(0.01, 0.45)
    
    if claim.amount > 1000:
        fraud_score += random.uniform(0.2, 0.4)
        
    return {
        "worker_id": claim.worker_id,
        "fraud_score": min(0.99, fraud_score),
        "risk_level": "High" if fraud_score > 0.7 else "Medium" if fraud_score > 0.4 else "Low",
        "timestamp": time.time()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
