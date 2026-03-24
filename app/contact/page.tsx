"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left Column — Info */}
          <motion.div {...fadeUp}>
            <h1 className="font-seasons text-6xl md:text-7xl">
              Let&apos;s Talk.
            </h1>
            <p className="mt-6 text-foreground/60 leading-relaxed max-w-md">
              Have a project in mind or want to learn more about what we do?
              Drop us a line — we respond within 24 hours.
            </p>

            <div className="mt-12 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-foreground/40">
                  Email
                </span>
                <p className="mt-1 text-foreground">hello@ceestudio.ch</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-foreground/40">
                  Phone
                </span>
                <p className="mt-1 text-foreground">+41 44 123 45 67</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-foreground/40">
                  Address
                </span>
                <p className="mt-1 text-foreground">
                  Hardturmstrasse 76
                  <br />
                  8005 Zurich, Switzerland
                </p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-12 relative h-64 bg-accent flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-8 h-8 text-brand mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-sm text-foreground/50 mt-2">
                  Kreis 5, Zurich
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column — Form */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <form className="space-y-10 pt-4">
              {/* Name */}
              <div className="floating-label relative">
                <input
                  type="text"
                  id="name"
                  placeholder=" "
                  className="w-full bg-transparent border-b border-accent focus:border-brand transition-colors duration-300 py-3 text-foreground outline-none peer"
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-0 top-3 text-sm text-foreground/40 transition-all duration-300 pointer-events-none peer-focus:-translate-y-6 peer-focus:text-xs peer-focus:text-brand peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Your Name
                </label>
              </div>

              {/* Email */}
              <div className="floating-label relative">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  className="w-full bg-transparent border-b border-accent focus:border-brand transition-colors duration-300 py-3 text-foreground outline-none peer"
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 top-3 text-sm text-foreground/40 transition-all duration-300 pointer-events-none peer-focus:-translate-y-6 peer-focus:text-xs peer-focus:text-brand peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Email Address
                </label>
              </div>

              {/* Project Type */}
              <div className="floating-label relative">
                <select
                  id="project-type"
                  className="w-full bg-transparent border-b border-accent focus:border-brand transition-colors duration-300 py-3 text-foreground outline-none appearance-none"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select project type
                  </option>
                  <option value="photography">Photography</option>
                  <option value="video">Video Production</option>
                  <option value="campaign">Campaign</option>
                  <option value="editorial">Editorial</option>
                  <option value="product">Product</option>
                  <option value="studio-rental">Studio Rental</option>
                  <option value="other">Other</option>
                </select>
                <label
                  htmlFor="project-type"
                  className="absolute left-0 -top-3 text-xs text-foreground/40 pointer-events-none"
                >
                  Project Type
                </label>
              </div>

              {/* Date */}
              <div className="floating-label relative">
                <input
                  type="date"
                  id="date"
                  className="w-full bg-transparent border-b border-accent focus:border-brand transition-colors duration-300 py-3 text-foreground outline-none"
                />
                <label
                  htmlFor="date"
                  className="absolute left-0 -top-3 text-xs text-foreground/40 pointer-events-none"
                >
                  Preferred Date
                </label>
              </div>

              {/* Message */}
              <div className="floating-label relative">
                <textarea
                  id="message"
                  rows={4}
                  placeholder=" "
                  className="w-full bg-transparent border-b border-accent focus:border-brand transition-colors duration-300 py-3 text-foreground outline-none resize-none peer"
                  required
                />
                <label
                  htmlFor="message"
                  className="absolute left-0 top-3 text-sm text-foreground/40 transition-all duration-300 pointer-events-none peer-focus:-translate-y-6 peer-focus:text-xs peer-focus:text-brand peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Tell us about your project
                </label>
              </div>

              <Button type="submit" variant="filled" fullWidth>
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
