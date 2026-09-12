require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', backend: process.env.BACKEND_URL });
});

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'rafi-ai-pro-fixed-1.html'));
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Forward to backend or use OpenAI directly
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ message, mode, history })
      });
      const data = await response.json();
      return res.json(data);
    }

    // Fallback demo response
    res.json({
      text: `Demo Response to: "${message}"\n\nMode: ${mode}\nConnect backend to enable real AI responses.`
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image generation endpoint
app.post('/api/image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/api/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      return res.json(data);
    }

    res.json({ message: 'Image generation - Connect backend for real generation' });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rafi AI Pro server running on http://localhost:${PORT}`);
  console.log(`📡 Backend: ${process.env.BACKEND_URL || 'Not configured'}`);
  console.log(`🔑 API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});
