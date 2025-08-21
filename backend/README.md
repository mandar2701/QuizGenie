# Quiz Backend (Node.js + Express + MySQL)

## Setup
```bash
cd backend
npm install
cp .env.example .env  # then edit DB creds
# Create DB in MySQL first:
# CREATE DATABASE quizdb;
npm run dev  # or: npm start
```
API:
- `POST /generate-quiz`  -> body: `{ "text": "..." }`
- `GET  /quizzes`        -> returns saved quizzes
