
import React, { useState, useEffect, useRef } from 'react';
import { BookAnalysis, Language, TranslationStrings } from './types';
import { TRANSLATIONS, Logo } from './constants';
import { analyzeBook, translateReport } from './services/gemini';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [lang, setLang] = useState<Language>('ar');
  const [view, setView] = useState<'home' | 'camera' | 'loading' | 'result'>('home');
  const [analysis, setAnalysis] = useState<BookAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [errorKey, setErrorKey] = useState<keyof TranslationStrings | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = TRANSLATIONS[lang];

  // تحديث عنوان المتصفح عند تغيير اللغة
  useEffect(() => {
    document.title = t.appName;
  }, [lang, t.appName]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (view === 'loading') {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % t.loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [view, t.loadingMessages.length]);

  useEffect(() => {
    if (view === 'result' && analysis && !isTranslating) {
      setAnimatedScore(0);
      let start = 0;
      const end = analysis.utilityScore;
      if (end === 0) return;
      const duration = 1500;
      const stepTime = Math.max(10, Math.floor(duration / end));
      const timer = setInterval(() => {
        start += 1;
        setAnimatedScore(start);
        if (start >= end) {
          setAnimatedScore(end);
          clearInterval(timer);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [view, analysis, isTranslating]);

  useEffect(() => {
    if (view === 'camera') {
      const initCamera = async () => {
        setIsCameraReady(false);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = async () => {
              try { 
                await videoRef.current?.play(); 
                setIsCameraReady(true); 
              } catch (e) {
                console.error("Video play failed", e);
              }
            };
          }
        } catch (err: any) {
          console.error("Camera Access Error:", err);
          setErrorKey('allowCamera');
          setView('home');
        }
      };
      initCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [view]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      if (context) {
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        context.drawImage(video, 0, 0, width, height);
        
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.65);
        setCapturedImage(dataUrl);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        processAnalysis(dataUrl);
      }
    }
  };

  const processAnalysis = async (imageData: string) => {
    setView('loading');
    setErrorKey(null);
    try {
      const b64Data = imageData.split(',')[1];
      const result = await analyzeBook(b64Data, lang);
      if (result === "UNRECOGNIZED") { 
        setErrorKey('unrecognizedError'); 
        setView('home'); 
      } else { 
        setAnalysis(result); 
        setView('result'); 
      }
    } catch (err) { 
      console.error("Full Process Error:", err);
      setErrorKey('genericError'); 
      setView('home'); 
    }
  };

  const toggleLanguage = async () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;

    if (view === 'result' && analysis) {
      setIsTranslating(true);
      try {
        const translated = await translateReport(analysis, newLang);
        setAnalysis(translated);
      } catch (err) {
        console.error("Translation failed", err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  if (showSplash) {
    return (
      <div className={`fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-[200] ${lang === 'ar' ? 'arabic-font' : 'english-font'}`}>
        <div className="animate-pulse scale-125"><Logo size="lg" /></div>
        <h1 className="mt-10 text-2xl md:text-3xl font-black gold-gradient tracking-tight text-center leading-loose pb-4">
          {t.appName}
        </h1>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#0f172a] text-slate-200 transition-all duration-500 ${lang === 'ar' ? 'arabic-font' : 'english-font'}`}>
      <header className="p-4 flex items-center justify-between border-b border-amber-500/20 bg-[#1e293b]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-base sm:text-lg font-black gold-gradient leading-relaxed pb-1">{t.appName}</h1>
        </div>
        <button 
          onClick={toggleLanguage} 
          disabled={isTranslating}
          className={`px-4 py-1.5 rounded-lg border border-amber-500/50 text-amber-400 font-black text-xs sm:text-sm hover:bg-amber-500/10 transition-colors ${isTranslating ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isTranslating ? (lang === 'ar' ? 'جاري...' : 'Switching...') : t.langToggle}
        </button>
      </header>

      <main className="flex-1 flex flex-col w-full">
        {view === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-10 animate-fadeIn">
            <div className="relative p-8 rounded-full bg-slate-900 border-2 border-amber-500/30 shadow-[0_0_50px_rgba(191,149,63,0.15)]">
              <Logo size="lg" />
            </div>
            <div className="max-w-2xl space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-white leading-relaxed">{t.heroTitle}</h2>
              <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">{t.heroSub}</p>
            </div>
            {errorKey && (
              <div className="max-w-md mx-auto text-red-400 bg-red-500/10 p-5 rounded-2xl border border-red-500/30 shadow-lg text-center transition-all duration-300">
                <p className="font-bold text-sm sm:text-base">{t[errorKey] as string}</p>
              </div>
            )}
            <button onClick={() => setView('camera')} className="gold-bg text-slate-950 px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:brightness-110 active:scale-95 transition-all">
              {t.scanNow}
            </button>
          </div>
        )}

        {view === 'camera' && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
            <div className={`absolute inset-0 z-[110] bg-white transition-opacity duration-150 ${flash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute top-8 inset-x-0 text-center z-[120]">
              <span className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white text-sm font-bold">{t.cameraInstruction}</span>
            </div>
            <div className="absolute bottom-16 inset-x-0 flex justify-center items-center gap-10 z-[120]">
              <button onClick={() => setView('home')} className="w-14 h-14 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white active-scale">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button onClick={capturePhoto} disabled={!isCameraReady} className={`w-20 h-20 rounded-full border-4 border-amber-500 flex items-center justify-center p-2 ${!isCameraReady ? 'opacity-30' : 'bg-transparent active:scale-90 transition-transform'}`}>
                <div className="w-full h-full rounded-full bg-white"></div>
              </button>
              <div className="w-14 h-14"></div>
            </div>
          </div>
        )}

        {(view === 'loading' || isTranslating) && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-10 animate-fadeIn">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              <div className="absolute inset-0 border-[6px] sm:border-[8px] border-amber-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-[6px] sm:border-[8px] border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 overflow-hidden rounded-full shadow-2xl border-2 border-amber-500/20">
                {capturedImage && <img src={capturedImage} alt="Cover" className="w-full h-full object-cover" />}
              </div>
            </div>
            <div className="space-y-4 px-4">
              <h2 className="text-lg sm:text-xl font-black gold-gradient animate-pulse leading-relaxed pb-1">
                {isTranslating ? (lang === 'ar' ? 'جاري ترجمة النتائج...' : 'Translating results...') : t.loadingMessages[loadingMsgIdx]}
              </h2>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] sm:text-xs">{t.aiProcessing}</p>
            </div>
          </div>
        )}

        {view === 'result' && analysis && !isTranslating && (
          <div className="flex-1 container mx-auto px-4 py-8 lg:px-12 max-w-6xl space-y-8 animate-fadeIn">
            <div className="bg-slate-800/60 border-2 border-amber-500/30 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
              <div className="p-6 sm:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-4 w-full flex justify-center">
                    <div className="relative w-full max-w-[240px] sm:max-w-[280px] aspect-[3/4.2] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl">
                       {capturedImage && <img src={capturedImage} alt="Cover" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                  <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-4 text-center lg:text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-500 text-[10px] sm:text-xs font-black uppercase tracking-wider">{analysis.targetAge}</span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-relaxed">{analysis.title}</h2>
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                        <span className="text-amber-500/80 text-sm sm:text-base font-black">{t.author}:</span>
                        <span className="text-white text-lg sm:text-xl font-bold">{analysis.author}</span>
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 italic text-gray-300 text-base sm:text-lg leading-relaxed">"{analysis.summary}"</div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 sm:gap-10">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg viewBox="-30 -30 180 180" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="62" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-700/30" />
                          <circle cx="60" cy="60" r="62" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray={389.55} strokeDashoffset={389.55 - (389.55 * animatedScore) / 100} className="text-amber-500 transition-all duration-300 ease-out" strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-3xl sm:text-4xl font-black text-white tracking-tighter">{animatedScore}%</span>
                      </div>
                      <div className="text-center lg:text-right">
                        <h4 className="text-amber-500 font-black text-xl sm:text-2xl mb-1">{t.utilityScore}</h4>
                        <p className="text-gray-400 text-sm sm:text-base font-bold">{t.trustIndicator}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-slate-800/40 p-6 sm:p-8 rounded-[2rem] border border-amber-500/20 backdrop-blur-sm shadow-xl flex flex-col">
                <h3 className="text-lg sm:text-xl font-black text-white mb-6 flex items-center gap-3">
                   <span className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_#bf953f]"></span>
                   {t.benefits}
                </h3>
                <ul className="space-y-5 flex-1">
                  {analysis.benefits.map((b, i) => (
                    <li key={i} className="flex gap-4 items-start text-gray-200 group">
                      <div className="mt-1 p-1 bg-amber-500 rounded-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4" strokeLinecap="round"/></svg>
                      </div>
                      <span className="text-base sm:text-lg font-bold leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800/40 p-6 sm:p-8 rounded-[2rem] border border-amber-500/20 backdrop-blur-sm shadow-xl flex flex-col">
                <h3 className="text-lg sm:text-xl font-black text-white mb-6 flex items-center gap-3">
                   <span className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_#bf953f]"></span>
                   {t.stats}
                </h3>
                <div className="space-y-3 flex-1">
                  {analysis.stats
                    .filter(s => !s.label.includes("غلاف") && !s.label.toLowerCase().includes("cover"))
                    .map((s, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-white/5 transition-all hover:border-amber-500/30 gap-1 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#bf953f]"></div>
                        <span className="text-gray-400 font-bold text-sm sm:text-base uppercase tracking-tight">{s.label}</span>
                      </div>
                      <span className="text-amber-500 font-black text-base sm:text-lg">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6 pb-12">
              <button onClick={() => setView('home')} className="px-10 py-4 bg-slate-900 border-2 border-amber-500/50 text-amber-400 rounded-2xl font-black text-lg sm:text-xl shadow-2xl active-scale hover:bg-amber-500/10 transition-all">
                {t.scanNew}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-10 text-center opacity-40">
        <p className="text-[10px] sm:text-xs font-black tracking-widest gold-gradient uppercase leading-relaxed pb-2">
          {t.copyright} &copy; {new Date().getFullYear()}
        </p>
      </footer>

      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
