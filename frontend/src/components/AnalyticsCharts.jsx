import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AnalyticsCharts({ weeklyData, fakeCount, realCount }) {
  // Pie chart data
  const pieData = [
    { name: 'Synthetic / Fake', value: fakeCount, color: '#FF007F' },
    { name: 'Organic / Real', value: realCount, color: '#00F2FE' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* 1. Stacked Area Chart (Weekly Scans) - Spans 2 columns */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h3 className="font-orbitron font-semibold text-white tracking-wide">
              Weekly Detection Volumes
            </h3>
            <span className="text-xs text-gray-400 mt-0.5">
              Breakdown of organic vs. synthetic media scanned over the past 7 days.
            </span>
          </div>
          <span className="text-[10px] font-orbitron bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan px-2 py-0.5 rounded font-semibold uppercase animate-pulse">
            LIVE FEED
          </span>
        </div>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" h="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF007F" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#FF007F" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#0D121E', 
                  border: '1px solid rgba(0, 242, 254, 0.25)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '12px'
                }} 
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontFamily: 'Orbitron, sans-serif' }}
              />
              <Area 
                name="Organic (Real)"
                type="monotone" 
                dataKey="real" 
                stroke="#00F2FE" 
                fillOpacity={1} 
                fill="url(#colorReal)" 
                strokeWidth={2}
              />
              <Area 
                name="AI Deepfake (Fake)"
                type="monotone" 
                dataKey="fake" 
                stroke="#FF007F" 
                fillOpacity={1} 
                fill="url(#colorFake)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Donut Pie Chart (Distribution Profile) - Spans 1 column */}
      <div className="lg:col-span-1 glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
        <div className="flex flex-col mb-4">
          <h3 className="font-orbitron font-semibold text-white tracking-wide">
            Distribution Spectrum
          </h3>
          <span className="text-xs text-gray-400 mt-0.5">
            Total ratio of real vs synthetic image outcomes.
          </span>
        </div>

        <div className="w-full h-[200px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" h="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#0D121E', 
                  border: '1px solid rgba(0, 242, 254, 0.25)', 
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered KPI */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-orbitron font-black text-2xl text-white tracking-wide">
              {Math.round((fakeCount / (fakeCount + realCount || 1)) * 100)}%
            </span>
            <span className="text-[9px] text-cyber-red font-orbitron font-bold uppercase tracking-wider mt-0.5 animate-pulse">
              FAKE RATIO
            </span>
          </div>
        </div>

        {/* Legend listing */}
        <div className="space-y-2 mt-4">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 font-medium">{item.name}</span>
              </div>
              <span className="font-bold text-white font-orbitron">
                {item.value} ({Math.round((item.value / (fakeCount + realCount || 1)) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
