import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function diagnoseGeminiAPI() {
  console.log('🔍 Gemini API Diagnostic Tool\n');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 15)}...${API_KEY.substring(API_KEY.length - 5)}` : 'NOT FOUND');
  console.log('');

  const endpoints = [
    {
      name: 'v1 (Standard)',
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      version: 'v1'
    },
    {
      name: 'v1beta (Beta)',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      version: 'v1beta'
    },
    {
      name: 'List Models v1',
      url: `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`,
      version: 'v1',
      method: 'GET'
    },
    {
      name: 'List Models v1beta',
      url: `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
      version: 'v1beta',
      method: 'GET'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url.replace(API_KEY, 'API_KEY')}`);
    console.log(`${'='.repeat(60)}`);

    try {
      const options = {
        method: endpoint.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (endpoint.method !== 'GET') {
        options.body = JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        });
      }

      const response = await fetch(endpoint.url, options);
      
      console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
      console.log(`📋 Headers:`);
      for (const [key, value] of response.headers.entries()) {
        console.log(`   ${key}: ${value}`);
      }

      const responseText = await response.text();
      
      if (response.ok) {
        console.log(`\n✅ SUCCESS!`);
        try {
          const data = JSON.parse(responseText);
          console.log(`\n📦 Response Data:`);
          console.log(JSON.stringify(data, null, 2).substring(0, 500));
        } catch (e) {
          console.log(`\n📄 Response Text:`, responseText.substring(0, 200));
        }
      } else {
        console.log(`\n❌ FAILED`);
        console.log(`📄 Error Response:`);
        try {
          const errorData = JSON.parse(responseText);
          console.log(JSON.stringify(errorData, null, 2));
        } catch (e) {
          console.log(responseText);
        }
      }
    } catch (error) {
      console.log(`\n❌ Exception: ${error.message}`);
      console.log(`Stack: ${error.stack}`);
    }
  }

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('💡 DIAGNOSTIC SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log('\nCommon Issues & Solutions:');
  console.log('');
  console.log('1. 404 Error: API not enabled');
  console.log('   → Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
  console.log('   → Enable "Generative Language API"');
  console.log('');
  console.log('2. 403 Error: API key suspended or invalid');
  console.log('   → Create new key: https://aistudio.google.com/app/apikey');
  console.log('   → Check billing: https://console.cloud.google.com/billing');
  console.log('');
  console.log('3. 429 Error: Rate limit exceeded');
  console.log('   → Wait a few minutes and try again');
  console.log('   → Check quota: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas');
  console.log('');
  console.log('4. API Key from AI Studio vs Cloud Console:');
  console.log('   → AI Studio keys: Work with v1beta API');
  console.log('   → Cloud Console keys: Work with v1 API');
  console.log('   → Your key type determines which endpoint works');
  console.log('');
}

diagnoseGeminiAPI().catch(console.error);
