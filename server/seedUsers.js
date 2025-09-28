import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Demo users to seed
const demoUsers = [
  {
    username: "demo",
    email: "demo@pathflow.com",
    password: "demo123",
    name: "Demo User"
  },
  {
    username: "test",
    email: "test@pathflow.com",
    password: "test123",
    name: "Test User"
  },
  {
    username: "pathflow",
    email: "pathflow@example.com",
    password: "pathflow123",
    name: "PathFlow User"
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if users already exist and remove them
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        await User.deleteOne({ _id: existingUser._id });
        console.log(`🗑️ Removed existing user: ${userData.username}`);
      }
    }

    // Create new demo users
    console.log("Creating demo users...");
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.email})`);
    }

    console.log("\n🎉 Demo users created successfully!");
    console.log("You can now use these credentials to login:");
    demoUsers.forEach(user => {
      console.log(`   Username: ${user.username} | Password: ${user.password}`);
    });

  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("📡 Database connection closed");
    process.exit(0);
  }
}

// Run the seed function
seedUsers();