import React from 'react';
import { AlertCircle, ShieldCheck, ShieldAlert, Cpu, Award, Zap, ChevronRight, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultView({ result, originalImage, onReset }) {
  if (!result) return null;

  const { classification, confidence, risk_level, processing_time, forensic_risk_score, details } = result;
  const isFake = classification === 'FAKE' || classification === 'AI_GENERATED';
  
  // Custom theme colors for final report
  const themeColorClass = isFake ? 'text-cyber-red' : 'text-cyber-green';
  const themeBgClass = isFake ? 'bg-cyber-red/10 border-cyber-red/20' : 'bg-cyber-green/10 border-cyber-green/20';
  const themeGlowClass = isFake ? 'shadow-neon-red' : 'shadow-neon-green';
  const themeBorderClass = isFake ? 'border-cyber-red/35' : 'border-cyber-green/35';

  // SVG Gauge calculations
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* 1. Header Banner: High-impact Summary Card */}
      <div className={`w-full p-6 rounded-2xl border ${themeBgClass} ${themeGlowClass} transition-all flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-white/5 border border-white/10">
            {isFake ? (
              <ShieldAlert className="w-12 h-12 text-cyber-red filter drop-shadow-[0_0_8px_rgba(255,0,127,0.5)] animate-pulse" />
            ) : (
              <ShieldCheck className="w-12 h-12 text-cyber-green filter drop-shadow-[0_0_8px_rgba(0,255,135,0.5)]" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-orbitron tracking-wider text-gray-400 font-semibold uppercase">
              SCAN COMPLETED STATUS
            </span>
            <h2 className="text-2xl font-orbitron font-black text-white mt-0.5 tracking-wider">
              VERDICT: <span className={themeColorClass}>{classification}</span>
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-md leading-relaxed">
              {isFake 
                ? "This media contains highly suspicious patterns indicating AI generation, deepfake manipulation, or localized composition splicing." 
                : "No synthetic artifacts detected. The image exhibits organic textures, uniform JPEG ELA baselines, and organic noise distribution."}
            </p>
          </div>
        </div>

        {/* Circular Dial score */}
        <div className="flex items-center space-x-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-white/5"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="56"
                cy="56"
                r={radius}
                className={isFake ? "stroke-cyber-red" : "stroke-cyber-green"}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-orbitron font-black text-xl text-white tracking-tighter">
                {confidence}%
              </span>
              <span className="text-[9px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
                CONFIDENCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Area: Main Scan details & Forensics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Thumbnail Preview with Sweeping Scan overlay */}
        <div className="md:col-span-1 glass-panel rounded-2xl p-5 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
          <div className="absolute top-3 left-3 bg-cyber-bg/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-orbitron tracking-wider text-gray-400">
            PREVIEW TARGET
          </div>
          <div className="w-full h-full min-h-[220px] max-h-[300px] overflow-hidden rounded-xl bg-black/40 border border-white/5 relative flex items-center justify-center">
            <img
              src={originalImage}
              alt="Scan specimen"
              className="w-full h-full object-contain max-h-[260px] rounded-lg"
            />
            {/* Ambient scan overlays */}
            <div className="absolute inset-0 bg-cyber-cyan/5 scan-overlay pointer-events-none">
              <div className="w-full h-[2px] bg-cyber-cyan shadow-[0_0_8px_#00F2FE] absolute animate-scan"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Scientific Digital Forensic Breakdown Cards */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          
          {/* Card 1: Error Level Analysis (ELA) */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-cyber-cyan/20 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-orbitron font-semibold text-cyber-cyan tracking-wider uppercase">
                  ERROR LEVEL ANALYSIS (ELA)
                </span>
                <span className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Measures localized pixel compression differences. Manipulated areas save with irregular spikes.
                </span>
              </div>
              <span className={`font-orbitron font-bold text-lg px-2.5 py-0.5 rounded ${
                details.forensics.ela.score > 35 ? 'text-cyber-red bg-cyber-red/10 border border-cyber-red/20' : 'text-cyber-green bg-cyber-green/10 border border-cyber-green/20'
              }`}>
                {details.forensics.ela.score}%
              </span>
            </div>
            
            {/* Regional breakdown indicators */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {details.forensics.ela.regions && details.forensics.ela.regions.map((reg) => (
                <div key={reg.region} className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-medium text-center truncate w-full">{reg.region}</span>
                  <span className={`text-xs font-bold font-orbitron mt-1 ${
                    reg.score > 35 ? 'text-cyber-red' : reg.score > 15 ? 'text-cyber-yellow' : 'text-cyber-cyan'
                  }`}>{Math.round(reg.score)}%</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-gray-300 mt-3 flex items-center space-x-1.5 p-2 rounded bg-white/5 border border-white/5">
              <AlertCircle className="w-3.5 h-3.5 text-cyber-cyan flex-shrink-0" />
              <span className="truncate"><strong>Diagnostics:</strong> {details.forensics.ela.verdict}</span>
            </div>
          </div>

          {/* Card 2: Frequency FFT Analysis */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-cyber-purple/20 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-orbitron font-semibold text-cyber-purple tracking-wider uppercase">
                  FREQUENCY-DOMAIN ANOMALY SCANS (FFT)
                </span>
                <span className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Evaluates Fast Fourier Transform coefficients to spot synthetic generative mesh frequencies.
                </span>
              </div>
              <span className={`font-orbitron font-bold text-lg px-2.5 py-0.5 rounded ${
                details.forensics.fft.score > 40 ? 'text-cyber-red bg-cyber-red/10 border border-cyber-red/20' : 'text-cyber-green bg-cyber-green/10 border border-cyber-green/20'
              }`}>
                {details.forensics.fft.score}%
              </span>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
              <span>Overall Noise Profile Density: <strong>{details.forensics.fft.noise_level} db</strong></span>
              <span className={`font-semibold ${details.forensics.fft.score > 40 ? 'text-cyber-red' : 'text-cyber-cyan'}`}>
                {details.forensics.fft.score > 40 ? 'Abnormal Grids' : 'Organic Spectrum'}
              </span>
            </div>
            <div className="text-[11px] text-gray-300 mt-3 flex items-center space-x-1.5 p-2 rounded bg-white/5 border border-white/5">
              <AlertCircle className="w-3.5 h-3.5 text-cyber-purple flex-shrink-0" />
              <span className="truncate"><strong>Diagnostics:</strong> {details.forensics.fft.verdict}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Row: Performance Cards & CTA controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Performance metrics 1 */}
        <div className="bg-cyber-card border border-white/5 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20">
            <Cpu className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-orbitron uppercase">AI MODEL ENGINE</span>
            <span className="text-xs font-semibold text-white truncate max-w-[140px]" title={details.model_engine.engine}>
              {details.model_engine.engine}
            </span>
          </div>
        </div>

        {/* Performance metrics 2 */}
        <div className="bg-cyber-card border border-white/5 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20">
            <Zap className="w-5 h-5 text-cyber-purple" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-orbitron uppercase">INFERENCE TIME</span>
            <span className="text-xs font-semibold text-white">
              {processing_time} Seconds
            </span>
          </div>
        </div>

        {/* Performance metrics 3 */}
        <div className="bg-cyber-card border border-white/5 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyber-yellow/10 border border-cyber-yellow/20">
            <Award className="w-5 h-5 text-cyber-yellow" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-orbitron uppercase">RISK EVALUATION</span>
            <span className={`text-xs font-bold ${
              risk_level === 'CRITICAL' || risk_level === 'HIGH' ? 'text-cyber-red animate-pulse' : risk_level === 'MEDIUM' ? 'text-cyber-yellow' : 'text-cyber-green'
            }`}>
              {risk_level} LEVEL
            </span>
          </div>
        </div>

        {/* Performance metrics 4: Combined forensic index */}
        <div className="bg-cyber-card border border-white/5 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20">
            <BarChart2 className="w-5 h-5 text-cyber-blue" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-orbitron uppercase">FORENSIC RISK INDEX</span>
            <span className="text-xs font-bold text-white">
              {forensic_risk_score}/100
            </span>
          </div>
        </div>

      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-8 py-3 rounded-lg font-orbitron font-semibold tracking-wide text-cyber-bg bg-cyber-cyan hover:shadow-neon-cyan hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          Scan Another Image
        </button>
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto px-8 py-3 rounded-lg font-orbitron font-semibold tracking-wide text-white border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          Export Report Log
        </button>
      </div>

    </motion.div>
  );
}
