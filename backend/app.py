import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import json

app = Flask(__name__)
CORS(app)

# إعداد العميل باستخدام مفتاح API
api_key = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    title = data.get('title')
    problem = data.get('problem')
    beneficiary = data.get('beneficiary')

    system_prompt = (
        "أنت مستشار ابتكار خبير في جامعة الأمير فهد بن سلطان. "
        "مهمتك تقييم أفكار المشاريع وتطويرها. "
        "يجب أن يكون الرد بصيغة JSON حصراً ويحتوي على الحقول التالية باللغة العربية: "
        "Innovation (درجة من 10), Feasibility (درجة من 10), "
        "Market Potential (درجة من 10), Impact (درجة من 10), "
        "improvement_tips (نصائح تطويرية عملية), "
        "tech_stack (الأدوات واللغات البرمجية المقترحة), "
        "future_vision (كيف تتوسع الفكرة مستقبلاً)."
    )

    user_prompt = f"اسم الفكرة: {title}\nالمشكلة: {problem}\nالمستفيد: {beneficiary}"

    try:
        if not client:
            return jsonify({"error": "Groq API key is missing."}), 500

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
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
