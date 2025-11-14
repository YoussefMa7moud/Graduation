import os
import warnings
import sqlite3
import re
import json
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
nlp = spacy.load("en_core_web_sm")

DB_file = "policy.db"
conn = sqlite3.connect(DB_file)
cursor = conn.cursor()

# === Template for Generated Policy Test File ===
TEMPLATE = """from besser.BUML.metamodel.structural import (
    Class, Property, Constraint, DateType, IntegerType, StringType, DomainModel
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper
from datetime import date

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
    expression=\"\"\"{ocl_expression}\"\"\",
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
ocl_wrapper = OCLWrapper(domain_model, context_om)
result = ocl_wrapper.evaluate(POLICY_CONSTRAINT)
print("Policy evaluation result:", result)
if result:
    print("✅ Constraint PASSED (entered data meets policy)")
else:
    print("❌ Constraint FAILED (entered data violates policy)")
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
def extract_metadata(policy_text, client):
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
def suggest_test_values(policy_text, client):
    """Use LLM to suggest example test values from the policy."""
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
def setup_database():
    try:
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
                FOREIGN KEY (company_id) REFERENCES companies (id)
            );
        """)
        conn.commit()
    except Exception as e:
        print(f"\n ERROR setting up database: {e}")

def get_or_create_company_id(company_name):
    try:
        cursor.execute("SELECT id FROM companies WHERE name = ?", (company_name,))
        company_row = cursor.fetchone()
        if company_row:
            return company_row[0]
        else:
            cursor.execute("INSERT INTO companies (name) VALUES (?)", (company_name,))
            conn.commit()
            print(f"✅ New company '{company_name}' added to database.")
            return cursor.lastrowid
    except Exception as e:
        print(f"\n ERROR finding or creating company: {e}")
        return None

def insert_policy(company_id, policy_description, ocl_code, category, keywords):
    try:
        cursor.execute(
            "INSERT INTO policies (company_id, policy_description, ocl_code, category, keywords) VALUES (?, ?, ?, ?, ?)",
            (company_id, policy_description, ocl_code.strip(), category, ", ".join(keywords))
        )
        conn.commit()
        print("✅ Policy inserted successfully with metadata.")
        return cursor.lastrowid
    except Exception as e:
        print(f"\n ERROR saving policy to database: {e}")
        return None

def generate_ocl_constraint(user_policy, client):
    """
    Generate an OCL constraint with case-insensitive string comparison
    and flexible contains() logic for location, nationality, company location
    and other string-based conditions.
    """

    prompt = f"""
You are an expert OCL generator. Convert the following policy into a valid OCL constraint.

POLICY:
"{user_policy}"

RULES:

1. Always use self.<property> (e.g., self.country, self.salary)

2. STRING POLICIES:
   - If a policy compares a text value (like country, nationality, city, location, role):
        Use case-insensitive comparison:
        self.<property>.toLower() = '<value>'

   - If the policy uses "inside", "in", "based in", "from", "located in":
        Use substring matching:
        self.<property>.toLower().includes('<value>')

3. NUMERIC POLICIES:
   - "more than X"  →  self.<prop> > X
   - "less than X"  →  self.<prop> < X
   - "at least X"   →  self.<prop> >= X
   - "at most X"    →  self.<prop> <= X

4. DATE POLICIES:
   - Convert comparisons with dates normally:
     self.<prop> < date(2024,1,1)

5. Return ONLY the OCL constraint. No explanation.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"⚠️ OCL generation failed: {e}")
        return ""


def extract_properties(ocl_expression):
    return set(re.findall(r"self\.([a-zA-Z_][a-zA-Z0-9_]*)", ocl_expression))

# === Generate Dynamic Test File ===
def generate_policy_test_file(policy_id, company_name, policy_description, ocl_code, client):
    print(f"   Generating model for Policy #{policy_id}...")
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
        prop_types = {}  # store prop name → type mapping

        # --- Smart property type inference ---
        if properties:
            for prop in sorted(properties):
                prop_var = f"{prop}_prop"

                if re.search(fr"{prop}\s*=\s*'[^']*'", expression_part):
                    prop_type = "StringType"
                elif any(x in prop.lower() for x in [
                    "country", "city", "name", "type", "category", "role",
                    "department", "position", "region", "location", "company"
                ]):
                    prop_type = "StringType"
                elif "date" in prop.lower():
                    prop_type = "DateType"
                elif any(x in prop.lower() for x in [
                    "salary", "age", "amount", "price", "days", "count",
                    "quantity", "score", "id", "number", "total", "limit"
                ]):
                    prop_type = "IntegerType"
                elif re.search(fr"{prop}\s*(>=|>|<=|<)", expression_part):
                    prop_type = "IntegerType"
                else:
                    prop_type = "StringType"

                prop_types[prop] = prop_type
                context_properties_def += f"{prop_var} = Property(name=\"{prop}\", type={prop_type})\n"
                props_list.append(prop_var)

            props_str = ", ".join(props_list)
            context_properties_def += f"{context_class_var}.attributes = {{{props_str}}}\n"

        # --- Combine NER + LLM suggestions ---
        ner_values = extract_entities_from_description(policy_description)
        llm_values = suggest_test_values(policy_description, client)
        suggestions = {**llm_values, **ner_values}

        # --- Dynamic input & parsing code ---
        dynamic_input_code = """
