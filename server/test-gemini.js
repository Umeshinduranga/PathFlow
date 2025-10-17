import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Configuration...\n');
  
  // Check if API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  
  if (!apiKey || apiKey === 'YOUR_NEW_API_KEY_HERE') {
    console.error('❌ Error: GEMINI_API_KEY is not set in .env file');
    console.log('📝 Please add your API key to server/.env:');
    console.log('   GEMINI_API_KEY=your-actual-key-here\n');
    console.log('🔑 Get a key at: https://aistudio.google.com/app/apikey');
    process.exit(1);
  }
  
  console.log(`✓ API Key found: ${apiKey.substring(0, 20)}...`);
  console.log(`✓ Model: ${modelName}\n`);
  
  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    console.log('🔄 Sending test request to Gemini API...');
    
    // Test with a simple prompt
    const result = await model.generateContent('Say hello!');
    const response = result.response.text();
    
    console.log('✅ SUCCESS! Gemini API is working!\n');
    console.log('📝 Response:', response);
    console.log('\n🎉 Your Gemini setup is correct!');
    console.log('💡 You can now start your server with: npm start');
    
  } catch (error) {
    console.error('❌ FAILED! Error testing Gemini API:\n');
    console.error(error.message);
    console.log('\n🔍 Common issues:');
    
    if (error.message.includes('403') || error.message.includes('suspended')) {
      console.log('   - Your API key or project is suspended');
      console.log('   - Solution: Create a new API key with a different Google account');
      console.log('   - Visit: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('API key not valid')) {
      console.log('   - Your API key is invalid');
      console.log('   - Check for typos or extra spaces');
      console.log('   - Get a new key at: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('model')) {
      console.log('   - Invalid model name');
      console.log('   - Try: gemini-1.5-pro, gemini-1.5-flash, or gemini-pro');
      console.log('   - Update GEMINI_MODEL in your .env file');
    } else if (error.message.includes('quota') || error.message.includes('429')) {
      console.log('   - You\'ve exceeded your quota/rate limit');
      console.log('   - Wait a few minutes and try again');
      console.log('   - Free tier: 60 requests/minute, 1500 requests/day');
    } else {
      console.log('   - Unknown error');
      console.log('   - Check your internet connection');
      console.log('   - Verify your API key at: https://aistudio.google.com/app/apikey');
    }
    
    process.exit(1);
  }
}

// Run the test
testGeminiAPI();
