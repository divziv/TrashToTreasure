import React, { useState } from 'react';
import { 
  Gift, 
  MapPin, 
  Tag, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  HelpCircle, 
  Heart,
  Share2,
  Map,
  Compass,
  Phone,
  Navigation
} from 'lucide-react';
import { DonationItem } from '../types';

interface DonationHubLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  contact: string;
  accepts: string[];
}

const HUB_LOCATIONS: DonationHubLocation[] = [
  {
    id: 'hub-1',
    name: 'Sector Greenfield Central HQ',
    lat: 12.9716,
    lng: 77.5946,
    address: 'Near Central Library Circle, Sector-1',
    contact: '+91 98765-43210',
    accepts: ['Clothes', 'Books', 'Toys']
  },
  {
    id: 'hub-2',
    name: 'Lakeside Compost & Bio-reactor Vault',
    lat: 12.9825,
    lng: 77.6083,
    address: 'Lake Bund Road, Adjacent water filter station',
    contact: '+91 98765-43098',
    accepts: ['Food Items', 'Organic Seeds']
  },
  {
    id: 'hub-3',
    name: 'Hope NGO Charity Distribution Center',
    lat: 12.9601,
    lng: 77.5812,
    address: 'Block 4 Community Hall Campus, High Street',
    contact: '+91 90123-45678',
    accepts: ['Books', 'Blankets', 'Clothes']
  },
  {
    id: 'hub-4',
    name: 'E-Waste & Electronics Reclamation Vault',
    lat: 12.9515,
    lng: 77.6101,
    address: 'Industrial Sector 5 Loop Road',
    contact: '+91 76543-21098',
    accepts: ['Electronic Parts', 'Batteries', 'Devices']
  }
];

interface DonationHubProps {
  donations: DonationItem[];
  onClaimDonation: (id: string, ngoName: string) => Promise<void>;
  loading: boolean;
}

