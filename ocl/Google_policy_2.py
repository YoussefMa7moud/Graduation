from besser.BUML.metamodel.structural import (
    Class, Property, Constraint, DateType, IntegerType, StringType, DomainModel
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper
from datetime import date
import re


# --- Policy Info ---
# Policy ID: 2
# Description: No return after 14 days of purchase.

# --- Context Class ---
basemodel_class = Class(name="BaseModel")

# --- Add dynamic properties ---
purchaseDate_prop = Property(name="purchaseDate", type=DateType)
returnDate_prop = Property(name="returnDate", type=DateType)
basemodel_class.attributes = {purchaseDate_prop, returnDate_prop}


# --- Constraint from policy ---
POLICY_CONSTRAINT = Constraint(
    name="policyConstraint",
    context=basemodel_class,
    expression='context BaseModel inv: self.returnDate - self.purchaseDate %3C%3D 14',
    language="OCL"
)


domain_model = DomainModel(
    name="PolicyModel",
    types={basemodel_class},
    constraints={POLICY_CONSTRAINT},
    associations=set(),
    generalizations=set()
)

# --- Object creation with user input ---

print("\n--- Setting test data for this policy ---")
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
        all_nums = re.findall(r"\d+", text)
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
                digits = re.findall(r"\d+", ent.text)
                if len(digits) == 3:
                    try:
                        parts = [int(x) for x in digits]
                        if parts[0] > 31:
                            parts = [parts[2], parts[1], parts[0]]
                        return date(*reversed(parts)) if parts[0] > 31 else date(*parts)
                    except:
                        continue
        match = re.search(r"(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})", text)
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

dynamic_obj = basemodel_class("obj1").build()

value = extract_value_from_text(test_description, "DateType")
dynamic_obj.purchaseDate = value
print(f"Set purchaseDate = {value} (from test description)")

value = extract_value_from_text(test_description, "DateType")
dynamic_obj.returnDate = value
print(f"Set returnDate = {value} (from test description)")

context_om = ObjectModel(name="BaseModelModel", objects={dynamic_obj})


# --- Evaluate Policy Constraint ---
print(f"\nTesting Policy #2: 'No return after 14 days of purchase.'")

EVAL_MODE = "OCL"  # "OCL" or "PYTHON_STRING"

if EVAL_MODE == "OCL":
    ocl_wrapper = OCLWrapper(domain_model, context_om)
    result = ocl_wrapper.evaluate(POLICY_CONSTRAINT)

else:
    # Python-based evaluation for string policies (engine limitation)
    # Expect expression like: self.country = "egypt"
    expr = "self.returnDate - self.purchaseDate %3C%3D 14".strip()

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

