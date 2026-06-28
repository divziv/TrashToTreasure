import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
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
  Navigation,
  Globe,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { DonationItem } from '../types';
import { DEFAULT_GEO_ENTITIES, computeIntersections, generateSmartInsights } from '../utils/geoEngine';

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
  onSchedulePickup?: (id: string, slot: string) => Promise<void>;
  loading: boolean;
}

export default function DonationHub({
  donations,
  onClaimDonation,
  onSchedulePickup,
  loading
}: DonationHubProps) {
  const [claimNgo, setClaimNgo] = useState('');
  const [selectedDonId, setSelectedDonId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [filterCat, setFilterCat] = useState<'all' | 'clothes' | 'food' | 'books' | 'electronics' | 'others'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-1');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'available' | 'claimed'>('all');
  const [historySearch, setHistorySearch] = useState('');

  // Interactive D3 floor-plan state & references
  const floorPlanContainerRef = useRef<SVGSVGElement | null>(null);
  const [hoveredDonation, setHoveredDonation] = useState<DonationItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Dynamic Pickups & Community Cleanup Calendar State
  const [selectedCalDay, setSelectedCalDay] = useState<number>(24); // default to current day 24
  const [calendarEvents, setCalendarEvents] = useState([
    { day: 3, type: 'pickup', title: 'Level 2 Clothes Clearance', desc: 'NGO Hope India picking up blankets at Greenwood Residency.', time: '10:00 AM' },
    { day: 7, type: 'cleanup', title: 'Sector-1 Plastic Mitigation Drive', desc: 'Volunteers gathering for street plastic extraction.', time: '07:30 AM' },
    { day: 12, type: 'pickup', title: 'High School Book Drive Pickup', desc: 'Rotary Club collecting chemistry & math textbooks.', time: '02:00 PM' },
    { day: 18, type: 'cleanup', title: 'Lakeside Organic Composting Workshop', desc: 'Learn to extract bio-compost from kitchen wet waste.', time: '11:00 AM' },
    { day: 24, type: 'pickup', title: 'Caretaker Waste Audit Sync', desc: 'District Environmental Board on-site portal auditing.', time: '09:00 AM' },
    { day: 28, type: 'cleanup', title: 'E-Waste Hub Reclamation Campaign', desc: 'Drop off obsolete laptops, batteries, and calculators.', time: '04:00 PM' }
  ]);

  // States for scheduling new calendar events dynamically
  const [isScheduling, setIsScheduling] = useState(false);
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvDesc, setNewEvDesc] = useState('');
  const [newEvType, setNewEvType] = useState<'pickup' | 'cleanup'>('pickup');
  const [newEvTime, setNewEvTime] = useState('11:00 AM');

  const handleScheduleEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvTitle.trim()) return;
    setCalendarEvents(prev => [
      ...prev,
      {
        day: selectedCalDay,
        type: newEvType,
        title: newEvTitle,
        desc: newEvDesc || 'No additional details provided.',
        time: newEvTime
      }
    ]);
    setNewEvTitle('');
    setNewEvDesc('');
    setIsScheduling(false);
  };

  useEffect(() => {
    if (!floorPlanContainerRef.current) return;

    // Filter to active pending donations
    const activePending = donations.filter(d => d.status === 'available');

    // To ensure there is always a rich and interesting floorplan to interact with,
    // if activePending is empty, we populate with a few elegant default mock items
    const displayDonations = activePending.length > 0 ? activePending : [
      {
        id: 'mock-don-1',
        title: 'Premium Winter Blankets',
        donorName: 'Dr. Priya Sen',
        donorContact: '+91 91234-56780',
        category: 'clothes',
        quantity: '5 items',
        description: 'Brand new thick wool blankets perfect for shelter donation.',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-don-2',
        title: 'Secondary Chemistry & Math Textbooks',
        donorName: 'Rahul Verma',
        donorContact: '+91 80123-45678',
        category: 'books',
        quantity: '18 volumes',
        description: 'Excellent condition textbook sets for high school curriculum.',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-don-3',
        title: 'Preserved Canned Lentils & Jam jars',
        donorName: 'Greenwood Society Pantry',
        donorContact: '+91 76543-12345',
        category: 'food',
        quantity: '12 packs',
        description: 'Sealed vacuum containers within safe expiry limits.',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-don-4',
        title: 'Educational Tablets & Calculators',
        donorName: 'Vikram Mehta',
        donorContact: '+91 98877-66554',
        category: 'electronics',
        quantity: '5 items',
        description: 'Fully functional digital tablets and scientific calculators for students.',
        status: 'available',
        createdAt: new Date().toISOString()
      }
    ] as DonationItem[];

    // Select container and empty it
    const svg = d3.select(floorPlanContainerRef.current);
    svg.selectAll('*').remove();

    const width = 680;
    const height = 260;
    const margin = { top: 30, right: 30, bottom: 20, left: 60 };

    // Setup floor boundaries
    const floorsCount = 5;
    const floorHeight = (height - margin.top - margin.bottom) / floorsCount;
    const floorWidth = width - margin.left - margin.right;

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw Floor rows
    for (let f = 0; f < floorsCount; f++) {
      const yPos = f * floorHeight;
      const floorNum = floorsCount - f;

      // Outer rectangular boundary for this floor
      chart.append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', floorWidth)
        .attr('height', floorHeight)
        .attr('fill', '#FAF8F2')
        .attr('stroke', '#000')
        .attr('stroke-width', 2);

      // Label floor number
      chart.append('text')
        .attr('x', -10)
        .attr('y', yPos + floorHeight / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('font-family', 'monospace')
        .attr('font-size', '10px')
        .attr('font-weight', 'black')
        .attr('fill', '#000')
        .text(`L-${floorNum}`);

      // Divide floor into 4 units
      const unitWidth = floorWidth / 4;
      for (let u = 1; u <= 3; u++) {
        chart.append('line')
          .attr('x1', u * unitWidth)
          .attr('y1', yPos)
          .attr('x2', u * unitWidth)
          .attr('y2', yPos + floorHeight)
          .attr('stroke', '#000')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3 3');
      }

      // Label units
      for (let u = 0; u < 4; u++) {
        chart.append('text')
          .attr('x', u * unitWidth + unitWidth / 2)
          .attr('y', yPos + 12)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'sans-serif')
          .attr('font-size', '7px')
          .attr('font-weight', 'bold')
          .attr('fill', 'rgba(0,0,0,0.3)')
          .text(`UNIT ${floorNum}0${u + 1}`);
      }
    }

    // Place donation dots in specific units
    // Map categories to color codes
    const categoryColors: Record<string, string> = {
      clothes: '#EC4899', // pink-500
      food: '#F59E0B',    // amber-500
      books: '#0EA5E9',   // sky-500
      electronics: '#10B981', // emerald-500
      others: '#8B5CF6'   // purple-500
    };

    const unitWidth = floorWidth / 4;

    displayDonations.forEach((don, idx) => {
      // Deterministic placement based on title hash or index
      const floorIndex = idx % floorsCount; // 0 to 4
      const floorNum = floorsCount - floorIndex;
      const unitIndex = (idx * 2 + 1) % 4; // 1, 3, 1, 3...
      const yOffset = floorIndex * floorHeight + floorHeight / 2 + 4;
      const xOffset = unitIndex * unitWidth + unitWidth / 2;

      const color = categoryColors[don.category] || categoryColors.others;

      // Draw a pulsing group for hover effect
      const dotGroup = chart.append('g')
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHoveredDonation(don);
          d3.select(event.currentTarget).select('circle.main-dot')
            .transition()
            .duration(150)
            .attr('r', 10)
            .attr('stroke-width', 3);
        })
        .on('mousemove', (event) => {
          const [mx, my] = d3.pointer(event, floorPlanContainerRef.current);
          setTooltipPos({ x: mx + 15, y: my + 15 });
        })
        .on('mouseleave', (event) => {
          setHoveredDonation(null);
          setTooltipPos(null);
          d3.select(event.currentTarget).select('circle.main-dot')
            .transition()
            .duration(150)
            .attr('r', 7)
            .attr('stroke-width', 1.5);
        });

      // Outer halo animation
      dotGroup.append('circle')
        .attr('cx', xOffset)
        .attr('cy', yOffset)
        .attr('r', 12)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', '7;16;7')
        .attr('dur', '2s')
        .attr('repeatCount', 'indefinite');

      // Inner solid dot
      dotGroup.append('circle')
        .attr('class', 'main-dot')
        .attr('cx', xOffset)
        .attr('cy', yOffset)
        .attr('r', 7)
        .attr('fill', color)
        .attr('stroke', '#000')
        .attr('stroke-width', 1.5);

      // Mini text icon indicator
      dotGroup.append('text')
        .attr('x', xOffset)
        .attr('y', yOffset - 11)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'monospace')
        .attr('font-size', '8px')
        .attr('font-weight', 'black')
        .attr('fill', '#000')
        .text(don.category.slice(0, 1).toUpperCase());
    });

  }, [donations]);

  // Compute intersections of geopolitical domain overlays and smart networking insights
  const intersections = computeIntersections(DEFAULT_GEO_ENTITIES);
  const smartInsights = generateSmartInsights(intersections, DEFAULT_GEO_ENTITIES);

  const filteredDonations = donations.filter(d => {
    const matchesCategory = filterCat === 'all' || d.category === filterCat;
    const matchesSearch = searchQuery.trim() === '' || 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
      case 'electronics': return <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase">Electronics/Edu</span>;
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

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search donations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border-2 border-black rounded-xl bg-white font-bold text-xs uppercase focus:outline-none focus:bg-amber-50/10 placeholder-zinc-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <span className="absolute left-3.5 top-3 text-zinc-500 font-bold">&#128269;</span>
          </div>

          <div className="flex flex-wrap gap-1 bg-white border-2 border-black p-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {(['all', 'clothes', 'food', 'books', 'electronics', 'others'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-2.5 py-1.5 text-xs font-black rounded-lg capitalize cursor-pointer transition-all ${
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
      </div>

      {/* Hyperlocal Coordinate Map Section */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-[#7C3AED]" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">📍 Geospatial Coverage & Overlap Map</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-650">Visualizing overlapping service, donation, and collection domains across sectors.</p>
            </div>
          </div>
          <span className="bg-[#7C3AED] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-pulse" /> Intersection Engine v2
          </span>
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
              <path d="M 0 50 Q 50 40 100 50" fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="18" />
              <text x="15" y="47" className="text-[7.5px] font-mono fill-zinc-400 rotate-[-2deg] font-black uppercase">Greenfield Bypass Road</text>

              <path d="M 40 0 Q 45 50 40 100" fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="14" />
              <text x="43" y="15" className="text-[7.5px] font-mono fill-zinc-400 rotate-[88deg] font-black uppercase">Lakeside Expressway</text>

              {/* Base Geographic Domains Overlays */}
              {/* 1. Greenwood Residency (APARTMENT - Blue) */}
              <circle cx="36.5%" cy="46%" r="14%" fill="rgba(59, 130, 246, 0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="24%" y="54%" className="text-[8px] font-black fill-blue-700 uppercase tracking-tighter opacity-70">Apartments Domain</text>

              {/* 2. Turing Tech Park (OFFICE - Purple) */}
              <circle cx="52.5%" cy="23.75%" r="16%" fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="56%" y="16%" className="text-[8px] font-black fill-purple-700 uppercase tracking-tighter opacity-70">Offices Domain</text>

              {/* 3. Apex Global University (UNIVERSITY - Green) */}
              <circle cx="47.5%" cy="37.5%" r="19%" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="36%" y="24%" className="text-[8px] font-black fill-emerald-700 uppercase tracking-tighter opacity-70">University Domain</text>

              {/* Intersection Overlays */}
              {/* Apartment ↔ University Overlap (Cyan) */}
              <ellipse cx="42%" cy="41.75%" rx="8%" ry="6%" fill="rgba(6,182,212,0.22)" stroke="#06B6D4" strokeWidth="2" strokeDasharray="2 1" />
              <text x="28%" y="42%" className="text-[7px] font-black fill-cyan-900 uppercase">Shared Route</text>

              {/* Office ↔ University Overlap (Purple) */}
              <ellipse cx="50%" cy="30.6%" rx="9%" ry="7%" fill="rgba(168,85,247,0.22)" stroke="#A855F7" strokeWidth="2" strokeDasharray="2 1" />
              <text x="52%" y="32%" className="text-[7.5px] font-black fill-purple-900 uppercase">Shared Collection Zone</text>

              {/* Triple Overlap: Apartment ↔ Office ↔ University (Vibrant Red-Pulse Center) */}
              <circle cx="45.5%" cy="35.75%" r="18" fill="rgba(244,63,94,0.35)" stroke="#F43F5E" strokeWidth="2" className="animate-pulse" />
              <circle cx="45.5%" cy="35.75%" r="6" fill="#F43F5E" stroke="black" strokeWidth="2" />
              
              {/* Highlight Label Annotation */}
              <text x="48%" y="36.5%" className="text-[8px] font-black fill-rose-900 bg-white px-1 uppercase tracking-tighter">
                ★ High Efficiency Donation Cluster
              </text>

              {/* Coordinate Labels */}
              <text x="4" y="12" className="text-[7.5px] font-mono fill-zinc-400 font-extrabold">lat: 12.9900 | lng: 77.5800</text>
              <text x="4" y="96" className="text-[7.5px] font-mono fill-zinc-400 font-extrabold">lat: 12.9500 | lng: 77.5800</text>
            </svg>

            {/* Absolute Placed Station Nodes */}
            {HUB_LOCATIONS.map(hub => {
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
              <span>Central Interaction Centroid</span>
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

        {/* Real-time calculated geospatial intersection insights dashboard */}
        <div className="pt-4 border-t-2 border-black/15 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF8F2] border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h4 className="text-xs font-black text-black uppercase flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#FFD700] fill-[#FFD700] stroke-black" />
              Calculated Overlap Intersections
            </h4>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {intersections.map(intersect => {
                const colors = intersect.entitiesInvolved.length === 3 
                  ? { bg: 'bg-rose-100 border-rose-400 text-rose-950', badge: 'bg-rose-500' }
                  : intersect.zoneId.includes('geo-1') && intersect.zoneId.includes('geo-3')
                  ? { bg: 'bg-cyan-50 border-cyan-400 text-cyan-950', badge: 'bg-cyan-500' }
                  : { bg: 'bg-purple-50 border-purple-400 text-purple-950', badge: 'bg-purple-500' };

                return (
                  <div key={intersect.zoneId} className={`p-2.5 rounded-xl border ${colors.bg} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase text-white px-1.5 py-0.5 rounded ${colors.badge}`}>
                        {intersect.entitiesInvolved.length === 3 ? "★ Mega Overlap" : "Zone Overlap"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-500">
                        {intersect.overlapArea.toLocaleString()} sq m
                      </span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-tight">
                      {intersect.entitiesInvolved.length === 3 
                        ? "Global Triple Intersection Point (Apex ↔ Turing ↔ Greenwood)" 
                        : intersect.zoneId.includes('geo-1') && intersect.zoneId.includes('geo-3')
                        ? "Apartments & University Shared Border"
                        : "Campus Office Central Interchange"}
                    </p>
                    <div className="text-[10px] font-bold text-zinc-650">
                      <span className="underline">Suggested dropoff point:</span> {intersect.suggestedDropoffPoints[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50/50 border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h4 className="text-xs font-black text-[#7C3AED] uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 animate-spin text-[#7C3AED]" />
              Smart Collaboration Insights Layer
            </h4>
            <div className="space-y-2">
              {smartInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] font-bold text-indigo-950 leading-relaxed">
                  <span className="text-rose-500 shrink-0 mt-0.5">✦</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Floor Plan Visualization section */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Map className="h-6 w-6 text-[#7C3AED]" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">📦 Interactive Pending Donations Floor-Plan</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-650">A visual model mapping items waiting for NGOs across society levels. Hover over any pulsing node to inspect.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase">
            <span className="bg-[#EC4899] text-white px-2 py-0.5 rounded border border-black">Clothes (C)</span>
            <span className="bg-[#F59E0B] text-white px-2 py-0.5 rounded border border-black">Food (F)</span>
            <span className="bg-[#0EA5E9] text-white px-2 py-0.5 rounded border border-black">Books (B)</span>
            <span className="bg-[#10B981] text-white px-2 py-0.5 rounded border border-black">Electronics (E)</span>
            <span className="bg-[#8B5CF6] text-white px-2 py-0.5 rounded border border-black">Others (O)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* SVG Floor plan container (2 cols on xl) */}
          <div className="xl:col-span-2 border-4 border-black rounded-2xl bg-[#FAF8F2]/40 p-2 sm:p-4 overflow-x-auto relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="min-w-[640px] relative">
              <svg 
                ref={floorPlanContainerRef} 
                className="w-full h-[260px] select-none" 
              />
              {/* Dynamic hover-over tooltip layer */}
              {tooltipPos && hoveredDonation && (
                <div 
                  className="absolute bg-zinc-950 text-white p-3 rounded-2xl border-2 border-black text-[11px] font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] pointer-events-none z-30 space-y-1"
                  style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px`, maxWidth: '250px' }}
                >
                  <div className="flex items-center justify-between border-b border-white/20 pb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">{hoveredDonation.category}</span>
                    <span className="text-[8px] font-mono font-bold text-zinc-400">
                      {new Date(hoveredDonation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h5 className="font-black text-xs uppercase text-white tracking-tight leading-tight">{hoveredDonation.title}</h5>
                  <p className="text-zinc-300 text-[10.5px] leading-relaxed line-clamp-2">{hoveredDonation.description}</p>
                  <div className="pt-1 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                    Quantity: {hoveredDonation.quantity}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Inspection Card */}
          <div className="xl:col-span-1">
            {hoveredDonation ? (
              <div className="bg-[#FAF8F2] border-4 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#7C3AED] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black tracking-widest inline-block animate-pulse">
                      Inspecting Node
                    </span>
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded border border-black bg-white">
                      {hoveredDonation.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-black uppercase leading-tight">{hoveredDonation.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-wider">
                      Quantity: {hoveredDonation.quantity}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-800 leading-relaxed font-bold bg-white p-3 border-2 border-black rounded-xl">
                    {hoveredDonation.description}
                  </p>
                </div>

                <div className="border-t border-black/10 pt-2.5 text-[10px] font-bold text-zinc-650 space-y-1">
                  <div>Donor: <span className="font-black text-black">{hoveredDonation.donorName}</span></div>
                  <div>Contact: <span className="font-black text-black">{hoveredDonation.donorContact}</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-4 border-dashed border-zinc-300 rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center space-y-2 min-h-[220px]">
                <Info className="h-8 w-8 text-zinc-400" />
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider leading-normal">
                  Hover over any pulsing circle inside the floor plan layout to inspect item specifications instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📅 Interactive scheduled pickups & community cleanup calendar */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#7C3AED]" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">📅 Scheduled Pickups & Eco-Cleanup Calendar</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-650">Track, schedule, and volunteer for neighborhood recycling pickups and environmental cleanup campaigns.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase bg-purple-100 text-[#7C3AED] px-3 py-1.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <span>June 2026 Portal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid - 7 Columns */}
          <div className="lg:col-span-7 bg-[#FAF8F2] border-4 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-black">◀ May 2026</span>
              <h4 className="text-base font-black uppercase tracking-tighter text-black flex items-center gap-1">
                📅 June 2026
              </h4>
              <span className="text-xs font-black uppercase tracking-wider text-black">July 2026 ▶</span>
            </div>

            {/* Days of the Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-zinc-500 mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* 35 Days Grid for June 2026 (Starts on Monday, Day 1) */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty slot for Sunday (May 31st) */}
              <div className="aspect-square bg-zinc-100/50 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                31
              </div>

              {Array.from({ length: 30 }).map((_, index) => {
                const dayNum = index + 1;
                const isSelected = selectedCalDay === dayNum;
                const dayEvents = calendarEvents.filter(e => e.day === dayNum);
                const hasPickup = dayEvents.some(e => e.type === 'pickup');
                const hasCleanup = dayEvents.some(e => e.type === 'cleanup');

                return (
                  <button
                    key={dayNum}
                    onClick={() => {
                      setSelectedCalDay(dayNum);
                      setIsScheduling(false);
                    }}
                    className={`aspect-square rounded-xl border-2 transition-all flex flex-col justify-between p-1.5 font-bold cursor-pointer relative ${
                      isSelected 
                        ? 'bg-[#FFD700] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105 z-10' 
                        : 'bg-white hover:bg-zinc-100 text-black border-zinc-300'
                    }`}
                  >
                    <span className="text-[11px] font-black">{dayNum}</span>
                    
                    {/* Event indicators */}
                    <div className="flex gap-1 mt-auto">
                      {hasPickup && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 border border-black animate-pulse" title="Pickup Scheduled" />
                      )}
                      {hasCleanup && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 border border-black animate-pulse" title="Cleanup Drive" />
                      )}
                    </div>

                    {/* Today indicator (24th June 2026) */}
                    {dayNum === 24 && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-purple-600 animate-ping" />
                    )}
                  </button>
                );
              })}

              {/* Pad remaining grid space to complete 5-week layout (4 slots of July) */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-100/50 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Panel - 5 Columns */}
          <div className="lg:col-span-5 bg-white border-4 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="border-b-2 border-black pb-2 mb-3 flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black uppercase text-black">
                  📝 Day Agenda: June {selectedCalDay}, 2026
                </h4>
                {selectedCalDay === 24 && (
                  <span className="bg-purple-100 text-[#7C3AED] text-[8px] font-black uppercase px-2 py-0.5 rounded border border-[#7C3AED]">
                    Today
                  </span>
                )}
              </div>

              {/* Event Listings */}
              {isScheduling ? (
                <form onSubmit={handleScheduleEvent} className="space-y-3 pt-1">
                  <span className="text-[10px] font-black uppercase text-[#7C3AED] tracking-wider block">
                    ✨ Add New Event For June {selectedCalDay}
                  </span>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Society Clothes Donation Pickup"
                      value={newEvTitle}
                      onChange={(e) => setNewEvTitle(e.target.value)}
                      className="w-full text-xs p-2 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Description / NGO</label>
                    <textarea
                      placeholder="Describe pick-up or campaign guidelines..."
                      rows={2}
                      value={newEvDesc}
                      onChange={(e) => setNewEvDesc(e.target.value)}
                      className="w-full text-xs p-2 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Event Type</label>
                      <select
                        value={newEvType}
                        onChange={(e: any) => setNewEvType(e.target.value)}
                        className="w-full text-xs p-2 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-black uppercase focus:outline-none focus:bg-white"
                      >
                        <option value="pickup">🏠 Pickup</option>
                        <option value="cleanup">🌿 Cleanup Drive</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Scheduled Time</label>
                      <input
                        type="text"
                        value={newEvTime}
                        onChange={(e) => setNewEvTime(e.target.value)}
                        className="w-full text-xs p-2 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      Save Event
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScheduling(false)}
                      className="bg-zinc-200 hover:bg-zinc-300 text-black text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {calendarEvents.filter(e => e.day === selectedCalDay).length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wide">No activities scheduled for this date.</p>
                      <button
                        onClick={() => setIsScheduling(true)}
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white border-2 border-black py-1.5 px-3 rounded-lg hover:bg-amber-100 cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        ➕ Schedule Pickup
                      </button>
                    </div>
                  ) : (
                    calendarEvents
                      .filter(e => e.day === selectedCalDay)
                      .map((ev, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            ev.type === 'cleanup' ? 'bg-emerald-50 text-emerald-950 border-emerald-500' : 'bg-rose-50 text-rose-950 border-rose-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[8px] font-black uppercase text-white px-2 py-0.5 rounded ${
                              ev.type === 'cleanup' ? 'bg-emerald-650 text-white bg-emerald-600' : 'bg-rose-500 text-white bg-rose-500'
                            }`}>
                              {ev.type === 'cleanup' ? 'Cleanup Campaign' : 'NGO Collection'}
                            </span>
                            <span className="text-[10px] font-mono font-black">{ev.time}</span>
                          </div>
                          <h5 className="font-black text-xs uppercase leading-snug tracking-tight">{ev.title}</h5>
                          <p className="text-[10.5px] leading-relaxed font-semibold opacity-90 mt-1">{ev.desc}</p>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>

            {!isScheduling && calendarEvents.filter(e => e.day === selectedCalDay).length > 0 && (
              <button
                onClick={() => setIsScheduling(true)}
                className="w-full mt-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-2 rounded-xl text-xs transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
              >
                ➕ Schedule another event
              </button>
            )}
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
                {/* Pickup Time Slot display/selection */}
                <div className="bg-[#FAF8F2] border-2 border-black p-3 rounded-2xl text-xs font-bold space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-zinc-650 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#7C3AED]" /> Pickup Slot:
                    </span>
                    {donDoc.pickupSlot ? (
                      <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-400 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                        Scheduled
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-850 border-2 border-amber-400 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded animate-pulse">
                        Pending Slot
                      </span>
                    )}
                  </div>
                  {donDoc.pickupSlot ? (
                    <p className="text-black font-extrabold text-[11px] uppercase bg-white border-2 border-black px-2 py-1 rounded">
                      📅 {donDoc.pickupSlot}
                    </p>
                  ) : (
                    <div className="flex gap-1.5">
                      <select
                        id={`slot-select-${donDoc.id}`}
                        defaultValue=""
                        className="flex-1 bg-white border-2 border-black rounded-lg px-2 py-1.5 text-[10px] font-extrabold text-black focus:outline-none"
                      >
                        <option value="" disabled>Select Time Slot</option>
                        <option value="Monday 10:00 AM - 12:00 PM">Mon 10am - 12pm</option>
                        <option value="Wednesday 2:00 PM - 4:00 PM">Wed 2pm - 4pm</option>
                        <option value="Friday 11:00 AM - 1:00 PM">Fri 11am - 1pm</option>
                        <option value="Saturday 3:00 PM - 5:00 PM">Sat 3pm - 5pm</option>
                      </select>
                      <button
                        type="button"
                        onClick={async () => {
                          const selectEl = document.getElementById(`slot-select-${donDoc.id}`) as HTMLSelectElement;
                          if (selectEl && selectEl.value) {
                            if (onSchedulePickup) {
                              await onSchedulePickup(donDoc.id, selectEl.value);
                              alert(`Pickup scheduled for: ${selectEl.value}`);
                            }
                          } else {
                            alert("Please select a valid slot first.");
                          }
                        }}
                        className="bg-black hover:bg-zinc-800 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-2 border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0"
                      >
                        Book
                      </button>
                    </div>
                  )}
                </div>
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

      {/* 📜 Donation History Section */}
      <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-7 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-6 mt-8">
        <div>
          <h3 className="text-sm sm:text-base font-black uppercase text-black flex items-center gap-2">
            <span>📜</span> Community Donation History & NGO Match Log
          </h3>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
            Transparent audit ledger tracking past contributions, scheduled pickups, and successful NGO distributions.
          </p>
        </div>

        {/* Filters for Donation History */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-black pb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase text-zinc-400 mr-1">Status:</span>
            {(['all', 'available', 'claimed'] as const).map(st => (
              <button
                key={st}
                onClick={() => setHistoryFilter(st)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border-2 transition-all cursor-pointer ${
                  historyFilter === st
                    ? 'bg-zinc-900 text-white border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-[#FAF8F2] hover:bg-zinc-100 text-black border-zinc-300'
                }`}
              >
                {st === 'all' ? 'All Logs' : st === 'claimed' ? 'Successfully Claimed' : 'Pending / Available'}
              </button>
            ))}
          </div>

          {/* Search Input for history */}
          <input
            type="text"
            placeholder="Filter history by donor name or item title..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="text-xs p-2 border-2 border-black rounded-xl bg-[#FAF8F2] text-black font-bold focus:outline-none focus:bg-white w-full sm:max-w-xs"
          />
        </div>

        {/* History List or Table */}
        {(() => {
          const filteredHistory = donations.filter(item => {
            // Status filter
            if (historyFilter === 'claimed' && item.status !== 'claimed') return false;
            if (historyFilter === 'available' && item.status !== 'available') return false;

            // Search query filter
            if (historySearch.trim()) {
              const query = historySearch.toLowerCase();
              const nameMatch = item.donorName?.toLowerCase().includes(query);
              const titleMatch = item.title?.toLowerCase().includes(query);
              const catMatch = item.category?.toLowerCase().includes(query);
              if (!nameMatch && !titleMatch && !catMatch) return false;
            }
            return true;
          });

          if (filteredHistory.length === 0) {
            return (
              <div className="text-center py-8 bg-[#FAF8F2] border-2 border-dashed border-zinc-300 rounded-2xl space-y-2">
                <span className="text-xl">📭</span>
                <p className="text-xs font-black text-zinc-400 uppercase">No matching donation logs found in the ledger.</p>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto border-2 border-black rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-900 text-white text-[9px] uppercase tracking-wider border-b-2 border-black">
                    <th className="p-3 font-black">Date / ID</th>
                    <th className="p-3 font-black">Donor Name</th>
                    <th className="p-3 font-black">Donation Item Details</th>
                    <th className="p-3 font-black">Category</th>
                    <th className="p-3 font-black">Status / NGO Partner</th>
                    <th className="p-3 font-black">Logistics Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredHistory.map((item, idx) => {
                    const isClaimed = item.status === 'claimed';
                    const dateFormatted = item.createdAt 
                      ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '24 Jun 2026';

                    return (
                      <tr key={item.id} className={`hover:bg-amber-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
                        <td className="p-3">
                          <span className="block font-bold text-zinc-800">{dateFormatted}</span>
                          <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold">{item.id}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-black block">{item.donorName || "Dr. Alok Verma"}</span>
                          <span className="text-[9px] font-mono text-zinc-500 block">{item.donorContact || "+91 91234-56789"}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-zinc-900 text-[12px] block">{item.title}</span>
                          <span className="text-[10px] text-zinc-500 block">Quantity: <strong className="text-zinc-700 font-extrabold">{item.quantity}</strong></span>
                        </td>
                        <td className="p-3 capitalize">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-violet-100 text-violet-800 border border-violet-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3">
                          {isClaimed ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                <CheckCircle2 className="h-3 w-3" /> Claimed / Resolved
                              </span>
                              <span className="block text-[9px] font-bold text-zinc-500">Matched NGO: <strong className="text-zinc-800">{item.claimedByNGO || "Hope Foundation"}</strong></span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                              ⏳ Available
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.pickupSlot ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 border border-indigo-300 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                🚚 Pickup Scheduled
                              </span>
                              <span className="block text-[8px] font-bold text-indigo-700 font-mono leading-none">{item.pickupSlot}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-400 uppercase italic">Awaiting Slot Booking</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Footer advice */}
      <p className="text-center text-[10px] sm:text-xs font-bold text-zinc-500 leading-relaxed max-w-xl mx-auto pt-6 border-t-2 border-dashed border-zinc-200">
        🔒 Items are maintained in public entity repositories by supervisors. Upon claiming, coordinate directly with the donor contact shown in instructions. Thank you for building inclusive circular micro-economies!
      </p>

    </div>
  );
}
