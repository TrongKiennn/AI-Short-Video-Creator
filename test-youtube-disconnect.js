// Simple test script to verify YouTube disconnect functionality
const fetch = require('node-fetch');

async function testYouTubeDisconnect() {
  try {
    console.log('Testing YouTube disconnect API...');

    const response = await fetch(
      'http://localhost:3000/api/youtube/disconnect',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: 'test@example.com',
        }),
      }
    );

    const result = await response.json();

    console.log('Response status:', response.status);
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ YouTube disconnect API is working');
    } else {
      console.log('❌ YouTube disconnect API returned error:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing YouTube disconnect API:', error.message);
  }
}

// Run the test
testYouTubeDisconnect();
