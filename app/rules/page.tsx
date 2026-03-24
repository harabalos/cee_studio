"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const rules = [
  {
    category: "1. Booking & Payments",
    items: [
      "All bookings are strictly time-bound. Your booked time includes setup, shooting, and teardown/cleaning.",
      "A 50% non-refundable deposit is required to secure the date. The remaining balance is due 48 hours prior to the shoot.",
      "Overtime is billed at CHF 100 per started half-hour, subject to studio availability.",
    ],
  },
  {
    category: "2. Cancellation Policy",
    items: [
      "Cancellations made more than 5 days prior to the booking will receive a full refund of any amounts paid, minus the non-refundable deposit.",
      "Cancellations within 5 days of the booking will be charged the full rate.",
      "If CEE Studio is forced to cancel due to unforeseen circumstances (e.g., power failure), a full refund or free rescheduling will be provided.",
    ],
  },
  {
    category: "3. Studio Usage & Cleaning",
    items: [
      "The studio must be returned to its exact original state 10 minutes prior to the end of your booking.",
      "All furniture and props must be lifted, not dragged, to protect the natural oak flooring and cyc wall surface.",
      "Any excessive cleaning required (glitter, confetti, heavy food spills) will incur a CHF 150 cleaning fee.",
      "Smoking, vaping, and open flames are strictly prohibited inside the facility.",
    ],
  },
  {
    category: "4. Damages & Liability",
    items: [
      "The renter is fully liable for any damages to the studio, equipment, or furniture incurred during the rental period.",
      "CEE Studio is not responsible for any personal items, camera gear, or clothing left behind during or after the rental.",
      "Stepping on the curve of the cyclorama wall is prohibited. Any damage to the cyc wall will result in a repair fee of CHF 300.",
    ],
  },
];

export default function RulesPage() {
  return (
    <>
    <div className="pt-32 pb-32">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <motion.div {...fadeUp} className="text-center">
          <Tag>Terms & Conditions</Tag>
          <h1 className="font-seasons text-5xl md:text-7xl mt-4">Studio Rules (AGB)</h1>
          <p className="mt-8 text-foreground/70 leading-relaxed text-lg mx-auto">
            To maintain our high standards and ensure a seamless experience for every professional who rents the space, we enforce the following terms and guidelines.
          </p>
        </motion.div>

        {/* Rules List */}
        <div className="mt-24 space-y-16 lg:space-y-24">
          {rules.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border-t border-brand pt-8"
            >
              <h2 className="font-seasons text-3xl text-brand mb-6">{section.category}</h2>
              <ul className="space-y-4">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-4 text-foreground/80 leading-relaxed">
                    <span className="text-brand font-bold mt-1 text-sm">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          className="mt-32 border border-accent/40 bg-background p-8 text-center"
          {...fadeUp}
        >
          <p className="text-sm text-foreground/70 uppercase tracking-widest font-semibold">
            By proceeding with a booking, you automatically agree to these terms.
          </p>
        </motion.div>

      </div>
      <CtaBanner />
    </>
  );
}
