import sqlite3
from datetime import date
from besser.BUML.metamodel.structural import (
    Class, Property, Method, Parameter,
    BinaryAssociation, Generalization, DomainModel,
    Enumeration, EnumerationLiteral, Multiplicity,
    StringType, IntegerType, FloatType, BooleanType,
    TimeType, DateType, DateTimeType, TimeDeltaType,
    AnyType, Constraint, AssociationClass, Metadata
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper

DB_FILE = "policy.db"

# ============================================
# STEP 1: Define Properties (Attributes)
# ============================================
orderDate_prop = Property(name="orderDate", type=DateType)
returnDate_prop = Property(name="returnDate", type=DateType)
company_prop = Property(name="company", type=StringType)
country_prop = Property(name="country", type=StringType)


# ============================================
# STEP 2: Database Functions
# ============================================
def fetch_policies_from_db():
    """Fetch all policies from the database."""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT id, policy_description, ocl_code FROM policy")
        policies = cursor.fetchall()
        conn.close()
        return policies
    except Exception as e:
        print(f"❌ Error fetching policies from database: {e}")
        return []


def extract_context_from_ocl(ocl_code):
    """Extract the context class name from OCL code."""
    try:
        # Clean backticks first
        ocl_code = ocl_code.replace("ocl", "").replace("", "").strip()
        # Look for "context ClassName"
        if "context" in ocl_code.lower():
            parts = ocl_code.split()
            context_idx = None
            for i, part in enumerate(parts):
                if part.lower() == "context":
                    context_idx = i
                    break
            if context_idx is not None and context_idx + 1 < len(parts):
                class_name = parts[context_idx + 1].strip()
                return class_name
        return "UnknownClass"
    except Exception as e:
        print(f"⚠ Error extracting context: {e}")
        return "UnknownClass"


def extract_constraint_name_from_ocl(ocl_code):
    """Extract the invariant name from OCL code."""
    try:
        # Clean backticks first
        ocl_code = ocl_code.replace("ocl", "").replace("", "").strip()
        # Look for "inv invName:"
        if "inv" in ocl_code:
            parts = ocl_code.split("inv")
            if len(parts) > 1:
                inv_part = parts[1].strip()
                name = inv_part.split(":")[0].strip()
                return name if name else "unnamed_constraint"
        return "unnamed_constraint"
    except Exception as e:
        print(f"⚠ Error extracting constraint name: {e}")
        return "unnamed_constraint"


# ============================================
# STEP 3: Create Domain Model from Database
# ============================================
def create_domain_model_from_db():
    """Create a DomainModel from database policies."""
    policies = fetch_policies_from_db()
    
    if not policies:
        print("⚠ No policies found in database.")
        return None
    
    print(f"📊 Found {len(policies)} policies in database\n")
    print("=" * 60)
    
    # Track unique classes and their constraints
    class_dict = {}
    constraint_list = []
    
    for policy_id, description, ocl_code in policies:
        print(f"\n📋 Policy #{policy_id}: {description}")
        print(f"📝 OCL Code: {ocl_code}")
        
        # Extract context class
        class_name = extract_context_from_ocl(ocl_code)
        
        # Create class if it doesn't exist
        if class_name not in class_dict:
            new_class = Class(name=class_name)
            
            # Add attributes based on class type
            if class_name == "Order":
                new_class.attributes = {orderDate_prop, returnDate_prop, company_prop}
                print(f"   ✅ Created class: {class_name} with attributes: orderDate, returnDate, company")
            elif class_name == "Company":
                new_class.attributes = {country_prop}
                print(f"   ✅ Created class: {class_name} with attribute: country")
            else:
                print(f"   ✅ Created class: {class_name} (no predefined attributes)")
            
            class_dict[class_name] = new_class
        
        # Extract constraint name
        constraint_name = extract_constraint_name_from_ocl(ocl_code)
        
        # Clean the OCL code by removing markdown backticks
        cleaned_ocl = ocl_code.replace("ocl", "").replace("", "").strip()
        
        # Create constraint
        constraint = Constraint(
            name=f"{constraint_name}_{policy_id}",
            context=class_dict[class_name],
            expression=cleaned_ocl,
            language="OCL"
        )
        constraint_list.append(constraint)
        print(f"   ✅ Created constraint: {constraint_name}_{policy_id}")
    
    print("\n" + "=" * 60)
    
    # Create domain model
    domain_model = DomainModel(
        name="PolicyDomainModel",
        types=set(class_dict.values()),
        constraints=set(constraint_list),
        associations=set(),
        generalizations=set()
    )
    
    print("✅ Domain Model created successfully!")
    print(f"   📦 Classes: {list(class_dict.keys())}")
    print(f"   🔒 Constraints: {len(constraint_list)}")
    print("=" * 60)
    
    return domain_model, class_dict, constraint_list


# ============================================
# STEP 4: Create Sample Objects for Testing
# ============================================
def create_sample_objects(class_dict):
    """Create sample objects for testing constraints."""
    objects = {}
    object_models = {}
    
    print("\n" + "=" * 60)
    print("📦 Creating Sample Objects for Testing")
    print("=" * 60)
    
    # Create Company object if class exists
    if "Company" in class_dict:
        egypt_company = class_dict["Company"]("egypt_co").attributes(
            country="Egypt"
        ).build()
        objects["egypt_company"] = egypt_company
        
        company_om = ObjectModel(
            name="CompanyModel",
            objects={egypt_company}
        )
        object_models["Company"] = company_om
        print("✅ Created Company object: egypt_co (country='Egypt')")
    
    # Create Order object if class exists
    if "Order" in class_dict:
        # Order 1: Valid order with return date (should pass constraints)
        sample_order = class_dict["Order"]("order1").attributes(
            orderDate=date(2025, 1, 15),
            returnDate=date(2025, 1, 20),  # Within 14 days
            company="Egypt"
        ).build()
        objects["sample_order"] = sample_order
        
        order_om = ObjectModel(
            name="OrderModel",
            objects={sample_order}
        )
        object_models["Order"] = order_om
        print("✅ Created Order object: order1")
        print("   - orderDate: 2025-01-15")
        print("   - returnDate: 2025-01-20 (within 14 days)")
        print("   - company: Egypt")
        
        # Order 2: Order with late return (should fail first constraint)
        order_late_return = class_dict["Order"]("order2").attributes(
            orderDate=date(2025, 1, 15),
            returnDate=date(2025, 2, 15),  # More than 14 days
            company="USA"
        ).build()
        objects["order_late_return"] = order_late_return
        
        order_om2 = ObjectModel(
            name="OrderModel_LateReturn",
            objects={order_late_return}
        )
        object_models["Order_LateReturn"] = order_om2
        print("✅ Created Order object: order2 (late return)")
        print("   - orderDate: 2025-01-15")
        print("   - returnDate: 2025-02-15 (more than 14 days)")
        print("   - company: USA")
        
        # Order 3: Egypt order with valid return date
        order_egypt = class_dict["Order"]("order3").attributes(
            orderDate=date(2025, 1, 10),
            returnDate=date(2025, 1, 15),
            company="Egypt"
        ).build()
        objects["order_egypt"] = order_egypt
        
        order_om3 = ObjectModel(
            name="OrderModel_Egypt",
            objects={order_egypt}
        )
        object_models["Order_Egypt"] = order_om3
        print("✅ Created Order object: order3 (Egypt with return)")
        print("   - orderDate: 2025-01-10")
        print("   - returnDate: 2025-01-15")
        print("   - company: Egypt")
    
    print("=" * 60)
    return objects, object_models


# ============================================
# STEP 5: Test Constraints with OCL
# ============================================
def test_constraints(domain_model, constraint_list, object_models):
    """Test all constraints against sample objects using OCL."""
    print("\n" + "=" * 60)
    print("🧪 Testing Constraints with OCL")
    print("=" * 60)
    
    for constraint in constraint_list:
        context_class_name = constraint.context.name
        
        print(f"\n📌 Constraint: {constraint.name}")
        print(f"   Context: {context_class_name}")
        print(f"   Expression: {constraint.expression}")
        
        # Test with relevant object models
        tested = False
        for om_key, object_model in object_models.items():
            if context_class_name in om_key:
                tested = True
                print(f"   Testing with: {om_key}")
                try:
                    ocl_wrapper = OCLWrapper(domain_model, object_model)
                    result = ocl_wrapper.evaluate(constraint)
                    status = "✅ PASSED" if result else "❌ FAILED"
                    print(f"   Result: {status}")
                except Exception as e:
                    print(f"   ❌ Error evaluating: {e}")
        
        if not tested:
            print(f"   ⚠ No object model available for testing")
        
        print("   " + "-" * 56)
    
    print("=" * 60)


# ============================================
# STEP 6: Display Domain Model Information
# ============================================
def display_domain_model_info(domain_model, class_dict, constraint_list):
    """Display detailed information about the domain model."""
    print("\n" + "=" * 60)
    print("📊 Domain Model Summary")
    print("=" * 60)
    
    print(f"\n🏷  Model Name: {domain_model.name}")
    
    print(f"\n📦 Classes ({len(class_dict)}):")
    for class_name, class_obj in class_dict.items():
        print(f"   • {class_name}")
        if class_obj.attributes:
            print(f"     Attributes:")
            for attr in class_obj.attributes:
                print(f"       - {attr.name}: {attr.type._class.name_}")
    
    print(f"\n🔒 Constraints ({len(constraint_list)}):")
    for constraint in constraint_list:
        print(f"   • {constraint.name}")
        print(f"     Context: {constraint.context.name}")
        print(f"     Expression: {constraint.expression}")
        print()
    
    print("=" * 60)


# ============================================
# STEP 7: Export to Python Code
# ============================================
def export_to_code(domain_model, class_dict, constraint_list, objects, object_models):
    """Generate Python code representation of the domain model."""
    print("\n" + "=" * 60)
    print("📝 Generated Python Code")
    print("=" * 60)
    print()
    
    code = """from besser.BUML.metamodel.structural import (
    Class, Property, Method, Parameter,
    BinaryAssociation, Generalization, DomainModel,
    Enumeration, EnumerationLiteral, Multiplicity,
    StringType, IntegerType, FloatType, BooleanType,
    TimeType, DateType, DateTimeType, TimeDeltaType,
    AnyType, Constraint, AssociationClass, Metadata
)
from besser.BUML.metamodel.object import ObjectModel
from bocl.OCLWrapper import OCLWrapper
from datetime import date

"""
    
    # Add properties with correct type mapping
    prop_dict = {}
    for class_name, class_obj in class_dict.items():
        if class_obj.attributes:
            for attr in class_obj.attributes:
                # Map to correct type name
                if attr.type == DateType:
                    type_name = "DateType"
                elif attr.type == StringType:
                    type_name = "StringType"
                elif attr.type == IntegerType:
                    type_name = "IntegerType"
                elif attr.type == FloatType:
                    type_name = "FloatType"
                elif attr.type == BooleanType:
                    type_name = "BooleanType"
                else:
                    type_name = attr.type._class.name_
                
                prop_key = f"{attr.name}_prop"
                if prop_key not in prop_dict:
                    code += f'{prop_key} = Property(name="{attr.name}", type={type_name})\n'
                    prop_dict[prop_key] = True
    
    code += "\n"
    
    # Add classes
    for class_name, class_obj in class_dict.items():
        code += f'{class_name.lower()}_class = Class(name="{class_name}")\n'
    
    code += "\n"
    
    # Add attributes to classes
    for class_name, class_obj in class_dict.items():
        if class_obj.attributes:
            attr_names = [f"{attr.name}_prop" for attr in class_obj.attributes]
            code += f'{class_name.lower()}_class.attributes = {{{", ".join(attr_names)}}}\n'
    
    code += "\n"
    
    # Add constraints
    for constraint in constraint_list:
        constraint_var = constraint.name
        code += f'''{constraint_var} = Constraint(
    name="{constraint.name}",
    context={constraint.context.name.lower()}_class,
    expression="{constraint.expression}",
    language="OCL"
)

'''
    
    # Create Domain Model
    class_names = ', '.join([f'{c.lower()}_class' for c in class_dict.keys()])
    constraint_names = ', '.join([c.name for c in constraint_list])
    
    code += f"""domain_model = DomainModel(
    name="{domain_model.name}",
    types={{{class_names}}},
    constraints={{{constraint_names}}},
    associations=set(),
    generalizations=set()
)

"""
    
    # Create objects section
    code += "# Create objects\n"
    for obj_key, obj in objects.items():
        # Find which class this object belongs to
        obj_class_name = None
        for cls_name, cls_obj in class_dict.items():
            if obj._class.name_ == cls_name:
                obj_class_name = cls_name
                break
        
        if obj_class_name is None:
            obj_class_name = obj._class.name_        
            print(f"DEBUG: obj_key={obj_key}, obj_class_name={obj_class_name}, obj._class.name={obj.class.name_}")

        # Get attributes
        attrs = []
        for attr_name in ['orderDate', 'returnDate', 'company', 'country']:
            if hasattr(obj, attr_name):
                attr_value = getattr(obj, attr_name)
                if attr_value is not None:
                    if isinstance(attr_value, str):
                        attrs.append(f'{attr_name}="{attr_value}"')
                    elif hasattr(attr_value, 'isoformat'):  # Date object
                        attrs.append(f'{attr_name}=date({attr_value.year}, {attr_value.month}, {attr_value.day})')
                    else:
                        attrs.append(f'{attr_name}={attr_value}')
        
        attr_str = ', '.join(attrs)
        code += f'{obj_key} = {obj_class_name.lower()}_class("{obj.name}").attributes({attr_str}).build()\n'
    
    code += "\n# Object models\n"
    for om_key, om in object_models.items():
        # Find object variable names that match this object model
        obj_vars = []
        for obj_key, obj in objects.items():
            if obj in om.objects:
                obj_vars.append(obj_key)
        code += f'{om_key.lower()}_om = ObjectModel(name="{om.name}", objects={{{", ".join(obj_vars)}}})\n'
    
    code += "\n## Test constraints\n"
    for i, constraint in enumerate(constraint_list, 1):
        constraint_var = constraint.name
        class_name = constraint.context.name
        
        code += f'print("Testing {class_name} constraint {i}...")\n'
        code += f'ocl_{class_name.lower()}_{i} = OCLWrapper(domain_model, {class_name.lower()}_om)\n'
        code += f'{class_name.lower()}result{i} = ocl_{class_name.lower()}_{i}.evaluate({constraint_var})\n'
        code += f'print("{constraint.name}:", {class_name.lower()}result{i})\n\n'
    
    print(code)
    print("=" * 60)
    
    # Save to file
    with open("generated_domain_model.py", "w") as f:
        f.write(code)
    print("\n✅ Code saved to 'generated_domain_model.py'")


# ============================================
# MAIN EXECUTION
# ============================================
if __name__ == "_main_":
    print("\n" + "=" * 60)
    print("🚀 Database to BUML Template Generator with OCL Testing")
    print("=" * 60 + "\n")
    
    # Step 1: Create domain model from database
    result = create_domain_model_from_db()
    
    if result:
        domain_model, class_dict, constraint_list = result
        
        # Step 2: Create sample objects for testing
        objects, object_models = create_sample_objects(class_dict)
        
        # Step 3: Test constraints with OCL
        test_constraints(domain_model, constraint_list, object_models)
        
        # Step 4: Display domain model information
        display_domain_model_info(domain_model, class_dict, constraint_list)
        
        # Step 5: Export to Python code
        export_to_code(domain_model, class_dict, constraint_list, objects, object_models)
        
        print("\n" + "=" * 60)
        print("✅ Process Completed Successfully!")
        print("=" * 60)
        print("\n💡 Your domain model is now ready to use!")
        print("   - Domain Model: domain_model")
        print("   - Classes: class_dict")
        print("   - Constraints: constraint_list")
        print("   - Sample Objects: objects")
        print("   - Object Models: object_models")
        print("\n✅ All OCL constraints have been tested!")
        print("=" * 60 + "\n")
    else:
        print("\n" + "=" * 60)
        print("❌ Failed to create domain model from database.")
        print("   Make sure you have policies in your database.")
        print("   Run your policy generator script first.")
        print("=" * 60 + "\n")