from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI application
app = FastAPI(title="FBSU Innovation Evaluator API")

# Bypass CORS for all origins (Perfect for GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client safely (using OpenAI library)
api_key = os.environ.get("GROQ_API_KEY")
client = None
if api_key and api_key != "your_groq_api_key_here":
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

# Define the request body structure expected from the frontend
class EvaluationRequest(BaseModel):
    idea: str
    problem: str
    beneficiary: str

@app.post("/evaluate")
async def evaluate(request: EvaluationRequest):
    if not request.idea or not request.problem or not request.beneficiary:
        raise HTTPException(status_code=400, detail="Missing required fields")

    if not client:
        raise HTTPException(status_code=500, detail="Groq API key is missing. Please add it to the backend/.env file.")

    # The AI Instructions (System Prompt)
    system_prompt = """
    You are an expert innovation evaluator for Prince Fahd Bin Sultan University in Saudi Arabia.
    Your task is to evaluate student digital twin project ideas.
    
    IMPORTANT LANGUAGE INSTRUCTIONS:
    The student's input may be in English, Modern Standard Arabic (Fusha), or Colloquial Saudi Arabic (Ammiya/Najdi/Hejazi/etc). 
    1. First, analyze the language the student used.
    2. You must fully understand and accept inputs in all these languages and dialects. 
    3. Your textual feedback (the paragraphs in the JSON) MUST be written in the exact same language the student primarily used. 
    4. Ensure that the Arabic text is well-formatted, neatly structured, and highly professional. If they use colloquial Arabic, feel free to respond in clear, professional Arabic that feels natural to a Saudi student.
    
    You must evaluate the idea based on the following 5 dimensions on a scale of 1 to 5:
    1. Innovation (How unique is it?)
    2. Feasibility (How feasible is it in Saudi Arabia, specifically Tabuk?)
    3. Human Impact (Does it address human suffering or significant challenges?)
    4. Beneficiary Value (How much does it improve the beneficiary's life?)
    5. SDG Alignment (How well does it align with Sustainable Development Goals?)
    
    Please search your knowledge base for similar digital twin projects in Saudi Arabia, identify their weaknesses, and compare.
    
    You MUST return the response strictly as a JSON object with the following schema (keep the keys in English):
    {
      "scores": {
        "innovation": number,
        "feasibility": number,
        "human_impact": number,
        "beneficiary_value": number,
        "sdg_alignment": number
      },
      "feedback": {
        "weaknesses": "A brief paragraph describing weaknesses and similar projects in KSA.",
        "human_impact_analysis": "A brief paragraph evaluating the human impact.",
        "sdg_alignment_analysis": "A brief paragraph explaining which SDGs are addressed."
      }
    }
    """

    user_prompt = f"""
    Evaluate the following student idea:
    Idea: {request.idea}
    Problem Addressed: {request.problem}
    Beneficiary: {request.beneficiary}
    """

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" },
            temperature=0.7
        )

        result_content = response.choices[0].message.content
        result_json = json.loads(result_content)
        
        from fastapi.responses import JSONResponse
      return JSONResponse(content=result_json, media_type="application/json")


    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # This runs the FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=5000)
