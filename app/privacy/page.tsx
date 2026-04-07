"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";

const privacySections = [
  {
    title: "[Section 1: Data Collection]",
    content: "[Details regarding what personal data is collected from users on the website.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "[Section 2: Purpose of Processing]",
    content: "[Explanation of why the collected data is being processed, e.g., for bookings or newsletter updates.] Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    title: "[Section 3: Data Storage & Security]",
    content: "[Information about how data is stored securely and the duration of storage.] Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  },
  {
    title: "[Section 4: Third-Party Disclosures]",
    content: "[Details on whether data is shared with third-party services like payment processors.] Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    title: "[Section 5: User Rights]",
    content: "[Explanation of the user's rights regarding their own data, including access and deletion requests.] Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Tag>Legal</Tag>
          <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4 mb-16">
            Privacy Policy
          </h1>
          
          <div className="space-y-12">
            {privacySections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="border-b border-accent pb-10"
              >
                <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-4">
                  {section.title}
                </h2>
                <p className="text-foreground/70 leading-relaxed font-light text-base">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <CtaBanner />
    </>
  );
}
