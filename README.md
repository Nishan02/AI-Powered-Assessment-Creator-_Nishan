# VedaAI – Assessment Creator Platform

An intelligent assessment generation platform that enables educators to create, manage, and distribute AI-powered question papers with minimal effort.

## Overview

VedaAI streamlines the assessment creation workflow by combining modern web technologies with AI-powered content generation. Teachers can upload reference materials, specify question parameters, and receive auto-generated, structured question papers ready for classroom use.

**Key Capabilities:**
- Quick assignment creation with file uploads (PDF/Text)
- AI-powered question generation with structured sections
- Real-time progress tracking via WebSocket
- Organized question papers with difficulty levels and marks allocation
- Responsive design for desktop and mobile devices

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
VedaAI_Nishan_Raj_Regmi/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/            # Pages and layouts
│   │   ├── components/     # Reusable UI components
│   │   │   ├── AssignmentForm.tsx
│   │   │   ├── AssignmentList.tsx
│   │   │   ├── OutputPaper.tsx
│   │   │   └── ...other components
│   │   └── store/          # Zustand state management
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                # Express.js API
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── config/         # Configuration (Redis, queues)
│   │   ├── controllers/    # API route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic (AI, PDF)
│   │   └── workers/        # BullMQ job processors
│   ├── uploads/            # User-uploaded files
│   └── package.json
│
└── uploads/                # Root uploads directory
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis server
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd frontend && npm install
cd ../backend && npm install
```

2. **Configure Backend**

Create `.env` file in `backend/`:
```
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

3. **Configure Frontend**

Ensure `AssignmentForm.tsx` and services use the correct API endpoint:
```
http://localhost:5000/api
```

### Running Locally

**Start MongoDB & Redis:**
```bash
# MongoDB
mongod

# Redis (in another terminal)
redis-server
```

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

## Architecture & Flow

### Assignment Creation Flow
1. Teacher fills the assignment form (file, due date, question config)
2. Frontend validates input and sends POST request to backend
3. Backend stores assignment metadata in MongoDB
4. BullMQ job is enqueued with assignment details
5. Worker service processes the job:
   - Extracts content from uploaded file
   - Structures a detailed prompt for AI model
   - Generates question paper
   - Stores generated questions in MongoDB
6. WebSocket notifies frontend of completion
7. Teacher views and can regenerate if needed

### Real-time Updates
- WebSocket connection established on page load
- Assignment status updates pushed to frontend
- Eliminates polling overhead
- Smooth user experience during processing

### State Management
- **Global State (Zustand):** Assignments list, view mode, authentication
- **Local State (React):** Form inputs, filter/sort in lists
- **Server State:** Persisted in MongoDB

## Key Features Implemented

### 1. Assignment Management
- Create assignments with custom parameters
- Store and retrieve from MongoDB
- Delete with confirmation
- Real-time list updates

### 2. AI Generation
- Convert user input to structured prompts
- Generate sections (A, B, etc.)
- Assign difficulty levels (Easy/Moderate/Hard)
- Calculate per-question marks
- Queue-based processing to prevent blocking

### 3. Output Paper
- Clean, exam-paper-like formatting
- Section-based organization
- Question display with metadata
- Responsive layout for printing

### 4. Mobile & Desktop Responsive
- Sidebar navigation on desktop
- Bottom navigation on mobile
- Optimized touch interactions
- Appropriate hiding of non-essential UI elements

## API Endpoints

### Assignment Management
- `GET /api/assignments?ownerId={id}` - List user assignments
- `POST /api/assignments` - Create new assignment
- `GET /api/assignments/{id}` - Get assignment details
- `DELETE /api/assignments/{id}` - Remove assignment

### File Upload
- `POST /api/assignments` - Supports multipart file upload

## Database Schema

### Assignment Document
```javascript
{
  _id: ObjectId,
  title: String,
  className: String,
  createdAt: Date,
  dueDate: Date,
  ownerId: String,
  status: String, // "pending", "processing", "completed", "failed"
  sections: Array,
  questionTypes: Array,
  totalQuestions: Number,
  totalMarks: Number,
  additionalInstructions: String,
  filePath: String
}
```

## Deployment Notes

### Backend Deployment
- Ensure Redis and MongoDB are accessible from server
- Set environment variables (API keys, DB URIs)
- Use production-grade process manager (PM2)
- Configure CORS for frontend domain

### Frontend Deployment
- Build with `npm run build`
- Deploy to Vercel, Netlify, or custom Node server
- Update API endpoint in configuration
- Ensure WebSocket endpoint matches backend

## Development Workflow

1. **Feature Development**
   - Create feature branch
   - Make changes in frontend/backend
   - Test locally with dev servers
   - Commit with clear messages

2. **Testing**
   - Manual testing on different screen sizes
   - Test assignment creation flow end-to-end
   - Verify PDF generation (if implemented)
   - Check real-time updates

3. **Code Quality**
   - Follow TypeScript strict mode
   - Use consistent formatting (Prettier)
   - Remove console logs before commit

## Known Limitations & Future Improvements

### Current Scope
- Single AI model integration (can be extended)
- File uploads stored locally (consider S3 for production)
- No user authentication system (basic session management)

### Potential Enhancements
- PDF export with proper formatting
- Advanced caching strategies
- User authentication and authorization
- Multiple LLM provider support
- Question bank management
- Analytics dashboard
- Batch processing

## Troubleshooting

**WebSocket Connection Issues**
- Verify backend is running on port 5000
- Check browser console for connection errors
- Ensure frontend API endpoint is correct

**Database Connection Failed**
- Confirm MongoDB is running
- Check MONGODB_URI in .env
- Verify network access if using MongoDB Atlas

**File Upload Issues**
- Check file size limits
- Verify uploads directory exists with write permissions
- Confirm multer configuration in backend

**Redis Connection Problems**
- Ensure Redis server is running
- Check REDIS_URL connection string
- Verify port 6379 is accessible

## Contributing

When contributing:
1. Keep changes focused and well-documented
2. Test thoroughly before submitting
3. Follow the existing code style
4. Update this README if adding major features

## License

This project is part of a hiring assignment and is not for public distribution.

---

**Questions or Issues?** Review the codebase structure and check backend logs for detailed error information.