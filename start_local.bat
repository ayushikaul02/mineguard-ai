@echo off
title MineGuard AI — Localhost Launcher
echo ======================================================================
echo           MineGuard AI: Intelligent Mine Governance System
echo                 Localhost Execution Launcher
echo ======================================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "MineGuard AI Backend (FastAPI)" cmd /k ".\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 >nul

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
cd frontend
start "MineGuard AI Frontend (Vite)" cmd /k "npm run dev"

echo.
echo ======================================================================
echo  Both servers have been launched!
echo  Opening MineGuard AI in your default web browser...
echo.
echo  Frontend URL : http://localhost:5173
echo  Backend Docs : http://127.0.0.1:8000/docs
echo ======================================================================
timeout /t 3 >nul
start http://localhost:5173
