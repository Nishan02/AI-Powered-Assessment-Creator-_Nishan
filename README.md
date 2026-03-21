# VedaAI – Assessment Creator Platform

An intelligent assessment generation platform that enables educators to create, manage, and distribute AI-powered question papers with minimal effort.

## Overview

VedaAI enables teachers to create AI-powered question papers quickly. Upload reference materials, configure question parameters, and the system generates organized, structured question papers automatically.

**Core Capabilities:**
- Assignment creation with file uploads
- AI-powered question generation  
- Real-time progress tracking
- Organized output with difficulty levels and marks
- Mobile and desktop responsive design

## Tech Stack

### Frontend
- **Framework:** Next.js 15+ with TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Real-time Updates:** WebSocket

### Backend
- **Runtime:** Node.js with Express.js (TypeScript)
- **Database:** MongoDB (assignments, questions, metadata)
- **Cache Layer:** Redis (job state, temporary data)
- **Job Queue:** BullMQ (background processing)
- **File Storage:** Local file uploads
- **AI Integration:** Structured prompt engineering

### DevOps & Tools
- **Package Manager:** npm / yarn
- **Build Tool:** TypeScript compiler
- **Port Configuration:** Frontend (3000), Backend (5000)

## Project Structure

```
VedaAI/
├── frontend/              # Next.js + TypeScript
│   ├── src/app/          # Pages and layouts
│   ├── src/components/   # React components
│   └── src/store/        # Zustand state management
├── backend/              # Express.js + Node.js
│   ├── src/controllers/  # API handlers
│   ├── src/models/       # MongoDB schemas
│   ├── src/services/     # Business logic (AI, PDF)
│   └── src/workers/      # BullMQ job processors
└── uploads/              # User uploaded files
```

## Getting Started

### Prerequisites
- Node.js 18+, MongoDB, Redis, npm/yarn

### Installation

1. **Install dependencies:**
```bash
cd frontend && npm install
cd ../backend && npm install
```

2. **Configure backend (.env):**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key
```

3. **Configure frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running Locally

1. **Start MongoDB and Redis** (if using local instances)

2. **Terminal 1: Backend**
```bash
cd backend && npm run dev
```
Backend will run on `http://localhost:5000`

3. **Terminal 2: Frontend**
```bash
cd frontend && npm run dev
```
Frontend will run on `http://localhost:3000`

**Important:** The frontend uses `NEXT_PUBLIC_API_URL` from `.env.local` to connect to the backend. Make sure it's set to `http://localhost:5000` for local development.

## How It Works

**Assignment Creation Flow:**
1. Teacher submits form with file, due date, and question parameters
2. Backend validates and stores assignment in MongoDB
3. BullMQ job added to queue for AI processing
4. Worker extracts file content, structures prompt, and calls LLM
5. Generated questions stored in database
6. WebSocket notifies frontend of completion
7. Teacher views and approves the question paper

**Key Technologies:**
- MongoDB for persistent storage
- Redis for caching and job state management
- BullMQ for background job processing
- WebSocket for real-time status updates
- LLM API for question generation

## Key Features Implemented

- **Assignment Management:** Create, store, delete, and search assignments with real-time updates
- **AI Question Generation:** Converts user input into structured prompts, generates questions with difficulty levels and marks
- **Output Paper:** Clean, organized question paper with sections, difficulty badges, and student info
- **Real-time WebSocket:** Live status updates during question processing
- **Mobile & Desktop:** Fully responsive design with adaptive navigation
- **State Management:** Zustand for global state across app components

## API Endpoints

- `GET /api/assignments?ownerId={id}` - List assignments
- `POST /api/assignments` - Create assignment
- `DELETE /api/assignments/{id}` - Delete assignment

## Database Schema

**Assignment Collection:**
```javascript
{
  title, className, dueDate, ownerId,
  status: "pending|processing|completed|failed",
  sections: Array<{title, questions}>,
  totalQuestions, totalMarks, createdAt
}
```

## Deployment

- Set environment variables for API keys and database URIs
- Ensure MongoDB, Redis accessible from server
- Frontend: `npm run build` and deploy to Vercel or Node server
- Backend: Deploy with PM2 or Docker
- Update API endpoints in frontend config

## Development

- Use TypeScript strict mode
- Format code with Prettier
- Test on desktop and mobile before committing
- Keep changes focused and well-documented

## Troubleshooting

**Failed to fetch assignments error:**
- Ensure backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local` is set to `http://localhost:5000`
- Check that frontend and backend are on the same machine or network
- Clear browser cache and refresh the page

**MongoDB connection failed:**
- Ensure MongoDB service is running
- Check `MONGO_URI` in backend `.env` is correct
- Verify database credentials if using cloud MongoDB

**Redis connection failed:**
- Ensure Redis service is running
- Check `REDIS_URL` in backend `.env` is correct

## Future Enhancements

- PDF export with proper formatting
- User authentication and authorization
- Multiple LLM provider support
- Question bank management
- Advanced analytics dashboard

## Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket connection failed | Verify backend running on port 5000, check frontend API endpoint |
| MongoDB connection error | Ensure MongoDB is running, check MONGODB_URI in .env |
| File upload fails | Check file size limits, verify uploads directory exists |
| Redis connection error | Ensure Redis is running on port 6379, check REDIS_URL |

---

Questions? Check the codebase and backend logs for debugging.