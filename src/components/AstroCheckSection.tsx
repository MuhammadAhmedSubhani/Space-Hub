import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShieldCheck, AlertTriangle, CheckCircle, HelpCircle, Info, Send } from "lucide-react";
import { verifySpaceClaim, FactCheckResult } from "../lib/gemini";

export default function AstroCheckSection() {
  const [query, setQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);

  const handleCheck = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isChecking) return;

    setIsChecking(true);
    try {
      const factCheck = await verifySpaceClaim(query);
      setResult(factCheck);
    } catch (error) {
      console.error(error);
      alert("Verification failed. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case "True":
        return { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", icon: <CheckCircle className="w-6 h-6" /> };
      case "Partially True":
        return { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: <Info className="w-6 h-6" /> };
      case "False":
        return { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: <AlertTriangle className="w-6 h-6" /> };
      default:
        return { color: "text-white/40", bg: "bg-white/5", border: "border-white/10", icon: <HelpCircle className="w-6 h-6" /> };
    }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
          <ShieldCheck className="w-10 h-10 text-blue-500" />
          AstroCheck
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Verify space claims, debunk myths, and get evidence-based explanations for any astronomical query using real-time scientific data.
        </p>
      </div>

      <div className="space-y-8">
        {/* Input Area */}
        <form onSubmit={handleCheck} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Is black hole evaporation real?' or 'Mars has two artificial moons'"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-32 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-blue-500 transition-colors" />
          <button
            type="submit"
            disabled={!query.trim() || isChecking}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            {isChecking ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Verify
              </>
            )}
          </button>
        </form>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Verdict Card */}
              <div className={`p-8 rounded-3xl border ${getVerdictStyles(result.verdict).border} ${getVerdictStyles(result.verdict).bg} space-y-6`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-white/40">Verdict</h3>
                    <div className={`text-4xl font-black tracking-tighter flex items-center gap-3 ${getVerdictStyles(result.verdict).color}`}>
                      {getVerdictStyles(result.verdict).icon}
                      {result.verdict}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Confidence</div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-full border ${
                      result.confidenceLevel === "High" ? "text-green-400 border-green-400/20 bg-green-400/5" :
                      result.confidenceLevel === "Medium" ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" :
                      "text-red-400 border-red-400/20 bg-red-400/5"
                    }`}>
                      {result.confidenceLevel}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white/60">Claim Analysis</h4>
                    <p className="text-white leading-relaxed">{result.claimAnalysis}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white/60">Explanation</h4>
                    <p className="text-white/80 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-white/40 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Supporting Evidence
                  </h4>
                  <ul className="space-y-3">
                    {result.supportingEvidence.map((point, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {result.additionalContext && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-white/40 flex items-center gap-2">
                      <Info className="w-4 h-4 text-purple-400" />
                      Scientific Context
                    </h4>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {result.additionalContext}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-white/10" />
              </div>
              <div className="space-y-2">
                <p className="text-white/30 font-medium">Enter a claim to begin verification</p>
                <p className="text-white/10 text-sm max-w-xs">AstroCheck uses real-time scientific data to validate space-related information.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
