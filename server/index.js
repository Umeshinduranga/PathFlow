import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import LearningPath from "./models/LearningPath.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import profileRoutes from "./routes/profile.js";
import pathsRoutes from "./routes/paths.js";
import { optionalAuthMiddleware } from "./middleware/auth.js";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
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

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
      throw new Error("GEMINI_API_KEY is not configured");
    }
    
    const geminiModel = process.env.GEMINI_MODEL || "gemini-pro";
    console.log(`🔄 Initializing Gemini AI with model: ${geminiModel}`);
    
    // Try using the direct REST API first
    try {
      const testResponse = await callGeminiDirectly("Say 'hello' in one word");
      if (testResponse) {
        useDirectGeminiAPI = true;
        console.log(`✅ Gemini REST API working! Response: ${testResponse.substring(0, 30)}...`);
        console.log(`🎉 Using direct REST API for Gemini Pro`);
        return;
      }
    } catch (directError) {
      console.log(`⚠️ Direct REST API failed: ${directError.message}`);
      console.log(`� Trying SDK approach...`);
    }
    
    // Fallback to SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: geminiModel });
    
    console.log(`✅ Gemini AI model configured: ${geminiModel} (SDK)`);
    console.log(`💡 Will test on first path generation request`);
    
  } catch (error) {
    console.error("❌ Gemini AI initialization failed:", error.message);
    console.log("💡 Tip: Your Gemini API may be suspended or invalid");
    console.log("🔄 Will attempt to use OpenAI as fallback...");
    model = null;
    useDirectGeminiAPI = false;
  }
};

// Setup OpenAI client as fallback
const initializeOpenAI = () => {
  try {
    if (process.env.OPENAI_API_KEY) {
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log("✅ OpenAI initialized as backup AI provider");
      return true;
    } else {
      console.log("⚠️ OPENAI_API_KEY not configured - no AI backup available");
      return false;
    }
  } catch (error) {
    console.error("❌ OpenAI initialization failed:", error.message);
    openaiClient = null;
    return false;
  }
};

// Initialize AI providers
initializeGemini();
initializeOpenAI();

// Validation middleware
const validateLearningPathInput = (req, res, next) => {
  const { skills, goal } = req.body;
  
  if (!skills || typeof skills !== 'string' || skills.trim().length === 0) {
    return res.status(400).json({ 
      error: "Skills are required and must be a non-empty string" 
    });
  }
  
  if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
    return res.status(400).json({ 
      error: "Goal is required and must be a non-empty string" 
    });
  }
  
  if (skills.length > 200 || goal.length > 100) {
    return res.status(400).json({ 
      error: "Skills or goal text is too long" 
    });
  }
  
  next();
};

// Utility function to clean and parse steps
const parseStepsFromResponse = (text) => {
  const steps = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && /^\d+\./.test(line))
    .map(step => step.replace(/^\d+\.\s*/, ""))
    .filter(step => step.length > 0);
  
  return steps.length > 0 ? steps : null;
};

// Fallback learning path generator
const generateFallbackPath = (skills, goal) => {
  return [
    `Review and strengthen your current ${skills} skills`,
    `Research the specific requirements and technologies for ${goal}`,
    `Learn the fundamental concepts and tools needed for ${goal}`,
    `Build small practice projects to apply your new knowledge`,
    `Create a comprehensive portfolio showcasing your ${goal} skills`,
    `Network with professionals and apply for ${goal} positions`
  ];
};

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Learning Path Generator API",
    version: "1.0.0",
    status: "running",
    endpoints: ["/generate-path", "/generate-roadmap-steps", "/api/auth/*"]
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Dashboard routes (new - safe addition)
app.use("/api/dashboard", dashboardRoutes);

// Profile routes
app.use("/api/user", profileRoutes);

// Learning paths routes (progress tracking)
app.use("/api/paths", pathsRoutes);

// Health check endpoint
app.get("/health", async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    database: isMongoConnected ? "connected" : "disconnected",
    ai: !!model ? "available" : "unavailable"
  };
  
  try {
    res.status(200).json(health);
  } catch (error) {
    health.message = "ERROR";
    res.status(503).json(health);
  }
});

