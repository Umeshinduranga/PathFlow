import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import LearningPath from "../server/models/LearningPath.js";
import authRoutes from "../server/routes/auth.js";
import dashboardRoutes from "../server/routes/dashboard.js";
import profileRoutes from "../server/routes/profile.js";
import pathsRoutes from "../server/routes/paths.js";
import { optionalAuthMiddleware } from "../server/middleware/auth.js";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// API-specific rate limiting for AI generation
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 AI requests per minute
  message: "AI generation limit exceeded. Please wait a moment."
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with graceful handling
let isMongoConnected = false;

const connectMongoDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("⚠️ MONGO_URI not provided - running without database");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    isMongoConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("⚠️ MongoDB connection failed:", err.message);
    console.log("🔄 Server will continue running without database functionality");
    isMongoConnected = false;
  }
};

// Connect to MongoDB (non-blocking)
connectMongoDB();

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.log('⚠️ MongoDB disconnected - database features unavailable');
});

mongoose.connection.on('reconnected', () => {
  isMongoConnected = true;
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  isMongoConnected = false;
  console.error('⚠️ MongoDB error:', err.message);
});

// Setup Gemini AI client with error handling
let model;
let openaiClient;
let useDirectGeminiAPI = false;

// Function to call Gemini REST API directly
async function callGeminiDirectly(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
  
  // Try different API endpoints
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
  ];
  
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.log(`⚠️ API endpoint failed: ${url.includes('/v1/') ? 'v1' : 'v1beta'}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        return text;
      }
      
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.log(`⚠️ Endpoint ${url.includes('/v1/') ? 'v1' : 'v1beta'} error: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('All Gemini API endpoints failed');
}

const initializeGemini = async () => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
      console.log("⚠️ GEMINI_API_KEY not set - AI features will be unavailable");
      return;
    }

    console.log("🔧 Attempting to initialize Gemini AI...");
    console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
    
    // Test with direct API first
    try {
      const testPrompt = "Say 'Hello'";
      const result = await callGeminiDirectly(testPrompt);
      console.log("✅ Gemini Direct API test successful");
      useDirectGeminiAPI = true;
      return;
    } catch (directError) {
      console.log("⚠️ Direct API failed, trying SDK...");
    }

    // Fallback to SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
    model = genAI.getGenerativeModel({ model: modelName });
    
    // Test the model
    const testResult = await model.generateContent("Say 'Hello'");
    const response = await testResult.response;
    const text = response.text();
    
    console.log(`✅ Gemini AI initialized with model: ${modelName}`);
    console.log(`📝 Test response: ${text.substring(0, 50)}...`);
  } catch (error) {
    console.error("❌ Failed to initialize Gemini AI:", error.message);
    console.log("🔧 Tip: Verify your API key at https://makersuite.google.com/app/apikey");
    console.log("🔄 Server will continue without AI features");
    model = null;
  }
};

// Initialize AI on startup
initializeGemini();

// Initialize OpenAI if key is available
if (process.env.OPENAI_API_KEY) {
  try {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI client initialized");
  } catch (error) {
    console.error("⚠️ OpenAI initialization failed:", error.message);
  }
}

// Health check endpoint - must be before routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    gemini: (model !== null || useDirectGeminiAPI) ? 'initialized' : 'not available',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    env: process.env.NODE_ENV,
    mongodb: isMongoConnected
  });
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/paths", pathsRoutes);

