export interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  subServices: string[];
}

export const services: Service[] = [
  {
    id: 1,
    title: "Fashion & Editorial Photography",
    description:
      "From lookbooks to full editorial spreads, we craft imagery that tells your brand's story with precision and artistry. Every shoot is tailored to your creative direction, with meticulous attention to lighting, styling, and post-production.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop",
    subServices: [
      "Lookbook Photography",
      "Editorial Spreads",
      "Campaign Imagery",
      "E-Commerce Photography",
      "Behind-the-Scenes Content",
    ],
  },
  {
    id: 2,
    title: "Commercial & Product",
    description:
      "We transform products into visual statements. Our studio is equipped for everything from tabletop still life to large-scale set builds, delivering images that elevate your brand across every touchpoint.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop",
    subServices: [
      "Product Photography",
      "Packaging & Label Shoots",
      "Catalogue Photography",
      "Food & Beverage",
      "Lifestyle Product Imagery",
    ],
  },
  {
    id: 3,
    title: "Portrait & Headshots",
    description:
      "Whether it's a corporate headshot or an intimate artist portrait, we bring out the authentic character of every subject. Our approach is relaxed, collaborative, and always results in imagery you're proud to share.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
    subServices: [
      "Corporate Headshots",
      "Artist & Musician Portraits",
      "Personal Branding",
      "Team Photography",
      "Environmental Portraits",
    ],
  },
  {
    id: 4,
    title: "Video Production",
    description:
      "From concept to final cut, we produce brand films, campaign videos, and social content that move audiences. Our in-house team handles direction, cinematography, and post-production under one roof.",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&h=800&fit=crop",
    subServices: [
      "Brand Films",
      "Campaign Videos",
      "Social Media Content",
      "Behind-the-Scenes Films",
      "Event Coverage",
    ],
  },
  {
    id: 5,
    title: "Creative Direction",
    description:
      "Not sure where to start? Our creative direction service guides your project from mood board to final delivery. We help define the visual language, assemble the right team, and ensure every detail aligns with your vision.",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop",
    subServices: [
      "Mood Board & Concept Development",
      "Art Direction",
      "Styling Consultation",
      "Location Scouting",
      "Post-Production Oversight",
    ],
  },
];
