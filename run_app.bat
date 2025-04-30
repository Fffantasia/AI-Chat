@echo off
echo Iniciando backend con FastAPI...

REM Ir a carpeta del backend y activar entorno virtual
cd backend
call venv\Scripts\activate

REM Ejecutar FastAPI en nueva terminal
start cmd /k "uvicorn main:app --reload"

REM Volver a raíz y lanzar React
cd ..
echo Iniciando frontend con React...
npm start

REM Esperar después de cerrar npm start
pause