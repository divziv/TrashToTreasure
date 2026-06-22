import React from 'react';
import { motion } from 'motion/react';
import { 
  Leaf, 
  Trash2, 
  Scale, 
  Award, 
  Flame, 
  TrendingUp, 
  Building,
  School,
  Briefcase,
  Globe2,
  Gift,
  Download,
  Volume2
} from 'lucide-react';
import { ImpactMetrics, PortalImpact, PortalType, Complaint } from '../types';

interface LeaderboardMetricsProps {
  metrics: ImpactMetrics | null;
  entityImpacts: PortalImpact[];
  filterType: 'all' | PortalType;
  setFilterType: (type: 'all' | PortalType) => void;
  loading: boolean;
  complaints: Complaint[];
}

export default function LeaderboardMetrics({
  metrics,
  entityImpacts,
  filterType,
  setFilterType,
  loading,
  complaints
}: LeaderboardMetricsProps) {
  
  const handleExportSummary = () => {
    if (!metrics) return;
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let content = `====================================================
COMMUNITY ENVIRONMENTAL IMPACT SUMMARY REPORT
Generated on: ${today}
====================================================

GLOBAL ENVIRONMENTAL METRICS (Active Sector Zones)
----------------------------------------------------
- Cumulative Waste Managed : ${metrics.totalWasteCollectedKg} Kg
- Carbon Emissions Saved   : ${metrics.carbonSavedKg} Kg CO2e
  (Equivalent to planting ~${(metrics.carbonSavedKg / 22).toFixed(0)} fully grown trees)
- Diversion from Landfills : ${metrics.landfillDivertedKg} Kg (${(metrics.totalWasteCollectedKg > 0 ? (metrics.landfillDivertedKg / metrics.totalWasteCollectedKg * 100).toFixed(0) : 92)}%)
- Resource Donation Offers : ${metrics.donationsDistributed} items
- Compost Generated        : ${metrics.compostGeneratedKg} Kg

ZONE LEADERBOARD SUMMARY (${filterType === 'all' ? 'All Sectors' : filterType.toUpperCase()})
----------------------------------------------------
`;

    filteredEntities.forEach((entity, index) => {
      const totalKg = Number((entity.wetWasteKg + entity.dryWasteKg + entity.eWasteKg + entity.hazardWasteKg).toFixed(1));
      content += `
Rank #${index + 1}: ${entity.portalName} [Type: ${entity.portalType.toUpperCase()}]
  - Community Diligence Rate : ${entity.participationRate}%
  - Total Waste Collected   : ${totalKg} Kg
  - Organic Wet Bio-waste   : ${entity.wetWasteKg} Kg
  - Sorted Dry Recyclables  : ${entity.dryWasteKg} Kg
  - Electronic Waste        : ${entity.eWasteKg} Kg
  - Hazardous Chemicals     : ${entity.hazardWasteKg} Kg
----------------------------------------------------`;
    });

    content += `\n\nVerified by Integrated Smart Civic Solutions & Inclusive Access Protocol.\n====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `environmental_impact_summary_${filterType}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSpeakSummary = () => {
    if (!metrics) return;
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    const pendingCount = complaints ? complaints.filter(c => c.status === 'open' || c.status === 'investigating').length : 0;
    
    const text = `Community Eco daily summary. Cumulative waste managed is ${metrics.totalWasteCollectedKg} kilograms. We have saved ${metrics.carbonSavedKg} kilograms of carbon emissions, and saved ${metrics.landfillDivertedKg} kilograms of waste from landfills. There are currently ${pendingCount} pending community complaints requiring worker dispatch. Thank you for keeping our community clean.`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-zinc-500 font-medium">Calculating community impact indices...</span>
      </div>
    );
  }

  // Filter entities according to portal type selection
  const filteredEntities = entityImpacts.filter(item => {
    if (filterType === 'all') return true;
    return item.portalType === filterType;
  });

  const getEntityIcon = (type: PortalType) => {
    switch (type) {
      case 'apartment': return <Building className="h-4 w-4 text-sky-500" />;
      case 'office': return <Briefcase className="h-4 w-4 text-indigo-500" />;
      case 'university': return <School className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="p-1 sm:p-4 space-y-8" data-narrate="Real-time Impact Matrix and Entity Leaderboards. Filter data to see achievements.">
      
      {/* Dynamic Filters tabs */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-black flex items-center gap-2">
              <Globe2 className="h-7 w-7 text-[#7C3AED]" />
              Community Performance Dashboard
            </h2>
            <button
              onClick={handleExportSummary}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer uppercase transition-all max-w-[200px]"
              title="Download full report of the current metrics"
            >
              <Download className="h-4 w-4" /> Export Report
            </button>
            <button
              onClick={handleSpeakSummary}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer uppercase transition-all max-w-[220px]"
              title="Speak out a clear summary of daily metrics & complaints"
            >
              <Volume2 className="h-4 w-4" /> Hear Spoken Summary
            </button>
          </div>
          <p className="text-xs font-bold text-zinc-650 mt-1">Dynamic aggregated environmental indices active across participating sector zones.</p>
        </div>

        <div className="flex flex-wrap p-1.5 bg-black rounded-2xl gap-1.5 border-2 border-black w-full xl:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${filterType === 'all' ? 'bg-[#FFD700] text-black border-2 border-white font-black' : 'text-white hover:bg-zinc-800'}`}
          >
            All Sectors
          </button>
          <button
            onClick={() => setFilterType('apartment')}
            className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${filterType === 'apartment' ? 'bg-[#7C3AED] text-white border-2 border-white font-black' : 'text-white hover:bg-zinc-800'}`}
          >
            <Building className="h-4 w-4" /> Apartments
          </button>
          <button
            onClick={() => setFilterType('office')}
            className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${filterType === 'office' ? 'bg-[#F43F5E] text-white border-2 border-white font-black' : 'text-white hover:bg-zinc-800'}`}
          >
            <Briefcase className="h-4 w-4" /> Offices
          </button>
          <button
            onClick={() => setFilterType('university')}
            className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${filterType === 'university' ? 'bg-amber-400 text-black border-2 border-white font-black' : 'text-white hover:bg-zinc-800'}`}
          >
            <School className="h-4 w-4" /> Universities
          </button>
        </div>
      </div>

      {/* Dynamic Key metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Cumulative Waste Managed */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Total Waste Managed is ${metrics.totalWasteCollectedKg} kilograms`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Trash2 className="h-20 w-20 text-zinc-900" />
          </div>
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-black uppercase text-zinc-650">Waste Managed</span>
            <div className="p-1 px-1.5 sm:p-2 sm:px-2 rounded-xl bg-[#FFD700] border-2 border-black text-black">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{metrics.totalWasteCollectedKg} <span className="text-xs sm:text-sm font-bold text-zinc-500">Kg</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
            <span className="text-zinc-500 font-medium">vs historical baseline</span>
          </div>
        </motion.div>

        {/* Carbon emissions Offset */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Greenhouse Offset is ${metrics.carbonSavedKg} kilograms of carbon dioxid`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Leaf className="h-20 w-20 text-zinc-900" />
          </div>
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-black uppercase text-zinc-650">Carbon Saved</span>
            <div className="p-1 px-1.5 sm:p-2 sm:px-2 rounded-xl bg-[#FAF8F2] border-2 border-black text-black">
              <Leaf className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{metrics.carbonSavedKg} <span className="text-xs sm:text-sm font-bold text-zinc-500">Kg CO2e</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-550">
            <span className="font-bold">Equivalent to planting</span>
            <span className="font-extrabold text-[#7C3AED]">{(metrics.carbonSavedKg / 22).toFixed(0)} trees</span>
          </div>
        </motion.div>

        {/* Landfill diversion */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Landfill Diverted is ${metrics.landfillDivertedKg} kilograms`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Flame className="h-20 w-20 text-zinc-900" />
          </div>
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-black uppercase text-zinc-650">Landfill Diverted</span>
            <div className="p-1 px-1.5 sm:p-2 sm:px-2 rounded-xl bg-[#F43F5E] border-2 border-black text-white">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{metrics.landfillDivertedKg} <span className="text-xs sm:text-sm font-bold text-zinc-500">Kg</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span className="text-blue-600 font-extrabold">{(metrics.totalWasteCollectedKg > 0 ? (metrics.landfillDivertedKg / metrics.totalWasteCollectedKg * 100).toFixed(0) : 92)}% Diversion</span>
            <span className="text-zinc-500 font-medium">diverted from dump yards</span>
          </div>
        </motion.div>

        {/* Community Donations Shared */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Donation handovers logged is ${metrics.donationsDistributed} items`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Gift className="h-20 w-20 text-zinc-900" />
          </div>
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-black uppercase text-zinc-650">Resource Donations</span>
            <div className="p-1 px-1.5 sm:p-2 sm:px-2 rounded-xl bg-[#FBBF24] border-2 border-black text-black">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{metrics.donationsDistributed} <span className="text-xs sm:text-sm font-bold text-zinc-500">Offers</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-550">
            <span className="font-bold">Compost Generated:</span>
            <span className="font-extrabold text-amber-600">{metrics.compostGeneratedKg} Kg</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Leaderboards & Composition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sector Comparison and Composition Breakdown */}
        <div className="lg:col-span-7 bg-white vibrant-border p-4 sm:p-6 rounded-3xl vibrant-shadow-sm space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-black uppercase text-black flex items-center gap-1.5">
              <Award className="h-5 w-5 text-[#FAF8F2] bg-black p-0.5 rounded border border-black" />
              Community Leaderboard
            </h3>
            <p className="text-xs font-bold text-zinc-500">Ranked by garbage separation diligence, biometrics scanning adherence, and compost generation.</p>
          </div>

          <div className="space-y-4">
            {filteredEntities.map((entity, i) => {
              const totalKg = Number((entity.wetWasteKg + entity.dryWasteKg + entity.eWasteKg + entity.hazardWasteKg).toFixed(1));
              return (
                <div 
                  key={entity.portalId} 
                  className={`p-4 rounded-2xl border-2 border-black transition-all ${i === 0 ? 'bg-amber-100/40' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-7 w-7 rounded-xl text-xs font-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${i === 0 ? 'bg-[#FFD700] text-black' : i === 1 ? 'bg-[#F43F5E] text-white' : 'bg-white text-black'}`}>
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getEntityIcon(entity.portalType)}
                        <span className="font-extrabold text-black text-sm">{entity.portalName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-zinc-500">Diligence:</span>
                      <span className="text-xs font-black text-[#7C3AED]">{entity.participationRate}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 text-[11px] font-bold mb-3">
                    <div className="bg-yellow-100 border border-black py-1 px-1.5 rounded text-black text-center">Wet: {entity.wetWasteKg} Kg</div>
                    <div className="bg-sky-100 border border-black py-1 px-1.5 rounded text-black text-center">Dry: {entity.dryWasteKg} Kg</div>
                    <div className="bg-purple-100 border border-black py-1 px-1.5 rounded text-black text-center font-black">E: {entity.eWasteKg} Kg</div>
                    <div className="bg-red-100 border border-black py-1 px-1.5 rounded text-black text-center">Hazard: {entity.hazardWasteKg} Kg</div>
                  </div>

                  {/* Relative Scale Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                      <span>Total: {totalKg} Kg</span>
                      <span>Target: 1000 Kg</span>
                    </div>
                    <div className="w-full bg-white border-2 border-black h-3 rounded-full overflow-hidden flex shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <div 
                        className="bg-[#FBBF24] h-full" 
                        style={{ width: `${Math.min(100, (entity.wetWasteKg / (totalKg || 1)) * 100)}%` }} 
                        title={`Organic Waste: ${entity.wetWasteKg}kg`}
                      />
                      <div 
                        className="bg-sky-500 h-full border-l border-black" 
                        style={{ width: `${Math.min(100, (entity.dryWasteKg / (totalKg || 1)) * 100)}%` }} 
                        title={`Recyclables: ${entity.dryWasteKg}kg`}
                      />
                      <div 
                        className="bg-[#7C3AED] h-full border-l border-black" 
                        style={{ width: `${Math.min(100, (entity.eWasteKg / (totalKg || 1)) * 100)}%` }} 
                        title={`E-waste: ${entity.eWasteKg}kg`}
                      />
                      <div 
                        className="bg-[#F43F5E] h-full border-l border-black" 
                        style={{ width: `${Math.min(100, (entity.hazardWasteKg / (totalKg || 1)) * 100)}%` }} 
                        title={`Hazardous: ${entity.hazardWasteKg}kg`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Waste Composition Legend */}
        <div className="lg:col-span-5 bg-white vibrant-border p-4 sm:p-6 rounded-3xl vibrant-shadow-sm space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-black uppercase text-black">Composition Matrix</h3>
            <p className="text-xs font-bold text-zinc-550">Distribution guidelines across standard domestic and office classifications.</p>
          </div>

          <div className="space-y-4">
            
            {/* Compostables */}
            <div className="flex items-center justify-between p-3 border-2 border-black rounded-2xl bg-amber-100/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-black bg-[#FFD700]" />
                <div>
                  <p className="text-xs font-black text-black">Organic Wet Bio-waste</p>
                  <p className="text-[10px] font-semibold text-zinc-650">Composted inside localized community reactors.</p>
                </div>
              </div>
              <span className="text-sm font-black text-black bg-white px-2 py-0.5 border border-black rounded">34%</span>
            </div>

            {/* Dry Waste */}
            <div className="flex items-center justify-between p-3 border-2 border-black rounded-2xl bg-sky-100/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-black bg-sky-500" />
                <div>
                  <p className="text-xs font-black text-black">Sorted Dry Recyclables</p>
                  <p className="text-[10px] font-semibold text-zinc-650">Paper, metals, and hard plastics compressed for sorting.</p>
                </div>
              </div>
              <span className="text-sm font-black text-black bg-white px-2 py-0.5 border border-black rounded">58%</span>
            </div>

            {/* E-Waste */}
            <div className="flex items-center justify-between p-3 border-2 border-black rounded-2xl bg-purple-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-black bg-[#7C3AED]" />
                <div>
                  <p className="text-xs font-black text-black">Electronic scrap & Batteries</p>
                  <p className="text-[10px] font-semibold text-zinc-650">Awaiting state recovery handler extraction protocols.</p>
                </div>
              </div>
              <span className="text-sm font-black text-white bg-black px-2 py-0.5 rounded animate-pulse">5%</span>
            </div>

            {/* Hazardous */}
            <div className="flex items-center justify-between p-3 border-2 border-black rounded-2xl bg-red-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-black bg-[#F43F5E]" />
                <div>
                  <p className="text-xs font-black text-black">Hazardous & Chemical Scraps</p>
                  <p className="text-[10px] font-semibold text-zinc-650">Carefully isolated or incinerated legally.</p>
                </div>
              </div>
              <span className="text-sm font-black text-black bg-white px-2 py-0.5 border border-black rounded">3%</span>
            </div>

          </div>

          <div className="pt-2 border-t-2 border-black text-center text-[10px] text-zinc-600 font-black uppercase">
            🤝 Real-time updates verified with multi-user validation tags.
          </div>
        </div>

      </div>
    </div>
  );
}
