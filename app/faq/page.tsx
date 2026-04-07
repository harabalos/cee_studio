"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

const faqList = [
  {
    question: "[FAQ Question 1: e.g. Where is the loading dock?]",
    answer: "[Logistics and location answer.] Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna.",
  },
  {
    question: "[FAQ Question 2: e.g. Do you have Phase 3 power?]",
    answer: "[Specification of the industrial grid power drops.] In voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint.",
  },
  {
    question: "[FAQ Question 3: e.g. Is there on-site parking?]",
    answer: "[Details about dedicated spots and public parking.] Mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    question: "[FAQ Question 4: e.g. Can we rent equipment on the day?]",
    answer: "[Policies on instant equipment provisioning.] Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
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
