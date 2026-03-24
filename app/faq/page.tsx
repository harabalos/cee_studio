"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const faqs = [
  {
    question: "Where can I park?",
    answer: "Each booking includes access to 2 dedicated parking spots directly outside the studio. Additional street parking (Blue Zone) is available in the surrounding neighborhood.",
  },
  {
    question: "How do I load heavy equipment?",
    answer: "We feature a direct drive-up ramp to the studio entrance. The double-wide loading doors make rolling in heavy grip gear or oversized props effortless. No stairs or elevators required.",
  },
  {
    question: "When is the best natural light?",
    answer: "The Lifestyle Set features South-West facing windows. You will get beautiful, diffused, soft daylight in the morning, and direct, contrasty 'golden hour' sunlight hitting the floor from 14:00 to 18:00 (during Summer months).",
  },
  {
    question: "Can I bring my own high-powered continuous lights?",
    answer: "Yes. Our facility is equipped with 3-Phase Power (T25) allowing for heavy electrical loads like 18K HMIs or multiple Aputure 1200Ds without tripping the breakers.",
  },
  {
    question: "How does the Smart Lock access work?",
    answer: "Once your booking is confirmed, you will receive a 6-digit PIN code via email 24 hours prior to your shoot. This code will only activate at the exact start time of your booking.",
  },
  {
    question: "Is there an area for Hair & Makeup?",
    answer: "Yes, we have a dedicated Utility Zone featuring 2 lit mirror stations, a steamer, and heavy-duty clothing racks. It is included free with every booking.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
    <div className="pt-32 pb-32">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <motion.div {...fadeUp} className="text-center">
          <Tag>Logistics & Details</Tag>
          <h1 className="font-seasons text-5xl md:text-7xl mt-4">Frequently Asked Questions</h1>
          <p className="mt-8 text-foreground/70 leading-relaxed text-lg mx-auto">
            Everything you need to know to plan a flawless shoot day at CEE Studio.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="mt-24">
          <div className="border-t border-brand">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border-b border-brand">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex justify-between items-center py-6 md:py-8 text-left focus:outline-none group"
                  >
                    <span className="font-seasons text-2xl md:text-3xl text-foreground group-hover:text-brand transition-colors pr-8">
                      {faq.question}
                    </span>
                    <span className="text-3xl font-light text-brand/50 group-hover:text-brand transition-colors">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 text-foreground/70 leading-relaxed md:text-lg">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <CtaBanner />
    </>
  );
}
