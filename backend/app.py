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
    system_prompt = """You are an expert innovation consultant specializing in Digital Twins.
Your task is to evaluate student ideas and provide a structured JSON response.
You MUST include these specific fields in your JSON:
1. "innovation": score 1-10
2. "feasibility": score 1-10
3. "human_impact": score 1-10
4. "beneficiary_value": score 1-10
5. "sdg_alignment": score 1-10
6. "weaknesses": A paragraph about market context and weaknesses.
7. "human_impact_analysis": A paragraph about social impact.
8. "sdg_analysis": A paragraph about SDG alignment.
9. "short_term_dev": Practical steps to develop this idea in the next 3-6 months (In Arabic).
10. "long_term_vision": How this idea can grow and sustain over the next 5 years (In Arabic).

IMPORTANT: Respond in the same language as the user. If the user writes in Arabic, all analysis and development steps must be in clear, professional Arabic."""
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
        model="llama-3.1-8b-instant",
        messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.7
        )
        result_content = response.choices[0].message.content
        result_json = json.loads(result_content)

        return jsonify(result_json)
    except Exception as e:
        print(f"Error during evaluation: {e}")
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
app.run(host='0.0.0.0', debug=True, port=5000)
