import sys
import os
import traceback

# Forcefully add the current directory to Python's path
sys.path.insert(0, os.getcwd())

print("--- Advanced Import Debugger ---")
print(f"Current Directory: {os.getcwd()}")
print(f"Python Path being used: {sys.path[:3]} ...\n")

# --- STAGE 1: Find the 'app' package ---
print("--- STAGE 1: Attempting to find the 'app' package ---")
try:
    import app
    print("[SUCCESS] Stage 1: The 'app' package was found and imported.")
    print(f"Location of 'app' package discovered: {app.__file__}\n")
except Exception:
    print("[FAILURE] Stage 1: CRITICAL. Could not find the 'app' package.")
    print("This suggests a fundamental path issue or a missing 'app/__init__.py' file.")
    traceback.print_exc()
    sys.exit()

# --- STAGE 2: Import the 'main' module from 'app' ---
print("--- STAGE 2: Attempting to import the 'main' module from 'app' ---")
try:
    from app import main
    print("[SUCCESS] Stage 2: The 'main.py' module was found inside the 'app' package.")
    print(f"Location of 'main' module discovered: {main.__file__}\n")
except Exception:
    print("[FAILURE] Stage 2: Found the 'app' package, but could not find 'main.py' inside it.")
    print("Please ensure the file 'app/main.py' exists.")
    traceback.print_exc()
    sys.exit()

# --- STAGE 3: Import the FastAPI 'app' object itself (triggers sub-imports) ---
print("--- STAGE 3: Attempting to import the FastAPI 'app' object from 'app.main' ---")
try:
    from app.main import app as fastapi_app
    print("\n[ULTIMATE SUCCESS] The entire application code is importable without errors!")
    print("The problem is likely with Uvicorn's execution environment, not the code itself.")
except Exception:
    print("\n[FAILURE] Stage 3: Found 'app.main', but an error occurred when importing its contents.")
    print("This is the ROOT CAUSE. The error is inside 'app/main.py' or a file that it imports.")
    print("The traceback below will show the exact file and line number of the error:")
    print("-"*50)
    traceback.print_exc()
    print("-"*50)
