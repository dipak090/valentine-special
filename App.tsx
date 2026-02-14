import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Sparkles, Music, Star, Loader2, Upload, Share2, Copy, Check, ArrowLeft, ExternalLink, AlertCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// --- Configuration ---

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Safely initialize Supabase client
let supabase: any = null;
try {
  if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.error("Supabase initialization failed:", e);
}

// --- Helper for robust URL generation ---
const getCleanBaseUrl = () => {
  const url = new URL(window.location.href);
  return `${url.origin}${url.pathname}`;
};

// --- Types ---
interface Quote {
  text: string;
  author: string;
}

interface ProposalData {
  id: string;
  image_url: string;
  love_name?: string;
}

// --- Constants ---
const QUOTES: Quote[] = [
  { text: "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.", author: "Unknown" },
  { text: "I would rather spend one lifetime with you, than face all the ages of this world alone.", author: "J.R.R. Tolkien" },
  { text: "Whatever our souls are made of, his and mine are the same.", author: "Emily Brontë" },
  { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn" },
  { text: "Grow old along with me! The best is yet to be.", author: "Robert Browning" },
  { text: "You are my sun, my moon, and all my stars.", author: "E.E. Cummings" }
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800";

// --- Components ---

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * (30 - 10) + 10,
      duration: Math.random() * (15 - 5) + 5,
      delay: Math.random() * 10
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="floating-heart text-rose-300 opacity-0"
          style={{
            left: heart.left,
            width: heart.size,
            height: heart.size,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`
          }}
        >
          <Heart fill="currentColor" />
        </div>
      ))}
    </div>
  );
};

const SuccessView: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "I said YES!",
          text: "Check out this beautiful Valentine's proposal!",
          url: window.location.href
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Moment link copied to clipboard!");
      } catch (e) {
        console.error("Clipboard failed", e);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="text-center p-10 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-rose-100 max-w-lg mx-4 relative overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 text-rose-50 opacity-20 rotate-12">
        <Heart size={200} fill="currentColor" />
      </div>
      
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
        className="mb-8 inline-block"
      >
        <div className="bg-rose-500 p-5 rounded-full shadow-lg shadow-rose-200">
          <Heart className="text-white fill-white" size={48} />
        </div>
      </motion.div>

      <h2 className="text-5xl md:text-6xl font-romantic text-rose-600 mb-8 drop-shadow-sm">
        You Made Me The Luckiest!
      </h2>

      <div className="space-y-6 mb-10 relative z-10">
        <p className="text-2xl italic text-rose-800 font-medium leading-relaxed font-romantic">
          "{quote.text}"
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1px] w-8 bg-rose-200" />
          <p className="text-xs text-rose-400 font-bold uppercase tracking-[0.2em]">
            {quote.author}
          </p>
          <div className="h-[1px] w-8 bg-rose-200" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-all shadow-lg active:scale-95"
        >
          <Share2 size={20} /> Share the Moment
        </button>

        <button 
          onClick={onReset}
          className="text-rose-400 hover:text-rose-600 transition-all text-sm font-bold uppercase tracking-widest mt-2"
        >
          Ask again?
        </button>
      </div>
    </motion.div>
  );
};

const ProposalView: React.FC<{ onAccept: () => void, customImage?: string, partnerName?: string }> = ({ onAccept, customImage, partnerName }) => {
  const [noOffset, setNoOffset] = useState({ x: 100, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  const moveNoButton = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const btnWidth = 120;
    const btnHeight = 60;
    const maxX = (container.width / 2) - btnWidth;
    const maxY = (container.height / 2) - btnHeight;
    setNoOffset({ 
      x: (Math.random() * (maxX * 2)) - maxX, 
      y: (Math.random() * (maxY * 2)) - maxY 
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!noBtnRef.current) return;
      const btnRect = noBtnRef.current.getBoundingClientRect();
      const distance = Math.sqrt(
        Math.pow(e.clientX - (btnRect.left + btnRect.width/2), 2) + 
        Math.pow(e.clientY - (btnRect.top + btnRect.height/2), 2)
      );
      if (distance < 160) moveNoButton();
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [moveNoButton]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center p-6 min-h-screen overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center z-10 w-full max-w-3xl">
        <div className="mb-10 relative inline-block">
          <motion.div animate={{ rotate: [0, -2, 2, 0], scale: [1, 1.02, 1] }} transition={{ duration: 6, repeat: Infinity }}>
            <img 
              src={customImage || DEFAULT_IMAGE} 
              alt="Romantic Scene"
              className="rounded-[2.5rem] shadow-2xl border-8 border-white w-72 md:w-96 h-auto object-cover aspect-[4/3]"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
            />
          </motion.div>
          <div className="absolute -bottom-6 -right-6 bg-rose-500 text-white p-4 rounded-full shadow-2xl border-4 border-white">
            <Heart size={32} fill="currentColor" className="animate-pulse" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-romantic text-rose-600 mb-6 drop-shadow-md px-4 leading-tight">
          {partnerName ? `${partnerName}, Will You Be My Valentine?` : "Will You Be My Valentine?"}
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 relative w-full h-48">
          <motion.button
            onClick={onAccept}
            whileHover={{ scale: 1.2, rotate: 2, boxShadow: "0px 0px 40px rgba(244,63,94,0.8)" }}
            whileTap={{ scale: 0.9 }}
            className="group relative px-14 py-6 bg-rose-500 text-white font-bold text-3xl rounded-full shadow-xl flex items-center gap-4 overflow-hidden z-20 transition-all"
          >
            <span className="relative z-10 flex items-center gap-3">
              YES! <Heart size={28} />
            </span>
          </motion.button>

          <motion.button
            ref={noBtnRef}
            animate={{ x: noOffset.x, y: noOffset.y }}
            transition={{ type: "spring", stiffness: 700, damping: 20 }}
            style={{ position: 'absolute' }}
            onMouseEnter={moveNoButton}
            className="px-10 py-5 bg-gray-100 text-gray-400 font-bold text-2xl rounded-full cursor-not-allowed z-10 whitespace-nowrap border-2 border-gray-200"
          >
            No
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const CreatorView: React.FC<{ onCreated: (proposal: ProposalData) => void }> = ({ onCreated }) => {
  const [image, setImage] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newProposal, setNewProposal] = useState<ProposalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError('Missing Cloudinary configuration. Check .env file and restart server.');
      return;
    }

    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Upload failed: ${res.status}`);
      }
      
      const data = await res.json();
      setImage(data.secure_url);
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!image || !supabase) {
      if (!supabase) setError("Configuration error: Database not reachable.");
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('proposals')
        .insert([{ 
          image_url: image,
          love_name: partnerName.trim() || null
        }])
        .select();

      if (dbError) throw dbError;
      if (data && data[0]) {
        setNewProposal(data[0]);
      } else {
        throw new Error("Empty response from database");
      }
    } catch (err) {
      console.error("Supabase error:", err);
      setError("Could not save to database. Make sure your project is active.");
    } finally {
      setIsUploading(false);
    }
  };

  const shareUrl = newProposal ? `${getCleanBaseUrl()}?p=${newProposal.id}` : '';

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error("Copy failed", err));
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full mx-4 p-8 bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border-4 border-rose-100 z-10">
      <h2 className="text-4xl font-romantic text-rose-600 mb-6 text-center">Create Your Proposal</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {!newProposal ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-rose-400 uppercase tracking-widest px-1">
              Who is this for? (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={20} />
              <input 
                type="text"
                placeholder="Partner's Name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-rose-50 border-2 border-rose-100 rounded-2xl focus:outline-none focus:border-rose-300 transition-all text-rose-700 placeholder:text-rose-200"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <label className="block w-full text-sm font-bold text-rose-400 uppercase tracking-widest px-1">
              Your Romantic Photo
            </label>
            <div className="w-full aspect-[4/3] bg-rose-50 rounded-2xl border-2 border-dashed border-rose-200 flex items-center justify-center relative overflow-hidden group">
              {image ? (
                <img src={image} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="text-center p-4">
                  <Upload size={48} className="mx-auto text-rose-300 mb-2" />
                  <p className="text-rose-400 font-medium">Click to upload your favorite photo</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-rose-500" size={40} />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!image || isUploading}
            className={`w-full py-4 rounded-full font-bold text-xl transition-all shadow-lg ${!image || isUploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'}`}
          >
            {isUploading ? 'Preparing magic...' : 'Generate Proposal Link'}
          </button>
        </div>
      ) : (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-6 text-center">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 justify-center mb-2 font-bold">
            <Check size={20} className="text-green-500" /> Link Ready!
          </div>
          
          <div className="relative group">
            <input 
              readOnly 
              value={shareUrl} 
              className="w-full p-4 pr-12 bg-gray-50 border-2 border-rose-100 rounded-2xl text-sm font-mono text-gray-600 focus:outline-none focus:border-rose-300 transition-all"
            />
            <button onClick={copyToClipboard} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 p-2">
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onCreated(newProposal)}
              className="w-full py-4 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              View My Proposal <ExternalLink size={20} />
            </button>
            <button onClick={() => setNewProposal(null)} className="text-rose-400 underline text-sm hover:text-rose-600">Start Over</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [view, setView] = useState<'proposal' | 'creator'>('creator');

  const loadProposal = useCallback(async (id: string) => {
    if (!supabase) {
      setIsLoading(false);
      setView('creator');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (data) {
        setProposalData(data);
        setView('proposal');
      } else {
        setView('creator');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setView('creator');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const proposalId = params.get('p');
    if (proposalId && proposalId.length > 5) {
      loadProposal(proposalId);
    } else {
      setIsLoading(false);
      setView('creator');
    }
  }, [loadProposal]);

  const handleAccept = () => {
    setHasAccepted(true);
    // @ts-ignore
    if (typeof window.confetti === 'function') {
      const end = Date.now() + 4000;
      const colors = ['#fb7185', '#f43f5e', '#ffffff'];
      (function frame() {
        // @ts-ignore
        window.confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        // @ts-ignore
        window.confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
    }
  };

  const handleProposalCreated = (proposal: ProposalData) => {
    try {
      const newUrl = `${getCleanBaseUrl()}?p=${proposal.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (e) {
      console.warn("History state update failed", e);
    }
    setProposalData(proposal);
    setView('proposal');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-rose-50 text-rose-500">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>
          <Heart className="fill-rose-500" size={64} />
        </motion.div>
        <p className="font-romantic text-3xl animate-pulse mt-4 text-center px-4">Sprinkling some love...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-rose-100 flex items-center justify-center relative overflow-hidden">
      <FloatingHearts />
      
      <main className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'creator' ? (
            <CreatorView key="creator" onCreated={handleProposalCreated} />
          ) : !hasAccepted ? (
            <ProposalView 
              key="proposal" 
              onAccept={handleAccept} 
              customImage={proposalData?.image_url} 
              partnerName={proposalData?.love_name}
            />
          ) : (
            <SuccessView key="success" onReset={() => setHasAccepted(false)} />
          )}
        </AnimatePresence>
      </main>

      {view === 'proposal' && !hasAccepted && (
        <motion.button 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => {
            try {
              window.history.pushState({}, '', window.location.pathname);
            } catch (e) {}
            setView('creator');
          }}
          className="fixed top-8 left-8 p-3 bg-white/50 backdrop-blur-sm rounded-full text-rose-400 hover:text-rose-600 z-50 transition-all flex items-center gap-2 font-bold shadow-sm"
        >
          <ArrowLeft size={20} /> Create Your Own
        </motion.button>
      )}

      {/* Decorative Fixed Elements */}
      <div className="fixed bottom-0 left-0 p-10 text-rose-200/50 hidden lg:block"><Music size={60} className="animate-pulse" /></div>
      <div className="fixed top-0 right-0 p-10 text-rose-200/50 hidden lg:block"><Sparkles size={60} className="animate-bounce" /></div>
    </div>
  );
}
