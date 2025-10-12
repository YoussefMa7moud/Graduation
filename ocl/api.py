import os
from google import genai
import warnings
import sqlite3

DB_file = "policy.db"

conn = sqlite3.connect(DB_file)
cursor = conn.cursor()

def create_table():
    
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS policy (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                policy_description TEXT NOT NULL,
                ocl_code TEXT NOT NULL
            );
        """)
        conn.commit()
    except Exception as e:
        print(f"\n ERROR creating table: {e}")
    finally:
     
        pass

def insert_policy(policy_description, ocl_code):
    # FIX 3: The `try...except...finally` block must be INSIDE the function.
    try:
        cursor.execute("INSERT INTO policy (policy_description, ocl_code) VALUES (?, ?)", (policy_description, ocl_code.strip()))
        conn.commit()
        print("✅ Policy inserted successfully")
    except Exception as e:
        # NOTE: Removed leading space on the print message for cleaner output
        print(f"\n ERROR saving to database: {e}")
    # We are omitting the conn.close() here to allow the main script to continue
    # No 'finally' block needed if we don't close the connection here.

# --- Start of Main Script ---

create_table()


user_policy = input("Enter your policy: ") 

# Define the strict prompt for the AI
prompt = f"""
Convert the following user policy into OCL (Object Constraint Language) format. 
You must ONLY return the OCL code block, and the OCL must use simple attribute comparison
(e.g., self.attribute = 'value') for the company, not a subclass check (oclIsKindOf).

The policy is: "{user_policy}"

Assume the following classes and attributes are available:
- Class: 'Order' with attributes 'orderDate' (Date), 'returnDate' (Date), and 'company' (Company).
- Class: 'Company' with attribute 'country' (String).

Start the OCL with 'context Order' and an invariant 'inv:'. Do not include any text, explanations, or markdown formatting outside of the OCL code block.
"""

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# FIX 4: The final try block was not wrapping the code it intended to protect.
try:
    print("Generating OCL code...")
    
    # Run the API call
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt
    )
    
    # Define ocl_code here, before using it in insert_policy
    ocl_code = response.text.strip() 

    print("\n--- Generated OCL Constraint ---")
    print(ocl_code)
    print("--------------------------------")

    insert_policy(user_policy, ocl_code)

except Exception as e:
    # This is the correctly placed global error handler
    print(f"\n An error occurred during API call: {e}")

finally:
    # Safely close the global connection at the end of the script
    conn.close()