import os
import warnings
import sqlite3
import re
import json
import logging
from typing import Dict, Set, Optional, Tuple, List
import spacy
from groq import Groq
from dotenv import load_dotenv
from datetime import date, datetime

from besser.BUML.metamodel.structural import (
    Property, Class, Constraint, DomainModel,
    DateType, IntegerType, StringType
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper

# === Setup ===
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Cache spacy model to avoid reloading
_nlp_cache = None

def get_nlp_model():
    """Get or load spacy model (cached)."""
    global _nlp_cache
    if _nlp_cache is None:
        logger.info("Loading spacy model...")
        _nlp_cache = spacy.load("en_core_web_sm")
    return _nlp_cache

nlp = get_nlp_model()

DB_file = "policy.db"

# Thread-local storage for database connections
import threading
_thread_local = threading.local()

def get_db_connection() -> Tuple[sqlite3.Connection, sqlite3.Cursor]:
    """
    Get a thread-local database connection.
    
    Returns:
        Tuple of (connection, cursor)
    """
    if not hasattr(_thread_local, 'conn') or _thread_local.conn is None:
        try:
            _thread_local.conn = sqlite3.connect(DB_file, check_same_thread=False)
            _thread_local.conn.row_factory = sqlite3.Row  # Enable column access by name
            _thread_local.cursor = _thread_local.conn.cursor()
            logger.debug("Database connection created")
        except sqlite3.Error as e:
            logger.error(f"Error creating database connection: {e}")
            raise
    return _thread_local.conn, _thread_local.cursor

def close_db_connection() -> None:
    """Close the thread-local database connection."""
    if hasattr(_thread_local, 'conn') and _thread_local.conn is not None:
        try:
            _thread_local.conn.close()
            _thread_local.conn = None
            _thread_local.cursor = None
            logger.debug("Database connection closed")
        except sqlite3.Error as e:
            logger.error(f"Error closing database connection: {e}")

# === Template for Generated Policy Test File ===
TEMPLATE = """from besser.BUML.metamodel.structural import (
    Class, Property, Constraint, DateType, IntegerType, StringType, DomainModel
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper
from datetime import date
import re


# --- Policy Info ---
# Policy ID: {policy_id}
# Description: {policy_description}

# --- Context Class ---
{context_class_def}

# --- Add dynamic properties ---
{context_properties_def}

# --- Constraint from policy ---
POLICY_CONSTRAINT = Constraint(
    name="policyConstraint",
    context={context_var},
    expression='{ocl_expression}',
    language="OCL"
)


domain_model = DomainModel(
    name="PolicyModel",
    types={context_var_set},
    constraints={constraint_set},
    associations=set(),
    generalizations=set()
)

# --- Object creation with user input ---
{property_assignments}

# --- Evaluate Policy Constraint ---
print(f"\\nTesting Policy #{policy_id}: '{policy_description}'")

EVAL_MODE = "{eval_mode}"  # "OCL" or "PYTHON_STRING"

if EVAL_MODE == "OCL":
    ocl_wrapper = OCLWrapper(domain_model, context_om)
    result = ocl_wrapper.evaluate(POLICY_CONSTRAINT)

else:
    # Python-based evaluation for string policies (engine limitation)
    # Expect expression like: self.country = "egypt"
    expr = "{raw_ocl_expr}".strip()

    # Convert self.<prop> to dynamic_obj.<prop>
    expr_py = expr.replace("self.", "dynamic_obj.")

    # Make string comparison case-insensitive (normalize both sides)
    # If left side is something like dynamic_obj.country, normalize it
    # We'll just lower the attribute value in the object assignment part.
    expr_py = re.sub(r"(?<![<>=!])=(?![=])", "==", expr_py)
    # ✅ Case-insensitive string comparison:
    # convert "dynamic_obj.x == "value"" into "str(dynamic_obj.x).lower() == "value".lower()"
    m = re.match(r'^(dynamic_obj\.\w+)\s*==\s*"([^"]+)"$', expr_py.strip())
    if m:
       left = m.group(1)
       right = m.group(2)
       expr_py = f'str({left}).lower() == "{right}".lower()'

    try:
        result = eval(expr_py)
    except Exception as e:
        print("Python evaluation error:", e)
        result = False

print("Policy evaluation result:", result)
if result:
    print("[PASS] Constraint PASSED (entered data meets policy)")
else:
    print("[FAIL] Constraint FAILED (entered data violates policy)")

"""

# === Named Entity Recognition Extraction ===
def extract_entities_from_description(description):
    """
    Use NER + regex to extract structured data (salary, dates, quantities, names)
    from a free-text description.
    """
    doc = nlp(description)
    data = {}

    # Extract PERSON
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            data["name"] = ent.text

    # Extract DATES
    for ent in doc.ents:
        if ent.label_ == "DATE":
            data["date"] = ent.text

    # Extract MONEY
    for ent in doc.ents:
        if ent.label_ == "MONEY":
            data["salary"] = re.sub(r"[^\d]", "", ent.text)

    # Regex fallback for salary or numbers like "3000 per month"
    salary_match = re.search(r'(\d{3,6})\s*(per\s*month|monthly|salary)?', description, re.IGNORECASE)
    if salary_match and "salary" not in data:
        data["salary"] = salary_match.group(1)

    # Regex for date formats like 2-2-2022
    date_match = re.search(r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', description)
    if date_match:
        data["start_date"] = date_match.group(1)

    # Regex for job roles (developer, manager, etc.)
    job_match = re.search(r'\b(developer|manager|engineer|tester|analyst|designer)\b', description, re.IGNORECASE)
    if job_match:
        data["role"] = job_match.group(1)

    return data

# === Metadata Extraction ===
def extract_metadata(policy_text: str, client: Groq) -> Tuple[str, List[str]]:
    """
    Extract metadata (category and keywords) from policy text using LLM.
    
    Args:
        policy_text: The policy description text
        client: Groq client instance
        
    Returns:
        Tuple of (category, keywords_list)
    """
    prompt = f"""
    You are a precise JSON extractor.
    From this policy, output ONLY a valid JSON object with two fields:
    "category" and "keywords".

    Example:
    {{
        "category": "Return Policy",
        "keywords": ["return", "date", "10 days"]
    }}

    Policy: "{policy_text}"
    """
    try:
        metadata_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )

        metadata_text = metadata_response.choices[0].message.content.strip()
        json_match = re.search(r'\{.*\}', metadata_text, re.DOTALL)
        if json_match:
            metadata_text = json_match.group(0)
        else:
            raise ValueError("No JSON object found")

        metadata = json.loads(metadata_text)
        category = metadata.get("category", "Uncategorized")
        keywords = metadata.get("keywords", [])
        return category, keywords

    except Exception as e:
        print(f"⚠️ Could not parse metadata: {e}")
        print("🧠 Using fallback metadata...")
        return "Uncategorized", []

# === Helper: Suggest Test Data (LLM-based) ===
def suggest_test_values(policy_text: str, client: Groq) -> Dict[str, str]:
    """
    Use LLM to suggest example test values from the policy.
    
    Args:
        policy_text: The policy description text
        client: Groq client instance
        
    Returns:
        Dictionary of suggested property values
    """
    prompt = f"""
    Extract possible property values mentioned in this policy as a JSON object.
    Example:
    {{
        "returnDate": "2025-01-10",
        "issueDate": "2025-01-01",
        "days": "10"
    }}
    Policy: "{policy_text}"
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        text = response.choices[0].message.content.strip()
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        return {}
    except Exception:
        return {}

# === Database Setup ===
def setup_database() -> None:
    """
    Initialize database schema with tables and indexes.
    """
    try:
        conn, cursor = get_db_connection()
        cursor.execute("PRAGMA foreign_keys = ON;")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS companies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS policies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_id INTEGER NOT NULL,
                policy_description TEXT NOT NULL,
                ocl_code TEXT NOT NULL,
                category TEXT DEFAULT 'Uncategorized',
                keywords TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies (id)
            );
        """)
        # Add indexes for better query performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_policies_company_id 
            ON policies(company_id);
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_policies_category 
            ON policies(category);
        """)
        conn.commit()
        logger.info("Database setup completed successfully")
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
        print(f"\n ERROR setting up database: {e}")

def get_or_create_company_id(company_name: str) -> Optional[int]:
    """
    Get existing company ID or create new company.
    
    Args:
        company_name: Name of the company
        
    Returns:
        Company ID, or None if error occurred
    """
    try:
        conn, cursor = get_db_connection()
        cursor.execute("SELECT id FROM companies WHERE name = ?", (company_name,))
        company_row = cursor.fetchone()
        if company_row:
            logger.debug(f"Found existing company: {company_name} (ID: {company_row[0]})")
            return company_row[0]
        else:
            cursor.execute("INSERT INTO companies (name) VALUES (?)", (company_name,))
            conn.commit()
            company_id = cursor.lastrowid
            print(f"✅ New company '{company_name}' added to database.")
            logger.info(f"Created new company: {company_name} (ID: {company_id})")
            return company_id
    except Exception as e:
        logger.error(f"Error finding or creating company: {e}")
        print(f"\n ERROR finding or creating company: {e}")
        return None

def insert_policy(
    company_id: int, 
    policy_description: str, 
    ocl_code: str, 
    category: str, 
    keywords: List[str]
) -> Optional[int]:
    """
    Insert a new policy into the database.
    
    Args:
        company_id: ID of the company
        policy_description: Policy description text
        ocl_code: Generated OCL constraint code
        category: Policy category
        keywords: List of keywords
        
    Returns:
        Policy ID if successful, None otherwise
    """
    try:
        conn, cursor = get_db_connection()
        keywords_str = ", ".join(keywords) if keywords else ""
        cursor.execute(
            "INSERT INTO policies (company_id, policy_description, ocl_code, category, keywords) VALUES (?, ?, ?, ?, ?)",
            (company_id, policy_description, ocl_code.strip(), category, keywords_str)
        )
        conn.commit()
        policy_id = cursor.lastrowid
        print("✅ Policy inserted successfully with metadata.")
        logger.info(f"Policy inserted (ID: {policy_id}, Category: {category})")
        return policy_id
    except Exception as e:
        logger.error(f"Error saving policy to database: {e}")
        print(f"\n ERROR saving policy to database: {e}")
        return None

def generate_ocl_constraint(user_policy, client):
    """
    Generate an OCL constraint with case-insensitive string comparison
    and flexible contains() logic for location, nationality, company location
    and other string-based conditions.
    """

    prompt = f"""
