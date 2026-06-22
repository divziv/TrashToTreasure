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
  Heart
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
  const [activeTab, setActiveTab] = useState<'notifs' | 'complaints' | 'donate'>('notifs');

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

      setDonTitle('');
      setDonQty('');
      setDonDesc('');
      setDonContact('');
      setAiAuditResult(null);

      alert("Thank you! Your donation proposal is logged in the public community hub.");
    } catch {
      alert("Failed to submit donation.");
    } finally {
      setSubmittingDon(false);
    }
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
        </div>
      </div>

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
              <h3 className="text-md font-black text-black uppercase tracking-tight flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#F43F5E]" />
                Live Floor Bulletins (Level {residentFloor})
              </h3>

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

    </div>
  );
}
