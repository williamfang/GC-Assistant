
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Upload, RefreshCw, Volume2, AlertCircle, Scan, X, Sparkles, CheckCircle2, Info, BrainCircuit, ArrowLeft } from 'lucide-react';
import { CameraView } from './components/CameraView';
import { ResultOverlay } from './components/ResultOverlay';
import { classifyGarbage } from './services/geminiService';
import { DetectionResult } from './types';
import { CATEGORY_BG, CATEGORY_DESCRIPTION } from './constants';

const App: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const playSuccessSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
  };

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await classifyGarbage(base64);
      setResults(response.results);
      
      if (response.results.length > 0) {
        playSuccessSound();
        const main = response.results[0];
        speak(`这是${main.name}，它是${main.category}。`);
      } else {
        speak("没看清，请再试一次。");
      }
    } catch (err) {
      setError("AI 识别暂时不可用。");
      speak("系统出了点小状况。");
    } finally {
      setIsProcessing(false);
    }
  };

  // 自动拍照逻辑
  useEffect(() => {
    let timer: number;
    if (isCameraActive) {
      setAutoCaptureCountdown(3); // 3秒倒计时
      timer = window.setInterval(() => {
        setAutoCaptureCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleManualCapture();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoCaptureCountdown(null);
    }
    return () => clearInterval(timer);
  }, [isCameraActive]);

  const handleManualCapture = () => {
    const video = document.querySelector('video');
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        handleCapture(base64);
      }
    }
  };

  const handleCapture = (base64: string) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64}`;
    img.onload = () => {
      setImgSize({ width: img.width, height: img.height });
      setCapturedImage(img.src);
      setIsCameraActive(false);
      processImage(base64);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          setImgSize({ width: img.width, height: img.height });
          setCapturedImage(img.src);
          setIsCameraActive(false);
          processImage(base64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setResults([]);
    setCapturedImage(null);
    setIsCameraActive(false);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* 头部 - 紧凑设计 */}
      <header className="bg-white px-5 py-4 shadow-sm border-b flex justify-between items-center z-40">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">智能分类AI</h1>
          <p className="text-indigo-600 text-sm font-bold flex items-center gap-1">
             <BrainCircuit size={14} /> Gemini 智能引擎
          </p>
        </div>
        <button 
          onClick={() => speak("请对准垃圾拍照，我会自动为你分类。")} 
          className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 active:scale-95 transition-all"
        >
          <Volume2 size={24} />
        </button>
      </header>

      <main className="flex-grow relative flex flex-col p-4">
        {/* 核心视窗 - 占据主要空间 */}
        <div className="relative w-full flex-grow bg-slate-200 rounded-[2rem] shadow-xl overflow-hidden border-4 border-white">
          {isCameraActive ? (
            <div className="relative h-full">
              <CameraView onCapture={handleCapture} isActive={isCameraActive} />
              <div className="scan-line"></div>
              
              {/* 自动识别提示 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl mt-72">
                  <p className="text-white text-xl font-bold">正在自动对焦...</p>
                </div>
              </div>

              {/* 倒计时 */}
              {autoCaptureCountdown !== null && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 px-8 py-2 rounded-full shadow-lg">
                  <p className="text-indigo-600 text-2xl font-black">
                    {autoCaptureCountdown} 秒后自动识别
                  </p>
                </div>
              )}

              <button 
                onClick={() => setIsCameraActive(false)}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border-2 border-white/50 z-50 pointer-events-auto"
              >
                <X size={32} />
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative h-full bg-slate-800">
              <img src={capturedImage} className="w-full h-full object-contain" alt="Captured" />
              <ResultOverlay results={results} imageDimensions={imgSize} />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
                  <div className="scan-line"></div>
                  <RefreshCw size={60} className="text-indigo-400 animate-spin mb-4" />
                  <span className="text-2xl font-black text-white px-8 text-center leading-tight">
                    正在分析物品材质...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6 bg-slate-50">
              <div className="w-32 h-32 bg-white rounded-full shadow-inner flex items-center justify-center border-2 border-slate-100">
                <Scan size={64} className="text-slate-300" />
              </div>
              <div className="text-center px-8">
                <p className="text-2xl font-black text-slate-500 mb-2">对准物体，自动识别</p>
                <p className="text-lg font-bold text-slate-400">点击下方蓝色按钮开始</p>
              </div>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4 text-xl font-bold z-50">
            <AlertCircle size={32} />
            <p>{error}</p>
          </div>
        )}

        {/* 全屏结果展示 - 沉浸式设计 */}
        {results.length > 0 && !isProcessing && (
          <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <div className={`flex-grow flex flex-col ${CATEGORY_BG[results[0].category]} p-8 text-white relative`}>
              {/* 背景修饰 */}
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

              <div className="flex-grow flex flex-col justify-center items-center text-center">
                <div className="bg-white/20 p-4 rounded-3xl mb-8 animate-bounce">
                   <CheckCircle2 size={80} />
                </div>
                
                <span className="text-2xl font-bold bg-white/25 px-6 py-2 rounded-2xl mb-6 inline-block">识别到物品</span>
                <h2 className="text-5xl font-black leading-tight mb-4 tracking-tight drop-shadow-lg">
                  {results[0].name}
                </h2>
                
                <div className="bg-white text-slate-900 px-10 py-4 rounded-3xl text-4xl font-black shadow-2xl mb-12">
                  {results[0].category}
                </div>

                <div className="bg-black/10 backdrop-blur-md p-8 rounded-[2rem] w-full max-w-sm border border-white/20 shadow-inner">
                  <div className="flex items-center justify-center gap-3 mb-4 text-white/90">
                    <Info size={28} />
                    <span className="text-2xl font-bold tracking-wide">投放建议</span>
                  </div>
                  <p className="text-2xl font-medium leading-relaxed">
                    {CATEGORY_DESCRIPTION[results[0].category]}
                  </p>
                </div>
              </div>

              <button 
                onClick={reset}
                className="mt-8 py-6 bg-white text-slate-800 rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                <RefreshCw size={32} className="text-indigo-600" />
                识别下一个
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 底部控制栏 - 极简化 */}
      <footer className="bg-white/95 backdrop-blur-2xl border-t p-6 flex gap-4 h-32 flex-shrink-0 z-40">
        <button
          onClick={() => {
            reset();
            setIsCameraActive(true);
            speak("准备自动识别，请保持物品在中心。");
          }}
          className="flex-[2.5] bg-indigo-600 text-white flex items-center justify-center gap-4 rounded-[2rem] shadow-xl active:scale-95 transition-all pulse-btn"
        >
          <Camera size={40} />
          <span className="text-2xl font-black tracking-widest">相机识别</span>
        </button>

        <label className="flex-1 bg-slate-800 text-white flex items-center justify-center rounded-[2rem] shadow-lg active:scale-95 transition-all cursor-pointer">
          <Upload size={32} />
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </footer>
    </div>
  );
};

export default App;