You are an expert OCL generator. Convert the following policy into a valid OCL constraint expression.

POLICY:
"{user_policy}"
EXAMPLES:

Policy: "employee must be older than 18"
OCL: self.age > 18

Policy: "employee must be from egypt"
OCL: self.country = "egypt"

Policy: "salary must be at least 3000"
OCL: self.salary >= 3000

Policy: "money should be paid 2 times"
OCL: self.money = 2

Policy: "employee age must be 25"
OCL: self.age = 25


RULES:

1. Always use self.<property> (e.g., self.country, self.salary)

2. STRING POLICIES:
   2. STRING POLICIES:
   - DO NOT use toLower() or includes().
   - Use direct equality only.
   - Always wrap string values in DOUBLE quotes.

   Examples:
   self.country = "egypt"
   self.nationality = "egypt"
   self.city = "cairo"


3. NUMERIC POLICIES:
   - "equals X" or "is X" or "= X"  →  self.<prop> = X
   - "more than X" or "greater than X"  →  self.<prop> > X
   - "less than X"  →  self.<prop> < X
   - "at least X" or "greater than or equal to X"  →  self.<prop> >= X
   - "at most X" or "less than or equal to X"  →  self.<prop> <= X
   - For percentages: "50%" → 50, "100%" → 100 (convert to integer by multiplying by 100)
   - For decimal numbers between 0 and 1: convert to integer (0.5 → 50, 0.75 → 75)
   - Always use integers in OCL constraints, avoid decimal numbers

