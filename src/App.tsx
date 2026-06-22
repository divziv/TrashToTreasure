/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp, 
  Layers,
  HeartPlus,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';

// Key Sub Components
import AccessibilityControls, { VisionMode } from './components/AccessibilityControls';
import LeaderboardMetrics from './components/LeaderboardMetrics';
import SupervisorPanel from './components/SupervisorPanel';
import CollectorPanel from './components/CollectorPanel';
import ResidentPanel from './components/ResidentPanel';
import DonationHub from './components/DonationHub';

// Types
import { 
  Portal, 
  User, 
  WasteAlert, 
  FlatAlertNotification, 
  Complaint, 
  DonationItem, 
  ImpactMetrics 
} from './types';

export default function App() {
  // Accessibility flags
  const [visionMode, setVisionMode] = useState<VisionMode>('default');
  const [voiceActive, setVoiceActive] = useState<boolean>(false);

  // Active view states
  const [activeTab, setActiveTab] = useState<'metrics' | 'resident' | 'supervisor' | 'collector' | 'donations'>('metrics');

  // Network Loading trackers
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Dynamic Data States
  const [portals, setPortals] = useState<Portal[]>([]);
  const [currentPortal, setCurrentPortal] = useState<Portal | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<WasteAlert[]>([]);
  const [notifications, setNotifications] = useState<FlatAlertNotification[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics | null>(null);
  const [portalImpacts, setPortalImpacts] = useState<any[]>([]);

  // Filtering indicators
  const [metricFilter, setMetricFilter] = useState<'all' | 'apartment' | 'office' | 'university'>('all');

  // Active Session states
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // Fetch initial dataset on load
  useEffect(() => {
    loadAllRecords();
  }, []);

  const loadAllRecords = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);

      // Load parallel fetch streams for swift UX
      const [
        resPortals,
        resUsers,
        resAlerts,
        resNotifs,
        resComplaints,
        resDonations,
        resMetrics
      ] = await Promise.all([
        fetch('/api/portals'),
        fetch('/api/users'),
        fetch('/api/alerts'),
        fetch('/api/notifications'),
        fetch('/api/complaints'),
        fetch('/api/donations'),
        fetch('/api/metrics')
      ]);

      if (!resPortals.ok || !resAlerts.ok || !resMetrics.ok) {
        throw new Error("Local endpoints did not respond correctly.");
      }

      const portalsData = await resPortals.json();
      const usersData = await resUsers.json();
      const alertsData = await resAlerts.json();
      const notificationsData = await resNotifs.json();
      const complaintsData = await resComplaints.json();
      const donationsData = await resDonations.json();
      const metricsPayload = await resMetrics.json();

      setPortals(portalsData);
      setUsers(usersData);
      setAlerts(alertsData);
      setNotifications(notificationsData);
      setComplaints(complaintsData);
      setDonations(donationsData);
      setImpactMetrics(metricsPayload.metrics);
      setPortalImpacts(metricsPayload.entityImpact);

      // Set fallback portal to Greenwood Residency
      if (portalsData.length > 0) {
        const defaultPortal = portalsData.find((p: any) => p.id === 'portal-1') || portalsData[0];
        setCurrentPortal(defaultPortal);
      }

      // Default to Greenwood Resident flat 101 state for instant demoability
      const defaultUser = usersData.find((u: any) => u.id === 'user-3') || null;
      setLoggedInUser(defaultUser);

    } catch (err: any) {
      console.error(err);
      setErrorStatus("Could not fetch data. Ensure your server.ts dev process completed setup on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  // Re-synchronize metrics only
  const refreshMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      setImpactMetrics(data.metrics);
      setPortalImpacts(data.entityImpact);
    } catch (err) {
      console.error("Metric sync failure:", err);
    }
  };

  // Switch Portal Zone context (Apartment to Office or school etc)
  const handlePortalSwitch = (portal: Portal) => {
    setCurrentPortal(portal);
    // Find matching supervisor or user to bypass demo auth complexity cleanly
    const matchingUser = users.find(u => u.portalId === portal.id) || null;
    setLoggedInUser(matchingUser);

    if (voiceActive && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(`Entity switched to ${portal.name}`);
      window.speechSynthesis.speak(u);
    }
  };

  // 1. Logins
  const handleAuthLogin = async (username: string, role: string, portalId: string, name: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role, portalId, name, bypassFace: true })
      });
      const userDoc = await res.json();
      setLoggedInUser(userDoc);
      // update list
      const resUsers = await fetch('/api/users');
      const usersDoc = await resUsers.json();
      setUsers(usersDoc);
    } catch (err) {
      alert("Registration failed");
    }
  };

  // 2. Dispatches alerts from collector dashboard
  const handleCreateAlert = async (alertData: Partial<WasteAlert>) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });
      const alertDoc = await res.json();
      setAlerts(prev => [alertDoc, ...prev.filter(a => a.id !== alertDoc.id)]);
      
      // Update dynamic alerts notifications and metrics
      const resNotifs = await fetch('/api/notifications');
      const textNotifs = await resNotifs.json();
      setNotifications(textNotifs);
      
      await refreshMetrics();
      return alertDoc;
    } catch (err) {
      alert("Failed to submit alert");
      throw err;
    }
  };

  // 3. Supervisor triggers targeted notifications
  const handleAddNotification = async (notifData: Partial<FlatAlertNotification>) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifData)
      });
      const doc = await res.json();
      setNotifications(prev => [doc, ...prev]);
    } catch (err) {
      alert("Failed to send notifications");
    }
  };

  // 4. Resident lodge complaint
  const handleAddComplaint = async (compData: Partial<Complaint>) => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compData)
      });
      const doc = await res.json();
      setComplaints(prev => [doc, ...prev]);
    } catch {
      alert("Fails to post feedbacks");
    }
  };

  // 5. Supervisor responds & resolves complaint
  const handleResolveComplaint = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notes, status: 'resolved' })
      });
      const doc = await res.json();
      setComplaints(prev => prev.map(c => c.id === id ? doc : c));
    } catch {
      alert("Failure resolving ticket.");
    }
  };

  // 6. Propose clothing / novels donation
  const handleAddDonation = async (donData: Partial<DonationItem>) => {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donData)
      });
      const doc = await res.json();
      setDonations(prev => [doc, ...prev]);
      await refreshMetrics();
    } catch {
      alert("Donation registration failed");
    }
  };

  // 7. NGO claims item
  const handleClaimDonation = async (id: string, ngoName: string) => {
    try {
      const res = await fetch(`/api/donations/${id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimedByNGO: ngoName })
      });
      const doc = await res.json();
      setDonations(prev => prev.map(d => d.id === id ? doc : d));
      await refreshMetrics();
    } catch {
      alert("Claiming item failed");
    }
  };

  // 8. Register portal context
  const handleRegisterPortal = async (name: string, type: 'apartment'|'office'|'university', floors: number, units: string) => {
    try {
      const res = await fetch('/api/portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, floorsCount: floors, unitsPerFloor: units })
      });
      const doc = await res.json();
      setPortals(prev => [...prev, doc]);
      setCurrentPortal(doc);
    } catch {
      alert("Sector registration failed.");
    }
  };

  // Helper selectors
  const activeCollectors = users.filter(u => u.role === 'collector' && u.portalId === (currentPortal?.id || ''));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-semibold tracking-wider uppercase">Loading hyper-local environmental network databases...</p>
      </div>
    );
  }

  if (errorStatus || !currentPortal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-6 text-center space-y-4 max-w-md mx-auto">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold text-zinc-900">Database Connection Error</h2>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed">{errorStatus}</p>
        <button 
          onClick={loadAllRecords}
          className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider cursor-pointer shadow-md"
        >
          Check Again
        </button>
      </div>
    );
  }

  return (
    <div id="application-sandbox" className="flex flex-col min-h-screen bg-[#FAF8F2]">
      
      {/* 1. Global Screen Reader & Contrast Toggles */}
      <AccessibilityControls 
        visionMode={visionMode}
        setVisionMode={setVisionMode}
        voiceActive={voiceActive}
        setVoiceActive={setVoiceActive}
      />

      {/* 2. Primary Navigation Bar */}
      <header className="bg-[#FFD700] vibrant-bg-yellow vibrant-border p-4 sm:p-6 rounded-3xl vibrant-shadow sticky top-4 z-40 my-4 mx-4 sm:mx-6 text-black">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Logo & Current Sector Status */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white text-black border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:rotate-6 transition-transform flex-shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-black">CommunityEco</h1>
                <span className="bg-black text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {currentPortal.type} sector
                </span>
              </div>
              <p className="text-xs font-bold text-black/80 mt-1">
                Active Zone: <strong className="underline underline-offset-2 decoration-2">{currentPortal.name}</strong> ({currentPortal.floorsCount} floors)
              </p>
            </div>
          </div>

          {/* Quick Demo Selector links (Bypasses manual setup complexity) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-black mr-1 hidden xl:inline">Navigation Panel::</span>
            <button
              onClick={() => {
                setActiveTab('resident');
                const resUsr = users.find(u => u.role === 'resident' && u.portalId === currentPortal.id) || users.find(u => u.role === 'resident') || null;
                setLoggedInUser(resUsr);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer border-2 border-black ${activeTab === 'resident' ? 'bg-[#7C3AED] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100 text-black'}`}
              aria-label="Toggle resident view tab"
            >
              <Layers className="h-3.5 w-3.5 inline mr-1.5" /> Citizen Corner
            </button>
            <button
              onClick={() => {
                setActiveTab('collector');
                setLoggedInUser(null);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer border-2 border-black ${activeTab === 'collector' ? 'bg-[#F43F5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100 text-black'}`}
              aria-label="Toggle collector scanner view tab"
            >
              <UserCheck className="h-3.5 w-3.5 inline mr-1.5" /> Biometric Scan
            </button>
            <button
              onClick={() => {
                setActiveTab('supervisor');
                const supUsr = users.find(u => u.role === 'supervisor' && u.portalId === currentPortal.id) || users.find(u => u.role === 'supervisor') || null;
                setLoggedInUser(supUsr);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer border-2 border-black ${activeTab === 'supervisor' ? 'bg-amber-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100 text-black'}`}
              aria-label="Toggle caretaker supervisor zone"
            >
              <ShieldCheck className="h-3.5 w-3.5 inline mr-1.5" /> Admin Panel
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer border-2 border-black ${activeTab === 'donations' ? 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100 text-black'}`}
              aria-label="Toggle charity match tab"
            >
              <HeartPlus className="h-3.5 w-3.5 inline mr-1.5" /> Charity Desk
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer border-2 border-black ${activeTab === 'metrics' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100 text-black'}`}
              aria-label="Toggle impact indicators dashboard"
            >
              <TrendingUp className="h-3.5 w-3.5 inline mr-1.5" /> Live Metrics
            </button>
          </div>

        </div>
      </header>

      {/* 3. Main content body of selected Tab */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 relative">
        
        {/* Banner notices trigger updates feedback */}
        {notifications.length > 0 && notifications[0].severity === 'high' && (
          <div className="bg-[#F43F5E] text-white p-4 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 flex items-center justify-between text-sm font-black uppercase animate-bounce mt-2">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-white flex-shrink-0" />
              <span>DANGER CRITICAL: {notifications[0].title} &rarr; {notifications[0].body}</span>
            </div>
            <button 
              onClick={() => {
                setNotifications(prev => prev.slice(1));
              }}
              className="bg-white text-black px-4 py-1 rounded-full text-xs font-black border-2 border-black hover:bg-zinc-100 cursor-pointer ml-3 flex-shrink-0"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Dynamic Panel router */}
        <div className=" transition-all ease-in opacity-100">
          
          {/* I. Impact dashboard view */}
          {activeTab === 'metrics' && (
            <LeaderboardMetrics 
              metrics={impactMetrics}
              entityImpacts={portalImpacts}
              filterType={metricFilter}
              setFilterType={setMetricFilter}
              loading={loading}
              complaints={complaints}
            />
          )}

          {/* II. Supervisors panel section */}
          {activeTab === 'supervisor' && (
            <SupervisorPanel 
              currentPortal={currentPortal}
              allPortals={portals}
              changePortal={handlePortalSwitch}
              complaints={complaints}
              alerts={alerts}
              onAddNotification={handleAddNotification}
              onResolveComplaint={handleResolveComplaint}
              onRegisterPortal={handleRegisterPortal}
            />
          )}

          {/* III. Sweeper and floor status section with biometrics */}
          {activeTab === 'collector' && (
            <CollectorPanel 
              currentPortal={currentPortal}
              collectors={activeCollectors}
              onLoginCollector={(user) => {
                setLoggedInUser(user);
                setActiveTab('collector');
              }}
              loggedInCollector={loggedInUser && loggedInUser.role === 'collector' ? loggedInUser : null}
              onLogout={() => setLoggedInUser(null)}
              onAddAlert={handleCreateAlert}
            />
          )}

          {/* IV. Residents portal zone */}
          {activeTab === 'resident' && (
            <ResidentPanel 
              currentPortal={currentPortal}
              loggedInUser={loggedInUser}
              notifications={notifications}
              donations={donations}
              onSubmitComplaint={handleAddComplaint}
              onSubmitDonation={handleAddDonation}
              loading={loading}
            />
          )}

          {/* V. Donation registry Hub */}
          {activeTab === 'donations' && (
            <DonationHub 
              donations={donations}
              onClaimDonation={handleClaimDonation}
              loading={loading}
            />
          )}

        </div>

      </main>

      {/* 4. Elegant Universal Footer with WCAG notice lines */}
      <footer className="bg-[#FAF8F2] text-black py-8 border-t-4 border-black text-xs text-center mt-12 font-bold uppercase tracking-widest">
        <div className="w-full max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-black text-sm text-[#7C3AED] uppercase">🌿 CommunityEco - Hyperlocal Garbage & Charity Management Network</p>
          <p className="max-w-2xl mx-auto text-[11px] leading-relaxed">
            Engineered using fully modular components and server-side model auditing. Backed by automated facial biometrics bypasses alongside auditory screen read narration protocols to guarantee equal, dignified opportunities to all people.
          </p>
          <p className="text-[10px] text-zinc-500 font-bold">
            © 2026 Community Hero | Powered by Google Gemini & AI Studio | Vibrant v2.4
          </p>
        </div>
      </footer>

    </div>
  );
}
