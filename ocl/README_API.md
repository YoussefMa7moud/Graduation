# OCL Policy Converter API Server

This FastAPI server provides REST API endpoints for converting policies to OCL constraints.

## Setup

1. Make sure you have Python 3.8+ installed
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   - Create a `.env` file in the `ocl` directory
   - Add your Groq API key:
     ```
     GROQ_API_KEY=your_groq_api_key_here
     ```

## Running the Server

Start the server:
```bash
python api_server.py
```

Or using uvicorn directly:
```bash
uvicorn api_server:app --host 0.0.0.0 --port 5001 --reload
```

The server will start on `http://localhost:5001`

## API Endpoints

### POST /convert
Convert a policy text to OCL constraint code.

**Request Body:**
```json
{
  "policyName": "Return Policy",
  "legalFramework": "Egyptian Civil Code",
  "policyText": "No return after 14 days of purchase."
}
```

**Response:**
```json
{
  "explanation": "This policy maps to...",
  "oclCode": "self.days > 14",
  "articleRef": "Egyptian Civil Code - Return Policy",
  "validation": [
    {
      "label": "OCL Syntax Valid",
      "standard": "OCL 2.0 Specification"
    }
  ]
}
```

### POST /generate-file
Generate an OCL test file for a policy.

**Query Parameters:**
- `policyName`: Name of the policy
- `policyText`: Policy text
- `oclCode`: Generated OCL code
- `companyName`: Company name (optional, defaults to "Default Company")

**Response:**
```json
{
  "filePath": "path/to/generated/file.py"
}
```

## Integration with Backend

The backend Spring Boot application is configured to call this API at `http://localhost:5001` (configurable via `app.ocl.api.url` in `application.properties`).