4. DATE POLICIES:
   - Convert comparisons with dates normally:
     self.<prop> < date(2024,1,1)

5. IMPORTANT: 
   - Use = for equality (not ==)
   - Numeric literals should be written as numbers: 0, 1, 0.5, 10.5
   - Do NOT include "context" or "inv:" - return ONLY the expression part
   - Example: "self.age > 10" or "self.score = 0.5"

6. Return ONLY the OCL constraint expression. No explanation, no context, no inv: prefix.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        ocl_code = response.choices[0].message.content.strip()
        
        # Clean up the OCL code - remove any "context" or "inv:" prefixes if present
        ocl_code = re.sub(r'^context\s+\w+\s+inv\s*:\s*', '', ocl_code, flags=re.IGNORECASE)
        ocl_code = ocl_code.strip()
        
        # Remove any code block markers if present
        ocl_code = re.sub(r'^```(?:ocl)?\s*\n?', '', ocl_code, flags=re.IGNORECASE)
        ocl_code = re.sub(r'\n?```\s*$', '', ocl_code, flags=re.IGNORECASE)
        ocl_code = ocl_code.strip()
        
        # Ensure proper spacing around operators for better parsing
        # Add spaces around =, >, <, >=, <= if not present (handle self.property format)
        ocl_code = re.sub(r'(self\.\w+)([=<>!]+)(\d+\.?\d*)', r'\1 \2 \3', ocl_code)
        ocl_code = re.sub(r'(\d+\.?\d*)([=<>!]+)(self\.\w+)', r'\1 \2 \3', ocl_code)
        # Also handle cases without self.
        ocl_code = re.sub(r'(\w+)([=<>!]+)(\d+\.?\d*)', r'\1 \2 \3', ocl_code)
        ocl_code = re.sub(r'(\d+\.?\d*)([=<>!]+)(\w+)', r'\1 \2 \3', ocl_code)
        # Fix any double spaces
        ocl_code = re.sub(r'\s+', ' ', ocl_code)
        ocl_code = ocl_code.strip()
        
        return ocl_code

    except Exception as e:
        logger.error(f"OCL generation failed: {e}")
        print(f"⚠️ OCL generation failed: {e}")
        return ""

