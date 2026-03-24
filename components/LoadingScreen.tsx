"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisited = sessionStorage.getItem("cee-visited");
      if (hasVisited) {
        setIsLoading(false);
        setShouldRender(false);
        return;
      }

      sessionStorage.setItem("cee-visited", "true");

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1800);

      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 2400);

      return () => {
        clearTimeout(timer);
        clearTimeout(unmountTimer);
      };
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-seasons text-5xl md:text-7xl text-brand tracking-wide">
              CEE
            </h1>
            <p className="font-seasons text-2xl md:text-3xl text-brand mt-1">
              Studio
            </p>
          </motion.div>

          <div className="absolute bottom-0 left-0 w-full h-[2px]">
            <div className="h-full bg-brand animate-loading-bar" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