export default function DonationHub({
  donations,
  onClaimDonation,
  loading
}: DonationHubProps) {
  const [claimNgo, setClaimNgo] = useState('');
  const [selectedDonId, setSelectedDonId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [filterCat, setFilterCat] = useState<'all' | 'clothes' | 'food' | 'books' | 'others'>('all');
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-1');

  const filteredDonations = donations.filter(d => {
    if (filterCat === 'all') return true;
    return d.category === filterCat;
  });

  const handleClaimSubmit = async (id: string) => {
    if (!claimNgo.trim()) {
      alert("Please specify the targeting NGO or charity name.");
      return;
    }

    try {
      setClaiming(true);
      await onClaimDonation(id, claimNgo);
      setClaimNgo('');
      setSelectedDonId(null);
      alert("Verification successful! The donation item has been marked as claimed. Coordination instructions dispatched.");
    } catch {
      alert("Failed to register claim.");
    } finally {
      setClaiming(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'clothes': return <span className="bg-orange-400 text-black text-[10px] font-black px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase">Clothes/Blankets</span>;
      case 'food': return <span className="bg-emerald-400 text-black text-[10px] font-black px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase">Food Packets</span>;
      case 'books': return <span className="bg-[#7C3AED] text-white text-[10px] font-black px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase">Textbooks/Novels</span>;
      default: return <span className="bg-zinc-200 text-black text-[10px] font-black px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase">Others</span>;
    }
  };

  return (
    <div className="p-2 sm:p-4 space-y-6" data-narrate="NGO resource match Desk. Find surplus food grains, clothes, and novels claimed by verified local NGOs.">
      
      {/* Description header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-1.5 uppercase">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500 animate-pulse" />
            Hyperlocal Donation Match Portal
          </h2>
          <p className="text-xs sm:text-sm font-bold text-zinc-500 mt-1">Citizen surplus matches securely and transparently mapped with NGO distributions.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1 bg-white border-2 border-black p-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {(['all', 'clothes', 'food', 'books', 'others'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-xs font-black rounded-lg capitalize cursor-pointer transition-all ${
                filterCat === cat 
                  ? 'bg-[#FFD700] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' 
                  : 'text-zinc-650 hover:text-black border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hyperlocal Coordinate Map Section */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Map className="h-6 w-6 text-[#7C3AED]" />
          <div>
            <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">📍 Hyperlocal Donation & Drop-off Map</h3>
            <p className="text-[10px] sm:text-xs font-bold text-zinc-600">Real coordinate plots of nearest collection hubs & drop-off centers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Interactive Map Visual (3 cols on lg) */}
          <div className="lg:col-span-3 border-4 border-black rounded-2xl bg-amber-50/20 relative aspect-[4/3] overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <svg className="absolute inset-0 w-full h-full text-zinc-350" xmlns="http://www.w3.org/2000/svg">
              {/* Coordinate Grid Lines */}
              {Array.from({ length: 11 }).map((_, i) => {
                const pos = i * 10;
                return (
                  <g key={i}>
                    {/* Horizontal lines */}
                    <line x1="0" y1={`${pos}%`} x2="100%" y2={`${pos}%`} stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                    {/* Vertical lines */}
                    <line x1={`${pos}%`} y1="0" x2={`${pos}%`} y2="100%" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                  </g>
                );
              })}

              {/* Major Roads representation */}
              <path d="M 0 50 Q 50 40 100 50" fill="transparent" stroke="rgba(0,0,0,0.12)" strokeWidth="20" />
              <text x="15" y="45" className="text-[8px] font-mono fill-zinc-400 rotate-[-2deg] font-black uppercase">Greenfield Bypass Road</text>

              <path d="M 40 0 Q 45 50 40 100" fill="transparent" stroke="rgba(0,0,0,0.12)" strokeWidth="16" />
              <text x="44" y="20" className="text-[8px] font-mono fill-zinc-400 rotate-[88deg] font-black uppercase">Lakeside Expressway</text>

              {/* Coordinate Label Accents */}
              <text x="4" y="12" className="text-[8px] font-mono fill-zinc-400 font-extrabold">lat: 12.9900 | lng: 77.5800</text>
              <text x="4" y="96" className="text-[8px] font-mono fill-zinc-400 font-extrabold">lat: 12.9500 | lng: 77.5800</text>
              <text x="78%" y="96" className="text-[8px] font-mono fill-zinc-400 font-extrabold">lng: 77.6200</text>

              {/* Current Active Portal Marker representing drop-off station */}
              <circle cx="47.5%" cy="45%" r="14" fill="rgba(244,63,94,0.2)" className="animate-pulse" />
              <circle cx="47.5%" cy="45%" r="6" fill="#F43F5E" stroke="black" strokeWidth="2" />
            </svg>

            {/* Absolute Placed Station Nodes */}
            {HUB_LOCATIONS.map(hub => {
              // Map coordinates to percentage positions
              const x = ((hub.lng - 77.5800) / 0.0400) * 100;
              const y = (1 - (hub.lat - 12.9500) / 0.0400) * 100;
              const isSelected = selectedHubId === hub.id;
              
              return (
                <button
                  key={hub.id}
                  onClick={() => setSelectedHubId(hub.id)}
                  className="absolute group cursor-pointer transition-all -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className={`p-1.5 rounded-full border-2 border-black transition-all ${
                    isSelected 
                      ? 'bg-[#FFD700] scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white hover:bg-[#7C3AED] hover:text-white group-hover:scale-105 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                  }`}>
                    <MapPin className="h-4 w-4 font-bold" />
                  </div>
                  <span className={`mt-1 text-[9px] font-black px-1.5 py-0.5 rounded border border-black bg-white select-none whitespace-nowrap shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                    isSelected ? 'bg-amber-100 text-black border-2 border-black z-10' : 'text-zinc-650'
                  }`}>
                    {hub.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </button>
              );
            })}

            {/* Home Portal Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-white/95 border-2 border-black px-2.5 py-1.5 rounded-xl font-black text-[9px] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 uppercase">
              <span className="h-3 w-3 rounded-full bg-[#F43F5E] border-2 border-white inline-block animate-pulse"></span>
              <span>Your Dropoff Station</span>
            </div>
          </div>

          {/* Hub Metadata details panel (2 cols) */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
            {(() => {
              const activeHub = HUB_LOCATIONS.find(h => h.id === selectedHubId) || HUB_LOCATIONS[0];
              // Euclidean distance approximation: Delta lat/lng in degrees mapped to km (approx 111.3km per degree)
              const dLat = activeHub.lat - 12.9720;
              const dLng = activeHub.lng - 77.5990;
              const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111.3;
              
              return (
                <div className="bg-[#FAF8F2] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="bg-[#7C3AED] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black tracking-widest inline-block">
                      Active Inspected Hub
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-black uppercase leading-tight">{activeHub.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-wider flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-zinc-500" />
                        Coordinates: [{activeHub.lat.toFixed(4)}, {activeHub.lng.toFixed(4)}]
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-black font-extrabold pt-2">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-[#7C3AED] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">Physical Address</p>
                          <p className="text-xs font-black">{activeHub.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <Phone className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">NGO Contact Desk</p>
                          <p className="text-xs font-black">{activeHub.contact}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <p className="text-[9px] text-zinc-500 font-bold uppercase">Accepted Commodities / Focus</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeHub.accepts.map((acc, idx) => (
                          <span key={idx} className="bg-white border text-[9px] font-extrabold text-black uppercase px-2 py-0.5 rounded border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/10 flex flex-col sm:flex-row items-center gap-2">
                    <div className="bg-white border-2 border-black px-3 py-1.5 rounded-xl flex-1 text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] w-full">
                      <p className="text-[9px] text-zinc-500 font-semibold uppercase">Est. Distance</p>
                      <p className="text-xs font-black text-black flex items-center justify-center gap-1">
                        <Navigation className="h-3.5 w-3.5 text-[#7C3AED]" />
                        {distanceKm.toFixed(2)} Km Away
                      </p>
                    </div>

                    <a
                      href={`tel:${activeHub.contact}`}
                      className="bg-[#10B981] hover:bg-[#059669] text-white font-black text-[10px] uppercase tracking-wide px-3 py-2.5 rounded-xl border-2 border-black w-full sm:w-auto text-center flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer uppercase"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call Hub
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Grid checklist */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 text-[#7C3AED] animate-spin" />
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="py-24 border-4 border-dashed border-zinc-300 rounded-3xl text-center text-zinc-500 font-black h-40 flex items-center justify-center uppercase bg-[#FAF8F2]">
          No donation items registered under category: "{filterCat}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map(donDoc => (
            <div 
              key={donDoc.id} 
              className={`bg-white border-4 border-black rounded-3xl p-5 space-y-4 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between transition-all ${
                donDoc.status === 'claimed' ? 'bg-[#FAF8F2]/60 opacity-80' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getCategoryBadge(donDoc.category)}
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                      donDoc.status === 'claimed' ? 'bg-zinc-200 text-zinc-500' : 'bg-amber-300 text-black'
                  }`}>
                    {donDoc.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black text-black leading-tight uppercase">{donDoc.title}</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Qty: <strong className="text-black">{donDoc.quantity}</strong> | Listed: {new Date(donDoc.createdAt).toLocaleDateString()}</p>
                </div>

                <p className="text-xs text-black leading-relaxed font-bold bg-[#FAF8F2] p-3 rounded-2xl border-2 border-black h-24 overflow-y-auto">
                  {donDoc.description}
                </p>

                {/* Gemini Quality Audit Tag */}
                {donDoc.aiAudit && (
                  <div className="p-3 bg-amber-50 border-2 border-black rounded-2xl text-xs leading-relaxed text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[9px] text-[#7C3AED] block uppercase font-black tracking-wider mb-0.5">✨ Gemini Quality Report:</span>
                    {donDoc.aiAudit}
                  </div>
                )}
              </div>

              {/* Claims Box */}
              <div className="pt-4 border-t-2 border-black mt-auto">
                {donDoc.status === 'claimed' ? (
                  <div className="p-2.5 bg-[#FAF8F2] border-2 border-black rounded-xl text-center text-xs font-black text-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    Claimed by: <span className="uppercase bg-emerald-400 border border-black px-1.5 py-0.5 rounded text-[10px]">{donDoc.claimedByNGO}</span>
                  </div>
                ) : (
                  <div>
                    {selectedDonId === donDoc.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="NGO Name (e.g. Hope India)"
                          value={claimNgo}
                          onChange={(e) => setClaimNgo(e.target.value)}
                          required
                          className="w-full text-xs p-3 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleClaimSubmit(donDoc.id)}
                            disabled={claiming}
                            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-black uppercase tracking-wider py-2 px-3 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                          >
                            Confirm Claim
                          </button>
                          <button
                            onClick={() => setSelectedDonId(null)}
                            className="bg-zinc-200 hover:bg-zinc-300 text-black text-[11px] font-black uppercase tracking-wider py-2 px-3 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedDonId(donDoc.id);
                          setClaimNgo('');
                        }}
                        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-3 rounded-2xl text-xs transition-all border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                      >
                        <Heart className="h-4 w-4 fill-white text-white" /> Claim for charity / NGO
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Footer advice */}
      <p className="text-center text-[10px] sm:text-xs font-bold text-zinc-500 leading-relaxed max-w-xl mx-auto pt-6 border-t-2 border-dashed border-zinc-200">
        🔒 Items are maintained in public entity repositories by supervisors. Upon claiming, coordinate directly with the donor contact shown in instructions. Thank you for building inclusive circular micro-economies!
      </p>

    </div>
  );
}
