import os
import warnings
import sqlite3
import re  
from groq import Groq
from dotenv import load_dotenv
from datetime import date 

from besser.BUML.metamodel.structural import (
    Property, Class, Constraint, DomainModel,
    DateType, IntegerType, StringType
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper

load_dotenv()

DB_file = "policy.db"
conn = sqlite3.connect(DB_file)
cursor = conn.cursor()


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

# --- Object creation with test data ---
dynamic_obj = {context_var}("obj1").build()
{property_assignments}
context_om = ObjectModel(name="{context_name}Model", objects={object_set})

# --- Evaluate Policy Constraint ---
print(f"Testing Policy #{policy_id}: '{policy_description}'")
print(f"Test scenario: Using generic sample data (e.g., {sample_data_desc})")
ocl_wrapper = OCLWrapper(domain_model, context_om)
result = ocl_wrapper.evaluate(POLICY_CONSTRAINT)
print("Policy evaluation result:", result)
if result:
    print("✅ Constraint PASSED (sample data meets policy)")
else:
    print("❌ Constraint FAILED (sample data violates policy)")
"""

def setup_database():
    """
    Creates the necessary tables ('companies' and 'policies')
    if they don't already exist.
    """
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
                FOREIGN KEY (company_id) REFERENCES companies (id)
            );
        """)
        conn.commit()
    except Exception as e:
        print(f"\n ERROR setting up database: {e}")

def get_or_create_company_id(company_name):
    """
    Finds the ID for a given company name.
    If the company doesn't exist, it creates it and returns the new ID.
    """
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

def insert_policy(company_id, policy_description, ocl_code):
    """
    Inserts the new policy and returns the new policy's ID.
    """
    try:
        cursor.execute(
            "INSERT INTO policies (company_id, policy_description, ocl_code) VALUES (?, ?, ?)",
            (company_id, policy_description, ocl_code.strip())
        )
        conn.commit()
        print("✅ Policy inserted successfully and linked to company.")
        return cursor.lastrowid  
    except Exception as e:
        print(f"\n ERROR saving policy to database: {e}")
        return None

# --- Helper from second script ---
def extract_properties(ocl_expression):
    """Extracts all 'self.property' from an OCL expression."""
    return set(re.findall(r"self\.([a-zA-Z_][a-zA-Z0-9_]*)", ocl_expression))

def generate_policy_test_file(policy_id, company_name, policy_description, ocl_code):
    """
    Generates a Python test file for a given policy using besser.BUML.
    This is the logic from your second script, now as a function.
    """
    print(f"   Generating model for Policy #{policy_id}...")
    try:
        ocl_code_clean = ocl_code.strip()

        # Extract context and OCL expression
        if "context" in ocl_code_clean and "inv:" in ocl_code_clean:
            context_part = ocl_code_clean.split("context")[1].split("inv:")[0].strip()
            expression_part = ocl_code_clean.split("inv:")[1].strip()
        else:
            # Fallback if OCL is incomplete
            context_part = "BaseModel"
            expression_part = ocl_code_clean

        # Replace unsupported OCL syntax for bocl
        expression_part = expression_part.replace(".plusDays(", " + ")
        expression_part = expression_part.replace(")", "") # Simple replacement

        # Dynamic class and variable
        context_class_var = context_part.lower() + "_class"
        context_class_def = f"{context_class_var} = Class(name=\"{context_part}\")"

        # Create dynamic properties
        properties = extract_properties(expression_part)
        context_properties_def = ""
        property_assignments = ""
        props_list = []
        sample_data_list = []
        
        if properties:
            sorted_properties = sorted(properties)
            
            for prop in sorted_properties:
                prop_var = f"{prop}_prop"
                
                # --- FIX: Guess the type instead of always using DateType ---
                if "date" in prop.lower():
                    prop_type = "DateType"
                    test_value = f"date(2025, 1, 1)" # Sample date
                elif "salary" in prop.lower() or "age" in prop.lower() or "amount" in prop.lower():
                    prop_type = "IntegerType"
                    test_value = "1000" # Sample integer
                else:
                    prop_type = "StringType"
                    test_value = "'TestString'" # Sample string
                
                context_properties_def += f"{prop_var} = Property(name=\"{prop}\", type={prop_type})\n"
                props_list.append(prop_var)
                property_assignments += f"dynamic_obj.{prop} = {test_value}\n"
                sample_data_list.append(f"{prop}={test_value}")
                
            props_str = ", ".join(props_list)
            context_properties_def += f"{context_class_var}.attributes = {{{props_str}}}\n"

        # Fill template
        model_code = TEMPLATE.replace("{policy_id}", str(policy_id))
        model_code = model_code.replace("{policy_description}", policy_description.replace("\"", "\\\""))
        model_code = model_code.replace("{context_class_def}", context_class_def)
        model_code = model_code.replace("{context_properties_def}", context_properties_def)
        model_code = model_code.replace("{context_var}", context_class_var)
        model_code = model_code.replace("{context_var_set}", f"{{{context_class_var}}}")
        model_code = model_code.replace("{constraint_set}", "{POLICY_CONSTRAINT}")
        model_code = model_code.replace("{object_set}", "{dynamic_obj}")
        model_code = model_code.replace("{property_assignments}", property_assignments)
        model_code = model_code.replace("{ocl_expression}", f"context {context_part} inv: {expression_part}")
        model_code = model_code.replace("{context_name}", context_part)
        model_code = model_code.replace("{sample_data_desc}", ", ".join(sample_data_list))


        # Save file
        # --- FIX: Sanitize company name and use it in the filename ---
        safe_company_name = re.sub(r'[^a-zA-Z0-9_]+', '', company_name.replace(' ', '_'))
        file_name = f"{safe_company_name}_policy_{policy_id}.py"
        with open(file_name, "w", encoding="utf-8") as f:
            f.write(model_code)

        print(f"   ✅ Model code generated and saved as: {file_name}")
        print(f"   To run the test: python {file_name}")

    except Exception as e:
        print(f"   ❌ Error generating model for policy #{policy_id}: {e}")

