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
import { IndiaMap } from './components/IndiaMap';
import { Globe, LogIn, LogOut, CheckCircle, AlertTriangle, Bell, Megaphone } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'metrics' | 'resident' | 'supervisor' | 'collector' | 'donations' | 'national'>('metrics');

  // Google Auth Session states
  const [googleUser, setGoogleUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    portalId?: string;
    unitNumber?: string;
    focusCategory?: string;
  } | null>(null);

  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState<boolean>(false);
  
  // Forms states for Google signup
  const [googleFormEmail, setGoogleFormEmail] = useState<string>('');
  const [googleFormName, setGoogleFormName] = useState<string>('');
  const [googleFormRole, setGoogleFormRole] = useState<'resident' | 'collector' | 'supervisor' | 'donor'>('resident');
  const [googleFormPortalId, setGoogleFormPortalId] = useState<string>('');
  const [googleFormUnit, setGoogleFormUnit] = useState<string>('');
  const [googleFormFocus, setGoogleFormFocus] = useState<string>('Electronics');

  // Live Community Broadcast Updates feed
  const [googleUpdates, setGoogleUpdates] = useState<Array<{
    id: string;
    name: string;
    email: string;
    title: string;
    text: string;
    category: string;
    createdAt: string;
  }>>([
    {
      id: 'g-up-1',
      name: 'Arun Kumar',
      email: 'arun.k@gmail.com',
      title: 'Block A Cardboard Reclamation Completed',
      text: 'Collected and consolidated 15kg of dry cardboard boxes from the third floor. Stored securely at local collection bay.',
      category: 'Paper & Cardboard',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'g-up-2',
      name: 'Sneha Patel',
      email: 'sneha.patel@gmail.com',
      title: 'Bio-composting temperature audit',
      text: 'The wet compost pits in Sector B have reached optimal fermentation temperature. Decomposition looking clean and odor-free.',
      category: 'Organic Composting',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ]);

  // Google Action: Create Dispatch Alert Form
  const [showDispatchSuccess, setShowDispatchSuccess] = useState<boolean>(false);
  const [dispatchTarget, setDispatchTarget] = useState<'committee' | 'rews' | 'janitor'>('rews');
  const [dispatchDesc, setDispatchDesc] = useState<string>('');
  const [dispatchFloor, setDispatchFloor] = useState<number>(1);
  const [dispatchSeverity, setDispatchSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  // Google Action: Broadcast Post Form
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [broadcastCategory, setBroadcastCategory] = useState<string>('Disposal Status');
  const [showBroadcastSuccess, setShowBroadcastSuccess] = useState<boolean>(false);

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

  // Auto-dismiss high-priority notification after 10 seconds to keep UI clean
  useEffect(() => {
    if (notifications.length > 0 && notifications[0].severity === 'high') {
      const activeNotifId = notifications[0].id;
      const timer = setTimeout(() => {
        setNotifications(prev => {
          if (prev.length > 0 && prev[0].id === activeNotifId) {
            return prev.slice(1);
          }
          return prev;
        });
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [notifications]);

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

      // Save to localStorage for robust offline capability
      try {
        localStorage.setItem('cached-portals', JSON.stringify(portalsData));
        localStorage.setItem('cached-users', JSON.stringify(usersData));
        localStorage.setItem('cached-alerts', JSON.stringify(alertsData));
        localStorage.setItem('cached-notifications', JSON.stringify(notificationsData));
        localStorage.setItem('cached-complaints', JSON.stringify(complaintsData));
        localStorage.setItem('cached-donations', JSON.stringify(donationsData));
        localStorage.setItem('cached-impactMetrics', JSON.stringify(metricsPayload.metrics));
        localStorage.setItem('cached-portalImpacts', JSON.stringify(metricsPayload.entityImpact));
      } catch (e) {
        console.warn('Could not write to localStorage cache:', e);
      }

      // Set fallback portal to Greenwood Residency
      if (portalsData.length > 0) {
        const defaultPortal = portalsData.find((p: any) => p.id === 'portal-1') || portalsData[0];
        setCurrentPortal(defaultPortal);
      }

      // Default to Greenwood Resident flat 101 state for instant demoability
      const defaultUser = usersData.find((u: any) => u.id === 'user-3') || null;
      setLoggedInUser(defaultUser);

    } catch (err: any) {
      console.error('Fetch error, checking localStorage fallback:', err);
      try {
        const savedPortals = localStorage.getItem('cached-portals');
        const savedUsers = localStorage.getItem('cached-users');
        const savedAlerts = localStorage.getItem('cached-alerts');
        const savedNotifications = localStorage.getItem('cached-notifications');
        const savedComplaints = localStorage.getItem('cached-complaints');
        const savedDonations = localStorage.getItem('cached-donations');
        const savedImpactMetrics = localStorage.getItem('cached-impactMetrics');
        const savedPortalImpacts = localStorage.getItem('cached-portalImpacts');

        if (savedPortals && savedNotifications) {
          const portalsData = JSON.parse(savedPortals);
          const usersData = savedUsers ? JSON.parse(savedUsers) : [];
          setPortals(portalsData);
          setUsers(usersData);
          if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
          setNotifications(JSON.parse(savedNotifications));
          if (savedComplaints) setComplaints(JSON.parse(savedComplaints));
          if (savedDonations) setDonations(JSON.parse(savedDonations));
          if (savedImpactMetrics) setImpactMetrics(JSON.parse(savedImpactMetrics));
          if (savedPortalImpacts) setPortalImpacts(JSON.parse(savedPortalImpacts));

          if (portalsData.length > 0) {
            const defaultPortal = portalsData.find((p: any) => p.id === 'portal-1') || portalsData[0];
            setCurrentPortal(defaultPortal);
          }
          const defaultUser = usersData.find((u: any) => u.id === 'user-3') || null;
          setLoggedInUser(defaultUser);

          setErrorStatus("Running in Offline Cache Mode. Critical data remains visible.");
          return;
        }
      } catch (cacheErr) {
        console.error('Could not load offline cache:', cacheErr);
      }
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

  // Google Sign-In Simulations & Event Dispatches
  const handleGoogleSelectAccount = async (email: string, name: string) => {
    try {
      const existing = users.find(u => u.username.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        setGoogleUser({
          name: existing.name,
          email: existing.username,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${existing.name}`,
          role: existing.role,
          portalId: existing.portalId,
          unitNumber: 'Flat 101',
          focusCategory: 'All Eco Waste'
        });
        setLoggedInUser(existing);
        
        // Match active portal
        const pt = portals.find(p => p.id === existing.portalId);
        if (pt) setCurrentPortal(pt);

        setShowGoogleModal(false);
      } else {
        // New user! Initiate profile details form
        setGoogleFormEmail(email);
        setGoogleFormName(name);
        setGoogleFormRole('resident');
        if (portals.length > 0) {
          setGoogleFormPortalId(portals[0].id);
        }
        setIsNewGoogleUser(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: googleFormEmail.toLowerCase().trim(), 
          role: googleFormRole, 
          portalId: googleFormPortalId, 
          name: googleFormName, 
          bypassFace: true 
        })
      });
      const userDoc = await res.json();
      
      // Update list
      const resUsers = await fetch('/api/users');
      const usersDoc = await resUsers.json();
      setUsers(usersDoc);

      setGoogleUser({
        name: userDoc.name,
        email: userDoc.username,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userDoc.name}`,
        role: userDoc.role,
        portalId: userDoc.portalId,
        unitNumber: googleFormUnit || 'Flat 202',
        focusCategory: googleFormFocus
      });
      setLoggedInUser(userDoc);

      const pt = portals.find(p => p.id === userDoc.portalId);
      if (pt) setCurrentPortal(pt);

      setIsNewGoogleUser(false);
      setShowGoogleModal(false);
    } catch (err) {
      alert("Google Eco Profile registration failed");
    }
  };

  const handleGoogleLogout = () => {
    setGoogleUser(null);
    // Default back to Greenwood Resident flat 101 state for demo
    const defaultUser = users.find((u: any) => u.id === 'user-3') || null;
    setLoggedInUser(defaultUser);
  };

  const handleGoogleSubmitBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !broadcastTitle || !broadcastText) return;

    const newBroadcast = {
      id: `g-up-${Date.now()}`,
      name: googleUser.name,
      email: googleUser.email,
      title: broadcastTitle,
      text: broadcastText,
      category: broadcastCategory,
      createdAt: new Date().toISOString()
    };

    setGoogleUpdates(prev => [newBroadcast, ...prev]);
    setBroadcastTitle('');
    setBroadcastText('');
    setShowBroadcastSuccess(true);
    setTimeout(() => setShowBroadcastSuccess(false), 4000);
  };

  const handleGoogleSubmitDispatchAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !dispatchDesc) return;

    const targetLabel = dispatchTarget === 'rews' ? 'REWS TEAM' : dispatchTarget === 'committee' ? 'ASSOCIATION COMMITTEE' : 'REWS CARETAKER STAFF';
    const alertNotes = `[REQUEST VIA GOOGLE USER - DISPATCHED TO ${targetLabel}]: Floor ${dispatchFloor} - ${dispatchDesc}`;

    try {
      // 1. Create the alert
      const alertData = {
        portalId: googleUser.portalId || currentPortal?.id || 'portal-1',
        floor: Number(dispatchFloor),
        status: 'alerted' as const,
        notes: alertNotes,
        aiClassification: {
          category: googleUser.focusCategory || 'General Items',
          recyclability: 'Urgent Recovery Needed',
          instructions: `Handover directly to ${targetLabel}. Ensure proper segregative containment immediately.`,
          estimatedWeight: '6.5 KG',
          carbonOffset: '14.2 Kg'
        }
      };

      await handleCreateAlert(alertData);

      // 2. Create the notification
      await handleAddNotification({
        portalId: googleUser.portalId || currentPortal?.id || 'portal-1',
        floor: Number(dispatchFloor),
        title: `⚠️ DISPATCH REQUEST RECEIVED: ${targetLabel}`,
        body: `${googleUser.name} requested immediate attention: ${dispatchDesc}`,
        senderName: googleUser.name,
        severity: dispatchSeverity
      });

      setDispatchDesc('');
      setShowDispatchSuccess(true);
      setTimeout(() => setShowDispatchSuccess(false), 4000);
    } catch (err) {
      alert("Failed to register alert request");
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

  // 7b. Schedule donation item pickup time slot
  const handleSchedulePickup = async (id: string, slot: string) => {
    try {
      const res = await fetch(`/api/donations/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupSlot: slot })
      });
      const doc = await res.json();
      setDonations(prev => prev.map(d => d.id === id ? doc : d));
      await refreshMetrics();
    } catch {
      alert("Scheduling pickup slot failed");
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
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-black">Trash To Treasure</h1>
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
            <button
              onClick={() => setActiveTab('national')}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer border-2 border-black ${activeTab === 'national' ? 'bg-emerald-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100 text-black'}`}
              aria-label="Toggle national coverage map tab"
            >
              <Globe className="h-3.5 w-3.5 inline mr-1.5" /> National Coverage
            </button>
          </div>

          {/* Google Auth status section */}
          <div className="flex items-center gap-2 lg:border-l-2 lg:border-black/20 lg:pl-4 self-end lg:self-center">
            {googleUser ? (
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-2xl px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <img src={googleUser.avatar} className="h-6 w-6 rounded-full border border-black bg-zinc-100" alt="Avatar" referrerPolicy="no-referrer" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tight text-black leading-none">{googleUser.name}</p>
                  <p className="text-[8px] font-bold text-zinc-500 leading-none">{googleUser.email}</p>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="p-1 bg-red-100 hover:bg-red-200 border border-black rounded-lg cursor-pointer transition-all ml-1"
                  title="Sign out of Google"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsNewGoogleUser(false);
                  setShowGoogleModal(true);
                }}
                className="px-4 py-2 bg-white hover:bg-zinc-100 text-black border-2 border-black rounded-2xl text-xs font-black uppercase tracking-tight flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all"
              >
                <span>🌐</span> Login with Google
              </button>
            )}
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

        {/* Google User - Community Eco-Stewardship Action & Dispatch Hub */}
        {googleUser && (
          <div className="bg-[#FAF8F2] border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] mb-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-black pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-[#FFD700] border-2 border-black rounded-2xl flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  🌐
                </div>
                <div>
                  <span className="bg-[#7C3AED] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    Google Auth Eco Session Active
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-black mt-1 flex items-center gap-1.5">
                    Google Eco-Stewardship & Dispatch Hub
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-2xl px-3.5 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-black">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
                <span>Logged in: <strong className="underline decoration-2">{googleUser.name}</strong> ({googleUser.role})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Actions columns - 8 cols */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Section A: Public Broadcast Update form */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 mb-2">
                      <Megaphone className="h-4 w-4 text-[#7C3AED]" />
                      📣 Post Public Update / Broadcast
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-500 mb-3">
                      Provide real-time updates regarding sorting hubs, dry recyclables collection, or organic compost status.
                    </p>

                    <form onSubmit={handleGoogleSubmitBroadcast} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Update Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cardboard dropped off in Block C"
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          className="w-full bg-[#FAF8F2] border-2 border-black p-2 rounded-xl text-xs font-black placeholder:text-zinc-400 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black uppercase text-black block mb-1">Category</label>
                          <select
                            value={broadcastCategory}
                            onChange={(e) => setBroadcastCategory(e.target.value)}
                            className="w-full bg-[#FAF8F2] border-2 border-black p-2 rounded-xl text-xs font-black focus:outline-none"
                          >
                            <option value="Disposal Status">Disposal Status</option>
                            <option value="Cleanup Update">Cleanup Update</option>
                            <option value="Eco Tip / Message">Eco Tip</option>
                            <option value="Donation Alert">Donation Alert</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-black block mb-1">Sector Scope</label>
                          <span className="w-full bg-zinc-100 border border-black p-2.5 rounded-xl text-xs font-bold block truncate">
                            {currentPortal?.name}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Broadcast Details</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Provide details about materials, weight or location..."
                          value={broadcastText}
                          onChange={(e) => setBroadcastText(e.target.value)}
                          className="w-full bg-[#FAF8F2] border-2 border-black p-2 rounded-xl text-xs font-black placeholder:text-zinc-400 focus:outline-none resize-none"
                        />
                      </div>

                      {showBroadcastSuccess && (
                        <div className="bg-emerald-100 text-emerald-800 text-[10px] p-2.5 rounded-xl border border-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Broadcast posted! It has been successfully compiled into the Community Live Feed.</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black uppercase tracking-wider text-xs py-2 px-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all cursor-pointer"
                      >
                        Publish Broadcast Update
                      </button>
                    </form>
                  </div>
                </div>

                {/* Section B: Dispatch Request Alert form */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 mb-2">
                      <Bell className="h-4 w-4 text-[#F43F5E] animate-bounce" />
                      🚨 Dispatch High-Priority Alert Request
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-500 mb-3">
                      Lodge high-priority sorting issues or alerts to the Association Committee, REWS Stewardship, or Supervisor.
                    </p>

                    <form onSubmit={handleGoogleSubmitDispatchAlert} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Target Recipient Team</label>
                        <select
                          value={dispatchTarget}
                          onChange={(e) => setDispatchTarget(e.target.value as any)}
                          className="w-full bg-[#FAF8F2] border-2 border-black p-2 rounded-xl text-xs font-black focus:outline-none"
                        >
                          <option value="rews">REWS Team (Waste Stewardship & Pickup)</option>
                          <option value="committee">Building / Association Committee</option>
                          <option value="janitor">Portal Caretaker & Supervisor</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black uppercase text-black block mb-1">Target Floor</label>
                          <input
                            type="number"
                            min={1}
                            max={currentPortal?.floorsCount || 10}
                            required
                            value={dispatchFloor}
                            onChange={(e) => setDispatchFloor(Number(e.target.value))}
                            className="w-full bg-[#FAF8F2] border-2 border-black p-2 rounded-xl text-xs font-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-black block mb-1">Urgency</label>
                          <select
                            value={dispatchSeverity}
                            onChange={(e) => setDispatchSeverity(e.target.value as any)}
                            className="w-full bg-[#FAF8F2] border-2 border-black p-2 rounded-xl text-xs font-black focus:outline-none"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High (Dangerous/Overflow)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Alert Details / Complaint</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Describe the issue (e.g. Hazardous spill, blocked collection shoot, overflowing organic bin...)"
                          value={dispatchDesc}
                          onChange={(e) => setDispatchDesc(e.target.value)}
                          className="w-full bg-[#FAF8F2] border-2 border-black p-2 rounded-xl text-xs font-black placeholder:text-zinc-400 focus:outline-none resize-none"
                        />
                      </div>

                      {showDispatchSuccess && (
                        <div className="bg-amber-100 text-amber-900 text-[10px] p-2.5 rounded-xl border border-amber-400 font-bold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                          <span>ALERT DISPATCHED! Transmitted directly to target systems. Live indicators have synchronized!</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-black uppercase tracking-wider text-xs py-2 px-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all cursor-pointer"
                      >
                        Transmit Dispatch Request
                      </button>
                    </form>
                  </div>
                </div>

              </div>

              {/* Broadcast live updates list - 4 cols */}
              <div className="lg:col-span-4 bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 border-b border-zinc-200 pb-2">
                    <span>📡 Live Community Feed</span>
                  </h4>

                  <div className="space-y-3.5 overflow-y-auto max-h-[290px] pr-1">
                    {googleUpdates.map((update) => (
                      <div key={update.id} className="bg-zinc-50 border border-black p-3 rounded-xl space-y-1 relative shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                        <span className="absolute top-2 right-2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                          {update.category}
                        </span>
                        <h5 className="text-[11px] font-black text-black leading-tight uppercase pr-16">{update.title}</h5>
                        <p className="text-[10px] text-zinc-650 leading-relaxed font-semibold">{update.text}</p>
                        
                        <div className="flex items-center justify-between pt-1 text-[8px] font-black text-zinc-400 uppercase">
                          <span>By: {update.name}</span>
                          <span>{new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 text-[9px] font-black text-zinc-400 uppercase text-center">
                  Updates persist live for all local sector residents.
                </div>
              </div>

            </div>
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
              onSchedulePickup={handleSchedulePickup}
              loading={loading}
              currentPortal={currentPortal}
            />
          )}

          {/* VI. India Map Interactive Projection */}
          {activeTab === 'national' && (
            <IndiaMap />
          )}

        </div>

      </main>

      {/* 4. Elegant Universal Footer with WCAG notice lines */}
      <footer className="bg-[#FAF8F2] text-black py-8 border-t-4 border-black text-xs text-center mt-12 font-bold uppercase tracking-widest">
        <div className="w-full max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-black text-sm text-[#7C3AED] uppercase">🌿 Trash To Treasure - Hyperlocal Garbage & Charity Management Network</p>
          <p className="max-w-2xl mx-auto text-[11px] leading-relaxed">
            Engineered using fully modular components and server-side model auditing. Backed by automated facial biometrics bypasses alongside auditory screen read narration protocols to guarantee equal, dignified opportunities to all people.
          </p>
          <p className="text-[10px] text-zinc-500 font-bold">
            © 2026 Community Hero | Powered by Google Gemini & AI Studio | Vibrant v2.4
          </p>
        </div>
      </footer>

      {/* 5. Google Sign-In & Onboarding Modal Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F2] border-4 border-black rounded-3xl max-w-lg w-full overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            
            {/* Modal header */}
            <div className="bg-[#FFD700] p-5 border-b-4 border-black flex justify-between items-center text-black">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <h4 className="font-black uppercase tracking-tight text-sm">
                  {isNewGoogleUser ? "Setup Your Google Eco Profile" : "Sign In with Google Account"}
                </h4>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-black hover:text-red-600 font-black text-sm cursor-pointer border-2 border-black bg-white rounded-lg px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                CLOSE
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-black">
              
              {!isNewGoogleUser ? (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-bold leading-relaxed text-zinc-600">
                      Welcome to the Google Sign-In gateway. Select a demo Google profile below or enter a custom address to test the workflow:
                    </p>
                  </div>

                  {/* Preloaded Demo accounts */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider font-bold">Demo Quick Connect Profiles</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleGoogleSelectAccount('arun.k@gmail.com', 'Arun Kumar')}
                        className="bg-white hover:bg-zinc-100 border-2 border-black p-3 rounded-2xl text-left flex items-center gap-3 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all"
                      >
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Arun Kumar" className="h-8 w-8 rounded-full border border-black bg-zinc-50" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight leading-none text-black">Arun Kumar</p>
                          <p className="text-[9px] text-zinc-400 font-bold mt-1">arun.k@gmail.com</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleGoogleSelectAccount('sneha.patel@gmail.com', 'Sneha Patel')}
                        className="bg-white hover:bg-zinc-100 border-2 border-black p-3 rounded-2xl text-left flex items-center gap-3 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all"
                      >
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Sneha Patel" className="h-8 w-8 rounded-full border border-black bg-zinc-50" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight leading-none text-black">Sneha Patel</p>
                          <p className="text-[9px] text-zinc-400 font-bold mt-1">sneha.patel@gmail.com</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-black/10"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-zinc-400 font-black uppercase tracking-wider">Or custom google authentication</span>
                    <div className="flex-grow border-t border-black/10"></div>
                  </div>

                  {/* Custom Account Inputs */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (googleFormEmail && googleFormName) {
                      handleGoogleSelectAccount(googleFormEmail, googleFormName);
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-black block mb-1">Enter Google Account Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Dev"
                        value={googleFormName}
                        onChange={(e) => setGoogleFormName(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2.5 rounded-xl text-xs font-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-black block mb-1">Enter Google Account Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ramesh.dev@gmail.com"
                        value={googleFormEmail}
                        onChange={(e) => setGoogleFormEmail(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2.5 rounded-xl text-xs font-black focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black uppercase tracking-widest text-xs py-3 px-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all cursor-pointer"
                    >
                      Verify Google Credentials
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-4 text-xs font-bold text-amber-900 leading-relaxed space-y-1.5">
                    <p className="font-black text-black text-xs uppercase flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      NEW GOOGLE CITIZEN DETECTED!
                    </p>
                    <p className="text-[11px]">
                      The address <strong className="underline">{googleFormEmail}</strong> is not yet linked with our hyperlocal environmental databases. Let's customize your local profile details below:
                    </p>
                  </div>

                  <form onSubmit={handleGoogleRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Authenticated Name</label>
                        <input
                          type="text"
                          required
                          value={googleFormName}
                          onChange={(e) => setGoogleFormName(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 rounded-xl text-xs font-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Google Email</label>
                        <input
                          type="email"
                          disabled
                          value={googleFormEmail}
                          className="w-full bg-zinc-100 border border-black/25 p-2.5 rounded-xl text-xs font-bold text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Stewardship Category</label>
                        <select
                          value={googleFormRole}
                          onChange={(e) => setGoogleFormRole(e.target.value as any)}
                          className="w-full bg-white border-2 border-black p-2.5 rounded-xl text-xs font-black focus:outline-none"
                        >
                          <option value="resident">Resident Citizen</option>
                          <option value="collector">Stewardship Collector</option>
                          <option value="supervisor">Portal Supervisor</option>
                          <option value="donor">Charitable Donor</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Primary Eco-Disposal Focus</label>
                        <select
                          value={googleFormFocus}
                          onChange={(e) => setGoogleFormFocus(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 rounded-xl text-xs font-black focus:outline-none"
                        >
                          <option value="Electronics">Electronics Recycling</option>
                          <option value="Organic Composting">Organic Composting</option>
                          <option value="Textiles Reclamation">Textiles Reclamation</option>
                          <option value="Dry Waste Segregation">Dry Waste Segregation</option>
                          <option value="General Metal / Glass">General Metal & Glass</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Sector Portal Association</label>
                        <select
                          value={googleFormPortalId}
                          onChange={(e) => setGoogleFormPortalId(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 rounded-xl text-xs font-black focus:outline-none"
                        >
                          {portals.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-black block mb-1">Flat / Unit / Suite Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Block B-304"
                          value={googleFormUnit}
                          onChange={(e) => setGoogleFormUnit(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 rounded-xl text-xs font-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black uppercase tracking-widest text-xs py-3 px-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all cursor-pointer mt-2"
                    >
                      Onboard Eco Account & Sync Google
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
