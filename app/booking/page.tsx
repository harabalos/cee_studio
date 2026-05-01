"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const t = {
  en: {
    tag: "Live Availability",
    h1: "Book The Studio",
    intro: "Secure your date instantly. No back-and-forth emails required.",
    step1: "1. Select Service",
    step2: "2. Date & Time",
    step3: "3. Add-ons",
    services: [
      { id: 1, name: "Hourly Rental", desc: "Min. 2 Hours", price: 100 },
      { id: 2, name: "Half Day Lockout", desc: "4 Hours", price: 380 },
      { id: 3, name: "Full Day Lockout", desc: "8 Hours", price: 650 },
    ],
    monthLabel: "May 2026",
    daySlot: "Wed",
    slots: "Available Slots",
    addonLighting: "Profoto & Aputure Lighting Package",
    addonLightingDesc: "Full access to 2x D2s, 1x 600d, modifiers, and heavy-duty grip limitlessly.",
    addonPaper: "Seamless Paper Backdrop",
    addonPaperDesc: "Fresh 2.72m roll rolled down to the floor. Tell us your color in the next step.",
    summaryH: "Booking Summary",
    service: "Service",
    date: "Date",
    time: "Time",
    addonsLabel: "Add-ons",
    lighting: "Lighting Package",
    paper: "Paper Backdrop",
    total: "Total",
    cta: "Continue to Payment →",
    note: "You will only be charged a 50% deposit today.",
    dateFmt: (d: number) => `May ${d}, 2026`,
  },
  de: {
    tag: "Live Verfügbarkeit",
    h1: "Studio buchen",
    intro: "Sichern Sie Ihren Termin sofort. Keine E-Mail-Korrespondenz nötig.",
    step1: "1. Service wählen",
    step2: "2. Datum & Zeit",
    step3: "3. Zusatzoptionen",
    services: [
      { id: 1, name: "Stundenmiete", desc: "Min. 2 Stunden", price: 100 },
      { id: 2, name: "Halbtages-Buchung", desc: "4 Stunden", price: 380 },
      { id: 3, name: "Ganztages-Buchung", desc: "8 Stunden", price: 650 },
    ],
    monthLabel: "Mai 2026",
    daySlot: "Mi",
    slots: "Verfügbare Slots",
    addonLighting: "Profoto & Aputure Lighting Paket",
    addonLightingDesc: "Voller Zugriff auf 2x D2s, 1x 600d, Modifier und professionelles Grip-Equipment.",
    addonPaper: "Nahtloser Papierhintergrund",
    addonPaperDesc: "Frische 2.72m Rolle bis auf den Boden. Farbe wählen Sie im nächsten Schritt.",
    summaryH: "Buchungsübersicht",
    service: "Service",
    date: "Datum",
    time: "Zeit",
    addonsLabel: "Zusatzoptionen",
    lighting: "Lighting Paket",
    paper: "Papierhintergrund",
    total: "Total",
    cta: "Zur Zahlung →",
    note: "Heute wird nur 50% Anzahlung berechnet.",
    dateFmt: (d: number) => `${d}. Mai 2026`,
  },
};

