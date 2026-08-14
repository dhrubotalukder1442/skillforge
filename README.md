# SkillForge

AI-powered web app that analyzes a resume and GitHub profile to detect skill gaps and generate a personalized learning roadmap toward a target job.

## Project Structure

skillforge/
├── frontend/ # Next.js (TypeScript, Tailwind, App Router)
├── backend/ # NestJS (REST API, PostgreSQL, JWT auth)
├── ai-service/ # FastAPI (Python) - skill extraction & roadmap generation
├── database/ # migrations, seed scripts
└── docs/ # project documentation

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** NestJS, PostgreSQL, JWT
- **AI Service:** Python, FastAPI, LLM + embedding models
- **Deployment:** Vercel (frontend), Railway/Render (backend + AI service)

## Running Locally

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Runs on http://localhost:3000

### Backend
\`\`\`bash
cd backend
npm install
npm run start:dev
\`\`\`

### AI Service
\`\`\`bash
cd ai-service
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python main.py
\`\`\`
Runs on http://127.0.0.1:8000

## Status

🚧 In active development.