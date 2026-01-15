from besser.BUML.metamodel.structural import (
    Class, Property, Constraint, DateType, IntegerType, StringType, DomainModel
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper
from datetime import date

# --- Policy Info ---
# Policy ID: 14
# Description: money should be paid in 2 installments

# --- Context Class ---
basemodel_class = Class(name="BaseModel")

# --- Add dynamic properties ---
installments_prop = Property(name="installments", type=StringType)
basemodel_class.attributes = {installments_prop}


# --- Constraint from policy ---
POLICY_CONSTRAINT = Constraint(
    name="policyConstraint",
    context=basemodel_class,
    expression="""context BaseModel inv: self.installments = 2""",
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

value = parse_value("money paid 1 time", "StringType")
dynamic_obj.installments = value
print(f"Set installments = {value}")

context_om = ObjectModel(name="BaseModelModel", objects={dynamic_obj})


# --- Evaluate Policy Constraint ---
print(f"\nTesting Policy #14: 'money should be paid in 2 installments'")
ocl_wrapper = OCLWrapper(domain_model, context_om)
result = ocl_wrapper.evaluate(POLICY_CONSTRAINT)
print("Policy evaluation result:", result)
if result:
    print("[PASS] Constraint PASSED (entered data meets policy)")
else:
    print("[FAIL] Constraint FAILED (entered data violates policy)")
