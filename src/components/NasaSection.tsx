import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { Info, Calendar, Camera, Video, AlertCircle } from "lucide-react";

interface ApodData {
  title: string;
  url: string;
  explanation: string;
  date: string;
  media_type: "image" | "video" | string;
  copyright?: string;
  isFallback?: boolean;
}

export default function NasaSection() {
  const [data, setData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/nasa/apod");
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.details || err.message || "Failed to load Astronomy Picture of the Day");
        } else {
          setError("Failed to load Astronomy Picture of the Day");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
  };

  const renderMedia = () => {
    if (!data || !data.url) {
      return (
        <div className="aspect-video bg-white/5 flex flex-col items-center justify-center text-white/40 gap-4">
          <AlertCircle className="w-12 h-12" />
          <p>Media content missing or unavailable</p>
        </div>
      );
    }

    if (data.media_type === "image") {
      return (
        <img 
          src={data.url} 
          alt={data.title}
          className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      );
    }

    if (data.media_type === "video") {
      return (
        <iframe
          src={getEmbedUrl(data.url)}
          title={data.title}
          className="w-full aspect-video border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <div className="aspect-video bg-white/5 flex flex-col items-center justify-center text-white/40 gap-4">
        <AlertCircle className="w-12 h-12" />
        <p>Content type "{data.media_type}" not supported</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-12 bg-red-900/10 border border-red-500/20 rounded-3xl space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Connection Issue</h3>
          <p className="text-red-400/80 max-w-md mx-auto">{error || "The NASA API is currently unreachable. This might be a temporary network issue."}</p>
          {error?.includes("DEMO_KEY") && (
            <p className="text-white/40 text-xs mt-4">
              Tip: Get a free personal API key at <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">api.nasa.gov</a> to avoid demo limits.
            </p>
          )}
        </div>
        <button 
          onClick={handleRetry}
          className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {data.isFallback && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 text-blue-400 text-sm">
          <Info className="w-5 h-5 shrink-0" />
          <p>
            The live NASA APOD service is currently unreachable. Showing a featured fallback image instead. 
            <button onClick={handleRetry} className="ml-2 underline hover:text-blue-300 font-bold">Try Reconnecting</button>
          </p>
        </div>
      )}

      <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-blue-500/10 bg-black">
        {renderMedia()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8 pointer-events-none">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            {data.media_type === "video" ? <Video className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span>NASA Astronomy {data.media_type === "video" ? "Video" : "Picture"} of the Day</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white">{data.title}</h2>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{data.date}</span>
            </div>
            {data.copyright && (
              <div className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                <span>© {data.copyright}</span>
              </div>
            )}
          </div>
          <p className="text-lg text-white/80 leading-relaxed">
            {data.explanation}
          </p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit space-y-4">
          <h3 className="text-xl font-semibold text-blue-400">Space Fact</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            NASA's Astronomy Picture of the Day (APOD) has been providing a new image and explanation of our universe every single day since June 16, 1995.
          </p>
          <div className="pt-4">
            <a 
              href="https://apod.nasa.gov/apod/astropix.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
            >
              Visit Official APOD →
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
