"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>Contact</Tag>
        <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4 mb-16">
          Get in touch
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          
          {/* Left Column: Contact Detail Card */}
          <div className="bg-background border border-accent p-8 md:p-12 rounded-lg flex flex-col justify-center space-y-12 shadow-sm">
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-4">General Inquiries</h2>
              <a href="mailto:info@ceestudio.ch" className="font-seasons text-3xl md:text-4xl text-foreground hover:text-brand transition-colors break-words">
                info@ceestudio.ch
              </a>
            </div>
            
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-4">Phone</h2>
              <p className="font-seasons text-3xl md:text-4xl text-foreground">
                +41762402056
              </p>
            </div>
            
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-4">The Studio</h2>
              <p className="text-foreground/70 leading-relaxed font-light text-sm md:text-base">
                CEE Studio HQ<br />
                Thurgauerstrasse 117<br />
                8152 Glattpark
              </p>
            </div>
          </div>
          
          <div className="bg-brand/5 border border-accent p-8 md:p-12 rounded-lg flex flex-col justify-center">
            <h2 className="font-seasons text-3xl text-brand mb-8">Production Inquiry</h2>
            <p className="text-foreground/70 leading-relaxed font-light text-sm mb-8">
              To request a custom production quote or to hold dates for a multi-day commercial shoot, please outline the scope of your project below.
            </p>
            
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="text" 
                placeholder="Name or Agency" 
                className="w-full bg-transparent border-b border-accent pb-3 text-sm focus:outline-none focus:border-brand transition-colors text-foreground font-light placeholder:text-foreground/30"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-transparent border-b border-accent pb-3 text-sm focus:outline-none focus:border-brand transition-colors text-foreground font-light placeholder:text-foreground/30"
              />
              <textarea 
                placeholder="Project Details (Dates, Equipment needs, Crew size)" 
                rows={4}
                className="w-full bg-transparent border-b border-accent pb-3 text-sm focus:outline-none focus:border-brand transition-colors text-foreground font-light placeholder:text-foreground/30 resize-none mt-4"
              />
              <button 
                type="button"
                className="self-start mt-6 px-8 py-3 bg-brand text-background text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#4a0f0f] transition-colors shadow-lg hover:shadow-xl rounded-sm"
              >
                Submit Inquiry
              </button>
            </form>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="md:col-span-2 mt-4 md:mt-8 bg-brand/5 border border-accent p-2 rounded-lg overflow-hidden h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2700.0886270381622!2d8.558352615622144!3d47.4326573791732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47900aef7ff6d1e7%3A0xe5a363a0329b3cf2!2sThurgauerstrasse%20117%2C%208152%20Glattpark%20(Opfikon)%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1711311000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[0.8] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 w-full h-full object-cover rounded-md"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
