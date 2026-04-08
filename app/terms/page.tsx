"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>Legal</Tag>
        <h1 className="font-seasons text-4xl md:text-6xl text-brand mt-4 mb-12">
          Terms of Service
        </h1>
        
        <div className="space-y-12 text-foreground/80 leading-relaxed font-light text-sm md:text-base">
          <section>
            <p className="mb-4">
              <strong>Last Updated: May 2026</strong>
            </p>
            <p>
              Welcome to CEE Studio. These terms and conditions outline the rules and regulations for the use of our studio and services, located at Thurgauerstrasse 117, 8152 Glattpark.
            </p>
          </section>

          <section>
            <h2 className="font-seasons text-2xl text-brand mb-4">1. Definitions</h2>
            <p className="mb-4">
              For the purposes of these Terms and Conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to CEE Studio.</li>
              <li><strong>Renter</strong> means the individual accessing or using the studio, or the company, or other legal entity on behalf of which such individual is accessing or using the studio.</li>
              <li><strong>Studio</strong> refers to the B2B rental space and its associated equipment.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-seasons text-2xl text-brand mb-4">2. Studio Rental & Use</h2>
            <p className="mb-4">
              The Renter agrees that the Studio will be used exclusively for professional photography and videography productions. The maximum capacity of the Studio must not be exceeded without prior written permission.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Rental periods begin and end precisely at the agreed-upon times. Setup and teardown must be completed within this timeframe.</li>
              <li>The Renter assumes full responsibility for the conduct of all crew members, talents, and clients present during the booking.</li>
              <li>The Studio must be left in the exact condition it was found. Cleaning fees will apply for excessive mess or undeclared waste left behind.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-seasons text-2xl text-brand mb-4">3. Payment & Cancellations</h2>
            <p className="mb-4">
              A 50% deposit is required to secure any booking. The remaining balance will be charged upon completion of the rental day.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cancellations made more than 48 hours prior to the booking will receive a full refund.</li>
              <li>Cancellations made within 48 hours of the booking will forfeit the deposit.</li>
              <li>No-shows will be charged the full rate of the booking.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-seasons text-2xl text-brand mb-4">4. Liability & Insurance</h2>
            <p className="mb-4">
              The Company is not responsible for any personal injury, loss, or damage to personal property or equipment brought into the Studio by the Renter or their team.
            </p>
            <p>
              The Renter is solely responsible for any damage caused to the Studio, the cyclorama wall, or the supplied rental equipment (including Profoto and Aputure units) during the rental timeframe. Damages will be billed directly to the Renter at repair or replacement cost.
            </p>
          </section>

          <section>
            <h2 className="font-seasons text-2xl text-brand mb-4">5. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Switzerland, without regard to its conflict of law provisions. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of the Canton of Zurich.
            </p>
          </section>
          
          <section className="pt-8 border-t border-accent/30">
            <p className="text-foreground/50 text-xs uppercase tracking-widest">
              Please direct all legal inquiries to <a href="mailto:info@ceestudio.ch" className="text-brand hover:underline">info@ceestudio.ch</a>.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
