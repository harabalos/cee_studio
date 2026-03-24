"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="relative z-10 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <h1 className="font-seasons text-[120px] md:text-[200px] leading-none text-brand font-medium tracking-tighter">
            404
          </h1>
          <h2 className="mt-2 font-seasons text-2xl md:text-4xl text-foreground font-semibold">
            Page Not Found
          </h2>
          <div className="w-16 h-[1px] bg-brand mt-6 mb-6"></div>
          
          <p className="text-foreground/70 max-w-sm mx-auto font-light leading-relaxed text-sm md:text-base">
            The page you are looking for does not exist.
          </p>
          
          <div className="mt-10">
            <Link 
              href="/" 
              className="px-10 py-4 bg-brand text-background text-xs md:text-sm tracking-[0.2em] uppercase font-bold hover:bg-[#4a0f0f] transition-colors shadow-[0_10px_30px_rgba(102,20,20,0.3)] hover:shadow-[0_15px_40px_rgba(102,20,20,0.4)] hover:-translate-y-[2px] rounded-sm duration-300 inline-block"
            >
              Return Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
