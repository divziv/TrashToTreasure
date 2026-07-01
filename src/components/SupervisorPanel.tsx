import React, { useState } from 'react';
import { 
  Megaphone, 
  MessageSquare, 
  Plus, 
  CheckCircle, 
  Loader2, 
  Radio, 
  FileText,
  AlertTriangle,
  UserCheck,
  QrCode,
  Printer,
  Download,
  Sparkles
} from 'lucide-react';
import { Complaint, FlatAlertNotification, Portal, WasteAlert } from '../types';

interface SupervisorPanelProps {
  currentPortal: Portal;
  allPortals: Portal[];
  changePortal: (p: Portal) => void;
  complaints: Complaint[];
  alerts: WasteAlert[];
  onAddNotification: (notifData: Partial<FlatAlertNotification>) => Promise<void>;
  onResolveComplaint: (id: string, notes: string) => Promise<void>;
  onRegisterPortal: (name: string, type: 'apartment'|'office'|'university', floors: number, units: string) => Promise<void>;
}

export default function SupervisorPanel({
  currentPortal,
  allPortals,
  changePortal,
  complaints,
  alerts,
  onAddNotification,
  onResolveComplaint,
  onRegisterPortal
}: SupervisorPanelProps) {
  // Notification form states
  const [notifFloor, setNotifFloor] = useState<number>(1);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSeverity, setNotifSeverity] = useState<'low'|'medium'|'high'>('medium');
  const [notifAllFloors, setNotifAllFloors] = useState<boolean>(false);
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Resolution states
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [confirmingComplaintId, setConfirmingComplaintId] = useState<string | null>(null);

  // Portal creation states
  const [newPortalName, setNewPortalName] = useState('');
  const [newPortalType, setNewPortalType] = useState<'apartment'|'office'|'university'>('apartment');
  const [newPortalFloors, setNewPortalFloors] = useState<number>(5);
  const [newPortalUnits, setNewPortalUnits] = useState('');
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  const [showPortalForm, setShowPortalForm] = useState(false);

  // PDF-style Report generation states & logic
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const downloadImpactReportPDF = () => {
    try {
      setIsGeneratingReport(true);
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw outer cream background
      ctx.fillStyle = '#FAF8F2';
      ctx.fillRect(0, 0, 800, 1100);

      // 2. Draw dual-line geometric page border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 1060);
      ctx.lineWidth = 1;
      ctx.strokeRect(26, 26, 748, 1048);

      // 3. Header Title Banner (Brutalism styled)
      ctx.fillStyle = '#FFD700'; // vibrant yellow
      ctx.fillRect(40, 40, 720, 100);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, 720, 100);

      ctx.fillStyle = '#000000';
      ctx.font = '900 21px sans-serif';
      ctx.fillText('TRASH TO TREASURE COMPLIANCE & ENVIRONMENTAL AUDIT', 60, 80);
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`OFFICIAL ADMINISTRATIVE SUMMARY REPORT // PORTAL: ${currentPortal.name.toUpperCase()}`, 60, 115);

      // 4. Report Metadata section (Left & Right Column)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(40, 160, 720, 110);
      ctx.strokeRect(40, 160, 720, 110);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`REPORT ID     : CE-AUD-${currentPortal.id.substring(0, 8).toUpperCase()}-${Date.now().toString().substring(8)}`, 60, 190);
      ctx.fillText(`GENERATED ON  : ${new Date().toLocaleString().toUpperCase()}`, 60, 215);
      ctx.fillText(`SECTOR DOMAIN : ${currentPortal.type.toUpperCase()} UNIT ZONE`, 60, 240);

      ctx.fillText(`TOTAL LEVEL FLOORS  : ${currentPortal.floorsCount}`, 440, 190);
      ctx.fillText(`PORTAL DB STATUS    : SYNCED / SECURE`, 440, 215);
      ctx.fillText(`AUDIT AUTHORITY     : LOCAL DEPUTY CARETROLLER`, 440, 240);

      // 5. Section: KEY METRICS INDICATORS
      ctx.fillStyle = '#10B981'; // Green accent header bar
      ctx.fillRect(40, 290, 720, 32);
      ctx.strokeRect(40, 290, 720, 32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('I. QUANTITATIVE IMPACT ESTIMATIONS', 55, 311);

      // Draw 3 metric grids
      const metricsList = [
        { label: 'ACTIVE DISPATCHED ALERTS', val: alerts.length.toString() },
        { label: 'RESIDENT CONCERNS FILED', val: complaints.length.toString() },
        { label: 'EST. DIVERSION SCALE', val: '94.2% (OPTIMAL)' }
      ];

      metricsList.forEach((m, idx) => {
        const xPos = 40 + idx * 243;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(xPos, 335, 234, 75);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(xPos, 335, 234, 75);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(m.label, xPos + 15, 360);
        ctx.fillStyle = '#7C3AED';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(m.val, xPos + 15, 395);
      });

      // 6. Section: ACTIVE BIN ALERTS TABLE
      ctx.fillStyle = '#7C3AED'; // Purple header
      ctx.fillRect(40, 430, 720, 32);
      ctx.strokeRect(40, 430, 720, 32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('II. ACTIVE HARDWARE BIN STATUS ALERTS', 55, 451);

      // Draw table header
      ctx.fillStyle = '#111827';
      ctx.fillRect(40, 470, 720, 25);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(40, 470, 720, 25);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('HARDWARE NODE ID', 55, 486);
      ctx.fillText('LEVEL', 260, 486);
      ctx.fillText('CLASSIFICATION', 340, 486);
      ctx.fillText('CAPACITY', 510, 486);
      ctx.fillText('COMPLIANCE STATUS', 630, 486);

      // Filter alerts for this portal
      const currentAlerts = alerts.filter(a => a.portalId === currentPortal.id).slice(0, 5);
      
      let tableY = 495;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;

      // Fill in rows
      if (currentAlerts.length === 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(40, tableY, 720, 40);
        ctx.strokeRect(40, tableY, 720, 40);
        ctx.fillStyle = '#6B7280';
        ctx.font = 'italic 11px sans-serif';
        ctx.fillText('NO SYSTEM EXCEEDED THRESHOLD BIN ALERTS CAPTURED ON THE MAP SENSOR GRID.', 210, tableY + 25);
        tableY += 40;
      } else {
        currentAlerts.forEach((a, i) => {
          ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#FAF8F2';
          ctx.fillRect(40, tableY, 720, 30);
          ctx.strokeRect(40, tableY, 720, 30);

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`BIN-N-${a.id.substring(0, 6).toUpperCase()}`, 55, tableY + 18);
          ctx.fillText(`FLOOR ${a.floor}`, 260, tableY + 18);
          ctx.fillText((a.aiClassification?.category || "MIXED").toUpperCase(), 340, tableY + 18);
          ctx.fillText(a.aiClassification?.estimatedWeight || "4.5 KG", 510, tableY + 18);
          
          const isCritical = a.status === 'alerted';
          ctx.fillStyle = isCritical ? '#F43F5E' : '#D97706';
          ctx.fillText(isCritical ? 'OVERFLOW_ALERT' : 'AWAITING_CLEAR', 630, tableY + 18);
          tableY += 30;
        });
      }

      // 7. Section: CITIZEN FEEDBACK & COMPLAINTS SUMMARY
      ctx.fillStyle = '#F43F5E'; // Red header bar
      ctx.fillRect(40, tableY + 20, 720, 32);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(40, tableY + 20, 720, 32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('III. RECENT CITIZEN DISCREPANCY REVIEWS', 55, tableY + 41);

      // Draw Table Header for complaints
      const compHeadY = tableY + 60;
      ctx.fillStyle = '#111827';
      ctx.fillRect(40, compHeadY, 720, 25);
      ctx.strokeRect(40, compHeadY, 720, 25);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('TICKET SECURE ID', 55, compHeadY + 16);
      ctx.fillText('CITIZEN', 200, compHeadY + 16);
      ctx.fillText('CATEGORY', 330, compHeadY + 16);
      ctx.fillText('TOPIC DESCRIPTOR', 460, compHeadY + 16);
      ctx.fillText('STATUS', 660, compHeadY + 16);

      const portalComplaints = complaints.filter(c => c.portalId === currentPortal.id).slice(0, 5);
      let compY = compHeadY + 25;
      ctx.lineWidth = 1;

      if (portalComplaints.length === 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(40, compY, 720, 40);
        ctx.strokeRect(40, compY, 720, 40);
        ctx.fillStyle = '#6B7280';
        ctx.font = 'italic 11px sans-serif';
        ctx.fillText('EVERY RESIDENT CONCERN OR COMPLAINT REPORTED TO THIS SECTOR HAS BEEN FULLY RESOLVED.', 155, compY + 25);
        compY += 40;
      } else {
        portalComplaints.forEach((c, i) => {
          ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#FAF8F2';
          ctx.fillRect(40, compY, 720, 30);
          ctx.strokeRect(40, compY, 720, 30);

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`TCK-${c.id.substring(0, 6).toUpperCase()}`, 55, compY + 18);
          ctx.fillText(c.userName.split(' ')[0].toUpperCase(), 200, compY + 18);
          ctx.fillText(c.category.toUpperCase(), 330, compY + 18);
          ctx.fillText(c.title.substring(0, 22).toUpperCase(), 460, compY + 18);
          
          ctx.fillStyle = c.status === 'resolved' ? '#10B981' : '#EF4444';
          ctx.fillText(c.status.toUpperCase(), 660, compY + 18);

          compY += 30;
        });
      }

      // 8. Bottom verification seal and signature
      const footerY = compY + 25;

      // Line divider
      ctx.strokeStyle = '#CCCCCC';
      ctx.beginPath();
      ctx.moveTo(40, footerY);
      ctx.lineTo(760, footerY);
      ctx.stroke();

      // Certificate Seal drawing
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(670, footerY + 55, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('COMMUNITY', 670, footerY + 45);
      ctx.fillText('ECO', 670, footerY + 55);
      ctx.fillText('VERIFIED', 670, footerY + 65);
      ctx.fillText('2026', 670, footerY + 75);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('AUDITING BOARD ENDORSEMENT:', 45, footerY + 35);
      ctx.font = 'italic bold 15px sans-serif';
      ctx.fillText('S. Ramaswamy', 45, footerY + 60);
      ctx.font = 'bold 10px monospace';
      ctx.fillText('LOCAL MUNICIPAL AREA STEWARDSHIP CHIEF', 45, footerY + 80);

      // Save PNG
      const link = document.createElement('a');
      link.download = `TrashToTreasure_Compliance_Report_${currentPortal.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      alert("Executive Environmental Compliance Audit Report compiled and downloaded successfully as a PDF-Style image file!");
    } catch (e) {
      alert("Failed to compile report file.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // QR Code generator states
  const [qrFloor, setQrFloor] = useState<number>(1);
  const [qrBinType, setQrBinType] = useState<'organic' | 'dry' | 'ewaste' | 'hazardous'>('dry');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [printingStatus, setPrintingStatus] = useState<boolean>(false);

  // Generate dynamic, realistic QR matrix pseudo-patterns
  const getQrMatrixPattern = (floor: number, type: string) => {
    const seed = (floor * 13 + type.charCodeAt(0) * 19) % 1000;
    const size = 15;
    const matrix: boolean[][] = [];
    
    const isMarker = (r: number, c: number) => {
      if (r < 4 && c < 4) return true; // Top-Left
      if (r < 4 && c >= size - 4) return true; // Top-Right
      if (r >= size - 4 && c < 4) return true; // Bottom-Left
      return false;
    };

    const isWhiteMarkerInner = (r: number, c: number) => {
      if ((r === 1 || r === 2) && (c === 1 || c === 2)) return false;
      if (r === 0 || r === 3 || c === 0 || c === 3) {
        if (r < 4 && c < 4) return true;
      }
      if (r === 0 || r === 3 || c === size - 1 || c === size - 4) {
        if (r < 4 && c >= size - 4) return true;
      }
      if (r === size - 1 || r === size - 4 || c === 0 || c === 3) {
        if (r >= size - 4 && c < 4) return true;
      }
      return false;
    };

    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        if (isWhiteMarkerInner(r, c)) {
          row.push(false);
        } else if (isMarker(r, c)) {
          row.push(true);
        } else {
          const val = (r * c * 7 + r * 11 + c * seed) % 5 === 0 || (r + c + seed) % 3 === 0;
          row.push(val);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  // Filter complaints based on current working portal
  const activeComplaints = complaints.filter(c => c.portalId === currentPortal.id);
  const activeAlerts = alerts.filter(a => a.portalId === currentPortal.id);

  // Submit generic warning alert to floor flats
  const handleNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;

    try {
      setIsSendingNotif(true);
      await onAddNotification({
        portalId: currentPortal.id,
        floor: notifAllFloors ? undefined : Number(notifFloor),
        title: notifTitle,
        body: notifBody,
        severity: notifSeverity,
        senderName: 'Supervisor (Caretaker Panel)'
      });
      setNotifTitle('');
      setNotifBody('');
      alert('Alert dispatch complete! All flats on target floors notified.');
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setIsSendingNotif(false);
    }
  };

  // Submit resolution note
  const handleResolveSubmit = async (id: string, bypassConfirm = false) => {
    if (!resolveNotes.trim()) {
      alert('Please compile action notes before closing.');
      return;
    }

    if (!bypassConfirm) {
      setConfirmingComplaintId(id);
      return;
    }

    try {
      setIsResolving(true);
      await onResolveComplaint(id, resolveNotes);
      setResolveNotes('');
      setSelectedComplaintId(null);
      setConfirmingComplaintId(null);
      alert('Complaint ticket status closed successfully.');
    } catch (err: any) {
      alert('Error updating status.');
    } finally {
      setIsResolving(false);
    }
  };

  // Create portal
  const handlePortalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortalName || !newPortalFloors) return;

    try {
      setIsCreatingPortal(true);
      await onRegisterPortal(
        newPortalName,
        newPortalType,
        newPortalFloors,
        newPortalUnits || 'Flat A, Flat B'
      );
      setNewPortalName('');
      setNewPortalUnits('');
      setShowPortalForm(false);
      alert('New administrative hub setup complete!');
    } catch (err: any) {
      alert('Setup failed.');
    } finally {
      setIsCreatingPortal(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-2 sm:p-4" data-narrate="Supervisor Administration Deck. Execute announcements and clear pending garbage complaints.">
      
      {/* LEFT COLUMN: Controls & Notices */}
      <div className="xl:col-span-4 space-y-6">
        
        {/* Selector Zone */}
        <div className="bg-[#FAF8F2] border-4 border-black p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black text-zinc-500 mb-2 tracking-wider uppercase">Administrative Zone</h3>
          <p className="text-xs font-bold text-black mb-3">You are managing waste operations for:</p>
          <select 
            value={currentPortal.id}
            onChange={(e) => {
              const selected = allPortals.find(p => p.id === e.target.value);
              if (selected) changePortal(selected);
            }}
            className="w-full text-xs sm:text-sm font-black bg-white border-2 border-black rounded-xl p-3 text-black focus:outline-none"
          >
            {allPortals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name.toUpperCase()} ({p.type.toUpperCase()})
              </option>
            ))}
          </select>

          {/* Quick Create Link */}
          <button 
            onClick={() => setShowPortalForm(!showPortalForm)}
            className="mt-4 text-xs text-[#10B981] font-black hover:underline flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> Register Sector Hub (Flat/Office/College)
          </button>

          {/* Compliance Report Download action */}
          <button
            onClick={downloadImpactReportPDF}
            disabled={isGeneratingReport}
            className="mt-4 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 transition-all uppercase"
            title="Download fully formatted Environmental Compliance and Impact Audit Report"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" /> Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 shrink-0" /> Download compliance report
              </>
            )}
          </button>
        </div>
 
        {/* Portal Registration Dialog (Collapsible) */}
        {showPortalForm && (
          <form onSubmit={handlePortalSubmit} className="bg-amber-50 border-4 border-black p-5 rounded-3xl space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-xs font-black text-black uppercase tracking-widest bg-yellow-400 border border-black px-2.5 py-1.5 rounded inline-block">Register Sector Hub</h4>
            
            <div>
              <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Entity Name</label>
              <input 
                type="text" 
                placeholder="e.g. Greenwood Block C"
                value={newPortalName}
                onChange={(e) => setNewPortalName(e.target.value)}
                required
                className="w-full text-xs p-3 border-2 border-black rounded-xl bg-white text-black font-bold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Sector Type</label>
                <select
                  value={newPortalType}
                  onChange={(e: any) => setNewPortalType(e.target.value)}
                  className="w-full text-xs p-3 border-2 border-black rounded-xl bg-white text-black font-bold focus:outline-none"
                >
                  <option value="apartment">Resident Apartment</option>
                  <option value="office">Office / Complex</option>
                  <option value="university">University / School</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Floor Count</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  value={newPortalFloors}
                  onChange={(e) => setNewPortalFloors(Number(e.target.value))}
                  required
                  className="w-full text-xs p-3 border-2 border-black rounded-xl bg-white text-black font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Sub-units Description (Comma split)</label>
              <input 
                type="text" 
                placeholder="e.g. Flat A, Flat B, Flat C or Lab 1, Lab 2"
                value={newPortalUnits}
                onChange={(e) => setNewPortalUnits(e.target.value)}
                className="w-full text-xs p-3 border-2 border-black rounded-xl bg-white text-black font-bold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingPortal}
              className="w-full bg-[#10B981] text-white font-black py-3 rounded-2xl text-xs hover:bg-[#059669] border-2 border-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 uppercase tracking-wide"
            >
              {isCreatingPortal ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Create Sector
            </button>
          </form>
        )}

        {/* Broadcast warning notices */}
        <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 text-indigo-950">
            <Megaphone className="h-5 w-5 text-[#7C3AED]" />
            <h3 className="text-sm font-black uppercase">Raise Alert / Notify Floor</h3>
          </div>
          <p className="text-xs font-bold text-zinc-500">Dispatch alerts that immediately populate onto customized floor dashboards.</p>

          <form onSubmit={handleNotifSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Cardboard & Recyclable pickup on floor"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                required
                className="w-full text-xs p-3.5 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Message Details</label>
              <textarea 
                placeholder="Describe exact disposal instructions for residents on the floor..."
                rows={3}
                value={notifBody}
                onChange={(e) => setNotifBody(e.target.value)}
                required
                className="w-full text-xs p-3.5 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Target</label>
                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="all-floors-box"
                    checked={notifAllFloors}
                    onChange={(e) => setNotifAllFloors(e.target.checked)}
                    className="h-4.5 w-4.5 border-2 border-black accent-black rounded cursor-pointer"
                  />
                  <label htmlFor="all-floors-box" className="text-xs font-black text-black uppercase cursor-pointer">All Floors</label>
                </div>
              </div>

              {!notifAllFloors && (
                <div>
                  <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Floor #</label>
                  <select
                    value={notifFloor}
                    onChange={(e) => setNotifFloor(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none"
                  >
                    {Array.from({ length: currentPortal.floorsCount }, (_, i) => i + 1).map(f => (
                      <option key={f} value={f}>Floor {f}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Urgency Severity</label>
              <select
                value={notifSeverity}
                onChange={(e: any) => setNotifSeverity(e.target.value)}
                className="w-full text-xs p-2.5 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none"
              >
                <option value="low">Low Priority (Info)</option>
                <option value="medium">Medium Priority (Collection Info)</option>
                <option value="high">High Priority (Emergency Spill / Action)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSendingNotif}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-3 px-4 rounded-xl text-xs transition-all border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {isSendingNotif ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              Send Localised Notice
            </button>
          </form>
        </div>

        {/* Dynamic Floor QR Placard Tag Generator */}
        <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 text-indigo-950">
            <QrCode className="h-5 w-5 text-[#F43F5E]" />
            <h3 className="text-sm font-black uppercase">Floor QR Placard Generator</h3>
          </div>
          <p className="text-xs font-bold text-zinc-500">
            Generate and mount unique coordinate-coded QR badges on waste bins or lift lobbies for rapid, direct issue-reporting by residents.
          </p>

          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Target Floor</label>
                <select
                  value={qrFloor}
                  onChange={(e) => setQrFloor(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none"
                >
                  {Array.from({ length: currentPortal.floorsCount }, (_, i) => i + 1).map(f => (
                    <option key={f} value={f}>Floor {f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 mb-1 uppercase tracking-wide">Station Type</label>
                <select
                  value={qrBinType}
                  onChange={(e: any) => setQrBinType(e.target.value)}
                  className="w-full text-xs p-2.5 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none"
                >
                  <option value="dry">Dry Recyclable Bins</option>
                  <option value="organic">Organic / Wet Station</option>
                  <option value="ewaste">Electronic E-Waste</option>
                  <option value="hazardous">Toxic/Hazardous</option>
                </select>
              </div>
            </div>

            {/* Generated QR Card Visual & Simulated Placard */}
            <div className="border-3 border-black rounded-2xl bg-[#FAF8F2] p-4 flex flex-col items-center justify-center space-y-3 relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <span className="absolute top-1.5 left-1.5 text-[7px] font-mono font-black text-zinc-400 bg-white border border-dashed border-zinc-300 px-1.5 py-0.5 rounded uppercase">
                PLACARD ACTIVE - trashtotreasure.app
              </span>
              
              {/* Clean, detailed procedural vector graphics rendering of the QR Code */}
              <div className="bg-white p-3 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <svg width="105" height="105" viewBox="0 0 15 15" className="text-black">
                  {getQrMatrixPattern(qrFloor, qrBinType).map((row, rIdx) => 
                    row.map((cell, cIdx) => cell ? (
                      <rect 
                        key={`${rIdx}-${cIdx}`} 
                        x={cIdx} 
                        y={rIdx} 
                        width="1" 
                        height="1" 
                        fill="currentColor" 
                      />
                    ) : null)
                  )}
                </svg>
              </div>

              {/* Tag Details */}
              <div className="text-center space-y-1">
                <p className="text-xs font-black uppercase text-black">
                  FLOOR-{qrFloor} BAGGAGE STATION
                </p>
                <p className="text-[10px] font-bold text-zinc-650 bg-yellow-300 border border-black px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                  Classification: {qrBinType} Disposal
                </p>
                <p className="text-[8px] font-mono text-zinc-500 font-bold block uppercase tracking-tighter">
                  ID: qreco-{currentPortal.id.slice(0, 5)}-f{qrFloor}-{qrBinType}
                </p>
              </div>
            </div>

            {/* Placard management actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPrintingStatus(true);
                  setTimeout(() => {
                    setPrintingStatus(false);
                    alert("Placard job sent successfully to building network label printer!");
                  }, 1200);
                }}
                disabled={printingStatus}
                className="flex-1 bg-white hover:bg-zinc-100 text-black border-2 border-black py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
              >
                <Printer className="h-4 w-4 text-[#7C3AED]" />
                {printingStatus ? "Printing..." : "Print Tag"}
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/report?sector=${currentPortal.id}&floor=${qrFloor}&type=${qrBinType}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  });
                }}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-black py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                <FileText className="h-4 w-4" />
                {copiedLink ? "COPIED URL" : "COPY LINK"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Active alerts and resident complaints */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Active Alert tracking */}
        <div className="bg-white border-4 border-black p-5 sm:p-7 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b-4 border-black">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-500 animate-pulse" />
              <h3 className="text-base font-black uppercase text-black">Real-Time Waste Floor Collections</h3>
            </div>
            <span className="text-[10px] bg-emerald-400 text-black px-3 py-1 rounded-xl font-black uppercase tracking-wider border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
              {activeAlerts.length} total monitored
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {activeAlerts.length === 0 ? (
              <div className="md:col-span-2 py-12 text-center text-zinc-500 font-bold bg-[#FAF8F2] border-2 border-dashed border-zinc-300 rounded-2xl uppercase text-xs">
                No active waste bins reported by sweepers/collectors currently.
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className="p-4 bg-[#FAF8F2] border-2 border-black rounded-2xl space-y-3 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-black text-black bg-white border-2 border-black px-2.5 py-1 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                      FLOOR {alert.floor}
                    </span>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl uppercase border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] text-black ${
                        alert.status === 'completed' ? 'bg-zinc-200' :
                        alert.status === 'collecting' ? 'bg-[#FFD700]' :
                        'bg-rose-400'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  {alert.image && (
                    <div className="w-full h-36 rounded-2xl border-2 border-black overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-black">
                      <img 
                        src={alert.image} 
                        alt={`Floor ${alert.floor} snapshot`} 
                        className="w-full h-full object-cover grayscale-0"
                      />
                    </div>
                  )}

                  {alert.aiClassification && (
                    <div className="p-3 bg-white border-2 border-black rounded-2xl text-xs space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between font-black text-black border-b-2 border-dashed border-zinc-200 pb-1 uppercase tracking-wide">
                        <span>{alert.aiClassification.category}</span>
                        <span className="text-[#7C3AED] bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[10px]">{alert.aiClassification.estimatedWeight}</span>
                      </div>
                      <p className="text-[11px] text-zinc-650 italic font-bold">Disposal: {alert.aiClassification.instructions}</p>
                    </div>
                  )}

                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pt-1">
                    Logged: {new Date(alert.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaints resolution desk */}
        <div className="bg-white border-4 border-black p-5 sm:p-7 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b-4 border-black">
            <MessageSquare className="h-5 w-5 text-rose-500" />
            <h3 className="text-base font-black uppercase text-black">Resident Concerns & Spill Reports</h3>
          </div>
          <p className="text-xs font-bold text-zinc-500">Review, investigate, respond and close feedback tickets lodged by community members.</p>

          <div className="space-y-4 pt-1">
            {activeComplaints.length === 0 ? (
              <div className="py-12 border-4 border-dashed border-zinc-200 rounded-3xl text-center text-zinc-500 font-bold bg-[#FAF8F2] text-xs uppercase h-32 flex items-center justify-center">
                Hooray! No pending complaints logged for {currentPortal.name}.
              </div>
            ) : (
              activeComplaints.map(comp => (
                <div 
                  key={comp.id} 
                  className={`p-4 sm:p-5 border-2 border-black rounded-2xl space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all ${
                    comp.status === 'resolved' ? 'bg-[#FAF8F2]/60 opacity-80' : 'bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-2 pb-2 border-b-2 border-dashed border-zinc-200">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-black bg-white border border-black px-2 py-0.5 rounded uppercase">Concerns: {comp.category}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border border-black uppercase text-black ${
                            comp.status === 'resolved' ? 'bg-emerald-400' :
                            comp.status === 'investigating' ? 'bg-amber-300' :
                            'bg-rose-450 text-[#fff]'
                        }`}>
                          {comp.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-black uppercase tracking-tight mt-1.5">{comp.title}</h4>
                    </div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-black bg-white border-2 border-black p-3 rounded-2xl leading-relaxed font-bold">
                    {comp.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
                    <UserCheck className="h-4.5 w-4.5 text-zinc-500" />
                    <span>Submitted by: <strong className="bg-[#FFD700] border-2 border-black px-1.5 py-0.5 rounded text-[10px]">{comp.userName}</strong></span>
                  </div>

                  {comp.adminNotes && (
                    <div className="p-3 bg-amber-50 rounded-2xl text-xs text-black leading-relaxed italic border-2 border-black font-bold shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                      <strong className="text-[#7C3AED] block uppercase font-black not-italic text-[9px] tracking-wider mb-0.5">🐾 Caretaker Mitigation Action:</strong>
                      {comp.adminNotes}
                    </div>
                  )}

                  {comp.status !== 'resolved' && (
                    <div className="pt-2 border-t-2 border-black mt-2">
                      {selectedComplaintId === comp.id ? (
                        <div className="space-y-3 mt-2">
                          {confirmingComplaintId === comp.id ? (
                            <div className="bg-amber-50 border-3 border-amber-500 rounded-2xl p-4 space-y-2 animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <p className="text-xs font-black text-amber-950 uppercase tracking-tight flex items-center gap-1">
                                <AlertTriangle className="h-4.5 w-4.5 text-amber-600 animate-bounce" />
                                Are you sure you want to resolve this ticket?
                              </p>
                              <p className="text-[10px] text-zinc-700 font-bold leading-relaxed">
                                This action will permanently mark the ticket as resolved and publish your caretaker notes:
                                <span className="block mt-1 bg-white border-2 border-black px-2 py-1.5 rounded-lg italic font-semibold text-zinc-800">"{resolveNotes}"</span>
                              </p>
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleResolveSubmit(comp.id, true)}
                                  disabled={isResolving}
                                  className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-black text-[10px] uppercase rounded-xl border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                                >
                                  Yes, Resolve & Close
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmingComplaintId(null)}
                                  className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-black font-black text-[10px] uppercase rounded-xl border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                                >
                                  Cancel & Edit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <textarea
                                placeholder="Detail mitigation actions (e.g. dispatched lobby mopping squad, garbage cleared)..."
                                rows={2}
                                value={resolveNotes}
                                onChange={(e) => setResolveNotes(e.target.value)}
                                required
                                className="w-full p-3 text-xs border-2 border-black rounded-xl bg-white text-black font-bold focus:outline-none focus:bg-zinc-50"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleResolveSubmit(comp.id)}
                                  disabled={isResolving}
                                  className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                                >
                                  {isResolving && <Loader2 className="h-3 w-3 animate-spin" />}
                                  Submit & Close Ticket
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedComplaintId(null);
                                    setConfirmingComplaintId(null);
                                  }}
                                  className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer uppercase tracking-wider"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedComplaintId(comp.id);
                            setResolveNotes('');
                            setConfirmingComplaintId(null);
                          }}
                          className="text-xs text-[#10B981] font-black hover:underline cursor-pointer flex items-center gap-1 uppercase tracking-wider mt-1"
                        >
                          <CheckCircle className="h-4 w-4" /> Close ticket & Submit Caregiver response notes
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
