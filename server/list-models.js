import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function listAvailableModels() {
  console.log('🔍 Checking available models for your API key...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_NEW_API_KEY_HERE') {
    console.error('❌ No API key found');
    process.exit(1);
  }
  
  console.log(`✓ Using API Key: ${apiKey.substring(0, 20)}...\n`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models
    console.log('📋 Attempting to list available models...\n');
    
    // Try different methods to get models
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'models/gemini-pro',
      'models/gemini-1.0-pro',
    ];
    
    console.log('Testing individual models:\n');
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Test');
        console.log(`✅ ${modelName} - WORKS!`);
        console.log(`   Response: ${result.response.text().substring(0, 50)}...`);
        break; // Found one that works!
      } catch (error) {
        console.log(`❌ ${modelName} - Failed: ${error.message.substring(0, 100)}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    console.log('\n💡 Possible issues:');
    console.log('   1. Your API key might be for Gemini API v1 (not v1beta)');
    console.log('   2. Your API key might have model restrictions');
    console.log('   3. Your Google Cloud project might need additional setup');
    
    console.log('\n🔧 Try this:');
    console.log('   1. Go to: https://aistudio.google.com/app/apikey');
    console.log('   2. Delete your current API key');
    console.log('   3. Create a NEW API key in a NEW project');
    console.log('   4. Make sure you enable "Generative Language API"');
  }
}

listAvailableModels();
