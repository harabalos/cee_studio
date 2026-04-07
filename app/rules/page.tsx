"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

const rulesList = [
  {
    title: "[Rule 1: e.g. Liability and Responsibility]",
    text: "[Details regarding renter liability for equipment and property damage.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    title: "[Rule 2: e.g. Sound & Noise Output]",
    text: "[Limitations on audio levels and lack of full soundproofing.] Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet.",
  },
  {
    title: "[Rule 3: e.g. Overtime Calculations]",
    text: "[Explanation of how load-in, load-out, and overtime billing works.] Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "[Rule 4: e.g. Cancellation Policy]",
    text: "[Specific timelines and fee brackets for cancelling a booking.] Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
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
