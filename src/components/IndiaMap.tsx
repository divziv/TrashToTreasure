import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  Info, 
  Trash2, 
  TrendingUp, 
  Award, 
  Download, 
  Users, 
  Globe, 
  ChevronRight, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Search
} from 'lucide-react';

// Simplified but beautiful SVG path approximations for all major Indian States/UTs 
// coordinates set to scale into a 600x680 viewport.
const INDIA_STATES_PATHS = [
  {
    id: 'IN-JK',
    name: 'Jammu & Kashmir & Ladakh',
    d: 'M 220 30 L 260 20 L 290 40 L 305 75 L 290 110 L 250 115 L 210 95 L 195 70 Z',
    color: '#FFD700'
  },
  {
    id: 'IN-HP',
    name: 'Himachal Pradesh',
    d: 'M 250 115 L 290 110 L 300 130 L 275 160 L 255 155 L 245 135 Z',
    color: '#34D399'
  },
  {
    id: 'IN-PB',
    name: 'Punjab',
    d: 'M 210 95 L 250 115 L 245 135 L 225 165 L 195 150 L 190 120 Z',
    color: '#60A5FA'
  },
  {
    id: 'IN-UT',
    name: 'Uttarakhand',
    d: 'M 275 160 L 300 130 L 325 155 L 315 185 L 285 180 Z',
    color: '#F472B6'
  },
  {
    id: 'IN-HR',
    name: 'Haryana',
    d: 'M 225 165 L 255 155 L 285 180 L 265 210 L 230 205 L 215 185 Z',
    color: '#A78BFA'
  },
  {
    id: 'IN-DL',
    name: 'Delhi',
    d: 'M 258 190 A 6 6 0 1 1 258 202 A 6 6 0 1 1 258 190 Z',
    color: '#EF4444'
  },
  {
    id: 'IN-RJ',
    name: 'Rajasthan',
    d: 'M 110 200 L 195 150 L 225 165 L 215 185 L 230 205 L 265 210 L 250 280 L 200 300 L 150 270 Z',
    color: '#F59E0B'
  },
  {
    id: 'IN-UP',
    name: 'Uttar Pradesh',
    d: 'M 285 180 L 315 185 L 370 190 L 415 230 L 395 285 L 340 280 L 295 250 L 265 210 Z',
    color: '#10B981'
  },
  {
    id: 'IN-GJ',
    name: 'Gujarat',
    d: 'M 60 290 L 150 270 L 200 300 L 190 350 L 175 390 L 135 390 L 110 345 L 85 345 Z',
    color: '#EC4899'
  },
  {
    id: 'IN-MP',
    name: 'Madhya Pradesh',
    d: 'M 200 300 L 250 280 L 340 280 L 365 320 L 350 395 L 245 400 L 190 350 Z',
    color: '#8B5CF6'
  },
  {
    id: 'IN-BH',
    name: 'Bihar',
    d: 'M 415 230 L 485 240 L 480 285 L 410 290 L 395 285 Z',
    color: '#3B82F6'
  },
  {
    id: 'IN-JH',
    name: 'Jharkhand',
    d: 'M 410 290 L 480 285 L 490 335 L 435 345 L 410 330 Z',
    color: '#F59E0B'
  },
  {
    id: 'IN-WB',
    name: 'West Bengal',
    d: 'M 485 240 L 515 235 L 495 320 L 515 365 L 485 390 L 475 340 L 490 335 L 480 285 Z',
    color: '#14B8A6'
  },
  {
    id: 'IN-OR',
    name: 'Odisha',
    d: 'M 410 330 L 435 345 L 475 340 L 485 390 L 445 440 L 395 435 L 385 385 Z',
    color: '#06B6D4'
  },
  {
    id: 'IN-CG',
    name: 'Chhattisgarh',
    d: 'M 340 280 L 395 285 L 410 330 L 385 385 L 395 435 L 355 460 L 340 405 L 350 395 Z',
    color: '#F43F5E'
  },
  {
    id: 'IN-MH',
    name: 'Maharashtra',
    d: 'M 175 390 L 245 400 L 340 405 L 335 440 L 315 480 L 265 490 L 180 445 Z',
    color: '#EAB308'
  },
  {
    id: 'IN-AP',
    name: 'Andhra Pradesh',
    d: 'M 315 480 L 335 440 L 355 460 L 395 435 L 445 440 L 385 530 L 315 570 L 305 530 Z',
    color: '#10B981'
  },
  {
    id: 'IN-TS',
    name: 'Telangana',
    d: 'M 265 490 L 315 480 L 350 455 L 345 510 L 295 515 Z',
    color: '#6366F1'
  },
  {
    id: 'IN-KA',
    name: 'Karnataka',
    d: 'M 180 445 L 265 490 L 295 515 L 305 530 L 315 570 L 275 620 L 240 610 L 220 530 L 225 495 Z',
    color: '#EC4899'
  },
  {
    id: 'IN-GA',
    name: 'Goa',
    d: 'M 220 530 L 232 532 L 228 545 L 218 540 Z',
    color: '#3B82F6'
  },
  {
    id: 'IN-KL',
    name: 'Kerala',
    d: 'M 240 610 L 275 620 L 270 660 L 245 650 Z',
    color: '#10B981'
  },
  {
    id: 'IN-TN',
    name: 'Tamil Nadu',
    d: 'M 275 620 L 315 570 L 345 585 L 315 675 L 270 660 Z',
    color: '#F59E0B'
  },
  {
    id: 'IN-SK',
    name: 'Sikkim',
    d: 'M 505 210 L 520 212 L 515 228 L 500 225 Z',
    color: '#8B5CF6'
  },
  {
    id: 'IN-AS',
    name: 'Assam',
    d: 'M 535 228 L 585 220 L 595 240 L 575 270 L 545 275 L 535 250 Z',
    color: '#14B8A6'
  },
  {
    id: 'IN-AR',
    name: 'Arunachal Pradesh',
    d: 'M 565 200 L 610 205 L 620 225 L 585 220 L 560 215 Z',
    color: '#6366F1'
  },
  {
    id: 'IN-ML',
    name: 'Meghalaya',
    d: 'M 535 250 L 565 252 L 560 268 L 530 265 Z',
    color: '#EC4899'
  },
  {
    id: 'IN-TR',
    name: 'Tripura',
    d: 'M 545 275 L 555 275 L 552 295 L 542 290 Z',
    color: '#EAB308'
  },
  {
    id: 'IN-MZ',
    name: 'Mizoram',
    d: 'M 560 280 L 570 282 L 565 310 L 555 305 Z',
    color: '#10B981'
  },
  {
    id: 'IN-MN',
    name: 'Manipur',
    d: 'M 575 260 L 590 262 L 585 285 L 572 280 Z',
    color: '#3B82F6'
  },
  {
    id: 'IN-NL',
    name: 'Nagaland',
    d: 'M 585 220 L 600 225 L 595 255 L 580 250 Z',
    color: '#F43F5E'
  }
];