def basic_ocl_sanity_check(ocl_expr: str):
    errors = []
    ocl_expr = ocl_expr.strip()

    if not ocl_expr:
        errors.append("Empty OCL expression.")

    # لازم يبدأ self.
    if not ocl_expr.startswith("self."):
        errors.append("OCL must start with self.<property>")

    # ممنوع inv/context
    if "context" in ocl_expr.lower() or "inv:" in ocl_expr.lower():
        errors.append("OCL must NOT contain context/inv:")

    # parentheses balance
    stack = 0
    for ch in ocl_expr:
        if ch == "(":
            stack += 1
        elif ch == ")":
            stack -= 1
        if stack < 0:
            errors.append("Unbalanced parentheses")
            break

    if stack != 0:
        errors.append("Unbalanced parentheses")

    return errors
def normalize_ocl_for_python(ocl_expr: str) -> str:
    """
    Make OCL string expressions python-friendly:
    - remove .toLower()
    - convert single quotes to double quotes
    
    Args:
        ocl_expr: OCL expression to normalize
        
    Returns:
        Normalized OCL expression
    """
    ocl_expr = ocl_expr.strip()
    ocl_expr = ocl_expr.replace(".toLower()", "")
    ocl_expr = re.sub(r"=\s*'([^']*)'", r'= "\1"', ocl_expr)
    return ocl_expr

