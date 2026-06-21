import React, { useState, useRef } from 'react';
import { UploadCloud, AlertTriangle, FileImage, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScanDropzone({ onFileSelect, isScanning, scanProgress }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm'
  ];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateAndProcessFile = (file) => {
    setErrorMsg(null);
    if (!file) return;

    // Check File Format
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg("Unsupported file format. Supported: PNG, JPG, WEBP, GIF, MP4, MOV, WEBM");
      return;
    }

    // Check File Size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File too large. Maximum size is 50MB. (Your file: ${(file.size / (1024*1024)).toFixed(2)}MB)`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      onFileSelect(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    onFileSelect(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        id="image-uploader-input"
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp,.bmp,.mp4,.mov,.gif,.webm"
        onChange={handleFileInput}
        disabled={isScanning}
      />

      <AnimatePresence mode="wait">
        {!previewUrl ? (
          // Empty state: Drag and Drop zone
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isScanning && fileInputRef.current.click()}
            className={`w-full p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              dragActive 
                ? 'border-cyber-cyan bg-cyber-cyan/10 scale-[1.02] shadow-neon-cyan' 
                : 'border-white/10 bg-cyber-card hover:border-cyber-cyan/35 hover:bg-cyber-cyan/[0.02]'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-cyber-cyan/5 flex items-center justify-center mb-4 border border-cyber-cyan/15 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-cyber-cyan" />
            </div>
            <h3 className="font-orbitron font-semibold text-lg text-white mb-2 text-center tracking-wide">
              Drag & Drop Image
            </h3>
            <p className="text-sm text-gray-400 text-center mb-4">
              or <span className="text-cyber-cyan font-medium">browse local files</span>
            </p>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {['PNG', 'JPEG', 'WEBP', 'BMP', 'MP4', 'GIF'].map((ext) => (
                <span key={ext} className="px-2.5 py-1 text-[11px] font-orbitron bg-white/5 rounded text-gray-400 border border-white/5 uppercase">
                  {ext}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-4">
              Maximum upload size: {MAX_FILE_SIZE / (1024 * 1024)}MB
            </p>
          </motion.div>
        ) : (
          // Image selected state: preview, progress, scanning visual
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full glass-panel rounded-2xl overflow-hidden p-6 relative flex flex-col items-center"
          >
            {/* Image Preview Container */}
            <div className="w-full max-h-[300px] overflow-hidden rounded-xl bg-black/50 border border-white/5 relative flex items-center justify-center group">
              {selectedFile?.type?.startsWith('video/') ? (
                <video
                  src={previewUrl}
                  className="max-h-[300px] object-contain w-full"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Forensic scan target"
                  className="max-h-[300px] object-contain w-full"
                />
              )}

              {/* Glowing Scan Sweep Line (shows while scanning) */}
              {isScanning && (
                <div className="absolute inset-0 bg-cyber-cyan/5 scan-overlay pointer-events-none">
                  <div className="w-full h-[3px] bg-cyber-cyan shadow-[0_0_15px_#00F2FE] absolute animate-scan"></div>
                </div>
              )}
            </div>

            {/* Scanning Progress Block */}
            {isScanning ? (
              <div className="w-full mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-orbitron text-xs text-cyber-cyan tracking-wider font-semibold animate-pulse">
                    RUNNING DUAL ML-FORENSICS INFERENCE...
                  </span>
                  <span className="font-orbitron text-xs text-cyber-cyan font-bold">{scanProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <motion.div 
                    className="h-full bg-neon-gradient rounded-full shadow-neon-cyan"
                    initial={{ width: "0%" }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              </div>
            ) : (
              // Selected file meta details
              <div className="w-full mt-5 flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileImage className="w-8 h-8 text-cyber-cyan flex-shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-white truncate">{selectedFile.name}</span>
                    <span className="text-xs text-gray-400">
                      {parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2))} MB
                    </span>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="px-3.5 py-1.5 text-xs font-medium text-cyber-red bg-cyber-red/10 border border-cyber-red/20 rounded-lg hover:bg-cyber-red/20 transition-all cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Error Box */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl border border-cyber-red/35 bg-cyber-red/10 flex items-start space-x-3"
          >
            <AlertTriangle className="w-5 h-5 text-cyber-red flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">File Validation Failed</span>
              <span className="text-xs text-gray-300 mt-0.5 leading-relaxed">{errorMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
