# Personal Learning Path Generator

A full-stack web application that generates personalized learning paths using AI. Users can input their skills, career goals, and learning style to receive a tailored roadmap powered by the Google Gemini API, with progress tracking and community features.

## 🌟 Features

- **User Authentication**: Secure registration and login system using JWT tokens
- **Skill Assessment**: Interactive form to input skills, career goals, and learning preferences
- **AI-Powered Learning Paths**: Leverages Google Gemini API to create personalized learning roadmaps
- **Curated Resources**: Integration with free learning platforms (freeCodeCamp, Coursera, Khan Academy)
- **Progress Tracking**: Mark milestones as complete and visualize your learning journey
- **Study Groups**: Join or create community study groups for collaborative learning (coming soon)
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **Visual Analytics**: Progress visualization with Chart.js (planned feature)

## 🛠️ Tech Stack

### Frontend
- **React** - Modern JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Chart.js** - Data visualization library (planned implementation)

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB Atlas** - Cloud-based NoSQL database
- **JWT** - JSON Web Tokens for secure authentication

### AI & APIs
- **Google Gemini API** - Advanced AI for generating personalized learning paths

### Development Tools
- **Postman** - API development and testing
- **Git & GitHub** - Version control and collaboration
- **npm** - Package management

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** - [Create account](https://www.mongodb.com/atlas)
- **Google Gemini API Key** - [Get API key](https://ai.google.dev/)
- **Postman** (optional, for API testing) - [Download here](https://www.postman.com/)

### 📥 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Umeshinduranga/personal-learning-path.git
cd personal-learning-path
```

#### 2. Install Dependencies
```bash
# Install both client and server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

#### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/learning_path

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### 4. Start the Application
```bash
# Start both frontend and backend with a single command
npm run dev
```

The application will automatically:
- Start the backend server on `http://localhost:5000`
- Launch the React frontend on `http://localhost:3000`
- Open your default browser to the application

You should see output similar to:
```
[server] Server running on port 5000
[server] Connected to MongoDB
[client] Compiled successfully!
[client] Local: http://localhost:3000
```

## 📖 Usage

### Getting Started with the Application

1. **Access the App**: Navigate to `http://localhost:3000` (opens automatically)
2. **Register/Login**: Create an account or sign in to access personalized features
3. **Complete Assessment**: Fill out the comprehensive assessment form including:
   - Current technical skills
   - Career aspirations
   - Preferred learning style
   - Available time commitment
4. **Generate Learning Path**: Receive a customized learning roadmap with:
   - Step-by-step milestones
   - Curated free resources
   - Estimated completion times
5. **Track Progress**: Mark completed milestones and monitor your learning journey
6. **Join Community**: Connect with study groups and fellow learners (coming soon)

### API Testing with Postman

If you want to test the API endpoints directly:

#### User Registration
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

#### User Login
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Submit Learning Assessment
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/assessment/submit`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body**:
```json
{
  "currentSkills": ["JavaScript", "HTML", "CSS"],
  "careerGoals": "Full-Stack Web Developer",
  "learningStyle": "visual",
  "timeCommitment": "10 hours per week",
  "experience": "beginner"
}
```

## 📁 Project Structure

```
personal-learning-path/
├── 📁 server/                 # Backend code
│   ├── 📁 models/             # MongoDB schemas (User, Group)
│   ├── 📁 routes/             # API routes (auth, assessment, community)
│   ├── 📁 services/           # Resource fetching logic
│   └── 📄 server.js           # Main server file
├── 📁 client/                 # Frontend code
│   ├── 📁 src/                # React components and pages
│   │   ├── 📁 components/     # Reusable components (forms, results, etc.)
│   │   ├── 📄 App.js          # Main app component
│   │   └── 📄 index.js        # React entry point
│   ├── 📁 public/             # Static assets
│   └── 📄 package.json        # Client dependencies
├── 📄 .env                    # Environment variables (root level)
├── 📄 package.json            # Main package.json with start scripts
└── 📄 README.md               # Project documentation
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication

### Assessment Routes (`/api/assessment`)
- `POST /submit` - Submit skill assessment and generate learning path

## 🔧 Development Scripts

```bash
# Start both client and server in development mode
npm start

# Start only the server
npm run server

# Start only the client
npm run client

# Install dependencies for both client and server
npm run install-all

# Build client for production
npm run build
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/yourusername/personal-learning-path.git
   ```
3. **Create** a new branch for your feature:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

### Making Changes
1. **Install** dependencies: `npm install`
2. **Make** your changes following our coding standards
3. **Test** your changes by running `npm start`
4. **Commit** your changes with descriptive messages:
   ```bash
   git commit -m "Add: Implement user progress visualization"
   ```

### Submitting Changes
1. **Push** your changes to your fork:
   ```bash
   git push origin feature/amazing-new-feature
   ```
2. **Create** a Pull Request with a clear description of your changes
3. **Wait** for review and address any feedback

### Development Guidelines
- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 🛣️ Roadmap

### Current Implementation
- ✅ User authentication system
- ✅ Skill assessment form with personalized input fields
- ✅ AI-powered learning path generation using Google Gemini API
- ✅ Responsive React frontend with Tailwind CSS
- ✅ Integrated frontend/backend deployment

### Planned Features
- 📋 Progress tracking with milestone completion
- 📋 Visual progress charts using Chart.js
- 📋 Community study groups functionality
- 📋 Enhanced resource recommendations and filtering
- 📋 Mobile app development

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Umeshinduranga/personal-learning-path/issues) section
2. Create a new issue with detailed information
3. Contact the maintainer: [umeshinduranga123@gmail.com](umeshinduranga123@gmail.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini API** for powerful AI capabilities
- **freeCodeCamp** for educational content inspiration
- **Open Source Community** for amazing tools and libraries
- **Contributors** who help make this project better

## 🔗 Links

- Live Demo (coming soon)
- [Documentation](https://github.com/Umeshinduranga/personal-learning-path/wiki)
- [Report Bug](https://github.com/Umeshinduranga/personal-learning-path/issues)
- [Request Feature](https://github.com/Umeshinduranga/personal-learning-path/issues)

---

⭐ **Star this repository if you find it helpful!** ⭐
