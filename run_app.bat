@echo off
echo Starting backend...

REM Go to the backend folder and activate the virtual environment
cd backend
call venv\Scripts\activate

REM Execute FastAPI in a new terminal
start cmd /k "uvicorn main:app --reload"

REM Go to the root folder and start React
cd ..
echo Starting frontend...
npm start
pause