import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { href: "/space", label: "The Space" },
  { href: "/equipment", label: "Equipment" },
  { href: "/studio", label: "Rates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const footerImages = [
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&h=300&fit=crop",
];

export default function Footer() {
  return (
    <footer className="border-t border-accent">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Logo & Description */}
          <div>
            <Link href="/" className="font-seasons text-3xl text-brand">
              CEE Studio
            </Link>
            <p className="mt-4 text-sm text-foreground/60 max-w-xs leading-relaxed">
              A premium B2B photo and video studio rental space in Zurich.
              Fully equipped for professionals who demand the best environment.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              <span className="text-xs font-sans text-foreground/60">
                Available for bookings
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-foreground/40 mb-2">
              Navigation
            </span>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-brand transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-2">
            {footerImages.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <Image
                  src={src}
                  alt={`CEE Studio work ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="150px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-accent">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground/40">
          <span>&copy; {new Date().getFullYear()} CEE Studio. All rights reserved.</span>
          <span>Zurich, Switzerland</span>
          <span>Currently accepting new projects</span>
        </div>
      </div>
    </footer>
  );
}
