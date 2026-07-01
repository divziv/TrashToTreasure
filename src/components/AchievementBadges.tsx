import React from 'react';
import { Award, Sparkles, ShieldCheck, Heart, Zap } from 'lucide-react';

interface LedgerItem {
  id: string;
  date: string;
  title: string;
  category: string;
  co2SavedKg: number;
  pointsEarned: number;
}

interface AchievementBadgesProps {
  ledger: LedgerItem[];
  ecoStreak: number;
  resolvedComplaintsCount: number;
  totalXP: number;
  level: number;
  levelTitle: string;
  progressPercent: number;
  nextThreshold: number;
}

export default function AchievementBadges({
  ledger,
  ecoStreak,
  resolvedComplaintsCount,
  totalXP,
  level,
  levelTitle,
  progressPercent,
  nextThreshold
}: AchievementBadgesProps) {
  
  const totalCO2 = parseFloat(ledger.reduce((acc, curr) => acc + curr.co2SavedKg, 0).toFixed(1));

  const badgesList = [
    {
      id: 'carbon_crusher',
      name: 'Carbon Crusher',
      desc: 'Mitigate > 10 Kg of carbon output',
      icon: '🌿',
      unlocked: totalCO2 > 10,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-950'
    },
    {
      id: 'literary_angel',
      name: 'Literary Angel',
      desc: 'Donate educational books to local libraries',
      icon: '📖',
      unlocked: ledger.some(item => item.category.toLowerCase().includes('book')),
      color: 'border-cyan-500 bg-cyan-50 text-cyan-950'
    },
    {
      id: 'thread_spinner',
      name: 'Thread Spinner',
      desc: 'Donate clothes to prevent textile dumps',
      icon: '👕',
      unlocked: ledger.some(item => item.category.toLowerCase().includes('cloth')),
      color: 'border-pink-500 bg-pink-50 text-pink-950'
    },
    {
      id: 'pantry_guard',
      name: 'Pantry Guard',
      desc: 'Supply organic dry food kits to communities',
      icon: '🍎',
      unlocked: ledger.some(item => item.category.toLowerCase().includes('food')),
      color: 'border-amber-500 bg-amber-50 text-amber-950'
    },
    {
      id: 'circuit_saver',
      name: 'Circuit Saver',
      desc: 'Securely recycle electronics items',
      icon: '🔋',
      unlocked: ledger.some(item => item.category.toLowerCase().includes('electron') || item.category.toLowerCase().includes('disposal')),
      color: 'border-teal-500 bg-teal-50 text-teal-950'
    },
    {
      id: 'recycle_rookie',
      name: 'Recycle Rookie',
      desc: 'Make at least 1 successful donation',
      icon: '🥚',
      unlocked: ledger.length >= 1,
      color: 'border-orange-400 bg-orange-50 text-orange-950'
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      desc: 'Complete 5 or more successful donations!',
      icon: '⚔️',
      unlocked: ledger.length >= 5,
      color: 'border-purple-500 bg-purple-50 text-purple-900 font-extrabold'
    },
    {
      id: 'master_recycler',
      name: 'Master Recycler',
      desc: 'Complete 3 or more daily eco-activity logs',
      icon: '♻️',
      unlocked: ecoStreak >= 3,
      color: 'border-emerald-600 bg-emerald-100 text-emerald-950 font-extrabold'
    },
    {
      id: 'civic_sentinel',
      name: 'Civic Sentinel',
      desc: 'Lodge complaints or issues to clean up public zones',
      icon: '🛡️',
      unlocked: resolvedComplaintsCount >= 1,
      color: 'border-blue-500 bg-blue-50 text-blue-900 font-extrabold'
    }
  ];

  const unlockedCount = badgesList.filter(b => b.unlocked).length;

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Level and XP Section */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <span className="bg-black text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
            Society Eco-Impact Credentials
          </span>
          <h3 className="text-xl font-black text-black uppercase tracking-tight pt-1 flex items-center gap-1.5">
            <Award className="h-5.5 w-5.5 text-amber-500 animate-bounce" />
            Community Hero Profile
          </h3>
          <p className="text-xs font-bold text-zinc-500">Every donation, resolved complaint, and activity log builds your public green profile.</p>
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

        {/* Stats Summary Widget */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-blue-50 border-2 border-black rounded-xl">
            <span className="text-[9px] font-black text-blue-900 uppercase block">Spit/Spill Reports</span>
            <p className="text-lg font-black text-black">{resolvedComplaintsCount} Resolved</p>
          </div>
          <div className="p-3 bg-purple-50 border-2 border-black rounded-xl">
            <span className="text-[9px] font-black text-purple-900 uppercase block">Carbon Saved</span>
            <p className="text-lg font-black text-black">{totalCO2} Kg CO2</p>
          </div>
        </div>
      </div>

      {/* Badges Earned Section */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1">
              🏅 Achievement Badges ({unlockedCount} / {badgesList.length})
            </h4>
            <p className="text-[11px] font-bold text-zinc-500">Earn digital medals by contributing dry goods, organizing floor waste, or reporting zone spillages.</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-black uppercase bg-[#7C3AED] text-white border-2 border-black px-2 py-1 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
              ECO LEVEL {level}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {badgesList.map(badge => (
            <div 
              key={badge.id}
              className={`p-2.5 rounded-xl border-2 transition-all relative group flex flex-col items-center text-center justify-center space-y-1 h-[105px] ${
                badge.unlocked 
                  ? `${badge.color} border-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:scale-105` 
                  : 'border-zinc-200 bg-zinc-50 opacity-40 grayscale cursor-not-allowed'
              }`}
            >
              <span className="text-2xl" role="img" aria-label={badge.name}>
                {badge.icon}
              </span>
              <span className="text-[10px] font-black text-black uppercase tracking-tight block">
                {badge.name}
              </span>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                badge.unlocked 
                  ? 'bg-black text-white border-black' 
                  : 'bg-zinc-200 text-zinc-500 border-zinc-300'
              }`}>
                {badge.unlocked ? '🏆 Active' : 'Locked'}
              </span>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-950 text-white text-[9.5px] py-1.5 px-2.5 rounded-xl border-2 border-black font-bold w-44 z-30 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center leading-snug">
                <span className="block text-[8px] uppercase tracking-wider text-yellow-300 mb-0.5">Stewardship Requirement</span>
                {badge.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
