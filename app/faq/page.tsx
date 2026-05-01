"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

const faqList = [
  {
    question: "Is there parking?",
    answer: "Yes, parking is available directly under the building. It can be accessed via the Serpy application at approximately 1.5 CHF per hour.",
  },
  {
    question: "Where is the studio located?",
    answer: "The studio is located at Thurgauerstrasse 117, 8152 Glattpark (Opfikon) — TMC Fashion Square AG.",
  },
  {
    question: "What floor is it on?",
    answer: "The studio is located on the 5th floor of the building, Studio 560.",
  },
  {
    question: "How big is the studio?",
    answer: "The studio is 60 m² and designed as a clean, minimal space for photography and content creation.",
  },
  {
    question: "Can I bring people?",
    answer: "Yes, you can bring your team. Please keep the number of people reasonable according to the size of the space and your booking.",
  },
  {
    question: "Is there a deposit required?",
    answer: "A deposit may be required depending on the type of booking. Please contact us for more details.",
  },
  {
    question: "Can I extend my booking?",
    answer: "Yes, extensions are possible depending on availability. Please contact us during your session to arrange this.",
  },
  {
    question: "Booking hours and setup",
    answer: "Your booking time includes setup time. If you require a late check-out, please inform us in advance.",
  },
  {
    question: "Can I cancel or reschedule?",
    answer: "Weekend bookings cannot be cancelled or rescheduled, as these are high-demand days. For weekday bookings, rescheduling may be possible if requested at least 48 hours in advance.",
  },
  {
    question: "Do you offer other services like photographers and makeup artists?",
    answer: "Yes, if you need a photographer, makeup artist or other services, feel free to contact us and we can help arrange it.",
  },
  {
    question: "Can I bring a photographer?",
    answer: "Yes, of course. You are welcome to bring your own photographer and team.",
  },
  {
    question: "Do you have a lift in the building?",
    answer: "Yes, the building has multiple lifts for easy access to the studio.",
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
          FAQ
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
