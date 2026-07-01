import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend 
} from 'recharts';
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
  Volume2,
  FlameKindling,
  Info,
  Map,
  Sparkles,
  Calendar
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

  const d3ContainerRef = useRef<SVGSVGElement | null>(null);
  const d3MonthlyChartRef = useRef<SVGSVGElement | null>(null);
  const [heatmapView, setHeatmapView] = useState<'waste' | 'donation'>('donation');

  // Hierarchy selection states
  const [selectedSociety, setSelectedSociety] = useState<string>('Greenwood Society');
  const [selectedBlock, setSelectedBlock] = useState<string>('Block A');
  const [selectedFloor, setSelectedFloor] = useState<string>('Floor 1');
  const [selectedFlat, setSelectedFlat] = useState<string>('Flat 101');

  const [selectedOrganization, setSelectedOrganization] = useState<string>('Google');
  const [selectedCampus, setSelectedCampus] = useState<string>('Google Infi');

  const [selectedUniversity, setSelectedUniversity] = useState<string>('City University');
  const [selectedUnivBlock, setSelectedUnivBlock] = useState<string>('Engineering Department');

  // Multiplier calculation for the selected level of the hierarchy
  const getHierarchyMultiplier = () => {
    if (filterType === 'all') return 1.0;
    
    if (filterType === 'apartment') {
      let multiplier = 1.0;
      if (selectedSociety === 'Sunshine Heights') multiplier *= 0.82;
      else if (selectedSociety === 'Harmony Heights') multiplier *= 0.65;
      
      if (selectedBlock === 'Block B') multiplier *= 0.88;
      else if (selectedBlock === 'Block C') multiplier *= 0.74;
      else if (selectedBlock === 'Block D') multiplier *= 0.60;
      
      const fNum = parseInt(selectedFloor.replace('Floor ', '')) || 0;
      multiplier *= Math.max(0.4, 1 - (fNum * 0.02));
      
      if (selectedFlat === 'Flat 102') multiplier *= 0.94;
      else if (selectedFlat === 'Flat 103') multiplier *= 0.86;
      else if (selectedFlat.includes('2')) multiplier *= 0.80;
      
      return Math.max(0.01, multiplier);
    }
    
    if (filterType === 'office') {
      let multiplier = 1.0;
      if (selectedOrganization === 'Microsoft') multiplier *= 0.90;
      else if (selectedOrganization === 'Tata Consultancy') multiplier *= 1.25;
      else if (selectedOrganization === 'Infosys') multiplier *= 0.75;
      
      if (selectedCampus && (selectedCampus.includes('Signature') || selectedCampus.includes('Block B') || selectedCampus.includes('Deccan') || selectedCampus.includes('Eco'))) {
        multiplier *= 0.82;
      }
      return Math.max(0.01, multiplier);
    }
    
    if (filterType === 'university') {
      let multiplier = 1.0;
      if (selectedUniversity === 'IIT Bombay') multiplier *= 1.38;
      else if (selectedUniversity === 'Anna University') multiplier *= 0.84;
      
      if (selectedUnivBlock === 'Science Block') multiplier *= 0.75;
      else if (selectedUnivBlock.includes('Hostel')) multiplier *= 0.60;
      else if (selectedUnivBlock === 'PG Block') multiplier *= 0.50;
      return Math.max(0.01, multiplier);
    }
    
    return 1.0;
  };

  const multiplier = getHierarchyMultiplier();

  // Generate 30 days of realistic daily waste management trends data scaled by current hierarchy multiplier
  const generateHistoricalTrendData = () => {
    const data = [];
    const baseWet = metrics ? Math.round((metrics.totalWasteCollectedKg * multiplier) * 0.38 / 30) : 12;
    const baseDry = metrics ? Math.round((metrics.totalWasteCollectedKg * multiplier) * 0.52 / 30) : 18;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Introduce minor random fluctuations to make the line chart organic and realistic
      const noiseWet = Math.sin(i * 0.4) * 3 + (Math.random() - 0.5) * 4;
      const noiseDry = Math.cos(i * 0.4) * 4 + (Math.random() - 0.5) * 5;
      
      data.push({
        name: formattedDate,
        'Wet Waste (Kg)': Math.max(2, Math.round(baseWet + noiseWet)),
        'Dry Recyclables (Kg)': Math.max(3, Math.round(baseDry + noiseDry)),
      });
    }
    return data;
  };

  // Generate 8 weeks of historical weekly trend data of total weight diverted from landfills
  const generateWeeklyLandfillDivertedData = () => {
    const data = [];
    const baseDiverted = metrics ? Math.round((metrics.landfillDivertedKg * multiplier) / 4.3) : 150; // Base weekly diversion in kg
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
      const formattedDate = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Weekly sinusoidal trend with minor noise
      const trendFactor = 1 + Math.sin(i * 0.8) * 0.15;
      const noise = (Math.random() - 0.5) * 15;
      const divertedVal = Math.max(20, Math.round(baseDiverted * trendFactor + noise));
      const targetVal = Math.round(divertedVal * 1.12); // Total generated weekly waste target
      
      data.push({
        name: `Wk of ${formattedDate}`,
        'Diverted (Kg)': divertedVal,
        'Landfill Goal (Kg)': Math.round(targetVal * 0.95),
      });
    }
    return data;
  };

  // Generate 30 days of daily waste diverted and its 7-day moving average
  const generateDivertedMovingAverageData = () => {
    const data = [];
    const baseDiverted = metrics ? Math.round((metrics.landfillDivertedKg * multiplier) / 30) : 15;
    
    // First, let's generate 30 days of raw daily diverted data
    const rawDaily: number[] = [];
    for (let i = 0; i < 30; i++) {
      const dayFactor = 1 + Math.sin(i * 0.3) * 0.15 + (Math.cos(i * 0.7) * 0.1);
      const noise = (Math.random() - 0.5) * 4;
      rawDaily.push(Math.max(3, Math.round(baseDiverted * dayFactor + noise)));
    }

    // Now calculate 7-day moving average for each day
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - 6); j <= i; j++) {
        sum += rawDaily[j];
        count++;
      }
      const movingAvg = Number((sum / count).toFixed(1));
      const dailyVal = rawDaily[i];
      const deviation = movingAvg > 0 ? Number((((dailyVal - movingAvg) / movingAvg) * 100).toFixed(1)) : 0;

      data.push({
        name: formattedDate,
        'Daily Diverted (Kg)': dailyVal,
        '7-Day Moving Avg (Kg)': movingAvg,
        'Deviation (%)': deviation,
      });
    }
    return data;
  };

  // Generate 7 days of daily waste reduction data
  const generate7DayWasteReductionData = () => {
    const data = [];
    const baseReduction = metrics ? Math.round((metrics.landfillDivertedKg * multiplier) / 30) : 12;
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      // Sinusoidal daily trend with minor random noise
      const factor = 1 + Math.sin((6 - i) * 0.9) * 0.2;
      const noise = (Math.random() - 0.5) * 3;
      const reductionVal = Math.max(2, Math.round(baseReduction * factor + noise));
      // Organic compost contribution
      const compostVal = Math.max(1, Math.round(reductionVal * 0.35 + (Math.random() - 0.5) * 1));
      
      data.push({
        dateStr: formattedDate,
        'Daily Reduction (Kg)': reductionVal,
        'Organic Composted (Kg)': compostVal,
        'Recyclables Recovered (Kg)': Math.max(1, reductionVal - compostVal),
      });
    }
    return data;
  };

  // Generate monthly waste reduction trends pulling from the impactMetrics state (metrics)
  const getMonthlyReductionData = () => {
    const baseCollected = metrics ? metrics.totalWasteCollectedKg * multiplier : 1845.5;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const reductionPercentages = [0.15, 0.22, 0.28, 0.35, 0.42, 0.54]; 
    
    return months.map((month, idx) => {
      const totalCollectedThisMonth = baseCollected * (0.12 + Math.sin(idx * 0.4) * 0.02);
      const recycledKg = totalCollectedThisMonth * reductionPercentages[idx];
      return {
        month,
        wasteCollected: Math.round(totalCollectedThisMonth),
        wasteReduced: Math.round(recycledKg),
        rate: Math.round(reductionPercentages[idx] * 100)
      };
    });
  };

  useEffect(() => {
    if (!d3MonthlyChartRef.current || !metrics) return;

    // Clear old drawings
    d3.select(d3MonthlyChartRef.current).selectAll('*').remove();

    const svg = d3.select(d3MonthlyChartRef.current);
    const width = 640;
    const height = 280;
    const margin = { top: 40, right: 60, bottom: 40, left: 60 };

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', '100%');

    const data = getMonthlyReductionData();

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yLeft = d3.scaleLinear()
      .domain([0, (d3.max(data, d => d.wasteReduced) || 100) * 1.2])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yRight = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Draw Axes
    const xAxis = d3.axisBottom(x);
    const yAxisLeft = d3.axisLeft(yLeft).ticks(5);
    const yAxisRight = d3.axisRight(yRight).ticks(5);

    // Grid lines for left axis
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yLeft)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', 'rgba(0,0,0,0.06)')
        .attr('stroke-dasharray', '3,3')
      );

    // X Axis Group
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', '#000').attr('stroke-width', 2))
      .call(g => g.selectAll('.tick line').attr('stroke', '#000').attr('stroke-width', 1.5))
      .call(g => g.selectAll('text')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#000')
      );

    // Y Axis Left Group (Waste Reduced)
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxisLeft)
      .call(g => g.select('.domain').attr('stroke', '#000').attr('stroke-width', 2))
      .call(g => g.selectAll('.tick line').attr('stroke', '#000').attr('stroke-width', 1.5))
      .call(g => g.selectAll('text')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#000')
      );

    // Y Axis Right Group (Reduction Rate)
    svg.append('g')
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(yAxisRight)
      .call(g => g.select('.domain').attr('stroke', '#000').attr('stroke-width', 2))
      .call(g => g.selectAll('.tick line').attr('stroke', '#000').attr('stroke-width', 1.5))
      .call(g => g.selectAll('text')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#000')
      );

    // Add Bars for Waste Reduced
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.month) || 0)
      .attr('y', d => yLeft(d.wasteReduced))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.bottom - yLeft(d.wasteReduced))
      .attr('fill', '#3B82F6') 
      .attr('stroke', '#000000')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#1D4ED8');
        svg.select('#monthly-tooltip')
          .attr('visibility', 'visible')
          .text(`${d.month}: ${d.wasteReduced} Kg Diverted (${d.rate}% Rate)`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#3B82F6');
        svg.select('#monthly-tooltip').attr('visibility', 'hidden');
      });

    // Add Line for Reduction Rate
    const lineGenerator = d3.line<{ month: string; wasteCollected: number; wasteReduced: number; rate: number }>()
      .x(d => (x(d.month) || 0) + x.bandwidth() / 2)
      .y(d => yRight(d.rate))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10B981') 
      .attr('stroke-width', 3)
      .attr('d', lineGenerator);

    // Add Dots over Line
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr('cy', d => yRight(d.rate))
      .attr('r', 5)
      .attr('fill', '#FFF')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 8);
        svg.select('#monthly-tooltip')
          .attr('visibility', 'visible')
          .text(`${d.month}: Reduction Rate ${d.rate}%`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 5);
        svg.select('#monthly-tooltip').attr('visibility', 'hidden');
      });

    // Axis titles
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', margin.top - 15)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#3B82F6')
      .text('Waste Reduced (Kg)');

    svg.append('text')
      .attr('x', width - margin.right)
      .attr('y', margin.top - 15)
      .attr('text-anchor', 'end')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#10B981')
      .text('Reduction Rate (%)');

    // Tooltip overlay text
    svg.append('text')
      .attr('id', 'monthly-tooltip')
      .attr('x', width / 2)
      .attr('y', margin.top - 15)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '11px')
      .attr('font-weight', 'black')
      .attr('fill', '#000000')
      .attr('visibility', 'hidden');

  }, [metrics, multiplier]);

  useEffect(() => {
    if (!d3ContainerRef.current || !metrics) return;

    // Clear old drawings
    d3.select(d3ContainerRef.current).selectAll('*').remove();

    const svg = d3.select(d3ContainerRef.current);
    const width = 640;
    const height = 280;
    const margin = { top: 35, right: 120, bottom: 40, left: 40 };

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', '100%');

    const gridCols = 10;
    const gridRows = 5;
    const data: Array<{ col: number; row: number; val: number; label: string }> = [];

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        let score = 0;
        let siteLabel = `Grid [${c}, ${r}]`;

        if (heatmapView === 'waste') {
          const distTuring = Math.sqrt(Math.pow(c - 7, 2) + Math.pow(r - 1, 2));
          const distGreenwood = Math.sqrt(Math.pow(c - 3, 2) + Math.pow(r - 3, 2));
          score = Math.max(0, 100 - distTuring * 28 - Math.random() * 5);
          score = Math.max(score, 100 - distGreenwood * 22);
          siteLabel += " - High Waste Density Hotspot";
        } else {
          const distApex = Math.sqrt(Math.pow(c - 5, 2) + Math.pow(r - 2, 2));
          const distNGO = Math.sqrt(Math.pow(c - 1, 2) + Math.pow(r - 1, 2));
          score = Math.max(0, 95 - distApex * 25);
          score = Math.max(score, 88 - distNGO * 20);
          siteLabel += " - Active Donation Drive Cluster";
        }

        data.push({
          col: c,
          row: r,
          val: Math.round(Math.max(10, Math.min(100, score * multiplier))),
          label: siteLabel
        });
      }
    }

    const xScale = d3.scaleBand<number>()
      .domain(d3.range(gridCols))
      .range([margin.left, width - margin.right])
      .padding(0.06);

    const yScale = d3.scaleBand<number>()
      .domain(d3.range(gridRows))
      .range([margin.top, height - margin.bottom])
      .padding(0.06);

    const colorScale = heatmapView === 'waste'
      ? d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 100])
      : d3.scaleSequential(d3.interpolateYlGn).domain([0, 100]);

    svg.selectAll('.tile')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('x', d => xScale(d.col) || 0)
      .attr('y', d => yScale(d.row) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.val))
      .attr('stroke', '#000000')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 3);
        
        svg.select('#tooltip')
          .attr('visibility', 'visible')
          .text(`${d.label}: Activity index ${d.val}%`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 1.5);
        svg.select('#tooltip').attr('visibility', 'hidden');
      });

    svg.append('text')
      .attr('x', (width - margin.right + margin.left) / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '8px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .text('LONGITUDE SPAN SEGMENTS (WEST TO EAST)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height - margin.bottom + margin.top) / 2)
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '8px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .text('LATITUDE SPANS (SOUTH TO NORTH)');

    svg.append('text')
      .attr('id', 'tooltip')
      .attr('x', margin.left)
      .attr('y', margin.top - 12)
      .attr('visibility', 'hidden')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#7C3AED')
      .text('');

    const legendWidth = 15;
    const legendHeight = 120;
    const legendY = margin.top + 15;
    const legendX = width - margin.right + 35;

    const legendScale = d3.scaleLinear()
      .domain([0, 100])
      .range([legendHeight, 0]);

    const legendSvg = svg.append('g')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    const numStops = 10;
    for (let s = 0; s <= numStops; s++) {
      const offset = (s / numStops) * 100;
      linearGradient.append('stop')
        .attr('offset', `${offset}%`)
        .attr('stop-color', colorScale((s / numStops) * 100));
    }

    legendSvg.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#legend-gradient)')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(4)
      .tickFormat(d => `${d}%`);

    legendSvg.append('g')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '8px')
      .style('font-weight', 'bold')
      .style('fill', '#000');

    legendSvg.append('text')
      .attr('x', -25)
      .attr('y', -8)
      .style('font-family', 'sans-serif')
      .style('font-size', '8px')
      .style('font-weight', 'black')
      .style('fill', '#000')
      .text('ACTIVITY');

  }, [heatmapView, loading, metrics, multiplier]);
  
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
    
    const text = `Three overlapping community zones detected. Highest efficiency cluster lies between Central Apartments, Tech Park Office Block, and City University North Campus. Trash To Treasure daily summary. Cumulative waste managed is ${metrics.totalWasteCollectedKg} kilograms. We have saved ${metrics.carbonSavedKg} kilograms of carbon emissions, and saved ${metrics.landfillDivertedKg} kilograms of waste from landfills. There are currently ${pendingCount} pending community complaints requiring worker dispatch. Thank you for keeping our community clean.`;

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

      {/* Hierarchical Sub-Level Selectors */}
      {filterType !== 'all' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FAF8F2] border-2 border-black p-4 rounded-3xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            <span>🏢</span>
            <span>Selected Sector Hierarchy Path:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filterType === 'apartment' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-sky-600">Society Dropdown</label>
                  <select 
                    value={selectedSociety} 
                    onChange={(e) => setSelectedSociety(e.target.value)}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    <option value="Greenwood Society">Greenwood Society</option>
                    <option value="Sunshine Heights">Sunshine Heights</option>
                    <option value="Harmony Heights">Harmony Heights</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-sky-600">Block</label>
                  <select 
                    value={selectedBlock} 
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Block D">Block D</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-sky-600">Floor</label>
                  <select 
                    value={selectedFloor} 
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    {Array.from({ length: 22 }, (_, i) => i === 0 ? 'Ground' : `Floor ${i}`).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-sky-600">Flat (Optional)</label>
                  <select 
                    value={selectedFlat} 
                    onChange={(e) => setSelectedFlat(e.target.value)}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    <option value="Flat 101">Flat 101</option>
                    <option value="Flat 102">Flat 102</option>
                    <option value="Flat 103">Flat 103</option>
                    <option value="Flat 201">Flat 201</option>
                    <option value="Flat 202">Flat 202</option>
                    <option value="Flat 203">Flat 203</option>
                  </select>
                </div>
              </>
            )}

            {filterType === 'office' && (
              <>
                <div className="space-y-1 col-span-2">
                  <label className="block text-[10px] font-black uppercase text-indigo-600">Organization</label>
                  <select 
                    value={selectedOrganization} 
                    onChange={(e) => {
                      setSelectedOrganization(e.target.value);
                      if (e.target.value === 'Google') setSelectedCampus('Google Infi');
                      else if (e.target.value === 'Microsoft') setSelectedCampus('Microsoft GEC');
                      else if (e.target.value === 'Tata Consultancy') setSelectedCampus('TCS Synergy Park');
                      else if (e.target.value === 'Infosys') setSelectedCampus('Infosys Block 3');
                    }}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    <option value="Google">Google</option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="Tata Consultancy">Tata Consultancy Services</option>
                    <option value="Infosys">Infosys</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="block text-[10px] font-black uppercase text-indigo-600">Campus Dropdown</label>
                  <select 
                    value={selectedCampus} 
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    {selectedOrganization === 'Google' && (
                      <>
                        <option value="Google Infi">Google Infi</option>
                        <option value="Google Signature Towers">Google Signature Towers</option>
                      </>
                    )}
                    {selectedOrganization === 'Microsoft' && (
                      <>
                        <option value="Microsoft GEC">Microsoft GEC</option>
                        <option value="Microsoft Campus Block B">Microsoft Campus Block B</option>
                      </>
                    )}
                    {selectedOrganization === 'Tata Consultancy' && (
                      <>
                        <option value="TCS Synergy Park">TCS Synergy Park</option>
                        <option value="TCS Deccan Park">TCS Deccan Park</option>
                      </>
                    )}
                    {selectedOrganization === 'Infosys' && (
                      <>
                        <option value="Infosys Block 3">Infosys Block 3</option>
                        <option value="Infosys Eco Space">Infosys Eco Space</option>
                      </>
                    )}
                  </select>
                </div>
              </>
            )}

            {filterType === 'university' && (
              <>
                <div className="space-y-1 col-span-2">
                  <label className="block text-[10px] font-black uppercase text-emerald-600">Institution</label>
                  <select 
                    value={selectedUniversity} 
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    <option value="City University">City University</option>
                    <option value="IIT Bombay">IIT Bombay</option>
                    <option value="Anna University">Anna University</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="block text-[10px] font-black uppercase text-emerald-600">Block / Department / Hostel</label>
                  <select 
                    value={selectedUnivBlock} 
                    onChange={(e) => setSelectedUnivBlock(e.target.value)}
                    className="w-full text-xs font-black uppercase p-2 border-2 border-black rounded-lg cursor-pointer outline-none bg-white text-black"
                  >
                    <option value="Engineering Department">Engineering Department</option>
                    <option value="Science Block">Science Block</option>
                    <option value="North Hostel">North Hostel</option>
                    <option value="South Hostel">South Hostel</option>
                    <option value="PG Block">PG Block</option>
                  </select>
                </div>
              </>
            )}
          </div>
          
          <div className="text-[10px] font-bold text-zinc-650 flex items-center gap-1 bg-white p-2 border border-black rounded-xl">
            <span className="text-emerald-600">⚡</span>
            <span>Recalculated Factor: <strong className="text-black">{multiplier.toFixed(2)}x</strong>. Level coordinates are dynamically propagated.</span>
          </div>
        </motion.div>
      )}

      {/* Dynamic Key metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Cumulative Waste Managed */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Total Waste Managed is ${Math.round(metrics.totalWasteCollectedKg * multiplier)} kilograms`}
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
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{Math.round(metrics.totalWasteCollectedKg * multiplier)} <span className="text-xs sm:text-sm font-bold text-zinc-500">Kg</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
            <span className="text-zinc-500 font-medium">vs baseline</span>
          </div>
        </motion.div>

        {/* Carbon emissions Offset */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Greenhouse Offset is ${Math.round(metrics.carbonSavedKg * multiplier)} kilograms of carbon dioxide`}
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
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{Math.round(metrics.carbonSavedKg * multiplier)} <span className="text-xs sm:text-sm font-bold text-zinc-500">Kg CO2e</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-550">
            <span className="font-bold">Planting equiv:</span>
            <span className="font-extrabold text-[#7C3AED]">{Math.max(1, Math.round((metrics.carbonSavedKg * multiplier) / 22))} trees</span>
          </div>
        </motion.div>

        {/* Landfill diversion */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Landfill Diverted is ${Math.round(metrics.landfillDivertedKg * multiplier)} kilograms`}
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
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{Math.round(metrics.landfillDivertedKg * multiplier)} <span className="text-xs sm:text-sm font-bold text-zinc-500">Kg</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span className="text-blue-600 font-extrabold">{Math.round((metrics.landfillDivertedKg / metrics.totalWasteCollectedKg) * 100)}% Diversion</span>
            <span className="text-zinc-500 font-medium">from dumps</span>
          </div>
        </motion.div>

        {/* Community Donations Shared */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white vibrant-border p-3 sm:p-5 rounded-3xl vibrant-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden group"
          data-narrate={`Donation handovers logged is ${Math.max(1, Math.round(metrics.donationsDistributed * multiplier))} items`}
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
          <p className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">{Math.max(1, Math.round(metrics.donationsDistributed * multiplier))} <span className="text-xs sm:text-sm font-bold text-zinc-500">Offers</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-550">
            <span className="font-bold">Compost Yield:</span>
            <span className="font-extrabold text-amber-600">{Math.round(metrics.compostGeneratedKg * multiplier)} Kg</span>
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
                        className="bg-[#FBBF24] h-full transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(100, (entity.wetWasteKg / (totalKg || 1)) * 100)}%` }} 
                        title={`Organic Waste: ${entity.wetWasteKg}kg`}
                      />
                      <div 
                        className="bg-sky-500 h-full border-l border-black transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(100, (entity.dryWasteKg / (totalKg || 1)) * 100)}%` }} 
                        title={`Recyclables: ${entity.dryWasteKg}kg`}
                      />
                      <div 
                        className="bg-[#7C3AED] h-full border-l border-black transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(100, (entity.eWasteKg / (totalKg || 1)) * 100)}%` }} 
                        title={`E-waste: ${entity.eWasteKg}kg`}
                      />
                      <div 
                        className="bg-[#F43F5E] h-full border-l border-black transition-all duration-700 ease-out" 
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

          <div className="pt-2 border-t-2 border-black text-center text-[10px] text-zinc-650 font-black uppercase">
            🤝 Real-time updates verified with multi-user validation tags.
          </div>
        </div>

      </div>

      {/* 30-Day Historical Waste Management Trends Line Chart */}
      <div className="bg-white border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#7C3AED]" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">📈 30-Day Waste Management Trends</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-550">Daily volume metrics tracking wet and dry recyclable material extraction over the last 30 days.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-zinc-700 bg-amber-100 px-3 py-1.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <TrendingUp className="h-4 w-4 text-[#F59E0B]" />
            <span>Diligence Ratio: 94.5%</span>
          </div>
        </div>

        <div className="h-[280px] w-full border-4 border-black rounded-2xl bg-[#FAF8F2]/30 p-2 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={generateHistoricalTrendData()}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }} 
                stroke="#000"
                strokeWidth={2}
              />
              <YAxis 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }}
                stroke="#000"
                strokeWidth={2}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: '#FAF8F2',
                  border: '3px solid #000',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                }}
              />
              <RechartsLegend 
                wrapperStyle={{
                  fontSize: '10px',
                  fontWeight: 'black',
                  textTransform: 'uppercase',
                  paddingTop: '10px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Wet Waste (Kg)" 
                stroke="#F59E0B" // amber-500
                strokeWidth={3} 
                activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} 
                dot={{ stroke: '#000', strokeWidth: 1.5, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Dry Recyclables (Kg)" 
                stroke="#0EA5E9" // sky-500
                strokeWidth={3} 
                activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }}
                dot={{ stroke: '#000', strokeWidth: 1.5, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📈 Weekly Landfill Diversion Trends (Recharts) */}
      <div className="bg-white border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <FlameKindling className="h-6 w-6 text-emerald-600 animate-pulse" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">♻️ Weekly Landfill Diversion Trends</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-550">Historical weekly audit of total garbage weight successfully diverted from landfills into circular economy channels.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white bg-emerald-600 px-3 py-1.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-4 w-4 text-yellow-300 animate-spin" />
            <span>Target Achieved: 98.2%</span>
          </div>
        </div>

        <div className="h-[280px] w-full border-4 border-black rounded-2xl bg-[#FAF8F2]/30 p-2 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={generateWeeklyLandfillDivertedData()}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }} 
                stroke="#000"
                strokeWidth={2}
              />
              <YAxis 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }}
                stroke="#000"
                strokeWidth={2}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: '#FAF8F2',
                  border: '3px solid #000',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                }}
              />
              <RechartsLegend 
                wrapperStyle={{
                  fontSize: '10px',
                  fontWeight: 'black',
                  textTransform: 'uppercase',
                  paddingTop: '10px'
                }}
              />
              <Bar 
                dataKey="Diverted (Kg)" 
                fill="#10B981" // emerald-500
                stroke="#000"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="Landfill Goal (Kg)" 
                fill="#8B5CF6" // violet-500
                stroke="#000"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📈 7-Day Daily Waste Reduction Progress Time-Series Trend Line Chart */}
      <div className="bg-white border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600 animate-pulse" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">📈 Daily Waste Reduction Progress (7-Day Trend)</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-550">
                Time-series tracking of daily materials diverted from landfills, split by organics and recyclable recovery rates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white bg-emerald-600 px-3 py-1.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-4 w-4 text-yellow-300 animate-spin" />
            <span>Recharts Live Tracker</span>
          </div>
        </div>

        {/* Quick Summary Widgets for 7-Day Trend */}
        {(() => {
          const sevenDayData = generate7DayWasteReductionData();
          const totalReduced = sevenDayData.reduce((acc, curr) => acc + curr['Daily Reduction (Kg)'], 0);
          const avgReduced = Number((totalReduced / 7).toFixed(1));
          const peakDay = [...sevenDayData].sort((a, b) => b['Daily Reduction (Kg)'] - a['Daily Reduction (Kg)'])[0];

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[9px] font-black text-emerald-950 uppercase block">7-Day Cumulative Savings</span>
                <p className="text-xl font-black text-black">{totalReduced} Kg</p>
                <span className="text-[9px] font-bold text-zinc-500 block">Diverted from municipal landfills</span>
              </div>
              <div className="p-3 bg-amber-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[9px] font-black text-amber-950 uppercase block">Daily Reduction Mean</span>
                <p className="text-xl font-black text-black">{avgReduced} Kg / day</p>
                <span className="text-[9px] font-bold text-zinc-500 block">7-day rolling performance</span>
              </div>
              <div className="p-3 bg-indigo-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[9px] font-black text-indigo-950 uppercase block">Weekly Peak Performance</span>
                <p className="text-xl font-black text-black">{peakDay['Daily Reduction (Kg)']} Kg</p>
                <span className="text-[9px] font-bold text-zinc-500 block">Logged on {peakDay.dateStr}</span>
              </div>
            </div>
          );
        })()}

        {/* The Time-Series Trend Line Chart */}
        <div className="h-[280px] w-full border-4 border-black rounded-2xl bg-[#FAF8F2]/30 p-2 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={generate7DayWasteReductionData()}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="dateStr" 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }} 
                stroke="#000"
                strokeWidth={2}
              />
              <YAxis 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }}
                stroke="#000"
                strokeWidth={2}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: '#FAF8F2',
                  border: '3px solid #000',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                }}
              />
              <RechartsLegend 
                wrapperStyle={{
                  fontSize: '10px',
                  fontWeight: 'black',
                  textTransform: 'uppercase',
                  paddingTop: '10px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Organic Composted (Kg)" 
                stroke="#F59E0B" // amber
                strokeWidth={3}
                dot={{ stroke: '#000', strokeWidth: 1.5, r: 3.5 }}
                activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Recyclables Recovered (Kg)" 
                stroke="#0EA5E9" // sky-blue
                strokeWidth={3}
                dot={{ stroke: '#000', strokeWidth: 1.5, r: 3.5 }}
                activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Daily Reduction (Kg)" 
                stroke="#10B981" // emerald
                strokeWidth={5} 
                activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }}
                dot={{ stroke: '#000', strokeWidth: 2, r: 4.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📊 7-Day Moving Average & Diverted Deviation Analysis */}
      <div className="bg-white border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-600 animate-pulse" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">♻️ Waste Diverted 7-Day Moving Average</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-550">
                Calculates a running 7-day average of successfully diverted materials, tracking real-time growth patterns and sudden daily anomalies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white bg-purple-600 px-3 py-1.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-4 w-4 text-yellow-300 animate-spin" />
            <span>7D Moving Average Tracker</span>
          </div>
        </div>

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(() => {
            const data = generateDivertedMovingAverageData();
            if (data.length === 0) return null;
            const latest = data[data.length - 1];
            const previous = data[data.length - 2] || latest;
            const avgVal = latest['7-Day Moving Avg (Kg)'];
            const dailyVal = latest['Daily Diverted (Kg)'];
            const devVal = latest['Deviation (%)'];
            const growthRate = previous['7-Day Moving Avg (Kg)'] > 0 
              ? Number((((latest['7-Day Moving Avg (Kg)'] - previous['7-Day Moving Avg (Kg)']) / previous['7-Day Moving Avg (Kg)']) * 100).toFixed(1)) 
              : 0;

            return (
              <>
                <div className="p-3 bg-purple-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[9px] font-black text-purple-900 uppercase block">Current Moving Avg</span>
                  <p className="text-xl font-black text-black">{avgVal} Kg</p>
                  <span className="text-[9px] font-bold text-zinc-500 block">Rolling 7-day mean</span>
                </div>
                <div className="p-3 bg-emerald-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[9px] font-black text-emerald-900 uppercase block">Deviation Profile</span>
                  <p className="text-xl font-black text-black">
                    {devVal >= 0 ? `+${devVal}%` : `${devVal}%`}
                  </p>
                  <span className={`text-[9px] font-black uppercase flex items-center gap-0.5 ${devVal >= 0 ? 'text-emerald-700' : 'text-rose-650'}`}>
                    {devVal >= 0 ? '🚀 Above Average (Surge)' : '⚠️ Below Average (Lag)'}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[9px] font-black text-indigo-900 uppercase block">7D Growth Trend</span>
                  <p className="text-xl font-black text-black">
                    {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`}
                  </p>
                  <span className="text-[9px] font-bold text-zinc-500 block">Week-over-week momentum</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* The Moving Average & Daily Diverted Chart */}
        <div className="h-[280px] w-full border-4 border-black rounded-2xl bg-[#FAF8F2]/30 p-2 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={generateDivertedMovingAverageData()}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }} 
                stroke="#000"
                strokeWidth={2}
              />
              <YAxis 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }}
                stroke="#000"
                strokeWidth={2}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: '#FAF8F2',
                  border: '3px solid #000',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                }}
              />
              <RechartsLegend 
                wrapperStyle={{
                  fontSize: '10px',
                  fontWeight: 'black',
                  textTransform: 'uppercase',
                  paddingTop: '10px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Daily Diverted (Kg)" 
                stroke="#34D399" // light emerald-400
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={{ stroke: '#000', strokeWidth: 1, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="7-Day Moving Avg (Kg)" 
                stroke="#8B5CF6" // purple-500
                strokeWidth={4} 
                activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }}
                dot={{ stroke: '#000', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* D3 Monthly Waste Reduction Trends Chart */}
      <div className="bg-white vibrant-border p-4 sm:p-6 rounded-3xl vibrant-shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 animate-pulse" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">📊 Monthly Waste Reduction Trends (D3.js)</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-550">D3-rendered monthly reduction metrics mapping trash diversion (Kg) against efficiency rate (%) over the last 6 months.</p>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase text-zinc-500 bg-[#FAF8F2] border border-black/10 px-2.5 py-1 rounded">
            Live D3 Engine
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3 border-4 border-black rounded-2xl bg-[#FAF8F2]/30 p-2 sm:p-4 overflow-hidden relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-full h-full flex justify-center items-center">
              <svg 
                ref={d3MonthlyChartRef} 
                className="w-full h-auto max-h-[280px] select-none" 
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-3 bg-[#FAF8F2] border-2 border-black p-4 rounded-2xl h-full flex flex-col justify-center">
            <h4 className="text-xs font-black uppercase text-black flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              Chart Insights
            </h4>
            <p className="text-[11.5px] font-bold text-zinc-650 leading-relaxed">
              This chart showcases a dynamic D3 visualization where vertical columns denote **Waste Diverted/Reduced** (recycled or composted in Kg, left axis) and the green trendline maps the **Overall Efficiency Rate** (percentage, right axis).
            </p>
            <div className="pt-2 border-t border-black/10 text-[10px] space-y-1.5 font-bold uppercase text-zinc-600">
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-black bg-blue-500 inline-block shrink-0"></span>
                <span>Diverted Waste (Kg)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-black bg-emerald-500 inline-block shrink-0"></span>
                <span>Efficiency Rate (%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* D3 heatmap and localized hotspots visualizer */}
      <div className="bg-white vibrant-border p-4 sm:p-6 rounded-3xl vibrant-shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-md sm:text-lg font-black uppercase tracking-tight text-black">🗺️ Live Hotspot Density Heatmap</h3>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-550">Interactive spatial grid representing localized civic activity thresholds with D3.js.</p>
            </div>
          </div>

          <div className="flex gap-2 bg-zinc-100 p-1 border-2 border-black rounded-xl">
            <button
              onClick={() => setHeatmapView('donation')}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer ${
                heatmapView === 'donation' 
                  ? 'bg-emerald-600 text-white border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' 
                  : 'text-zinc-650 hover:text-black hover:bg-zinc-200'
              }`}
            >
              Donation Highs
            </button>
            <button
              onClick={() => setHeatmapView('waste')}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer ${
                heatmapView === 'waste' 
                  ? 'bg-[#F43F5E] text-white border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' 
                  : 'text-zinc-650 hover:text-black hover:bg-zinc-200'
              }`}
            >
              Waste Hotspots
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3 border-4 border-black rounded-2xl bg-amber-50/10 p-2 sm:p-4 overflow-hidden relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-full h-full flex justify-center items-center">
              <svg 
                ref={d3ContainerRef} 
                className="w-full h-auto max-h-[300px] select-none" 
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-3 bg-[#FAF8F2] border-2 border-black p-4 rounded-2xl h-full flex flex-col justify-center">
            <h4 className="text-xs font-black uppercase text-black flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              Grid Coordinates
            </h4>
            <p className="text-[11.5px] font-bold text-zinc-650 leading-relaxed">
              Hover over any cell in the 10x5 D3 activity coordinate grid to inspect high-fidelity telemetry metrics dynamically computed from bins sensor updates.
            </p>
            <div className="pt-2 border-t border-black/10 text-[10px] space-y-1.5 font-bold uppercase text-zinc-600">
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-black bg-emerald-600 inline-block shrink-0"></span>
                <span>Deep green = 90%+ Donors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-black bg-rose-500 inline-block shrink-0"></span>
                <span>Deep red = 90%+ Waste Hotspots</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
