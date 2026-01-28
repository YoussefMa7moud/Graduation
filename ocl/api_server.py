"""
FastAPI server for OCL policy conversion
Provides REST API endpoints for converting policies to OCL constraints
"""

import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import subprocess
import tempfile
import re
from groq import Groq
from dotenv import load_dotenv
import logging

# Add parent directory to path to import OCL functions
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from OCL import (
    generate_ocl_with_retry,
    extract_metadata,
    extract_properties,
    extract_property_types,
    detect_policy_type,
    generate_policy_test_file,
    generate_test_scenario_from_clause,
    get_or_create_company_id,
    insert_policy,
    setup_database
)

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="OCL Policy Converter API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = None

def get_groq_client():
    global groq_client
    if groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        groq_client = Groq(api_key=api_key)
    return groq_client

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    setup_database()
    logger.info("Database initialized")

# Request/Response models
class PolicyConvertRequest(BaseModel):
    policyName: str
    legalFramework: str
    policyText: str

class ValidationResult(BaseModel):
    label: str
    standard: str

class PolicyConvertResponse(BaseModel):
    explanation: str
    oclCode: str
    articleRef: str
    validation: List[ValidationResult]
    category: str
    keywords: List[str]

class PolicyEvaluateRequest(BaseModel):
    policyName: str
    policyText: str
    oclCode: str
    companyName: str = "Default Company"
    testDescription: str
    policyId: int = 0

class PolicyEvaluateResponse(BaseModel):
    passed: bool
    rawOutput: str

@app.get("/")
def root():
    return {"message": "OCL Policy Converter API", "status": "running"}

@app.post("/convert", response_model=PolicyConvertResponse)
async def convert_policy(request: PolicyConvertRequest):
    """
    Convert a policy text to OCL constraint code
    """
    try:
        client = get_groq_client()
        
        # Generate OCL constraint
        ocl_code = generate_ocl_with_retry(request.policyText, client)
        
        if not ocl_code:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate OCL constraint after retries"
            )
        
        # Extract metadata for explanation, article reference, and DB fields
        category, keywords = extract_metadata(request.policyText, client)
        
        # Create explanation based on legal framework and policy
        explanation = f"This policy maps to {request.legalFramework}. The constraint ensures compliance with the specified legal requirements."
        article_ref = f"{request.legalFramework} - {category}"
        
        # Create validation results
        validation = [
            ValidationResult(
                label="OCL Syntax Valid",
                standard="OCL 2.0 Specification"
            ),
            ValidationResult(
                label="Legal Framework Compliance",
                standard=request.legalFramework
            )
        ]
        
        return PolicyConvertResponse(
            explanation=explanation,
            oclCode=ocl_code,
            articleRef=article_ref,
            validation=validation,
            category=category,
            keywords=keywords
        )
        
    except Exception as e:
        logger.error(f"Error converting policy: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error converting policy: {str(e)}"
        )

@app.post("/generate-file")
async def generate_file(
    policyName: str,
    policyText: str,
    oclCode: str,
    companyName: str = "Default Company",
    policyId: int = 0
):
    """
    Generate OCL test file for a policy
    Returns the file path
    """
    try:
        client = get_groq_client()
        
        # Get or create company
        company_id = get_or_create_company_id(companyName)
        if not company_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to get or create company"
            )
        
        # Extract properties and types
        properties = extract_properties(oclCode)
        prop_types = extract_property_types(oclCode, properties)
        
        # Detect policy type
        policy_type = detect_policy_type(oclCode)
        
        # Generate test file
        file_path = generate_policy_test_file(
            policy_id=policyId,
            company_name=companyName,
            policy_description=policyText,
            ocl_code=oclCode,
            client=client,
            prop_values=None,
            prop_types=prop_types
        )
        
        if not file_path:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate policy test file"
            )
        
        return {"filePath": file_path}
        
    except Exception as e:
        logger.error(f"Error generating file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating file: {str(e)}"
        )

@app.post("/evaluate-file", response_model=PolicyEvaluateResponse)
async def evaluate_file(request: PolicyEvaluateRequest):
    """
    Evaluate a policy by generating its dynamic test file and executing it with a test scenario.
    The test scenario is generated from the clause text to represent what the clause is saying.

    Returns:
      - passed: true if constraint passes (clause is compliant), false if violates
      - rawOutput: full stdout/stderr for debugging
    """
    try:
        client = get_groq_client()
        
        # Generate a test scenario from the clause text that represents what it's saying
        # This converts abstract clause text into concrete test data
        test_scenario = generate_test_scenario_from_clause(
            clause_text=request.testDescription,  # The clause text
            policy_text=request.policyText,
            ocl_code=request.oclCode,
            client=client
        )
        
        logger.info(f"Generated test scenario for policy {request.policyId}: {test_scenario}")

        # Generate a temp test file for evaluation (in a temp dir to avoid polluting repo)
        with tempfile.TemporaryDirectory(prefix="ocl_eval_") as tmpdir:
            cwd_before = os.getcwd()
            os.chdir(tmpdir)
            try:
                file_path = generate_policy_test_file(
                    policy_id=request.policyId,
                    company_name=request.companyName,
                    policy_description=request.policyText,
                    ocl_code=request.oclCode,
                    client=client,
                    prop_values=None,
                    prop_types=None
                )
                if not file_path:
                    raise HTTPException(status_code=500, detail="Failed to generate policy test file for evaluation")

                # Run script, feed the generated test scenario to stdin
                proc = subprocess.run(
                    [sys.executable, file_path],
                    input=(test_scenario.strip() + "\n"),
                    text=True,
                    capture_output=True,
                    timeout=30
                )

                output = (proc.stdout or "") + ("\n" + proc.stderr if proc.stderr else "")

                # Parse "Policy evaluation result: True/False"
                logger.info(f"OCL script output for policy {request.policyId}:\n{output}")
                m = re.search(r"Policy evaluation result:\s*(True|False)", output)
                if not m:
                    # Fall back: if script prints [FAIL] treat as violation
                    if "[FAIL]" in output:
                        logger.warning(f"Policy {request.policyId} evaluation: [FAIL] detected in output")
                        return PolicyEvaluateResponse(passed=False, rawOutput=output)
                    if "[PASS]" in output:
                        logger.info(f"Policy {request.policyId} evaluation: [PASS] detected in output")
                        return PolicyEvaluateResponse(passed=True, rawOutput=output)
                    logger.error(f"Could not parse evaluation result from script output for policy {request.policyId}")
                    raise HTTPException(status_code=500, detail="Could not parse evaluation result from script output")

                passed = m.group(1) == "True"
                logger.info(f"Policy {request.policyId} evaluation result: passed={passed} (scenario: {test_scenario})")
                return PolicyEvaluateResponse(passed=passed, rawOutput=output)
            finally:
                os.chdir(cwd_before)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Policy evaluation timed out")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating policy: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error evaluating policy: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
