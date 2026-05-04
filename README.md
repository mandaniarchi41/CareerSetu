# CareerSetu 🚀

CareerSetu is an AI-powered career guidance and study planning platform designed to help users navigate their educational and professional journeys. It leverages advanced LLMs (Gemini & OpenAI) to generate intelligent study plans, analyze skills from resumes, provide tailored learning paths, and offer mentorship.

## 🌟 Key Features

- **Intelligent Study Planner**: AI-driven task generation that creates daily schedules aligning with user goals. Includes an interactive planner with category and time selections.
- **AI Career & Learning Paths**: Generate customized roadmaps and skill reviews utilizing Gemini and OpenAI.
- **Resume Parsing & Skill Review**: Upload your resume/profile to extract skills and receive immediate AI-powered feedback on your career trajectory.
- **Interactive Dashboard**: A holistic view of your progress, pending tasks, and upcoming milestones.
- **Advanced Analytics**: Visual representations of learning progress using Recharts.
- **Engaging UI/UX**: Built with a modern tech stack incorporating Framer Motion animations and interactive Spline 3D elements for a premium feel.
- **State-Specific Schemes**: Access state-specific educational and career schemes to explore opportunities tailored to your region.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19, Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **Routing:** React Router v7
- **3D & Visuals:** Spline 3D (`@splinetool/react-spline`)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Network:** Axios

### Backend
- **Framework:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JWT, bcryptjs
- **AI Integrations:** Google Generative AI (Gemini), OpenAI API
- **Utilities:** Multer (File uploads), PDF-Parse (Resume reading)

## 📁 Project Structure

```text
CareerSetu/
├── client/                 # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Reusable UI components (Navbar, Sidebar)
│   │   ├── context/        # React Context providers
│   │   ├── pages/          # Application views (Dashboard, Planner, LearningPath, etc.)
│   │   ├── services/       # API call handlers
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Backend application
│   ├── config/             # DB and Environment config
│   ├── controllers/        # Route logic (aiController, plannerController, etc.)
│   ├── data/               # Static/Mock data
│   ├── middleware/         # Auth and validation middlewares
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express API routes
│   ├── utils/              # Helper functions (openai.js, etc.)
│   ├── server.js           # Entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/atlas/database) account and connection URI
- API Keys for **Google Gemini** and/or **OpenAI**

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd CareerSetu
```

### 2. Backend Setup

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# .env example
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

Start the backend server:

```bash
# For development with nodemon
npm run dev

# OR for production
npm start
```

### 3. Frontend Setup

Open a new terminal, navigate to the `client` directory, and install dependencies:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend application will be running at `http://localhost:5173` (or the port Vite provides).

## 📡 API Endpoints Overview

- **Auth (`/api/auth`)**: Login, Signup, Verify token.
- **Profile (`/api/profile`)**: Manage user profile data, upload/parse resume.
- **AI (`/api/ai`)**: Endpoints interfacing with Gemini/OpenAI for learning paths.
- **Planner (`/api/planner`)**: Manage AI-generated and custom study schedules.
- **Progress (`/api/progress`)**: Track user progress metrics.
- **Analytics (`/api/analytics`)**: Fetch formatted data for charting.

## 🤝 Contributing
Contributions are welcome! Please create an issue to discuss the change you want to make before submitting a pull request.
