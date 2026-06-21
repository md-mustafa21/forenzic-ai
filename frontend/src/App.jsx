import React, { useState, useEffect } from 'react';
import { 
  Shield, Cpu, Zap, Activity, Info, LogOut, Award, BarChart3, Database, 
  Layers, Users, Lock, Mail, User, Eye, EyeOff, AlertTriangle, 
  CheckCircle2, AlertCircle, Clock, FileText, ChevronRight, Sparkles,
  TrendingUp, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import custom components
import Navbar from './components/Navbar';
import ScanDropzone from './components/ScanDropzone';
import ResultView from './components/ResultView';
import AnalyticsCharts from './components/AnalyticsCharts';

// Import API services
import { apiService } from './services/api';

export default function App() {
  // Navigation & Page State
  const [activePage, setActivePage] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme state
// Theme state
const [theme, setTheme] = useState('dark');

const textPrimary =
  theme === "dark" ? "text-white" : "text-slate-900";

const textSecondary =
  theme === "dark" ? "text-gray-400" : "text-slate-600";

const cardText =
  theme === "dark" ? "text-gray-300" : "text-slate-700";
  
  // Authentication State
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  // Dashboard & Metrics State
  const [dashboardStats, setDashboardStats] = useState({
    total_scans: 248,
    fake_scans: 142,
    real_scans: 106,
    fake_percentage: 57.3,
    real_percentage: 42.7,
    avg_accuracy: 94.6,
    avg_latency: 0.185,
    weekly_timeline: []
  });
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('ALL'); // ALL, FAKE, REAL

  // Toast Alerts State
  const [toasts, setToasts] = useState([]);

  // Seeding theme on mount
  useEffect(() => {
    const localTheme = localStorage.getItem('forenzic-theme') || 'dark';
    setTheme(localTheme);
    if (localTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Try to load saved user session
    const savedUser = localStorage.getItem('forenzic-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load initial stats & history logs
    fetchDashboardMetrics();
  }, []);

  // Sync theme changes
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('forenzic-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      addToast("Dark forensic layout activated", "info");
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      addToast("Light operational layout activated", "info");
    }
  };

  // Toast notifications helpers
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch metrics from API or fallback
  const fetchDashboardMetrics = async () => {
    try {
      const stats = await apiService.getStats();
      const history = await apiService.getHistory();
      setDashboardStats(stats);
      setScanHistory(history);
    } catch (e) {
      console.error("Dashboard fetch failed", e);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const resp = await apiService.login(authEmail, authPassword);
      setUser(resp);
      localStorage.setItem('forenzic-user', JSON.stringify(resp));
      addToast(`Access granted. Welcome back, ${resp.name}!`, 'success');
      setActivePage('detection');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message || "Failed to authenticate.");
      addToast("Access Denied: Invalid parameters", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const resp = await apiService.signup(authName, authEmail, authPassword);
      setUser(resp);
      localStorage.setItem('forenzic-user', JSON.stringify(resp));
      addToast("Registration complete! Operational tier verified.", "success");
      setActivePage('detection');
      setAuthPassword('');
      setAuthName('');
    } catch (err) {
      setAuthError(err.message || "Failed to register.");
      addToast("Registration failed: Invalid parameters", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('forenzic-user');
    addToast("Session terminated securely.", "info");
    setActivePage('landing');
  };

  // Triggering the scanning process
  const triggerImageScan = async (file, preview) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setScanResult(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(preview);
    setIsScanning(true);
    setScanProgress(0);
    setScanStage('Initializing dual ML-Forensics pipeline...');

    addToast(`Ingesting specimen: ${file.name}`, 'info');

    // Simulate highly futuristic progress ticks representing active calculations
    const stages = [
      { progress: 15, msg: "Decoding raw image structure and dimensions..." },
      { progress: 38, msg: "Loading Hugging Face model (ViT pipeline)..." },
      { progress: 62, msg: "Performing Fast Fourier Transform (FFT) spatial checks..." },
      { progress: 85, msg: "Computing Error Level Analysis (ELA) compression profiles..." },
      { progress: 95, msg: "Synthesizing deep learning predictions and CV indices..." }
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setScanProgress(Math.min(currentProgress, 99));

      const activeStage = stages.find(s => currentProgress >= s.progress);
      if (activeStage) {
        setScanStage(activeStage.msg);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 40);

    try {
      // Execute standard predict API
      const result = await apiService.scanImage(file);
      
      // Stop interval and instantly set to completion status
      clearInterval(interval);
      setScanProgress(100);
      setScanStage("Analysis complete! Rendering results.");
      
      setTimeout(() => {
        setScanResult(result);
        setIsScanning(false);
        addToast(`Specimen analysis complete: ${result.classification}`, result.classification === 'FAKE' ? 'error' : 'success');
        
        // Refresh dashboard tables
        fetchDashboardMetrics();
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setIsScanning(false);
      addToast(err.message || "Forensic pipeline failed", "error");
    }
  };

  // Filtered Scan History
  const filteredHistory = scanHistory.filter(item => {
    if (historyFilter === 'ALL') return true;
    if (historyFilter === 'FAKE') {
      return item.classification === 'FAKE' || item.classification === 'AI_GENERATED';
    }
    return item.classification === historyFilter;
  });

  return (
    <div
  className={`min-h-screen transition-all duration-300 font-inter cyber-bg-grid ${
    theme === "dark"
      ? "bg-slate-950 text-gray-200"
      : "bg-slate-100 text-gray-900"
  }`}
>
      
      {/* Decorative Blur Orbs (Dark mode exclusive) */}
      <div className="dark:block hidden">
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>
      </div>

      {/* 1. Header Global Navbar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        theme={theme} 
        toggleTheme={toggleTheme}
        user={user}
        logout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 2. Slide In Micro-Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`p-4 rounded-xl border flex items-center space-x-3 shadow-lg animate-slide-up ${
                toast.type === 'success' 
                  ? `bg-cyber-green/10 border-cyber-green/35 ${textPrimary}` 
                  : toast.type === 'error'
                    ? `bg-cyber-red/10 border-cyber-red/35 ${textPrimary}`
                    : `bg-cyber-cyan/10 border-cyber-cyan/35 ${textPrimary}`
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-cyber-green flex-shrink-0" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-cyber-red flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyber-cyan flex-shrink-0" />}
              <span className="text-xs font-semibold tracking-wide flex-grow">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)} 
                className={`hover:text-white transition-colors text-xs font-bold font-orbitron pl-1 ${textSecondary}`}
              >
                x
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. Global Views / Pages Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* ==================== VIEW 1: HERO LANDING ==================== */}
        {activePage === 'landing' && (
          <div className="space-y-20 pt-4">
            
            {/* Hero Grid Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading tags & CTA */}
              <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
                <div className="inline-flex self-center lg:self-start items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/5 border border-cyber-cyan/15">
                  <Sparkles className="w-4 h-4 text-cyber-cyan animate-pulse" />
                  <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyber-cyan uppercase">
                    NEXT-GEN DIGITAL SPECTRUM FORENSICS
                  </span>
                </div>
                
               <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-orbitron font-black leading-tight tracking-wider ${textPrimary}`}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple glow-text-cyan">
                    Images with Precision
                  </span>
                </h1>
                
                <p className={`text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 ${textSecondary}`}>
                  Defend digital integrity with <strong>Forenzic AI</strong>. Upload standard media structures to trigger dual deep-learning and mathematical-frequency anomaly scanners, mapping spatial structures and compression histories instantly.
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-4">
                  <button
                    onClick={() => setActivePage(user ? 'detection' : 'login')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-orbitron font-bold tracking-wider text-cyber-bg bg-cyber-cyan hover:shadow-neon-cyan hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Try Detection Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActivePage('about')}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-lg font-orbitron font-bold tracking-wider border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer ${textPrimary}`}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              {/* Right Column: Decorative Radar Grid Specimen */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] rounded-full border border-cyber-cyan/15 flex items-center justify-center bg-cyber-card shadow-glass p-8">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyber-cyan/5 animate-radar"></div>
                  
                  {/* Glowing Radar sweeps */}
                  <div className="w-full h-full rounded-full border border-cyber-cyan/10 relative flex items-center justify-center">
                    <div className="absolute w-2 h-2 rounded-full bg-cyber-cyan shadow-neon-cyan animate-ping"></div>
                    <div className="absolute w-[80%] h-[80%] rounded-full border border-cyber-cyan/5"></div>
                    <div className="absolute w-[50%] h-[50%] rounded-full border border-cyber-cyan/5"></div>

                    {/* Centered Specimen scanning target */}
                    <div className="w-32 h-32 rounded-2xl glass-cyber flex flex-col items-center justify-center border border-cyber-cyan/30 shadow-neon-cyan relative overflow-hidden group">
                      <div className="absolute inset-0 bg-cyber-cyan/5 scan-overlay pointer-events-none">
                        <div className="w-full h-[2px] bg-cyber-cyan absolute top-1/2 left-0 shadow-neon-cyan animate-scan"></div>
                      </div>
                      <Shield className="w-10 h-10 text-cyber-cyan filter drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]" />
                      <span className="text-[8px] font-orbitron font-semibold text-cyber-cyan tracking-wider mt-2 animate-pulse">
                        AUDIT SCANNER
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Feature Cards Showcase */}
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className={`font-orbitron font-black text-2xl tracking-wide ${textPrimary}`}>
  Engineered Forensic Analysis Pipelines
</h2>

<p className={`text-xs max-w-lg mx-auto ${textSecondary}`}>
                  Our hybrid scanning systems unite convolutional neural transfer learning networks with classical digital spatial forensic tools.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Cpu className="w-6 h-6 text-cyber-cyan" />,
                    title: "Convolutional Neural Inference",
                    desc: "Leverages a custom MobileNetV2 architecture trained on thousands of real vs. synthesized AI specimen, yielding instantaneous probability weights."
                  },
                  {
                    icon: <Activity className="w-6 h-6 text-cyber-purple" />,
                    title: "Error Level Analysis (ELA)",
                    desc: "Identifies splice borders and localized manipulation by re-saving pixel groups and computing exact visual difference density variances."
                  },
                  {
                    icon: <Layers className="w-6 h-6 text-cyber-green" />,
                    title: "Frequency Spectrum Scans",
                    desc: "Computes 2D Fast Fourier Transforms (FFT) to expose high-frequency repeating lattice structures left by generative model diffusion layers."
                  }
                ].map((feat, index) => (
                  <div key={index} className="glass-cyber glass-cyber-interactive rounded-2xl p-6 flex flex-col space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <h3 className={`font-orbitron font-bold text-base tracking-wide ${textPrimary}`}>{feat.title}</h3>
                    <p className={`text-xs leading-relaxed ${textSecondary}`}>{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

      {/* Statistics Dashboard Banner */}
<div className="glass-cyber rounded-2xl p-8 border border-white/5">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

    {[
      {
        value: "76.7%",
        label: "Validation Accuracy",
        detail: "MobileNetV2 Validation Set"
      },
      {
        value: "~2s",
        label: "Average Scan Time",
        detail: "FastAPI + TensorFlow Engine"
      },
      {
        value: "120K+",
        label: "Training Dataset",
        detail: "Real vs Fake Face Images"
      },
      {
        value: "ELA + FFT",
        label: "Forensic Analysis",
        detail: "Digital Manipulation Detection"
      }
    ].map((stat, idx) => (
      <div
        key={idx}
        className="flex flex-col items-center justify-center space-y-2"
      >
        <span className="text-3xl md:text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-blue">
          {stat.value}
        </span>

        <span className={`text-xs md:text-sm font-semibold font-orbitron tracking-wide ${cardText}`}>
          {stat.label}
        </span>

        <span className="text-[10px] md:text-xs text-gray-500">
          {stat.detail}
        </span>
      </div>
    ))}

  </div>
</div>
            {/* Testimonials block */}
           {/* Key Features */}
<div className="space-y-8">
  <div className="text-center space-y-2">
    <h2 className={`font-orbitron font-black text-2xl tracking-wide ${textPrimary}`}>
      Forenzic AI Key Features
    </h2>
    <p className={`text-xs ${textSecondary}`}>
      AI-powered deepfake detection combined with digital forensic analysis.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    <div className="glass-cyber rounded-2xl p-6">
      <h3 className="text-cyber-cyan font-bold mb-2">
        Deepfake Detection
      </h3>
      <p className={`text-xs ${cardText}`}>
        Detects AI-generated and manipulated images using MobileNetV2 Transfer Learning.
      </p>
    </div>

    <div className="glass-cyber rounded-2xl p-6">
      <h3 className="text-cyber-cyan font-bold mb-2">
        Digital Forensics
      </h3>
      <p className={`text-xs ${cardText}`}>
        Uses Error Level Analysis (ELA) and FFT techniques to identify image manipulation artifacts.
      </p>
    </div>

    <div className="glass-cyber rounded-2xl p-6">
      <h3 className="text-cyber-cyan font-bold mb-2">
        Scan History
      </h3>
      <p className={`text-xs ${cardText}`}>
        Stores previous scan results, confidence scores, and forensic reports for future analysis.
      </p>
    </div>

    <div className="glass-cyber rounded-2xl p-6">
      <h3 className="text-cyber-cyan font-bold mb-2">
        Analytics Dashboard
      </h3>
      <p className={`text-xs ${cardText}`}>
        Provides visual insights into detection statistics and system performance.
      </p>
    </div>

  </div>
</div>
            {/* Cyber Footer Block */}
            <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 text-xs">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cyber-cyan" />
                <span className={`font-orbitron font-bold tracking-wider ${textPrimary}`}>FORENZIC AI</span>
              </div>
              <span>&copy; 2026 Forenzic AI. Advanced Digital Image Forensics Suite. All Rights Reserved.</span>
              <div className="flex space-x-4">
                <a href="#docs" onClick={() => setActivePage('about')} className="hover:text-cyber-cyan transition-colors">Documentation</a>
                <a href="#terminal" onClick={() => setActivePage('detection')} className="hover:text-cyber-cyan transition-colors">Operational Terminal</a>
                <a href="#analytics" onClick={() => setActivePage('dashboard')} className="hover:text-cyber-cyan transition-colors">Analytics Feed</a>
              </div>
            </footer>

          </div>
        )}

        {/* ==================== VIEW 2: AI SCAN DETECTION TERMINAL ==================== */}
        {activePage === 'detection' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-purple/5 border border-cyber-purple/15">
                <Activity className="w-4 h-4 text-cyber-purple animate-pulse" />
                <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyber-purple uppercase">
                  ACTIVE ANALYSIS TERMINAL
                </span>
              </div>
              <h1 className={`text-3xl font-orbitron font-black tracking-wider ${textPrimary}`}>
                Deepfake Forensics Scan specimen
              </h1>
              <p className={`text-xs max-w-md mx-auto ${textSecondary}`}>
                Ingest target image files to verify compression profiles, Edge textures, and frequency grids. Limit 10MB per specimen.
              </p>
            </div>

            {/* Ingest Dropzone interface */}
            {!scanResult && (
              <ScanDropzone 
                onFileSelect={triggerImageScan}
                isScanning={isScanning}
                scanProgress={scanProgress}
              />
            )}

            {/* Forensic Stage text output during active scanning */}
            {isScanning && (
              <div className="glass-cyber rounded-2xl p-5 border border-cyber-cyan/15 max-w-xl mx-auto flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-cyber-cyan/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-cyber-cyan animate-spin"></div>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-orbitron font-semibold text-cyber-cyan tracking-wider uppercase animate-pulse">
                    CURRENT OPERATION
                  </span>
                  <span className={`text-xs ${textPrimary} mt-1 font-mono truncate max-w-[340px]`}>
                    {scanStage}
                  </span>
                </div>
              </div>
            )}

            {/* Results Render Card */}
            {scanResult && (
              <ResultView 
                result={scanResult} 
                originalImage={previewUrl}
                onReset={() => {
                  setScanResult(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              />
            )}
          </div>
        )}

        {/* ==================== VIEW 3: PROFESSIONAL ANALYTICS DASHBOARD ==================== */}
        {activePage === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div className="space-y-1">
                <h1 className={`text-3xl font-orbitron font-black tracking-wider ${textPrimary}`}>
                  Auditing & Analytics Dashboard
                </h1>
                <p className={`text-xs ${textSecondary}`}>
                  Aggregated threat logs, pipeline accuracy profiles, and raw audit histories.
                </p>
              </div>
              <button
                onClick={fetchDashboardMetrics}
                className="self-start sm:self-center px-4 py-2 text-xs font-orbitron font-bold tracking-wider text-cyber-cyan border border-cyber-cyan/25 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/15 hover:shadow-neon-cyan transition-all cursor-pointer"
              >
                Sync Database Logs
              </button>
            </div>

            {/* Global KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { 
                  icon: <Database className="w-5 h-5 text-cyber-cyan" />, 
                  val: dashboardStats.total_scans, 
                  label: "Total Audited Logs" 
                },
                { 
                  icon: <AlertTriangle className="w-5 h-5 text-cyber-red animate-pulse" />, 
                  val: `${dashboardStats.fake_percentage}%`, 
                  label: "Deepfake Ratio" 
                },
                { 
                  icon: <ShieldCheck className="w-5 h-5 text-cyber-green" />, 
                  val: `${dashboardStats.real_percentage}%`, 
                  label: "Organic Ratio" 
                },
                { 
                  icon: <Award className="w-5 h-5 text-cyber-yellow" />, 
                  val: `${dashboardStats.avg_accuracy}%`, 
                  label: "Pipeline Precision" 
                },
                { 
                  icon: <Clock className="w-5 h-5 text-cyber-blue" />, 
                  val: `${dashboardStats.avg_latency}s`, 
                  label: "Average Latency" 
                }
              ].map((kpi, index) => (
                <div key={index} className="glass-cyber rounded-xl p-4 flex items-center space-x-3.5 border border-white/5">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                    {kpi.icon}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-lg font-orbitron font-black tracking-tight truncate ${textPrimary}`}>
                      {kpi.val}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase truncate">
                      {kpi.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recharts Analytics Components */}
            <AnalyticsCharts 
              weeklyData={dashboardStats.weekly_timeline}
              fakeCount={dashboardStats.fake_scans}
              realCount={dashboardStats.real_scans}
            />

            {/* Recent Audit Table Logs */}
            <div className="glass-cyber rounded-2xl p-6 border border-white/5 space-y-6">
              
              {/* Table header controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                  <h3 className={`font-orbitron font-semibold tracking-wide ${textPrimary}`}>
                    Specimen Forensic Ledger
                  </h3>
                  <span className="text-xs text-gray-500">
                    Chronological audit trails for all processed images. Click any row to view ELA and FFT data models.
                  </span>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-white/5 border border-white/5">
                  {['ALL', 'FAKE', 'REAL'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-3 py-1.5 rounded-md font-orbitron text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                        historyFilter === f
                          ? 'text-cyber-bg bg-cyber-cyan shadow-neon-cyan'
                          : `${textSecondary} hover:text-white`
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase">
                      <th className="py-3 px-4">Specimen Preview</th>
                      <th className="py-3 px-4">Filename</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Combined Risk Index</th>
                      <th className="py-3 px-4">Processing speed</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-white/5 text-xs ${cardText}`}>
                    {filteredHistory.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedHistoryItem(item)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-150"
                      >
                        <td className="py-3 px-4">
                          <div className="w-14 h-12 rounded bg-black/35 border border-white/5 overflow-hidden flex items-center justify-center">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                            ) : (
                              <Shield className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                        </td>
                        <td className={`py-3 px-4 font-semibold max-w-[150px] truncate ${textPrimary}`} title={item.filename}>
                          {item.filename}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-orbitron font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wide border ${
                            item.classification === 'FAKE' 
                              ? 'text-cyber-red bg-cyber-red/10 border-cyber-red/20' 
                              : 'text-cyber-green bg-cyber-green/10 border-cyber-green/20'
                          }`}>
                            {item.classification}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-bold font-orbitron ${textPrimary}`}>
                          <div className="flex items-center space-x-2">
                            <span>{item.risk_score}/100</span>
                            <div className="w-16 h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.classification === 'FAKE' ? 'bg-cyber-red' : 'bg-cyber-cyan'}`}
                                style={{ width: `${item.risk_score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 font-medium ${textSecondary}`}>
                          {item.processing_time}s
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono">
                          {item.timestamp}
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-500 font-orbitron font-medium tracking-wide uppercase">
                          No audited logs found matching this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Audit Modal/Detail Panel on click */}
            {selectedHistoryItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
                <div className="w-full max-w-2xl glass-cyber rounded-2xl border border-cyber-cyan/35 shadow-neon-cyan p-6 relative flex flex-col space-y-6">
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedHistoryItem(null)}
                    className={`absolute top-4 right-4 hover:text-white font-orbitron font-bold text-sm cursor-pointer ${textSecondary}`}
                  >
                    x
                  </button>

                  <div className="space-y-1">
                    <span className="text-[10px] font-orbitron font-bold text-cyber-cyan tracking-widest uppercase">
                      SPECIMEN DETAILED LAB REPORT
                    </span>
                    <h3 className={`font-orbitron font-black text-xl truncate max-w-[500px] ${textPrimary}`}>
                      {selectedHistoryItem.filename}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Thumbnail & Classification */}
                    <div className="flex flex-col space-y-4">
                      <div className="w-full h-44 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center relative">
                        {selectedHistoryItem.thumbnail ? (
                          <img src={selectedHistoryItem.thumbnail} alt="Modal detail" className="w-full h-full object-contain" />
                        ) : (
                          <Shield className="w-12 h-12 text-cyber-cyan" />
                        )}
                        <div className="absolute inset-0 bg-cyber-cyan/5 scan-overlay pointer-events-none">
                          <div className="w-full h-[2px] bg-cyber-cyan absolute top-1/2 left-0 shadow-neon-cyan animate-scan"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className={`text-xs font-semibold ${textSecondary}`}>Scan Verdict:</span>
                        <span className={`font-orbitron font-black text-sm ${
                          selectedHistoryItem.classification === 'FAKE' ? 'text-cyber-red' : 'text-cyber-green'
                        }`}>
                          {selectedHistoryItem.classification} ({selectedHistoryItem.confidence}%)
                        </span>
                      </div>
                    </div>

                    {/* Right: Technical diagnostics */}
                    <div className="flex flex-col space-y-3 justify-center">
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] font-orbitron font-bold text-cyber-cyan">ERROR LEVEL ANALYSIS (ELA)</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs font-semibold ${textPrimary}`}>ELA Intensity Index:</span>
                          <span className={`text-xs font-bold font-orbitron ${textPrimary}`}>{selectedHistoryItem.details.forensics.ela.score}%</span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-relaxed ${textSecondary}`}>{selectedHistoryItem.details.forensics.ela.verdict}</p>
                      </div>

                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] font-orbitron font-bold text-cyber-purple">FREQUENCY SPECTRAL ANOMALY (FFT)</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs font-semibold ${textPrimary}`}>FFT Anomaly Index:</span>
                          <span className={`text-xs font-bold font-orbitron ${textPrimary}`}>{selectedHistoryItem.details.forensics.fft.score}%</span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-relaxed ${textSecondary}`}>{selectedHistoryItem.details.forensics.fft.verdict}</p>
                      </div>

                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] font-orbitron font-bold text-cyber-green">EDGE TEXTURE LAPLACIAN SCANS</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs font-semibold ${textPrimary}`}>Texture Sharpness Index:</span>
                          <span className={`text-xs font-bold font-orbitron ${textPrimary}`}>{selectedHistoryItem.details.forensics.texture.score}%</span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-relaxed ${textSecondary}`}>{selectedHistoryItem.details.forensics.texture.verdict}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions inside Modal */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() => setSelectedHistoryItem(null)}
                      className="px-5 py-2 text-xs font-orbitron font-bold border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Exit Report
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="px-5 py-2 text-xs font-orbitron font-bold text-cyber-bg bg-cyber-cyan rounded-lg hover:shadow-neon-cyan transition-all cursor-pointer"
                    >
                      Download PDF Ledger
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== VIEW 4: TECHNOLOGY / ABOUT PAGE ==================== */}
        {activePage === 'about' && (
          <div className="space-y-12 max-w-4xl mx-auto">
            
            {/* Title section */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/5 border border-cyber-cyan/15">
                <Info className="w-4 h-4 text-cyber-cyan animate-pulse" />
                <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyber-cyan uppercase">
                  FORENSIC ARCHITECTURE MANUAL
                </span>
              </div>
              <h1 className={`text-3xl font-orbitron font-black tracking-wider ${textPrimary}`}>
                How Forensic Transfer Learning Works
              </h1>
              <p className={`text-xs max-w-md mx-auto ${textSecondary}`}>
                Explore each scientific algorithm and framework powering the Forenzic AI deep manipulation platform.
              </p>
            </div>

            {/* Core Questions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-cyber rounded-2xl p-6 border border-white/5 space-y-3">
                <h3 className={`font-orbitron font-bold text-sm tracking-wide uppercase text-cyber-cyan ${textPrimary}`}>
                  What are Deepfakes?
                </h3>
                <p className={`text-xs leading-relaxed ${textSecondary}`}>
                  Deepfakes are synthetic media generated using deep generative neural architectures (such as GANs, VAEs, or Latent Diffusion models) that seamlessly splice target features into digital specimens. As generator engines become increasingly refined, identifying these modifications by eye is becoming impossible.
                </p>
              </div>

              <div className="glass-cyber rounded-2xl p-6 border border-white/5 space-y-3">
                <h3 className={`font-orbitron font-bold text-sm tracking-wide uppercase text-cyber-purple ${textPrimary}`}>
                  Why Detection Matters
                </h3>
                <p className={`text-xs leading-relaxed ${textSecondary}`}>
                  Digital forensics defends informational integrity against severe geopolitical manipulation, automated fake identity verification, and deep court splicing. Building scalable, automated ledgers ensures trust across publishing pipelines, legal teams, and social networks.
                </p>
              </div>
            </div>

            {/* Deep technical details on our three algorithms */}
            <div className="glass-cyber rounded-2xl p-6 border border-white/5 space-y-8">
              <h3 className={`font-orbitron font-bold text-base tracking-wide uppercase text-center ${textPrimary}`}>
                Detailed Diagnostic Pipeline
              </h3>

              <div className="space-y-6">
                {[
                  {
                    icon: <Cpu className="w-5 h-5 text-cyber-cyan" />,
                    title: "MobileNetV2 Neural Transfer Learning",
                    desc: "Our primary neural engine loads pre-trained ImageNet parameters and appends a specialized dense classification head. Since MobileNetV2 uses depthwise separable convolutions, it yields exceptional predictive accuracy with miniature computational footprint, letting the platform compile instantaneous class probability weights."
                  },
                  {
                    icon: <Activity className="w-5 h-5 text-cyber-purple" />,
                    title: "Error Level Analysis (ELA)",
                    desc: "Classical digital forensics takes advantage of the fact that JPEGs are saved on a homogeneous compression matrix. When an image is spliced, the manipulated zone undergoes double compression, which generates significant pixel difference density variances when the image is re-saved. ELA highlights these discrepancies as glowing colored noise hotspots."
                  },
                  {
                    icon: <Layers className="w-5 h-5 text-cyber-green" />,
                    title: "2D Fast Fourier Transform (FFT) Analysis",
                    desc: "Generative model layers (GAN scaling layers) leave microscopic, repetitive periodic lattice grids in pixel groups. While these patterns are imperceptible to human eyes, computing a 2D Fourier spatial transform separates the pixel colors into their underlying sine/cosine components. Repeating grids stand out as geometric frequency spikes in the high-frequency outer circular bands."
                  }
                ].map((algo, index) => (
                  <div key={index} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-b-0 last:pb-0">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {algo.icon}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className={`font-orbitron font-bold text-xs tracking-wide ${textPrimary}`}>{algo.title}</span>
                      <span className={`text-[11px] leading-relaxed ${textSecondary}`}>{algo.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Tech Stack Icons */}
            <div className="space-y-4">
              <h3 className={`font-orbitron font-bold text-xs tracking-wider uppercase text-center ${textSecondary}`}>
                ENGINEERED OPERATIONAL STACK
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  "FastAPI Python Core", "TensorFlow 2.x", "Keras Neural Head", 
                  "MobileNetV2 Weights", "OpenCV Imaging", "FFT Anomaly Matrix", 
                  "Error Level Matrix", "React 19.x", "Tailwind CSS v4", "Chart.js/Recharts"
                ].map((tech) => (
                  <span key={tech} className={`px-3.5 py-1.5 text-xs font-orbitron font-semibold bg-white/5 rounded-lg border border-white/5 ${cardText}`}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== VIEW 5: USER LOGIN ==================== */}
        {activePage === 'login' && (
          <div className="max-w-md mx-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-cyber rounded-2xl border border-white/5 p-8 space-y-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyber-cyan/5 scan-overlay pointer-events-none">
                <div className="w-full h-[2px] bg-cyber-cyan/30 absolute top-0 shadow-neon-cyan animate-scan"></div>
              </div>

              <div className="text-center space-y-2 relative z-10">
                <Shield className="w-10 h-10 text-cyber-cyan mx-auto filter drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]" />
                <h2 className={`font-orbitron font-black text-xl tracking-wider ${textPrimary}`}>
                  Access Forensic Terminal
                </h2>
                <p className="text-xs text-gray-500">
                  Authenticate your credentials to sync secure database history logs.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-cyber-red/10 border border-cyber-red/35 rounded-lg flex items-center space-x-2 text-xs text-cyber-red font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <label className={`text-[10px] font-orbitron font-bold tracking-wider ${textSecondary}`}>EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="analyst@forenzic.ai"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-black/40 border border-white/10 text-xs ${textPrimary} focus:border-cyber-cyan/45 focus:outline-none transition-all placeholder-gray-600`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-orbitron font-bold tracking-wider ${textSecondary}`}>PASSWORD CODE</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-lg bg-black/40 border border-white/10 text-xs ${textPrimary} focus:border-cyber-cyan/45 focus:outline-none transition-all placeholder-gray-600`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className={`flex justify-between items-center text-[10px] font-orbitron ${textSecondary}`}>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded bg-black/40 border border-white/10 accent-cyber-cyan" />
                    <span>REMEMBER DEVICE</span>
                  </label>
                  <a href="#reset" className="hover:text-cyber-cyan transition-colors">FORGOT KEY?</a>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-lg bg-cyber-cyan text-cyber-bg font-orbitron font-black text-xs tracking-widest uppercase hover:shadow-neon-cyan hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {authLoading ? "Initializing Core..." : "Initiate Terminal Connection"}
                </button>
              </form>

              <div className={`text-center text-[11px] relative z-10 ${textSecondary}`}>
                New operational investigator?{" "}
                <button 
                  onClick={() => { setActivePage('signup'); setAuthError(''); }} 
                  className="text-cyber-cyan font-bold hover:underline cursor-pointer"
                >
                  Register Operational Account
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* ==================== VIEW 6: USER SIGNUP ==================== */}
        {activePage === 'signup' && (
          <div className="max-w-md mx-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-cyber rounded-2xl border border-white/5 p-8 space-y-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyber-purple/5 scan-overlay pointer-events-none">
                <div className="w-full h-[2px] bg-cyber-purple/30 absolute top-0 shadow-neon-purple animate-scan"></div>
              </div>

              <div className="text-center space-y-2 relative z-10">
                <Shield className="w-10 h-10 text-cyber-purple mx-auto filter drop-shadow-[0_0_8px_rgba(157,78,221,0.4)]" />
                <h2 className={`font-orbitron font-black text-xl tracking-wider ${textPrimary}`}>
                  Register Specimen Account
                </h2>
                <p className="text-xs text-gray-500">
                  Join our decentralized security ledger network to record media scans.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-cyber-red/10 border border-cyber-red/35 rounded-lg flex items-center space-x-2 text-xs text-cyber-red font-semibold animate-shake">
                  <AlertCircle className="w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <label className={`text-[10px] font-orbitron font-bold tracking-wider ${textSecondary}`}>INVESTIGATOR NAME</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Officer Mustafa"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-black/40 border border-white/10 text-xs ${textPrimary} focus:border-cyber-purple/45 focus:outline-none transition-all placeholder-gray-600`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-orbitron font-bold tracking-wider ${textSecondary}`}>EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="analyst@forenzic.ai"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-black/40 border border-white/10 text-xs ${textPrimary} focus:border-cyber-purple/45 focus:outline-none transition-all placeholder-gray-600`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-orbitron font-bold tracking-wider ${textSecondary}`}>SECURE PASSWORD KEY</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min 6 characters"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-lg bg-black/40 border border-white/10 text-xs ${textPrimary} focus:border-cyber-purple/45 focus:outline-none transition-all placeholder-gray-600`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-lg bg-cyber-purple text-white font-orbitron font-black text-xs tracking-widest uppercase hover:shadow-neon-purple hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {authLoading ? "Synchronizing..." : "Establish Specimen Credentials"}
                </button>
              </form>

              <div className={`text-center text-[11px] relative z-10 ${textSecondary}`}>
                Already registered operational credentials?{" "}
                <button 
                  onClick={() => { setActivePage('login'); setAuthError(''); }} 
                  className="text-cyber-purple font-bold hover:underline cursor-pointer"
                >
                  Initiate Secure Sign In
                </button>
              </div>

            </motion.div>
          </div>
        )}

      </main>
    </div>
  );
}
