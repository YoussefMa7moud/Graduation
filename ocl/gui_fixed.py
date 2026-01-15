import tkinter as tk
from tkinter import messagebox
import threading
import os
import subprocess
import sys
import traceback
from dotenv import load_dotenv

load_dotenv()

class PolicyApp:
    def __init__(self, root):
        self.root = root
        root.title("Company Policy Entry")
        root.geometry("800x750")

        # --- Company name ---
        tk.Label(root, text="Company Name:").pack(pady=5)
        self.company_entry = tk.Entry(root, width=50)
        self.company_entry.pack(pady=5)

        # --- Policy text ---
        tk.Label(root, text="Enter Policy:").pack(pady=5)
        self.policy_text = tk.Text(root, height=8, width=70)
        self.policy_text.pack(pady=5)

        # --- Generate Properties button ---
        self.gen_btn = tk.Button(root, text="Generate Properties", command=self.generate_properties)
        self.gen_btn.pack(pady=10)

        # --- Loading label ---
        self.loading_label = tk.Label(root, text="", fg="orange")
        self.loading_label.pack(pady=5)

        # --- Frame for dynamic property inputs ---
        self.prop_frame = tk.Frame(root)
        self.prop_frame.pack(pady=10, fill="both", expand=True)
        self.prop_entries = {}
        self.prop_types = {}

        # --- Scrollable frame for properties ---
        canvas = tk.Canvas(self.prop_frame)
        scrollbar = tk.Scrollbar(self.prop_frame, orient="vertical", command=canvas.yview)
        self.scrollable_frame = tk.Frame(canvas)
        
        def on_frame_configure(event):
            canvas.configure(scrollregion=canvas.bbox("all"))
        
        self.scrollable_frame.bind("<Configure>", on_frame_configure)
        
        canvas_window = canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        def on_canvas_configure(event):
            canvas_width = event.width
            canvas.itemconfig(canvas_window, width=canvas_width)
        
        canvas.bind("<Configure>", on_canvas_configure)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # --- Test Policy button ---
        self.test_btn = tk.Button(root, text="Test Policy", command=self.test_policy, state="disabled")
        self.test_btn.pack(pady=10)

        # --- Status Frame ---
        self.status_frame = tk.Frame(root)
        self.status_frame.pack(pady=10)
        
        # --- Status Indicator (Valid/Invalid) ---
        self.status_indicator = tk.Label(
            self.status_frame, 
            text="", 
            font=("Arial", 16, "bold"),
            width=20
        )
        self.status_indicator.pack(side="left", padx=10)
        
        # --- Result Label ---
        self.result_label = tk.Label(
            root, 
            text="", 
            fg="blue", 
            wraplength=600,
            font=("Arial", 10)
        )
        self.result_label.pack(pady=5)
        
        # --- Test Output Text Area ---
        tk.Label(root, text="Test Output:", font=("Arial", 10, "bold")).pack(pady=(10, 5))
        
        # Create frame for text area with scrollbar
        output_frame = tk.Frame(root)
        output_frame.pack(pady=5, fill="both", expand=True, padx=10)
        
        self.output_text = tk.Text(
            output_frame,
            height=8,
            width=80,
            wrap=tk.WORD,
            font=("Consolas", 9),
            bg="white",
            fg="black"
        )
        output_scrollbar = tk.Scrollbar(output_frame, orient="vertical", command=self.output_text.yview)
        self.output_text.configure(yscrollcommand=output_scrollbar.set)
        
        self.output_text.pack(side="left", fill="both", expand=True)
        output_scrollbar.pack(side="right", fill="y")

    def generate_properties(self):
        company_name = self.company_entry.get().strip()
        policy = self.policy_text.get("1.0", tk.END).strip()

        if not company_name or not policy:
            messagebox.showwarning("Input Error", "Company name and policy cannot be empty.")
            return

        # Clear previous entries
        self.prop_entries.clear()
        self.prop_types.clear()
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()

        # Disable button and show loading
        self.gen_btn.config(state="disabled")
        self.loading_label.config(text="Generating OCL and extracting properties...")
        self.result_label.config(text="")
        # Clear status indicator
        self.status_indicator.config(text="", bg="SystemButtonFace")
        # Clear output text area
        self.output_text.delete("1.0", tk.END)

        def task():
            try:
                # First, try to import the required modules
                try:
                    from OCL import (
                        extract_properties,
                        generate_ocl_constraint,
                        extract_property_types
                    )
                except ImportError as import_err:
                    error_msg = f"Failed to import OCL module: {str(import_err)}\n\n"
                    error_msg += "Please ensure all dependencies are installed:\n"
                    error_msg += "pip install besser bocl\n\n"
                    error_msg += f"Full error: {traceback.format_exc()}"
                    print(f"IMPORT ERROR: {error_msg}")
                    self.root.after(0, lambda: messagebox.showerror("Import Error", error_msg))
                    self.root.after(0, self._reset_generate_button)
                    return
                
                try:
                    from groq import Groq
                except ImportError as import_err:
                    error_msg = f"Failed to import groq: {str(import_err)}\n\n"
                    error_msg += "Please install: pip install groq"
                    print(f"IMPORT ERROR: {error_msg}")
                    self.root.after(0, lambda: messagebox.showerror("Import Error", error_msg))
                    self.root.after(0, self._reset_generate_button)
                    return

                api_key = os.getenv("GROQ_API_KEY")
                if not api_key:
                    self.root.after(0, lambda: messagebox.showerror("Error", "GROQ_API_KEY not found in environment variables.\n\nPlease create a .env file with:\nGROQ_API_KEY=your_api_key_here"))
                    self.root.after(0, self._reset_generate_button)
                    return

                client = Groq(api_key=api_key)

                # Generate OCL
                ocl_code = generate_ocl_constraint(policy, client)
                print(f"DEBUG: Generated OCL:\n{ocl_code}")

                if not ocl_code or not ocl_code.strip():
                    self.root.after(0, lambda: messagebox.showerror("Error", "Failed to generate OCL constraint. Please check your API key and try again."))
                    self.root.after(0, self._reset_generate_button)
                    return

                # Extract properties
                props = extract_properties(ocl_code)
                if not props:
                    self.root.after(0, lambda: messagebox.showinfo("Info", "No properties detected from policy. The OCL constraint may not contain any property references."))
                    self.root.after(0, self._reset_generate_button)
                    return

                # Get property types from OCL expression
                prop_types_dict = extract_property_types(ocl_code, props)

                # Schedule UI updates on main thread
                def update_ui():
                    try:
                        for prop in sorted(props):
                            frame = tk.Frame(self.scrollable_frame)
                            frame.pack(fill="x", pady=2, padx=10)
                            prop_type = prop_types_dict.get(prop, "StringType")
                            tk.Label(frame, text=f"{prop} ({prop_type}): ", width=25, anchor="w").pack(side="left")
                            entry = tk.Entry(frame, width=30)
                            entry.pack(side="left", padx=5)
                            self.prop_entries[prop] = entry
                            self.prop_types[prop] = prop_type

                        # Enable Test button
                        self.test_btn.config(state="normal")
                        self.loading_label.config(text="")
                        self.gen_btn.config(state="normal")
                    except Exception as ui_err:
                        print(f"UI UPDATE ERROR: {traceback.format_exc()}")
                        self.loading_label.config(text="")
                        self.gen_btn.config(state="normal")

                self.root.after(0, update_ui)

            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}\n\n"
                error_msg += f"Traceback:\n{traceback.format_exc()}"
                print(f"ERROR: {error_msg}")
                # Show a user-friendly message
                user_msg = f"Error generating properties: {str(e)}\n\nCheck the terminal for full details."
                self.root.after(0, lambda: messagebox.showerror("Error", user_msg))
                self.root.after(0, self._reset_generate_button)

        threading.Thread(target=task, daemon=True).start()

    def _reset_generate_button(self):
        self.gen_btn.config(state="normal")
        self.loading_label.config(text="")

    def test_policy(self):
        company_name = self.company_entry.get().strip()
        policy = self.policy_text.get("1.0", tk.END).strip()

        if not company_name or not policy:
            messagebox.showwarning("Input Error", "Company name and policy cannot be empty.")
            return

        prop_values = {}
        for prop, entry in self.prop_entries.items():
            value = entry.get().strip()
            if not value:
                messagebox.showwarning("Input Error", f"Value for {prop} cannot be empty.")
                return
            prop_values[prop] = value

        # Disable button and show loading
        self.test_btn.config(state="disabled")
        self.loading_label.config(text="Testing policy...")
        self.result_label.config(text="")
        # Clear status indicator
        self.status_indicator.config(text="", bg="SystemButtonFace")
        # Clear output text area
        self.output_text.delete("1.0", tk.END)
        self.output_text.insert("1.0", "Running test...\n")

        def task():
            try:
                # First, try to import the required modules
                try:
                    from OCL import (
                        setup_database,
                        get_or_create_company_id,
                        insert_policy,
                        generate_ocl_constraint,
                        generate_policy_test_file,
                        extract_properties
                    )
                except ImportError as import_err:
                    error_msg = f"Failed to import OCL module: {str(import_err)}\n\n"
                    error_msg += "Please ensure all dependencies are installed:\n"
                    error_msg += "pip install besser bocl\n\n"
                    error_msg += f"Full error: {traceback.format_exc()}"
                    print(f"IMPORT ERROR: {error_msg}")
                    self.root.after(0, lambda: messagebox.showerror("Import Error", error_msg))
                    self.root.after(0, self._reset_test_button)
                    return
                
                try:
                    from groq import Groq
                except ImportError as import_err:
                    error_msg = f"Failed to import groq: {str(import_err)}\n\n"
                    error_msg += "Please install: pip install groq"
                    print(f"IMPORT ERROR: {error_msg}")
                    self.root.after(0, lambda: messagebox.showerror("Import Error", error_msg))
                    self.root.after(0, self._reset_test_button)
                    return

                api_key = os.getenv("GROQ_API_KEY")
                if not api_key:
                    self.root.after(0, lambda: messagebox.showerror("Error", "GROQ_API_KEY not found in environment variables.\n\nPlease create a .env file with:\nGROQ_API_KEY=your_api_key_here"))
                    self.root.after(0, self._reset_test_button)
                    return

                client = Groq(api_key=api_key)

                # Setup DB and insert policy
                setup_database()
                company_id = get_or_create_company_id(company_name)
                if not company_id:
                    self.root.after(0, lambda: messagebox.showerror("Error", "Failed to create or retrieve company."))
                    self.root.after(0, self._reset_test_button)
                    return
                    
                ocl_code = generate_ocl_constraint(policy, client)
                if not ocl_code or not ocl_code.strip():
                    self.root.after(0, lambda: messagebox.showerror("Error", "Failed to generate OCL constraint. Please check your API key and try again."))
                    self.root.after(0, self._reset_test_button)
                    return
                    
                policy_id = insert_policy(company_id, policy, ocl_code, "Uncategorized", [])

                if not policy_id:
                    self.root.after(0, lambda: messagebox.showerror("Error", "Failed to save policy to database."))
                    self.root.after(0, self._reset_test_button)
                    return

                # Generate test file with values
                test_file = generate_policy_test_file(
                    policy_id, company_name, policy, ocl_code, client, prop_values, self.prop_types
                )

                if not test_file:
                    self.root.after(0, lambda: messagebox.showerror("Error", "Failed to generate test file."))
                    self.root.after(0, self._reset_test_button)
                    return

                # Execute the test file
                try:
                    result = subprocess.run(
                        [sys.executable, test_file],
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    
                    output = result.stdout + result.stderr
                    print(f"Test execution output:\n{output}")
                    
                    # Check if test passed
                    test_passed = "[PASS] Constraint PASSED" in output or "Policy evaluation result: True" in output
                    
                    def update_result():
                        # Clear and display test output in text area
                        self.output_text.delete("1.0", tk.END)
                        self.output_text.insert("1.0", output)
                        
                        # Color code the output based on result
                        if test_passed:
                            # Show VALID status
                            self.status_indicator.config(
                                text="[VALID]",
                                fg="green",
                                bg="lightgreen"
                            )
                            self.result_label.config(
                                text=f"Policy #{policy_id} PASSED! The entered values meet the policy requirements.\nTest file: {test_file}",
                                fg="green"
                            )
                            # Highlight PASS messages in green
                            self._highlight_text("[PASS]", "green")
                            self._highlight_text("PASSED", "green")
                        else:
                            # Show INVALID status
                            self.status_indicator.config(
                                text="[INVALID]",
                                fg="red",
                                bg="lightcoral"
                            )
                            self.result_label.config(
                                text=f"Policy #{policy_id} FAILED! The entered values do NOT meet the policy requirements.\nTest file: {test_file}",
                                fg="red"
                            )
                            # Highlight FAIL messages in red
                            self._highlight_text("[FAIL]", "red")
                            self._highlight_text("FAILED", "red")
                        
                        # Highlight key phrases
                        self._highlight_text("Policy evaluation result:", "blue")
                        self._highlight_text("True", "green")
                        self._highlight_text("False", "red")
                        
                        # Scroll to bottom to show latest output
                        self.output_text.see(tk.END)
                        
                        self.loading_label.config(text="")
                        self.test_btn.config(state="normal")
                    
                    self.root.after(0, update_result)
                    
                except subprocess.TimeoutExpired:
                    self.root.after(0, lambda: messagebox.showerror("Error", "Test execution timed out."))
                    self.root.after(0, self._reset_test_button)
                except Exception as e:
                    error_msg = f"Error executing test: {str(e)}\n\n"
                    error_msg += f"Traceback:\n{traceback.format_exc()}"
                    print(f"ERROR executing test: {error_msg}")
                    user_msg = f"Error executing test: {str(e)}\n\nCheck the terminal for full details."
                    self.root.after(0, lambda: messagebox.showerror("Error", user_msg))
                    self.root.after(0, self._reset_test_button)

            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}\n\n"
                error_msg += f"Traceback:\n{traceback.format_exc()}"
                print(f"ERROR: {error_msg}")
                # Show a user-friendly message
                user_msg = f"Error testing policy: {str(e)}\n\nCheck the terminal for full details."
                self.root.after(0, lambda: messagebox.showerror("Error", user_msg))
                self.root.after(0, self._reset_test_button)

        threading.Thread(target=task, daemon=True).start()

    def _reset_test_button(self):
        self.test_btn.config(state="normal")
        self.loading_label.config(text="")
    
    def _highlight_text(self, pattern, color):
        """Highlight specific text patterns in the output text area."""
        start = "1.0"
        while True:
            pos = self.output_text.search(pattern, start, tk.END)
            if not pos:
                break
            end = f"{pos}+{len(pattern)}c"
            self.output_text.tag_add(pattern, pos, end)
            self.output_text.tag_config(pattern, foreground=color, font=("Consolas", 9, "bold"))
            start = end

# Run the app
if __name__ == "__main__":
    # Check for critical imports before starting GUI
    try:
        import besser
        import bocl
        import groq
        print("✓ All required modules are available")
    except ImportError as e:
        print(f"✗ Missing required module: {e}")
        print("\nPlease install missing dependencies:")
        print("  pip install besser bocl groq")
        print("\nOr install from requirements.txt:")
        print("  pip install -r requirements.txt")
        root = tk.Tk()
        root.withdraw()  # Hide main window
        messagebox.showerror(
            "Missing Dependencies",
            f"Missing required module: {e}\n\n"
            "Please install dependencies:\n"
            "pip install besser bocl groq\n\n"
            "Or: pip install -r requirements.txt"
        )
        root.destroy()
        sys.exit(1)
    
    root = tk.Tk()
    app = PolicyApp(root)
    root.mainloop()
