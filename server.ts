import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

// NASA API Logic with In-Memory Caching
let cachedApod: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 hours

app.get("/api/nasa/apod", async (req, res) => {
  const now = Date.now();
  
  // Return cached version if valid to reduce external API pressure
  if (cachedApod && (now - lastCacheUpdate < CACHE_DURATION)) {
    console.log("DEBUG: Serving NASA APOD from cache.");
    return res.json({ ...cachedApod, isFallback: false, fromCache: true });
  }

  const maxRetries = 2; // Reduced slightly for faster fallback response
  let attempts = 0;
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

  const fallbackApod = {
    title: "The Pillars of Creation (M16)",
    url: "https://images-assets.nasa.gov/image/PIA04213/PIA04213~orig.jpg",
    explanation: "The live NASA Astronomy Picture of the Day service is currently under high load or unavailable. This fallback view shows the famous Pillars of Creation (M16) as captured by the Hubble Space Telescope. These towering clouds of cosmic dust and gas are part of an active star-forming region located about 6,500 light-years away.",
    date: new Date().toISOString().split('T')[0],
    media_type: "image",
    copyright: "NASA, ESA, STScI",
    isFallback: true
  };

  while (attempts <= maxRetries) {
    try {
      console.log(`DEBUG: Fetching NASA APOD (Attempt ${attempts + 1})...`);
      const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, {
        timeout: 15000, // Reduced to 15s to fail faster and reach fallback sooner
      });
      
      // Update cache
      cachedApod = response.data;
      lastCacheUpdate = now;
      
      return res.json({ ...response.data, isFallback: false, fromCache: false });
    } catch (error) {
      attempts++;
      const status = axios.isAxiosError(error) ? error.response?.status : null;
      
      console.error(`Error fetching NASA APOD (Attempt ${attempts}): ${axios.isAxiosError(error) ? error.message : "Unknown error"}`);

      // Don't retry on Auth errors (401/403) or if it's the last attempt
      if (status === 401 || status === 403 || attempts > maxRetries) {
        if (cachedApod) {
          console.warn("NASA API failed. Serving STALE cached content.");
          return res.json({ ...cachedApod, isFallback: false, isStale: true });
        }
        console.warn("NASA API failed. Serving hard-coded fallback.");
        return res.json(fallbackApod);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1500 * attempts));
    }
  }
});

  // AstroEnhance Image Processing
  app.post("/api/enhance", upload.single("image"), async (req, res) => {
    console.log("DEBUG: POST /api/enhance received.");
    
    if (!req.file) {
      console.error("DEBUG: No file found in request payload.");
      return res.status(400).json({ error: "No image provided" });
    }

    try {
      const startTime = performance.now();
      console.log("DEBUG: Starting BANDING-REMOVAL enhancement pipeline for:", req.file.originalname);
      
      // Step 1: Initial Processing (Grayscale + Denoising)
      const denoisedBuffer = await sharp(req.file.buffer)
        .grayscale()
        .median(3)
        .toBuffer();

      // Step 2 & 3: Background Estimation and Weighted Subtraction (Halo Preservation Fix)
      const backgroundBuffer = await sharp(denoisedBuffer)
        .blur(15)
        .linear(0.16, 0)
        .toBuffer();

      const flattenedBuffer = await sharp(denoisedBuffer)
        .composite([{ input: backgroundBuffer, blend: 'difference' }]) 
        .toBuffer();

      // Step 4+: Scientific Enhancement Sequence
      const processedBuffer = await sharp(flattenedBuffer)
        .normalize()
        .clahe({ 
          width: 8, 
          height: 8, 
          maxSlope: 1 
        })
        .gamma(1.15)
        .sharpen({
          sigma: 0.05,
          m1: 0,
          m2: 0.05,
          x1: 2,
          y2: 10,
          y3: 20
        }) 
        .blur(0.7)
        .png()
        .toBuffer();

      const endTime = performance.now();
      const processingTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));
      
      console.log(`DEBUG: Enhancement complete in ${processingTime}s. Output buffer size:`, processedBuffer.length);
      
      const base64Image = `data:image/png;base64,${processedBuffer.toString('base64')}`;

      // Sending JSON response with metadata
      return res.json({
        processedImage: base64Image,
        summary: {
          noiseReduction: "Enabled",
          backgroundFlattening: "Applied",
          contrastAdjustment: "Mild",
          processingTime: processingTime
        }
      });
    } catch (error) {
      console.error("DEBUG: Image processing failure:", error);
      res.status(500).json({ error: "Image processing failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
