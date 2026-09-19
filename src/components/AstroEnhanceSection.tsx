import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Wand2, Download, Image as ImageIcon, X, Loader2, Info, AlertCircle, Sparkles } from "lucide-react";
import axios from "axios";

interface EnhancementSummary {
  noiseReduction: string;
  backgroundFlattening: string;
  contrastAdjustment: string;
  processingTime: number | null;
}

export default function AstroEnhanceSection() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [summary, setSummary] = useState<EnhancementSummary>({
    noiseReduction: "--",
    backgroundFlattening: "--",
    contrastAdjustment: "--",
    processingTime: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
        setSummary({
          noiseReduction: "--",
          backgroundFlattening: "--",
          contrastAdjustment: "--",
          processingTime: null,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleEnhance = async () => {
    if (!file) {
      console.warn("DEBUG: Enhancement triggered but no file selected.");
      return;
    }

    console.log("DEBUG: Initiating enhancement for:", file.name, "Size:", file.size);
    setIsProcessing(true);
    setProcessedImage(null);
    setErrorStatus(null);
    
    const formData = new FormData();
    formData.append("image", file);

    try {
      console.log("DEBUG: Sending POST request to /api/enhance...");
      const response = await axios.post("/api/enhance", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("DEBUG: Response received metadata:", response.data.summary);

      if (!response.data.processedImage) {
        throw new Error("Received invalid processed image from server.");
      }

      setProcessedImage(response.data.processedImage);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("DEBUG: Enhancement pipeline failed:", error);
      setErrorStatus("The enhancement pipeline failed to return a valid image result. This could be due to memory limits or an unsupported image format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "astro_enhanced_galaxy.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSummary({
      noiseReduction: "--",
      backgroundFlattening: "--",
      contrastAdjustment: "--",
      processingTime: null,
    });
    setErrorStatus(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
          <Wand2 className="w-10 h-10 text-blue-500" />
          AstroEnhance
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Advanced image processing instrument designed to reveal hidden details in deep space imagery. 
          Uses non-destructive visual enhancement techniques.
        </p>
      </div>

      {!originalImage ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-3xl p-12 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
            <Upload className="w-10 h-10 text-white/20 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-medium text-white">Upload Galaxy Image</p>
            <p className="text-sm text-white/40">Drop your JPG or PNG here, or click to browse</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </motion.div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleEnhance}
              disabled={isProcessing || !!processedImage}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Enhance Image
                </>
              )}
            </button>
            {processedImage && (
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Result
              </button>
            )}
            <button
              onClick={reset}
              className="px-8 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-xl font-bold flex items-center gap-2 border border-red-900/20 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs uppercase tracking-widest font-bold text-white/40">Raw Input</span>
                <span className="text-[10px] text-white/20 uppercase">Original</span>
              </div>
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Processed/Comparison */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Enhanced Output</span>
                <span className="text-[10px] text-white/20 uppercase">AstroEnhance v1.0</span>
              </div>
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                {processedImage ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={processedImage}
                    alt="Processed"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/20">
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
                        <p className="text-sm font-medium animate-pulse">Running Neural Enhancement Pipeline</p>
                        <div className="text-[10px] space-y-1 text-center">
                          <p>Applying Noise Reduction...</p>
                          <p>Histogram Equalization...</p>
                          <p>Sharpening Filter...</p>
                        </div>
                      </div>
                    ) : errorStatus ? (
                      <div className="flex flex-col items-center gap-4 text-red-500 p-6 text-center">
                        <AlertCircle className="w-12 h-12 opacity-50" />
                        <p className="text-sm font-medium">Enhancement Failed</p>
                        <p className="text-[10px] text-white/40">{errorStatus}</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-16 h-16 opacity-10" />
                        <p className="text-sm font-medium">Click Enhance to process</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-4 items-start">
              <Info className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-white">Algorithm Details</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  The enhancement pipeline applies a Gaussian blur for noise suppression, followed by CLAHE 
                  (Contrast Limited Adaptive Histogram Equalization) for localized contrast improvement. 
                  Finally, a 2D sharpening kernel is applied to reveal structural features in galactic clusters.
                </p>
                <p className="text-[10px] text-white/20 font-mono italic">Disclaimer: This tool is for visual enhancement purposes and is not intended for scientific data analysis.</p>
              </div>
            </div>

            <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-2xl space-y-4">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Enhancement Summary
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Noise Reduction</span>
                  <span className={`font-mono ${summary.noiseReduction !== "--" ? "text-green-400" : "text-white/20"}`}>
                    {summary.noiseReduction}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Background Flattening</span>
                  <span className={`font-mono ${summary.backgroundFlattening !== "--" ? "text-green-400" : "text-white/20"}`}>
                    {summary.backgroundFlattening}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Contrast Adjustment</span>
                  <span className={`font-mono ${summary.contrastAdjustment !== "--" ? "text-blue-400" : "text-white/20"}`}>
                    {summary.contrastAdjustment}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/40">Processing Time</span>
                  <span className={`font-mono ${summary.processingTime !== null ? "text-yellow-400" : "text-white/20"}`}>
                    {summary.processingTime !== null ? `${summary.processingTime}s` : "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
