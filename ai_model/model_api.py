from flask import Flask, request, jsonify
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from AI_model import EgyptianLegalRAG, ViolationDetector, print_results, Law, Violation

app = Flask(__name__)

rag = EgyptianLegalRAG()
rag.initialize()

detector = ViolationDetector()

@app.route('/analyze', methods=['POST'])
def analyze_contract():
    data = request.get_json()
    if not data or 'contract' not in data:
        return jsonify({"error": "Missing 'contract' field with text"}), 400

    contract_text = data['contract']

    try:
        # Run your existing RAG analysis
        laws = rag.analyze(contract_text)

        # Run violation detection
        results = detector.analyze(contract_text, laws)

        # Format for JSON
        response = {
            "total_clauses": results['total_clauses'],
            "compliance_score": results['compliance_score'],
            "message": "Analysis success",
            "violations": [
                {
                    "clause_id": v.clause.clause_id,
                    "clause_text": v.clause.clause_text,
                    "reason": v.reason,
                    "suggestion": v.suggestion,
                    "confidence": float(v.confidence)
                } for v in results['violations']
            ]
        }
        return jsonify(response)

    except Exception as e:
        print(f"Flask Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)