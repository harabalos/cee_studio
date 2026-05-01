"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import AestheticSphere from "./AestheticSphere";
import { useRef } from "react";
import { useLang } from "@/contexts/LanguageContext";

const t = {
  en: {
    h2: "Secure your dates.",
    p: "Check real-time availability and instantly reserve the finest studio for your next project.",
    book: "Book Instantly",
    contact: "Contact Us",
  },
  de: {
    h2: "Sichern Sie Ihre Termine.",
    p: "Prüfen Sie die Live-Verfügbarkeit und reservieren Sie sofort das beste Studio für Ihr nächstes Projekt.",
    book: "Sofort buchen",
    contact: "Kontakt",
  },
};

export default function CtaBanner() {
  const containerRef = useRef<HTMLElement>(null);
  const { lang } = useLang();
  const tx = lang === "DE" ? t.de : t.en;
  
  // Parallax the spheres slightly as the user scrolls
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Keep parallax motion subtle so spheres don't bounce out of the newly smaller height.
  const y1 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const y3 = useTransform(scrollYProgress, [0, 1], [25, -25]);

  return (
    <div className="px-4 md:px-8 py-4 mb-8">
      <motion.section 
        ref={containerRef}
        className="relative overflow-hidden bg-brand py-10 md:py-12 flex flex-col justify-center items-center text-center text-background rounded-3xl md:rounded-[40px] shadow-[0_15px_40px_rgba(102,20,20,0.3)] border border-[#802020]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Parallax & Continuously Scrolling 3D Liquid Spheres (Spread organically BEHIND the text) */}
        
        {/* Sphere 1: Large Anchor (Behind Left text) */}
        <motion.div 
          className="absolute top-1/2 left-[15%] md:left-[25%] lg:left-[22%] -translate-x-1/2 -translate-y-[45%] z-0 mix-blend-screen opacity-90 pointer-events-none"
          style={{ y: y1 }}
        >
          <AestheticSphere
            size={280}
            customDelay={1}
            animate={{ x: [-15, 10, -15], rotateZ: [0, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        {/* Sphere 2: Medium (Behind Right text) */}
        <motion.div 
          className="hidden md:block absolute top-1/2 left-[85%] md:left-[75%] lg:left-[78%] -translate-x-1/2 -translate-y-[55%] z-0 mix-blend-screen opacity-95 pointer-events-none"
          style={{ y: y2 }}
        >
          <AestheticSphere
            size={200}
            customDelay={2}
            className="saturate-[1.2]"
            animate={{ x: [10, -15, 10], rotateZ: [-5, 5, -5] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
        
        {/* Sphere 3: Small Accent (Scattered near center-right buttons) */}
        <motion.div 
          className="hidden md:block absolute top-1/2 left-[50%] md:left-[55%] -translate-x-[40%] -translate-y-[35%] z-0 mix-blend-screen opacity-100 pointer-events-none"
          style={{ y: y3 }}
        >
          <AestheticSphere
            size={120}
            customDelay={0.5}
            animate={{ x: [0, 15, 0], rotateZ: [10, -5, 10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
        </motion.div>

        {/* Content Section */}
        <div className="relative z-10 w-full px-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <motion.h2 
            className="font-seasons text-4xl md:text-5xl lg:text-7xl font-semibold tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {tx.h2}
          </motion.h2>
          
          <motion.p 
            className="mt-3 md:mt-4 text-background/95 max-w-sm md:max-w-lg mx-auto leading-relaxed text-sm md:text-base lg:text-lg font-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            {tx.p}
          </motion.p>
          
          <motion.div 
            className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          >
            <Link 
              href="/booking" 
              className="w-full sm:w-auto px-8 py-3 lg:px-10 lg:py-4 bg-background text-brand text-[10px] md:text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-accent transition-all duration-300 shadow-[0_5px_15px_rgba(253,250,244,0.15)] hover:shadow-[0_8px_20px_rgba(253,250,244,0.3)] hover:-translate-y-[1px] rounded-sm"
            >
              {tx.book}
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-8 py-3 lg:px-10 lg:py-4 border border-background/60 text-background text-[10px] md:text-xs uppercase tracking-[0.2em] font-extrabold hover:border-background hover:bg-background/10 transition-all duration-300 rounded-sm hover:-translate-y-[1px]"
            >
              {tx.contact}
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
