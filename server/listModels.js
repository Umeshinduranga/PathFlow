// List available models with the new API key
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function listAvailableModels() {
  console.log("📋 Listing available models with your API key...\n");
  
  const API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Successfully retrieved model list!");
      console.log(`Found ${data.models?.length || 0} models:\n`);
      
      if (data.models) {
        data.models.forEach((model, index) => {
          console.log(`${index + 1}. Name: ${model.name}`);
          console.log(`   Display Name: ${model.displayName}`);
          console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'None'}`);
          console.log("");
        });
        
        // Find models that support generateContent
        const compatibleModels = data.models.filter(model => 
          model.supportedGenerationMethods?.includes('generateContent')
        );
        
        console.log("🎯 Models compatible with generateContent:");
        compatibleModels.forEach(model => {
          // Extract just the model name part (remove "models/" prefix)
          const modelId = model.name.replace('models/', '');
          console.log(`   ✅ ${modelId}`);
        });
        
        if (compatibleModels.length > 0) {
          const firstModel = compatibleModels[0].name.replace('models/', '');
          console.log(`\n💡 Recommendation: Use "${firstModel}" in your GEMINI_MODEL environment variable`);
        }
        
      } else {
        console.log("No models found in response");
      }
    } else {
      console.log("❌ Failed to list models:");
      console.log("Status:", response.status);
      console.log("Error:", data);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

listAvailableModels();