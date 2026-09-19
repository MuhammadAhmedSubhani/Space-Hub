├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── opencv_enhance.py
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── AstroCheckSection.tsx
    │   ├── AstroEnhanceSection.tsx
    │   ├── ClassifierSection.tsx
    │   └── NasaSection.tsx
    └── lib/
        └── gemini.ts
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