// Main AI-powered learning path generation (detailed text steps)
app.post("/generate-path", aiLimiter, optionalAuthMiddleware, validateLearningPathInput, async (req, res) => {
  const { skills, goal } = req.body;
  const startTime = Date.now();
  
  try {
    let generatedSteps = null;
    let aiProvider = 'fallback';
    
    // Try Gemini AI first
    if (useDirectGeminiAPI || model) {
      const prompt = `
You are a professional career coach and learning specialist.

Create a clear, actionable, step-by-step learning path for someone who currently knows: "${skills}" and wants to become a "${goal}".

Requirements:
- Provide exactly 6 steps
- Each step should be specific and actionable
- Start each step with an action verb
- Make it beginner-friendly but comprehensive
- Focus on practical skills and real-world application
- Include both learning and doing components

Format: Return only the numbered steps, nothing else.
`;

      // Try direct REST API first
      if (useDirectGeminiAPI) {
        try {
          console.log("🤖 Generating with Gemini REST API...");
          const text = await callGeminiDirectly(prompt);
          generatedSteps = parseStepsFromResponse(text);
          aiProvider = 'gemini-direct';
          console.log("✅ Generated successfully with Gemini REST API");
        } catch (directError) {
          console.error("⚠️ Gemini REST API failed:", directError.message);
          console.log("🔄 Trying SDK fallback...");
        }
      }

      // Try SDK if direct API failed
      if (!generatedSteps && model) {
        try {
          console.log("🤖 Generating with Gemini SDK...");
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          generatedSteps = parseStepsFromResponse(text);
          aiProvider = 'gemini-sdk';
          console.log("✅ Generated successfully with Gemini SDK");
        } catch (aiError) {
          console.error("⚠️ Gemini SDK failed:", aiError.message);
          console.log("🔄 Attempting OpenAI fallback...");
        }
      }
      
      if (!generatedSteps) {
        console.warn("⚠️ Gemini generated invalid format, trying OpenAI...");
      }
    }
    
    // Try OpenAI if Gemini failed
    if (!generatedSteps && openaiClient) {
      try {
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional career coach and learning specialist. Provide exactly 6 numbered steps in a clear learning path."
            },
            {
              role: "user",
              content: `Create a step-by-step learning path for someone who knows: "${skills}" and wants to become a "${goal}". Format: Return only 6 numbered steps, nothing else.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        
        const text = completion.choices[0].message.content;
        generatedSteps = parseStepsFromResponse(text);
        aiProvider = 'openai';
        
        if (generatedSteps) {
          console.log("✅ OpenAI fallback successful");
        } else {
          console.warn("⚠️ OpenAI generated invalid format");
        }
      } catch (openaiError) {
        console.error("⚠️ OpenAI generation also failed:", openaiError.message);
      }
    }
    
    // Use manual fallback if all AI methods failed
    const finalSteps = generatedSteps || generateFallbackPath(skills, goal);
    if (!generatedSteps) {
      aiProvider = 'fallback';
      console.log("📝 Using manual fallback path generation");
    }
    
    // Save to database (non-blocking, only if MongoDB is connected)
    const savePromise = (async () => {
      if (!isMongoConnected) {
        console.log("⚠️ Skipping database save - MongoDB not connected");
        return;
      }

      try {
        const skillsArray = skills
          .split(/[,;]/)
          .map(s => s.trim())
          .filter(Boolean)
          .slice(0, 10); // Limit to 10 skills
        
        await LearningPath.create({
          skills: skillsArray.length ? skillsArray : [skills],
          goal: goal.trim(),
          path: finalSteps,
          generatedBy: aiProvider,
          userId: req.user?._id || null, // Save userId if user is authenticated
          completedSteps: [], // Initialize empty completed steps
          createdAt: new Date(),
          metadata: {
            responseTime: Date.now() - startTime,
            aiProvider: aiProvider,
            aiUsed: generatedSteps !== null
          }
        });
        
        console.log(`✅ Learning path saved to database${req.user ? ' for user ' + req.user.username : ''}`);
      } catch (dbError) {
        console.error("⚠️ Database save failed (non-critical):", dbError.message);
      }
    })();
    
    // Don't wait for database save
    savePromise.catch(() => {});
    
    // Return response
    res.json({
      success: true,
      steps: finalSteps.map((step, index) => `${index + 1}. ${step}`),
      metadata: {
        generatedBy: aiProvider,
        aiProvider: aiProvider,
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        message: aiProvider === 'fallback' ? 'AI services unavailable, using manual path generation' : `Generated using ${aiProvider}`
      }
    });
    
  } catch (error) {
    console.error("❌ Error in /generate-path:", error);
    
    // Return fallback response
    const fallbackSteps = generateFallbackPath(skills, goal);
    res.status(200).json({
      success: true,
      steps: fallbackSteps.map((step, index) => `${index + 1}. ${step}`),
      metadata: {
        generatedBy: 'fallback',
        responseTime: Date.now() - startTime,
        error: 'Service temporarily unavailable'
      }
    });
  }
});

// NEW: Simplified roadmap step generator (for canvas)
app.post("/generate-roadmap-steps", aiLimiter, validateLearningPathInput, async (req, res) => {
  const { skills, goal } = req.body;

  try {
    const prompt = `
Generate a simplified learning roadmap.
Input skills: "${skills}"
Goal: "${goal}"

Rules:
- Exactly 6 steps
- Each step max 6 words
- Start with an action verb
- Return only the plain steps (no numbering, no explanation)
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const steps = text
      .split("\n")
      .map(s => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    res.json({
      success: true,
      steps
    });
  } catch (err) {
    console.error("❌ Roadmap generation failed:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate roadmap" });
  }
});

// Get saved learning paths (for dashboard)
app.get("/paths", async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({
      success: false,
      error: "Database service unavailable"
    });
  }

  try {
    const { limit = 10, skip = 0 } = req.query;
    
    const paths = await LearningPath
      .find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const total = await LearningPath.countDocuments();
    
    res.json({
      success: true,
      data: paths,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + paths.length
      }
    });
  } catch (error) {
    console.error("❌ Error fetching paths:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch learning paths"
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  if (isMongoConnected) {
    mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  if (isMongoConnected) {
    mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  if (!process.env.MONGO_URI) {
    console.log('⚠️ Note: Running without MongoDB (set MONGO_URI to enable database features)');
  }
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️ Note: Running without Gemini AI (set GEMINI_API_KEY to enable AI features)');
  }
});

export default app;