def generate_ocl_with_retry(user_policy, client, max_retries=3):
    last_error = ""
    ocl_expr = ""

    for attempt in range(1, max_retries + 1):
        print(f"\n🌀 Attempt {attempt}/{max_retries} generating OCL...")

        ocl_expr = generate_ocl_constraint(user_policy, client)
        ocl_expr = normalize_ocl_for_python(ocl_expr)

        print("Generated OCL:", ocl_expr)

        sanity_errors = basic_ocl_sanity_check(ocl_expr)
        if not sanity_errors:
            print("✅ OCL sanity check passed.")
            return ocl_expr

        last_error = " | ".join(sanity_errors)
        print("❌ Sanity failed:", last_error)

    print("⚠️ Failed after retries.")
    return ""

def extract_properties(ocl_expression: str) -> Set[str]:
    """
    Extract property names from OCL expression.
    
    Args:
        ocl_expression: The OCL constraint expression
        
    Returns:
        Set of property names found in the expression
    """
    return set(re.findall(r"self\.([a-zA-Z_][a-zA-Z0-9_]*)", ocl_expression))

def extract_property_types(ocl_expression: str, properties: Set[str]) -> Dict[str, str]:
    """
    Extract property types from OCL expression based on usage patterns.
    
    Enhanced logic:
    1. Check if property is compared to a number (e.g., self.money = 2) -> IntegerType
    2. Check if property is compared to a string literal -> StringType
    3. Check if property is compared to a date -> DateType
    4. Check property name patterns (fallback)
    5. Check comparison operators (>=, >, <=, <) -> IntegerType
    
    Args:
        ocl_expression: The OCL constraint expression
        properties: Set of property names to infer types for
        
    Returns:
        Dictionary mapping property names to their inferred types
    """
    prop_types: Dict[str, str] = {}
    expression_part = ocl_expression.split("inv:")[-1].strip() if "inv:" in ocl_expression else ocl_expression
    
    for prop in properties:
        prop_type = None
        
        # Priority 1: Check if property is compared to a number (e.g., self.money = 2, self.age > 18)
        # Pattern: self.prop = number or self.prop >= number, etc.
        numeric_pattern = re.search(
            fr"self\.{re.escape(prop)}\s*([=<>!]+)\s*(\d+\.?\d*)",
            expression_part
        )
        if numeric_pattern:
            prop_type = "IntegerType"
            logger.debug(f"Property '{prop}' inferred as IntegerType (compared to number)")
        
        # Priority 2: Check if property is compared to a string literal
        if prop_type is None:
            string_pattern = re.search(
                fr"self\.{re.escape(prop)}\s*=\s*[\"']([^\"']+)[\"']",
                expression_part
            )
            if string_pattern:
                prop_type = "StringType"
                logger.debug(f"Property '{prop}' inferred as StringType (compared to string)")
        
        # Priority 3: Check if property is compared to a date
        if prop_type is None:
            date_pattern = re.search(
                fr"self\.{re.escape(prop)}\s*[<>=]+\s*date\(",
                expression_part,
                re.IGNORECASE
            )
            if date_pattern:
                prop_type = "DateType"
                logger.debug(f"Property '{prop}' inferred as DateType (compared to date)")
        
        # Priority 4: Check property name patterns
        if prop_type is None:
            prop_lower = prop.lower()
            if any(x in prop_lower for x in [
                "country", "city", "name", "type", "category", "role",
                "department", "position", "region", "location", "company",
                "nationality", "address", "email", "phone"
            ]):
                prop_type = "StringType"
                logger.debug(f"Property '{prop}' inferred as StringType (name pattern)")
            elif "date" in prop_lower:
                prop_type = "DateType"
                logger.debug(f"Property '{prop}' inferred as DateType (name pattern)")
            elif any(x in prop_lower for x in [
                "salary", "age", "amount", "price", "days", "count",
                "quantity", "score", "id", "number", "total", "limit",
                "money", "times", "frequency", "rate", "percentage"
            ]):
                prop_type = "IntegerType"
                logger.debug(f"Property '{prop}' inferred as IntegerType (name pattern)")
        
        # Priority 5: Check comparison operators (if not already determined)
        if prop_type is None:
            comparison_pattern = re.search(
                fr"self\.{re.escape(prop)}\s*(>=|>|<=|<)",
                expression_part
            )
            if comparison_pattern:
                prop_type = "IntegerType"
                logger.debug(f"Property '{prop}' inferred as IntegerType (comparison operator)")
        
        # Default to StringType if no pattern matched
        if prop_type is None:
            prop_type = "StringType"
            logger.debug(f"Property '{prop}' defaulted to StringType")
        
        prop_types[prop] = prop_type
    
    return prop_types
