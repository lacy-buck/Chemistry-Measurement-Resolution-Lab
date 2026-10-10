import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini client
  let genAI: GoogleGenAI | null = null;
  function getGemini(): GoogleGenAI {
    if (!genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is missing.');
      }
      genAI = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return genAI;
  }

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Chemistry Tutor Gemini endpoint
  app.post('/api/tutor', async (req, res) => {
    try {
      const { question, context } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const ai = getGemini();
      const systemInstruction = `You are a friendly, encouraging High School Chemistry Teacher and Lab Mentor helping students understand scientific measurement, scale resolution, and significant figures.
Key concepts to reinforce:
1. Every analog measurement consists of all known/certain digits (from the scale markings) PLUS exactly one estimated digit (between the finest markings).
2. The resolution is determined by the spacing of tick marks. For example, on a ruler with 1 cm marks, we estimate tenths (0.1 cm). On a ruler with 0.1 cm (1 mm) marks, we estimate hundredths (0.01 cm).
3. If a measurement lands directly on a line, students MUST write trailing zeros to communicate resolution (e.g. 5.0 cm or 5.00 cm, not just 5 cm).
4. Liquid volumes in graduated cylinders must be read at the bottom of the concave meniscus at eye level.
5. Beakers have coarse graduations (e.g. 20 mL or 50 mL) and are for estimating, whereas graduated cylinders are designed for precise volume measurement.

Keep explanations clear, concise, step-by-step, engaging, and suitable for high school students. Avoid overly complicated university calculus or quantum jargon. Use friendly markdown formatting with bullet points.`;

      const prompt = `Student Question: ${question}\n${context ? `Current Lab Context / Instrument: ${JSON.stringify(context)}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I couldn't generate a response. Please check your measurement and try again!";
      res.json({ reply });
    } catch (error: any) {
      console.error('Error in /api/tutor:', error);
      res.status(500).json({
        error: error.message || 'Failed to communicate with chemistry tutor.',
        fallbackReply: "Remember the Golden Rule of Chemistry Measurements: Read all the certain digits from the visible line marks, plus estimate ONE more digit between the marks! Always check your instrument's smallest division.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chemistry Measurement Lab server running on http://localhost:${PORT}`);
  });
}

startServer();