// Rich, high-quality dynamic mock metrics database mapped to each state
const STATE_ECO_DATA: Record<string, {
  wasteDiverted: number;
  dryRecycled: number;
  wetComposted: number;
  co2Saved: number;
  activeResidents: number;
  diligenceScore: number;
  activeNGOs: number;
  activeHubs: number;
  complaintsResolved: number;
  topCategory: string;
  recentCampaign: string;
  activeAlerts: number;
  totalDonations: number;
}> = {
  'IN-JK': { wasteDiverted: 1450, dryRecycled: 850, wetComposted: 600, co2Saved: 3120, activeResidents: 120, diligenceScore: 92.4, activeNGOs: 3, activeHubs: 2, complaintsResolved: 18, topCategory: 'Blankets/Clothes', recentCampaign: 'Himalayan Woolen Retrieval Sync', activeAlerts: 4, totalDonations: 120 },
  'IN-HP': { wasteDiverted: 1120, dryRecycled: 620, wetComposted: 500, co2Saved: 2450, activeResidents: 95, diligenceScore: 95.1, activeNGOs: 2, activeHubs: 1, complaintsResolved: 12, topCategory: 'Glass Bottling', recentCampaign: 'Eco-Hill Cleanliness Drive', activeAlerts: 3, totalDonations: 90 },
  'IN-PB': { wasteDiverted: 4200, dryRecycled: 2100, wetComposted: 2100, co2Saved: 8400, activeResidents: 450, diligenceScore: 88.5, activeNGOs: 6, activeHubs: 4, complaintsResolved: 45, topCategory: 'Agricultural Straw', recentCampaign: 'Harvest Straw Bio-composting', activeAlerts: 18, totalDonations: 340 },
  'IN-UT': { wasteDiverted: 1650, dryRecycled: 950, wetComposted: 700, co2Saved: 3600, activeResidents: 140, diligenceScore: 93.8, activeNGOs: 4, activeHubs: 2, complaintsResolved: 21, topCategory: 'Bio-plastics Extraction', recentCampaign: 'Lakeside Organic Compost workshop', activeAlerts: 5, totalDonations: 150 },
  'IN-HR': { wasteDiverted: 3800, dryRecycled: 2200, wetComposted: 1600, co2Saved: 7850, activeResidents: 390, diligenceScore: 89.2, activeNGOs: 5, activeHubs: 3, complaintsResolved: 38, topCategory: 'Cardboard & Paper', recentCampaign: 'Sectors Cardboard Reclamation Plan', activeAlerts: 12, totalDonations: 280 },
  'IN-DL': { wasteDiverted: 8500, dryRecycled: 5100, wetComposted: 3400, co2Saved: 19200, activeResidents: 1200, diligenceScore: 94.6, activeNGOs: 14, activeHubs: 8, complaintsResolved: 124, topCategory: 'E-Waste / Tablets', recentCampaign: 'Capital Electronics Reclamation 2026', activeAlerts: 24, totalDonations: 850 },
  'IN-RJ': { wasteDiverted: 3100, dryRecycled: 1800, wetComposted: 1300, co2Saved: 6800, activeResidents: 280, diligenceScore: 87.3, activeNGOs: 4, activeHubs: 2, complaintsResolved: 29, topCategory: 'Textiles & Cotton', recentCampaign: 'Desert Khadi Blanket Drive', activeAlerts: 14, totalDonations: 210 },
  'IN-UP': { wasteDiverted: 7600, dryRecycled: 4100, wetComposted: 3500, co2Saved: 16800, activeResidents: 950, diligenceScore: 86.4, activeNGOs: 11, activeHubs: 7, complaintsResolved: 94, topCategory: 'School Textbooks', recentCampaign: 'Ganga Bank Plastic Extraction Run', activeAlerts: 22, totalDonations: 620 },
  'IN-GJ': { wasteDiverted: 5400, dryRecycled: 3400, wetComposted: 2000, co2Saved: 12400, activeResidents: 620, diligenceScore: 91.8, activeNGOs: 8, activeHubs: 5, complaintsResolved: 56, topCategory: 'Industrial Scrap Polymer', recentCampaign: 'Salt-Flats Bio-bags Initiative', activeAlerts: 11, totalDonations: 410 },
  'IN-MP': { wasteDiverted: 4100, dryRecycled: 2400, wetComposted: 1700, co2Saved: 9100, activeResidents: 410, diligenceScore: 89.5, activeNGOs: 6, activeHubs: 3, complaintsResolved: 32, topCategory: 'Compost Soil Fertilizer', recentCampaign: 'Central Composting Hub Sync', activeAlerts: 9, totalDonations: 300 },
  'IN-BH': { wasteDiverted: 2800, dryRecycled: 1500, wetComposted: 1300, co2Saved: 5900, activeResidents: 320, diligenceScore: 84.2, activeNGOs: 4, activeHubs: 2, complaintsResolved: 41, topCategory: 'Metal Utensils', recentCampaign: 'Bihari Village Eco-Literacy Drive', activeAlerts: 15, totalDonations: 180 },
  'IN-JH': { wasteDiverted: 2300, dryRecycled: 1400, wetComposted: 900, co2Saved: 5100, activeResidents: 210, diligenceScore: 85.9, activeNGOs: 3, activeHubs: 2, complaintsResolved: 18, topCategory: 'Mining Community E-waste', recentCampaign: 'Coal-Belt Battery Extraction', activeAlerts: 8, totalDonations: 130 },
  'IN-WB': { wasteDiverted: 5900, dryRecycled: 3500, wetComposted: 2400, co2Saved: 13200, activeResidents: 740, diligenceScore: 90.7, activeNGOs: 9, activeHubs: 6, complaintsResolved: 63, topCategory: 'Jute Bags & Ropes', recentCampaign: 'Sundarbans Plastic Mitigation', activeAlerts: 13, totalDonations: 450 },
  'IN-OR': { wasteDiverted: 2700, dryRecycled: 1600, wetComposted: 1100, co2Saved: 6100, activeResidents: 250, diligenceScore: 91.2, activeNGOs: 4, activeHubs: 2, complaintsResolved: 22, topCategory: 'Fishing Nets Nylon', recentCampaign: 'Puri Beach Plastic Patrol', activeAlerts: 7, totalDonations: 190 },
  'IN-CG': { wasteDiverted: 1900, dryRecycled: 1100, wetComposted: 800, co2Saved: 4200, activeResidents: 180, diligenceScore: 88.1, activeNGOs: 2, activeHubs: 1, complaintsResolved: 15, topCategory: 'Wood Chips / Bio-fuels', recentCampaign: 'Bastar Tribal Eco-Empowerment', activeAlerts: 6, totalDonations: 110 },
  'IN-MH': { wasteDiverted: 9200, dryRecycled: 5800, wetComposted: 3400, co2Saved: 21500, activeResidents: 1500, diligenceScore: 93.9, activeNGOs: 16, activeHubs: 10, complaintsResolved: 142, topCategory: 'Plastics & Electronic Parts', recentCampaign: 'Mumbai Society Dry-waste Sync', activeAlerts: 25, totalDonations: 980 },
  'IN-AP': { wasteDiverted: 4800, dryRecycled: 2900, wetComposted: 1900, co2Saved: 10800, activeResidents: 530, diligenceScore: 92.1, activeNGOs: 7, activeHubs: 4, complaintsResolved: 41, topCategory: 'Cotton Clothes', recentCampaign: 'Visakhapatnam Ocean Guardian Campaign', activeAlerts: 10, totalDonations: 320 },
  'IN-TS': { wasteDiverted: 5100, dryRecycled: 3200, wetComposted: 1900, co2Saved: 11400, activeResidents: 580, diligenceScore: 94.2, activeNGOs: 8, activeHubs: 5, complaintsResolved: 48, topCategory: 'High Tech Tablets & PCs', recentCampaign: 'Cyberabad Organic Hub Audit', activeAlerts: 12, totalDonations: 370 },
  'IN-KA': { wasteDiverted: 7800, dryRecycled: 4900, wetComposted: 2900, co2Saved: 18200, activeResidents: 1100, diligenceScore: 95.8, activeNGOs: 13, activeHubs: 7, complaintsResolved: 95, topCategory: 'Laptops & Textbooks', recentCampaign: 'Bengaluru Smart Recycling Drive', activeAlerts: 19, totalDonations: 710 },
  'IN-GA': { wasteDiverted: 850, dryRecycled: 550, wetComposted: 300, co2Saved: 1900, activeResidents: 80, diligenceScore: 96.5, activeNGOs: 2, activeHubs: 1, complaintsResolved: 8, topCategory: 'Glass beverage bottles', recentCampaign: 'Coastal Glass-Up Beach Audit', activeAlerts: 2, totalDonations: 65 },
  'IN-KL': { wasteDiverted: 3900, dryRecycled: 2500, wetComposted: 1400, co2Saved: 9200, activeResidents: 480, diligenceScore: 97.2, activeNGOs: 6, activeHubs: 4, complaintsResolved: 31, topCategory: 'Organic Bio-Compost', recentCampaign: 'Kerala Backwaters Plastics Clean', activeAlerts: 5, totalDonations: 290 },
  'IN-TN': { wasteDiverted: 6100, dryRecycled: 3800, wetComposted: 2300, co2Saved: 14100, activeResidents: 820, diligenceScore: 93.1, activeNGOs: 10, activeHubs: 6, complaintsResolved: 72, topCategory: 'Household Textile Kits', recentCampaign: 'Chennai Monsoon Relief Supplies Match', activeAlerts: 16, totalDonations: 520 },
  'IN-SK': { wasteDiverted: 520, dryRecycled: 320, wetComposted: 200, co2Saved: 1200, activeResidents: 65, diligenceScore: 98.4, activeNGOs: 2, activeHubs: 1, complaintsResolved: 4, topCategory: 'Biodegradable Bags', recentCampaign: '100% Organic Zero Waste Sync', activeAlerts: 1, totalDonations: 45 },
  'IN-AS': { wasteDiverted: 2400, dryRecycled: 1400, wetComposted: 1000, co2Saved: 5400, activeResidents: 240, diligenceScore: 89.0, activeNGOs: 4, activeHubs: 2, complaintsResolved: 22, topCategory: 'Tea Leaf Composites', recentCampaign: 'Guwahati Clean Riverways', activeAlerts: 8, totalDonations: 160 },
  'IN-AR': { wasteDiverted: 410, dryRecycled: 230, wetComposted: 180, co2Saved: 950, activeResidents: 50, diligenceScore: 94.8, activeNGOs: 1, activeHubs: 1, complaintsResolved: 3, topCategory: 'Bamboo Fiber products', recentCampaign: 'Arunachal Mountain-Track Clean', activeAlerts: 1, totalDonations: 30 },
  'IN-ML': { wasteDiverted: 680, dryRecycled: 410, wetComposted: 270, co2Saved: 1550, activeResidents: 85, diligenceScore: 96.9, activeNGOs: 2, activeHubs: 1, complaintsResolved: 7, topCategory: 'Rainwater Filter plastics', recentCampaign: 'Cherrapunji Eco-Stewardship Sync', activeAlerts: 2, totalDonations: 55 },
  'IN-TR': { wasteDiverted: 480, dryRecycled: 280, wetComposted: 200, co2Saved: 1100, activeResidents: 70, diligenceScore: 90.5, activeNGOs: 2, activeHubs: 1, complaintsResolved: 5, topCategory: 'Rubber tire recyclables', recentCampaign: 'Agartala Local Bio-waste program', activeAlerts: 3, totalDonations: 40 },
  'IN-MZ': { wasteDiverted: 390, dryRecycled: 220, wetComposted: 170, co2Saved: 900, activeResidents: 55, diligenceScore: 95.3, activeNGOs: 1, activeHubs: 1, complaintsResolved: 2, topCategory: 'Educational storybooks', recentCampaign: 'Mizo Village Library Donations', activeAlerts: 1, totalDonations: 35 },
  'IN-MN': { wasteDiverted: 430, dryRecycled: 250, wetComposted: 180, co2Saved: 980, activeResidents: 60, diligenceScore: 91.0, activeNGOs: 1, activeHubs: 1, complaintsResolved: 4, topCategory: 'Cotton weavings', recentCampaign: 'Imphal Valley Eco-Action', activeAlerts: 2, totalDonations: 40 },
  'IN-NL': { wasteDiverted: 450, dryRecycled: 260, wetComposted: 190, co2Saved: 1020, activeResidents: 62, diligenceScore: 92.2, activeNGOs: 2, activeHubs: 1, complaintsResolved: 4, topCategory: 'Bamboo crafts packaging', recentCampaign: 'Kohima Clean Energy Drive', activeAlerts: 2, totalDonations: 45 }
};

