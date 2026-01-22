Project

Name: Intervue — Realtime Polling & Chat
Description: Full‑stack realtime polling app with a Vite + React frontend and Express + Socket.IO backend. Frontend lives in the client folder; backend lives in the server folder.
Demo

Frontend (Vercel): https://assesment-intervue1-v5wo.vercel.app/
Backend (Render): https://assesment-intervue1-backend.onrender.com/

Features

Realtime: Poll creation, voting, participant list and chat (Socket.IO).
Persistence: Poll history via REST + MongoDB.
Roles: Teacher and Student flows (kick, session join).

Repository Layout

Client: client — React + Vite app. Key files: useSocket.ts:1-20, TeacherHistory.tsx:1-80, vite.config.ts:1-20.
Server: server — Express + Socket.IO. Key files: env.ts:1-20, app.ts:1-40, index.ts:1-40.
Local env: .env (local only — not checked into repo).

Prerequisites

Node: v18+ recommended.
Package manager: npm.
Database: MongoDB (Atlas or local).
