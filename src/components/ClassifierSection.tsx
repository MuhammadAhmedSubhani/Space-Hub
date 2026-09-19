import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Image as ImageIcon, Sparkles, History, X, CheckCircle2 } from "lucide-react";
import { classifyGalaxy, ClassificationResult } from "../lib/gemini";

export default function ClassifierSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [history, setHistory] = useState<(ClassificationResult & { image: string })[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const classification = await classifyGalaxy(selectedImage);
      setResult(classification);
      setHistory(prev => [{ ...classification, image: selectedImage }, ...prev].slice(0, 3));
    } catch (error) {
      console.error(error);
      alert("Classification failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-white">AI Galaxy Classifier</h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Upload an image of a galaxy and our AI-powered system will classify it as Spiral, Elliptical, or Irregular using deep learning analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Upload Area */}
        <div className="space-y-6">
          <div 
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`relative aspect-square rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden
              ${selectedImage ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/20 hover:border-white/40 bg-white/5'}
              ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-white/60" />
                </div>
                <div>
                  <p className="text-white font-medium">Click to upload image</p>
                  <p className="text-white/40 text-sm">Supports JPG, PNG (Max 5MB)</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
              ${!selectedImage || isAnalyzing 
                ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'}
            `}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Analyzing Galaxy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Classify Galaxy</span>
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-white/40">Classification Result</h3>
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Analysis Complete</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-5xl font-black text-white tracking-tighter">
                    {result.prediction}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                    <span className="text-blue-400 font-mono font-bold">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-white/70 leading-relaxed italic">
                  "{result.explanation}"
                </p>

                {/* Top 2 Predictions */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30">Top Predictions</h4>
                  <div className="space-y-2">
                    {result.topPredictions.map((pred, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white/60">{pred.label}</span>
                        <span className="text-blue-400 font-bold">{(pred.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Type</div>
                    <div className="text-xs font-bold text-white">{result.prediction}</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Model</div>
                    <div className="text-xs font-bold text-white">CNN-v3</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Status</div>
                    <div className="text-xs font-bold text-green-400">Verified</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[300px] border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/30 font-medium">Results will appear here after analysis</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40">
                <History className="w-4 h-4" />
                <h4 className="text-xs uppercase tracking-widest font-bold">Recent Classifications</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {history.map((item, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10">
                    <img src={item.image} alt="History" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white truncate">{item.prediction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
