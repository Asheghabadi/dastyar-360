import sys
import os
import traceback

# Add the current directory to the path just in case
sys.path.insert(0, os.getcwd())

print("--- Starting Import Debugger ---")
print(f"Current Directory: {os.getcwd()}")
print("-" * 40)

try:
    print("Attempting: 'from app.main import app'...")
    from app.main import app
    print("\n[SUCCESS] Module 'app.main' imported successfully.")
    print("The application object 'app' was found.")
    print("This is very good news! The code itself seems correct.")

except Exception as e:
    print("\n[FAILURE] An error occurred during the import process.")
    print("This is the root cause of the Uvicorn error. See the full traceback below:")
    print("-" * 40)
    traceback.print_exc()
    print("-" * 40)
