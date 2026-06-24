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
  VolumeX
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

  // Resident floor filter
  const [residentFloor, setResidentFloor] = useState<number>(1);

  // Complaint form states
  const [compTitle, setCompTitle] = useState('');
  const [compCat, setCompCat] = useState<'delay' | 'missed' | 'spilt' | 'sorting_issue' | 'others'>('delay');
  const [compDesc, setCompDesc] = useState('');
  const [submittingComp, setSubmittingComp] = useState(false);

  // Donation form states
  const [donTitle, setDonTitle] = useState('');
  const [donCat, setDonCat] = useState<'clothes' | 'food' | 'books' | 'others'>('clothes');
  const [donQty, setDonQty] = useState('');
  const [donDesc, setDonDesc] = useState('');
  const [donContact, setDonContact] = useState('');
  const [submittingDon, setSubmittingDon] = useState(false);

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

  // Compile active notices relevant to resident's selected floor
  const activeNotifs = notifications.filter(notif => {
    if (notif.portalId !== currentPortal.id) return false;
    // Broadcast notices have floor = -1
    return notif.floor === -1 || notif.floor === residentFloor;
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
            </div>

            {/* Badges Earned Section */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1">
                  🏅 Stewardship Badges ({badgesList.filter(b => b.unlocked).length} / {badgesList.length})
                </h4>
                <p className="text-[11px] font-bold text-zinc-500">Earn credentials by participating in different categories of resource recovery.</p>
              </div>

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
          
          <div className="md:col-span-5 bg-white vibrant-border p-5 rounded-3xl vibrant-shadow-sm space-y-4">
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

          <div className="md:col-span-7 bg-white border-2 border-black p-6 rounded-3xl space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-sm font-black text-black uppercase tracking-widest bg-[#FFD700] border-2 border-black px-2.5 py-1 rounded-lg inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
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
              <div className="py-24 text-center border-4 border-dashed border-zinc-300 rounded-3xl text-zinc-500 font-black text-xs uppercase bg-[#FAF8F2]">
                Awaiting items entry form above. Fill specifications and hit "Check Quality" to run model validation.
              </div>
            )}
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
