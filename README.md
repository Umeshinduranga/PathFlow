Personal Learning Path Generator
 A full-stack web application that generates personalized learning paths using AI. Users can input their skills, career goals, and learning style to receive a tailored roadmap powered by the Google Gemini API, with progress tracking and community features.

 ## Table of Contents
 - [Features](#features)
 - [Tech Stack](#tech-stack)
 - [Installation](#installation)
 - [Usage](#usage)
 - [Project Structure](#project-structure)
 - [Contributing](#contributing)
 - [License](#license)

 ## Features
 - **User Authentication**: Register and log in securely using JWT.
 - **Skill Assessment**: Submit skills, career goals, and learning style to generate a personalized learning path.
 - **AI-Powered Learning Paths**: Uses Google Gemini API to create tailored milestones and free resources (e.g., freeCodeCamp, Coursera).
 - **Progress Tracking**: Mark milestones as complete and visualize progress with Chart.js (coming soon).
 - **Study Groups**: Join or create community study groups (coming soon).
 - **Responsive UI**: Built with React and Tailwind CSS for a modern, user-friendly interface (coming soon).

 ## Tech Stack
 - **Frontend**: React, Tailwind CSS, Chart.js (planned)
 - **Backend**: Node.js, Express
 - **Database**: MongoDB (MongoDB Atlas)
 - **AI**: Open AI API
 - **Authentication**: JSON Web Tokens (JWT)
 - **Tools**: Postman (for testing), Git, GitHub

 ## Installation
 ### Prerequisites
 - Node.js (v16 or higher)
 - MongoDB Atlas account
 - Gemini API
 - Git
 - Postman (for testing)

 ### Server Setup
 1. Clone the repository:
    ```bash
    git clone https://github.com/Umeshinduranga/personal-learning-path.git
    cd personal-learning-path
    ```
 2. Navigate to the server directory and install dependencies:
    ```bash
    cd server
    npm install
    ```
 3. Create a `.env` file in the `server` directory with the following:
    ```env
    MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/learning_path
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_api_key_here
    ```
 4. Start the server:
    ```bash
    npm start
    ```
    You should see:
    ```
    Server running on port 5000
    Connected to MongoDB
    ```

 ### Client Setup (Coming Soon)
 - Instructions for setting up the React client will be added after implementation.

 ## Usage
 1. **Test Server Routes**:
    - Use Postman to test the registration route:
      - Method: `POST`
      - URL: `http://localhost:5000/api/auth/register`
      - Body (JSON):
        ```json
        {
          "email": "test@example.com",
          "password": "password123"
        }
        ```
      - Expected response: `{"message":"User registered"}`
    - Additional routes (`/api/auth/login`, `/api/assessment/submit`) are available for testing.
 2. **Client Usage** (Coming Soon):
    - Log in, complete the skill assessment, and view your AI-generated learning path in the dashboard.

 ## Project Structure
 ```
 personal-learning-path/
 ├── server/                 # Backend code
 │   ├── models/            # MongoDB schemas (User, Group)
 │   ├── routes/            # API routes (auth, assessment, community)
 │   ├── services/          # Resource fetching logic
 │   ├── .env               # Environment variables
 │   └── server.js          # Main server file
 ├── client/                # Frontend code (to be implemented)
 │   ├── src/              # React components and pages
 │   └── package.json      # Client dependencies
 ├── README.md             # Project documentation
 └── package.json          # Project metadata
 ```

 ## Contributing
 Contributions are welcome! To contribute:
 1. Fork the repository.
 2. Create a new branch: `git checkout -b feature/your-feature`.
 3. Make changes and commit: `git commit -m "Add your feature"`.
 4. Push to the branch: `git push origin feature/your-feature`.
 5. Open a pull request.

 Please follow the [Contributing Guide](CONTRIBUTING.md) (to be added).

 ## License
 Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
