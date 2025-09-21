# 🎨 ArtisanAI - AI-Powered Storytelling Platform

A modern full-stack web application that empowers craft enthusiasts and storytellers to create, translate, and share their stories using cutting-edge AI technology. Built with React, Node.js, and Google Cloud AI services.

## 🔗 Live Demo

- **Frontend**: [https://artisanai-omega.vercel.app](https://artisanai-omega.vercel.app)
- **Backend API**: [https://artisanai-production.up.railway.app](https://artisanai-production.up.railway.app)

## ✨ Features

- **🎤 Voice-to-Text**: Convert speech to text using Google Cloud Speech-to-Text
- **🌍 Multi-language Translation**: Translate stories to multiple languages using Google Cloud Translation
- **📱 Responsive Design**: Beautiful, modern UI built with React and Tailwind CSS
- **🔐 User Authentication**: Secure JWT-based authentication system
- **💾 Story Management**: Save, edit, and manage your stories
- **📤 Export Functionality**: Export translations as text files
- **🎯 Real-time Processing**: Fast and efficient AI-powered features

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Cloud APIs** (Speech-to-Text, Translation)
- **Winston** for logging
- **Helmet** for security

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Google Cloud Platform account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jayansh21/ArtisanAi.git
   cd artisan-ai
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   **Backend (.env)**:
   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
   GOOGLE_CLOUD_KEY_FILE=./your-service-account-key.json
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend (.env.local)**:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Google Cloud Setup**
   - Create a Google Cloud Project
   - Enable Speech-to-Text and Translation APIs
   - Create a service account and download the JSON key
   - Place the key file in the backend directory

5. **Run the application**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```


## 📁 Project Structure

```
artisan-ai/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database and Google Cloud config
│   │   ├── controllers/    # API route handlers
│   │   ├── middleware/     # Authentication, validation
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── tailwind.config.js
└── shared/                 # Shared types and constants
```

## 🛠️ Development

### API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `POST /api/storytelling/translate` - Translate text
- `POST /api/storytelling/speech-to-text` - Convert speech to text
- `GET /api/storytelling/my-stories` - Get user stories


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Google Cloud Platform for AI services
- MongoDB Atlas for database hosting
- Vercel and Railway for deployment platforms
- The open-source community for amazing tools and libraries

---

**Made with ❤️ by [Jayansh Jain](https://github.com/Jayansh21)**