def detect_policy_type(ocl_expr: str) -> str:
    """
    Decide how to evaluate policy:
    - If it contains string literals or string operations -> evaluate in Python
    - Otherwise -> evaluate using OCL engine
    
    Args:
        ocl_expr: OCL expression to analyze
        
    Returns:
        "PYTHON_STRING" or "OCL"
    """
    ocl_expr = ocl_expr.strip()

    # If contains any quotes, likely string literal
    if '"' in ocl_expr or "'" in ocl_expr:
        return "PYTHON_STRING"

    # If contains common string functions
    if "tolower" in ocl_expr.lower() or "includes" in ocl_expr.lower():
        return "PYTHON_STRING"

    # Otherwise numeric/date - use OCL engine
    return "OCL"



# === Generate Dynamic Test File ===
def generate_policy_test_file(
    policy_id: int,
    company_name: str,
    policy_description: str,
    ocl_code: str,
    client: Groq,
    prop_values: Optional[Dict[str, str]] = None,
    prop_types: Optional[Dict[str, str]] = None
) -> Optional[str]:
    """
    Generate a dynamic test file for a policy.
    
    Args:
        policy_id: ID of the policy
        company_name: Name of the company
        policy_description: Policy description text
        ocl_code: Generated OCL constraint code
        client: Groq client instance
        prop_values: Optional dictionary of property values
        prop_types: Optional dictionary of property types
        
    Returns:
        Filename of generated test file, or None if error occurred
    """
    print(f"   Generating model for Policy #{policy_id}...")
    logger.info(f"Generating test file for policy #{policy_id}")
    try:
        ocl_code_clean = ocl_code.strip()
        if "context" in ocl_code_clean and "inv:" in ocl_code_clean:
            context_part = ocl_code_clean.split("context")[1].split("inv:")[0].strip()
            expression_part = ocl_code_clean.split("inv:")[1].strip()
        else:
            context_part = "BaseModel"
            expression_part = ocl_code_clean

        # --- Clean up OCL expression ---
        expression_part = expression_part.replace(".plusDays(", " + ").replace(")", "")
        context_class_var = context_part.lower() + "_class"
        context_class_def = f"{context_class_var} = Class(name=\"{context_part}\")"
        properties = extract_properties(expression_part)
        context_properties_def = ""
        props_list = []
        prop_types_dict = {}  # store prop name → type mapping (inferred)

        # --- Smart property type inference using improved function ---
        if properties:
            # Use the improved extract_property_types function
            prop_types_dict = extract_property_types(expression_part, properties)
            
            for prop in sorted(properties):
                prop_var = f"{prop}_prop"
                prop_type = prop_types_dict.get(prop, "StringType")
                
                context_properties_def += f"{prop_var} = Property(name=\"{prop}\", type={prop_type})\n"
                props_list.append(prop_var)

            props_str = ", ".join(props_list)
            context_properties_def += f"{context_class_var}.attributes = {{{props_str}}}\n"

        # --- Use provided prop_types or infer them ---
        if prop_types is None:
            prop_types = prop_types_dict.copy()
        else:
            # Merge with inferred types for any missing ones
            for prop in sorted(properties):
                if prop not in prop_types:
                    prop_types[prop] = prop_types_dict.get(prop, "StringType")

        # --- Dynamic input & parsing code ---
        dynamic_input_code = """
print("\\n--- Setting test data for this policy ---")
test_description = input("Enter test case description (example: Employee is from Egypt and age is 25): ")

from datetime import date
import re
import spacy
import sys
import io

# Set UTF-8 encoding for stdout to handle any special characters
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

nlp = spacy.load("en_core_web_sm")

def extract_value_from_text(text, dtype):
    if dtype == "IntegerType":
        # First, try to convert directly if it's already a number string
        text_stripped = text.strip()
        try:
            # Try direct conversion
            if text_stripped.replace('-', '').replace('+', '').isdigit():
                result = int(text_stripped)
                print(f"[OK] Direct number conversion: {result}")
                return result
        except:
            pass
        
        # Try to extract number from text (handles percentages, etc.)
        # Remove % sign and extract number
        text_clean = text_stripped.replace('%', '').strip()
        try:
            # Try to convert after removing %
            if text_clean.replace('-', '').replace('+', '').isdigit():
                result = int(text_clean)
                print(f"[OK] Extracted number (after removing %): {result}")
                return result
        except:
            pass
        
        # Use spacy to extract numbers
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["MONEY", "CARDINAL", "QUANTITY"]:
                num = re.sub(r"[^0-9]", "", ent.text)
                if num:
                    print(f"[OK] Extracted number from entity: {num}")
                    return int(num)
        
        # Fallback: extract all digits
        all_nums = re.findall(r"\\d+", text)
        if all_nums:
            result = int(all_nums[-1])
            print(f"[OK] Extracted number (regex): {result}")
            return result
        
        print("[WARNING] No number found, using 0.")
        return 0

    elif dtype == "DateType":
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "DATE":
                print(f"[OK] Extracted date: {ent.text}")
                digits = re.findall(r"\\d+", ent.text)
                if len(digits) == 3:
                    try:
                        parts = [int(x) for x in digits]
                        if parts[0] > 31:
                            parts = [parts[2], parts[1], parts[0]]
                        return date(*reversed(parts)) if parts[0] > 31 else date(*parts)
                    except:
                        continue
        match = re.search(r"(\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4})", text)
        if match:
            digits = [int(x) for x in re.split("[-/]", match.group(1))]
            return date(*reversed(digits)) if digits[0] > 31 else date(*digits)
        print("[WARNING] No date found, using today's date.")
        return date.today()

    else:  # StringType
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC", "ORG", "PERSON"]:
                print(f"[OK] Extracted text: {ent.text}")
                return ent.text
        return text.strip()

def parse_value(value, dtype):
    if not value:
        return None
    
    # For IntegerType, try direct conversion first
    if dtype == "IntegerType":
        value_str = str(value).strip()
        # Try direct integer conversion
        try:
            # Remove % if present
            value_clean = value_str.replace('%', '').strip()
            if value_clean.replace('-', '').replace('+', '').isdigit():
                return int(value_clean)
        except:
            pass
    
    if dtype in ["DateType", "IntegerType", "StringType"]:
        return extract_value_from_text(str(value), dtype)
    return value

dynamic_obj = {context_var}("obj1").build()
""".replace("{context_var}", context_class_var)

        # --- Use provided values or fallback to suggestions ---
        if prop_values is None:
            # Fallback: use suggestions if no values provided
            ner_values = extract_entities_from_description(policy_description)
            llm_values = suggest_test_values(policy_description, client)
            suggestions = {**llm_values, **ner_values}
            prop_values = suggestions
        # ✅ Auto-extract string value from OCL like: self.country = "egypt"
        m = re.search(r'self\.(\w+)\s*=\s*"([^"]+)"', expression_part)
        if m and prop_values is not None:
            extracted_prop = m.group(1)
            extracted_val = m.group(2)
            prop_values[extracted_prop] = extracted_val


        # --- Assign property values ---
                # --- Assign property values (from user test description) ---
        for prop in sorted(properties):
            dtype = prop_types.get(prop, "StringType")

            dynamic_input_code += f"""
value = extract_value_from_text(test_description, "{dtype}")
dynamic_obj.{prop} = value
print(f"Set {prop} = {{value}} (from test description)")
"""

        dynamic_input_code += f"\ncontext_om = ObjectModel(name=\"{context_part}Model\", objects={{dynamic_obj}})\n"

        # --- Build final test file ---
        model_code = TEMPLATE.replace("{policy_id}", str(policy_id))
        model_code = model_code.replace("{policy_description}", policy_description.replace("\"", "\\\""))
        model_code = model_code.replace("{context_class_def}", context_class_def)
        model_code = model_code.replace("{context_properties_def}", context_properties_def)
        model_code = model_code.replace("{context_var}", context_class_var)
        model_code = model_code.replace("{context_var_set}", f"{{{context_class_var}}}")
        model_code = model_code.replace("{constraint_set}", "{POLICY_CONSTRAINT}")
        model_code = model_code.replace("{property_assignments}", dynamic_input_code)
        eval_mode = detect_policy_type(expression_part)  # "OCL" or "PYTHON_STRING"
        raw_expr_safe = expression_part.replace("\\", "\\\\").replace('"', '\\"')
        model_code = model_code.replace("{eval_mode}", eval_mode)
        model_code = model_code.replace("{raw_ocl_expr}", raw_expr_safe)

        model_code = model_code.replace("{ocl_expression}", f"context {context_part} inv: {expression_part}")

        safe_company_name = re.sub(r'[^a-zA-Z0-9_]+', '', company_name.replace(' ', '_'))
        file_name = f"{safe_company_name}_policy_{policy_id}.py"
        with open(file_name, "w", encoding="utf-8") as f:
            f.write(model_code)
        print(f"   ✅ Dynamic model code generated and saved as: {file_name}")
        logger.info(f"Test file generated: {file_name}")
        return file_name

    except Exception as e:
        logger.error(f"Error generating model for policy #{policy_id}: {e}")
        print(f"   ❌ Error generating model for policy #{policy_id}: {e}")
        return None
    

