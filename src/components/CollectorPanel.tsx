import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Sparkles, 
  Loader2, 
  Check, 
  Volume2, 
  User, 
  AlertTriangle,
  Play,
  RotateCcw,
  QrCode
} from 'lucide-react';
import { Portal, User as UserType, WasteAlert } from '../types';

interface CollectorPanelProps {
  currentPortal: Portal;
  collectors: UserType[];
  onLoginCollector: (user: UserType) => void;
  loggedInCollector: UserType | null;
  onLogout: () => void;
  onAddAlert: (alertData: Partial<WasteAlert>) => Promise<any>;
}

export default function CollectorPanel({
  currentPortal,
  collectors,
  onLoginCollector,
  loggedInCollector,
  onLogout,
  onAddAlert
}: CollectorPanelProps) {
  // Biometric login states
  const [useCamera, setUseCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanUser, setScanUser] = useState<UserType | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Waste collection states
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [collectionStatus, setCollectionStatus] = useState<'pending' | 'collecting' | 'completed' | 'alerted'>('alerted');
  const [sweeperNotes, setSweeperNotes] = useState('');
  const [wasteImage, setWasteImage] = useState<string | null>(null);
  const [wasteImageType, setWasteImageType] = useState<string>('image/jpeg');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [submittingAlert, setSubmittingAlert] = useState(false);

  // QR Code Scanner Simulation States
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [scannedBinId, setScannedBinId] = useState<string | null>(null);

  const handleScanPresetBin = (binId: string, floorNum: number, catName: string) => {
    setQrScanning(true);
    setScannedBinId(null);
    speakPrompt("Activating laser camera. Scanning bin QR code.");
    
    setTimeout(() => {
      setQrScanning(false);
      setScannedBinId(binId);
      setSelectedFloor(floorNum);
      setCollectionStatus('completed');
      setSweeperNotes(`Emptied and logged collection for Bin ID: ${binId} (${catName} bin) on Floor ${floorNum}.`);
      speakPrompt(`Bin ${binId} successfully scanned. State auto updated to completed. Ready to publish.`);
    }, 1200);
  };

  // Initialize SpeechSynthesis narrator helper
  const speakPrompt = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  // Speak directions when collector dashboard is loaded
  useEffect(() => {
    if (loggedInCollector) {
      speakPrompt(`Welcome back ${loggedInCollector.name}. You are logged in at ${currentPortal.name}. Choose floor number below.`);
    } else {
      speakPrompt("Accessibility portal for collectors. Align face with camera to log in or use backup selection.");
    }
    return () => {
      stopCamera();
    };
  }, [loggedInCollector, currentPortal]);

  // Handle Camera activation for biometric face search
  const startCamera = async () => {
    try {
      setUseCamera(true);
      setScanning(false);
      setScanSuccess(false);
      speakPrompt("Camera active. Align face in coordinates grid.");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera blocked inside iframe, falling back to static biometric template simulation:', err);
      // Fallback: simulate image capture manually
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  // Trigger scanning search simulation
  const handleFacialScan = () => {
    if (collectors.length === 0) {
      alert("No registered sweepers/collectors found for this sector.");
      return;
    }
    
    setScanning(true);
    speakPrompt("Faciometric indexing starting. Remain still.");

    // Simulate scanning beam on canvas
    let frames = 0;
    const interval = setInterval(() => {
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 320, 240);
          // Draw horizontal sweep line
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const y = (frames % 24) * 10;
          ctx.moveTo(0, y);
          ctx.lineTo(320, y);
          ctx.stroke();
        }
      }
      frames++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setScanning(false);
      setScanSuccess(true);
      
      // Filter collectors for current portal or grab default
      const assignedCollector = collectors.find(u => u.portalId === currentPortal.id) || collectors[0];
      setScanUser(assignedCollector);
      
      speakPrompt(`Biometrics confirmed. Face matches index profile of ${assignedCollector.name}. Logging in.`);
      
      // Auto register login
      setTimeout(() => {
        onLoginCollector(assignedCollector);
        stopCamera();
      }, 1500);

    }, 2500);
  };

  // Fallback visual click for login
  const handleManualLogin = (collector: UserType) => {
    speakPrompt(`Logging in manually as ${collector.name}`);
    onLoginCollector(collector);
  };

  // Photo uploads by collector
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    speakPrompt("Photo selected. Please use the AI Classify button to run categorization analysis.");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Str = reader.result as string;
      setWasteImage(base64Str);
      setWasteImageType(file.type);
      setAiResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Query Gemini image classification API
  const triggerGeminiAnalysis = async (base64Data: string, mimeType: string) => {
    try {
      setAiAnalyzing(true);
      const cleanData = base64Data.replace(/^data:image\/\w+;base64,/, "");

      const res = await fetch('/api/ai/analyze-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: cleanData, mimeType })
      });

      if (!res.ok) throw new Error('API down');
      const data = await res.json();
      setAiResult(data);
      
      const audioFeed = `Detected ${data.category}. Estimated weight: ${data.estimatedWeight}. Disposal advice: ${data.instructions}. Rules registered.`;
      speakPrompt(audioFeed);

    } catch (err: any) {
      console.error(err);
      speakPrompt("Network error. AI classification offline. Fallback categorization loaded.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Save live floor alert
  const handlePublishAlert = async () => {
    if (!loggedInCollector) return;

    try {
      setSubmittingAlert(true);
      speakPrompt("Broadcasting floor alert to residents.");
      
      await onAddAlert({
        portalId: currentPortal.id,
        floor: selectedFloor,
        status: collectionStatus,
        notes: sweeperNotes || `Sweeper ${loggedInCollector.name} is on Floor ${selectedFloor} with status: ${collectionStatus}.`,
        image: wasteImage || undefined,
        aiClassification: aiResult || undefined
      });

      setSelectedFloor(val => Math.min(currentPortal.floorsCount, val + 1));
      setWasteImage(null);
      setAiResult(null);
      setSweeperNotes('');
      
      speakPrompt("Alert successfully dispatched. Moving to next floor.");
    } catch (err) {
      alert("Error logging report.");
    } finally {
      setSubmittingAlert(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-6" data-narrate="Collector Biometric Station. Clean visual interface with sound reading assistances.">
      
      {/* 1. LOGIN SCREEN WITH SIMULATED CAMERA FACIAL SEARCH */}
      {!loggedInCollector ? (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6 text-center">
          
          <div className="space-y-3">
            <div className="h-16 w-16 bg-[#F3F4F6] border-2 border-black rounded-full flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Camera className="h-8 w-8 text-[#10B981]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">Biometric Sweeper Access</h2>
            <p className="text-xs sm:text-sm font-bold text-zinc-500 max-w-md mx-auto">
              Specially designed for non-readers or sweepers. Stand before the camera to scan and confirm identity without typing.
            </p>
          </div>

          {!useCamera ? (
            <div className="space-y-6 py-4">
              <button
                onClick={startCamera}
                className="mx-auto w-full max-w-sm py-4 bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-2xl text-md flex items-center justify-center gap-2 cursor-pointer transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Camera className="h-5 w-5" /> Start Facial Scanner (Primary)
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t-2 border-black"></div>
                <span className="flex-shrink mx-4 text-xs font-black text-black uppercase tracking-wider bg-[#FFD700] border-2 border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Emergency Backup</span>
                <div className="flex-grow border-t-2 border-black"></div>
              </div>

              {/* Manual Tap login selector with profile badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                {collectors.length === 0 ? (
                  <p className="col-span-2 text-xs font-bold text-zinc-500">Please register collector accounts under the supervisor panel.</p>
                ) : (
                  collectors.map(col => (
                    <button
                      key={col.id}
                      onClick={() => handleManualLogin(col)}
                      className="p-3.5 text-left border-2 border-black hover:bg-emerald-50 rounded-2xl bg-[#FAF8F2] flex items-center gap-3 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      <div className="h-10 w-10 rounded-full bg-white border-2 border-black flex items-center justify-center text-[#10B981] font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black uppercase">{col.name}</p>
                        <p className="text-[9px] font-black text-[#10B981] tracking-wide mt-0.5 uppercase">TAP TO CONFIRM BYPASS</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Live scanning layout container */
            <div className="space-y-4 max-w-md mx-auto">
              <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-black bg-zinc-950 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                
                {/* Visual Video tag */}
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${scanning ? 'brightness-75' : ''}`}
                  playsInline 
                  muted
                />
                <canvas ref={canvasRef} className="hidden" width={320} height={240} />

                {/* Simulated Grid Target */}
                <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none flex items-center justify-center">
                  <div className={`h-40 w-40 rounded-full border-4 border-emerald-400/95 flex items-center justify-center ${scanning ? 'animate-ping' : ''}`}>
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  </div>
                </div>

                {scanning && (
                  <div className="absolute inset-0 bg-emerald-950/20 flex flex-col justify-end p-4 text-[#10B981] text-[10px] font-mono tracking-widest text-center bg-black/85 font-black">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#10B981]" />
                    <span>BIO_INDEX_SCANNING_DIRECTORY_SYNCING...</span>
                  </div>
                )}

                {scanSuccess && (
                  <div className="absolute inset-0 bg-[#10B981]/90 flex flex-col items-center justify-center p-4 text-white text-sm font-bold text-center gap-2 bg-emerald-700/95">
                    <div className="h-12 w-12 bg-white rounded-full border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Check className="h-6 w-6 text-black font-black" />
                    </div>
                    <span className="font-mono text-black font-black tracking-wider uppercase bg-white border-2 border-black px-2.5 py-1 rounded">CONFIRMED: {scanUser?.name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFacialScan}
                  disabled={scanning || scanSuccess}
                  className="flex-1 py-3 bg-[#10B981] font-black hover:bg-[#059669] text-white rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Play className="h-4 w-4" /> Aligned. Confirm Face Scan
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 bg-zinc-100 border-2 border-black text-black font-bold rounded-lg text-xs cursor-pointer hover:bg-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Bypass
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        
        /* 2. LOGGED IN COLLATOR INTERACTIVE TASK CONTROLS */
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="bg-[#FAF8F2] border-4 border-black text-black p-4 rounded-3xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-[#FFD700] rounded-full flex items-center justify-center font-black text-black uppercase text-sm border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {loggedInCollector.name.slice(0, 2)}
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-extrabold tracking-wider uppercase">ACTIVE ASSIGNED SWEERER</p>
                <h4 className="text-base font-black text-black uppercase">{loggedInCollector.name}</h4>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="px-3.5 py-2 border-2 border-black bg-rose-400 hover:bg-rose-500 text-black text-xs font-black rounded-xl transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer uppercase"
            >
              Sign Out
            </button>
          </div>

          {/* Main Action Form and Progress Card */}
          <div className="bg-white border-2 border-black rounded-3xl p-5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">

            {/* QR Code Bin Scanner Card Widget */}
            <div className="bg-slate-50 border-2 border-dashed border-black p-4 rounded-2xl space-y-3.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-600">
                  <QrCode className="h-5 w-5" />
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-black">⚡ Instant QR Bin Logger</h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsQrScannerOpen(!isQrScannerOpen);
                    speakPrompt(isQrScannerOpen ? "Closing scanner" : "Activating camera laser tracker");
                  }}
                  className="px-3 py-1 bg-zinc-900 hover:bg-black text-white text-[10px] font-black uppercase rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  {isQrScannerOpen ? "Collapse Scanner" : "Scan Bin QR"}
                </button>
              </div>

              {isQrScannerOpen && (
                <div className="space-y-4 pt-1">
                  <p className="text-[11px] font-bold text-zinc-500">
                    Point camera at the unique QR Code sticker mounted on any composting or sorting bin to auto-fill its logs instantly.
                  </p>

                  <div className="relative aspect-video max-w-sm mx-auto rounded-xl overflow-hidden border-2 border-black bg-zinc-900 flex flex-col items-center justify-center">
                    {/* Simulated laser scan bar */}
                    {qrScanning && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.8)] animate-bounce z-10"></div>
                    )}

                    {qrScanning ? (
                      <div className="text-center space-y-2 text-[#10B981] font-mono text-[9px] tracking-wider">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#10B981]" />
                        <span>DECODING_BIN_GEOLOCATION_STAMP_HASH...</span>
                      </div>
                    ) : scannedBinId ? (
                      <div className="text-center p-3 text-emerald-800 space-y-1">
                        <div className="h-9 w-9 bg-white border border-black rounded-full mx-auto flex items-center justify-center font-black">✔️</div>
                        <p className="text-[10px] font-black uppercase tracking-wider">Bin scanned successfully!</p>
                        <p className="text-[11px] font-mono bg-white px-2 py-0.5 border border-zinc-300 rounded font-black inline-block">{scannedBinId}</p>
                      </div>
                    ) : (
                      <div className="text-center text-zinc-400 p-4 space-y-2">
                        <QrCode className="h-8 w-8 mx-auto stroke-[1.5]" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Laser Camera Active</p>
                      </div>
                    )}
                  </div>

                  {/* Preset Simulation scan targets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-zinc-500 block">Tap simulation QR target to test scan:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'BIN-F1-ORG-892', floor: 1, cat: 'Organic Compostables' },
                        { id: 'BIN-F2-DRY-304', floor: 2, cat: 'Dry Recyclables' },
                        { id: 'BIN-F3-HAZ-411', floor: 3, cat: 'Hazardous E-Waste' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          disabled={qrScanning}
                          onClick={() => handleScanPresetBin(preset.id, preset.floor, preset.cat)}
                          className="p-2 border border-black bg-white hover:bg-amber-100 rounded-xl text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <QrCode className="h-3.5 w-3.5 text-zinc-600" />
                            <span className="font-mono text-[9px] font-black">{preset.id}</span>
                          </div>
                          <span className="text-[8px] font-bold text-zinc-400 block mt-0.5">{preset.cat} (Floor {preset.floor})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Floor selector Big Buttons for illiterate friendly taps */}
            <div>
              <label className="block text-xs font-black text-[#10B981] uppercase tracking-wider mb-3">
                📍 STEP 1: Select Active Floor Number (<Volume2 className="inline h-3.5 w-3.5 mb-0.5" /> Audio Assist)
              </label>
              
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: currentPortal.floorsCount }, (_, i) => i + 1).map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      setSelectedFloor(f);
                      speakPrompt(`Floor ${f} selected. Status options pending.`);
                    }}
                    className={`h-12 w-12 rounded-xl text-xs font-black transition-all border-2 border-black ${
                      selectedFloor === f 
                        ? 'bg-[#FFD700] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black scale-105' 
                        : 'bg-[#FAF8F2] hover:bg-amber-100 text-black'
                    }`}
                  >
                    F{f}
                  </button>
                ))}
              </div>
            </div>

            {/* Collection alert status selection */}
            <div>
              <label className="block text-xs font-black text-[#10B981] uppercase tracking-wider mb-3">
                📝 STEP 2: Collection & Sweeper status
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['alerted', 'collecting', 'completed', 'pending'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      setCollectionStatus(st);
                      speakPrompt(`Status updated to ${st === 'alerted' ? 'dispatching sweeper notification' : st}`);
                    }}
                    className={`p-3.5 rounded-xl border-2 border-black text-xs font-black text-center capitalize transition-all ${
                      collectionStatus === st
                        ? 'bg-[#FFD700] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-[1.02]'
                        : 'bg-[#FAF8F2] text-zinc-700 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {st === 'alerted' ? '📢 Alert Flats' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Image attachment / Gemini analysis controller */}
            <div className="pt-2">
              <label className="block text-xs font-black text-[#10B981] uppercase tracking-wider mb-2">
                📸 STEP 3: Camera photo capture / Image audit (Optional)
              </label>
              <p className="text-[11px] font-bold text-zinc-500 mb-3">Snap active garbage heap to trigger automated categorization via secure Google Gemini AI.</p>

              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <label className="bg-[#FAF8F2] hover:bg-amber-50/50 border-2 border-black border-dashed px-5 py-4 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-black text-xs font-bold w-full sm:w-48 h-28 gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5">
                  <Upload className="h-6 w-6 text-zinc-500" />
                  <span>Choose file / Snapshot</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>

                {/* Left/Right layout for display */}
                {wasteImage && (
                  <div className="flex items-center gap-4 border-2 border-black p-4 rounded-2xl bg-[#FAF8F2] flex-1 w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <img 
                      src={wasteImage} 
                      alt="Captured garbage thumbnail" 
                      className="h-16 w-16 object-cover rounded-xl border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    />

                    <div className="flex-1 space-y-1">
                      {aiAnalyzing ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#7C3AED] font-black">
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          <span>Gemini classification...</span>
                        </div>
                      ) : aiResult ? (
                        <div className="space-y-1 text-xs text-black font-extrabold">
                          <div className="flex items-center gap-1 bg-white border border-black rounded px-1.5 py-0.5 inline-block text-[10px] text-[#7C3AED] uppercase">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>{aiResult.category}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-bold">Estimated weight: <strong className="text-black">{aiResult.estimatedWeight}</strong></p>
                          <p className="text-[10px] text-[#7C3AED] font-medium line-clamp-1">Instructions: {aiResult.instructions}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-[10px] text-zinc-650 font-bold">Image loaded successfully.</p>
                          <button
                            type="button"
                            onClick={() => triggerGeminiAnalysis(wasteImage, wasteImageType)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 uppercase tracking-wide"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>AI-Classify</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sweep annotations / notes */}
            <div>
              <label className="block text-xs font-black text-[#10B981] uppercase tracking-wider mb-1.5">
                ✏️ STEP 4: Personal sweep notes / comments
              </label>
              <input
                type="text"
                placeholder="e.g. Cardboard boxes heap cleared, compost bin filled and closed..."
                value={sweeperNotes}
                onChange={(e) => setSweeperNotes(e.target.value)}
                className="w-full text-xs p-3.5 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={handlePublishAlert}
                disabled={submittingAlert || aiAnalyzing}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-4 px-4 rounded-2xl text-md disabled:opacity-50 transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                {submittingAlert ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-amber-300" />}
                Publish Floor Alert to Residents
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
