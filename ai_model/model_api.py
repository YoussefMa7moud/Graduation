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
            "violations": [
                {
                    "clause_id": v.clause.clause_id,
                    "clause_text": v.clause.clause_text,
                    "violated_law": {
                        "number": v.violated_law.law_number,
                        "source_file": v.violated_law.source_file,
                        "page": v.violated_law.page
                    },
                    "confidence": v.confidence,
                    "reason": v.reason,
                    "suggestion": v.suggestion
                } for v in results['violations']
            ],
            "compliance_score": results['compliance_score'],
            "message": "Analysis complete" if results['violations'] else "No violations detected"
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)