# === MAIN SCRIPT ===
# Only run this code when the script is executed directly, not when imported
if __name__ == "__main__":
    setup_database()

    company_name = input("Enter the company name: ")
    if not company_name:
        print("Company name cannot be empty. Exiting.")
        close_db_connection()
        exit()

    user_policy = input(f"Enter your policy for '{company_name}': ")
    if not user_policy:
        print("Policy cannot be empty. Exiting.")
        close_db_connection()
        exit()

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    try:
        print("\nGenerating OCL code...")
        ocl_code = generate_ocl_with_retry(user_policy, client, max_retries=3)
        if not ocl_code:
            print("❌ Could not generate valid OCL. Exiting.")
            close_db_connection()
            exit()



        print("\n--- Generated OCL Constraint ---")
        print(ocl_code)
        print("--------------------------------")


        category, keywords = extract_metadata(user_policy, client)
        print(f"🧠 Detected Category: {category}")
        print(f"🔑 Keywords: {', '.join(keywords)}")

        company_id = get_or_create_company_id(company_name)
        if company_id:
            new_policy_id = insert_policy(company_id, user_policy, ocl_code, category, keywords)
            if new_policy_id:
                generate_policy_test_file(new_policy_id, company_name, user_policy, ocl_code, client)

    except Exception as e:
        logger.error(f"Error during API call: {e}")
        print(f"\n An error occurred during API call: {e}")
    finally:
        close_db_connection()
        print("\nDatabase connection closed.")