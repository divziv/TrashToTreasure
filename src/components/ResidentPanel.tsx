import React, { useState } from 'react';
import { 
  Megaphone, 
  MessageSquare, 
  AlertTriangle, 
  Plus, 
  Gift, 
  Loader2, 
  Check, 
  Sparkles, 
  Trash2,
  Calendar,
  Layers,
  Heart,
  Award,
  Leaf,
  ShieldCheck,
  Download,
  Volume2,
  VolumeX,
  Camera,
  TrendingUp
} from 'lucide-react';
import { 
  Portal, 
  Complaint, 
  DonationItem, 
  FlatAlertNotification, 
  User 
} from '../types';

interface ResidentPanelProps {
  currentPortal: Portal;
  loggedInUser: User | null;
  notifications: FlatAlertNotification[];
  donations: DonationItem[];
  onSubmitComplaint: (compData: Partial<Complaint>) => Promise<void>;
  onSubmitDonation: (donData: Partial<DonationItem>) => Promise<void>;
  loading: boolean;
}

export default function ResidentPanel({
  currentPortal,
  loggedInUser,
  notifications,
  donations,
  onSubmitComplaint,
  onSubmitDonation,
  loading
}: ResidentPanelProps) {
  // Navigation inside panel
  const [activeTab, setActiveTab] = useState<'notifs' | 'complaints' | 'donate' | 'ledger'>('notifs');

  // Personal sustainable donation ledger
  const [ledger, setLedger] = useState([
    { id: 'l1', date: '22 Jun 2026', title: '12 Engineering Textbooks', category: 'Books', co2SavedKg: 4.8, pointsEarned: 240 },
    { id: 'l2', date: '21 Jun 2026', title: '8 Woolen Sweaters', category: 'Clothes', co2SavedKg: 12.0, pointsEarned: 600 },
    { id: 'l3', date: '20 Jun 2026', title: '5 Kg Fresh Wheat packets', category: 'Food', co2SavedKg: 7.5, pointsEarned: 375 },
  ]);

  const [claimedCoupons, setClaimedCoupons] = useState<string[]>([]);
  const handleClaimCoupon = (couponName: string, cost: number) => {
    setClaimedCoupons(prev => [...prev, couponName]);
    triggerParticles();
    alert(`🎉 Successfully claimed: "${couponName}"!\nYour unique Eco-Voucher code: ECO-${Math.random().toString(36).substr(2, 6).toUpperCase()}\nShow this to the society caretaker or merchant to redeem.`);
  };

  // Resident floor filter
  const [residentFloor, setResidentFloor] = useState<number>(1);

  // Scheduling Pickups States
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('11:00 AM - 01:00 PM');
  const [scheduledPickups, setScheduledPickups] = useState<Array<{id: string, date: string, timeSlot: string, itemType: string, status: 'awaiting' | 'assigned' | 'completed'}>>([
    { id: 'p-1', date: '25 Jun 2026', timeSlot: '09:00 AM - 11:00 AM', itemType: 'Textbooks', status: 'completed' },
    { id: 'p-2', date: '28 Jun 2026', timeSlot: '04:00 PM - 06:00 PM', itemType: 'Woolen Sweaters', status: 'assigned' }
  ]);

  // Gemini Chatbot States
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', text: string}>>([
    { role: 'assistant', text: 'Hello! I am your AI Recycling Guide. Ask me any question about sorting categories, bin policies, or donation suitability guidelines.' }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Personalized Eco-Tips States
  const [ecoCategory, setEcoCategory] = useState<string>('Composting');
  const [ecoTip, setEcoTip] = useState<string>('Add dry garden leaves or cardboard scraps above kitchen organic waste to eliminate fruit flies and balance nitrogen levels.');
  const [ecoTipLoading, setEcoTipLoading] = useState<boolean>(false);

  // Sustainability Streak States
  const [ecoStreak, setEcoStreak] = useState<number>(8);
  const [hasLoggedToday, setHasLoggedToday] = useState<boolean>(false);

  const handleIncrementStreak = () => {
    if (hasLoggedToday) return;
    setEcoStreak(prev => prev + 1);
    setHasLoggedToday(true);

    // Add Eco-Disposal points to ledger!
    const newEntry = {
      id: `l-disposal-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: 'Daily Segregated Waste Disposal Task',
      category: 'DISPOSAL',
      co2SavedKg: 1.5,
      pointsEarned: 75
    };
    setLedger(prev => [newEntry, ...prev]);

    triggerParticles();
    alert("Incredible! Segregated Waste Disposal logged. Streak increased to " + (ecoStreak + 1) + " days. +75 Pts earned! 🌱🔥");
  };

  // Local caching (IndexedDB/LocalStorage Simulation)
  const [cachedNotifs, setCachedNotifs] = useState<FlatAlertNotification[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Synchronize notifications to local cache (simulated IndexedDB storage offline safety)
  React.useEffect(() => {
    if (notifications && notifications.length > 0) {
      localStorage.setItem(`cached-notifs-${currentPortal.id}`, JSON.stringify(notifications));
      setCachedNotifs(notifications);
    } else {
      const saved = localStorage.getItem(`cached-notifs-${currentPortal.id}`);
      if (saved) {
        setCachedNotifs(JSON.parse(saved));
        setIsOfflineMode(true);
      }
    }
  }, [notifications, currentPortal.id]);

  // Fetch Personalized Eco Tip from backend
  const fetchEcoTip = async (categoryName: string) => {
    try {
      setEcoTipLoading(true);
      const res = await fetch('/api/ai/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryName })
      });
      const data = await res.json();
      if (data.tip) {
        setEcoTip(data.tip);
      }
    } catch {
      // safe fallback tip
      setEcoTip('Avoid storing plastic wrappers with general paper scrap; separate them to facilitate processing.');
    } finally {
      setEcoTipLoading(false);
    }
  };

  // Submit chat query to Gemini helper
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'I am temporarily offline. Please ensure dry materials go in the blue bins and wet organics go in the green bins!' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle scheduling pickup action
  const handleSchedulePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate) return;
    const newPickup = {
      id: `p-${Date.now()}`,
      date: new Date(pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeSlot: pickupTimeSlot,
      itemType: donTitle || 'Unspecified Goods',
      status: 'awaiting' as const
    };
    setScheduledPickups(prev => [newPickup, ...prev]);
    triggerParticles();
    alert("Donation Pickup scheduled! Local NGO will confirm assignment.");
  };

  // Export Donation list as CSV locally
  const exportDonationLedgerToCSV = () => {
    const headers = ['Receipt ID', 'Date', 'Item Description', 'Category', 'Carbon Mitigated (kg)', 'Points Gained'];
    const rows = ledger.map(item => [
      item.id,
      item.date,
      `"${item.title.replace(/"/g, '""')}"`,
      item.category,
      item.co2SavedKg,
      item.pointsEarned
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Swachh_Bharat_My_Donations_Log_${loggedInUser?.name || 'Resident'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Complaint form states
  const [compTitle, setCompTitle] = useState('');
  const [compCat, setCompCat] = useState<'delay' | 'missed' | 'spilt' | 'sorting_issue' | 'others'>('delay');
  const [compDesc, setCompDesc] = useState('');
  const [submittingComp, setSubmittingComp] = useState(false);

  // Complaint photo and AI classification states
  const [complaintPhoto, setComplaintPhoto] = useState<string | null>(null);
  const [isClassifyingComp, setIsClassifyingComp] = useState(false);
  const [compAiFeedback, setCompAiFeedback] = useState<{
    predictedCategory: 'spilt' | 'sorting_issue' | 'delay' | 'others';
    severityRating: 'low' | 'medium' | 'high';
    confidenceScore: number;
    summaryTags: string[];
    auditNotes: string;
  } | null>(null);

  const handleComplaintPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setComplaintPhoto(reader.result as string);
      setCompAiFeedback(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerMockComplaintCapture = () => {
    // Simulated realistic complaint capture
    setComplaintPhoto('MOCK_COMPLAINT_IMAGE');
    setCompAiFeedback(null);
  };

  const runComplaintAiClassification = async () => {
    if (!complaintPhoto) {
      alert("Please capture or upload a complaint photo first.");
      return;
    }

    try {
      setIsClassifyingComp(true);
      setCompAiFeedback(null);

      let cleanBase64 = complaintPhoto;
      if (cleanBase64 === 'MOCK_COMPLAINT_IMAGE') {
        cleanBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      } else if (cleanBase64.includes('base64,')) {
        cleanBase64 = cleanBase64.split('base64,')[1];
      }

      const res = await fetch('/api/ai/classify-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: cleanBase64, mimeType: 'image/png' })
      });
      const data = await res.json();
      setCompAiFeedback(data);

      if (data.predictedCategory) {
        setCompCat(data.predictedCategory);
      }
      if (data.auditNotes) {
        setCompDesc(prev => prev ? `${prev}\n\n[AI Vision Check: ${data.auditNotes}]` : `[AI Vision Check: ${data.auditNotes}]`);
      }
    } catch {
      alert("AI Classification failed.");
    } finally {
      setIsClassifyingComp(false);
    }
  };

  // Donation form states
  const [donTitle, setDonTitle] = useState('');
  const [donCat, setDonCat] = useState<'clothes' | 'food' | 'books' | 'others'>('clothes');
  const [donQty, setDonQty] = useState('');
  const [donDesc, setDonDesc] = useState('');
  const [donContact, setDonContact] = useState('');
  const [submittingDon, setSubmittingDon] = useState(false);

  // AI Waste Material Scanner States
  const [wasteImageBase64, setWasteImageBase64] = useState<string>('');
  const [wasteMimeType, setWasteMimeType] = useState<string>('');
  const [isScanningWaste, setIsScanningWaste] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<{
    category: string;
    recyclability: string;
    instructions: string;
    estimatedWeight: string;
    carbonOffset: string;
  } | null>(null);
  const [scannerError, setScannerError] = useState<string>('');

  const handleWastePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError('');
    setScannedResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setWasteImageBase64(reader.result as string);
      setWasteMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const runWasteImageAnalysis = async (customBase64?: string, customMime?: string) => {
    const finalBase64 = customBase64 || wasteImageBase64;
    const finalMime = customMime || wasteMimeType;

    if (!finalBase64) {
      setScannerError('Please capture or upload an image first.');
      return;
    }

    setIsScanningWaste(true);
    setScannerError('');
    setScannedResult(null);

    // Strip header if present
    const cleanBase64 = finalBase64.includes('base64,') 
      ? finalBase64.split('base64,')[1] 
      : finalBase64;

    try {
      const response = await fetch('/api/ai/analyze-waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Data: cleanBase64,
          mimeType: finalMime || 'image/jpeg'
        })
      });

      if (!response.ok) {
        throw new Error('Server returned ' + response.status);
      }

      const data = await response.json();
      setScannedResult(data);
      triggerParticles();
    } catch (err: any) {
      console.error('Error analyzing waste image:', err);
      setScannerError('Could not analyze item. Using smart local fallback.');
      
      // Smart offline fallback
      setScannedResult({
        category: "Dry Household Recyclables",
        recyclability: "80% Recyclable Yield",
        instructions: "Rinse completely, separate metal or plastic caps, and place in the dry blue sorting vault.",
        estimatedWeight: "0.4 Kg",
        carbonOffset: "0.2 Kg CO2e"
      });
    } finally {
      setIsScanningWaste(false);
    }
  };

  // Particle and Voice state declarations
  const [particles, setParticles] = useState<{ id: number; dx: number; dy: number; size: number; color: string }[]>([]);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Trigger a gorgeous visual burst of particles centered on user action
  const triggerParticles = () => {
    const colors = ['#10B981', '#34D399', '#059669', '#FBBF24', '#F59E0B', '#06B6D4', '#6D28D9'];
    const pArray = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i + Math.floor(Math.random() * 1000),
      dx: (Math.random() - 0.5) * 360,
      dy: (Math.random() - 0.5) * 280 - 120, // favor upwards floating direction
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(pArray);
    setTimeout(() => {
      setParticles([]);
    }, 1500);
  };

  // Speaks aloud the bulletins for residents
  const handleSpeakNotifs = () => {
    if (!('speechSynthesis' in window)) {
      alert("Web Speech API Text-to-speech is not supported in this browser.");
      return;
    }
    
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }
    
    setIsPlayingVoice(true);
    
    const textToSpeak = activeNotifs.length === 0
      ? `Everything fully cleared. You have no active environmental hazard alerts or notices for Level ${residentFloor}.`
      : `Reading ${activeNotifs.length} floor bulletins for Level ${residentFloor}. ` +
        activeNotifs.map((notif, idx) => 
          `Bulletin number ${idx + 1}. Title: ${notif.title}. Priority level: ${notif.severity}. Message details: ${notif.body}. Dispatched by: ${notif.senderName}.`
        ).join(" ");
        
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => {
      setIsPlayingVoice(false);
    };
    utterance.onerror = () => {
      setIsPlayingVoice(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  React.useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // AI donation audit states
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);

  // Notification Filters
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'maintenance' | 'community' | 'donation' | 'other'>('all');

  const getNotificationCategory = (notif: FlatAlertNotification): 'maintenance' | 'community' | 'donation' | 'other' => {
    const text = (notif.title + ' ' + notif.body).toLowerCase();
    if (text.includes('clean') || text.includes('spill') || text.includes('maintenance') || text.includes('refuse') || text.includes('bin') || text.includes('floor') || text.includes('sweeper')) {
      return 'maintenance';
    }
    if (text.includes('community') || text.includes('announcement') || text.includes('campaign') || text.includes('meeting') || text.includes('notice') || text.includes('celebration')) {
      return 'community';
    }
    if (text.includes('donation') || text.includes('hub') || text.includes('gift') || text.includes('charity') || text.includes('ngo') || text.includes('drop')) {
      return 'donation';
    }
    return 'other';
  };

  // Compile active notices relevant to resident's selected floor
  const activeNotifs = notifications.filter(notif => {
    if (notif.portalId !== currentPortal.id) return false;
    // Broadcast notices have floor = -1
    const floorMatch = notif.floor === -1 || notif.floor === residentFloor;
    if (!floorMatch) return false;

    // Severity filter match
    if (severityFilter !== 'all' && notif.severity !== severityFilter) return false;

    // Category filter match
    if (categoryFilter !== 'all') {
      const notifCat = getNotificationCategory(notif);
      if (notifCat !== categoryFilter) return false;
    }

    return true;
  });

  // Filter urgent bin image alerts classified as 'Full' or 'Critical'
  const urgentBinAlerts = activeNotifs.filter(n => {
    const isBin = n.title.toLowerCase().includes('bin') || n.body.toLowerCase().includes('bin');
    const isUrgent = n.title.toLowerCase().includes('critical') || n.title.toLowerCase().includes('full') ||
                     n.body.toLowerCase().includes('critical') || n.body.toLowerCase().includes('full');
    return isBin && isUrgent;
  });

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser || !compTitle || !compDesc) return;

    try {
      setSubmittingComp(true);
      await onSubmitComplaint({
        portalId: currentPortal.id,
        userId: loggedInUser.id,
        userName: loggedInUser.name,
        title: compTitle,
        description: compDesc,
        category: compCat
      });
      setCompTitle('');
      setCompDesc('');
      setComplaintPhoto(null);
      setCompAiFeedback(null);
      triggerParticles();
      alert("Feedback logged securely. Caretaker notified!");
    } catch {
      alert("Error logging complaint.");
    } finally {
      setSubmittingComp(false);
    }
  };

  // Run AI checks on donation items before publishing
  const runAiDonationAudit = async () => {
    if (!donTitle || !donDesc) {
      alert("Please fill in Title and Description for AI check.");
      return;
    }

    try {
      setAiAuditing(true);
      const res = await fetch('/api/ai/audit-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: donTitle, description: donDesc })
      });
      const data = await res.json();
      setAiAuditResult(data);
    } catch (err) {
      setAiAuditResult({
        usability: "Awaiting physical caretaker check",
        recommendedGroup: "Local underprivileged families",
        sanitizedTags: ["Donation Approved", "Cleaned & Safe"]
      });
    } finally {
      setAiAuditing(false);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donTitle || !donQty) return;

    try {
      setSubmittingDon(true);
      const auditPayload = aiAuditResult 
        ? `Audit: Rating ${aiAuditResult.usability}. Recommend: ${aiAuditResult.recommendedGroup}. Tags: ${aiAuditResult.sanitizedTags.join(', ')}`
        : "Awaiting physical caretaker audit.";

      await onSubmitDonation({
        donorName: loggedInUser ? loggedInUser.name : "Anonymous Resident",
        donorContact: donContact || "Public Registered",
        title: donTitle,
        category: donCat,
        quantity: donQty,
        description: donDesc,
        aiAudit: auditPayload
      });

      // Calculate dynamic carbon savings
      const qtyNum = parseInt(donQty) || 1;
      let factor = 0.8;
      if (donCat === 'clothes') factor = 1.5;
      else if (donCat === 'food') factor = 1.2;
      else if (donCat === 'books') factor = 0.4;

      const co2Val = Number((qtyNum * factor).toFixed(1));
      const ptsVal = Math.round(co2Val * 50);

      const newEntry = {
        id: `l-dyn-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        title: `${donQty} x ${donTitle}`,
        category: donCat.toUpperCase(),
        co2SavedKg: co2Val,
        pointsEarned: ptsVal
      };

      setLedger(prev => [newEntry, ...prev]);

      setDonTitle('');
      setDonQty('');
      setDonDesc('');
      setDonContact('');
      setAiAuditResult(null);
      triggerParticles();

      alert("Thank you! Your donation proposal is logged in the public community hub.");
    } catch {
      alert("Failed to submit donation.");
    } finally {
      setSubmittingDon(false);
    }
  };

  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background color (vintage parchment)
    ctx.fillStyle = '#FAF8F2';
    ctx.fillRect(0, 0, 800, 600);

    // Draw border
    ctx.strokeStyle = '#10B981'; // Green
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 760, 560);

    ctx.strokeStyle = '#FFD700'; // Gold thin line
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, 732, 532);

    // Header Title
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillStyle = '#065F46'; // deep forest green
    ctx.textAlign = 'center';
    ctx.fillText('GREEN PLANET ALLIANCE & COMMUNITY ECO', 400, 100);

    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillStyle = '#374151';
    ctx.fillText('Official Certificate of Carbon Offsets and Civic Stewardship', 400, 134);

    // Certificate text body
    ctx.font = '16px sans-serif';
    ctx.fillText('This certifies that registered resident of Greenwood Society', 400, 220);

    // Name
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillStyle = '#0F172A'; // deep slate
    const uName = loggedInUser ? loggedInUser.name : "Dr. Alok Verma";
    ctx.fillText(uName, 400, 280);

    // Horizontal divider
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(250, 310);
    ctx.lineTo(550, 310);
    ctx.stroke();

    // Achievements details
    const totalCO2Str = ledger.reduce((acc, curr) => acc + curr.co2SavedKg, 0).toFixed(1);
    const totalPoints = ledger.reduce((acc, curr) => acc + curr.pointsEarned, 0);

    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillStyle = '#047857';
    ctx.fillText(`Has successfully prevented ${totalCO2Str} Kg of Greenhouse Gas Emissions`, 400, 350);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#4B5563';
    ctx.fillText(`By actively logging, sorting and donating items, scoring ${totalPoints} Green Impact points.`, 400, 384);

    // Signature stamp
    ctx.font = 'bold italic 15px Georgia, serif';
    ctx.fillStyle = '#047857';
    ctx.fillText('S. Ramaswamy', 250, 480);
    
    ctx.font = '11px monospace';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('COMMUNITY SUPERVISOR SIGNATURE', 250, 500);

    // Stamp circle (Seal)
    ctx.strokeStyle = '#FFD700';
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(550, 480, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#065F46';
    ctx.fillText('OFFICIAL', 550, 475);
    ctx.fillText('SEAL', 550, 490);

    // Date
    ctx.font = '12px monospace';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(`VERIFIED AT: ${new Date().toLocaleDateString()}`, 400, 550);

    // Download image
    const link = document.createElement('a');
    link.download = `Green_Stewardship_Certificate_${uName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadDonationReceipt = (entry: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background color (pristine white with a subtle receipt tint)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 700);

    // Draw solid border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 680);

    // Header styling
    ctx.fillStyle = '#10B981'; // Green
    ctx.fillRect(10, 10, 580, 90);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Courier, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('COMMUNITY ECO - DONATION RECEIPT', 300, 50);

    ctx.font = 'bold 12px Courier, monospace';
    ctx.fillText(`HYPERLOCAL PORTAL // RECEIPT #${entry.id.toUpperCase()}`, 300, 75);

    // Metadata lines
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px Courier, monospace';

    let y = 140;
    ctx.fillText(`RECEIPT NO:  ${entry.id.toUpperCase()}`, 40, y); y += 30;
    ctx.fillText(`DATE:        ${entry.date}`, 40, y); y += 30;
    ctx.fillText(`DONOR NAME:  ${loggedInUser ? loggedInUser.name.toUpperCase() : "REGISTERED CITIZEN"}`, 40, y); y += 30;
    ctx.fillText(`ZONE PORTAL: ${currentPortal.name.toUpperCase()}`, 40, y); y += 40;

    // Divider Line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(560, y);
    ctx.stroke();
    y += 30;

    // Donation Item Description Table
    ctx.fillText('ITEM DESCRIPTION', 40, y);
    ctx.textAlign = 'right';
    ctx.fillText('IMPACT POINTS', 560, y);
    y += 10;

    // Table Underline
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(560, y);
    ctx.stroke();
    y += 30;

    // Item row
    ctx.textAlign = 'left';
    ctx.fillText(entry.title.toUpperCase(), 40, y);
    ctx.textAlign = 'right';
    ctx.fillText(`+${entry.pointsEarned} XP`, 560, y);
    y += 25;

    ctx.textAlign = 'left';
    ctx.font = '11px Courier, monospace';
    ctx.fillText(`CATEGORY: ${entry.category.toUpperCase()}`, 40, y);
    y += 40;

    // Table Underline
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(560, y);
    ctx.stroke();
    y += 30;

    // Environmental offsets
    ctx.font = 'bold 13px Courier, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL CARBON OFFSETS PREVENTED:', 40, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${entry.co2SavedKg} KG CO2-e`, 560, y);
    y += 40;

    // Stamp block
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, y, 90, 90);
    
    // Draw simple barcodes/QR patterns inside the stamp
    ctx.fillStyle = '#000000';
    ctx.fillRect(48, y + 8, 20, 20);
    ctx.fillRect(100, y + 8, 20, 20);
    ctx.fillRect(48, y + 60, 20, 20);
    ctx.fillRect(75, y + 35, 25, 25);

    ctx.textAlign = 'left';
    ctx.font = 'italic 11px Courier, monospace';
    ctx.fillText('ECO-GUARANTEED AND VERIFIED SECURELY', 150, y + 30);
    ctx.fillText('BY THE COMMUNITY ECO NETWORK', 150, y + 45);
    ctx.fillText('THANK YOU FOR YOUR SUSTAINABILITY ACTION!', 150, y + 65);

    y += 120;
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px Courier, monospace';
    ctx.fillText('------------------ TEAR HERE ------------------', 300, y);

    const linkD = document.createElement('a');
    linkD.download = `Donation_Receipt_${entry.id}.png`;
    linkD.href = canvas.toDataURL('image/png');
    linkD.click();
  };

  return (
    <div className="space-y-6 p-2 sm:p-4" data-narrate="Resident portal. Find collector timelines, file complaints, or propose donation item list.">
      
      {/* 1. Header controls */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">Citizen Corner</h2>
          <p className="text-xs font-bold text-zinc-605">Live dashboard for residents of <strong className="underline decoration-2 decoration-amber-500">{currentPortal.name}</strong>.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap bg-black p-1.5 rounded-2xl gap-2 border-2 border-black w-full xl:w-auto">
          <button
            onClick={() => setActiveTab('notifs')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${activeTab === 'notifs' ? 'bg-[#FFD700] text-black border-2 border-white' : 'text-white hover:bg-zinc-800'}`}
          >
            Notices & Floor Tracker
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${activeTab === 'complaints' ? 'bg-[#F43F5E] text-white border-2 border-white' : 'text-white hover:bg-zinc-800'}`}
          >
            Lodge Complaint
          </button>
          <button
            onClick={() => setActiveTab('donate')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${activeTab === 'donate' ? 'bg-[#7C3AED] text-white border-2 border-white' : 'text-white hover:bg-zinc-800'}`}
          >
            Donate Goods
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${activeTab === 'ledger' ? 'bg-[#10B981] text-white border-2 border-white' : 'text-white hover:bg-zinc-800'}`}
          >
            🌱 Impact Ledger
          </button>
        </div>
      </div>

      {/* 🏆 Community Hero Gamification Dashboard */}
      {(() => {
        const totalCO2 = parseFloat(ledger.reduce((acc, curr) => acc + curr.co2SavedKg, 0).toFixed(1));
        const totalXP = ledger.reduce((acc, curr) => acc + curr.pointsEarned, 0);

        let level = 1;
        let levelTitle = "Recycling Rookie";
        let nextThreshold = 500;
        let progressPercent = 0;

        if (totalXP < 500) {
          level = 1;
          levelTitle = "Recycling Rookie";
          nextThreshold = 500;
          progressPercent = Math.min(100, Math.round((totalXP / 500) * 100));
        } else if (totalXP < 1200) {
          level = 2;
          levelTitle = "Eco Cadet";
          nextThreshold = 1200;
          progressPercent = Math.min(100, Math.round(((totalXP - 500) / 700) * 100));
        } else if (totalXP < 2500) {
          level = 3;
          levelTitle = "Waste Warrior";
          nextThreshold = 2500;
          progressPercent = Math.min(100, Math.round(((totalXP - 1200) / 1300) * 100));
        } else {
          level = 4;
          levelTitle = "Planet Champion";
          nextThreshold = totalXP;
          progressPercent = 100;
        }

        const badgesList = [
          {
            id: 'carbon_crusher',
            name: 'Carbon Crusher',
            desc: 'Mitigate > 10 Kg of carbon output',
            icon: '🌿',
            unlocked: totalCO2 > 10,
            color: 'border-emerald-500 bg-emerald-50'
          },
          {
            id: 'literary_angel',
            name: 'Literary Angel',
            desc: 'Donate educational books',
            icon: '📖',
            unlocked: ledger.some(item => item.category.toLowerCase().includes('book')),
            color: 'border-cyan-500 bg-cyan-50'
          },
          {
            id: 'thread_spinner',
            name: 'Thread Spinner',
            desc: 'Donate clothes to prevent textile dumps',
            icon: '👕',
            unlocked: ledger.some(item => item.category.toLowerCase().includes('cloth')),
            color: 'border-pink-500 bg-pink-50'
          },
          {
            id: 'pantry_guard',
            name: 'Pantry Guard',
            desc: 'Supply organic dry food kits',
            icon: '🍎',
            unlocked: ledger.some(item => item.category.toLowerCase().includes('food')),
            color: 'border-amber-500 bg-amber-50'
          },
          {
            id: 'circuit_saver',
            name: 'Circuit Saver',
            desc: 'Securely recycle electronics items',
            icon: '🔋',
            unlocked: ledger.some(item => item.category.toLowerCase().includes('electron')),
            color: 'border-teal-500 bg-teal-50'
          },
          {
            id: 'recycle_rookie',
            name: 'Recycle Rookie',
            desc: 'Make at least 1 successful donation',
            icon: '🥚',
            unlocked: ledger.length >= 1,
            color: 'border-orange-400 bg-orange-50'
          },
          {
            id: 'eco_enthusiast',
            name: 'Eco Enthusiast',
            desc: 'Process 3 or more successful donations',
            icon: '🌱',
            unlocked: ledger.length >= 3,
            color: 'border-green-400 bg-green-50'
          },
          {
            id: 'green_guardian',
            name: 'Green Guardian',
            desc: 'Process 4 or more successful donations',
            icon: '🛡️',
            unlocked: ledger.length >= 4,
            color: 'border-blue-400 bg-blue-50'
          },
          {
            id: 'eco_warrior',
            name: 'Eco-Warrior',
            desc: 'Process 5 or more successful donations!',
            icon: '⚔️',
            unlocked: ledger.length >= 5,
            color: 'border-purple-500 bg-purple-50 text-purple-900 font-extrabold'
          }
        ];

        return (
          <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Level and XP Section */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="bg-black text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                  Greenwood Society Eco-Points
                </span>
                <h3 className="text-xl font-black text-black uppercase tracking-tight pt-1 flex items-center gap-1.5">
                  <Award className="h-5.5 w-5.5 text-amber-500 animate-bounce" />
                  Community Hero Profile
                </h3>
                <p className="text-xs font-bold text-zinc-500">Every positive donation or correct disposal action boosts your public impact levels.</p>
              </div>

              {/* Progress and status */}
              <div className="bg-[#FAF8F2] border-2 border-black p-4 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-9 w-9 rounded-xl bg-[#FFD700] border-2 border-black flex items-center justify-center text-md font-black text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                      {level}
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-black">{levelTitle}</h4>
                      <p className="text-[10px] font-bold text-zinc-500">Tier Level {level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-black">{totalXP} XP</span>
                    <p className="text-[10px] font-bold text-zinc-500">Next level at {nextThreshold} XP</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-zinc-200 border-2 border-black h-4 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 border-r border-black" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase">
                    <span>Progress: {progressPercent}%</span>
                    <span>{nextThreshold - totalXP > 0 ? `${nextThreshold - totalXP} XP left` : 'Max Level Reached'}</span>
                  </div>
                </div>
              </div>

              {/* 🌿 Sustainability Streak Card */}
              <div className="bg-[#FAF8F2] border-2 border-black p-3.5 rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] space-y-2 relative overflow-hidden text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-md">🔥</span>
                    <h4 className="text-[11px] font-black uppercase text-black">Eco-Sustainability Streak</h4>
                  </div>
                  <span className="bg-orange-100 text-orange-800 border border-orange-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="animate-pulse">🔴</span> LIVE STREAK
                  </span>
                </div>

                <div className="flex items-center gap-3.5 bg-white border border-black p-2.5 rounded-xl">
                  <div className="relative h-12 w-12 bg-orange-100 border-2 border-orange-500 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0">
                    {ecoStreak >= 10 ? '🌸' : ecoStreak >= 5 ? '☘️' : ecoStreak >= 1 ? '🌿' : '🌱'}
                    {/* Burning flame icon overlays */}
                    <span className="absolute bottom-[-4px] right-[-4px] bg-white border border-black rounded-full p-0.5 text-[10px] leading-none">
                      🔥
                    </span>
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black font-mono text-orange-600">{ecoStreak}</span>
                      <span className="text-[10px] font-black text-zinc-500 uppercase">Consecutive Days</span>
                    </div>
                    <p className="text-[9px] font-bold text-zinc-400 leading-tight">
                      {ecoStreak >= 10 ? "Flourishing Eco-Legend status! Keep up the incredible daily resource recovery!" :
                       ecoStreak >= 5 ? "Healthy sapling stage! You are building deep, resilient environmental habits." :
                       "Keep sorting and recycling daily to see your tree grow!"}
                    </p>
                  </div>
                </div>

                {/* Growth Stages bar representation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-extrabold text-zinc-400 uppercase leading-none">
                    <span>🌱 Seed</span>
                    <span>🌿 Sprout</span>
                    <span>☘️ Sapling</span>
                    <span>🌸 Tree</span>
                  </div>
                  <div className="w-full bg-zinc-200 border border-black h-2.5 rounded-full overflow-hidden p-0.5 flex gap-0.5">
                    <div className={`h-full rounded-full transition-all ${ecoStreak >= 1 ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                    <div className={`h-full rounded-full transition-all ${ecoStreak >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                    <div className={`h-full rounded-full transition-all ${ecoStreak >= 5 ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                    <div className={`h-full rounded-full transition-all ${ecoStreak >= 10 ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                  </div>
                </div>

                <button
                  onClick={handleIncrementStreak}
                  disabled={hasLoggedToday}
                  className={`w-full py-1.5 border border-black rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    hasLoggedToday 
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                      : 'bg-[#FFD700] hover:bg-amber-400 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {hasLoggedToday ? '✓ Activity Logged for Today' : '⚡ Log Daily Eco-Activity'}
                </button>
              </div>
            </div>

            {/* Badges Earned Section */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1">
                  🏅 Stewardship Badges ({badgesList.filter(b => b.unlocked).length} / {badgesList.length})
                </h4>
                <p className="text-[11px] font-bold text-zinc-500">Earn credentials by participating in different categories of resource recovery.</p>
              </div>

              {/* 🏆 Sustainability Rank Widget */}
              {(() => {
                const donCount = ledger.length;
                let rankTitle = "Recycle Rookie";
                let rankIcon = "🥚";
                let nextRank = "Eco Enthusiast";
                let leftToNext = 3 - donCount;
                let rankColor = "bg-orange-100 border-orange-400 text-orange-950";
                let progress = (donCount / 3) * 100;
                
                if (donCount >= 5) {
                  rankTitle = "Eco-Warrior";
                  rankIcon = "⚔️";
                  nextRank = "Max Rank Unlocked";
                  leftToNext = 0;
                  rankColor = "bg-purple-100 border-purple-400 text-purple-950";
                  progress = 100;
                } else if (donCount >= 4) {
                  rankTitle = "Green Guardian";
                  rankIcon = "🛡️";
                  nextRank = "Eco-Warrior";
                  leftToNext = 1;
                  rankColor = "bg-blue-100 border-blue-400 text-blue-950";
                  progress = (donCount / 5) * 100;
                } else if (donCount >= 3) {
                  rankTitle = "Eco Enthusiast";
                  rankIcon = "🌱";
                  nextRank = "Green Guardian";
                  leftToNext = 1;
                  rankColor = "bg-green-100 border-green-400 text-green-950";
                  progress = (donCount / 4) * 100;
                }

                return (
                  <div className={`p-3 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${rankColor}`}>
                    <div className="h-10 w-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0">
                      {rankIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-75">Sustainability Rank</span>
                        <span className="text-[8px] font-mono font-black bg-black text-white px-1.5 py-0.5 rounded leading-none">
                          {donCount} Donations
                        </span>
                      </div>
                      <h5 className="text-xs font-black uppercase tracking-tight">{rankTitle}</h5>
                      
                      {/* Progress Bar */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-white/60 border border-black/20 h-2 rounded-full overflow-hidden p-0.5">
                          <div className="bg-black h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[8px] font-black uppercase whitespace-nowrap">
                          {leftToNext > 0 ? `${leftToNext} more to ${nextRank}` : 'Master Rank'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {badgesList.map(badge => (
                  <div 
                    key={badge.id}
                    className={`p-2 rounded-xl border-2 transition-all relative group flex flex-col items-center text-center justify-center space-y-1 h-[90px] ${
                      badge.unlocked 
                        ? `${badge.color} border-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]` 
                        : 'border-zinc-200 bg-zinc-50 opacity-40 grayscale'
                    }`}
                    title={badge.desc}
                  >
                    <span className="text-xl" role="img" aria-label={badge.name}>
                      {badge.icon}
                    </span>
                    <span className="text-[10px] font-black text-black uppercase tracking-tight block">
                      {badge.name}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 leading-none line-clamp-1">
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </span>

                    {/* Simple Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-900 text-white text-[9px] py-1 px-2 rounded-md font-bold w-40 z-20 shadow-md text-center">
                      {badge.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. TAB CONTENT VIEWPORTS */}

      {/* A. LOCAL SECTOR FLOOR WARNING PANELS */}
      {activeTab === 'notifs' && (
        <div className="space-y-6">
          <div className="bg-white vibrant-border p-4 sm:p-6 rounded-3xl vibrant-shadow-sm space-y-6">
            
            {/* Filter by Flat Floor number */}
            <div className="flex items-center gap-4 flex-wrap bg-[#FAF8F2] p-4 rounded-2xl border-2 border-black">
              <span className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-5 w-5 text-[#7C3AED]" /> Choose Your Floor Level:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: currentPortal.floorsCount }, (_, i) => i + 1).map(f => (
                  <button
                    key={f}
                    onClick={() => setResidentFloor(f)}
                    className={`h-9 px-3 text-xs font-black uppercase rounded-xl transition-all cursor-pointer border-2 border-black ${residentFloor === f ? 'bg-[#FFD700] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100 text-zinc-850'}`}
                  >
                    Level {f}
                  </button>
                ))}
              </div>
            </div>

            {/* INTERACTIVE FLOOR-BY-FLOOR CLEANLINESS HEATMAP TOWER */}
            <div className="border-2 border-black p-4 rounded-2xl bg-zinc-50 space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-600 animate-pulse" />
                    Greenwood Complex Cleanliness Heatmap
                  </h4>
                  <p className="text-[10px] font-bold text-zinc-500">Interactive elevation chart showing live waste density and unresolved citizen reports per floor.</p>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-black uppercase">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> 0 Alerts (Clean)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400"></span> 1 Alert (Medium)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> 2+ Alerts (Heavy)</span>
                </div>
              </div>

              {/* Heatmap Highrise Blocks */}
              <div className="flex flex-col-reverse divide-y divide-y-reverse divide-black/10 border-2 border-black rounded-xl overflow-hidden bg-white">
                {Array.from({ length: currentPortal.floorsCount }, (_, i) => i + 1).map(f => {
                  // Count total alerts or notices for this floor dynamically
                  const floorNotifsCount = notifications.filter(n => n.portalId === currentPortal.id && n.floor === f).length;
                  const isSelected = residentFloor === f;

                  let bgClass = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900';
                  let statusText = '🟢 Excellent Cleanliness';
                  if (floorNotifsCount === 1) {
                    bgClass = 'bg-amber-50 hover:bg-amber-100 text-amber-950';
                    statusText = '🟡 Pending Collection';
                  } else if (floorNotifsCount >= 2) {
                    bgClass = 'bg-red-50 hover:bg-red-100 text-red-950';
                    statusText = '🔴 Heavy Waste Accumulation';
                  }

                  return (
                    <button
                      key={f}
                      onClick={() => setResidentFloor(f)}
                      className={`w-full p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-left transition-all relative outline-none cursor-pointer ${bgClass} ${
                        isSelected ? 'ring-4 ring-inset ring-[#FFD700] border-y-2 border-black font-black z-10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-md">
                          F{f}
                        </span>
                        <span className="text-xs font-black uppercase">Level {f} Floorplate</span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 sm:mt-0 text-[11px]">
                        <span className="font-bold uppercase text-[9px] px-2 py-0.5 rounded-full border border-black/10 bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                          {statusText}
                        </span>
                        <span className="font-mono font-bold text-[10px]">
                          {floorNotifsCount} Active {floorNotifsCount === 1 ? 'Notice' : 'Notices'}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFD700]"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offline Cache Indicator Notice */}
            {isOfflineMode && (
              <div className="bg-amber-50 border-2 border-black p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span>⚠️</span>
                <div>
                  <strong className="uppercase font-black text-black block text-[10px]">Indexed Caching Active (Offline View)</strong>
                  <span>Displaying local offline cached reports. Your connection seems temporarily interrupted.</span>
                </div>
              </div>
            )}

            {/* List of alerts */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black/10 pb-2">
                <h3 className="text-md font-black text-black uppercase tracking-tight flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-[#F43F5E]" />
                  Live Floor Bulletins (Level {residentFloor})
                </h3>
                <button
                  onClick={handleSpeakNotifs}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                    isPlayingVoice ? 'bg-[#F43F5E] text-white' : 'bg-white hover:bg-zinc-100 text-black'
                  }`}
                  title="Read aloud recent floor notifications using Web Speech synthesis"
                >
                  {isPlayingVoice ? (
                    <>
                      <VolumeX className="h-4 w-4 shrink-0" /> Stop Speaking
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 shrink-0" /> Listen to Notifications
                    </>
                  )}
                </button>
              </div>

              {/* Filter controls */}
              <div className="bg-zinc-50 border-2 border-black p-3 rounded-2xl flex flex-wrap gap-4 items-center justify-between text-xs">
                <div className="flex flex-wrap items-center gap-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold uppercase text-[10px] text-zinc-500">Severity:</span>
                    <div className="flex gap-1 bg-white p-1 border border-black rounded-lg">
                      {(['all', 'high', 'medium', 'low'] as const).map((sev) => (
                        <button
                          key={sev}
                          onClick={() => setSeverityFilter(sev)}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-transparent cursor-pointer transition-colors ${
                            severityFilter === sev
                              ? 'bg-black text-white'
                              : 'hover:bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold uppercase text-[10px] text-zinc-500">Category:</span>
                    <div className="flex gap-1 bg-white p-1 border border-black rounded-lg">
                      {(['all', 'maintenance', 'community', 'donation', 'other'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-transparent cursor-pointer transition-colors ${
                            categoryFilter === cat
                              ? 'bg-[#7C3AED] text-white'
                              : 'hover:bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wide bg-white border border-black/10 px-2 py-1 rounded">
                  Showing {activeNotifs.length} reports
                </div>
              </div>

              {/* Urgent Attention Required Banner */}
              {urgentBinAlerts.length > 0 && (
                <div className="bg-red-50 border-4 border-[#F43F5E] p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#F43F5E] animate-bounce shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black uppercase text-black tracking-tight">🚨 URGENT ATTENTION REQUIRED</h4>
                      <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">
                        AI Image Analysis detected {urgentBinAlerts.length} Critical/Full waste containers requiring immediate clearing.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {urgentBinAlerts.map(alertNotif => (
                      <div key={alertNotif.id} className="bg-white border-2 border-black rounded-xl p-3 flex gap-2.5 items-start">
                        <div className="p-1.5 rounded-lg bg-red-100 text-[#F43F5E] border border-black font-extrabold text-[9px] uppercase shrink-0">
                          {alertNotif.title.includes('CRITICAL') ? 'CRITICAL' : 'FULL'}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-[11px] font-black text-black leading-tight truncate">{alertNotif.title}</p>
                          <p className="text-[10px] font-bold text-zinc-600 leading-normal line-clamp-2">{alertNotif.body}</p>
                          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            <span>Level: {alertNotif.floor}</span>
                            <span>•</span>
                            <span>Detected by: {alertNotif.senderName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeNotifs.length === 0 ? (
                <div className="p-12 border-4 border-dashed border-zinc-300 rounded-2xl text-center text-zinc-500 font-bold text-xs uppercase bg-[#FAF8F2]">
                  Everything fully cleared! No active environmental hazards or sweeper logs on Level {residentFloor}.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeNotifs.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-4 rounded-2xl border-2 border-black flex gap-3.5 items-start shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                        notif.severity === 'high' ? 'bg-red-100' :
                        notif.severity === 'medium' ? 'bg-yellow-105 bg-[#FFD700]/10' :
                        'bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl text-xs mt-0.5 border-2 border-black ${
                        notif.severity === 'high' ? 'bg-[#F43F5E] text-white' :
                        notif.severity === 'medium' ? 'bg-[#FFD700] text-black' :
                        'bg-white text-black'
                      }`}>
                        <Megaphone className="h-4 w-4" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-sm font-black text-black uppercase tracking-tight">{notif.title}</h4>
                          <span className="text-[10px] text-zinc-500 font-black tracking-wide uppercase bg-white border border-black px-1.5 py-0.5 rounded-md">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-800 leading-relaxed font-bold">{notif.body}</p>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          Broadcaster: <span className="text-black font-black underline">{notif.senderName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* B. LODGE CONCERNS OR SPILLED WASTE COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <div className="md:col-span-5 bg-white vibrant-border p-5 rounded-3xl vibrant-shadow-sm space-y-4">
            <h3 className="text-lg font-black uppercase text-black flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-[#F43F5E]" />
              Lodge Dynamic Concern
            </h3>
            <p className="text-xs font-bold text-zinc-500">Report delays, missed dustbins, dirty spills, or broken recycling bags direct to {currentPortal.name} caretaking office.</p>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-[#F43F5E] mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Broken composting bin lid on first floor"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  required
                  className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-[#F43F5E] mb-1">Issue Category</label>
                <select
                  value={compCat}
                  onChange={(e: any) => setCompCat(e.target.value)}
                  className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none cursor-pointer"
                >
                  <option value="delay">Collection Delay</option>
                  <option value="missed">Missed Flat Pick-up</option>
                  <option value="spilt">Accidental Garbage Spill</option>
                  <option value="sorting_issue">Segregation Guidelines Issues</option>
                  <option value="others">Other Facility Concerns</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-[#F43F5E] mb-1">Describe Concern Specifics</label>
                <textarea 
                  placeholder="Explain exact location, timing and description of the issue..."
                  rows={4}
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  required
                  className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:bg-white focus:outline-none"
                />
              </div>

              {/* Photo attachment & AI Classification area */}
              <div className="space-y-2 border-t-2 border-dashed border-zinc-200 pt-3">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#F43F5E]">
                  Attach Spill/Hazard Photo
                </label>
                
                {/* Visual Thumbnail Preview area */}
                {complaintPhoto ? (
                  <div className="space-y-2">
                    <div className="relative border-2 border-black rounded-xl p-2 bg-[#FAF8F2] flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {complaintPhoto === 'MOCK_COMPLAINT_IMAGE' ? (
                          <div className="h-14 w-14 rounded-lg bg-rose-105 bg-rose-100 border border-black flex items-center justify-center text-xl shrink-0 font-bold select-none">
                            🗑️
                          </div>
                        ) : (
                          <img 
                            src={complaintPhoto} 
                            alt="Complaint Thumbnail Preview" 
                            className="h-14 w-14 rounded-lg object-cover border border-black shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="truncate">
                          <p className="text-[10px] font-black text-black">Attached Photo</p>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase">Ready for AI Classification</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setComplaintPhoto(null);
                          setCompAiFeedback(null);
                        }}
                        className="bg-black hover:bg-rose-600 hover:text-white text-white p-1 rounded-md border border-black transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* AI Classification button & info */}
                    {!compAiFeedback ? (
                      <button
                        type="button"
                        onClick={runComplaintAiClassification}
                        disabled={isClassifyingComp}
                        className="w-full border-2 border-black bg-amber-400 hover:bg-amber-500 text-black font-black py-2 px-3 rounded-xl text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                      >
                        {isClassifyingComp ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-black" />
                            <span>AI Analyzing Spill Image...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-white p-0.5 rounded bg-black border border-black" />
                            <span>Classify & Autofill via Gemini AI</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-amber-50 border-2 border-black p-3 rounded-xl text-[10.5px] font-bold space-y-1 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between border-b border-black/10 pb-1 mb-1">
                          <span className="text-[9px] text-[#7C3AED] uppercase font-black tracking-wider flex items-center gap-1">
                            ✨ Gemini Vision Analysis:
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold uppercase px-1 py-0.5 rounded">
                            {Math.round(compAiFeedback.confidenceScore * 100)}% Match
                          </span>
                        </div>
                        <p className="leading-relaxed">
                          <span className="font-extrabold text-[#F43F5E] uppercase text-[9.5px]">Detected:</span> {compAiFeedback.auditNotes}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {compAiFeedback.summaryTags.map((tag, i) => (
                            <span key={i} className="bg-white border border-black/10 text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={triggerMockComplaintCapture}
                      className="border-2 border-black bg-[#FAF8F2] hover:bg-[#FFD700]/15 text-black font-black py-2.5 px-3 rounded-xl text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <Camera className="h-4 w-4 text-[#F43F5E]" />
                      <span>Simulate Camera</span>
                    </button>
                    
                    <div className="relative border-2 border-black rounded-xl bg-[#FAF8F2] hover:bg-zinc-50 transition-colors flex items-center justify-center text-center cursor-pointer p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleComplaintPhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-[10px] font-black uppercase text-black flex items-center gap-1">
                        📁 Upload Photo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingComp}
                className="w-full bg-[#F43F5E] hover:bg-rose-600 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                {submittingComp ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Lodge Complaint Ticket
              </button>
            </form>
          </div>

          <div className="md:col-span-7 bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black text-black uppercase tracking-widest bg-[#FFD700] border-2 border-black px-2.5 py-1 rounded-lg inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Guideline Protocol Checklist</h3>
            <p className="text-xs font-bold text-zinc-500">Before lodging complaints, please check:</p>

            <div className="space-y-3 text-xs text-black font-bold">
              <div className="p-3 bg-[#FAF8F2] border-2 border-black rounded-xl flex items-start gap-2">
                <span className="text-emerald-600 font-extrabold text-sm">✓</span>
                <span>Sorted correctly: Ensure papercard recyclables are strictly separate from kitchen scraps.</span>
              </div>
              <div className="p-3 bg-[#FAF8F2] border-2 border-black rounded-xl flex items-start gap-2">
                <span className="text-[#F43F5E] font-extrabold text-sm">✓</span>
                <span>Timing: Collectors visit respective floors once in morning & evening hours.</span>
              </div>
              <div className="p-3 bg-[#FAF8F2] border-2 border-black rounded-xl flex items-start gap-2">
                <span className="text-[#7C3AED] font-extrabold text-sm">✓</span>
                <span>Spills: Liquid spillages must be tightly tied into compost bags before placing outside doors.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* C. RESOURCE DONATIONS DESK */}
      {activeTab === 'donate' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white vibrant-border p-5 rounded-3xl vibrant-shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-[#7C3AED]">
                <Gift className="h-5 w-5" />
                <h3 className="text-lg font-black uppercase text-black">Add Donation Offer</h3>
              </div>
              <p className="text-xs font-bold text-zinc-500">Offer your surplus clothes, surplus home-cooked food packets, or old textbooks directly to verified shelter NGOs.</p>

              <form onSubmit={handleSubmitDonation} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#7C3AED] mb-1">Item Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hardbound HC Verma Physics textbooks (3 books)"
                    value={donTitle}
                    onChange={(e) => setDonTitle(e.target.value)}
                    required
                    className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#7C3AED] mb-1">Item Category</label>
                    <select
                      value={donCat}
                      onChange={(e: any) => setDonCat(e.target.value)}
                      className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-[#7C3AED] font-black focus:outline-none cursor-pointer"
                    >
                      <option value="clothes">Clothes & Blankets</option>
                      <option value="food">Grains / Food Packets</option>
                      <option value="books">Textbooks & Novels</option>
                      <option value="others">Household Commodities</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#7C3AED] mb-1">Quantity</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1 Medium Box"
                      value={donQty}
                      onChange={(e) => setDonQty(e.target.value)}
                      required
                      className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#7C3AED] mb-1">Item Specifications & Condition</label>
                  <textarea 
                    placeholder="Detail condition. E.g. Washed completely. Inside pages fully intact, dry. Suitable for kids age 10-15."
                    rows={3}
                    value={donDesc}
                    onChange={(e) => setDonDesc(e.target.value)}
                    required
                    className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#7C3AED] mb-1">Your Mobile Contact (kept secure for NGOs)</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +91 9435X XXXX"
                    value={donContact}
                    onChange={(e) => setDonContact(e.target.value)}
                    className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                {/* AI Audit button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={runAiDonationAudit}
                    disabled={aiAuditing || !donTitle}
                    className="flex-1 border-2 border-black bg-amber-400 hover:bg-amber-500 text-black font-black py-3 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {aiAuditing ? <Loader2 className="h-3 w-3 animate-spin text-black" /> : <Sparkles className="h-4 w-4 text-white p-0.5 rounded bg-black border border-black" />}
                    Check Quality via Gemini AI
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submittingDon}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  {submittingDon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Publish Donation Package
                </button>
              </form>
            </div>

            {/* AI-Powered Image Analysis / Waste Material Scanner Tool */}
            <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <Sparkles className="h-5 w-5 text-emerald-600 animate-spin" />
                <h3 className="text-lg font-black uppercase text-black">AI Waste Categorizer</h3>
              </div>
              <p className="text-xs font-bold text-zinc-500">
                Upload a photo or select a quick household waste item to find its correct recycling/disposal bin instantly using Gemini AI.
              </p>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-zinc-400 block">Quick Simulation Presets:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: 'Soda Can', icon: '🥤', text: 'An empty aluminum Coca-cola soda can. Slightly crushed.' },
                    { name: 'Apple Core', icon: '🍎', text: 'Discarded organic apple fruit scraps and core.' },
                    { name: 'AA Battery', icon: '🔋', text: 'A depleted zinc alkaline battery, double A model.' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setWasteImageBase64('PRESET_ACTIVE');
                        setWasteMimeType('image/png');
                        runWasteImageAnalysis('PRESET_ACTIVE', 'image/png');
                      }}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-black bg-zinc-50 hover:bg-[#FFD700]/20 text-[10px] font-black uppercase cursor-pointer transition-colors"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="truncate w-full text-center">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload/Drop Zone */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-600">Or Upload Material Image</label>
                <div className="relative border-2 border-dashed border-black rounded-xl p-4 bg-[#FAF8F2] hover:bg-zinc-50 transition-colors flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWastePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Camera className="h-6 w-6 text-zinc-500 mb-1" />
                  <span className="text-[10px] font-black uppercase text-black">Choose file or capture photo</span>
                  <span className="text-[8px] font-bold text-zinc-400 mt-0.5">Supports PNG, JPG (Max 5MB)</span>
                </div>
              </div>

              {/* Selected file info / action */}
              {wasteImageBase64 && (
                <div className="p-3 bg-zinc-50 border border-black rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold truncate">
                    <span>📸</span>
                    <span className="truncate">
                      {wasteImageBase64 === 'PRESET_ACTIVE' ? 'Simulating Selected Preset' : 'Captured/Selected Image'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => runWasteImageAnalysis()}
                    disabled={isScanningWaste}
                    className="bg-[#10B981] hover:bg-emerald-600 text-white px-3 py-1 rounded-lg font-black uppercase text-[10px] border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    {isScanningWaste ? 'Scanning...' : 'Scan Item'}
                  </button>
                </div>
              )}

              {/* Analysis Result Display */}
              {isScanningWaste && (
                <div className="p-4 bg-emerald-50 border border-emerald-500 rounded-xl space-y-2 text-center animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-emerald-600" />
                  <p className="text-[11px] font-black uppercase text-emerald-800">Gemini material scanner analyzing molecular composition...</p>
                </div>
              )}

              {scannerError && (
                <div className="p-3 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg">
                  ⚠️ {scannerError}
                </div>
              )}

              {scannedResult && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-2xl space-y-3.5 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl">
                    VERIFIED BIN CATEGORY
                  </div>

                  <div>
                    <span className="text-[9px] text-emerald-800 font-extrabold uppercase block tracking-wide">Target Category:</span>
                    <div className="text-md font-black text-black uppercase flex items-center gap-1.5 mt-0.5">
                      {scannedResult.category.toLowerCase().includes('organic') ? '🟢 ' :
                       scannedResult.category.toLowerCase().includes('electronic') ? '🔴 ' :
                       scannedResult.category.toLowerCase().includes('hazard') ? '💀 ' : '🔵 '}
                      {scannedResult.category}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-zinc-200 p-2 rounded-xl">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">Recyclability:</span>
                      <span className="font-black text-emerald-700 text-[11px]">{scannedResult.recyclability}</span>
                    </div>
                    <div className="bg-white border border-zinc-200 p-2 rounded-xl">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">Est. Weight & Offset:</span>
                      <span className="font-black text-zinc-800 text-[10px]">{scannedResult.estimatedWeight} ({scannedResult.carbonOffset})</span>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 p-2.5 rounded-xl space-y-0.5">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wide block">Disposal Action Instructions:</span>
                    <p className="text-[10px] font-bold text-zinc-700 leading-normal">{scannedResult.instructions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            
            {/* 1. Gemini Automated Pre-Audit Reports */}
            <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-black text-black uppercase tracking-widest bg-[#FFD700] border-2 border-black px-2.5 py-1 rounded-lg inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-600 animate-spin" />
                Gemini Automated Pre-Audit Reports
              </h3>
              <p className="text-xs font-bold text-zinc-500">Our smart model inspects description keywords to predict sanitary levels and tags before physical NGO capture.</p>

              {aiAuditResult ? (
                <div className="p-4 bg-[#FAF8F2] border-2 border-black rounded-2xl space-y-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-black text-xs font-bold">
                    <span className="text-zinc-500 uppercase tracking-wide text-[10px]">Usability Rating:</span>
                    <span className="text-xs font-black text-[#7C3AED]">{aiAuditResult.usability}</span>
                  </div>
                  <div className="text-xs text-black font-extrabold leading-relaxed">
                    <strong className="text-[10px] text-zinc-500 uppercase block tracking-wide mb-0.5">Recommended Target Groups:</strong>
                    <span className="bg-white border border-zinc-350 p-2.5 rounded-lg block font-bold mt-1">{aiAuditResult.recommendedGroup}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide block font-extrabold">Audit Verification Tags:</span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aiAuditResult.sanitizedTags.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-[#FFD700] text-[10px] text-black font-black uppercase px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center border-4 border-dashed border-zinc-300 rounded-3xl text-zinc-500 font-black text-xs uppercase bg-[#FAF8F2]">
                  Awaiting items entry form on left. Fill specifications and hit "Check Quality" to run model validation.
                </div>
              )}
            </div>

            {/* 2. Community Donation Forecasting (Actionable Insights) */}
            <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xs font-black text-black uppercase tracking-widest bg-purple-100 border-2 border-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Donation Volume Forecasting
                </h3>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono font-black uppercase">4-Week Moving Avg</span>
              </div>
              <p className="text-xs font-bold text-zinc-500">Recurrent moving averages of community donation logs. Highlighted metrics signal upcoming spikes or high demand periods.</p>

              {(() => {
                const clothesCount = ledger.filter(item => item.category === 'clothes').length;
                const foodCount = ledger.filter(item => item.category === 'food').length;
                const booksCount = ledger.filter(item => item.category === 'books').length;
                const othersCount = ledger.filter(item => item.category === 'others' || item.category === 'others_household').length;

                const categoriesData = [
                  {
                    id: 'clothes',
                    name: 'Clothes & Blankets',
                    weeks: [12, 16, 14, 18 + clothesCount],
                    spikeReason: 'Winter season consolidation.',
                    action: 'Drop dry blankets at Sector A desk by Friday.'
                  },
                  {
                    id: 'food',
                    name: 'Grains & Food Packets',
                    weeks: [25, 22, 28, 34 + foodCount],
                    spikeReason: 'Festive season drives.',
                    action: 'Shelters need dry cereal. Label with expiry date.'
                  },
                  {
                    id: 'books',
                    name: 'Textbooks & Novels',
                    weeks: [8, 5, 9, 7 + booksCount],
                    spikeReason: 'Mid-term exam consolidation.',
                    action: 'Sort by subject (Science, Math) before handover.'
                  },
                  {
                    id: 'others',
                    name: 'Household Commodities',
                    weeks: [15, 12, 11, 14 + othersCount],
                    spikeReason: 'De-clutter cycles.',
                    action: 'Ensure plastic items are fully clean and washed.'
                  }
                ];

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoriesData.map(cat => {
                        const sum = cat.weeks.reduce((a, b) => a + b, 0);
                        const movingAvg = Math.round((sum / cat.weeks.length) * 10) / 10;
                        const lastWeek = cat.weeks[cat.weeks.length - 1];
                        const projected = Math.round(lastWeek * 1.15 + (lastWeek - movingAvg) * 0.5);
                        const isSpike = projected > movingAvg * 1.15;

                        return (
                          <div key={cat.id} className="bg-[#FAF8F2] border-2 border-black p-3 rounded-xl flex flex-col justify-between space-y-2 relative overflow-hidden">
                            {isSpike && (
                              <span className="absolute top-0 right-0 bg-rose-500 text-white font-black text-[7px] uppercase px-1.5 py-0.5 rounded-bl">
                                📈 Spike Alert
                              </span>
                            )}
                            <div>
                              <span className="text-[9px] font-black uppercase text-zinc-500 block">{cat.name}</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-black text-black">{projected} items</span>
                                <span className="text-[8px] font-bold text-zinc-400">Proj. Next Week</span>
                              </div>
                              <div className="flex items-end gap-1 h-6 mt-1 pb-1 border-b border-black/5">
                                {cat.weeks.map((val, idx) => (
                                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                                    <div 
                                      className={`w-full rounded-t-sm border border-black ${idx === 3 ? 'bg-[#7C3AED]' : 'bg-zinc-300'}`} 
                                      style={{ height: `${Math.max(10, (val / 40) * 100)}%` }} 
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-[9px] leading-tight space-y-1">
                              <p className="font-extrabold text-black">
                                <span className="text-[#7C3AED]">Reason:</span> {cat.spikeReason}
                              </p>
                              <p className="font-medium text-zinc-600 bg-white p-1 border border-black/10 rounded-md">
                                💡 {cat.action}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. Community Milestones Progress */}
            <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xs font-black text-black uppercase tracking-widest bg-emerald-100 border-2 border-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Award className="h-4 w-4 text-emerald-600" />
                  Community Milestones Progress
                </h3>
                <span className="text-[10px] font-mono font-black text-zinc-650">GREENWOOD ANNUAL GOAL</span>
              </div>
              <p className="text-xs font-bold text-zinc-500">Track aggregate neighborhood participation toward meeting global emission-reduction milestones.</p>

              <div className="space-y-4 bg-[#FAF8F2] border-2 border-black p-4 rounded-2xl">
                {/* Milestone 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="uppercase text-black">🌲 Landfill Diversion Rate</span>
                    <span className="font-mono text-emerald-700">76% (Target: 85%)</span>
                  </div>
                  <div className="w-full bg-zinc-200 border-2 border-black h-4 rounded-full overflow-hidden p-0.5">
                    <div className="bg-emerald-500 h-full rounded-full transition-all border-r border-black" style={{ width: '76%' }}></div>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="uppercase text-black">♻️ Community Composting Yield</span>
                    <span className="font-mono text-emerald-700">2,450 Kg (Target: 3,000 Kg)</span>
                  </div>
                  <div className="w-full bg-zinc-200 border-2 border-black h-4 rounded-full overflow-hidden p-0.5">
                    <div className="bg-emerald-500 h-full rounded-full transition-all border-r border-black" style={{ width: '81%' }}></div>
                  </div>
                </div>

                {/* Celebratory Badge collection */}
                <div className="pt-2 border-t border-black/10">
                  <span className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Unlocked Community Badges:</span>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      🌿 CO2 Mitigators
                    </span>
                    <span className="px-2.5 py-1 rounded bg-emerald-100 border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      🍎 Food Angels
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-100 border-2 border-dashed border-zinc-400 text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1">
                      🔒 Zero-Waste Pioneer (85% Needed)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Personalized Daily Eco-Tips Section */}
            <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xs font-black text-black uppercase tracking-widest bg-amber-100 border-2 border-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  Personalized Daily Eco-Tips
                </h3>
                <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded uppercase font-black">AI Generated</span>
              </div>
              <p className="text-xs font-bold text-zinc-500">Pick a focus category to generate action-oriented household waste-minimization methods.</p>

              <div className="flex gap-2 flex-wrap items-center">
                <select
                  value={ecoCategory}
                  onChange={(e) => {
                    setEcoCategory(e.target.value);
                    fetchEcoTip(e.target.value);
                  }}
                  className="bg-white text-xs font-black uppercase border-2 border-black p-2.5 rounded-xl cursor-pointer outline-none flex-1"
                >
                  <option value="Composting">☘️ Composting & Kitchen Scraps</option>
                  <option value="Electronics">🔌 E-Waste & Chargers</option>
                  <option value="Textiles">👕 Textiles & Old Clothes</option>
                  <option value="Plastics">🧴 Single-Use Plastics</option>
                  <option value="General">🌐 Universal Cleanliness</option>
                </select>

                <button
                  type="button"
                  onClick={() => fetchEcoTip(ecoCategory)}
                  disabled={ecoTipLoading}
                  className="bg-zinc-900 hover:bg-black text-white text-xs font-black uppercase p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  {ecoTipLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Refresh Tip'}
                </button>
              </div>

              <div className="p-4 bg-[#FAF8F2] border-2 border-black rounded-2xl flex items-start gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xl">💡</span>
                <p className="text-xs text-zinc-800 leading-relaxed font-bold italic">
                  "{ecoTip}"
                </p>
              </div>
            </div>

            {/* 4. AI-Powered Conversational Assistant */}
            <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xs font-black text-black uppercase tracking-widest bg-violet-100 border-2 border-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <MessageSquare className="h-4 w-4 text-violet-600" />
                Gemini Recycling Chatbot
              </h3>
              <p className="text-xs font-bold text-zinc-500">Ask the assistant about local recycling guidelines, garbage categorization, or sorting procedures.</p>

              {/* Message Log Box */}
              <div className="border-2 border-black rounded-2xl bg-zinc-50 p-4 h-64 overflow-y-auto space-y-3.5">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      msg.role === 'user' ? 'bg-zinc-900 text-white border-black' : 'bg-white text-black border-black'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl text-xs bg-white text-zinc-500 border-2 border-black font-bold flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                      Gemini is formulating recycling guide...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Can we recycle greasy pizza boxes? / Where do old cellphones go?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-5 rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-xs cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  Ask
                </button>
              </form>
            </div>

            {/* 5. Pickup Time-Slot Scheduler */}
            <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xs font-black text-black uppercase tracking-widest bg-[#FFD700] border-2 border-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Calendar className="h-4 w-4" />
                NGO Pickup Scheduler
              </h3>
              <p className="text-xs font-bold text-zinc-500">Book specific date-time slots for handovers. Verified collectors will arrive directly to your floor lobby.</p>

              <form onSubmit={handleSchedulePickup} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-[#FAF8F2] p-4 border-2 border-black rounded-2xl">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-black uppercase text-zinc-650 mb-1">Select Pickup Date</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border-2 border-black rounded-xl bg-white font-black cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-black uppercase text-zinc-650 mb-1">Select Time Window</label>
                  <select
                    value={pickupTimeSlot}
                    onChange={(e) => setPickupTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 border-2 border-black rounded-xl bg-white font-black cursor-pointer"
                  >
                    <option value="09:00 AM - 11:00 AM">Morning (09-11 AM)</option>
                    <option value="11:00 AM - 01:00 PM">Midday (11 AM-01 PM)</option>
                    <option value="02:00 PM - 04:00 PM">Noon (02-04 PM)</option>
                    <option value="04:00 PM - 06:00 PM">Evening (04-06 PM)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black py-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 text-center uppercase"
                  >
                    Schedule
                  </button>
                </div>
              </form>

              {/* Scheduled Pickups Status Log */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Your Booked Schedules:</span>
                <div className="space-y-2">
                  {scheduledPickups.map((pick) => (
                    <div key={pick.id} className="p-3 bg-white border-2 border-black rounded-xl flex items-center justify-between shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-zinc-450 uppercase block font-black">SCHEDULED SLOT</span>
                        <span className="font-black text-black">{pick.date} @ {pick.timeSlot}</span>
                        <p className="text-[10px] text-zinc-500 font-bold">Item: {pick.itemType}</p>
                      </div>

                      <div>
                        {pick.status === 'completed' && (
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase text-emerald-800 bg-emerald-55 bg-emerald-100 border border-emerald-500 rounded-full">
                            ✓ Handed Over
                          </span>
                        )}
                        {pick.status === 'assigned' && (
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase text-amber-800 bg-amber-55 bg-amber-100 border border-amber-500 rounded-full animate-pulse">
                            ● NGO Assigned
                          </span>
                        )}
                        {pick.status === 'awaiting' && (
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase text-zinc-800 bg-zinc-55 bg-zinc-100 border border-black rounded-full">
                            ● Finding NGO
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline and entries */}
          <div className="lg:col-span-7 bg-white border-2 border-black p-4 sm:p-6 rounded-3xl space-y-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black uppercase text-black flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Sustainable Contribution Timeline
                </h3>
                <p className="text-[11px] font-bold text-zinc-550">Chronological history of registered items preventing atmospheric carbon release.</p>
              </div>

              {/* Download CSV button */}
              <button
                onClick={exportDonationLedgerToCSV}
                className="px-3.5 py-2 bg-[#FFD700] hover:bg-amber-400 text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                title="Download historical donation data locally as a CSV spreadsheet"
              >
                <Download className="h-4 w-4" /> Download CSV
              </button>

              {/* Aggregated indicators */}
              <div className="flex gap-2 text-right">
                <div className="bg-emerald-50 border-2 border-black px-3 py-1 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                  <span className="block text-[8px] font-extrabold uppercase text-zinc-550">Total CO2 Saved</span>
                  <span className="text-xs font-black text-emerald-700 font-mono">
                    {ledger.reduce((acc, curr) => acc + curr.co2SavedKg, 0).toFixed(1)} Kg
                  </span>
                </div>
                <div className="bg-[#FAF8F2] border-2 border-black px-3 py-1 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                  <span className="block text-[8px] font-extrabold uppercase text-zinc-550">Stewardship Points</span>
                  <span className="text-xs font-black text-black font-mono">
                    {ledger.reduce((acc, curr) => acc + curr.pointsEarned, 0)} Pts
                  </span>
                </div>
              </div>
            </div>

            {/* MY DONATIONS LOG TABLE */}
            <div className="border-2 border-black rounded-2xl overflow-hidden bg-zinc-50">
              <div className="p-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-between">
                <span>📋 My Donations Ledger Logs Table</span>
                <span className="bg-emerald-500 text-black px-1.5 py-0.5 rounded text-[9px]">Excel Compatible</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 border-b-2 border-black text-zinc-650 font-black uppercase tracking-wider text-[10px]">
                      <th className="p-3">Receipt ID / Date</th>
                      <th className="p-3">Donated Item</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Offsets Saved</th>
                      <th className="p-3 text-right">XP Points</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 bg-white font-bold text-zinc-800">
                    {ledger.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-mono text-zinc-500 block text-[10px]">{item.id.toUpperCase()}</span>
                          <span className="text-[10px] font-bold text-zinc-400">{item.date}</span>
                        </td>
                        <td className="p-3 uppercase text-black font-black">{item.title}</td>
                        <td className="p-3 text-[10px] uppercase">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-right text-emerald-700 font-mono font-black">{item.co2SavedKg} Kg</td>
                        <td className="p-3 text-right font-mono text-violet-600">+{item.pointsEarned}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-400">
                            ✓ Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timelines stack */}
            <div className="relative border-l-4 border-black ml-4 pl-6 space-y-6 pt-2">
              {ledger.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Circle locator */}
                  <span className="absolute -left-[32.5px] top-1.5 h-4 w-4 rounded-full border-2 border-black bg-[#FFD700] ring-4 ring-white group-hover:scale-125 transition-transform"></span>

                  <div className="bg-white border-2 border-black p-4 rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-black text-zinc-500">
                      <span>{item.date}</span>
                      <span className="bg-zinc-100 px-2 py-0.5 rounded border border-black uppercase text-[9px] font-extrabold tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-black uppercase">{item.title}</h4>

                    <div className="pt-2 border-t border-black/10 flex justify-between items-center text-[11.5px] font-bold">
                      <div className="text-emerald-700 flex items-center gap-1">
                        <Leaf className="h-3.5 w-3.5 fill-emerald-100" />
                        <span>Saved {item.co2SavedKg} Kg CO2e</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-655 font-mono">
                          +{item.pointsEarned} XP
                        </span>
                        <button
                          onClick={() => downloadDonationReceipt(item)}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-[#FAF8F2] text-black border border-black rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                          title="Download formal tax-exempt donation receipt for this item"
                        >
                          <Download className="h-2.5 w-2.5 text-emerald-600" /> Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate block */}
          <div className="lg:col-span-5 bg-white border-2 border-black p-4 sm:p-6 rounded-3xl space-y-6 flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase text-black flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  Green Stewardship Certificate
                </h3>
                <p className="text-[11px] font-bold text-zinc-550">Dynamic official credential certifying your carbon mitigation activity record.</p>
              </div>

              {/* Certificate Preview Card */}
              <div className="border-4 border-emerald-700 p-4 rounded-2xl bg-[#FAF8F2] relative overflow-hidden space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
                {/* Vintage seal background lines */}
                <div className="absolute top-0 right-0 p-8 opacity-5 scale-150">
                  <Award className="h-40 w-40 text-emerald-800" />
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-extrabold text-emerald-800 tracking-widest uppercase">CERTIFICATE OF OFFSET EXCELLENCE</p>
                  <p className="text-xs italic text-zinc-600">Presenting this dynamic award layout to</p>
                </div>

                <p className="text-lg font-black uppercase text-zinc-900 tracking-tighter underline underline-offset-4 decoration-2 decoration-amber-500">
                  {loggedInUser ? loggedInUser.name : "Dr. Alok Verma"}
                </p>

                <div className="space-y-1.5 py-2">
                  <p className="text-[10.5px] font-bold text-zinc-650 max-w-[280px] mx-auto leading-relaxed">
                    By sorting packaging, clothes, books and composting wet organic waste, preventing atmospheric carbon emissions:
                  </p>
                  <p className="text-lg font-mono font-black text-emerald-700">
                    {ledger.reduce((acc, curr) => acc + curr.co2SavedKg, 0).toFixed(1)} Kg CO2e Saved
                  </p>
                </div>

                <div className="pt-3 border-t border-black/10 flex justify-between items-center text-[10px] font-mono text-zinc-550">
                  <div className="text-left leading-tight">
                    <p className="font-extrabold italic text-emerald-950">S. Ramaswamy</p>
                    <p className="text-[8px] uppercase">Society Caretaker</p>
                  </div>
                  <div className="h-9 w-9 bg-amber-400 rounded-full border border-black flex items-center justify-center font-black text-[9px] text-zinc-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    SEAL
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={downloadCertificate}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Download Official PNG Certificate
            </button>

            {/* Eco-Reward Wallet & Claim Desk */}
            <div className="bg-[#FAF8F2] border-2 border-black p-4 rounded-2xl space-y-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="flex items-center gap-1.5 border-b border-black/10 pb-2">
                <Gift className="h-5 w-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase text-black">⚡ Eco-Reward Wallet & Claim Desk</h3>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Convert your sustainable ledger points into real community perks!</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white border border-black p-2.5 rounded-xl">
                <div>
                  <span className="block text-[8px] font-extrabold uppercase text-zinc-400">Spendable Points</span>
                  <span className="text-sm font-mono font-black text-indigo-600">
                    {ledger.reduce((acc, curr) => acc + curr.pointsEarned, 0)} Pts
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-extrabold uppercase text-zinc-400">Coupons Claimed</span>
                  <span className="text-sm font-mono font-black text-emerald-600">
                    {claimedCoupons.length} Claimed
                  </span>
                </div>
              </div>

              {/* Progress Bar to next Milestone */}
              {(() => {
                const currentPts = ledger.reduce((acc, curr) => acc + curr.pointsEarned, 0);
                const milestoneGoal = 1000;
                const nextMilestone = Math.ceil((currentPts + 1) / milestoneGoal) * milestoneGoal;
                const currentMilestoneStart = nextMilestone - milestoneGoal;
                const progressInMilestone = currentPts - currentMilestoneStart;
                const progressPercentage = Math.min(100, Math.round((progressInMilestone / milestoneGoal) * 100));

                return (
                  <div className="space-y-1 bg-white border border-black p-2.5 rounded-xl">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-black">
                      <span>🎁 Milestone Progress</span>
                      <span className="font-mono text-indigo-600">{currentPts} / {nextMilestone} Pts</span>
                    </div>
                    {/* Progress bar container */}
                    <div className="w-full bg-zinc-150 border border-black h-3.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 border-r border-black" 
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[7.5px] font-black text-zinc-500 uppercase leading-none mt-0.5">
                      <span>Progress: {progressPercentage}%</span>
                      <span>{nextMilestone - currentPts} Pts to next bonus</span>
                    </div>
                  </div>
                );
              })()}

              {/* List of Redeemable Eco Perks */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-black tracking-wider block">Available Redemptions:</span>
                <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                  {[
                    { id: 'perk-1', title: '1 Kg Organic Compost Pack', cost: 300, icon: '🌿', desc: 'Premium compost from society bio-reactors.' },
                    { id: 'perk-2', title: 'Partner Café 15% Eco-Discount', cost: 500, icon: '☕', desc: 'Discount voucher at sustainable cafés.' },
                    { id: 'perk-3', title: 'Solar Garden Lawn Lamp Kit', cost: 1200, icon: '☀️', desc: 'Stake-mounted outdoor solar garden lighting.' }
                  ].map(perk => {
                    const totalPts = ledger.reduce((acc, curr) => acc + curr.pointsEarned, 0);
                    const isEligible = totalPts >= perk.cost;
                    const isClaimed = claimedCoupons.includes(perk.id);

                    return (
                      <div key={perk.id} className="border border-black p-2 rounded-lg bg-white flex items-center justify-between gap-2 text-left">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-md shrink-0">{perk.icon}</span>
                          <div className="truncate">
                            <p className="text-[9px] font-black text-black leading-tight truncate">{perk.title}</p>
                            <p className="text-[7.5px] font-bold text-zinc-400 truncate leading-none mt-0.5">{perk.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[8px] font-mono font-black bg-zinc-50 border border-zinc-200 px-1 py-0.5 rounded text-zinc-550">
                            {perk.cost} Pts
                          </span>
                          {isClaimed ? (
                            <span className="bg-zinc-100 text-zinc-400 text-[7px] font-black uppercase px-1.5 py-0.5 rounded border border-zinc-200">
                              Claimed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimCoupon(perk.id, perk.cost)}
                              disabled={!isEligible}
                              className={`px-2 py-0.5 text-[7.5px] font-black uppercase rounded border transition-colors ${
                                isEligible
                                  ? 'bg-[#FFD700] border-black hover:bg-amber-400 cursor-pointer text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                  : 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed'
                              }`}
                            >
                              {isEligible ? 'Claim' : 'Locked'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Particle Burst Effect */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="relative">
            {particles.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full shadow-[0px_2px_4px_rgba(0,0,0,0.2)]"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  transform: 'translate(-50%, -50%)',
                  animation: `particle-burst-${p.id} 1.3s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`
                }}
              >
                <style>{`
                  @keyframes particle-burst-${p.id} {
                    0% {
                      transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg);
                      opacity: 1;
                    }
                    100% {
                      transform: translate(-50%, -50%) translate(${p.dx}px, ${p.dy}px) scale(0) rotate(360deg);
                      opacity: 0;
                    }
                  }
                `}</style>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