print("\\n--- Enter test data for this policy ---")
from datetime import date
import re
import spacy
nlp = spacy.load("en_core_web_sm")

def extract_value_from_text(text, dtype):
    doc = nlp(text)

    if dtype == "IntegerType":
        for ent in doc.ents:
            if ent.label_ in ["MONEY", "CARDINAL", "QUANTITY"]:
                num = re.sub(r"[^0-9]", "", ent.text)
                if num:
                    print(f"✅ Extracted number: {num}")
                    return int(num)
        all_nums = re.findall(r"\\d+", text)
        if all_nums:
            print(f"✅ Extracted number: {all_nums[-1]}")
            return int(all_nums[-1])
        print("⚠️ No number found, using 0.")
        return 0

    elif dtype == "DateType":
        for ent in doc.ents:
            if ent.label_ == "DATE":
                print(f"✅ Extracted date: {ent.text}")
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
        print("⚠️ No date found, using today's date.")
        return date.today()

    else:  # StringType
        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC", "ORG", "PERSON"]:
                print(f"✅ Extracted text: {ent.text}")
                return ent.text
        return text.strip()

def parse_value(value, dtype):
    if not value:
        return None
    if dtype in ["DateType", "IntegerType", "StringType"]:
        return extract_value_from_text(value, dtype)
    return value

dynamic_obj = {context_var}("obj1").build()
""".replace("{context_var}", context_class_var)

        # --- Use previously inferred types here ---
        for prop in sorted(properties):
            dtype = prop_types.get(prop, "StringType")
            default = suggestions.get(prop, "")
            prompt_text = f"Enter value for '{prop}' ({dtype})"
            if default:
                prompt_text += f" [suggested: {default}]"
            dynamic_input_code += f"""
value = input("{prompt_text}: ") or "{default}"
dynamic_obj.{prop} = parse_value(value, "{dtype}")
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
        model_code = model_code.replace("{ocl_expression}", f"context {context_part} inv: {expression_part}")

        safe_company_name = re.sub(r'[^a-zA-Z0-9_]+', '', company_name.replace(' ', '_'))
        file_name = f"{safe_company_name}_policy_{policy_id}.py"
        with open(file_name, "w", encoding="utf-8") as f:
            f.write(model_code)
        print(f"   ✅ Dynamic model code generated and saved as: {file_name}")

    except Exception as e:
        print(f"   ❌ Error generating model for policy #{policy_id}: {e}")

# === MAIN SCRIPT ===
setup_database()

company_name = input("Enter the company name: ")
if not company_name:
    print("Company name cannot be empty. Exiting.")
    conn.close(); exit()

user_policy = input(f"Enter your policy for '{company_name}': ")
if not user_policy:
    print("Policy cannot be empty. Exiting.")
    conn.close(); exit()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    print("\nGenerating OCL code...")
    ocl_code = generate_ocl_constraint(user_policy, client)

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
    print(f"\n An error occurred during API call: {e}")
finally:
    conn.close()
    print("\nDatabase connection closed.")
