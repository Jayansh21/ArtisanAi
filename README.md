# 🎨 ArtisanAI - AI-Powered Storytelling Platform

A full-stack web application that enables users to create, translate, and share stories using AI-powered translation and voice-to-text features.

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
   git clone https://github.com/your-username/artisan-ai.git
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

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variable: `REACT_APP_API_URL`

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set root directory to `backend`
3. Add environment variables from your `.env` file
4. Upload your Google Cloud service account key

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Cloud Platform for AI services
- MongoDB Atlas for database hosting
- Vercel and Railway for deployment platforms
- The open-source community for amazing tools and libraries