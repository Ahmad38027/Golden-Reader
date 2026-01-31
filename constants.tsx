
import React from 'react';
import { TranslationStrings } from './types';

export const TRANSLATIONS: Record<'ar' | 'en', TranslationStrings> = {
  ar: {
    appName: "القارئ الذهبي",
    heroTitle: "حلل كتابك بلمسة ذهبية",
    heroSub: "التقط صورة للغلاف واحصل على ملخص ذكي وتحليل شامل للفائدة.",
    scanNow: "ابدأ المسح الآن",
    allowCamera: "يرجى السماح بالوصول للكاميرا",
    analyzing: "جاري تحليل الكتاب بأحدث تقنيات الذكاء الاصطناعي...",
    utilityScore: "نسبة الفائدة",
    benefits: "أهم الفوائد",
    targetAge: "الفئة العمرية",
    stats: "إحصائيات ومعلومات",
    author: "المؤلف",
    capturePhoto: "التقط صورة",
    retake: "إعادة المحاولة",
    langToggle: "English",
    unrecognizedError: "تعذر التعرف على الكتاب. يجب أن تكون الصورة المصورة واضحة بنسبة 100% ليتمكن النظام من تحليلها.",
    genericError: "فشل في تحليل الكتاب، يرجى المحاولة مرة أخرى.",
    trustIndicator: "موثوقية التحليل الفكري 100%",
    scanNew: "مسح كتاب جديد",
    copyright: "القارئ الذهبي بالذكاء الاصطناعي",
    cameraInstruction: "وجه الكاميرا نحو غلاف الكتاب بوضوح",
    aiProcessing: "معالجة الذكاء الاصطناعي",
    loadingMessages: [
      "جاري قراءة الغلاف بدقة...",
      "تحليل المحتوى الفكري العميق...",
      "استخراج الفوائد الجوهرية...",
      "تحديد الفئة العمرية بدقة...",
      "صياغة التقرير الذهبي الموثوق..."
    ]
  },
  en: {
    appName: "Golden Reader",
    heroTitle: "Analyze your book with a golden touch",
    heroSub: "Snap a photo of the cover and get a smart summary and comprehensive utility analysis.",
    scanNow: "Start Scanning Now",
    allowCamera: "Please allow camera access",
    analyzing: "Analyzing book with latest AI technology...",
    utilityScore: "Utility Score",
    benefits: "Key Benefits",
    targetAge: "Age Group",
    stats: "Statistics & Info",
    author: "Author",
    capturePhoto: "Capture Photo",
    retake: "Retake",
    langToggle: "العربية",
    unrecognizedError: "Could not recognize the book. The captured image must be 100% clear for the system to analyze it.",
    genericError: "Failed to analyze the book. Please try again.",
    trustIndicator: "100% Intellectual Analysis Reliability",
    scanNew: "Scan New Book",
    copyright: "Golden AI Book Intelligence",
    cameraInstruction: "Point the camera clearly at the book cover",
    aiProcessing: "AI Processing",
    loadingMessages: [
      "Reading cover details precisely...",
      "Analyzing deep intellectual content...",
      "Extracting core benefits...",
      "Verifying target age group...",
      "Crafting your trusted golden report..."
    ]
  }
};

export const Logo = ({ size = "md" }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };
  
  return (
    <div className={`relative flex items-center justify-center ${sizes[size]}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#bf953f' }} />
            <stop offset="50%" style={{ stopColor: '#fcf6ba' }} />
            <stop offset="100%" style={{ stopColor: '#aa771c' }} />
          </linearGradient>
        </defs>
        <path 
          d="M20 15 C 20 10, 80 10, 80 15 L 80 85 C 80 90, 20 90, 20 85 Z" 
          fill="url(#goldGrad)" 
        />
        <path 
          d="M30 25 L 70 25 M 30 35 L 70 35 M 30 45 L 70 45" 
          stroke="#5c4000" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <circle cx="50" cy="65" r="12" fill="none" stroke="#5c4000" strokeWidth="2" />
        <line x1="58" y1="73" x2="68" y2="83" stroke="#5c4000" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};
