from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
# Load environment variables
load_dotenv()
base_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.abspath(os.path.join(base_dir, '../frontend'))
app = Flask(__name__, static_folder=frontend_dir)
CORS(app) # Enable CORS for all routes
# Initialize Groq client safely (using OpenAI library)
api_key = os.environ.get("GROQ_API_KEY")
client = None
if api_key and api_key != "your_groq_api_key_here":
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)
@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    idea = data.get('idea')
    problem = data.get('problem')
    beneficiary = data.get('beneficiary')
    if not all([idea, problem, beneficiary]):
        return jsonify({"error": "Missing required fields"}), 400
    # Construct the prompt for the model
    # We instruct the model to behave as an evaluator for Prince Fahd Bin Sultan University
    system_prompt = """
    You are an expert innovation evaluator for Prince Fahd Bin Sultan University in Saudi Arabia.
    Your task is to evaluate student digital twin project ideas.
    
    IMPORTANT LANGUAGE INSTRUCTIONS:
    The student's input may be in English, Modern Standard Arabic (Fusha), or Colloquial Saudi Arabic (Ammiya/Najdi/Hejazi/etc). You must fully understand and accept inputs in all these languages and dialects. Your textual feedback (the paragraphs in the JSON) should be written in the same language the student primarily used, incorporating a friendly and professional tone. If they use colloquial Arabic, feel free to respond in clear, understandable Arabic that feels natural to a Saudi student.
    
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
    Idea: {idea}
    Problem Addressed: {problem}
    Beneficiary: {beneficiary}
    """
    try:
        if not client:
            return jsonify({"error": "Groq API key is missing. Please add it to the backend/.env file."}), 500
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
        
        return jsonify(result_json)
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