// AI Generation endpoint
app.post("/api/generate", aiLimiter, optionalAuthMiddleware, async (req, res) => {
  try {
    const { topic, description, timeframe, difficulty, preferredStyle } = req.body;

    // Validate input
    if (!topic || topic.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Topic is required",
      });
    }

    // Check if AI is available
    if (!model && !useDirectGeminiAPI && !openaiClient) {
      return res.status(503).json({
        success: false,
        error: "AI service is not available. Please check API configuration.",
      });
    }

    const prompt = `Create a comprehensive learning path for: ${topic}
${description ? `\nDescription: ${description}` : ""}
${timeframe ? `\nTimeframe: ${timeframe}` : ""}
${difficulty ? `\nDifficulty Level: ${difficulty}` : ""}
${preferredStyle ? `\nPreferred Learning Style: ${preferredStyle}` : ""}

Generate a detailed, structured learning path in JSON format with the following structure:
{
  "title": "Learning Path Title",
  "description": "Brief overview",
  "estimatedDuration": "X weeks/months",
  "difficulty": "beginner/intermediate/advanced",
  "milestones": [
    {
      "title": "Milestone Title",
      "description": "What you'll learn",
      "duration": "X weeks",
      "resources": [
        {
          "title": "Resource Title",
          "type": "video/article/course/book/practice",
          "url": "https://example.com or 'Search for...'",
          "description": "Brief description"
        }
      ],
      "skills": ["skill1", "skill2"]
    }
  ],
  "prerequisites": ["prerequisite1", "prerequisite2"],
  "outcomes": ["outcome1", "outcome2"]
}

Important: Return ONLY valid JSON, no markdown formatting, no additional text.`;

    let generatedText;

    try {
      // Try Direct Gemini API first
      if (useDirectGeminiAPI) {
        generatedText = await callGeminiDirectly(prompt);
      } 
      // Try Gemini SDK
      else if (model) {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        generatedText = response.text();
      }
      // Fallback to OpenAI
      else if (openaiClient) {
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful learning path generator. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        });
        generatedText = completion.choices[0].message.content;
      } else {
        throw new Error("No AI service available");
      }

      // Clean up the response - remove markdown code blocks if present
      generatedText = generatedText.trim();
      if (generatedText.startsWith("```json")) {
        generatedText = generatedText.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (generatedText.startsWith("```")) {
        generatedText = generatedText.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const learningPath = JSON.parse(generatedText);

      // Save to database if user is authenticated and MongoDB is connected
      if (req.userId && isMongoConnected) {
        try {
          const savedPath = await LearningPath.create({
            userId: req.userId,
            ...learningPath,
          });
          
          return res.json({
            success: true,
            data: savedPath,
          });
        } catch (dbError) {
          console.error("Error saving to database:", dbError);
          // Return the generated path even if save fails
          return res.json({
            success: true,
            data: learningPath,
            warning: "Path generated but not saved to database"
          });
        }
      }

      // Return without saving if not authenticated or no DB
      res.json({
        success: true,
        data: learningPath,
      });
    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      
      // Provide more specific error messages
      let errorMessage = "Failed to generate learning path";
      
      if (aiError.message.includes("API key")) {
        errorMessage = "Invalid AI API key configuration";
      } else if (aiError.message.includes("quota") || aiError.message.includes("limit")) {
        errorMessage = "AI service quota exceeded. Please try again later.";
      } else if (aiError.message.includes("JSON")) {
        errorMessage = "Failed to parse AI response. Please try again.";
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? aiError.message : undefined
      });
    }
  } catch (error) {
    console.error("Generate endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during path generation",
    });
  }
});

// Market insights endpoint
app.get("/api/market-insights", async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({
        success: false,
        error: "Skill parameter is required",
      });
    }

    // Check if AI is available
    if (!model && !useDirectGeminiAPI && !openaiClient) {
      return res.status(503).json({
        success: false,
        error: "AI service is not available",
      });
    }

    const prompt = `Provide market insights for the skill: ${skill}

Return a JSON object with the following structure:
{
  "skill": "${skill}",
  "demandLevel": "high/medium/low",
  "averageSalary": "$XX,XXX - $XX,XXX",
  "topCompanies": ["Company1", "Company2", "Company3"],
  "relatedSkills": ["skill1", "skill2", "skill3"],
  "industryTrends": ["trend1", "trend2"],
  "jobGrowth": "XX% expected growth",
  "careerPaths": ["path1", "path2"]
}

Return ONLY valid JSON, no markdown formatting.`;

    let generatedText;

    if (useDirectGeminiAPI) {
      generatedText = await callGeminiDirectly(prompt);
    } else if (model) {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      generatedText = response.text();
    } else if (openaiClient) {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a market research analyst. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      generatedText = completion.choices[0].message.content;
    }

    // Clean markdown formatting
    generatedText = generatedText.trim();
    if (generatedText.startsWith("```json")) {
      generatedText = generatedText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (generatedText.startsWith("```")) {
      generatedText = generatedText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const insights = JSON.parse(generatedText);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Market insights error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch market insights",
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 Unhandled error:", err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

// Export handler for Vercel serverless functions
export default async function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Pass request to Express app
  return app(req, res);
}
