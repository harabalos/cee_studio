"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

const faqList = [
  {
    question: "Where is the loading dock?",
    answer: "The loading dock is located at the rear entrance. It features a direct ground-level ramp into the main studio space, allowing vehicles to drive completely inside for heavy equipment offloading.",
  },
  {
    question: "Do you have Phase 3 power?",
    answer: "Yes, the studio operates on an industrial grid. We have multiple 32A and 16A Phase 3 power drops available directly near the Cyc wall.",
  },
  {
    question: "Is there on-site parking?",
    answer: "We provide 3 dedicated parking spots directly outside the loading bay for your production vehicles. Additional paid public parking is available within a 2-minute walk.",
  },
  {
    question: "Can we rent equipment on the day of the shoot?",
    answer: "While we highly recommend pre-booking your equipment via our inventory portal, our on-site Studio Manager can instantly provision additional grip or Profoto lighting upon request (subject to availability).",
  },
];

export default function FAQPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>Information</Tag>
        <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4 mb-16">
          Logistics & FAQ
        </h1>
        
        <div className="space-y-12">
          {faqList.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="border-b border-accent pb-10"
            >
              <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-4">
                {faq.question}
              </h2>
              <p className="text-foreground/70 leading-relaxed font-light text-sm md:text-base">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
