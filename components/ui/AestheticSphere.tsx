"use client";

import { motion, MotionProps } from "framer-motion";

interface SphereProps extends MotionProps {
  className?: string;
  size?: number | string;
  customDelay?: number;
}

export default function AestheticSphere({ className, size = 200, customDelay = 0, style, ...props }: SphereProps) {
  return (
    <motion.div
      className={`relative rounded-full overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/20 ${className}`}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {/* Base Orb Gradient (Warm cream transitioning to deep shaded cream for 3D realism) */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FDFAF4] via-[#dfccb0] to-[#bda682]"
      />
      
      {/* Deep Burgundy Shadow at the bottom/inset to mimic environmental reflection from the dark background */}
      <div 
        className="absolute inset-0 rounded-full shadow-[inset_-20px_-30px_60px_rgba(102,20,20,0.85)]" 
      />

      {/* Soft internal edge darkening */}
      <div 
        className="absolute inset-0 rounded-full shadow-[inset_15px_15px_30px_rgba(0,0,0,0.1)] z-10 pointer-events-none" 
      />

      {/* Animated S-Curve Liquid Wave / Horizon Line */}
      <motion.div 
        className="absolute top-[45%] left-[-15%] right-[-15%] h-[65%] rounded-[50%] border-t-[3px] border-white/70 bg-gradient-to-b from-white/40 to-transparent z-0"
        style={{ boxShadow: "0 -15px 30px rgba(253,250,244,0.5)" }}
        animate={{ 
          rotate: [-10, 0, -10], 
          y: [-10, 10, -10],
          scaleY: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 6 + customDelay, 
          repeat: Infinity, 
          ease: "easeInOut",
        }}
      />
      
      {/* Intense Bottom Internal Glow (Refraction matching the base cream color) */}
      <div 
        className="absolute bottom-[-5%] left-[10%] right-[10%] h-[35%] rounded-full bg-[#FDFAF4] opacity-90 blur-2xl z-0" 
      />
      
      {/* Absolute Master Specular Highlight (The bright top dome curve) */}
      <div 
        className="absolute top-[1%] left-[6%] right-[6%] h-[35%] rounded-[50%] bg-gradient-to-b from-white to-transparent opacity-90 z-20 pointer-events-none" 
      />
      <div 
        className="absolute top-[4%] left-[15%] right-[15%] h-[12%] rounded-[50%] bg-white opacity-100 blur-[2px] z-20 pointer-events-none" 
      />

      {/* Internal "Liquid Bubbles" with independent floating animations */}
      
      {/* Bubble 1 (Upper Right) */}
      <motion.div 
        className="absolute top-[20%] left-[60%] w-[18%] h-[18%] rounded-full border-[1.5px] border-white/80 bg-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.2)] backdrop-blur-sm z-10"
        animate={{ y: [-5, 15, -5], x: [-5, 5, -5] }}
        transition={{ duration: 5 + customDelay, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-[12%] left-[12%] w-[35%] h-[35%] rounded-full bg-white opacity-100 blur-[0.5px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[20%] rounded-full bg-[#661414] opacity-30 blur-[2px]"></div>
      </motion.div>
      
      {/* Bubble 2 (Bottom Middle-Right) */}
      <motion.div 
        className="absolute bottom-[28%] right-[32%] w-[22%] h-[22%] rounded-full border-[1.5px] border-white/70 bg-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm z-10"
        animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
        transition={{ duration: 7 + customDelay, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="absolute top-[15%] left-[18%] w-[30%] h-[30%] rounded-full bg-white opacity-100 blur-[0.5px]"></div>
        <div className="absolute bottom-[10%] right-[15%] w-[50%] h-[20%] rounded-full bg-[#661414] opacity-40 blur-[2px]"></div>
      </motion.div>

      {/* Bubble 3 (Smallest, Bottom Right Edge) */}
      <motion.div 
        className="absolute bottom-[26%] right-[14%] w-[12%] h-[12%] rounded-full border-[1px] border-white/60 bg-white/10 shadow-[0_3px_10px_rgba(0,0,0,0.2)] backdrop-blur-sm z-10"
        animate={{ y: [-5, 5, -5], scale: [1, 1.1, 1] }}
        transition={{ duration: 4 + customDelay, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="absolute top-[18%] left-[18%] w-[35%] h-[35%] rounded-full bg-white opacity-90 blur-[0.5px]"></div>
      </motion.div>

    </motion.div>
  );
}
