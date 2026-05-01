import Link from "next/link";
import Logo from "@/components/ui/Logo";

const studioLinks = [
  { href: "/equipment", label: "The Studio" },
  { href: "/studio", label: "Rates & Memberships" },
  { href: "/booking", label: "Book Now" },
];

const infoLinks = [
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "Logistics & FAQ" },
  { href: "/rules", label: "Studio Rules / AGB" },
  { href: "/contact", label: "Contact Support" },
];

export default function Footer() {
  return (
    <footer className="border-t border-accent bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1: Brand & Contact Details */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <Logo textClassName="text-3xl md:text-4xl" />
            </Link>
            <p className="mt-5 text-sm md:text-base text-foreground/70 max-w-sm leading-relaxed font-light">
              A premium B2B photo and video production studio in Zurich.
              Engineered for professionals who demand total creative control.
            </p>
            
            <div className="mt-8 space-y-2 text-sm text-foreground/80 font-light">
              <p>Thurgauerstrasse 117, 8152 Glattpark</p>
              <p>info@ceestudio.ch</p>
              <p>+41762402056</p>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              <span className="text-xs font-sans text-foreground/60 tracking-wider uppercase">
                Currently accepting bookings
              </span>
            </div>
          </div>

          {/* Column 2: Studio Navigation */}
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-2">
              The Studio
            </span>
            {studioLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-brand transition-colors duration-300 font-light"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3: Information & Legal */}
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-2">
              Information
            </span>
            {infoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-brand transition-colors duration-300 font-light"
              >
                {link.label}
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright & AMOX Link */}
      <div className="border-t border-accent">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-foreground/50">
          <span>&copy; {new Date().getFullYear()} CEE Studio. All rights reserved.</span>
          <div className="flex gap-4 items-center">
            <Link href="/rules" className="hover:text-brand transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="/rules" className="hover:text-brand transition-colors">AGB</Link>
          </div>
          <span className="text-foreground/70">
            Powered by <a href="https://amox.gr" target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline transition-all">AMOX</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
