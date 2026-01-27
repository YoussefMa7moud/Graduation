# How to Run the Policy Converter System

**macOS Setup Guide**

This guide will help you run all three components of the policy converter system.

## Components Overview

1. **OCL Python API Server** - Port 5001 (converts policies to OCL)
2. **Spring Boot Backend** - Port 8080 (handles API requests)
3. **React Frontend** - Port 5173 (user interface)

## Step-by-Step Instructions

### Step 1: Start OCL Python API Server

1. **Open a terminal window**

2. **Navigate to the ocl directory:**
   ```bash
   cd /Users/hagaribrahim/Desktop/Graduation/ocl
   ```

3. **Activate your virtual environment:**
   ```bash
   pipenv shell
   ```
   You should see `(hagaribrahim)` in your prompt.

4. **Install dependencies (if not already installed):**
   ```bash
   pip install spacy groq python-dotenv fastapi uvicorn
   python -m spacy download en_core_web_sm
   ```

5. **Create `.env` file (if it doesn't exist):**
   ```bash
   echo "GROQ_API_KEY=your_groq_api_key_here" > .env
   ```
   Replace `your_groq_api_key_here` with your actual Groq API key.

6. **Start the server:**
   ```bash
   uvicorn api_server:app --host 0.0.0.0 --port 5001 --reload
   ```

7. **Verify it's running:**
   - You should see: `INFO: Uvicorn running on http://0.0.0.0:5001`
   - Open browser: `http://localhost:5001`
   - You should see: `{"message": "OCL Policy Converter API", "status": "running"}`

**Keep this terminal window open!**

---

### Step 2: Start Spring Boot Backend

1. **Open a NEW terminal window** (keep the OCL server running)

2. **Navigate to the backend directory:**
   ```bash
   cd /Users/hagaribrahim/Desktop/Graduation/Backend/backend
   ```

3. **Make sure MySQL is running:**
   - Check if MySQL is running on your Mac
   - If not, start it: `brew services start mysql` (if installed via Homebrew)

4. **Start the Spring Boot application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Or if you have Maven installed:
   ```bash
   mvn spring-boot:run
   ```

5. **Verify it's running:**
   - Wait for: `Started BackendApplication in X.XXX seconds`
   - The server should be running on `http://localhost:8080`

**Keep this terminal window open!**

---

### Step 3: Start React Frontend

1. **Open a NEW terminal window** (keep both servers running)

2. **Navigate to the frontend directory:**
   ```bash
   cd /Users/hagaribrahim/Desktop/Graduation/Frontend
   ```

3. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Verify it's running:**
   - You should see: `Local: http://localhost:5173`
   - The browser should automatically open, or manually go to: `http://localhost:5173`

**Keep this terminal window open!**

---

## Quick Start Commands Summary

### Terminal 1 - OCL API Server:
```bash
cd /Users/hagaribrahim/Desktop/Graduation/ocl
pipenv shell
uvicorn api_server:app --host 0.0.0.0 --port 5001 --reload
```

### Terminal 2 - Spring Boot Backend:
```bash
cd /Users/hagaribrahim/Desktop/Graduation/Backend/backend
./mvnw spring-boot:run
```

### Terminal 3 - React Frontend:
```bash
cd /Users/hagaribrahim/Desktop/Graduation/Frontend
npm run dev
```

---

## Using the Policy Converter

1. **Login to the application:**
   - Go to `http://localhost:5173`
   - Login with your company account credentials

2. **Navigate to Policy Converter:**
   - Click on "Policy Converter" in the sidebar

3. **Convert a Policy:**
   - Enter a policy name (e.g., "Return Policy")
   - Select a legal framework
   - Enter policy text (e.g., "No return after 14 days of purchase.")
   - Click "Analyze & Generate Logic"

4. **Save the Policy:**
   - Review the generated OCL code
   - Click "Save as Rule" to save to database

---

## Troubleshooting

### OCL API Server Issues

**Port 5001 already in use:**
```bash
lsof -i :5001
kill -9 <PID>
```

**ModuleNotFoundError:**
- Make sure virtualenv is activated: `pipenv shell`
- Install packages: `pip install spacy groq python-dotenv fastapi uvicorn`

**Can't connect to OCL API:**
- Check if server is running: `http://localhost:5001`
- Verify `.env` file has `GROQ_API_KEY` set

### Backend Issues

**Port 8080 already in use:**
```bash
lsof -i :8080
kill -9 <PID>
```

**Database connection error:**
- Make sure MySQL is running
- Check `application.properties` for correct database credentials

**Can't connect to OCL API:**
- Verify OCL API is running on port 5001
- Check `application.properties` has: `app.ocl.api.url=http://localhost:5001`

### Frontend Issues

**Port 5173 already in use:**
- The dev server will automatically use the next available port
- Or kill the process: `lsof -i :5173` then `kill -9 <PID>`

**401 Unauthorized errors:**
- Make sure you're logged in
- Check if JWT token is valid
- Try logging out and logging back in

**500 Internal Server Error:**
- Check if OCL API server is running
- Check backend logs for detailed error messages
- Verify GROQ_API_KEY is set in `.env` file

---

## Stopping the Servers

To stop each server, go to its terminal window and press:
- **Ctrl + C** (or **Cmd + C** on Mac)

Stop them in this order:
1. Frontend (Ctrl+C)
2. Backend (Ctrl+C)
3. OCL API Server (Ctrl+C)

---

## Verification Checklist

Before using the Policy Converter, verify:

- [ ] OCL API Server is running on `http://localhost:5001`
- [ ] Backend is running on `http://localhost:8080`
- [ ] Frontend is running on `http://localhost:5173`
- [ ] You're logged in to the frontend
- [ ] MySQL database is running
- [ ] `.env` file has `GROQ_API_KEY` set

---

## Need Help?

- Check `ocl/MACOS_SETUP.md` for OCL API setup details
- Check `TROUBLESHOOTING_500_ERROR.md` for backend errors
- Check backend logs for detailed error messages
- Check browser console (F12) for frontend errors