export const IndiaMap: React.FC = () => {
  const [selectedStateId, setSelectedStateId] = useState<string>('IN-KA'); // default to Karnataka for high stats
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [mapColorMode, setMapColorMode] = useState<'alerts' | 'standard'>('alerts');
  
  // Custom zoom & pan controls
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -20, y: 10 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const mapSvgRef = useRef<SVGSVGElement>(null);

  const selectedData = STATE_ECO_DATA[selectedStateId] || {
    wasteDiverted: 1200,
    dryRecycled: 700,
    wetComposted: 500,
    co2Saved: 2800,
    activeResidents: 110,
    diligenceScore: 90.0,
    activeNGOs: 3,
    activeHubs: 2,
    complaintsResolved: 15,
    topCategory: 'General Items',
    recentCampaign: 'National Swachh Drive Sync',
    activeAlerts: 5,
    totalDonations: 120
  };

  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.15));
  const handleResetZoom = () => {
    setZoom(0.9);
    setPan({ x: -20, y: 10 });
  };

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 40;
    setPan(prev => {
      switch (direction) {
        case 'up': return { ...prev, y: prev.y - step };
        case 'down': return { ...prev, y: prev.y + step };
        case 'left': return { ...prev, x: prev.x - step };
        case 'right': return { ...prev, x: prev.x + step };
      }
    });
  };

  // Mouse drag event handlers for natural pan
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const filteredStates = INDIA_STATES_PATHS.filter(state => 
    state.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStateColor = (stateId: string, defaultColor: string) => {
    const data = STATE_ECO_DATA[stateId];
    if (!data) return defaultColor;

    if (mapColorMode === 'alerts') {
      const alerts = data.activeAlerts;
      if (alerts > 15) return '#F87171'; // Vibrant Coral Red
      if (alerts > 5) return '#FBBF24';  // Warm Golden Amber
      return '#34D399';                  // Vibrant Emerald Green
    }
    return defaultColor;
  };

  return (
    <div className="space-y-6">
      
      {/* Dropdown Backdrop to close select dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-30 cursor-default" 
          onClick={() => setIsDropdownOpen(false)} 
        />
      )}

      {/* Visual Title Header block */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded border border-black uppercase tracking-widest shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              Hyperlocal National Grid
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight mt-1 flex items-center gap-1.5">
            🇮🇳 India Eco-Stewardship Interactive Map
          </h2>
          <p className="text-xs font-bold text-zinc-500">
            Select states on the SVG projection to visualize real-time carbon offsets, local dry waste metrics, and NGO partnerships.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF8F2] border-2 border-black p-2 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Globe className="h-5 w-5 text-[#7C3AED] animate-spin-slow" />
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-zinc-400 block leading-none">Total Active States</span>
            <span className="text-sm font-black text-black">30 States / UT Regions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SVG Projection Map - 7 columns */}
        <div className="lg:col-span-7 bg-[#FAF8F2] border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col items-center">
          
          {/* Quick Search & Select Droplist alongside Reset View */}
          <div className="w-full flex flex-col sm:flex-row gap-3 items-stretch sm:items-end justify-between mb-4 z-35 relative">
            
            {/* Search Input dropdown */}
            <div className="relative flex-1">
              <label className="text-[10px] font-black uppercase text-black block mb-1 flex items-center gap-1">
                <Search className="h-3 w-3" /> Quick Search & Select State
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type state (e.g. Karnataka, Delhi, Kerala...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full bg-white border-2 border-black px-3 py-2 rounded-xl text-xs font-black focus:outline-none placeholder:text-zinc-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-black font-black text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {isDropdownOpen && (
                <div className="absolute z-40 left-0 right-0 mt-1 bg-white border-2 border-black rounded-xl max-h-48 overflow-y-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {filteredStates.length > 0 ? (
                    filteredStates.map(state => (
                      <button
                        key={state.id}
                        type="button"
                        onClick={() => {
                          setSelectedStateId(state.id);
                          setSearchQuery(state.name);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-black hover:bg-amber-100 border-b border-zinc-100 last:border-b-0 flex items-center justify-between cursor-pointer"
                      >
                        <span>{state.name}</span>
                        <span className="text-[10px] font-black text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-black/10">{state.id}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-zinc-400 font-bold text-center">
                      No regions found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Reset View Button */}
            <button
              onClick={handleResetZoom}
              className="px-4 py-2 bg-white hover:bg-zinc-100 border-2 border-black rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer self-stretch sm:self-auto justify-center"
              title="Reset Zoom and Centering"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset View</span>
            </button>

          </div>

          {/* Color coding selector & Legend */}
          <div className="w-full flex flex-wrap gap-2 justify-between items-center bg-white border-2 border-black p-3 rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] mb-4 relative z-20">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-black">MAP THEME:</span>
              <button
                onClick={() => setMapColorMode('alerts')}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-black cursor-pointer transition-all ${mapColorMode === 'alerts' ? 'bg-[#7C3AED] text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'bg-zinc-100 hover:bg-zinc-200 text-black'}`}
              >
                ⚠️ Alert Levels
              </button>
              <button
                onClick={() => setMapColorMode('standard')}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-black cursor-pointer transition-all ${mapColorMode === 'standard' ? 'bg-zinc-950 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'bg-zinc-100 hover:bg-zinc-200 text-black'}`}
              >
                🎨 Regional Zones
              </button>
            </div>

            {mapColorMode === 'alerts' ? (
              <div className="flex items-center gap-2.5 text-[9px] font-black uppercase">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#F87171] border border-black" /> High Alerts (16+)</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24] border border-black" /> Mid (6-15)</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#34D399] border border-black" /> Low (0-5)</span>
              </div>
            ) : (
              <span className="text-[9px] font-black text-zinc-400 uppercase">Interactive Regional Projections</span>
            )}
          </div>

          {/* Zoom & Pan Controls panel */}
          <div className="absolute top-32 left-8 z-10 flex flex-col gap-1.5 bg-white border-2 border-black p-2 rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-1 border-b border-zinc-200 pb-1 mb-1 justify-between">
              <span className="text-[9px] font-black text-zinc-500 uppercase">NAV</span>
              <button 
                onClick={handleResetZoom}
                className="text-[8px] font-black bg-zinc-100 hover:bg-zinc-200 border border-black px-1.5 py-0.5 rounded cursor-pointer transition-all"
                title="Reset View"
              >
                RESET
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-1 mb-1.5">
              <div />
              <button 
                onClick={() => handlePan('up')}
                className="p-1 bg-zinc-100 hover:bg-amber-100 border border-black rounded cursor-pointer flex items-center justify-center transition-all"
                title="Pan Up"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <div />
              <button 
                onClick={() => handlePan('left')}
                className="p-1 bg-zinc-100 hover:bg-amber-100 border border-black rounded cursor-pointer flex items-center justify-center transition-all"
                title="Pan Left"
              >
                <ArrowLeft className="h-3 w-3" />
              </button>
              <button 
                onClick={handleResetZoom}
                className="p-1 bg-zinc-950 text-white border border-black rounded cursor-pointer flex items-center justify-center transition-all"
                title="Recenter"
              >
                <Maximize2 className="h-2.5 w-2.5" />
              </button>
              <button 
                onClick={() => handlePan('right')}
                className="p-1 bg-zinc-100 hover:bg-amber-100 border border-black rounded cursor-pointer flex items-center justify-center transition-all"
                title="Pan Right"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
              <div />
              <button 
                onClick={() => handlePan('down')}
                className="p-1 bg-zinc-100 hover:bg-amber-100 border border-black rounded cursor-pointer flex items-center justify-center transition-all"
                title="Pan Down"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <div />
            </div>

            <button 
              onClick={handleZoomIn}
              className="p-1.5 bg-zinc-50 hover:bg-amber-200 border border-black rounded-lg cursor-pointer flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-tight transition-all"
              title="Zoom In"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-1.5 bg-zinc-50 hover:bg-amber-200 border border-black rounded-lg cursor-pointer flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-tight transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
          </div>

          {/* Hover state banner display */}
          <div className="absolute top-32 right-8 bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 pointer-events-none">
            {hoveredStateName ? `📍 ${hoveredStateName}` : '👈 Hover or Click States'}
          </div>

          {/* Interactive SVG Rendering Container */}
          <div className="w-full max-w-[500px] aspect-[1/1.1] border-2 border-dashed border-zinc-300 rounded-2xl relative bg-white overflow-hidden shadow-inner cursor-grab active:cursor-grabbing">
            <svg
              ref={mapSvgRef}
              viewBox="0 0 600 680"
              className="w-full h-full select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                
                {/* Background grid representation */}
                <defs>
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="800" height="800" fill="url(#gridPattern)" pointerEvents="none" />

                {/* State Paths Group */}
                {INDIA_STATES_PATHS.map((state) => {
                  const isSelected = state.id === selectedStateId;
                  const isHovered = hoveredStateName === state.name;
                  const finalColor = isSelected 
                    ? '#FFD700' 
                    : isHovered 
                      ? '#FEF08A' 
                      : getStateColor(state.id, state.color);
                  
                  return (
                    <path
                      key={state.id}
                      d={state.d}
                      fill={finalColor}
                      stroke="#000000"
                      strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.8'}
                      strokeLinejoin="round"
                      className="transition-all duration-150 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStateId(state.id);
                        setSearchQuery(state.name);
                      }}
                      onMouseEnter={() => {
                        setHoveredStateName(state.name);
                        setHoveredStateId(state.id);
                      }}
                      onMouseLeave={() => {
                        setHoveredStateName(null);
                        setHoveredStateId(null);
                      }}
                      filter={isSelected ? 'drop-shadow(3px 3px 0px rgba(0,0,0,0.4))' : undefined}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Micro floating tooltip tracking mouse pos */}
            {hoveredStateId && STATE_ECO_DATA[hoveredStateId] && (
              <div 
                className="absolute pointer-events-none bg-white border-2 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-40 flex flex-col space-y-1.5 text-black max-w-[210px] select-none"
                style={{
                  left: `${Math.min(300, Math.max(10, mousePos.x + 15))}px`,
                  top: `${Math.min(500, Math.max(10, mousePos.y + 15))}px`,
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <div className="font-black text-xs uppercase tracking-tight border-b-2 border-black pb-1 mb-1 flex items-center gap-1.5">
                  <span className="text-sm">📍</span>
                  <span>{hoveredStateName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 gap-4">
                  <span>Waste Diverted:</span>
                  <span className="font-black text-black">{(STATE_ECO_DATA[hoveredStateId].wasteDiverted / 1000).toFixed(1)} MT</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 gap-4">
                  <span>Donations:</span>
                  <span className="font-black text-black">{STATE_ECO_DATA[hoveredStateId].totalDonations} packs</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 gap-4">
                  <span>Active Alerts:</span>
                  <span className={`font-black px-1.5 py-0.5 rounded border border-black/10 text-[9px] ${
                    STATE_ECO_DATA[hoveredStateId].activeAlerts > 15 ? 'bg-red-100 text-red-600' : 
                    STATE_ECO_DATA[hoveredStateId].activeAlerts > 5 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    ⚠️ {STATE_ECO_DATA[hoveredStateId].activeAlerts} Reports
                  </span>
                </div>
              </div>
            )}

          </div>

          <div className="w-full text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-3">
            Use standard mouse scroll/drag to navigate or leverage the panel controls.
          </div>
        </div>

        {/* State Eco-Impact Mini Dashboard Panel - 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active State Profile info */}
          <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🇮🇳</span>
                <div>
                  <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-wider block leading-none">Selected Region Stats</span>
                  <h3 className="text-lg font-black uppercase text-black tracking-tight mt-1 leading-none">
                    {INDIA_STATES_PATHS.find(s => s.id === selectedStateId)?.name || 'State'}
                  </h3>
                </div>
              </div>
              <span className="bg-amber-100 text-[#F59E0B] text-xs font-black uppercase tracking-tight px-3 py-1.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                {selectedStateId}
              </span>
            </div>

            {/* Top metrics summary grid (Row 1 + Row 2) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#FAF8F2] border-2 border-black p-3 rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-black text-zinc-400 uppercase block">Total Waste Diverted</span>
                <span className="text-lg font-black text-black">{(selectedData.wasteDiverted / 1000).toFixed(1)} MT</span>
                <div className="text-[8px] font-bold text-zinc-500 mt-0.5">
                  {selectedData.dryRecycled}kg dry / {selectedData.wetComposted}kg wet
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-black p-3 rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-black text-emerald-700 uppercase block">CO2 Saved</span>
                <span className="text-lg font-black text-emerald-950">{(selectedData.co2Saved / 1000).toFixed(1)} Tons</span>
                <div className="text-[8px] font-bold text-emerald-600 mt-0.5">
                  Prevented emission index
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-black p-3 rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-black text-amber-700 uppercase block">Active Alerts</span>
                <span className="text-lg font-black text-amber-950">{selectedData.activeAlerts} Reports</span>
                <div className="text-[8px] font-bold text-amber-600 mt-0.5">
                  Active cleanup & waste alerts
                </div>
              </div>

              <div className="bg-indigo-50 border-2 border-black p-3 rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-black text-indigo-700 uppercase block">Donation Volume</span>
                <span className="text-lg font-black text-indigo-950">{selectedData.totalDonations} Packs</span>
                <div className="text-[8px] font-bold text-indigo-600 mt-0.5">
                  Total donated item count
                </div>
              </div>
            </div>

            {/* Performance KPIs list */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-zinc-500 uppercase flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" /> State Diligence Score
                </span>
                <span className="text-black font-black">{selectedData.diligenceScore}%</span>
              </div>
              <div className="w-full bg-zinc-100 border border-black rounded-full h-2.5 overflow-hidden p-0.5">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${selectedData.diligenceScore}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-black uppercase text-zinc-700">
                <div className="bg-zinc-50 p-2.5 border border-black rounded-xl flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#7C3AED]" />
                  <div>
                    <span className="text-[8px] text-zinc-400 block leading-none">ACTIVE NGO</span>
                    <span>{selectedData.activeNGOs} Organizations</span>
                  </div>
                </div>
                <div className="bg-zinc-50 p-2.5 border border-black rounded-xl flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <div>
                    <span className="text-[8px] text-zinc-400 block leading-none">LOCAL HUBS</span>
                    <span>{selectedData.activeHubs} Portals</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlighted Category Block */}
            <div className="bg-yellow-50 border-2 border-dashed border-black rounded-2xl p-3 flex items-start gap-2 text-xs">
              <span className="text-base mt-0.5">🌟</span>
              <div>
                <strong className="text-black uppercase block font-black">Top Recovered Category</strong>
                <span className="text-zinc-650 font-semibold">{selectedData.topCategory}</span>
              </div>
            </div>

            {/* Recent Regional Campaign */}
            <div className="bg-[#FAF8F2] border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
              <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-wider block">Recent Campaign Activity</span>
              <h4 className="text-xs font-black uppercase text-black leading-tight">{selectedData.recentCampaign}</h4>
              <p className="text-[10px] font-bold text-zinc-500">
                Joint environmental program linking public societies and regional NGOs to optimize recycling output.
              </p>
            </div>

          </div>

          {/* Map explanation notice card */}
          <div className="bg-zinc-950 text-white border-4 border-black rounded-3xl p-4 sm:p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-2">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">🌿 Swachh Bharat Smart Linkage</h4>
            <p className="text-[11px] leading-relaxed font-bold text-zinc-300">
              This interactive geographical projection establishes real-time links with neighborhood sorting hubs, apartment collections, and local recycling centers across each territory to centralize waste diversion index analytics on a nationwide scale.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