# --- Start of Main Script ---

# 1. Set up the database tables
setup_database()

# 2. Get the company name *first*
company_name = input("Enter the company name: ")
if not company_name:
    print("Company name cannot be empty. Exiting.")
    conn.close()
    exit()

# 3. Get the policy for that company
user_policy = input(f"Enter your policy for '{company_name}': ") 
if not user_policy:
    print("Policy cannot be empty. Exiting.")
    conn.close()
    exit()

# 4. Define the strict prompt for the AI
prompt = f"""
You are an expert OCL (Object Constraint Language) generator. Your task is to convert a natural language policy into a complete OCL constraint.

The user's policy is: "{user_policy}"

Your task:
1.  Analyze the policy and *infer* a simple, logical data model (classes and attributes) that this policy would apply to.
2.  Based on your inferred model, generate the OCL constraint.
3.  The main context (e.g., 'context Contract', 'context Order') should be the primary object mentioned in the policy.
4.  You must *only* return the OCL code block. Do not include any text, explanations, or markdown formatting.

Example 1:
User Policy: "the return date must be after 30 days and only for Egypt companies"
Your Output:
context Order
inv: self.returnDate > self.orderDate.plusDays(30) and self.company.country = 'Egypt'

Example 2:
User Policy: "the contract cannot be terminated after 30 days from the start date"
Your Output:
context Contract
inv: self.terminationDate.oclIsUndefined() or self.terminationDate <= self.startDate.plusDays(30)

Example 3:
User Policy: "a new employee salary must be over 5000"
Your Output:
context Employee
inv: self.salary > 5000

Now, process the user's policy.
"""

# 5. Initialize the Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY") # Reads the key from your .env file
)

try:
    print("\nGenerating OCL code...")
    
    # 6. Run the API call
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # Using the new Llama 3.3 model
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.0  # Set to 0 for precise, deterministic output
    )
    
    ocl_code = response.choices[0].message.content.strip() 

    print("\n--- Generated OCL Constraint ---")
    print(ocl_code)
    print("--------------------------------")

    # 7. Get (or create) the company ID
    company_id = get_or_create_company_id(company_name)
    
    # 8. Insert the policy *with* the company ID
    if company_id:
        # Get the new policy_id back
        new_policy_id = insert_policy(company_id, user_policy, ocl_code)
        
        # 9. NEW STEP: Immediately generate the test file
        if new_policy_id:
            generate_policy_test_file(new_policy_id, company_name, user_policy, ocl_code)

except Exception as e:
    print(f"\n An error occurred during API call: {e}")

finally:
    # Safely close the global connection at the end of the script
    conn.close()
    print("\nDatabase connection closed.")