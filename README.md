# AI Quiz Generator — React + Node.js + MySQL

## Backend
```bash
cd backend
npm install
cp .env.example .env  # edit DB creds
# In MySQL:
# CREATE DATABASE quizdb;
npm run dev  # or npm start
```
Backend runs at http://localhost:5000

## Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs at http://localhost:3000

You can change API base by setting `REACT_APP_API_BASE` in `frontend/.env`.
