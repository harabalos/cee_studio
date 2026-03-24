"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

const rulesList = [
  {
    title: "1. Liability and Responsibility",
    text: "The renter holds full responsibility for any damage to the studio structure, equipment, and cyclic wall during their rental period. Equipment must be returned in its original condition.",
  },
  {
    title: "2. The Cyc Wall",
    text: "Entering the Cyc wall requires protective booties or freshly tapped shoes. Heavy equipment must be placed on provided protective mats. Repainting fees apply for significant scuffing.",
  },
  {
    title: "3. Sound & Noise Output",
    text: "While we are a production-friendly environment, extremely high-decibel audio must be approved in advance. We are not a fully soundproofed Foley stage.",
  },
  {
    title: "4. Overtime Calculations",
    text: "Your rental period includes load-in and load-out. Any occupation of the premises beyond the final booked minute will be billed in 30-minute increments at 1.5x the standard hourly rate.",
  },
  {
    title: "5. Cancellation Policy",
    text: "Cancellations made 72 hours prior to the booking will receive a full refund. Cancellations within 48 hours will be charged 50%. Same-day cancellations are non-refundable.",
  },
];

export default function RulesPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>Legal</Tag>
        <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4 mb-16">
          Studio Rules & AGB
        </h1>
        
        <div className="space-y-12">
          {rulesList.map((rule, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="border-b border-accent pb-10"
            >
              <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-4">
                {rule.title}
              </h2>
              <p className="text-foreground/70 leading-relaxed font-light text-sm md:text-base">
                {rule.text}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
