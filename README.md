# 🌌 Space Hub

An interactive space exploration platform featuring real-time NASA astronomy content, AI-driven galaxy classification, evidence-based claim verification, and astronomical image enhancement.

---

## 🚀 Key Features

* **Observe (NASA APOD):** Real-time integration with NASA's Astronomy Picture of the Day API, complete with metadata, fallback mechanisms, and caching.
* **Identify (AI Galaxy Classifier):** Uses Google Gemini AI vision models to analyze uploaded galaxy images and classify them into *Spiral*, *Elliptical*, or *Irregular* types with confidence scoring.
* **Verify (AstroCheck):** An automated scientific fact-checking tool using Gemini AI with web grounding to validate or debunk space-related claims.
* **Enhance (AstroEnhance):** Image processing pipeline (powered by Sharp and OpenCV) that applies noise reduction, background flattening, contrast adjustment, and sharpening to astronomical imagery.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Motion (Framer Motion), Lucide React
* **Backend:** Node.js, Express, Multer, Sharp
* **AI & External APIs:** Google Gen AI SDK (Gemini 3 Flash), NASA Open API
* **Image Processing:** Sharp (Node.js) / OpenCV (Python pipeline)

---

## 📁 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── AstroCheckSection.tsx     # Scientific claim verification UI
│   │   ├── AstroEnhanceSection.tsx   # Image processing & comparison UI
│   │   ├── ClassifierSection.tsx     # AI galaxy classifier UI
│   │   └── NasaSection.tsx           # NASA APOD viewer
│   ├── lib/
│   │   └── gemini.ts                 # Gemini API integration & schema definitions
│   ├── App.tsx                       # Main layout & navigation
│   ├── index.css                     # Global styles & Tailwind imports
│   └── main.tsx                      # Application entry point
├── opencv_enhance.py                 # Standalone Python image enhancement script
├── server.ts                         # Express server & API routes
├── package.json                      # Dependencies and scripts
├── vite.config.ts                    # Vite build configuration
└── README.md                         # Documentation
