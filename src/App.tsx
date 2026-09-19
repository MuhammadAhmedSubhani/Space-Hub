import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Telescope, Home, Sparkles, Github, Twitter, Globe, ShieldCheck, Wand2 } from "lucide-react";
import NasaSection from "./components/NasaSection";
import ClassifierSection from "./components/ClassifierSection";
import AstroCheckSection from "./components/AstroCheckSection";
import AstroEnhanceSection from "./components/AstroEnhanceSection";

type View = "home" | "classifier" | "astrocheck" | "enhance";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-blue-500/30">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentView("home")}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Telescope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter">SPACEHUB</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setCurrentView("home")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                ${currentView === "home" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}
              `}
            >
              <Home className="w-4 h-4" />
              Observe
            </button>
            <button
              onClick={() => setCurrentView("classifier")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                ${currentView === "classifier" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}
              `}
            >
              <Sparkles className="w-4 h-4" />
              Identify
            </button>
            <button
              onClick={() => setCurrentView("astrocheck")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                ${currentView === "astrocheck" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}
              `}
            >
              <ShieldCheck className="w-4 h-4" />
              Verify
            </button>
            <button
              onClick={() => setCurrentView("enhance")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                ${currentView === "enhance" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}
              `}
            >
              <Wand2 className="w-4 h-4" />
              Enhance
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <a href="#" className="p-2 text-white/40 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 text-white/40 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === "home" && <NasaSection />}
            {currentView === "classifier" && <ClassifierSection />}
            {currentView === "astrocheck" && <AstroCheckSection />}
            {currentView === "enhance" && <AstroEnhanceSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Globe className="w-4 h-4" />
            <span>Powered by NASA Open API & Google Gemini AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <p className="text-white/20 text-xs">© 2026 SpaceHub. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Nav Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-2 shadow-2xl">
        <button
          onClick={() => setCurrentView("home")}
          className={`p-3 rounded-xl transition-all ${currentView === "home" ? "bg-blue-600 text-white" : "text-white/40"}`}
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentView("classifier")}
          className={`p-3 rounded-xl transition-all ${currentView === "classifier" ? "bg-blue-600 text-white" : "text-white/40"}`}
        >
          <Sparkles className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentView("astrocheck")}
          className={`p-3 rounded-xl transition-all ${currentView === "astrocheck" ? "bg-blue-600 text-white" : "text-white/40"}`}
        >
          <ShieldCheck className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentView("enhance")}
          className={`p-3 rounded-xl transition-all ${currentView === "enhance" ? "bg-blue-600 text-white" : "text-white/40"}`}
        >
          <Wand2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