export default function BookingPage() {
  const { lang } = useLang();
  const tx = lang === "DE" ? t.de : t.en;

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [needsLighting, setNeedsLighting] = useState(false);
  const [needsPaper, setNeedsPaper] = useState(false);

  const dates = [12, 13, 14, 15, 16];
  const times = ["09:00", "13:00", "17:00"];

  const basePrice = selectedService ? tx.services.find(s => s.id === selectedService)?.price || 0 : 0;
  const addonsPrice = (needsLighting ? 150 : 0) + (needsPaper ? 20 : 0);
  const total = basePrice + addonsPrice;

  return (
    <div className="pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div {...fadeUp} className="text-center mb-16">
          <Tag>{tx.tag}</Tag>
          <h1 className="font-seasons text-4xl md:text-6xl mt-4">{tx.h1}</h1>
          <p className="mt-4 text-foreground/70">{tx.intro}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          <div className="flex-1 space-y-16">
            {/* 1. Select Service */}
            <motion.section {...fadeUp}>
              <h2 className="font-seasons text-2xl text-brand mb-6 border-b border-brand pb-2">{tx.step1}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tx.services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`border p-6 text-left transition-all duration-300 ${
                      selectedService === service.id
                        ? "border-brand bg-brand/5 scale-[1.02]"
                        : "border-accent/40 hover:border-brand/50"
                    }`}
                  >
                    <h3 className="font-seasons text-xl">{service.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-foreground/50 mt-1">{service.desc}</p>
                    <p className="text-brand font-bold mt-4">CHF {service.price}</p>
                  </button>
                ))}
              </div>
            </motion.section>

            {/* 2. Date & Time */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedService ? 1 : 0.3 }}
              className="transition-opacity duration-500"
            >
              <h2 className="font-seasons text-2xl text-brand mb-6 border-b border-brand pb-2">{tx.step2}</h2>
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-widest mb-3">{tx.monthLabel}</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map(date => (
                    <button
                      key={date}
                      disabled={!selectedService}
                      onClick={() => setSelectedDate(date)}
                      className={`min-w-[70px] aspect-square flex flex-col items-center justify-center border transition-all ${
                        selectedDate === date
                          ? "bg-brand text-background border-brand"
                          : "border-accent/40 hover:border-brand/50 disabled:cursor-not-allowed"
                      }`}
                    >
                      <span className="text-xs uppercase">{tx.daySlot}</span>
                      <span className="font-seasons text-2xl">{date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest mb-3">{tx.slots}</p>
                  <div className="flex gap-3">
                    {times.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`flex-1 py-3 border transition-all ${
                          selectedTime === time
                            ? "bg-brand text-background border-brand"
                            : "border-accent/40 hover:border-brand/50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>

            {/* 3. Add-ons */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedTime ? 1 : 0.3 }}
              className="transition-opacity duration-500"
            >
              <h2 className="font-seasons text-2xl text-brand mb-6 border-b border-brand pb-2">{tx.step3}</h2>
              <div className="space-y-4">
                <label className={`flex items-start gap-4 p-6 border cursor-pointer transition-all ${
                  needsLighting ? "border-brand bg-brand/5" : "border-accent/40 hover:border-brand/50"
                }`}>
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 accent-brand"
                    disabled={!selectedTime}
                    checked={needsLighting}
                    onChange={(e) => setNeedsLighting(e.target.checked)}
                  />
                  <div>
                    <h3 className="font-seasons text-xl">{tx.addonLighting}</h3>
                    <p className="text-sm text-foreground/70 mt-1">{tx.addonLightingDesc}</p>
                  </div>
                  <div className="ml-auto text-brand font-bold">+CHF 150</div>
                </label>

                <label className={`flex items-start gap-4 p-6 border cursor-pointer transition-all ${
                  needsPaper ? "border-brand bg-brand/5" : "border-accent/40 hover:border-brand/50"
                }`}>
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 accent-brand"
                    disabled={!selectedTime}
                    checked={needsPaper}
                    onChange={(e) => setNeedsPaper(e.target.checked)}
                  />
                  <div>
                    <h3 className="font-seasons text-xl">{tx.addonPaper}</h3>
                    <p className="text-sm text-foreground/70 mt-1">{tx.addonPaperDesc}</p>
                  </div>
                  <div className="ml-auto text-brand font-bold">+CHF 20</div>
                </label>
              </div>
            </motion.section>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-32 border border-brand bg-background p-8 shadow-2xl">
              <h3 className="font-seasons text-3xl mb-6">{tx.summaryH}</h3>

              <div className="space-y-4 text-sm text-foreground/80 mb-8">
                <div className="flex justify-between">
                  <span>{tx.service}</span>
                  <span className="font-semibold text-right">
                    {selectedService
                      ? tx.services.find(s => s.id === selectedService)?.name
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{tx.date}</span>
                  <span className="font-semibold">{selectedDate ? tx.dateFmt(selectedDate) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{tx.time}</span>
                  <span className="font-semibold">{selectedTime || "—"}</span>
                </div>

                {(needsLighting || needsPaper) && (
                  <div className="pt-4 border-t border-accent/30 mt-4 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-brand font-bold mb-2">{tx.addonsLabel}</p>
                    {needsLighting && (
                      <div className="flex justify-between">
                        <span>{tx.lighting}</span>
                        <span>CHF 150</span>
                      </div>
                    )}
                    {needsPaper && (
                      <div className="flex justify-between">
                        <span>{tx.paper}</span>
                        <span>CHF 20</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-brand pt-6 mb-8 flex justify-between items-end">
                <span className="text-lg font-seasons">{tx.total}</span>
                <span className="text-3xl font-seasons text-brand">CHF {total}</span>
              </div>

              <button
                disabled={!selectedTime}
                className={`w-full py-4 text-sm font-semibold uppercase tracking-widest transition-all ${
                  selectedTime
                    ? "bg-brand text-background hover:bg-brand-hover"
                    : "bg-accent/20 cursor-not-allowed"
                }`}
              >
                {tx.cta}
              </button>

              <p className="text-xs text-center text-foreground/50 mt-4">
                {tx.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
