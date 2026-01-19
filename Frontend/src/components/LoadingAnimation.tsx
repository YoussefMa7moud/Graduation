import React from 'react';
import { motion } from 'framer-motion';

const ContractAILoader = () => {
  // Hex #0f172a converted to RGB for the glow effect: rgb(15, 23, 42)
  const primaryColor = "#0f172a";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* --- AI Data Nodes (Floating Particles) --- */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: primaryColor }}
            initial={{ opacity: 0 }}
            animate={{
              x: [Math.random() * 150 - 75, Math.random() * 150 - 75],
              y: [Math.random() * 150 - 75, Math.random() * 150 - 75],
              opacity: [0, 0.4, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* --- Central Contract Icon --- */}
        <motion.div 
          className="relative z-10 w-24 h-32 border-4 border-[#0f172a] rounded-lg bg-white p-4 flex flex-col gap-2"
          initial={{ y: 0 }}
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Abstract Contract Lines */}
          <div className="w-full h-2 bg-slate-100 rounded" />
          <div className="w-3/4 h-2 bg-slate-100 rounded" />
          <div className="w-full h-2 bg-slate-100 rounded" />
          {/* "Signature" line now uses the dark navy */}
          <div className="w-1/2 h-2 rounded" style={{ backgroundColor: primaryColor }} />
          
          {/* --- AI Scanning Laser --- */}
          <motion.div 
            className="absolute left-0 right-0 h-1 shadow-[0_0_15px_rgba(15,23,42,0.6)]"
            style={{ backgroundColor: primaryColor }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* --- Rotating Neural Rings --- */}
        <motion.div
          className="absolute w-40 h-40 border-t-2 border-b-2 rounded-full opacity-10"
          style={{ borderColor: primaryColor }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-48 h-48 border-l-2 border-r-2 rounded-full opacity-5"
          style={{ borderColor: primaryColor }}
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* --- Loading Text --- */}
      <div className="mt-8 flex flex-col items-center">
        <motion.p 
          className="text-slate-400 font-medium tracking-widest uppercase text-[10px]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Securing Agreement
        </motion.p>
        <div className="mt-2 flex gap-1">
          <span className="font-bold" style={{ color: primaryColor }}>Processing</span>
          <motion.span
            style={{ color: primaryColor }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
          >...</motion.span>
        </div>
      </div>
    </div>
  );
};

export default ContractAILoader;