import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/remix', async (req, res) => {
  try {
    const inputText = req.body.text?.trim();
    
    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    console.log('\n=== REQUEST TO CLAUDE ===');
    const requestBody = {
      model: 'claude-3-5-sonnet-20240620',
      system: "You are a social media expert and ghostwriter specializing in converting blog posts into engaging tweets. Your ONLY task is to take blog posts and convert them into a numbered list of tweets. You must: 1. Generate exactly 5 tweets 2. Keep each tweet under 280 characters 3. Match the original post's style and tone 4. Format each tweet on its own line starting with the number and a period 5. Separate each tweet with '|||' on its own line 6. Do not use hashtags or emojis 7. Do not include any other text besides the numbered tweets and separators",
      messages: [
        {
          role: 'user',
          content: `Convert this blog post into exactly 5 tweets, numbered 1-5. ONLY output the numbered tweets, nothing else:

${inputText}`
        }
      ],
      max_tokens: 1024
    };
    
    console.log(JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Request to Claude:', {
      model: 'claude-3-5-sonnet-20240620',
      system: "You are a social media expert and ghostwriter specializing in converting blog posts into engaging tweets...",
      messages: [
        {
          role: 'user',
          content: `Convert this blog post into exactly 5 tweets...${inputText.substring(0, 50)}...`
        }
      ]
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    console.log('\n=== RESPONSE FROM CLAUDE ===');
    console.log(JSON.stringify(data, null, 2));
    res.json({ content: data.content });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 